/**
 * Mock Gemini AI function for contract data extraction
 * In production, this would call the actual Gemini API
 * 
 * UPDATED: All mock data is now in Spanish to match the default UI language
 */
export interface AIExtractionResult {
    contractType: string;
    effectiveDate: string;
    renewalDate: string;
    noticePeriodDays: number;
    terminationClauseReference: string;
    // Extended fields
    summary?: string;
    parties?: string[];
    alerts?: string[];
    riskScore?: number;
    abusiveClauses?: string[];
    // Custom query
    customQuery?: string;
    customAnswer?: string;
    // Dynamic data points
    extractedData?: Record<string, string>;
}

// Contract types in Spanish
const CONTRACT_TYPES_ES = [
    'Contrato de Alquiler Comercial',
    'Licencia de Software',
    'Contrato de Servicios',
    'Acuerdo de Confidencialidad (NDA)',
    'Contrato de Trabajo',
    'Contrato de Suscripción',
    'Contrato de Consultoría',
    'Contrato de Asociación',
    'Contrato con Proveedor',
    'Contrato de Mantenimiento',
];

// Termination clauses in Spanish
const TERMINATION_CLAUSES_ES = [
    'Cláusula 12.3 - Terminación Anticipada',
    'Artículo 8 - Renovación Automática',
    'Cláusula 7.2 - Terminación por Conveniencia',
    'Sección 5.1 - Requisitos de Notificación',
    'Artículo 10 - Terminación del Contrato',
    'Párrafo 6.4 - Derechos de Cancelación',
    'Sección 9.1 - Términos de Renovación',
    'Artículo 15 - Finalización del Acuerdo',
];

// Mock abusive clauses for demo
const ABUSIVE_CLAUSES_ES = [
    'Cláusula 14.2: Penalización excesiva del 50% por terminación anticipada (potencialmente abusiva según Ley de Consumidores)',
    'Artículo 18: Renuncia unilateral de derechos sin compensación',
    'Sección 22.1: Modificación unilateral de condiciones sin previo aviso',
    'Cláusula 9.5: Limitación de responsabilidad desproporcionada',
];



// Mock summaries in Spanish
const SUMMARIES_ES = [
    'Contrato que establece los términos y condiciones de arrendamiento de un local comercial, incluyendo obligaciones de mantenimiento y uso permitido.',
    'Acuerdo de licencia de software que otorga derechos de uso limitados, sujeto a términos de renovación anual.',
    'Contrato de prestación de servicios profesionales con alcance definido y métricas de cumplimiento.',
    'Acuerdo de confidencialidad mutua para proteger información sensible durante la relación comercial.',
    'Contrato laboral que establece condiciones de empleo, compensación y beneficios.',
];

// Mock parties in Spanish
const PARTIES_ES = [
    ['Empresa Contratante S.A.', 'Proveedor de Servicios S.L.'],
    ['Arrendador Inmobiliario S.A.', 'Arrendatario Comercial S.L.'],
    ['Licenciante de Software Inc.', 'Usuario Corporativo S.A.'],
    ['Consultoría Estratégica S.L.', 'Cliente Empresarial S.A.'],
];

// Mock custom answers for demo
const CUSTOM_ANSWERS_ES: Record<string, string> = {
    'penalización': 'La penalización por cancelación anticipada es del 25% del valor restante del contrato, según la Cláusula 14.2.',
    'penalizacion': 'La penalización por cancelación anticipada es del 25% del valor restante del contrato, según la Cláusula 14.2.',
    'cancelación': 'El contrato puede cancelarse con 30 días de preaviso escrito, sujeto a penalización según Artículo 12.',
    'cancelacion': 'El contrato puede cancelarse con 30 días de preaviso escrito, sujeto a penalización según Artículo 12.',
    'mascotas': 'Las mascotas no están expresamente prohibidas, pero requieren autorización previa del arrendador y depósito adicional.',
    'renovación': 'La renovación es automática por períodos anuales, a menos que se notifique 60 días antes del vencimiento.',
    'renovacion': 'La renovación es automática por períodos anuales, a menos que se notifique 60 días antes del vencimiento.',
    'precio': 'El precio mensual es de €2,500 con ajuste anual según IPC, máximo 3%.',
    'pago': 'Los pagos deben realizarse antes del día 5 de cada mes mediante transferencia bancaria.',
    'garantía': 'Se requiere garantía equivalente a 2 meses de renta, reembolsable al finalizar el contrato.',
    'garantia': 'Se requiere garantía equivalente a 2 meses de renta, reembolsable al finalizar el contrato.',
    'default': 'Según el análisis del documento, este dato no está especificado explícitamente en el contrato.',
};

