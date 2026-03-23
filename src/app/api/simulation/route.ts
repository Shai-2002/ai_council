import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { parseMentions } from '@/lib/meeting/mention-parser';

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, chatId, workspaceId } = await req.json();

  if (!message || !chatId || !workspaceId) {
    return NextResponse.json({ error: 'message, chatId, and workspaceId required' }, { status: 400 });
  }

  const parsed = parseMentions(message);

  // Save user message
  await supabase.from('messages').insert({
    chat_id: chatId,
    workspace_id: workspaceId,
    role_slug: 'user',
    sender: 'user',
    content: message,
  });

  // Create simulation job for Railway worker to pick up
  const { data: job, error } = await supabase.from('simulation_jobs').insert({
    chat_id: chatId,
    workspace_id: workspaceId,
    trigger_message: message,
    tagged_roles: parsed.mentions.map(m => m.roleSlug),
    instructions: parsed.mentions.reduce((acc, m) => {
      acc[m.roleSlug] = m.instruction;
      return acc;
    }, {} as Record<string, string>),
    status: 'pending',
  }).select().single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create simulation: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({
    simulationId: job.id,
    taggedRoles: parsed.mentions.map(m => m.roleSlug),
  });
}
