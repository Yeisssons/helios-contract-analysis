import { saveAs } from 'file-saver';

export interface ContractForBusinessTools {
    fileName: string;
    contractType: string;
    effectiveDate: string;
    renewalDate: string;
    noticePeriodDays: number;
    terminationClauseReference: string;
    parties?: string[];
    summary?: string;
}

/**
 * Generates and downloads an .ics calendar event file
 * Sets a reminder 30 days before the renewal/expiration date
 */
export function downloadCalendarEvent(contract: ContractForBusinessTools): void {
    const renewalDate = new Date(contract.renewalDate);

    // Reminder date: 30 days before renewal
    const reminderDate = new Date(renewalDate);
    reminderDate.setDate(reminderDate.getDate() - 30);

    // Format dates for ICS (YYYYMMDD format)
    const formatICSDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const formatICSDateOnly = (date: Date): string => {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    };

    const eventStart = formatICSDateOnly(reminderDate);
    const eventEnd = formatICSDateOnly(new Date(reminderDate.getTime() + 24 * 60 * 60 * 1000));
    const created = formatICSDate(new Date());

    const partiesList = contract.parties?.join(', ') || 'Partes no especificadas';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ContratoAlert AI//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART;VALUE=DATE:${eventStart}
DTEND;VALUE=DATE:${eventEnd}
DTSTAMP:${created}
UID:${Date.now()}@contratoalert.ai
SUMMARY:⚠️ Recordatorio: Renovación de Contrato - ${contract.fileName}
DESCRIPTION:RECORDATORIO DE RENOVACIÓN DE CONTRATO\\n\\nContrato: ${contract.fileName}\\nTipo: ${contract.contractType}\\nPartes: ${partiesList}\\nFecha de Renovación: ${contract.renewalDate}\\nPlazo de Aviso: ${contract.noticePeriodDays} días\\nCláusula de Terminación: ${contract.terminationClauseReference}\\n\\n⚡ Acción requerida: Revisar y decidir sobre la renovación antes de la fecha límite.
LOCATION:ContratoAlert AI
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Recordatorio de renovación de contrato
TRIGGER:-P7D
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const fileName = `Recordatorio_${contract.fileName.replace(/\.[^/.]+$/, '')}.ics`;
    saveAs(blob, fileName);
}

/**
 * Generates a formal Spanish cancellation letter draft
 * Returns the text content for display/copying
 */
