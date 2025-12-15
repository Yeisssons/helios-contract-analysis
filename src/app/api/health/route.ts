import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Health Check API Endpoint
 * Returns the status of database connection and other services
 */
export async function GET() {
    const healthStatus = {
        status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
            database: { status: 'unknown' as string, latency: 0 },
            storage: { status: 'unknown' as string },
        },
    };

    // Check if admin client is available
    if (!supabaseAdmin) {
        healthStatus.status = 'unhealthy';
        healthStatus.services.database = { status: 'not configured', latency: 0 };
        healthStatus.services.storage = { status: 'not configured' };
        return NextResponse.json(healthStatus);
    }

    const startTime = Date.now();

    try {
        // Check database connection by running a simple query
        const { error: dbError } = await supabaseAdmin
            .from('contracts')
            .select('id')
            .limit(1);

        const latency = Date.now() - startTime;

        if (dbError) {
            healthStatus.services.database = {
                status: 'error',
                latency,
            };
            healthStatus.status = 'unhealthy';
        } else {
            healthStatus.services.database = {
                status: 'connected',
                latency,
            };
        }

        // Check storage bucket exists
        const { error: storageError } = await supabaseAdmin
            .storage
            .from('documents')
            .list('', { limit: 1 });

        if (storageError) {
            healthStatus.services.storage = { status: 'error' };
            if (healthStatus.status === 'healthy') {
                healthStatus.status = 'degraded';
            }
        } else {
            healthStatus.services.storage = { status: 'connected' };
        }

    } catch (error) {
        console.error('Health check error:', error);
        healthStatus.status = 'unhealthy';
        healthStatus.services.database = { status: 'error', latency: 0 };
    }

    return NextResponse.json(healthStatus);
}
