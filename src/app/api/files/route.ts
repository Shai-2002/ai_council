import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function GET(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const projectId = searchParams.get('projectId');
  const chatId = searchParams.get('chatId');
  const roleSlug = searchParams.get('roleSlug');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  }

  let query = supabase
    .from('files')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);
  if (chatId) query = query.eq('chat_id', chatId);
  if (roleSlug) query = query.eq('role_slug', roleSlug);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add signed download URLs
  const filesWithUrls = await Promise.all(
    (data || []).map(async (file) => {
      const { data: urlData } = await supabase.storage
        .from('workspace-files')
        .createSignedUrl(file.storage_path, 3600);
      return { ...file, download_url: urlData?.signedUrl || null };
    })
  );

  return NextResponse.json(filesWithUrls);
}
