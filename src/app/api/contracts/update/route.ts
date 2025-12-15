import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, extractedData, sector, effectiveDate, renewalDate, noticePeriodDays } = body;

        if (!id) {
            return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('contracts')
            .update({
                extracted_data: extractedData,
                sector,
                effective_date: effectiveDate,
                renewal_date: renewalDate,
                notice_period_days: noticePeriodDays
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error updating contract:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
