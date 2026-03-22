import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (error || !file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const { data: urlData } = await supabase.storage
    .from('workspace-files')
    .createSignedUrl(file.storage_path, 3600);

  return NextResponse.json({
    ...file,
    download_url: urlData?.signedUrl || null,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('storage_path')
    .eq('id', fileId)
    .single();

  if (fetchError || !file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Delete from storage
  await supabase.storage.from('workspace-files').remove([file.storage_path]);

  // Delete from database
  const { error: deleteError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
