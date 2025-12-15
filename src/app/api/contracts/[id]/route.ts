import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching contract:', error);
            return NextResponse.json(
                { success: false, error: 'Contract not found' },
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

        // First, get the contract to find the file path
        const { data: contract, error: fetchError } = await supabase
            .from('contracts')
            .select('file_path')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('❌ Error fetching contract for deletion:', fetchError);
            return NextResponse.json(
                { success: false, error: 'Contract not found' },
                { status: 404 }
            );
        }

        console.log('📄 Contract found:', contract);

        // Delete the file from storage if it exists
        if (contract?.file_path) {
            console.log('🗂️ Deleting file from storage:', contract.file_path);
            const { error: storageError } = await supabase.storage
                .from('documents')  // Fixed: was 'contracts', should be 'documents'
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
        const { error: deleteError } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id);

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
