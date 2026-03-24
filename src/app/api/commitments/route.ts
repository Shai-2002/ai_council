import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { hashCommitment } from '@/lib/commitments';

export async function GET(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const projectId = searchParams.get('projectId');

  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  let query = supabase
    .from('commitments')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.or(`scope.eq.workspace,project_id.eq.${projectId}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { workspaceId, type, content, scope, projectId } = await req.json();

  if (!workspaceId || !type || !content) {
    return NextResponse.json({ error: 'workspaceId, type, and content required' }, { status: 400 });
  }

  const hash = hashCommitment(content);

  // Check for duplicate
  const { data: existing } = await supabase
    .from('commitments')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('hash', hash)
    .eq('is_active', true)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'This rule already exists' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('commitments')
    .insert({
      workspace_id: workspaceId,
      type,
      content,
      scope: scope || 'workspace',
      project_id: projectId || null,
      hash,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const commitmentId = searchParams.get('id');

  if (!commitmentId) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabase
    .from('commitments')
    .update({ is_active: false })
    .eq('id', commitmentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
