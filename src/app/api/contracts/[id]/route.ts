import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // 1. Strict Authentication Check
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization'); // Handles case insensitivity

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Authorization header required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // 2. Fetch contract securely (ensuring it belongs to the user)
        // We use supabaseAdmin to bypass RLS but manually enforce user_id check
        // This is often more reliable in API routes than relying on implicit context
        const dbClient = supabaseAdmin || supabase;

        const { data, error } = await dbClient
            .from('contracts')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id) // 🔒 CRITICAL: Enforce ownership
            .single();

        if (error || !data) {
            console.error('Error fetching contract:', error);
            return NextResponse.json(
                { success: false, error: 'Contract not found or access denied' },
                { status: 404 }
            );
        }

        // Transform snake_case to camelCase
        const transformedData = {
            id: data.id,
            fileName: data.file_name,
            filePath: data.file_path,
            contractType: data.contract_type,
            effectiveDate: data.effective_date,
            renewalDate: data.renewal_date,
            noticePeriodDays: data.notice_period_days,
            terminationClauseReference: data.termination_clause_reference,
            sector: data.sector,
            tags: data.tags || [],
            extractedData: data.extracted_data || {},
            dataSources: data.data_sources || {},
            abusiveClauses: data.abusive_clauses || [],
            alerts: data.alerts || [],
            riskLevel: data.risk_level,
            createdAt: data.created_at,
            lastModified: data.last_modified,
            // Include extra fields if needed
            extractedText: data.extracted_text,
        };

        return NextResponse.json({ success: true, data: transformedData }, { status: 200 });
    } catch (error) {
        console.error('Get contract error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        console.log('🗑️ DELETE request for contract:', id);

        // 1. Strict Authentication Check
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Authorization header required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Use admin client but filter by user_id to ensure ownership
        const dbClient = supabaseAdmin || supabase;

        // First, get the contract to find the file path
        const { data: contract, error: fetchError } = await dbClient
            .from('contracts')
            .select('file_path')
            .eq('id', id)
            .eq('user_id', user.id) // 🔒 Enforce ownership
            .single();

        if (fetchError || !contract) {
            console.error('❌ Error fetching contract for deletion:', fetchError);
            return NextResponse.json(
                { success: false, error: 'Contract not found or access denied' },
                { status: 404 }
            );
        }

        console.log('📄 Contract found:', contract);

        // Delete the file from storage if it exists
        if (contract?.file_path) {
            console.log('🗂️ Deleting file from storage:', contract.file_path);
            const { error: storageError } = await dbClient.storage
                .from('documents')
                .remove([contract.file_path]);

            if (storageError) {
                console.warn('⚠️ Warning: Could not delete file from storage:', storageError);
                // Continue with database deletion even if storage deletion fails
            } else {
                console.log('✅ File deleted from storage');
            }
        }

        // Delete the contract from the database
        console.log('🗃️ Deleting record from database...');
        const { error: deleteError } = await dbClient
            .from('contracts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Double check ownership

        if (deleteError) {
            console.error('❌ Error deleting contract from database:', deleteError);
            return NextResponse.json(
                { success: false, error: 'Failed to delete contract' },
                { status: 500 }
            );
        }

        console.log('✅ Contract deleted successfully');
        return NextResponse.json({ success: true, message: 'Contract deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('❌ Delete contract error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
