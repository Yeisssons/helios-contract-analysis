import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/constants';

export async function POST(request: NextRequest) {
    try {
        // 1. Strict Authentication Check
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Invalid or expired token', details: authError },
                { status: 401 }
            );
        }

        const userId = user.id;

        // 2. Parse and Validate Request Body
        const body = await request.json();
        const {
            id,
            fileName,
            filePath,
            contractData,
            sector,
            tags,
            requestedDataPoints,
        } = body;

        // Ensure required fields
        if (!id || !fileName || !contractData) {
            return NextResponse.json(
                { error: 'Missing required contract fields' },
                { status: 400 }
            );
        }

        // 3. Prepare DB Record
        const contractRecord = {
            id,
            file_name: fileName,
            file_path: filePath,
            contract_type: contractData.contractType || 'Unknown',
            effective_date: contractData.effectiveDate || null,
            renewal_date: contractData.renewalDate || null,
            notice_period_days: contractData.noticePeriodDays || null,
            termination_clause_reference: contractData.terminationClauseReference || null,
            summary: contractData.summary || null,
            parties: contractData.parties || [],
            alerts: contractData.alerts || [],
            risk_score: contractData.riskScore || null,
            abusive_clauses: contractData.abusiveClauses || [],
            custom_query: contractData.customQuery || null,
            custom_answer: contractData.customAnswer || null,
            extracted_data: contractData.extractedData || {},
            data_sources: contractData.dataSources || {},
            requested_data_points: requestedDataPoints || [],
            sector: sector || APP_CONFIG.DEFAULTS.SECTOR,
            tags: tags || [],
            user_notes: '',
            user_id: userId,
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
        };

        // 4. Database Insertion
        // Using upsert to handle potential idempotency if same ID sent twice
        const dbClient = supabaseAdmin || supabase;
        const { data, error } = await dbClient
            .from('contracts')
            .upsert(contractRecord) // Changed from insert to upsert for robustness
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase DB error:', error);
            return NextResponse.json(
                { error: 'Failed to save contract to database', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, contract: data }, { status: 201 });

    } catch (error) {
        console.error('❌ Save contract handler error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