/**
 * Generates a mock answer for a custom query
 */
function generateCustomAnswer(query?: string): string | undefined {
    if (!query) return undefined;

    const lowerQuery = query.toLowerCase();

    // Check for keyword matches
    for (const [keyword, answer] of Object.entries(CUSTOM_ANSWERS_ES)) {
        if (keyword !== 'default' && lowerQuery.includes(keyword)) {
            return answer;
        }
    }

    // Default response
    return CUSTOM_ANSWERS_ES['default'];
}

/**
 * Simulates AI extraction from contract text
 * Returns structured data matching the required JSON format
 * All responses are in Spanish for consistency with the default UI
 */
export async function extractContractDataWithAI(
    contractText: string,
    fileName: string,
    customQuery?: string,
    dataPoints: string[] = []
): Promise<AIExtractionResult> {
    // Simulate AI processing time (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Determine contract type based on filename or text content
    const contractType = determineContractType(fileName, contractText);

    // Extract or generate dates
    const { effectiveDate, renewalDate } = extractDates(contractText);

    // Extract or generate notice period
    const noticePeriodDays = extractNoticePeriod(contractText);

    // Extract or generate termination clause reference
    const terminationClauseReference = extractTerminationClause(contractText, contractType);

    // Generate mock extended data
    const riskScore = Math.floor(Math.random() * 7) + 3; // 3-9 range
    const hasAbusiveClauses = riskScore >= 7;

    // Generate custom answer if query provided
    const customAnswer = generateCustomAnswer(customQuery);

    // Generate extracted data for requested data points with realistic mock values
    const extractedData: Record<string, string> = {};
    if (dataPoints.length > 0) {
        dataPoints.forEach(point => {
            // Generate realistic mock data based on the specific data point
            switch (point) {
                // Core 5 (already handled elsewhere, but included for completeness if selected)
                case 'Fecha de Vigencia':
                    extractedData[point] = effectiveDate;
                    break;
                case 'Fecha de Renovación':
                    extractedData[point] = renewalDate;
                    break;
                case 'Periodo de Aviso':
                    extractedData[point] = `${noticePeriodDays} días`;
                    break;
                case 'Cláusula de Terminación':
                    extractedData[point] = terminationClauseReference;
                    break;
                case 'Partes Involucradas':
                    extractedData[point] = PARTIES_ES[Math.floor(Math.random() * PARTIES_ES.length)].join(' y ');
                    break;

                // Legal
                case 'Jurisdicción':
                    extractedData[point] = ['Madrid, España', 'Barcelona, España', 'Valencia, España', 'Lisboa, Portugal'][Math.floor(Math.random() * 4)];
                    break;
                case 'Ley Aplicable':
                    extractedData[point] = 'Ley española, según el Código Civil vigente';
                    break;
                case 'Idioma del Contrato':
                    extractedData[point] = 'Español (castellano)';
                    break;
                case 'Exclusividad':
                    extractedData[point] = Math.random() > 0.5 ? 'Sí, cláusula de exclusividad aplicable' : 'No aplicable';
                    break;
                case 'Confidencialidad':
                    extractedData[point] = 'Cláusula 8.1 - Obligación de confidencialidad durante 3 años post-contrato';
                    break;
                case 'No Competencia':
                    extractedData[point] = Math.random() > 0.5 ? 'Cláusula restrictiva por 12 meses en sector específico' : 'No especificada';
                    break;
                case 'Propiedad Intelectual':
                    extractedData[point] = 'Todos los derechos de PI permanecen con el licenciante';
                    break;

                // Financial
                case 'Moneda':
                    extractedData[point] = ['EUR (€)', 'USD ($)', 'GBP (£)'][Math.floor(Math.random() * 3)];
                    break;
                case 'Términos de Pago':
                    extractedData[point] = ['Pago a 30 días', 'Pago a 60 días', 'Pago anticipado', 'Mensualidades'][Math.floor(Math.random() * 4)];
                    break;
                case 'Penalizaciones':
                    extractedData[point] = `${Math.floor(Math.random() * 20 + 10)}% del valor contractual por incumplimiento`;
                    break;
                case 'Impuestos':
                    extractedData[point] = 'IVA aplicable según legislación vigente (21% estándar)';
                    break;
                case 'Límite de Responsabilidad':
                    extractedData[point] = `Limitado a ${Math.floor(Math.random() * 3 + 1)}x el valor anual del contrato`;
                    break;
                case 'Indemnización':
                    extractedData[point] = 'Indemnización por daños directos, excluidos daños indirectos';
                    break;
                case 'Garantías':
                    extractedData[point] = `Garantía bancaria equivalente a ${Math.floor(Math.random() * 2 + 1)} meses de facturación`;
                    break;

                // Operational
                case 'Fuerza Mayor':
                    extractedData[point] = 'Cláusula 15 - Suspensión temporal de obligaciones en casos de fuerza mayor';
                    break;
                case 'Protección de Datos (GDPR)':
                    extractedData[point] = 'Cumplimiento RGPD/GDPR - Encargado de tratamiento según Art. 28';
                    break;
                case 'Seguros Requeridos':
                    extractedData[point] = `Seguro de responsabilidad civil por €${Math.floor(Math.random() * 5 + 1)}M mínimo`;
                    break;
                case 'Derechos de Auditoría':
                    extractedData[point] = 'El cliente puede auditar con 15 días de preaviso, máximo 1 vez/año';
                    break;
                case 'Cesión de Contrato':
                    extractedData[point] = Math.random() > 0.5 ? 'Permitida con consentimiento previo por escrito' : 'No permitida sin autorización';
                    break;
                case 'Soporte y Mantenimiento':
                    extractedData[point] = 'Soporte 24/7 con tiempo de respuesta de 4 horas para críticos';
                    break;
                case 'Nivel de Servicio (SLA)':
                    extractedData[point] = `Disponibilidad del ${95 + Math.floor(Math.random() * 4)}% con créditos por incumplimiento`;
                    break;
                case 'Subcontratación':
                    extractedData[point] = Math.random() > 0.5 ? 'Permitida para servicios auxiliares' : 'Requiere aprobación previa del cliente';
                    break;
                case 'Cambio de Control':
                    extractedData[point] = 'Notificación obligatoria en caso de fusión o adquisición';
                    break;
                case 'Resolución de Disputas':
                    extractedData[point] = ['Arbitraje según normas CAM', 'Mediación previa obligatoria', 'Tribunales de Madrid'][Math.floor(Math.random() * 3)];
                    break;
                case 'Modificación del Contrato':
                    extractedData[point] = 'Solo mediante acuerdo escrito firmado por ambas partes';
                    break;

                default:
                    extractedData[point] = `Información extraída: ${point} (dato simulado)`;
            }
        });
    }

    return {
        contractType,
        effectiveDate,
        renewalDate,
        noticePeriodDays,
        terminationClauseReference,
        summary: SUMMARIES_ES[Math.floor(Math.random() * SUMMARIES_ES.length)],
        parties: PARTIES_ES[Math.floor(Math.random() * PARTIES_ES.length)],
        alerts: generateAlerts(renewalDate, noticePeriodDays, hasAbusiveClauses),
        riskScore,
        abusiveClauses: hasAbusiveClauses
            ? ABUSIVE_CLAUSES_ES.slice(0, Math.floor(Math.random() * 2) + 1)
            : [],
        customQuery,
        customAnswer,
        extractedData
    };
}

