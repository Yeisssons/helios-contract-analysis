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

export default exportContractsToExcel;
