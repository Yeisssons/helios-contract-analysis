import { NextRequest, NextResponse } from 'next/server';
import { parsePdf } from '@/lib/pdfParser';
import { analyzeContractText } from '@/lib/gemini';
import { extractContractDataWithAI } from '@/lib/ai-mock';
import { ProcessContractResponse } from '@/types/contract';
import { APP_CONFIG, getAdaptiveModel } from '@/config/constants';
import { ContractMetadataSchema } from '@/lib/schemas';
import mammoth from 'mammoth';

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

        // Validate file extension
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop() || '';
        const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
            return NextResponse.json(
                { success: false, error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file size
        const MAX_FILE_SIZE = APP_CONFIG.UPLOAD.MAX_FILE_SIZE; // Use APP_CONFIG.UPLOAD.MAX_FILE_SIZE as it's already defined
        if (file.size > MAX_FILE_SIZE) {
            const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
            return NextResponse.json(
                { success: false, error: `File too large. Maximum size: ${maxSizeMB}MB` },
                { status: 400 }
            );
        }

        let extractedText = '';
        let extractedData;

        // Get adaptive model name for Gemini
        const adaptiveModelName = getAdaptiveModel(file.size); // Keep original logic for adaptive model based on file size

        // 3. Processing Logic
        if (USE_REAL_AI) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());

                // Security check for PDF files
                if (fileExtension === 'pdf') {
                    const header = buffer.slice(0, 5).toString('ascii');
                    if (!header.startsWith('%PDF-')) {
                        throw new Error('Security Error: File has .pdf extension but invalid PDF signature. Processing aborted.');
                    }
                    // Extract text from PDF
                    extractedText = await parsePdf(buffer);
                } else if (fileExtension === 'docx' || fileExtension === 'doc') {
                    // Extract text from Word documents using mammoth
                    try {
                        const result = await mammoth.extractRawText({ buffer });
                        extractedText = result.value;

                        if (!extractedText || extractedText.trim().length < 50) {
                            throw new Error('Could not extract sufficient text from Word document');
                        }
                    } catch (docError) {
                        console.error('Word document parsing error:', docError);
                        throw new Error(`Failed to parse Word document: ${docError instanceof Error ? docError.message : 'Unknown error'}`);
                    }
                } else {
                    throw new Error(`Unsupported file type: ${fileExtension}`);
                }

                // Analyze with Gemini AI
                extractedData = await analyzeContractText(
                    extractedText,
                    customQuery || undefined,
                    dataPoints,
                    adaptiveModelName
                );

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

