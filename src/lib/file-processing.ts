export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      return data.text.trim();
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

    // Images and other types — no text to extract
    return '';
  } catch (error) {
    console.error('Text extraction failed:', error);
    return '';
  }
}
