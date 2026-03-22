import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function GET(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get file and chat counts for each project
  const enriched = await Promise.all(
    (projects || []).map(async (p) => {
      const [{ count: fileCount }, { count: chatCount }] = await Promise.all([
        supabase.from('files').select('*', { count: 'exact', head: true }).eq('project_id', p.id),
        supabase.from('chats').select('*', { count: 'exact', head: true }).eq('project_id', p.id),
      ]);
      return { ...p, file_count: fileCount || 0, chat_count: chatCount || 0 };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, workspaceId } = await req.json();
  if (!workspaceId || !name) {
    return NextResponse.json({ error: 'workspaceId and name required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ workspace_id: workspaceId, name, description: description || '' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
