import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserSubscription } from '@/lib/subscriptions';

// GET: Fetch current user's team
// POST: Create a new team (requires Pro plan)
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user owns a team
        const { data: ownedTeam, error: teamError } = await supabase
            .from('teams')
            .select('*, team_members(*)')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (teamError) {
            console.error('Error fetching team:', teamError);
            return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
        }

        // Also check if user is a member of any team
        const { data: memberOf, error: memberError } = await supabase
            .from('team_members')
            .select('*, teams(*)')
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (memberError) {
            console.error('Error fetching memberships:', memberError);
        }

        return NextResponse.json({
            ownedTeam,
            memberOf: memberOf || [],
        });

    } catch (error) {
        console.error('Team GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has Pro or Enterprise plan
        const subscription = await getUserSubscription(user.id, supabase);
        if (!subscription || subscription.plan === 'free') {
            return NextResponse.json({
                error: 'Team feature requires Pro or Enterprise plan',
                upgrade: true
            }, { status: 403 });
        }

        // Check if user already owns a team
        const { data: existingTeam } = await supabase
            .from('teams')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (existingTeam) {
            return NextResponse.json({ error: 'You already own a team' }, { status: 400 });
        }

        // Parse body
        const { name } = await request.json();

        // Create team
        const { data: team, error: createError } = await supabase
            .from('teams')
            .insert({
                owner_id: user.id,
                name: name || 'Mi Equipo',
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating team:', createError);
            return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
        }

        // Add owner as first member
        await supabase.from('team_members').insert({
            team_id: team.id,
            user_id: user.id,
            email: user.email!,
            role: 'owner',
            status: 'active',
            joined_at: new Date().toISOString(),
        });

        return NextResponse.json({ team }, { status: 201 });

    } catch (error) {
        console.error('Team POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
