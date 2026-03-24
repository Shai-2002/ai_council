import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { resolveModel } from '@/lib/ai/router';

/** GET: fetch project memory summary + health stats */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, memory_summary, total_tokens_used, total_storage_bytes')
    .eq('id', projectId)
    .single();

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  // Calculate storage from files
  const { data: files } = await supabase
    .from('files')
    .select('size_bytes')
    .eq('project_id', projectId);

  const storageBytes = files?.reduce((sum, f) => sum + (f.size_bytes || 0), 0) || 0;

  // Count messages for rough token estimate (avg 4 chars per token)
  const { count: messageCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('chat_id', (await supabase.from('chats').select('id').eq('project_id', projectId)).data?.map(c => c.id) || []);

  return NextResponse.json({
    memorySummary: project.memory_summary,
    totalTokensUsed: project.total_tokens_used,
    totalStorageBytes: storageBytes,
    messageCount: messageCount || 0,
  });
}

/** POST: regenerate project memory summary */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch key points from all chats in this project
  const { data: chats } = await supabase
    .from('chats')
    .select('id, title, key_points')
    .eq('project_id', projectId);

  // Fetch recent messages
  const chatIds = chats?.map(c => c.id) || [];
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('content, role_slug, sender')
    .in('chat_id', chatIds)
    .eq('sender', 'assistant')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!recentMessages?.length) {
    return NextResponse.json({ memorySummary: null, message: 'No messages to summarize' });
  }

  // Use a cheap/fast model to summarize
  const { model } = resolveModel({ modelOverride: 'google/gemini-2.5-flash' });

  const messagesText = recentMessages.map(m =>
    `${(m.role_slug || 'assistant').toUpperCase()}: ${m.content.substring(0, 300)}`
  ).join('\n\n');

  const result = await generateText({
    model,
    system: 'You are a concise summarizer. Extract the key decisions, action items, and important context from these project conversations. Output a summary of max 500 tokens. Use bullet points.',
    messages: [{ role: 'user', content: `Summarize these project conversations:\n\n${messagesText}` }],
    maxOutputTokens: 600,
  });

  const summary = result.text;

  // Save to project
  await supabase
    .from('projects')
    .update({ memory_summary: summary })
    .eq('id', projectId);

  return NextResponse.json({ memorySummary: summary });
}
