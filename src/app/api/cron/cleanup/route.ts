import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
    try {
        // 1. Secure Authorization (Bearer Token matching CRON_SECRET)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) throw new Error('Supabase Admin initialization failed');

        // 2. Identify expired records (e.g., > 30 days old)
        // Adjust retention policy as needed
        const RETENTION_DAYS = 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

        // Fetch expired contracts
        const { data: expiredContracts, error: fetchError } = await supabaseAdmin
            .from('contracts')
            .select('id, file_path, user_id')
            .lt('created_at', cutoffDate.toISOString())
            .limit(100); // Process in batch to avoid timeouts

        if (fetchError) throw fetchError;

        if (!expiredContracts || expiredContracts.length === 0) {
            return NextResponse.json({ success: true, message: 'No expired contracts found', deletedCount: 0 });
        }

        // 3. Delete from Storage and DB
        const filePaths = expiredContracts.map(c => c.file_path).filter(Boolean);
        const ids = expiredContracts.map(c => c.id);

        // Batch delete files
        if (filePaths.length > 0) {
            await supabaseAdmin.storage.from('documents').remove(filePaths);
        }

        // Batch delete records
        const { error: deleteError } = await supabaseAdmin
            .from('contracts')
            .delete()
            .in('id', ids);

        if (deleteError) throw deleteError;

        // 4. Audit Log
        await logAudit({
            action: 'CLEANUP',
            resource: 'system',
            details: { deletedCount: ids.length, retentionDays: RETENTION_DAYS }
        });

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${ids.length} expired contracts`,
            deletedCount: ids.length
        });

    } catch (error) {
        console.error('Cron Cleanup Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
