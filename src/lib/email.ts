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
