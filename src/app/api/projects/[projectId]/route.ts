import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [projectRes, filesRes, chatsRes] = await Promise.all([
    supabase.from('projects').select('*').eq('id', projectId).single(),
    supabase.from('files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    supabase.from('chats').select('*').eq('project_id', projectId).order('updated_at', { ascending: false }),
  ]);

  if (projectRes.error) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  return NextResponse.json({
    ...projectRes.data,
    files: filesRes.data || [],
    chats: chatsRes.data || [],
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await req.json();
  const allowed: Record<string, unknown> = {};
  if (updates.name !== undefined) allowed.name = updates.name;
  if (updates.description !== undefined) allowed.description = updates.description;

  const { data, error } = await supabase
    .from('projects')
    .update(allowed)
    .eq('id', projectId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
