import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { fileName, fileType, workspaceId, chatId, projectId, roleSlug } = await req.json();

  if (!fileName || !workspaceId) {
    return NextResponse.json({ error: 'fileName and workspaceId required' }, { status: 400 });
  }

  const storagePath = `${workspaceId}/${Date.now()}_${fileName}`;

  // Create a signed upload URL (client uploads directly to Storage)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('workspace-files')
    .createSignedUploadUrl(storagePath);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Insert file record with 'pending' extraction status
  const { data: fileRecord, error: fileError } = await supabase
    .from('files')
    .insert({
      workspace_id: workspaceId,
      chat_id: chatId || null,
      project_id: projectId || null,
      role_slug: roleSlug || null,
      name: fileName,
      file_type: fileType || 'application/octet-stream',
      size_bytes: 0,
      storage_path: storagePath,
      extraction_status: 'pending',
      source: 'upload',
    })
    .select()
    .single();

  if (fileError) {
    return NextResponse.json({ error: fileError.message }, { status: 500 });
  }

  return NextResponse.json({
    fileId: fileRecord.id,
    uploadUrl: uploadData.signedUrl,
    token: uploadData.token,
    storagePath,
  });
}
