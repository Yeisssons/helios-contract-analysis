import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Contract analysis result interface matching our ContractData structure
export interface ContractAnalysisResult {
    contractType: string;
    effectiveDate: string;  // YYYY-MM-DD
    renewalDate: string;    // YYYY-MM-DD
    noticePeriodDays: number;
    terminationClauseReference: string;
    // Extended fields for richer analysis
    summary?: string;
    parties?: string[];
    alerts?: string[];
    riskScore?: number;
    abusiveClauses?: string[];
    // Custom query support
    customQuery?: string;
    customAnswer?: string;
    // Dynamic data points extraction
    extractedData?: Record<string, string>;
}

// Base system prompt for contract analysis
const BASE_SYSTEM_PROMPT = `You are an expert legal contract analyst. Your task is to extract key information from contract documents.

LANGUAGE INSTRUCTIONS:
- Identify the language of the provided document.
- Output all text fields in the SAME language as the document (e.g., if valid in Spanish, output Spanish; if English, output English).
- Exception: If a specific output language is requested via 'customQuery', use that.

Analyze the provided contract text and extract the following information in STRICT JSON format:

{
  "contractType": "Type of contract (e.g., 'Commercial Lease', 'Software License', 'Employment Contract', 'NDA')",
  "effectiveDate": "Effective date in YYYY-MM-DD format. If not found, estimate based on context.",
  "renewalDate": "Renewal or expiration date in YYYY-MM-DD format. If not stated, calculate based on effective date and duration.",
  "noticePeriodDays": "Number of days notice required for termination. Must be a number. Default to 30 if not specified.",
  "terminationClauseReference": "Reference to the termination clause (e.g., 'Clause 12.3 - Early Termination')",
  "summary": "Brief 1-2 sentence summary of the contract's main purpose",
  "parties": ["Array of names of the parties involved"],
  "alerts": ["Array of important alerts about this contract, such as upcoming deadlines or unusual clauses"],
  "riskScore": "Risk score from 1 to 10, where 1 is low risk and 10 is high risk",
  "abusiveClauses": ["Array of potentially abusive clauses detected, with specific reference and brief explanation. Look for: excessive penalties, rights waivers, unilateral modifications, disproportionate liability limitations"]
}`;

// Closing rules for the prompt
const PROMPT_RULES = `

IMPORTANT RULES:
1. ALL dates MUST be in YYYY-MM-DD format
2. noticePeriodDays MUST be a number (integer)
3. riskScore MUST be a number between 1 and 10
4. If you detect abusive clauses, increase riskScore proportionally
5. If information is missing, make a reasonable inference based on contract type
6. Return ONLY valid JSON, no additional text or explanations
7. Respect the document's language for text output`;

/**
 * Builds the system prompt, optionally including custom query and data points instructions
 */
function buildSystemPrompt(customQuery?: string, dataPoints: string[] = []): string {
    let prompt = BASE_SYSTEM_PROMPT;

    if (customQuery) {
        prompt += `,
  "customAnswer": "Si el usuario hizo una pregunta personalizada, responde aquí de forma breve y específica basándote en el contenido del contrato"`;
    }

    if (dataPoints.length > 0) {
        prompt += `,
  "extractedData": {
    // Extrae los siguientes puntos de datos específicos si los encuentras. Si no, usa "No especificado".
    ${dataPoints.map(point => `"${point}": "Valor extraído para ${point}"`).join(',\n    ')}
  },
  "dataSources": {
    // Para CADA punto de datos extraído, busca el fragmento de texto EXACTO del documento que justifica ese valor.
    // Copia el texto verbatim (máximo 150 caracteres) donde encontraste la información.
    // Si no encuentras una fuente clara, usa "No encontrado en el documento".
    ${dataPoints.map(point => `"${point}": "Fragmento de texto exacto del PDF donde se menciona ${point}"`).join(',\n    ')}
  }`;
    }

    prompt += '\n}';
    prompt += PROMPT_RULES;

    if (customQuery) {
        prompt += `

PREGUNTA PERSONALIZADA DEL USUARIO:
"${customQuery}"
Por favor, busca la respuesta a esta pregunta específica en el contrato y colócala en el campo "customAnswer".`;
    }

    return prompt;
}

