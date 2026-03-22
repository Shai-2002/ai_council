import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { extractText } from '@/lib/file-processing';

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const workspaceId = formData.get('workspaceId') as string;
  const projectId = (formData.get('projectId') as string) || null;
  const chatId = (formData.get('chatId') as string) || null;
  const roleSlug = (formData.get('roleSlug') as string) || null;

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  }

  const files = formData.getAll('file') as File[];
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const results = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = projectId || roleSlug || 'general';
    const storagePath = `${workspaceId}/${folder}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('workspace-files')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      results.push({ name: file.name, error: uploadError.message });
      continue;
    }

    // Insert file record
    const { data: fileRecord, error: insertError } = await supabase
      .from('files')
      .insert({
        workspace_id: workspaceId,
        project_id: projectId,
        chat_id: chatId,
        role_slug: roleSlug,
        name: file.name,
        file_type: file.type,
        size_bytes: file.size,
        storage_path: storagePath,
        extraction_status: 'processing',
        source: 'upload',
      })
      .select()
      .single();

    if (insertError) {
      results.push({ name: file.name, error: insertError.message });
      continue;
    }

    // Extract text inline
    let extractedText = '';
    try {
      extractedText = await extractText(buffer, file.type);
    } catch {
      // extraction failed silently
    }

    await supabase
      .from('files')
      .update({
        extracted_text: extractedText || null,
        extraction_status: extractedText ? 'done' : 'failed',
      })
      .eq('id', fileRecord.id);

    // Get signed URL
    const { data: urlData } = await supabase.storage
      .from('workspace-files')
      .createSignedUrl(storagePath, 3600);

    results.push({
      ...fileRecord,
      extracted_text: extractedText || null,
      extraction_status: extractedText ? 'done' : 'failed',
      download_url: urlData?.signedUrl || null,
    });
  }

  return NextResponse.json(results);
}
