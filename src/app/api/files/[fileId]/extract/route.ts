import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { extractText } from '@/lib/file-processing';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: file } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  try {
    await supabase.from('files').update({ extraction_status: 'processing' }).eq('id', fileId);

    const { data: blob } = await supabase.storage
      .from('workspace-files')
      .download(file.storage_path);

    if (!blob) throw new Error('Failed to download file');

    const buffer = Buffer.from(await blob.arrayBuffer());
    const text = await extractText(buffer, file.file_type || 'application/octet-stream');

    const status = text && text.length > 50 ? 'done' : 'failed';
    await supabase.from('files').update({
      extracted_text: text && text.length > 50 ? text.slice(0, 50000) : null,
      extraction_status: status,
    }).eq('id', fileId);

    return NextResponse.json({ status, textLength: text?.length || 0 });
  } catch (error) {
    await supabase.from('files').update({ extraction_status: 'failed' }).eq('id', fileId);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