/**
 * Analyzes contract text using Gemini AI and returns structured data
 * Outputs in the document's language and includes abusive clause detection
 * Supports custom queries for specific data extraction
 * 
 * Implements automatic model fallback when primary model is overloaded:
 * Chain: gemini-2.5-flash -> gemini-1.5-flash-8b -> gemini-1.5-pro
 * 
 * @param text - The contract text to analyze
 * @param customQuery - Optional custom query to answer
 * @param dataPoints - Optional array of data points to extract
 * @param modelName - Optional model name override (for adaptive model switching)
 */
export async function analyzeContractText(
    text: string,
    customQuery?: string,
    dataPoints: string[] = [],
    modelName?: string
): Promise<ContractAnalysisResult> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Configuration
    const TIMEOUT_MS = 45000; // 45 seconds timeout

    // Fallback model chain for resilience
    // Prioritized by: availability in free tier, speed, reliability
    const MODEL_CHAIN = [
        'gemini-3-flash',                      // Primary: Latest, best performance
        modelName || 'gemini-2.5-flash',       // Fallback 1: Fast and reliable
        'gemini-2.5-flash-lite',               // Fallback 2: Same speed, separate quota!
        'gemini-2.5-pro',                      // Fallback 3: High intelligence, slower
    ];

    const systemPrompt = buildSystemPrompt(customQuery, dataPoints);
    const prompt = `${systemPrompt}

TEXTO DEL CONTRATO A ANALIZAR:
---
${text}
---

Extrae la información y devuelve SOLO el objeto JSON.`;

    let lastError: Error | null = null;

    // Try each model in the chain
    for (let modelIndex = 0; modelIndex < MODEL_CHAIN.length; modelIndex++) {
        const currentModel = MODEL_CHAIN[modelIndex];
        console.log(`🤖 Trying model ${modelIndex + 1}/${MODEL_CHAIN.length}: ${currentModel}`);

        try {
            const model = genAI.getGenerativeModel({
                model: currentModel,
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1,
                } as GenerationConfig,
            });

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Timeout: El análisis está tomando demasiado tiempo.'));
                }, TIMEOUT_MS);
            });

            // Race between API call and timeout
            const result = await Promise.race([
                model.generateContent(prompt),
                timeoutPromise
            ]);

            const response = await result.response;
            const responseText = response.text();

            // Try to parse JSON
            let parsedResult: ContractAnalysisResult;
            try {
                parsedResult = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                if (jsonMatch) {
                    parsedResult = JSON.parse(jsonMatch[1]);
                } else {
                    throw new Error(`Error al analizar respuesta: JSON inválido`);
                }
            }

            const analysis = parsedResult;

            console.log(`✅ Success with model: ${currentModel}`);

            // Return validated result
            return {
                contractType: analysis.contractType || 'Contrato General',
                effectiveDate: validateDate(analysis.effectiveDate) || getTodayDate(),
                renewalDate: validateDate(analysis.renewalDate) || getOneYearFromNow(),
                noticePeriodDays: typeof analysis.noticePeriodDays === 'number' ? analysis.noticePeriodDays : 30,
                terminationClauseReference: analysis.terminationClauseReference || 'Cláusula de Terminación Estándar',
                summary: analysis.summary,
                parties: Array.isArray(analysis.parties) ? analysis.parties : [],
                alerts: Array.isArray(analysis.alerts) ? analysis.alerts : [],
                riskScore: typeof analysis.riskScore === 'number' ? Math.min(10, Math.max(1, analysis.riskScore)) : 5,
                abusiveClauses: Array.isArray(analysis.abusiveClauses) ? analysis.abusiveClauses : [],
                customQuery,
                customAnswer: analysis.customAnswer,
                extractedData: analysis.extractedData,
            };

        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            const errorMessage = lastError.message.toLowerCase();

            // Check if this is a retryable error (overload, rate limit, timeout)
            const isRetryable =
                errorMessage.includes('overload') ||
                errorMessage.includes('503') ||
                errorMessage.includes('429') ||
                errorMessage.includes('rate') ||
                errorMessage.includes('timeout') ||
                errorMessage.includes('unavailable');

            console.warn(`⚠️ Model ${currentModel} failed:`, lastError.message);

            if (!isRetryable || modelIndex === MODEL_CHAIN.length - 1) {
                // Non-retryable error or last model in chain - give up
                console.error(`❌ All models exhausted or non-retryable error`);
                break;
            }

            // Wait briefly before trying next model (exponential backoff)
            const backoffMs = Math.min(1000 * Math.pow(2, modelIndex), 5000);
            console.log(`⏳ Waiting ${backoffMs}ms before trying next model...`);
            await new Promise(r => setTimeout(r, backoffMs));
        }
    }

    // All models exhausted
    console.error('Gemini API error after all fallbacks:', lastError);
    throw new Error(lastError?.message || 'Error al analizar el contrato: Todos los modelos de IA están saturados. Por favor, inténtelo de nuevo en unos minutos.');
}

