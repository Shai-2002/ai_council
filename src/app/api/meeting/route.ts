import { streamText } from 'ai';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { resolveModel } from '@/lib/ai/router';
import { ROLE_CONFIGS, type RoleConfig } from '@/lib/ai/roles';
import { parseMentions } from '@/lib/meeting/mention-parser';
import type { RoleSlug } from '@/types';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* Server component context */ }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { message, chatId, workspaceId, fileIds } = body;

  if (!message || !chatId || !workspaceId) {
    return Response.json({ error: 'message, chatId, and workspaceId required' }, { status: 400 });
  }

  // Parse @mentions
  const parsed = parseMentions(message);

  if (parsed.mentions.length === 0) {
    return Response.json({ error: 'No roles mentioned. Use @ to tag a persona (e.g. @Aria).' }, { status: 400 });
  }

  // Save user message
  await supabase.from('messages').insert({
    chat_id: chatId,
    workspace_id: workspaceId,
    role_slug: 'user',
    sender: 'user',
    content: message,
  });

  // NOTE: No simulation_candidate JSON response — simulation detection is handled
  // entirely on the frontend BEFORE sending to this API. This prevents the infinite
  // loop where approveSimulation re-sends the message and it's detected again.

  // ===== File context (scoped, no workspace-wide leak) =====
  let fileContext = '';

  // 1. Explicitly attached files
  if (fileIds && fileIds.length > 0) {
    const { data: attachedFiles } = await supabase
      .from('files')
      .select('name, extracted_text')
      .in('id', fileIds)
      .eq('workspace_id', workspaceId);

    if (attachedFiles?.length) {
      fileContext += attachedFiles
        .filter(f => f.extracted_text)
        .map(f => `--- ${f.name} ---\n${f.extracted_text?.slice(0, 2000)}\n---`)
        .join('\n\n');
    }
  }

  // 2. Files uploaded in this specific chat
  if (chatId) {
    const { data: chatFiles } = await supabase
      .from('files')
      .select('id, name, extracted_text')
      .eq('chat_id', chatId)
      .eq('workspace_id', workspaceId)
      .eq('extraction_status', 'done')
      .not('extracted_text', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3);

    if (chatFiles?.length) {
      const attachedIds = new Set(fileIds || []);
      const newFiles = chatFiles.filter(f => !attachedIds.has(f.id));
      if (newFiles.length > 0) {
        fileContext += '\n\n' + newFiles
          .map(f => `--- ${f.name} ---\n${f.extracted_text?.slice(0, 1500)}\n---`)
          .join('\n\n');
      }
    }
  }

  // 3. Project knowledge pool (if chat is in a project)
  // Look up project_id from the chat
  const { data: chatRecord } = await supabase
    .from('chats')
    .select('project_id')
    .eq('id', chatId)
    .single();

  if (chatRecord?.project_id) {
    const { data: projectFiles } = await supabase
      .from('files')
      .select('name, extracted_text')
      .eq('project_id', chatRecord.project_id)
      .eq('workspace_id', workspaceId)
      .eq('extraction_status', 'done')
      .not('extracted_text', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3);

    if (projectFiles?.length) {
      fileContext += '\n\n' + projectFiles
        .map(f => `--- ${f.name} (project) ---\n${f.extracted_text?.slice(0, 1500)}\n---`)
        .join('\n\n');
    }
  }

  // NOTE: No workspace-wide fallback — prevents file leaking across chats

  if (fileContext) {
    fileContext = '\nUPLOADED DOCUMENTS:\n' + fileContext;
  }

  // Get workspace context
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('company_context')
    .eq('id', workspaceId)
    .single();

  // Get recent meeting messages for context
  const { data: recentMsgs } = await supabase
    .from('messages')
    .select('role_slug, sender, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(20);

  const conversationContext = (recentMsgs || []).reverse().map(m =>
    `${m.sender === 'user' ? 'User' : (m.role_slug || 'Unknown').toUpperCase()}: ${m.content?.slice(0, 500)}`
  ).join('\n');

  // Get cross-role artifacts
  const { data: artifacts } = await supabase
    .from('artifacts')
    .select('role_slug, title')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(5);

  const artifactContext = artifacts?.map(a =>
    `${(a.role_slug || '').toUpperCase()}: ${a.title}`
  ).join('\n') || '';

  // Run research once (shared across all roles)
  let sharedResearch = '';
  try {
    const { needsResearch, runResearch } = await import('@/lib/ai/research');
    if (needsResearch(message)) {
      const research = await runResearch(message, {
        name: 'Executive Team',
        title: 'Advisory Board',
        domain: 'business strategy',
      });
      if (research) {
        sharedResearch = `\n\n=== INTERNET RESEARCH ===\n${research}\n===`;
      }
    }
  } catch {
    // Research pipeline failed — continue without it
  }

  // Generate sequential responses via SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const mention of parsed.mentions) {
        // Resolve role config: check custom roles first, then defaults
        let roleConfig: RoleConfig | null = ROLE_CONFIGS[mention.roleSlug as RoleSlug] || null;
        let roleDefaultModel: string | null = null;

        if (workspaceId) {
          const { data: customRole } = await supabase
            .from('custom_roles')
            .select('personality, name, title, challenge_rules, artifact_type, default_model')
            .eq('workspace_id', workspaceId)
            .eq('slug', mention.roleSlug)
            .eq('is_active', true)
            .single();

          if (customRole) {
            roleDefaultModel = customRole.default_model || null;
            if (customRole.personality) {
              roleConfig = roleConfig
                ? { ...roleConfig, systemPrompt: customRole.personality + (customRole.challenge_rules ? '\n\n' + customRole.challenge_rules : ''), name: customRole.name, title: customRole.title }
                : { slug: mention.roleSlug as RoleSlug, name: customRole.name, title: customRole.title, systemPrompt: customRole.personality, outputSchema: z.any(), artifactType: customRole.artifact_type || 'Analysis' };
            }
          }
        }

        if (!roleConfig) continue;

        const { model, modelSlug } = resolveModel({ roleDefaultModel });

        // Send role header
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'role_start',
          roleSlug: mention.roleSlug,
          roleName: roleConfig.name || mention.roleName,
          modelUsed: modelSlug,
        })}\n\n`));

        // Build system prompt
        const systemPrompt = [
          roleConfig.systemPrompt,
          `\nYou are in a MEETING ROOM with the user and other executives. This is a group discussion. The user tagged you specifically with: "${mention.instruction}"`,
          workspace?.company_context && Object.keys(workspace.company_context).length > 0
            ? `\nCOMPANY CONTEXT:\n${JSON.stringify(workspace.company_context)}`
            : '',
          conversationContext ? `\nMEETING CONVERSATION SO FAR:\n${conversationContext}` : '',
          artifactContext ? `\nRECENT DECISIONS:\n${artifactContext}` : '',
          fileContext ? `\nUPLOADED DOCUMENTS ARE AVAILABLE (listed below). However:
