import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  try {
    // Plain text files — read directly (fast, free)
    if (
      fileType === 'text/plain' ||
      fileType === 'text/markdown' ||
      fileType === 'text/csv' ||
      fileType === 'application/json'
    ) {
      return buffer.toString('utf-8').trim().slice(0, 50000);
    }

    // DOCX — try mammoth first (fast, free), fallback to Claude
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        if (result.value && result.value.trim().length > 50) {
          return result.value.trim().slice(0, 50000);
        }
      } catch (mammothErr) {
        console.log('mammoth failed, falling back to Claude:', mammothErr);
      }

      // Fallback: use Claude for DOCX
      return await extractWithClaude(buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

    // PDF — use Claude (pdf-parse is broken on Vercel serverless)
    if (fileType === 'application/pdf') {
      return await extractWithClaude(buffer, 'application/pdf');
    }

    return '';
  } catch (error) {
    console.error('Text extraction failed:', error);
    return '';
  }
}

/**
 * Extract text from a document using Claude via OpenRouter.
 * Works reliably for PDFs (including scanned), DOCX, and other document types.
 */
async function extractWithClaude(buffer: Buffer, mediaType: string): Promise<string> {
  try {
    const base64 = buffer.toString('base64');

    const result = await generateText({
      model: openrouter('anthropic/claude-sonnet-4.6'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: base64,
              mediaType: mediaType,
            },
            {
              type: 'text',
              text: 'Extract ALL text content from this document. Return the complete text exactly as it appears, preserving structure (headings, paragraphs, lists, tables). Do not summarize or skip anything. Do not add commentary. Just output the raw text content.',
            },
          ],
        },
      ],
      maxOutputTokens: 16000,
    });

    return result.text.trim().slice(0, 50000);
  } catch (error) {
    console.error('Claude extraction failed:', error);

    // For PDFs: last-resort basic text extraction via regex
    if (mediaType === 'application/pdf') {
      return extractPdfTextBasic(buffer);
    }

    return `[Could not extract text from document]`;
  }
}

/**
 * Basic PDF text extraction without external libraries.
 * Decodes text from PDF stream objects. Works for simple text-based PDFs only.
 */
function extractPdfTextBasic(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const textParts: string[] = [];

  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(content)) !== null) {
    const streamContent = streamMatch[1];

    const btEtRegex = /BT\s([\s\S]*?)ET/g;
    let btMatch;
    while ((btMatch = btEtRegex.exec(streamContent)) !== null) {
      const textBlock = btMatch[1];

      const parenRegex = /\(([^)]*)\)/g;
      let parenMatch;
      while ((parenMatch = parenRegex.exec(textBlock)) !== null) {
        const decoded = parenMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        if (decoded.trim()) {
          textParts.push(decoded);
        }
      }
    }
  }

  return textParts.join(' ').replace(/\s+/g, ' ').trim();
}
