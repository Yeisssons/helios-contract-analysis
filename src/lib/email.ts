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

/**
 * Send email notification for contract renewal alerts
 */
export async function sendRenewalAlertEmail({
    to,
    userName,
    contractName,
    renewalDate,
    daysUntilRenewal,
    contractId,
    appUrl = 'https://helios-contract.vercel.app',
    language = 'es'
}: {
    to: string;
    userName: string;
    contractName: string;
    renewalDate: string;
    daysUntilRenewal: number;
    contractId: string;
    appUrl?: string;
    language?: 'es' | 'en';
}) {
    const isSpanish = language === 'es';

    const urgencyColor = daysUntilRenewal <= 7 ? '#ef4444' : daysUntilRenewal <= 30 ? '#f59e0b' : '#10b981';
    const urgencyText = daysUntilRenewal <= 7
        ? (isSpanish ? '¡Urgente!' : 'Urgent!')
        : daysUntilRenewal <= 30
            ? (isSpanish ? 'Próximamente' : 'Upcoming')
            : (isSpanish ? 'Próxima renovación' : 'Upcoming Renewal');

    const subject = isSpanish
        ? `⏰ Alerta de renovación: ${contractName} (${daysUntilRenewal} días)`
        : `⏰ Renewal Alert: ${contractName} (${daysUntilRenewal} days)`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(90deg, ${urgencyColor} 0%, #3b82f6 100%); padding: 24px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                                            ⏰ ${urgencyText}
                                        </h1>
                                    </td>
                                    <td align="right">
                                        <span style="color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 500;">
                                            Helios
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 24px 0;">
                                ${isSpanish ? 'Hola' : 'Hello'} <strong style="color: white;">${userName}</strong>,
                            </p>
                            
                            <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 24px 0;">
                                ${isSpanish
            ? 'Te recordamos que el siguiente contrato está próximo a renovarse:'
            : 'This is a reminder that the following contract is due for renewal:'}
                            </p>
                            
                            <!-- Contract Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #27272a; border-radius: 12px; border: 1px solid #3f3f46; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h2 style="margin: 0 0 16px 0; color: ${urgencyColor}; font-size: 20px; font-weight: 600;">
                                            📄 ${contractName}
                                        </h2>
                                        
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #71717a; font-size: 14px;">📅 ${isSpanish ? 'Fecha de renovación:' : 'Renewal Date:'}</span>
                                                    <span style="color: white; font-size: 14px; margin-left: 8px; font-weight: 500;">${renewalDate}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #71717a; font-size: 14px;">⏱️ ${isSpanish ? 'Días restantes:' : 'Days remaining:'}</span>
                                                    <span style="color: ${urgencyColor}; font-size: 14px; margin-left: 8px; font-weight: 700;">${daysUntilRenewal}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td>
                                        <a href="${appUrl}/contracts/${contractId}" 
                                           style="display: inline-block; background: linear-gradient(90deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                            ${isSpanish ? 'Ver Contrato' : 'View Contract'}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid #27272a; text-align: center;">
                            <p style="color: #52525b; font-size: 12px; margin: 0;">
                                ${isSpanish
            ? 'Este email fue enviado automáticamente por Helios Contract Intelligence'
            : 'This email was sent automatically by Helios Contract Intelligence'}
                            </p>
                            <p style="color: #3f3f46; font-size: 12px; margin: 8px 0 0 0;">
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

/**
 * Send email invitation to join a team
 */
export async function sendTeamInviteEmail({
    to,
    teamName,
    inviterEmail,
    isNewUser,
    language = 'es'
}: {
    to: string;
    teamName: string;
    inviterEmail: string;
    isNewUser: boolean;
    language?: 'es' | 'en';
}) {
    const isSpanish = language === 'es';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://helios.ysnsolutions.com';

    const subject = isSpanish
        ? `Has sido invitado a unirte al equipo "${teamName}" en Helios`
        : `You've been invited to join team "${teamName}" on Helios`;

    const ctaUrl = isNewUser
        ? `${appUrl}/signup?email=${encodeURIComponent(to)}&team=${encodeURIComponent(teamName)}`
        : `${appUrl}/team`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 520px; width: 100%; background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #27272a;">
                            <h1 style="margin: 0; color: #10b981; font-size: 28px; font-weight: 700;">
                                ☀️ Helios
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #52525b; font-size: 12px;">
                                ${isSpanish ? 'Inteligencia Contractual' : 'Contract Intelligence'}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px 0;">
                                ${isSpanish ? '¡Has sido invitado!' : 'You\'ve been invited!'}
                            </h2>
                            
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                                ${isSpanish
            ? `<strong style="color: #ffffff;">${inviterEmail}</strong> te ha invitado a unirte al equipo <strong style="color: #10b981;">"${teamName}"</strong> en Helios.`
            : `<strong style="color: #ffffff;">${inviterEmail}</strong> has invited you to join the team <strong style="color: #10b981;">"${teamName}"</strong> on Helios.`
        }
                            </p>

                            ${isNewUser ? `
                            <p style="color: #71717a; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0; padding: 16px; background: #18181b; border-radius: 8px; border-left: 3px solid #10b981;">
                                ${isSpanish
                ? 'Como aún no tienes cuenta, al hacer clic en el botón podrás registrarte. Tu equipo te estará esperando.'
                : 'Since you don\'t have an account yet, clicking the button will let you sign up. Your team will be waiting.'
            }
                            </p>
                            ` : ''}

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="${ctaUrl}" 
                                           style="display: inline-block; padding: 14px 32px; background: #10b981; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                                            ${isNewUser
            ? (isSpanish ? 'Crear Cuenta y Unirme' : 'Create Account & Join')
            : (isSpanish ? 'Ver Mi Equipo' : 'View My Team')
        }
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid #27272a; text-align: center;">
                            <p style="color: #52525b; font-size: 12px; margin: 0;">
                                ${isSpanish
            ? 'Este email fue enviado automáticamente por Helios Contract Intelligence'
            : 'This email was sent automatically by Helios Contract Intelligence'}
                            </p>
                            <p style="color: #3f3f46; font-size: 12px; margin: 8px 0 0 0;">
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