- ONLY reference these documents if the user's message asks about them, mentions them, or is clearly related to their content
- If the user just says "hi" or asks a general question, DO NOT analyze the documents unprompted
- Wait for the user to ask about the files before diving into analysis
- If you DO reference a file, cite it by name
${fileContext}` : '',
          `\nCRITICAL MEETING ROOM RULES:
Other executives have already spoken or will speak after you. DO NOT:
- Repeat analysis that another executive already covered
- Summarize the uploaded documents again if someone else already did
- List the same data points another executive already cited
- Use the same response structure as the person before you

INSTEAD:
- Reference what they said: "Building on what [Name] flagged about X..."
- Add YOUR unique lens that nobody else provides
- If you agree with another executive, say so in ONE sentence and move to YOUR new insight
- Keep your response to 300 words max when others have already covered the basics

When you see another executive's point that you disagree with, you MUST:
1. Name the executive and their specific claim
2. State your disagreement clearly with "I disagree with [name] on [topic]"
3. Provide your counter-argument with evidence
Do NOT be diplomatic about genuine disagreements. The user needs to see where the executive team is NOT aligned.

At the END of your response, if you believe another executive should weigh in on something you said, add a line:
[SUGGEST: @RoleName should respond to my point about X]
This will be shown to the user as a suggestion, not an automatic trigger.`,
          sharedResearch,
        ].filter(Boolean).join('\n\n');

        try {
          const result = streamText({
            model,
            system: systemPrompt,
            messages: [{ role: 'user' as const, content: mention.instruction + (fileContext ? '\n' + fileContext : '') }],
          });

          let fullResponse = '';

          for await (const chunk of result.textStream) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'token',
              roleSlug: mention.roleSlug,
              content: chunk,
            })}\n\n`));
          }

          // Save assistant message with model tracking
          await supabase.from('messages').insert({
            chat_id: chatId,
            workspace_id: workspaceId,
            role_slug: mention.roleSlug,
            sender: 'assistant',
            content: fullResponse,
            model_used: modelSlug,
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'role_complete',
            roleSlug: mention.roleSlug,
          })}\n\n`));

        } catch (error) {
          console.error(`Error generating response for ${mention.roleSlug}:`, error);
          // Send a visible error message so the user knows what happened
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'token',
            roleSlug: mention.roleSlug,
            roleName: roleConfig?.name || mention.roleName,
            content: `[I'm having trouble responding right now. The model may be temporarily unavailable. Try again or switch my model in Settings.]`,
          })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'role_complete',
            roleSlug: mention.roleSlug,
          })}\n\n`));
          // Continue to next role — don't break the loop
          continue;
        }
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
