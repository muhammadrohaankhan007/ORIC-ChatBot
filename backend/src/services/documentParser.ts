import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface DocumentChunk {
  index: number;
  content: string;
}

export class DocumentParser {
  /**
   * Extract plain text from PDF or DOCX buffer
   */
  static async extractText(buffer: Buffer, mimetype: string, originalname: string): Promise<string> {
    const ext = originalname.toLowerCase().split('.').pop();

    if (mimetype === 'application/pdf' || ext === 'pdf') {
      const data = await pdfParse(buffer);
      return data.text || '';
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'docx'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    // Default to utf-8 string if text or unknown
    return buffer.toString('utf-8');
  }

  /**
   * Split document text into overlapping chunks
   */
  static chunkText(text: string, chunkSize = 800, chunkOverlap = 150): DocumentChunk[] {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
    if (!cleanText) return [];

    const chunks: DocumentChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < cleanText.length) {
      const end = Math.min(start + chunkSize, cleanText.length);
      const chunk = cleanText.substring(start, end).trim();

      if (chunk.length > 30) {
        chunks.push({
          index,
          content: chunk
        });
        index++;
      }

      start += chunkSize - chunkOverlap;
    }

    return chunks;
  }
}

