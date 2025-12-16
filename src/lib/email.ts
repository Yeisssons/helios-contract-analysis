import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    if (!resend) {
        console.log('⚠️ RESEND_API_KEY not found. Mocking email send:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('--- HTML Content ---');
        console.log(html);
        console.log('--------------------');
        return { success: true, id: 'mock-id' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Contract Manager <onboarding@resend.dev>', // Update this with verified domain in production
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

/**
 * Send email notification when a task is assigned to a team member
 */
export async function sendTaskAssignmentEmail({
    to,
    memberName,
    taskTitle,
    taskDate,
    taskDescription,
    assignerName,
    language = 'es'
}: {
    to: string;
    memberName: string;
    taskTitle: string;
    taskDate: string;
    taskDescription?: string;
    assignerName?: string;
    language?: 'es' | 'en';
}) {
    const isSpanish = language === 'es';

    const subject = isSpanish
        ? `📋 Nueva tarea asignada: ${taskTitle}`
        : `📋 New task assigned: ${taskTitle}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%); padding: 24px 32px;">
                            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                                📋 ${isSpanish ? 'Nueva Tarea Asignada' : 'New Task Assigned'}
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="color: #94a3b8; font-size: 16px; margin: 0 0 24px 0;">
                                ${isSpanish ? 'Hola' : 'Hello'} <strong style="color: white;">${memberName}</strong>,
                            </p>
                            
                            <p style="color: #94a3b8; font-size: 16px; margin: 0 0 24px 0;">
                                ${isSpanish
            ? 'Se te ha asignado una nueva tarea:'
            : 'You have been assigned a new task:'}
                            </p>
                            
                            <!-- Task Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h2 style="margin: 0 0 16px 0; color: #10b981; font-size: 20px; font-weight: 600;">
                                            ${taskTitle}
                                        </h2>
                                        
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">📅 ${isSpanish ? 'Fecha:' : 'Date:'}</span>
                                                    <span style="color: white; font-size: 14px; margin-left: 8px; font-weight: 500;">${taskDate}</span>
                                                </td>
                                            </tr>
                                            ${taskDescription ? `
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">📝 ${isSpanish ? 'Descripción:' : 'Description:'}</span>
                                                    <p style="color: #cbd5e1; font-size: 14px; margin: 8px 0 0 0;">${taskDescription}</p>
                                                </td>
                                            </tr>
                                            ` : ''}
                                            ${assignerName ? `
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">👤 ${isSpanish ? 'Asignado por:' : 'Assigned by:'}</span>
                                                    <span style="color: white; font-size: 14px; margin-left: 8px;">${assignerName}</span>
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #64748b; font-size: 14px; margin: 0;">
                                ${isSpanish
            ? 'Accede al calendario para ver más detalles.'
            : 'Access the calendar to see more details.'}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid #334155; text-align: center;">
                            <p style="color: #64748b; font-size: 12px; margin: 0;">
                                ${isSpanish
            ? 'Este email fue enviado automáticamente por Contract Manager'
            : 'This email was sent automatically by Contract Manager'}
                            </p>
                            <p style="color: #475569; font-size: 12px; margin: 8px 0 0 0;">
                                © ${new Date().getFullYear()} YSN Solutions
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    return sendEmail({ to, subject, html });
}
