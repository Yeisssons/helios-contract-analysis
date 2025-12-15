import pdf from 'pdf-parse';

/**
 * Extracts text content from a PDF buffer
 * @param buffer - The PDF file as a Buffer
 * @returns The extracted text content
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);

        // data.text contains the extracted text
        const text = data.text;

        if (!text || text.trim().length === 0) {
            throw new Error('No text content found in PDF');
        }

        // Clean up the text (remove excessive whitespace, etc.)
        const cleanedText = text
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n\n')  // Normalize paragraph breaks
            .trim();

        return cleanedText;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Additional metadata from PDF parsing
 */
export interface PdfMetadata {
    pages: number;
    info?: {
        Title?: string;
        Author?: string;
        CreationDate?: string;
    };
}

/**
 * Extracts text and metadata from a PDF buffer
 */
export async function parsePdfWithMetadata(buffer: Buffer): Promise<{ text: string; metadata: PdfMetadata }> {
    try {
        const data = await pdf(buffer);

        const text = data.text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        const metadata: PdfMetadata = {
            pages: data.numpages,
            info: data.info ? {
                Title: data.info.Title,
                Author: data.info.Author,
                CreationDate: data.info.CreationDate,
            } : undefined,
        };

        return { text, metadata };
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export default parsePdf;
