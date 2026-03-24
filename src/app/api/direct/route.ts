import { streamText, type UIMessage } from 'ai';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { resolveModel, getModelDisplayName } from '@/lib/ai/router';

/** Model aliases for @mention routing in direct mode */
const MODEL_ALIASES: Record<string, string> = {
  claude: 'anthropic/claude-sonnet-4-20250514',
  anthropic: 'anthropic/claude-sonnet-4-20250514',
  'claude-opus': 'anthropic/claude-opus-4-20250514',
  'claude-haiku': 'anthropic/claude-haiku-4-20250414',
  grok: 'x-ai/grok-3',
  xai: 'x-ai/grok-3',
  gpt: 'openai/gpt-4o',
  chatgpt: 'openai/gpt-4o',
  openai: 'openai/gpt-4o',
  'gpt-mini': 'openai/gpt-4o-mini',
  gemini: 'google/gemini-2.5-flash',
  google: 'google/gemini-2.5-flash',
  'gemini-pro': 'google/gemini-2.5-pro',
  qwen: 'qwen/qwen3-32b',
  perplexity: 'perplexity/sonar',
  search: 'perplexity/sonar',
  llama: 'meta-llama/llama-4-maverick',
  deepseek: 'deepseek/deepseek-r1',
  mistral: 'mistralai/mistral-large-2411',
};

function parseModelMentions(text: string): { modelSlug: string; instruction: string }[] {
  const mentionRegex = /@(\S+)/gi;
  const mentions: { modelSlug: string; index: number; length: number }[] = [];

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const alias = match[1].toLowerCase();
    const modelSlug = MODEL_ALIASES[alias];
    if (modelSlug) {
      mentions.push({ modelSlug, index: match.index, length: match[0].length });
    }
  }

  if (mentions.length === 0) return [];

  // Extract per-model instructions
  const result: { modelSlug: string; instruction: string }[] = [];
  for (let i = 0; i < mentions.length; i++) {
    const start = mentions[i].index + mentions[i].length;
    const end = mentions[i + 1]?.index ?? text.length;
    const instruction = text.slice(start, end).trim();
    result.push({ modelSlug: mentions[i].modelSlug, instruction: instruction || text });
  }

  return result;
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { messages: rawMessages, workspaceId, chatId, projectId, modelOverride } = body;

  if (!workspaceId) return new Response('workspaceId required', { status: 400 });

  const messages = (rawMessages as UIMessage[]).map((msg) => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('') || '',
  }));

  const lastUserMessage = messages[messages.length - 1];
  if (!lastUserMessage || lastUserMessage.role !== 'user') {
    return new Response('No user message', { status: 400 });
  }

  // Check for @model mentions for chaining
  const modelMentions = parseModelMentions(lastUserMessage.content);

  // Build minimal system prompt (no persona personality, no challenge rules)
  let fileContext = '';
  if (chatId) {
    const { data: chatFiles } = await supabase
      .from('files')
      .select('name, extracted_text')
      .eq('chat_id', chatId)
      .eq('extraction_status', 'done')
      .not('extracted_text', 'is', null)
      .limit(3);
    if (chatFiles?.length) {
      fileContext = '\n\nUPLOADED FILES:\n' + chatFiles.map(f =>
        `--- ${f.name} ---\n${f.extracted_text?.substring(0, 1500)}\n---`
      ).join('\n\n');
    }
  }

  let projectContext = '';
  if (projectId) {
    const { data: projectFiles } = await supabase
      .from('files')
      .select('name, extracted_text')
      .eq('project_id', projectId)
      .eq('extraction_status', 'done')
      .not('extracted_text', 'is', null)
      .limit(2);
    if (projectFiles?.length) {
      projectContext = '\n\nPROJECT FILES:\n' + projectFiles.map(f =>
        `--- ${f.name} ---\n${f.extracted_text?.substring(0, 1500)}\n---`
      ).join('\n\n');
    }
  }

  const systemPrompt = `You are a helpful AI assistant on SmartChatz. Be direct, concise, and helpful.${fileContext}${projectContext}`;

  // If chaining (@grok ... then @claude ...), process sequentially via SSE
  if (modelMentions.length > 1) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let previousResponse = '';

        for (const mention of modelMentions) {
          const { model, modelSlug } = resolveModel({ modelOverride: mention.modelSlug });
          const displayName = getModelDisplayName(modelSlug);

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'model_start', modelSlug, displayName,
          })}\n\n`));

          const instruction = previousResponse
            ? `${mention.instruction}\n\nPrevious model's response:\n${previousResponse}`
            : mention.instruction;

          const result = streamText({
            model,
            system: systemPrompt,
            messages: [...messages.slice(0, -1), { role: 'user' as const, content: instruction }],
          });

          let fullResponse = '';
          for await (const chunk of result.textStream) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'token', modelSlug, content: chunk,
            })}\n\n`));
          }

          previousResponse = fullResponse;

          await supabase.from('messages').insert({
            workspace_id: workspaceId,
            sender: 'assistant',
            content: fullResponse,
            chat_id: chatId || null,
            model_used: modelSlug,
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'model_complete', modelSlug,
          })}\n\n`));
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      }
    });

    // Save user message
    await supabase.from('messages').insert({
      workspace_id: workspaceId,
      sender: 'user',
      content: lastUserMessage.content,
      chat_id: chatId || null,
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  }

  // Single model (no chaining)
  const targetModel = modelMentions[0]?.modelSlug || modelOverride || null;
  const { model, modelSlug } = resolveModel({ modelOverride: targetModel });

  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    onFinish: async ({ text }) => {
      const userContent = lastUserMessage.content;
      await supabase.from('messages').insert({
        workspace_id: workspaceId,
        sender: 'user',
        content: userContent,
        chat_id: chatId || null,
      });
      await supabase.from('messages').insert({
        workspace_id: workspaceId,
        sender: 'assistant',
        content: text,
        chat_id: chatId || null,
        model_used: modelSlug,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