function determineContractType(fileName: string, text: string): string {
    const lowerFileName = fileName.toLowerCase();
    const lowerText = text.toLowerCase();

    // Spanish detection
    if (lowerFileName.includes('alquiler') || lowerFileName.includes('arrendamiento') ||
        lowerFileName.includes('lease') || lowerText.includes('lease agreement')) {
        return 'Contrato de Alquiler Comercial';
    }
    if (lowerFileName.includes('software') || lowerFileName.includes('licencia') ||
        lowerFileName.includes('license') || lowerText.includes('software license')) {
        return 'Licencia de Software';
    }
    if (lowerFileName.includes('nda') || lowerFileName.includes('confidencial') ||
        lowerText.includes('non-disclosure') || lowerText.includes('confidencialidad')) {
        return 'Acuerdo de Confidencialidad (NDA)';
    }
    if (lowerFileName.includes('servicio') || lowerFileName.includes('service') ||
        lowerText.includes('professional services') || lowerText.includes('servicios')) {
        return 'Contrato de Servicios';
    }
    if (lowerFileName.includes('empleo') || lowerFileName.includes('trabajo') ||
        lowerFileName.includes('employment') || lowerText.includes('employment contract')) {
        return 'Contrato de Trabajo';
    }
    if (lowerFileName.includes('suscripcion') || lowerFileName.includes('subscription')) {
        return 'Contrato de Suscripción';
    }
    if (lowerFileName.includes('consultoria') || lowerFileName.includes('consulting')) {
        return 'Contrato de Consultoría';
    }

    // Random fallback (Spanish)
    return CONTRACT_TYPES_ES[Math.floor(Math.random() * CONTRACT_TYPES_ES.length)];
}

