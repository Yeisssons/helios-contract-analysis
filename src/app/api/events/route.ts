import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import { sendTaskAssignmentEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('calendar_events')
            .select('*, assigned_member:team_members(*)')
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, date, color, description, user_id, assigned_to_member, language } = body;

        if (!title || !date || !user_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
        }

        // Create the event
        const { data, error } = await supabaseAdmin
            .from('calendar_events')
            .insert([{
                title,
                date,
                color,
                description,
                user_id,
                assigned_to_member: assigned_to_member || null
            }])
            .select()
            .single();

        if (error) throw error;

        // Send email notification if a team member is assigned
        if (assigned_to_member) {
            try {
                // Get the team member details
                const { data: member } = await supabaseAdmin
                    .from('team_members')
                    .select('name, email')
                    .eq('id', assigned_to_member)
                    .single();

                if (member) {
                    // Format date for email
                    const formattedDate = new Date(date).toLocaleDateString(
                        language === 'en' ? 'en-US' : 'es-ES',
                        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                    );

                    // Send notification email
                    const emailResult = await sendTaskAssignmentEmail({
                        to: member.email,
                        memberName: member.name,
                        taskTitle: title,
                        taskDate: formattedDate,
                        taskDescription: description,
                        language: language || 'es'
                    });

                    if (!emailResult.success) {
                        console.warn('Failed to send task assignment email:', emailResult.error);
                    } else {
                        console.log(`✅ Task assignment email sent to ${member.email}`);
                    }
                }
            } catch (emailError) {
                // Don't fail the request if email fails
                console.error('Error sending task assignment email:', emailError);
            }
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

