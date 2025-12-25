/**
 * File Validation Utility
 * Validates file types by inspecting binary "magic numbers" (signatures)
 * rather than relying solely on file extensions.
 */

export const MAGIC_NUMBERS = {
    PDF: [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
    // Common Office Open XML signatures (DOCX, XLSX, PPTX share this zip structure)
    // PK.. (multiple variants exist)
    DOCX_VARIANTS: [
        [0x50, 0x4b, 0x03, 0x04], // PK\x03\x04 - Standard local file header
        [0x50, 0x4b, 0x05, 0x06], // PK\x05\x06 - Empty archive
        [0x50, 0x4b, 0x07, 0x08], // PK\x07\x08 - Spanned archive
    ],
    DOC_OLE: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // Legacy DOC (OLE)
};

/**
 * Validates if the buffer starts with the expected magic bytes
 */
export function validateMagicNumber(buffer: Buffer, type: 'pdf' | 'docx' | 'doc'): boolean {
    if (!buffer || buffer.length < 4) return false;

    if (type === 'pdf') {
        const expectedSignature = MAGIC_NUMBERS.PDF;
        for (let i = 0; i < expectedSignature.length; i++) {
            if (buffer[i] !== expectedSignature[i]) {
                return false;
            }
        }
        return true;
    }

    if (type === 'docx') {
        // Check against any of the valid ZIP signatures
        for (const signature of MAGIC_NUMBERS.DOCX_VARIANTS) {
            let matches = true;
            for (let i = 0; i < signature.length; i++) {
                if (buffer[i] !== signature[i]) {
                    matches = false;
                    break;
                }
            }
            if (matches) return true;
        }
        // Also check for just "PK" (0x50, 0x4b) as minimum valid ZIP indicator
        // This is more lenient but catches edge cases
        if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
            return true;
        }
        return false;
    }

    if (type === 'doc') {
        const expectedSignature = MAGIC_NUMBERS.DOC_OLE;
        for (let i = 0; i < expectedSignature.length; i++) {
            if (buffer[i] !== expectedSignature[i]) {
                return false;
            }
        }
        return true;
    }

    return false;
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

