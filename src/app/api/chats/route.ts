import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function GET(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const projectId = searchParams.get('projectId');
  const roleSlug = searchParams.get('roleSlug');
  const chatType = searchParams.get('type');

  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  let query = supabase
    .from('chats')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);
  if (roleSlug) query = query.eq('role_slug', roleSlug);
  if (chatType) query = query.eq('chat_type', chatType);

  const { data: chats, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get last message preview for each chat
  const enriched = await Promise.all(
    (chats || []).map(async (chat) => {
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, sender, created_at')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return {
        ...chat,
        last_message: lastMsg
          ? { content: lastMsg.content.substring(0, 100), sender: lastMsg.sender, created_at: lastMsg.created_at }
          : null,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, projectId, roleSlug, chatType, workspaceId } = await req.json();
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  const { data, error } = await supabase
    .from('chats')
    .insert({
      workspace_id: workspaceId,
      project_id: projectId || null,
      title: title || 'New chat',
      role_slug: roleSlug || null,
      chat_type: chatType || 'single',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
