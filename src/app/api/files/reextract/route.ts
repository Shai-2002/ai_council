import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { extractText } from '@/lib/file-processing';

export async function POST() {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id);

  if (!workspaces?.length) return NextResponse.json({ reextracted: 0 });

  const wsIds = workspaces.map(w => w.id);

  const { data: files } = await supabase
    .from('files')
    .select('id, name, storage_path, file_type')
    .in('workspace_id', wsIds)
    .or('extraction_status.is.null,extraction_status.eq.pending,extraction_status.eq.failed,extraction_status.eq.processing')
    .not('storage_path', 'is', null)
    .limit(20);

  if (!files?.length) return NextResponse.json({ reextracted: 0 });

  let count = 0;
  for (const file of files) {
    try {
      const { data: blob } = await supabase.storage
        .from('workspace-files')
        .download(file.storage_path);

      if (!blob) continue;

      const buffer = Buffer.from(await blob.arrayBuffer());
      const text = await extractText(buffer, file.file_type || 'application/octet-stream');

      if (text && text.length > 50) {
        await supabase.from('files').update({
          extracted_text: text.slice(0, 50000),
          extraction_status: 'done',
        }).eq('id', file.id);
        count++;
      } else {
        await supabase.from('files').update({
          extraction_status: 'failed',
        }).eq('id', file.id);
      }
    } catch (e) {
      console.error(`Re-extraction failed for ${file.name}:`, e);
    }
  }

  return NextResponse.json({ reextracted: count, total: files.length });
}
