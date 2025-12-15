import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { newName } = await request.json();

        if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
            return NextResponse.json(
                { error: 'New name is required' },
                { status: 400 }
            );
        }

        // Update contract name in database
        const { data, error } = await supabase
            .from('contracts')
            .update({ file_name: newName.trim() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error renaming contract:', error);
            return NextResponse.json(
                { error: 'Failed to rename contract' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, contract: data }, { status: 200 });
    } catch (error) {
        console.error('Rename contract error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
