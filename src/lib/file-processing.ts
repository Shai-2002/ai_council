export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf') {
      try {
        // pdf-parse v2 exports PDFParse class
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfModule = require('pdf-parse');
        const PDFParse = pdfModule.PDFParse || pdfModule.default || pdfModule;

        if (typeof PDFParse === 'function') {
          // v2 API: new PDFParse(buffer) then getText()
          const parser = new PDFParse(buffer);
          const result = await parser.getText();
          if (typeof result === 'string' && result.trim()) {
            return result.trim();
          }
          // Try alternative methods
          if (result && typeof result.text === 'string') {
            return result.text.trim();
          }
        }
      } catch (pdfErr) {
        console.error('pdf-parse extraction error:', pdfErr);
      }

      // Fallback: basic PDF text extraction
      return extractPdfTextBasic(buffer);
    }

    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }

    if (
      fileType === 'text/plain' ||
      fileType === 'text/markdown' ||
      fileType === 'text/csv' ||
      fileType === 'application/json'
    ) {
      return buffer.toString('utf-8').trim();
    }

    return '';
  } catch (error) {
    console.error('Text extraction failed:', error);
    return '';
  }
}

/**
 * Basic PDF text extraction without external libraries.
 * Decodes text from PDF stream objects.
 */
function extractPdfTextBasic(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const textParts: string[] = [];

  // Find stream content
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(content)) !== null) {
    const streamContent = streamMatch[1];

    // Find text blocks (BT...ET)
    const btEtRegex = /BT\s([\s\S]*?)ET/g;
    let btMatch;
    while ((btMatch = btEtRegex.exec(streamContent)) !== null) {
      const textBlock = btMatch[1];

      // Extract parenthesized strings
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
