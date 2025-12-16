import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ContractsListResponse } from '@/types/contract';

export async function GET(request: Request): Promise<NextResponse<ContractsListResponse>> {
    try {
        // 1. Strict Authentication Check
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Authorization header required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // Create an authenticated client for this request to respect RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // Verify user and get ID (optional but good practice)
        const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Fetch all contracts from Supabase using authenticated client
        const { data, error } = await supabaseUserClient
            .from('contracts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: `Database error: ${error.message}`
                },
                { status: 500 }
            );
        }

        // Transform snake_case fields from Supabase to camelCase for UI
        const transformedData = (data || []).map((contract: any) => ({
            id: contract.id,
            fileName: contract.file_name,
            filePath: contract.file_path,
            contractType: contract.contract_type,
            effectiveDate: contract.effective_date,
            renewalDate: contract.renewal_date,
            noticePeriodDays: contract.notice_period_days,
            terminationClauseReference: contract.termination_clause_reference,
            sector: contract.sector,
            tags: contract.tags || [],
            extractedData: contract.extracted_data || {},
            dataSources: contract.data_sources || {},
            abusiveClauses: contract.abusive_clauses || [],
            alerts: contract.alerts || [],
            riskLevel: contract.risk_level,
            createdAt: contract.created_at,
            lastModified: contract.last_modified,
        }));

        return NextResponse.json({
            success: true,
            data: transformedData,
        });
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
