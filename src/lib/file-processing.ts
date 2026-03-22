import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text.trim();
    }

    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
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
