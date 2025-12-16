import { NextRequest, NextResponse } from 'next/server';
import { parsePdf } from '@/lib/pdfParser';
import { analyzeContractText } from '@/lib/gemini';
import { extractContractDataWithAI } from '@/lib/ai-mock';
import { ProcessContractResponse } from '@/types/contract';
import { APP_CONFIG, getAdaptiveModel } from '@/config/constants';
import { ContractMetadataSchema } from '@/lib/schemas';

// Flag to use real AI or mock (set via environment variable)
const USE_REAL_AI = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;

import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

// Strict rate limiter for heavy processing: 5 requests per minute
const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest): Promise<NextResponse<ProcessContractResponse>> {
    try {
        const ip = headers().get('x-forwarded-for') || 'anonymous';

        if (!limiter.check(5, ip)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please wait before uploading more files.' },
                { status: 429 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        // Metadata Parsing & Validation
        const rawMetadata = {
            customQuery: formData.get('customQuery') as string || undefined,
            dataPoints: formData.get('dataPoints') ? JSON.parse(formData.get('dataPoints') as string) : [],
            sector: formData.get('sector') as string || undefined
        };

        const validation = ContractMetadataSchema.safeParse(rawMetadata);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request parameters', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { customQuery, dataPoints, sector } = validation.data;
        const currentSector = sector || APP_CONFIG.DEFAULTS.SECTOR;

        // 1. Input Validation
        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const isValidExtension = APP_CONFIG.UPLOAD.ALLOWED_EXTENSIONS.includes(fileExtension || '');
        const isValidMime = Object.keys(APP_CONFIG.UPLOAD.ALLOWED_FILE_TYPES).includes(file.type);

        if (!isValidMime && !isValidExtension) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Please upload a PDF or DOCX file.' },
                { status: 400 }
            );
        }

        // Validate file size (200MB max)
        if (file.size > APP_CONFIG.UPLOAD.MAX_FILE_SIZE) {
            const maxSizeMB = APP_CONFIG.UPLOAD.MAX_FILE_SIZE / (1024 * 1024);
            return NextResponse.json(
                { success: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` },
                { status: 400 }
            );
        }

        // 2. Adaptive Model Selection based on file size
        const adaptiveModelName = getAdaptiveModel(file.size);

        let extractedData;
        let extractedText = ''; // Store extracted text for database persistence

        // 3. Processing Logic
        if (USE_REAL_AI) {
            try {
                // Step 1: Convert file to Buffer
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // SECURITY: Magic Number Validation
                // Check if it's really a PDF by reading the first 4 bytes
                if (fileExtension === 'pdf') {
                    const header = buffer.subarray(0, 5).toString('ascii'); // %PDF-
                    if (!header.startsWith('%PDF-')) {
                        throw new Error('Security Error: File has .pdf extension but invalid PDF signature. Processing aborted.');
                    }
                }

                // Step 2: Extract text from PDF
                if (fileExtension === 'pdf') {
                    extractedText = await parsePdf(buffer);

                    // Step 3: Analyze with Gemini AI (using adaptive model)
                    extractedData = await analyzeContractText(
                        extractedText,
                        customQuery || undefined,
                        dataPoints,
                        adaptiveModelName // Pass the adaptive model name
                    );
                } else if (fileExtension === 'docx') {
                    // Placeholder for DOCX handling if you implement it later
                    // For now, fail safe
                    throw new Error('DOCX processing not yet enabled in this environment');
                } else {
                    throw new Error(`Unsupported file type: ${fileExtension}`);
                }

            } catch (aiError) {
                console.error('AI Processing Error:', aiError);
                throw new Error(aiError instanceof Error ? aiError.message : 'AI analysis failed');
            }
        } else {
            // Fallback to mock for non-PDF files or when API key is not set
            const mockText = `Mock contract text for ${file.name}`;
            extractedText = mockText;
            extractedData = await extractContractDataWithAI(mockText, file.name, customQuery || undefined, dataPoints);
        }

        // Return the extracted data including the raw text for database persistence
        const fullResponse = {
            id: crypto.randomUUID(), // Generate a temporary ID for frontend keying
            fileName: file.name,
            ...extractedData,
            extractedText, // Include raw text for chat and persistence
            requestedDataPoints: dataPoints || [],
            sector: currentSector,
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            data: fullResponse,
        });

    } catch (error) {
        console.error('Error processing contract:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred during processing'
            },
            { status: 500 }
        );
    }
}

