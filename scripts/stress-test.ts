#!/usr/bin/env npx ts-node
/**
 * Stress Test Script for Helios Contract Analysis Pipeline
 * 
 * Tests the full pipeline: Storage → Gemini AI → Database
 * 
 * Usage: npm run test:ingest
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration
const CONFIG = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    STORAGE_BUCKET: 'documents',
    TEST_SECTOR: 'utilities', // Stress test with Utilities sector (30 data points)
    PDF_SEARCH_PATHS: [
        './', // Root
        './documents/',
        './test-files/',
        '/home/yeissonss/Descargas/', // User's downloads (common location)
        '/home/yeissonss/Descargas/vatiom/', // Specific path for user's active document
    ],
};

// Utilities sector data points for stress test (all 30)
const UTILITIES_DATA_POINTS = [
    "Tarifa de Acceso (6.1TD, 6.2TD, 6.3TD, 6.4TD)",
    "Potencia Contratada P1",
    "Potencia Contratada P2",
    "Potencia Contratada P3",
    "Potencia Contratada P4-P6",
    "Penalización Energía Reactiva",
    "Certificados Origen Renovable (GDO)",
    "Garantía de Suministro",
    "Maxímetro Mensual",
    "Precio Energía Indexado vs Fijo",
    "SLA Disponibilidad (%)",
    "Caudal Garantizado Mbps",
    "Troncales SIP Empresariales",
    "IP Fija / Rangos IP Asignados",
    "MPLS / Cloud Privado",
    "Mantenimiento 24x7 Nivel 2/3",
    "Penalización por Corte Servicio",
    "Tiempo Máximo Resolución Incidencias",
    "Backup de Línea (Redundancia)",
    "VPN Empresarial",
    "Ancho de Banda Simétrico",
    "Latencia Garantizada",
    "QoS (Quality of Service)",
    "Consumo Mínimo Facturado",
    "Término Fijo Potencia",
    "Término Variable Energía",
    "Cambio Comercializadora Permitido",
    "Monitorización en Tiempo Real",
    "Factura Electrónica B2B",
    "Vencimiento y Preaviso"
];

// Initialize Supabase client (using service role for full access)
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

interface TestResult {
    fileName: string;
    storage: boolean;
    ai: boolean;
    database: boolean;
    riskScore?: number;
    hasDataSources?: boolean;
    error?: string;
    duration?: number;
}

/**
 * Find all PDF files in search paths
 */
function findPdfFiles(): string[] {
    const pdfFiles: string[] = [];

    for (const searchPath of CONFIG.PDF_SEARCH_PATHS) {
        try {
            const resolvedPath = path.resolve(searchPath);
            console.log(`   Scanning: ${resolvedPath}`);
            if (!fs.existsSync(resolvedPath)) {
                // console.log(`   [Skipped] Path does not exist: ${resolvedPath}`);
                continue;
            }

            const files = fs.readdirSync(resolvedPath);
            for (const file of files) {
                if (file.toLowerCase().endsWith('.pdf')) {
                    pdfFiles.push(path.join(resolvedPath, file));
                }
            }
        } catch (err) {
            // Skip inaccessible directories
        }
    }

    return pdfFiles;
}

/**
 * Upload file to Supabase Storage
 */
async function uploadToStorage(filePath: string): Promise<{ path: string; error?: string }> {
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const timestamp = Date.now();
    const storagePath = `stress-test/${timestamp}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { data, error } = await supabase.storage
        .from(CONFIG.STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
            contentType: 'application/pdf',
            cacheControl: '3600',
        });

    if (error) {
        return { path: '', error: error.message };
    }

    return { path: data.path };
}

/**
 * Extract text from PDF using pdf-parse
 */
async function extractPdfText(filePath: string): Promise<string> {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
}

/**
 * Analyze contract with Gemini AI (with retry for 503 errors)
 */
async function analyzeWithGemini(text: string): Promise<{
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
}> {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
        },
    });

    const prompt = `You are an expert legal contract analyst. Analyze this contract and extract the following data points in JSON format:

{
    "contractType": "Type of contract",
    "effectiveDate": "YYYY-MM-DD",
    "renewalDate": "YYYY-MM-DD",
    "noticePeriodDays": 30,
    "terminationClauseReference": "Clause reference",
    "summary": "Brief summary",
    "parties": ["Party 1", "Party 2"],
    "riskScore": 5,
    "alerts": [],
    "abusiveClauses": [],
    "extractedData": {
        ${UTILITIES_DATA_POINTS.map(p => `"${p}": "value or 'No especificado'"`).join(',\n        ')}
    },
    "dataSources": {
        ${UTILITIES_DATA_POINTS.map(p => `"${p}": "Quote from document or 'No encontrado'"`).join(',\n        ')}
    }
}

CONTRACT TEXT:
---
${text.substring(0, 50000)}
---

Return ONLY valid JSON.`;

    // Retry with exponential backoff for 503 errors (AGGRESSIVE)
    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            const parsed = JSON.parse(responseText);
            return { success: true, data: parsed };
        } catch (error: unknown) {
            const err = error as Error;
            const isRetryable = err.message.includes('503') ||
                err.message.includes('overloaded') ||
                err.message.includes('429') ||
                err.message.includes('Too Many Requests');

            if (isRetryable && attempt < MAX_RETRIES) {
                // 5s, 10s, 20s, 40s
                const waitTime = 5000 * Math.pow(2, attempt - 1);
                console.log(`   ⏳ Retry ${attempt}/${MAX_RETRIES} in ${waitTime / 1000}s (Rate limit/Overloaded)...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            return { success: false, error: err.message };
        }
    }

    return { success: false, error: 'Max retries exceeded' };
}

