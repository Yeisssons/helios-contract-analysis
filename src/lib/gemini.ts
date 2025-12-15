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
    const MAX_RETRIES = 2;

    // Use provided model or default to gemini-2.5-flash
    const selectedModel = modelName || 'gemini-2.5-flash';
    // console.log(`🤖 Using AI Model: ${selectedModel}`);

    const model = genAI.getGenerativeModel({
        model: selectedModel,
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1, // Low temperature for consistent structured output
        } as GenerationConfig,
    });

    const systemPrompt = buildSystemPrompt(customQuery, dataPoints);

    const prompt = `${systemPrompt}

TEXTO DEL CONTRATO A ANALIZAR:
---
${text}
---

Extrae la información y devuelve SOLO el objeto JSON.`;

    // Retry logic with timeout
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(
                        attempt < MAX_RETRIES
                            ? 'Análisis tomando más tiempo del normal, reintentando...'
                            : 'El análisis está tomando demasiado tiempo. Por favor, intente con un archivo más pequeño o inténtelo de nuevo.'
                    ));
                }, TIMEOUT_MS);
            });

            // Race between API call and timeout
            const result = await Promise.race([
                model.generateContent(prompt),
                timeoutPromise
            ]);

            const response = await result.response;
            const responseText = response.text();

            // Try to parse JSON, with better error handling
            let parsedResult: ContractAnalysisResult;
            try {
                parsedResult = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);

                // Try to extract JSON from markdown code blocks if present
                const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                if (jsonMatch) {
                    parsedResult = JSON.parse(jsonMatch[1]);
                } else {
                    throw new Error(`Error al analizar el contrato: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
                }
            }

            const analysis = parsedResult;

            // Validate and sanitize the response
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
            console.warn(`⚠️ Gemini attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);

            // Don't retry on non-timeout errors
            if (!lastError.message.includes('Análisis tomando') && !lastError.message.includes('timeout')) {
                break;
            }
        }
    }

    // All retries exhausted
    console.error('Gemini API error after retries:', lastError);
    throw new Error(lastError?.message || 'Error al analizar el contrato: Error desconocido');
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

export default analyzeContractText;
