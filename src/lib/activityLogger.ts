/**
 * Activity Logger Utility
 * Logs user actions for admin monitoring without storing sensitive data
 */

export type ActivityAction =
    | 'user_login'
    | 'user_logout'
    | 'document_upload'
    | 'document_analysis'
    | 'document_delete'
    | 'plan_upgrade'
    | 'plan_downgrade'
    | 'api_call'
    | 'error';

interface LogActivityParams {
    userId: string;
    action: ActivityAction;
    agentUsed?: string;
    userPlan?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Log an activity to the database
 * Automatically sanitizes metadata to remove sensitive information
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
    try {
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();

        // Sanitize metadata to remove sensitive data
        const sanitizedMetadata = sanitizeMetadata(params.metadata || {});

        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: params.userId,
                action_type: params.action,
                agent_used: params.agentUsed,
                user_plan: params.userPlan,
                metadata: sanitizedMetadata,
                ip_address: params.ipAddress ? maskIpAddress(params.ipAddress) : null,
                user_agent: params.userAgent || null,
            });

        if (error) {
            console.error('Failed to log activity:', error);
        }
    } catch (error) {
        // Fail silently - logging should never break the main flow
        console.error('Activity logging error:', error);
    }
}

/**
 * Remove sensitive fields from metadata
 */
function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
        'fileName',
        'file_name',
        'filePath',
        'file_path',
        'extractedData',
        'extracted_data',
        'content',
        'document_content',
        'analysis_result',
        'email',
        'password',
        'token',
    ];

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
        // Skip sensitive fields
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            continue;
        }

        // If value is an object, recursively sanitize
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeMetadata(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Mask IP address for privacy (keep first two octets)
 * Example: 192.168.1.100 -> 192.168.*.*
 */
function maskIpAddress(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.*.*`;
    }
    return ip; // Return as-is if not IPv4
}

/**
 * Helper to get client IP and User-Agent from request headers
 */
export function getClientInfo(headers: Headers): { ipAddress?: string; userAgent?: string } {
    return {
        ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || undefined,
        userAgent: headers.get('user-agent') || undefined,
    };
}