/**
 * Validate date string is in YYYY-MM-DD format
 */
function isValidDate(dateStr: unknown): boolean {
    if (typeof dateStr !== 'string') return false;
    if (dateStr === 'No especificado' || dateStr === 'No encontrado') return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateStr);
}

/**
 * Save result to Supabase database
 */
async function saveToDatabase(fileName: string, storagePath: string, analysisData: Record<string, unknown>, userId: string): Promise<{ success: boolean; error?: string }> {
    // Validate dates before inserting
    const effectiveDate = isValidDate(analysisData.effectiveDate) ? analysisData.effectiveDate : null;
    const renewalDate = isValidDate(analysisData.renewalDate) ? analysisData.renewalDate : null;

    const { error } = await supabase
        .from('contracts')
        .insert({
            id: crypto.randomUUID(), // Explicitly generate ID to fix NULL error
            file_name: fileName,
            file_path: storagePath,
            sector: CONFIG.TEST_SECTOR,
            extracted_data: analysisData.extractedData || {},
            effective_date: effectiveDate,
            renewal_date: renewalDate,
            risk_score: typeof analysisData.riskScore === 'number' ? analysisData.riskScore : 5,
            user_id: userId, // Use real user ID from Auth
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Process a single PDF through the full pipeline
 */
async function processPdf(filePath: string, userId: string): Promise<TestResult> {
    const fileName = path.basename(filePath);
    const result: TestResult = {
        fileName,
        storage: false,
        ai: false,
        database: false,
    };

    const startTime = Date.now();

    try {
        // Step 1: Upload to Storage
        console.log(`📤 Uploading ${fileName} to Storage...`);
        const uploadResult = await uploadToStorage(filePath);
        if (uploadResult.error) {
            result.error = `Storage: ${uploadResult.error}`;
            return result;
        }
        result.storage = true;
        console.log(`✅ File [${fileName}]: Uploaded to Storage`);

        // Step 2: Extract text and analyze with AI
        console.log(`🤖 Analyzing ${fileName} with Gemini AI...`);
        const text = await extractPdfText(filePath);
        const aiResult = await analyzeWithGemini(text);
        if (!aiResult.success || !aiResult.data) {
            result.error = `AI: ${aiResult.error}`;
            return result;
        }
        result.ai = true;
        result.riskScore = (aiResult.data.riskScore as number) || 5;
        result.hasDataSources = !!(aiResult.data.dataSources && Object.keys(aiResult.data.dataSources as object).length > 0);
        console.log(`✅ File [${fileName}]: AI Analysis Complete (Risk Score: ${result.riskScore})`);

        // Step 3: Save to Database
        console.log(`💾 Saving ${fileName} to Database...`);
        const dbResult = await saveToDatabase(fileName, uploadResult.path, aiResult.data, userId);
        if (!dbResult.success) {
            result.error = `Database: ${dbResult.error}`;
            return result;
        }
        result.database = true;
        console.log(`✅ File [${fileName}]: Saved to DB`);

        result.duration = Date.now() - startTime;

    } catch (error: unknown) {
        const err = error as Error;
        result.error = err.message;
        console.error(`❌ ERROR [${fileName}]: ${err.message}`);
    }

    return result;
}

/**
 * Main stress test runner
 */
async function runStressTest() {
    console.log('\n🧪 ═══════════════════════════════════════════════════════');
    console.log('   HELIOS STRESS TEST - Full Pipeline Verification');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Validate configuration
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_KEY || !CONFIG.GEMINI_API_KEY) {
        console.error('❌ Missing required environment variables!');
        console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY');
        process.exit(1);
    }

    // Find PDF files
    console.log('🔍 Searching for PDF files...');
    const pdfFiles = findPdfFiles();

    if (pdfFiles.length === 0) {
        console.log('⚠️  No PDF files found in search paths.');
        console.log('   Place PDF files in: ./documents/ or project root');
        process.exit(0);
    }

    console.log(`📁 Found ${pdfFiles.length} PDF file(s):\n`);
    pdfFiles.forEach((f, i) => console.log(`   ${i + 1}. ${path.basename(f)}`));
    console.log('\n');

    // Process PDFs sequentially to respect rate limits
    console.log('🚀 Starting sequential processing (to avoid 429 Rate Limits)...\n');

    // Fetch a valid user ID for testing
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users || users.length === 0) {
        console.error('❌ Could not find any users in auth.users to assign contracts to.');
        process.exit(1);
    }
    const testUserId = users[0].id;
    console.log(`👤 Using Test User ID: ${testUserId}`);

    const startTime = Date.now();
    const results: TestResult[] = [];

    for (const [index, file] of pdfFiles.entries()) {
        if (index > 0) {
            console.log('   ⏳ Waiting 10s to respect API quota...');
            await new Promise(r => setTimeout(r, 10000));
        }
        results.push(await processPdf(file, testUserId));
    }

    const totalDuration = Date.now() - startTime;

    // Summary Report
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   📊 STRESS TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    const successful = results.filter(r => r.storage && r.ai && r.database);
    const failed = results.filter(r => r.error);

    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`📈 Avg per file: ${(totalDuration / results.length / 1000).toFixed(2)}s\n`);

    if (failed.length > 0) {
        console.log('Failed files:');
        failed.forEach(f => console.log(`   ❌ ${f.fileName}: ${f.error}`));
    }

    // DataSources check for Click-to-Source feature
    const withSources = results.filter(r => r.hasDataSources);
    console.log(`\n📎 DataSources (Click-to-Source): ${withSources.length}/${results.length} have citation quotes`);

    console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Run the test
runStressTest().catch(console.error);
