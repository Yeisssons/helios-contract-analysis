import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    // Basic security check (use stricter auth in production, e.g. CRON_SECRET)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, error: 'Supabase admin client not initialized' }, { status: 500 });
    }

    try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30); // Check 30 days out

        // 1. Get contracts expiring soon (simplification: checking 30 days exactly for demo)
        // In production, you'd check ranges (30 days, 7 days, etc.)
        const targetDate = futureDate.toISOString().split('T')[0];

        const { data: contracts, error } = await supabaseAdmin
            .from('contracts')
            .select('id, file_name, renewal_date, user_id')
            .eq('renewal_date', targetDate);

        if (error) throw error;

        if (!contracts || contracts.length === 0) {
            return NextResponse.json({ message: 'No contracts expiring in 30 days' });
        }

        // 2. Process notifications
        const results = [];
        for (const contract of contracts) {
            // Get user email
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(contract.user_id);

            if (userError || !userData.user.email) {
                console.error(`User not found for contract ${contract.id}`);
                continue;
            }

            const emailHtml = `
                <h1>Contract Expiring Soon</h1>
                <p>Your contract <strong>${contract.file_name}</strong> is set to renew or expire on ${contract.renewal_date}.</p>
                <p>Please review it in your dashboard.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contracts/${contract.id}">View Contract</a>
            `;

            const result = await sendEmail({
                to: userData.user.email,
                subject: `Expiring Contract: ${contract.file_name}`,
                html: emailHtml
            });

            results.push({ contractId: contract.id, result });
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });
    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
