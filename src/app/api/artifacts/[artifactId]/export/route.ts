import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { artifactToMarkdown, artifactToHtml } from '@/lib/export';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ artifactId: string }> }
) {
  const { artifactId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: artifact, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', artifactId)
    .single();

  if (error || !artifact) {
    return new Response('Artifact not found', { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'markdown';

  const exportInput = {
    artifact_type: artifact.artifact_type,
    title: artifact.title,
    structured_data: artifact.structured_data as Record<string, unknown>,
  };

  if (format === 'html') {
    const html = artifactToHtml(exportInput);
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${artifact.title.replace(/[^a-zA-Z0-9 ]/g, '')}.html"`,
      },
    });
  }

  const markdown = artifactToMarkdown(exportInput);
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${artifact.title.replace(/[^a-zA-Z0-9 ]/g, '')}.md"`,
    },
  });
}
