import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function GET(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const chatId = searchParams.get('chatId');
  const projectId = searchParams.get('projectId');

  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  let query = supabase
    .from('files')
    .select('id, name, file_type, size_bytes, extraction_status, created_at, chat_id, project_id')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (chatId) query = query.eq('chat_id', chatId);
  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ files: data || [] });
}
