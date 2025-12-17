import { getSupabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';

export type AuditAction = 'UPLOAD' | 'VIEW' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'CLEANUP';

interface AuditLogEntry {
    userId?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
}

/**
 * Logs an audit event to the database.
 * Uses Supabase Admin client to bypass RLS for insertion.
 */
export async function logAudit(entry: AuditLogEntry) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error('Audit Log Error: Supabase Admin not initialized');
            return;
        }

        const ip = headers().get('x-forwarded-for') || 'unknown';

        const { error } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                user_id: entry.userId,
                action: entry.action,
                resource: entry.resource,
                resource_id: entry.resourceId,
                details: entry.details || {},
                ip_address: ip
            });

        if (error) {
            console.error('Audit Log Insert Error:', error);
        }
    } catch (err) {
        console.error('Audit Log Unexpected Error:', err);
    }
}
