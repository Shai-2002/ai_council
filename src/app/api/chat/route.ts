import { streamText, type UIMessage } from 'ai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { roleModel } from '@/lib/ai/provider';
import { ROLE_CONFIGS } from '@/lib/ai/roles';
import type { RoleSlug } from '@/types';

export async function POST(req: Request) {
  const body = await req.json();

  // V6 transport sends: { trigger, chatId, messages, ...customBody }
  const { messages: rawMessages, roleSlug, workspaceId, chatId, projectId } = body;

  // Validate role
  const roleConfig = ROLE_CONFIGS[roleSlug as RoleSlug];
  if (!roleConfig) {
    return new Response('Invalid role', { status: 400 });
  }

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
      .limit(10);

    if (crossRoleMessages && crossRoleMessages.length > 0) {
      crossRoleContext += '\n\nRECENT CONVERSATIONS WITH OTHER ROLES:\n';
      crossRoleMessages.forEach((m) => {
        crossRoleContext += `• ${m.role_slug.toUpperCase()} said: ${m.content.substring(0, 200)}...\n`;
      });
    }

    const { data: crossRoleArtifacts } = await supabase
      .from('artifacts')
      .select('role_slug, artifact_type, title, created_at')
      .eq('workspace_id', workspaceId)
      .neq('role_slug', roleSlug)
      .order('created_at', { ascending: false })
      .limit(5);

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
    const { data: projectChats } = await supabase
      .from('messages')
      .select('content, role_slug, chat_id, created_at, chats:chat_id(title)')
      .eq('workspace_id', workspaceId)
      .neq('chat_id', chatId)
      .eq('sender', 'assistant')
      .order('created_at', { ascending: false })
      .limit(5);

    if (projectChats && projectChats.length > 0) {
      projectContext = '\n\nCONTEXT FROM OTHER PROJECT CHATS:\n';
      projectChats.forEach((m) => {
        const chatTitle = (m.chats as unknown as { title: string })?.title || 'Unknown chat';
        projectContext += `• Chat "${chatTitle}" (${(m.role_slug || 'unknown').toUpperCase()}): ${m.content.substring(0, 200)}...\n`;
      });
    }
  }

  // ===== LAYER 5: File context =====
  let fileContext = '';
  if (workspaceId) {
    // Build file query: chat files > project files > role files
    let fileQuery = supabase
      .from('files')
      .select('name, extracted_text, file_type')
      .eq('workspace_id', workspaceId)
      .eq('extraction_status', 'done')
      .not('extracted_text', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (chatId) {
      fileQuery = fileQuery.eq('chat_id', chatId);
    } else if (resolvedProjectId) {
      fileQuery = fileQuery.eq('project_id', resolvedProjectId);
    } else if (roleSlug) {
      fileQuery = fileQuery.eq('role_slug', roleSlug);
    }

    const { data: files } = await fileQuery;

    if (files && files.length > 0) {
      fileContext = '\n\nUPLOADED DOCUMENTS:\n';
      files.forEach((f) => {
        const text = f.extracted_text?.substring(0, 2000) || '';
        if (text) {
          fileContext += `• [${f.name}]: ${text}\n\n`;
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