/**
 * Validates a date string is in YYYY-MM-DD format
 */
function validateDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return null;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    return dateStr;
}

/**
 * Returns today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Returns date one year from now in YYYY-MM-DD format
 */
function getOneYearFromNow(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
}

/**
 * Extracts text from an image using Gemini Vision (multimodal)
 * Used for OCR of scanned documents and photos
 * 
 * @param imageBuffer - The image file buffer
 * @param mimeType - MIME type of the image (image/jpeg, image/png, image/webp)
 * @param fileName - Original file name for logging
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(
    imageBuffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    console.log(`📸 Gemini Vision OCR: Processing ${fileName} (${(imageBuffer.length / 1024).toFixed(0)}KB)`);

    // Use gemini-2.5-flash which has good vision capabilities
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: imageBuffer.toString('base64'),
        },
    };

    const prompt = `You are an OCR (Optical Character Recognition) expert. Extract ALL text visible in this image.

INSTRUCTIONS:
1. Extract every piece of text you can see in the image
2. Maintain the original layout and structure as much as possible
3. Preserve paragraph breaks and bullet points
4. If text is handwritten, do your best to transcribe it
5. If there are tables, preserve the table structure
6. Include headers, footers, page numbers if visible
7. If text is partially obscured or unclear, indicate with [unclear] or [illegible]
8. Do NOT add any interpretation or analysis - just extract the raw text

OUTPUT FORMAT:
Return ONLY the extracted text, nothing else. No explanations, no markdown formatting.
If no text is found, return: [NO TEXT DETECTED]`;

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const extractedText = response.text();

        console.log(`✅ Gemini Vision OCR: Extracted ${extractedText.length} characters from ${fileName}`);

        return extractedText || '[NO TEXT DETECTED]';
    } catch (error) {
        console.error(`❌ Gemini Vision OCR Error for ${fileName}:`, error);

        // Try fallback to gemini-1.5-flash if 2.5 fails
        try {
            console.log(`🔄 Retrying with gemini-1.5-flash...`);
            const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await fallbackModel.generateContent([prompt, imagePart]);
            const response = await result.response;
            return response.text() || '[NO TEXT DETECTED]';
        } catch (fallbackError) {
            console.error(`❌ Fallback OCR also failed:`, fallbackError);
            return `[OCR FAILED: Could not extract text from ${fileName}]`;
        }
    }
}

export default analyzeContractText;
