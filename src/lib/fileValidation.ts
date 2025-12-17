/**
 * File Validation Utility
 * Validates file types by inspecting binary "magic numbers" (signatures)
 * rather than relying solely on file extensions.
 */

export const MAGIC_NUMBERS = {
    PDF: [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
    // Common Office Open XML signatures (DOCX, XLSX, PPTX share this zip structure)
    // PK.. (0x50, 0x4b, 0x03, 0x04)
    DOCX: [0x50, 0x4b, 0x03, 0x04],
    DOC_OLE: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // Legacy DOC (OLE)
};

/**
 * Validates if the buffer starts with the expected magic bytes
 */
export function validateMagicNumber(buffer: Buffer, type: 'pdf' | 'docx' | 'doc'): boolean {
    if (!buffer || buffer.length < 8) return false;

    let expectedSignature: number[] = [];

    switch (type) {
        case 'pdf':
            expectedSignature = MAGIC_NUMBERS.PDF;
            break;
        case 'docx':
            expectedSignature = MAGIC_NUMBERS.DOCX;
            break;
        case 'doc':
            expectedSignature = MAGIC_NUMBERS.DOC_OLE;
            break;
        default:
            return false;
    }

    // Check bytes
    for (let i = 0; i < expectedSignature.length; i++) {
        if (buffer[i] !== expectedSignature[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Detects file type from buffer
 */
export function detectFileType(buffer: Buffer): 'pdf' | 'docx' | 'doc' | 'unknown' {
    if (validateMagicNumber(buffer, 'pdf')) return 'pdf';
    if (validateMagicNumber(buffer, 'docx')) return 'docx';
    if (validateMagicNumber(buffer, 'doc')) return 'doc';
    return 'unknown';
}
