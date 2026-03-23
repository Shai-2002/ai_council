import { streamText, type UIMessage } from 'ai';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { roleModel } from '@/lib/ai/provider';
import { ROLE_CONFIGS, type RoleConfig } from '@/lib/ai/roles';
import type { RoleSlug } from '@/types';

export async function POST(req: Request) {
  const body = await req.json();

  // V6 transport sends: { trigger, chatId, messages, ...customBody }
  const { messages: rawMessages, roleSlug, workspaceId, chatId, projectId } = body;

  // We'll resolve roleConfig after creating the supabase client (need it for custom role lookup)
  let roleConfig: RoleConfig | null = ROLE_CONFIGS[roleSlug as RoleSlug] || null;

  // Create server supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component context
          }
        },
      },
    }
  );

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check for custom role override from database
  if (workspaceId) {
    const { data: customRole } = await supabase
      .from('custom_roles')
      .select('personality, name, title, description, challenge_rules, artifact_type')
      .eq('workspace_id', workspaceId)
      .eq('slug', roleSlug)
      .eq('is_active', true)
      .single();

    if (customRole && customRole.personality) {
      if (roleConfig) {
        // Override built-in role with custom personality
        roleConfig = {
          ...roleConfig,
          systemPrompt: customRole.personality + (customRole.challenge_rules ? '\n\n' + customRole.challenge_rules : ''),
          name: customRole.name,
          title: customRole.title,
          artifactType: customRole.artifact_type || roleConfig.artifactType,
        };
      } else {
        // Fully custom role (not one of the 5 defaults)
        roleConfig = {
          slug: roleSlug as RoleSlug,
          name: customRole.name,
          title: customRole.title,
          systemPrompt: customRole.personality + (customRole.challenge_rules ? '\n\n' + customRole.challenge_rules : ''),
          outputSchema: z.any(),
          artifactType: customRole.artifact_type || 'Analysis',
        };
      }
    }
  }

  if (!roleConfig) {
    return new Response('Invalid role', { status: 400 });
  }

  // Convert UIMessage[] to the format streamText expects
  const messages = (rawMessages as UIMessage[]).map((msg) => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('') || '',
  }));

  // ===== LAYER 2: Workspace context =====
  let companyContext = '';
  if (workspaceId) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('company_context')
      .eq('id', workspaceId)
      .single();

    if (workspace?.company_context && Object.keys(workspace.company_context).length > 0) {
      companyContext = `\n\nCOMPANY CONTEXT:\n${JSON.stringify(workspace.company_context, null, 2)}`;
    }
  }

  // ===== LAYER 3: Cross-role memory (messages + artifacts) =====
  let crossRoleContext = '';
  if (workspaceId) {
    const { data: crossRoleMessages } = await supabase
      .from('messages')
      .select('role_slug, sender, content, created_at')
      .eq('workspace_id', workspaceId)
      .neq('role_slug', roleSlug)
      .eq('sender', 'assistant')
      .order('created_at', { ascending: false })
      .limit(6);

    if (crossRoleMessages && crossRoleMessages.length > 0) {
      crossRoleContext += '\n\nRECENT CONVERSATIONS WITH OTHER ROLES:\n';
      crossRoleMessages.forEach((m) => {
        crossRoleContext += `• ${m.role_slug.toUpperCase()} said: ${m.content.substring(0, 150)}...\n`;
      });
    }

    const { data: crossRoleArtifacts } = await supabase
      .from('artifacts')
      .select('role_slug, artifact_type, title, created_at')
      .eq('workspace_id', workspaceId)
      .neq('role_slug', roleSlug)
      .order('created_at', { ascending: false })
      .limit(3);

    if (crossRoleArtifacts && crossRoleArtifacts.length > 0) {
      crossRoleContext += '\n\nRECENT ARTIFACTS FROM OTHER ROLES:\n';
      crossRoleArtifacts.forEach((a) => {
        crossRoleContext += `• ${a.role_slug.toUpperCase()} created ${a.artifact_type}: "${a.title}"\n`;
      });
    }
  }

  // ===== LAYER 4: Project cross-chat context =====
  let projectContext = '';
  const resolvedProjectId = projectId || null;
  if (resolvedProjectId && chatId) {
    // First get chat IDs within this project (excluding current chat)
    const { data: projectChatIds } = await supabase
      .from('chats')
      .select('id')
      .eq('project_id', resolvedProjectId)
      .neq('id', chatId);

    if (projectChatIds && projectChatIds.length > 0) {
      const chatIds = projectChatIds.map(c => c.id);
      const { data: projectChats } = await supabase
        .from('messages')
        .select('content, role_slug, chat_id, created_at')
        .in('chat_id', chatIds)
        .eq('sender', 'assistant')
        .order('created_at', { ascending: false })
        .limit(3);

      if (projectChats && projectChats.length > 0) {
        projectContext = '\n\nCONTEXT FROM OTHER PROJECT CHATS:\n';
        projectChats.forEach((m) => {
          projectContext += `• ${(m.role_slug || 'unknown').toUpperCase()}: ${m.content.substring(0, 150)}...\n`;
        });
      }
    }
  }

  // ===== LAYER 5: File context (scoped — no workspace-wide leak) =====
  let fileContext = '';
  if (workspaceId) {
    const allFiles: Array<{ name: string; extracted_text: string | null }> = [];

    // Scope 1: Files in this specific chat
    if (chatId) {
      const { data } = await supabase
        .from('files')
        .select('name, extracted_text')
        .eq('chat_id', chatId)
        .eq('extraction_status', 'done')
        .not('extracted_text', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) allFiles.push(...data);
    }

    // Scope 2: Files in same project (additive, not fallback)
    if (resolvedProjectId) {
      const { data } = await supabase
        .from('files')
        .select('name, extracted_text')
        .eq('project_id', resolvedProjectId)
        .eq('extraction_status', 'done')
        .not('extracted_text', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) allFiles.push(...data);
    }

    // Scope 3: Files tagged with this role's independent pool (only for single chats)
    if (roleSlug && !resolvedProjectId) {
      const { data } = await supabase
        .from('files')
        .select('name, extracted_text')
        .eq('workspace_id', workspaceId)
        .eq('role_slug', roleSlug)
        .is('chat_id', null)
        .is('project_id', null)
        .eq('extraction_status', 'done')
        .not('extracted_text', 'is', null)
        .order('created_at', { ascending: false })
        .limit(2);
      if (data) allFiles.push(...data);
    }

    // NO Scope 4 workspace-wide fallback — prevents cross-chat file leaking

    // Deduplicate by name
    const seen = new Set<string>();
    const uniqueFiles = allFiles.filter(f => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });

    if (uniqueFiles.length > 0) {
      fileContext = '\n\nUPLOADED DOCUMENTS (the user has uploaded these — reference them when relevant):\n';
      uniqueFiles.forEach((f) => {
        const text = f.extracted_text?.substring(0, 1500) || '';
        if (text) {
          fileContext += `--- ${f.name} ---\n${text}\n---\n\n`;
        }
      });
    }
  }

  // ===== ASSEMBLE SYSTEM PROMPT (6 layers) =====
  const systemPrompt = `${roleConfig.systemPrompt}${companyContext}${crossRoleContext}${projectContext}${fileContext}`;

  // Stream the response
  const result = streamText({
    model: roleModel,
    system: systemPrompt,
    messages,
    onFinish: async ({ text }) => {
      if (!workspaceId) return;

      // Save the user's last message and assistant response with chat_id
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage?.role === 'user') {
        await supabase.from('messages').insert({
          workspace_id: workspaceId,
          role_slug: roleSlug,
          sender: 'user',
          content: lastUserMessage.content,
          chat_id: chatId || null,
        });
      }

      await supabase.from('messages').insert({
        workspace_id: workspaceId,
        role_slug: roleSlug,
        sender: 'assistant',
        content: text,
        chat_id: chatId || null,
      });

      // Try to detect and save artifact from JSON in response
      const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          const validation = roleConfig.outputSchema.safeParse(parsed);

          if (validation.success) {
            const title =
              parsed.decision ||
              parsed.objective ||
              parsed.summary ||
              parsed.problem ||
              parsed.positioning ||
              `${roleConfig.artifactType} — ${new Date().toLocaleDateString()}`;

            await supabase.from('artifacts').insert({
              workspace_id: workspaceId,
              role_slug: roleSlug,
              artifact_type: roleConfig.artifactType,
              title: typeof title === 'string' ? title.slice(0, 200) : String(title).slice(0, 200),
              structured_data: validation.data,
              status: 'draft',
              chat_id: chatId || null,
              project_id: resolvedProjectId,
            });
          }
        } catch {
          // JSON parsing failed — not an artifact response, ignore
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
