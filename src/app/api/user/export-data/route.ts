import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/user/export-data
 * GDPR Article 20: Right to Data Portability
 * Returns all user data in JSON format for download
 */
export async function GET(req: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Collect all user data
        const userData: Record<string, unknown> = {
            exportDate: new Date().toISOString(),
            gdprArticle: '20 - Right to Data Portability',
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
                lastSignIn: user.last_sign_in_at,
            },
        };

        // Get user's contracts
        const { data: contracts } = await supabaseAdmin
            .from('contracts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        userData.contracts = contracts || [];
        userData.totalContracts = contracts?.length || 0;

        // Get user's subscription (if exists)
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

        userData.subscription = subscription || null;

        // Get user's team memberships
        const { data: teamMemberships } = await supabaseAdmin
            .from('team_members')
            .select('*, teams(*)')
            .eq('user_id', user.id);

        userData.teamMemberships = teamMemberships || [];

        // Get user's tasks
        const { data: tasks } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('assigned_to', user.id);

        userData.tasks = tasks || [];

        // Privacy notice
        userData.privacyNotice = {
            dataLocation: 'Frankfurt, Germany (EU)',
            encryption: 'AES-256 at rest, TLS 1.3 in transit',
            retention: 'Data deleted upon request or after inactivity period',
            aiTraining: 'Your data is NEVER used to train AI models',
            contact: 'solutionsysn@gmail.com',
        };

        // Return as downloadable JSON
        const jsonString = JSON.stringify(userData, null, 2);

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="helios-data-export-${user.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json"`,
            },
        });

    } catch (error) {
        console.error('Data export error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