function extractDates(text: string): { effectiveDate: string; renewalDate: string } {
    // Try to find dates in text using regex
    const datePattern = /(\d{4})-(\d{2})-(\d{2})/g;
    const matches = text.match(datePattern);

    if (matches && matches.length >= 2) {
        const sortedDates = matches.sort();
        return {
            effectiveDate: sortedDates[0],
            renewalDate: sortedDates[sortedDates.length - 1],
        };
    }

    // Generate realistic dates if not found
    const now = new Date();
    const effectiveDate = new Date(now);
    effectiveDate.setMonth(effectiveDate.getMonth() - Math.floor(Math.random() * 6));

    const renewalDate = new Date(effectiveDate);
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    return {
        effectiveDate: formatDate(effectiveDate),
        renewalDate: formatDate(renewalDate),
    };
}

function extractNoticePeriod(text: string): number {
    // Try to find notice period in text (Spanish or English)
    const noticePatternES = /(\d+)\s*días?\s*(de\s*)?(aviso|preaviso|antelación)/i;
    const noticePatternEN = /(\d+)\s*days?\s*(written\s*)?(notice|prior)/i;

    const match = text.match(noticePatternES) || text.match(noticePatternEN);

    if (match) {
        const days = parseInt(match[1], 10);
        if (days > 0 && days <= 180) {
            return days;
        }
    }

    // Return a random common notice period
    const commonPeriods = [15, 30, 45, 60, 90];
    return commonPeriods[Math.floor(Math.random() * commonPeriods.length)];
}

function extractTerminationClause(text: string, contractType: string): string {
    // Try to find termination clause reference in text (Spanish patterns)
    const clausePatternES = /(cláusula|artículo|sección|párrafo)\s*(\d+\.?\d*)\s*[-:]\s*([^.]+)/i;
    const clausePatternEN = /(section|article|clause|paragraph)\s*(\d+\.?\d*)\s*[-:]\s*([^.]+)/i;

    const match = text.match(clausePatternES) || text.match(clausePatternEN);

    if (match) {
        const prefixMap: Record<string, string> = {
            'clause': 'Cláusula', 'section': 'Sección', 'article': 'Artículo', 'paragraph': 'Párrafo',
            'cláusula': 'Cláusula', 'sección': 'Sección', 'artículo': 'Artículo', 'párrafo': 'Párrafo',
        };
        const prefix = prefixMap[match[1].toLowerCase()] || match[1];
        const number = match[2];
        const title = match[3].trim().substring(0, 30);
        return `${prefix} ${number} - ${title}`;
    }

    // Return a relevant clause based on contract type (Spanish)
    switch (contractType) {
        case 'Contrato de Alquiler Comercial':
            return 'Cláusula 12.3 - Terminación Anticipada';
        case 'Licencia de Software':
            return 'Artículo 8 - Renovación Automática';
        case 'Acuerdo de Confidencialidad (NDA)':
            return 'Sección 5.1 - Plazo y Terminación';
        case 'Contrato de Servicios':
            return 'Cláusula 7.2 - Terminación por Conveniencia';
        case 'Contrato de Trabajo':
            return 'Sección 7.4 - Período de Preaviso';
        default:
            return TERMINATION_CLAUSES_ES[Math.floor(Math.random() * TERMINATION_CLAUSES_ES.length)];
    }
}

function generateAlerts(renewalDate: string, noticePeriodDays: number, hasAbusiveClauses: boolean): string[] {
    const alerts: string[] = [];

    const renewal = new Date(renewalDate);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilRenewal <= 60) {
        alerts.push('⚠️ Fecha de renovación próxima - Acción requerida pronto');
    }

    if (noticePeriodDays <= 30) {
        alerts.push('📅 Período de aviso corto - Planifique con anticipación');
    }

    if (hasAbusiveClauses) {
        alerts.push('🔴 Se detectaron cláusulas potencialmente abusivas - Revisión legal recomendada');
    }

    return alerts;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default extractContractDataWithAI;
