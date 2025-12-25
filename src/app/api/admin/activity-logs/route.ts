import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check authentication and admin status
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Verify admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
        }

        // Parse query params
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const userId = searchParams.get('userId');
        const actionType = searchParams.get('actionType');
        const agentUsed = searchParams.get('agentUsed');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabase
            .from('activity_logs')
            .select(`
        *,
        profiles (email)
      `, { count: 'exact' })
            .order('created_at', { ascending: false });

        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }
        if (userId) {
            query = query.eq('user_id', userId);
        }
        if (actionType) {
            query = query.eq('action_type', actionType);
        }
        if (agentUsed) {
            query = query.eq('agent_used', agentUsed);
        }

        query = query.range(offset, offset + limit - 1);

        const { data: logs, error, count } = await query;

        if (error) {
            console.error('Error fetching logs:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Calculate stats
        const { data: statsData } = await supabase
            .from('activity_logs')
            .select('action_type, agent_used, user_plan, user_id');

        const stats = {
            totalActions: count || 0,
            uniqueUsers: statsData ? new Set(statsData.map(l => l.user_id)).size : 0,
            topAgent: getTopValue(statsData?.map(l => l.agent_used).filter(Boolean) || []),
            planBreakdown: getPlanBreakdown(statsData || []),
            actionBreakdown: getActionBreakdown(statsData || []),
        };

        return NextResponse.json({
            success: true,
            data: {
                logs,
                total: count,
                stats,
            },
        });

    } catch (error: any) {
        console.error('Activity logs API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error',
        }, { status: 500 });
    }
}

function getTopValue(values: string[]): string | null {
    if (values.length === 0) return null;

    const counts: Record<string, number> = {};
    values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function getPlanBreakdown(data: any[]): Record<string, number> {
    const breakdown: Record<string, number> = { free: 0, pro: 0, enterprise: 0 };
    data.forEach(item => {
        if (item.user_plan && breakdown.hasOwnProperty(item.user_plan)) {
            breakdown[item.user_plan]++;
        }
    });
    return breakdown;
}

function getActionBreakdown(data: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    data.forEach(item => {
        if (item.action_type) {
            breakdown[item.action_type] = (breakdown[item.action_type] || 0) + 1;
        }
    });
    return breakdown;
}
