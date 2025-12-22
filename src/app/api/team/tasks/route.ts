import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET: List tasks for the team
// POST: Create a new task
// PATCH: Update task status/assignment
// DELETE: Delete a task
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

        // Get all tasks visible to this user (owned team + assigned to me)
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select(`
                *,
                team_members!assigned_to(id, email, role, user_id),
                contracts(id, file_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
        }

        return NextResponse.json({ tasks: tasks || [] });

    } catch (error) {
        console.error('Tasks GET error:', error);
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
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!team) {
            return NextResponse.json({ error: 'No team found. Create a team first.' }, { status: 404 });
        }

        const { title, description, assignedTo, contractId, dueDate, priority } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const { data: task, error: createError } = await supabase
            .from('tasks')
            .insert({
                team_id: team.id,
                created_by: user.id,
                assigned_to: assignedTo || null,
                contract_id: contractId || null,
                title,
                description: description || null,
                due_date: dueDate || null,
                priority: priority || 'medium',
                status: 'pending',
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating task:', createError);
            return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
        }

        // If task is assigned, send notification email
        if (assignedTo) {
            try {
                const { data: member } = await supabase
                    .from('team_members')
                    .select('email, user_id')
                    .eq('id', assignedTo)
                    .single();

                if (member) {
                    const { sendTaskAssignmentEmail } = await import('@/lib/email');
                    await sendTaskAssignmentEmail({
                        to: member.email,
                        memberName: member.email.split('@')[0],
                        taskTitle: title,
                        taskDate: dueDate || 'No deadline',
                        taskDescription: description || '',
                        assignerName: user.email!,
                    });
                }
            } catch (emailError) {
                console.error('Failed to send task notification:', emailError);
                // Don't fail the request
            }
        }

        return NextResponse.json({ task }, { status: 201 });

    } catch (error) {
        console.error('Tasks POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
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

        const { taskId, status, assignedTo, priority } = await request.json();

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (status) updateData.status = status;
        if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
        if (priority) updateData.priority = priority;

        const { data: task, error: updateError } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating task:', updateError);
            return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
        }

        return NextResponse.json({ task });

    } catch (error) {
        console.error('Tasks PATCH error:', error);
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

        const { taskId } = await request.json();

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        const { error: deleteError } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (deleteError) {
            console.error('Error deleting task:', deleteError);
            return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Tasks DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
