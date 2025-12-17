import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRenewalAlertEmail } from '@/lib/email';

// Use service role key for admin access (bypass RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cron Job: Send Renewal Alert Emails
 * 
 * This endpoint should be called daily by Vercel Cron or similar.
 * It queries contracts with renewal_date within the next 7, 14, 30, or 60 days
 * and sends email alerts to the contract owners.
 * 
 * Security: Protected by CRON_SECRET header check.
 */
export async function GET(request: NextRequest) {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const alertWindows = [7, 14, 30, 60]; // Days before renewal to send alerts

        let emailsSent = 0;
        let errors: string[] = [];

        for (const days of alertWindows) {
            const targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + days);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            // Query contracts that renew on this exact date
            // This prevents duplicate emails (only send on the exact day match)
            const { data: contracts, error } = await supabaseAdmin
                .from('contracts')
                .select('id, file_name, renewal_date, user_id')
                .eq('renewal_date', targetDateStr);

            if (error) {
                console.error(`Error fetching contracts for ${days} day alert:`, error);
                errors.push(`DB Error (${days}d): ${error.message}`);
                continue;
            }

            if (!contracts || contracts.length === 0) {
                console.log(`No contracts renewing in ${days} days (${targetDateStr})`);
                continue;
            }

            console.log(`Found ${contracts.length} contracts renewing in ${days} days`);

            // For each contract, get user email and send alert
            for (const contract of contracts) {
                try {
                    // Get user email from auth.users
                    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(contract.user_id);

                    if (userError || !userData?.user?.email) {
                        console.warn(`Could not get email for user ${contract.user_id}`);
                        continue;
                    }

                    const userEmail = userData.user.email;
                    const userName = userData.user.user_metadata?.name || userEmail.split('@')[0];

                    await sendRenewalAlertEmail({
                        to: userEmail,
                        userName,
                        contractName: contract.file_name,
                        renewalDate: targetDateStr,
                        daysUntilRenewal: days,
                        contractId: contract.id,
                        language: 'es' // Default to Spanish, could be user preference later
                    });

                    emailsSent++;
                    console.log(`✅ Sent ${days}-day alert to ${userEmail} for contract ${contract.id}`);

                } catch (emailError) {
                    console.error(`Error sending email for contract ${contract.id}:`, emailError);
                    errors.push(`Email Error (${contract.id}): ${emailError}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            emailsSent,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Also allow POST for manual testing
export async function POST(request: NextRequest) {
    return GET(request);
}
