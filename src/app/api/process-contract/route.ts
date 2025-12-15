import { NextRequest, NextResponse } from 'next/server';
import { parsePdf } from '@/lib/pdfParser';
import { analyzeContractText } from '@/lib/gemini';
import { extractContractDataWithAI } from '@/lib/ai-mock';
import { ProcessContractResponse } from '@/types/contract';
import { APP_CONFIG, getAdaptiveModel } from '@/config/constants';

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
        const customQuery = formData.get('customQuery') as string | null;
        const dataPointsRaw = formData.get('dataPoints') as string | null;
        const dataPoints = dataPointsRaw ? JSON.parse(dataPointsRaw) as string[] : [];
        const sector = (formData.get('sector') as string) || APP_CONFIG.DEFAULTS.SECTOR;

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

        // 3. Processing Logic
        if (USE_REAL_AI && fileExtension === 'pdf') {
            try {
                // Step 1: Convert file to Buffer
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Step 2: Extract text from PDF
                const extractedText = await parsePdf(buffer);

                // Step 3: Analyze with Gemini AI (using adaptive model)
                extractedData = await analyzeContractText(
                    extractedText,
                    customQuery || undefined,
                    dataPoints,
                    adaptiveModelName // Pass the adaptive model name
                );
            } catch (aiError) {
                console.error('AI Processing Error:', aiError);
                throw new Error('AI analysis failed. Please try again or use a different file.');
            }
        } else {
            // Fallback to mock for non-PDF files or when API key is not set
            const mockText = `Mock contract text for ${file.name}`;
            extractedData = await extractContractDataWithAI(mockText, file.name, customQuery || undefined, dataPoints);
        }

        // Return the extracted data directly without saving to mock DB
        const fullResponse = {
            id: crypto.randomUUID(), // Generate a temporary ID for frontend keying
            fileName: file.name,
            ...extractedData,
            requestedDataPoints: dataPoints,
            sector,
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

