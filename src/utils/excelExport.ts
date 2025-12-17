import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ContractForExport {
    fileName: string;
    contractType: string;
    effectiveDate: string;
    renewalDate: string;
    noticePeriodDays: number;
    terminationClauseReference: string;
    summary?: string;
    parties?: string[];
    riskScore?: number;
    alerts?: (string | { message: string, severity: string })[];
}

/**
 * Exports an array of contracts to an Excel file
 * @param contracts - Array of contract analysis objects
 * @param language - Current language for column headers
 */
export function exportContractsToExcel(
    contracts: ContractForExport[],
    language: 'en' | 'es' = 'es'
): void {
    if (contracts.length === 0) {
        console.warn('No contracts to export');
        return;
    }

    // Column headers based on language
    const headers = language === 'es'
        ? {
            fileName: 'Nombre del Archivo',
            contractType: 'Tipo de Contrato',
            effectiveDate: 'Fecha de Vigencia',
            renewalDate: 'Fecha de Renovación',
            noticePeriodDays: 'Días de Aviso',
            terminationClause: 'Cláusula de Terminación',
            summary: 'Resumen',
            parties: 'Partes Involucradas',
            riskScore: 'Puntuación de Riesgo',
            alerts: 'Alertas',
        }
        : {
            fileName: 'File Name',
            contractType: 'Contract Type',
            effectiveDate: 'Effective Date',
            renewalDate: 'Renewal Date',
            noticePeriodDays: 'Notice Period (Days)',
            terminationClause: 'Termination Clause',
            summary: 'Summary',
            parties: 'Parties Involved',
            riskScore: 'Risk Score',
            alerts: 'Alerts',
        };

    // Transform contracts to a flat format for Excel
    const data = contracts.map(contract => ({
        [headers.fileName]: contract.fileName,
        [headers.contractType]: contract.contractType,
        [headers.effectiveDate]: contract.effectiveDate,
        [headers.renewalDate]: contract.renewalDate,
        [headers.noticePeriodDays]: contract.noticePeriodDays,
        [headers.terminationClause]: contract.terminationClauseReference,
        [headers.summary]: contract.summary || '',
        [headers.parties]: contract.parties?.join(', ') || '',
        [headers.riskScore]: contract.riskScore ?? '',
        [headers.alerts]: contract.alerts?.map(a => typeof a === 'string' ? a : a.message).join('; ') || '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths for better readability
    const columnWidths = [
        { wch: 35 },  // File Name
        { wch: 20 },  // Contract Type
        { wch: 15 },  // Effective Date
        { wch: 15 },  // Renewal Date
        { wch: 18 },  // Notice Period
        { wch: 30 },  // Termination Clause
        { wch: 50 },  // Summary
        { wch: 30 },  // Parties
        { wch: 12 },  // Risk Score
        { wch: 40 },  // Alerts
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    const sheetName = language === 'es' ? 'Contratos' : 'Contracts';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with current date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const fileName = `Contratos_Exportados_${dateStr}.xlsx`;

    // Critical Fix: Write as array buffer with explicit type
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create Blob with correct MIME type
    const dataBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Save using FileSaver
    saveAs(dataBlob, fileName);
}

/**
 * Exports a single contract analysis as a text report
 * @param contract - The contract analysis to export
 * @param language - Current language for labels
 */
export function exportSingleContractAnalysis(
    contract: ContractForExport & {
        extractedData?: Record<string, string>;
        abusiveClauses?: (string | { reference?: string; explanation?: string; severity?: string })[];
        sector?: string;
    },
    language: 'en' | 'es' = 'es'
): void {
    const labels = language === 'es' ? {
        title: 'INFORME DE ANÁLISIS DE CONTRATO',
        generatedOn: 'Generado el',
        fileName: 'Documento',
        contractType: 'Tipo de Contrato',
        sector: 'Sector',
        effectiveDate: 'Fecha de Vigencia',
        renewalDate: 'Fecha de Renovación',
        noticePeriodDays: 'Días de Aviso Previo',
        terminationClause: 'Cláusula de Terminación',
        summary: 'Resumen',
        parties: 'Partes Involucradas',
        riskScore: 'Puntuación de Riesgo',
        alerts: 'Alertas',
        abusiveClauses: 'Cláusulas Potencialmente Abusivas',
        extractedData: 'Datos Extraídos',
        noData: 'No especificado',
        riskLow: 'Bajo',
        riskMedium: 'Medio',
        riskHigh: 'Alto'
    } : {
        title: 'CONTRACT ANALYSIS REPORT',
        generatedOn: 'Generated on',
        fileName: 'Document',
        contractType: 'Contract Type',
        sector: 'Sector',
        effectiveDate: 'Effective Date',
        renewalDate: 'Renewal Date',
        noticePeriodDays: 'Notice Period (Days)',
        terminationClause: 'Termination Clause',
        summary: 'Summary',
        parties: 'Parties Involved',
        riskScore: 'Risk Score',
        alerts: 'Alerts',
        abusiveClauses: 'Potentially Abusive Clauses',
        extractedData: 'Extracted Data',
        noData: 'Not specified',
        riskLow: 'Low',
        riskMedium: 'Medium',
        riskHigh: 'High'
    };

    const getRiskLabel = (score?: number) => {
        if (!score) return labels.noData;
        if (score < 4) return `${score}/10 (${labels.riskLow})`;
        if (score < 7) return `${score}/10 (${labels.riskMedium})`;
        return `${score}/10 (${labels.riskHigh})`;
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    let report = `
════════════════════════════════════════════════════════════════
${labels.title}
════════════════════════════════════════════════════════════════

${labels.generatedOn}: ${new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}

────────────────────────────────────────────────────────────────
📄 ${labels.fileName}: ${contract.fileName}
────────────────────────────────────────────────────────────────

📋 ${labels.contractType}: ${contract.contractType || labels.noData}
🏢 ${labels.sector}: ${contract.sector || labels.noData}
📅 ${labels.effectiveDate}: ${formatDate(contract.effectiveDate)}
🔄 ${labels.renewalDate}: ${formatDate(contract.renewalDate)}
⏱️ ${labels.noticePeriodDays}: ${contract.noticePeriodDays} ${language === 'es' ? 'días' : 'days'}
📜 ${labels.terminationClause}: ${contract.terminationClauseReference || labels.noData}
⚠️ ${labels.riskScore}: ${getRiskLabel(contract.riskScore)}

────────────────────────────────────────────────────────────────
📝 ${labels.summary}
────────────────────────────────────────────────────────────────
${contract.summary || labels.noData}

────────────────────────────────────────────────────────────────
👥 ${labels.parties}
────────────────────────────────────────────────────────────────
${contract.parties?.join('\n• ') ? '• ' + contract.parties.join('\n• ') : labels.noData}
`;

    // Alerts
    if (contract.alerts && contract.alerts.length > 0) {
        report += `
────────────────────────────────────────────────────────────────
🚨 ${labels.alerts}
────────────────────────────────────────────────────────────────
`;
        contract.alerts.forEach((alert, i) => {
            const alertText = typeof alert === 'string' ? alert : alert.message;
            report += `${i + 1}. ${alertText}\n`;
        });
    }

    // Abusive Clauses
    if (contract.abusiveClauses && contract.abusiveClauses.length > 0) {
        report += `
────────────────────────────────────────────────────────────────
⚖️ ${labels.abusiveClauses}
────────────────────────────────────────────────────────────────
`;
        contract.abusiveClauses.forEach((clause, i) => {
            if (typeof clause === 'string') {
                report += `${i + 1}. ${clause}\n`;
            } else {
                report += `${i + 1}. ${clause.reference || ''}\n   ${clause.explanation || ''}\n`;
            }
        });
    }

    // Extracted Data
    if (contract.extractedData && Object.keys(contract.extractedData).length > 0) {
        report += `
────────────────────────────────────────────────────────────────
📊 ${labels.extractedData}
────────────────────────────────────────────────────────────────
`;
        Object.entries(contract.extractedData).forEach(([key, value]) => {
            report += `• ${key}: ${value}\n`;
        });
    }

    report += `
════════════════════════════════════════════════════════════════
${language === 'es' ? 'Generado por ContratoAlert AI' : 'Generated by ContratoAlert AI'}
════════════════════════════════════════════════════════════════
`;

    // Create and download the file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const baseFileName = contract.fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    saveAs(blob, `Analisis_${baseFileName}.txt`);
}

export default exportContractsToExcel;
