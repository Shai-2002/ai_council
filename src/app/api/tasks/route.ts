import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { extractTasks } from '@/lib/task-extraction';

export async function GET(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const projectId = searchParams.get('projectId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  }

  let query = supabase
    .from('artifacts')
    .select('id, role_slug, artifact_type, structured_data, title, created_at')
    .eq('workspace_id', workspaceId)
    .not('structured_data', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data: artifacts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const allTasks = (artifacts || []).flatMap(artifact =>
    extractTasks({
      id: artifact.id,
      role_slug: artifact.role_slug,
      artifact_type: artifact.artifact_type,
      title: artifact.title,
      structured_data: artifact.structured_data as Record<string, unknown>,
    })
  );

  return NextResponse.json({ tasks: allTasks });
}
