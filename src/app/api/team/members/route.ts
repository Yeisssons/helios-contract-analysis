import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTeamInviteEmail } from '@/lib/email';
import { getUserSubscription, PLAN_LIMITS } from '@/lib/subscriptions';

// GET: List team members
// POST: Invite a new member
// DELETE: Remove a member
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

        // Get user's team
        const { data: team } = await supabase
            .from('teams')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!team) {
            return NextResponse.json({ error: 'No team found' }, { status: 404 });
        }

        // Get members
        const { data: members, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', team.id)
            .neq('status', 'removed')
            .order('joined_at', { ascending: true });

        if (error) {
            console.error('Error fetching members:', error);
            return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
        }

        return NextResponse.json({ members });

    } catch (error) {
        console.error('Members GET error:', error);
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

        // Get user's team
        const { data: team } = await supabase
            .from('teams')
            .select('id, name')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!team) {
            return NextResponse.json({ error: 'No team found' }, { status: 404 });
        }

        // Check member limit
        const subscription = await getUserSubscription(user.id, supabase);
        const plan = subscription?.plan || 'free';
        const maxMembers = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.teamMembers || 0;

        const { count: currentCount } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)
            .neq('status', 'removed');

        if (maxMembers !== Infinity && (currentCount || 0) >= maxMembers) {
            return NextResponse.json({
                error: `Team member limit reached (${maxMembers})`,
                upgrade: true
            }, { status: 403 });
        }

        // Parse body
        const { email, role = 'member' } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if already invited
        const { data: existing } = await supabase
            .from('team_members')
            .select('id, status')
            .eq('team_id', team.id)
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (existing && existing.status !== 'removed') {
            return NextResponse.json({ error: 'User already invited' }, { status: 400 });
        }

        // Check if user exists in the system
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Try to find user by email (this requires admin access)
        const { data: existingUsers } = await supabaseAdmin
            .from('team_members')
            .select('user_id')
            .eq('email', email.toLowerCase())
            .not('user_id', 'is', null)
            .limit(1);

        const existingUserId = existingUsers?.[0]?.user_id || null;

        // Insert or update member
        const memberData = {
            team_id: team.id,
            email: email.toLowerCase(),
            role,
            status: existingUserId ? 'active' : 'pending',
            user_id: existingUserId,
            joined_at: existingUserId ? new Date().toISOString() : null,
        };

        let member;
        if (existing) {
            // Reactivate removed member
            const { data, error } = await supabase
                .from('team_members')
                .update(memberData)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            member = data;
        } else {
            // Insert new member
            const { data, error } = await supabase
                .from('team_members')
                .insert(memberData)
                .select()
                .single();
            if (error) throw error;
            member = data;
        }

        // Send invite email
        try {
            await sendTeamInviteEmail({
                to: email,
                teamName: team.name,
                inviterEmail: user.email!,
                isNewUser: !existingUserId,
            });
        } catch (emailError) {
            console.error('Failed to send invite email:', emailError);
            // Don't fail the request, member was still added
        }

        return NextResponse.json({ member }, { status: 201 });

    } catch (error) {
        console.error('Members POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
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

        const { memberId } = await request.json();

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
        }

        // Verify user owns the team and member exists
        const { data: member } = await supabase
            .from('team_members')
            .select('*, teams!inner(owner_id)')
            .eq('id', memberId)
            .single();

        if (!member || (member.teams as { owner_id: string }).owner_id !== user.id) {
            return NextResponse.json({ error: 'Not authorized to remove this member' }, { status: 403 });
        }

        // Can't remove owner
        if (member.role === 'owner') {
            return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 });
        }

        // Soft delete (mark as removed)
        const { error } = await supabase
            .from('team_members')
            .update({ status: 'removed' })
            .eq('id', memberId);

        if (error) {
            console.error('Error removing member:', error);
            return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Members DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
