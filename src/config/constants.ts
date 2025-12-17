/**
 * Application Configuration Constants
 * Production-ready with environment variable overrides where applicable
 */
export const APP_CONFIG = {
    UPLOAD: {
        // Maximum file size for uploads (200MB for local/development)
        // In production, consider using chunked uploads for files > 50MB
        MAX_FILE_SIZE: 200 * 1024 * 1024, // 200MB

        // Threshold for switching AI models (files larger than this use faster model)
        LARGE_FILE_THRESHOLD: 50 * 1024 * 1024, // 50MB

        ALLOWED_FILE_TYPES: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
        },
        ALLOWED_EXTENSIONS: ['pdf', 'docx', 'doc'],
    },
    AI: {
        // High intelligence model for smaller files (better quality)
        MODEL_STANDARD: process.env.GEMINI_MODEL_STANDARD || 'gemini-2.5-flash',
        // High speed model for larger files (prevents timeouts)
        MODEL_FAST: process.env.GEMINI_MODEL_FAST || 'gemini-2.5-flash-lite',
    },
    DEFAULTS: {
        SECTOR: 'legal',
    },
};

/**
 * Get the appropriate AI model based on file size
 * @param fileSize File size in bytes
 * @returns Model name string
 */
export function getAdaptiveModel(fileSize: number): string {
    const isLargeFile = fileSize > APP_CONFIG.UPLOAD.LARGE_FILE_THRESHOLD;
    const model = isLargeFile ? APP_CONFIG.AI.MODEL_FAST : APP_CONFIG.AI.MODEL_STANDARD;

    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    console.log(`⚖️ Adaptive Model Selection: ${fileSizeMB}MB → ${model} (${isLargeFile ? 'FAST' : 'STANDARD'})`);

    return model;
}