export function generateCancellationDraft(contract: ContractForBusinessTools): string {
    const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const renewalDate = new Date(contract.renewalDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const partiesList = contract.parties?.join(' y ') || '[Nombre de la contraparte]';
    const firstParty = contract.parties?.[0] || '[Su empresa]';

    const draft = `
COMUNICACIÓN DE NO RENOVACIÓN DE CONTRATO

${today}

Estimados señores de ${partiesList}:

Por medio de la presente, y en ejercicio de los derechos que nos asisten conforme a lo establecido en la ${contract.terminationClauseReference} del contrato de ${contract.contractType.toLowerCase()} suscrito entre las partes, nos dirigimos a ustedes para comunicarles formalmente nuestra decisión de NO RENOVAR el mencionado contrato.

DATOS DEL CONTRATO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Documento: ${contract.fileName}
• Tipo de Contrato: ${contract.contractType}
• Fecha de Vigencia: ${contract.effectiveDate}
• Fecha de Renovación/Vencimiento: ${renewalDate}
• Plazo de Preaviso: ${contract.noticePeriodDays} días
• Cláusula Aplicable: ${contract.terminationClauseReference}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

De conformidad con el plazo de preaviso estipulado de ${contract.noticePeriodDays} días, la presente comunicación se realiza con la antelación debida para que surta los efectos legales correspondientes.

Solicitamos:
1. Confirmación de recepción de la presente comunicación.
2. Coordinación para la devolución de cualquier bien o documentación en poder de cualquiera de las partes.
3. Liquidación final de cualquier obligación pendiente.

Quedamos a su disposición para coordinar los aspectos operativos derivados de la terminación del contrato.

Sin otro particular, les saluda atentamente,


_______________________________
${firstParty}
[Cargo / Representante Legal]
[Fecha de firma]


---
Documento generado por ContratoAlert AI
Este es un borrador y debe ser revisado por un profesional legal antes de su envío.
`.trim();

    return draft;
}

/**
 * Copies text to clipboard and returns success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Email templates by sector
 */
export interface EmailTemplate {
    id: string;
    labelEs: string;
    labelEn: string;
    icon: string;
}

export const EMAIL_TEMPLATES_BY_SECTOR: Record<string, EmailTemplate[]> = {
    legal: [
        { id: 'termination', labelEs: 'Aviso de Terminación', labelEn: 'Termination Notice', icon: '❌' },
        { id: 'renewal_inquiry', labelEs: 'Consulta de Renovación', labelEn: 'Renewal Inquiry', icon: '🔄' },
        { id: 'amendment', labelEs: 'Solicitud de Enmienda', labelEn: 'Amendment Request', icon: '📝' },
        { id: 'dispute', labelEs: 'Notificación de Disputa', labelEn: 'Dispute Notification', icon: '⚠️' },
        { id: 'compliance', labelEs: 'Recordatorio de Cumplimiento', labelEn: 'Compliance Reminder', icon: '✅' },
    ],
    financial: [
        { id: 'payment_inquiry', labelEs: 'Consulta de Pago', labelEn: 'Payment Inquiry', icon: '💰' },
        { id: 'rate_negotiation', labelEs: 'Negociación de Tasas', labelEn: 'Rate Negotiation', icon: '📊' },
        { id: 'audit_request', labelEs: 'Solicitud de Auditoría', labelEn: 'Audit Request', icon: '🔍' },
        { id: 'covenant_breach', labelEs: 'Aviso de Incumplimiento', labelEn: 'Covenant Breach Notice', icon: '⚠️' },
        { id: 'termination', labelEs: 'Aviso de Terminación', labelEn: 'Termination Notice', icon: '❌' },
    ],
    hr: [
        { id: 'resignation', labelEs: 'Carta de Renuncia', labelEn: 'Resignation Letter', icon: '👋' },
        { id: 'contract_renewal', labelEs: 'Renovación de Contrato', labelEn: 'Contract Renewal', icon: '🔄' },
        { id: 'benefits_inquiry', labelEs: 'Consulta de Beneficios', labelEn: 'Benefits Inquiry', icon: '🎁' },
        { id: 'schedule_change', labelEs: 'Solicitud Cambio Horario', labelEn: 'Schedule Change Request', icon: '⏰' },
        { id: 'remote_work', labelEs: 'Solicitud Teletrabajo', labelEn: 'Remote Work Request', icon: '🏠' },
    ],
    technology: [
        { id: 'license_renewal', labelEs: 'Renovación de Licencia', labelEn: 'License Renewal', icon: '🔑' },
        { id: 'support_escalation', labelEs: 'Escalación de Soporte', labelEn: 'Support Escalation', icon: '🚀' },
        { id: 'sla_breach', labelEs: 'Incumplimiento SLA', labelEn: 'SLA Breach Notice', icon: '⚠️' },
        { id: 'feature_request', labelEs: 'Solicitud de Funcionalidad', labelEn: 'Feature Request', icon: '💡' },
        { id: 'data_export', labelEs: 'Solicitud Exportación Datos', labelEn: 'Data Export Request', icon: '📤' },
    ],
    real_estate: [
        { id: 'lease_termination', labelEs: 'Terminación de Arrendamiento', labelEn: 'Lease Termination', icon: '🏠' },
        { id: 'maintenance', labelEs: 'Solicitud de Mantenimiento', labelEn: 'Maintenance Request', icon: '🔧' },
        { id: 'rent_negotiation', labelEs: 'Negociación de Renta', labelEn: 'Rent Negotiation', icon: '💰' },
        { id: 'deposit_return', labelEs: 'Devolución de Fianza', labelEn: 'Deposit Return Request', icon: '💳' },
        { id: 'renewal_notice', labelEs: 'Aviso de Renovación', labelEn: 'Renewal Notice', icon: '🔄' },
    ],
    construction: [
        { id: 'delay_notification', labelEs: 'Notificación de Retraso', labelEn: 'Delay Notification', icon: '⏱️' },
        { id: 'payment_milestone', labelEs: 'Certificación de Hito', labelEn: 'Milestone Certification', icon: '✅' },
        { id: 'change_order', labelEs: 'Orden de Cambio', labelEn: 'Change Order Request', icon: '📝' },
        { id: 'quality_issue', labelEs: 'Reporte de Calidad', labelEn: 'Quality Issue Report', icon: '⚠️' },
        { id: 'completion_notice', labelEs: 'Aviso de Finalización', labelEn: 'Completion Notice', icon: '🎉' },
    ],
    healthcare: [
        { id: 'service_inquiry', labelEs: 'Consulta de Servicios', labelEn: 'Service Inquiry', icon: '🏥' },
        { id: 'authorization', labelEs: 'Solicitud Autorización Previa', labelEn: 'Prior Authorization Request', icon: '📋' },
        { id: 'billing_dispute', labelEs: 'Disputa de Facturación', labelEn: 'Billing Dispute', icon: '💰' },
        { id: 'referral', labelEs: 'Solicitud de Referencia', labelEn: 'Referral Request', icon: '👨‍⚕️' },
        { id: 'termination', labelEs: 'Terminación de Contrato', labelEn: 'Contract Termination', icon: '❌' },
    ],
    insurance: [
        { id: 'claim_notification', labelEs: 'Notificación de Siniestro', labelEn: 'Claim Notification', icon: '📢' },
        { id: 'coverage_inquiry', labelEs: 'Consulta de Cobertura', labelEn: 'Coverage Inquiry', icon: '🛡️' },
        { id: 'premium_negotiation', labelEs: 'Negociación de Prima', labelEn: 'Premium Negotiation', icon: '💰' },
        { id: 'policy_renewal', labelEs: 'Renovación de Póliza', labelEn: 'Policy Renewal', icon: '🔄' },
        { id: 'cancellation', labelEs: 'Cancelación de Póliza', labelEn: 'Policy Cancellation', icon: '❌' },
    ],
    public_sector: [
        { id: 'bid_clarification', labelEs: 'Aclaración de Licitación', labelEn: 'Bid Clarification', icon: '❓' },
        { id: 'extension_request', labelEs: 'Solicitud de Prórroga', labelEn: 'Extension Request', icon: '⏰' },
        { id: 'payment_claim', labelEs: 'Reclamación de Pago', labelEn: 'Payment Claim', icon: '💰' },
        { id: 'compliance_report', labelEs: 'Informe de Cumplimiento', labelEn: 'Compliance Report', icon: '📊' },
        { id: 'modification', labelEs: 'Solicitud Modificado', labelEn: 'Contract Modification', icon: '📝' },
    ],
    utilities: [
        { id: 'service_issue', labelEs: 'Incidencia de Servicio', labelEn: 'Service Issue Report', icon: '⚡' },
        { id: 'rate_inquiry', labelEs: 'Consulta de Tarifas', labelEn: 'Rate Inquiry', icon: '💰' },
        { id: 'power_change', labelEs: 'Cambio de Potencia', labelEn: 'Power Change Request', icon: '🔌' },
        { id: 'supplier_switch', labelEs: 'Cambio de Comercializadora', labelEn: 'Supplier Switch Notice', icon: '🔄' },
        { id: 'termination', labelEs: 'Baja de Contrato', labelEn: 'Contract Termination', icon: '❌' },
    ],
    logistics: [
        { id: 'shipment_inquiry', labelEs: 'Consulta de Envío', labelEn: 'Shipment Inquiry', icon: '📦' },
        { id: 'delay_claim', labelEs: 'Reclamación por Retraso', labelEn: 'Delay Claim', icon: '⏱️' },
        { id: 'damage_report', labelEs: 'Reporte de Daños', labelEn: 'Damage Report', icon: '⚠️' },
        { id: 'rate_negotiation', labelEs: 'Negociación de Tarifas', labelEn: 'Rate Negotiation', icon: '💰' },
        { id: 'service_change', labelEs: 'Cambio de Servicio', labelEn: 'Service Change Request', icon: '🔄' },
    ],
    pharma: [
        { id: 'regulatory_inquiry', labelEs: 'Consulta Regulatoria', labelEn: 'Regulatory Inquiry', icon: '📋' },
        { id: 'supply_issue', labelEs: 'Incidencia de Suministro', labelEn: 'Supply Issue Report', icon: '📦' },
        { id: 'quality_notification', labelEs: 'Notificación de Calidad', labelEn: 'Quality Notification', icon: '✅' },
        { id: 'trial_update', labelEs: 'Actualización de Ensayo', labelEn: 'Trial Update', icon: '🔬' },
        { id: 'license_renewal', labelEs: 'Renovación de Licencia', labelEn: 'License Renewal', icon: '📄' },
    ],
};

/**
 * Generates a sector-specific email draft
 */
export function generateSectorEmail(
    contract: ContractForBusinessTools,
    sector: string,
    emailType: string,
    language: 'es' | 'en'
): string {
    const today = new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const partiesList = contract.parties?.join(language === 'es' ? ' y ' : ' and ') ||
        (language === 'es' ? '[Contraparte]' : '[Counterparty]');

    // Get template info
    const templates = EMAIL_TEMPLATES_BY_SECTOR[sector] || EMAIL_TEMPLATES_BY_SECTOR['legal'];
    const template = templates.find(t => t.id === emailType) || templates[0];
    const subject = language === 'es' ? template.labelEs : template.labelEn;

    if (language === 'es') {
        return `
ASUNTO: ${subject} - ${contract.fileName}

${today}

Estimados señores de ${partiesList}:

[INTRODUCCIÓN - Explique el propósito de este correo]

DATOS DEL CONTRATO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Documento: ${contract.fileName}
• Tipo: ${contract.contractType}
• Fecha de Vigencia: ${contract.effectiveDate || 'No especificada'}
• Fecha de Renovación: ${contract.renewalDate || 'No especificada'}
• Plazo de Preaviso: ${contract.noticePeriodDays || 30} días
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CUERPO DEL MENSAJE - Detalle su solicitud o comunicación]

[ACCIONES SOLICITADAS - Liste las acciones que espera de la contraparte]

Quedamos a su disposición para cualquier aclaración.

Atentamente,

_______________________________
[Su nombre]
[Cargo / Empresa]
[Email / Teléfono]

---
Generado por ContratoAlert AI
Este es un borrador - revise antes de enviar.
`.trim();
    } else {
        return `
SUBJECT: ${subject} - ${contract.fileName}

${today}

Dear ${partiesList}:

[INTRODUCTION - Explain the purpose of this email]

CONTRACT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Document: ${contract.fileName}
• Type: ${contract.contractType}
• Effective Date: ${contract.effectiveDate || 'Not specified'}
• Renewal Date: ${contract.renewalDate || 'Not specified'}
• Notice Period: ${contract.noticePeriodDays || 30} days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[MESSAGE BODY - Detail your request or communication]

[REQUESTED ACTIONS - List the actions you expect from the counterparty]

Please let us know if you have any questions.

Best regards,

_______________________________
[Your name]
[Position / Company]
[Email / Phone]

---
Generated by ContratoAlert AI
This is a draft - please review before sending.
`.trim();
    }
}

export default {
    downloadCalendarEvent,
    generateCancellationDraft,
    copyToClipboard,
    generateSectorEmail,
    EMAIL_TEMPLATES_BY_SECTOR
};

