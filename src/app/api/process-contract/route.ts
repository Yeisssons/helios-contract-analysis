import { NextRequest, NextResponse } from 'next/server';
import { parsePdf } from '@/lib/pdfParser';
import { detectFileType } from '@/lib/fileValidation';
import { extractTextFromImage } from '@/lib/gemini';
import { analyzeContractWithPlan } from '@/lib/ai-providers';
import { getUserAIConfig, getUserIdFromToken } from '@/lib/user-plan';
import { extractContractDataWithAI } from '@/lib/ai-mock';
import { ProcessContractResponse } from '@/types/contract';
import { APP_CONFIG } from '@/config/constants';
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

        // Support both single file (backward compat) and files[] array (multi-page)
        const filesArray = formData.getAll('files[]') as File[];
        const singleFile = formData.get('file') as File | null;
        const allFiles = filesArray.length > 0 ? filesArray : (singleFile ? [singleFile] : []);

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
        if (allFiles.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate all files
        const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'webp'];
        const MAX_FILE_SIZE = APP_CONFIG.UPLOAD.MAX_FILE_SIZE;

        for (const file of allFiles) {
            const fileName = file.name.toLowerCase();
            const fileExtension = fileName.split('.').pop() || '';

            if (fileExtension === 'doc') {
                return NextResponse.json(
                    { success: false, error: 'Los archivos .doc no están soportados. Convierta a .docx o PDF.' },
                    { status: 400 }
                );
            }

            if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
                return NextResponse.json(
                    { success: false, error: `Tipo no válido: ${fileExtension}. Permitidos: PDF, DOCX, JPG, PNG, WEBP` },
                    { status: 400 }
                );
            }

            if (file.size > MAX_FILE_SIZE) {
                const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
                return NextResponse.json(
                    { success: false, error: `Archivo muy grande: ${file.name}. Máximo: ${maxSizeMB}MB` },
                    { status: 400 }
                );
            }
        }

        let combinedExtractedText = '';
        let extractedData;
        let usedProvider = 'gemini';
        let usedModel = 'gemini-2.5-flash';

        // Get user's plan and AI preferences
        const authHeader = request.headers.get('authorization');
        const userId = await getUserIdFromToken(authHeader);
        const userConfig = userId ? await getUserAIConfig(userId) : { plan: 'free' as const };

        console.log(`📊 User plan: ${userConfig.plan}, Preferred model: ${userConfig.preferredModel || 'default'}`);

        // 3. Processing Logic
        if (USE_REAL_AI) {
            try {
                // Process each file and combine content
                for (const file of allFiles) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

                    // Security check: Validate Magic Numbers
                    const detectedType = detectFileType(buffer);

                    if (fileExtension === 'pdf') {
                        if (detectedType !== 'pdf') {
                            throw new Error(`Security Error: ${file.name} - Invalid PDF signature.`);
                        }
                        const pdfText = await parsePdf(buffer);
                        combinedExtractedText += `\n\n--- Page from ${file.name} ---\n\n${pdfText}`;

                    } else if (fileExtension === 'docx') {
                        if (detectedType !== 'docx') {
                            throw new Error(`Security Error: ${file.name} - Invalid DOCX signature.`);
                        }
                        const result = await mammoth.extractRawText({ buffer });
                        combinedExtractedText += `\n\n--- Page from ${file.name} ---\n\n${result.value}`;

                    } else if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
                        // Use Gemini Vision for OCR of scanned images
                        const imageText = await extractTextFromImage(buffer, file.type, file.name);
                        combinedExtractedText += `\n\n--- Scanned Image: ${file.name} ---\n\n${imageText}`;
                    }
                }

                if (combinedExtractedText.trim().length < 50) {
                    throw new Error('No se pudo extraer texto suficiente de los documentos');
                }

                // Analyze with AI based on user's plan
                const analysisResult = await analyzeContractWithPlan(
                    combinedExtractedText,
                    userConfig,
                    customQuery || undefined,
                    dataPoints
                );

                extractedData = analysisResult.result;
                usedProvider = analysisResult.provider;
                usedModel = analysisResult.model;

                console.log(`✅ Analysis complete with ${usedProvider}/${usedModel}`);

            } catch (aiError) {
                console.error('AI Processing Error:', aiError);
                throw new Error(aiError instanceof Error ? aiError.message : 'AI analysis failed');
            }
        } else {
            // Fallback to mock
            const mockText = `Mock contract text for ${allFiles.length} file(s)`;
            combinedExtractedText = mockText;
            extractedData = await extractContractDataWithAI(mockText, allFiles[0]?.name || 'unknown', customQuery || undefined, dataPoints);
        }

        // Return the extracted data including the raw text for database persistence
        const combinedFileName = allFiles.length > 1
            ? `${allFiles.length}_pages_combined`
            : allFiles[0]?.name || 'unknown';

        // Ensure all required ContractData fields are present with defaults
        const fullResponse = {
            id: crypto.randomUUID(),
            fileName: combinedFileName,
            // Required ContractData fields with defaults if missing
            contractType: String(extractedData?.contractType || 'Unknown'),
            effectiveDate: String(extractedData?.effectiveDate || new Date().toISOString().split('T')[0]),
            renewalDate: String(extractedData?.renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
            noticePeriodDays: Number(extractedData?.noticePeriodDays) || 30,
            terminationClauseReference: String(extractedData?.terminationClauseReference || 'Not found'),
            // Optional fields
            summary: extractedData?.summary ? String(extractedData.summary) : undefined,
            parties: Array.isArray(extractedData?.parties) ? extractedData.parties as string[] : [],
            alerts: Array.isArray(extractedData?.alerts) ? extractedData.alerts as string[] : [],
            riskScore: Number(extractedData?.riskScore) || 5,
            abusiveClauses: Array.isArray(extractedData?.abusiveClauses) ? extractedData.abusiveClauses as string[] : [],
            customAnswer: extractedData?.customAnswer ? String(extractedData.customAnswer) : undefined,
            extractedData: extractedData?.extractedData as Record<string, string> | undefined,
            // Metadata
            extractedText: combinedExtractedText,
            requestedDataPoints: dataPoints || [],
            sector: currentSector,
            createdAt: new Date().toISOString(),
            pageCount: allFiles.length,
            // AI info for transparency
            aiProvider: usedProvider,
            aiModel: usedModel,
            userPlan: userConfig.plan,
        };

        // Audit Log
        if (USE_REAL_AI) {
            const { logAudit } = await import('@/lib/audit');
            // We don't have user_id here directly unless we verify session token OR pass it from client.
            // Ideally we should verify session in this route too.
            // For now, let's assume we can get it from header or subsequent save step will log it.
            // Actually, this route returns data to client, which then calls /save-contract.
            // Let's log in /save-contract where we HAVE the session validation!
        }

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

