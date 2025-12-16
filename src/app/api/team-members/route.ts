import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

// GET - List all team members for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
        }
        const { data, error } = await supabaseAdmin
            .from('team_members')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching team members:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error in GET team-members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new team member
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, avatar, role } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
        }
        const { data, error } = await supabaseAdmin
            .from('team_members')
            .insert([{
                user_id: user.id,
                name,
                email,
                avatar: avatar || '👤',
                role: role || 'member'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating team member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error in POST team-members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove a team member by ID
export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('id');

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
        }

        // Verify ownership
        const { data: member } = await supabaseAdmin
            .from('team_members')
            .select('user_id')
            .eq('id', memberId)
            .single();

        if (!member || member.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('team_members')
            .delete()
            .eq('id', memberId);

        if (error) {
            console.error('Error deleting team member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in DELETE team-members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
