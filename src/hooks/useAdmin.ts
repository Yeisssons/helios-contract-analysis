'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ContractData } from '@/types/contract';

export interface AdminUser {
    id: string;
    email: string;
    created_at: string;
    role: string;
    contracts_count?: number;
}

export interface AdminContract {
    id: string;
    file_name: string;
    sector: string;
    user_id: string;
    user_email?: string;
    created_at: string;
    risk_score: number | null;
    extracted_data: Record<string, string | number | boolean | null>;
    effective_date: string | null;
    renewal_date: string | null;
}

export interface AdminStats {
    totalUsers: number;
    totalContracts: number;
    contractsThisMonth: number;
    activeTemplates: number;
}

export function useAdmin() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if current user is admin
    useEffect(() => {
        let isMounted = true;

        const checkAdmin = async () => {
            if (!user) {
                if (isMounted) {
                    setIsAdmin(false);
                    setLoading(false);
                }
                return;
            }

            try {
                // Check admin_users table
                const { data, error: dbError } = await supabase
                    .from('admin_users')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (dbError) {
                    console.error('Error checking admin status:', dbError);
                }

                if (isMounted) setIsAdmin(!!data);
            } catch (err) {
                console.error('Unexpected error checking admin status:', err);
                if (isMounted) setIsAdmin(false);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkAdmin();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // Get admin stats
    const getStats = useCallback(async (): Promise<AdminStats> => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            // Get total contracts count
            const { count: contractsCount, error: contractsError } = await supabase
                .from('contracts')
                .select('*', { count: 'exact', head: true });

            if (contractsError) throw contractsError;

            // Get contracts this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count: monthlyContracts, error: monthlyError } = await supabase
                .from('contracts')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString());

            if (monthlyError) throw monthlyError;

            // Get templates count
            const { count: templatesCount, error: templatesError } = await supabase
                .from('sector_templates')
                .select('*', { count: 'exact', head: true });

            if (templatesError) throw templatesError;

            return {
                totalUsers: 0, // We can't query auth.users directly from client
                totalContracts: contractsCount || 0,
                contractsThisMonth: monthlyContracts || 0,
                activeTemplates: templatesCount || 0,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown stats error';
            console.error('Error getting stats:', errorMessage);
            throw new Error(errorMessage);
        }
    }, [isAdmin]);

    // Get all contracts (admin only)
    const getAllContracts = useCallback(async (): Promise<AdminContract[]> => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            const { data, error: fetchError } = await supabase
                .from('contracts')
                .select('id, file_name, sector, user_id, created_at, risk_score, extracted_data, effective_date, renewal_date')
                .order('created_at', { ascending: false })
                .limit(100);

            if (fetchError) throw fetchError;
            return data || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown contracts fetch error';
            console.error('Error getting contracts:', errorMessage);
            throw new Error(errorMessage);
        }
    }, [isAdmin]);

    // Delete any contract (admin only)
    const deleteAnyContract = useCallback(async (contractId: string): Promise<void> => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            // Get contract info first
            const { data: contract, error: fetchError } = await supabase
                .from('contracts')
                .select('file_path')
                .eq('id', contractId)
                .single();

            if (fetchError) throw fetchError;

            // Delete from storage if file exists
            if (contract?.file_path) {
                const { error: storageError } = await supabase.storage
                    .from('documents')
                    .remove([contract.file_path]);

                if (storageError) console.error('Error deleting file from storage:', storageError);
            }

            // Delete from database
            const { error: deleteError } = await supabase
                .from('contracts')
                .delete()
                .eq('id', contractId);

            if (deleteError) throw deleteError;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown delete error';
            console.error('Error deleting contract:', errorMessage);
            throw new Error(errorMessage);
        }
    }, [isAdmin]);

    // Get recent activity
    const getRecentActivity = useCallback(async () => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            const { data, error: fetchError } = await supabase
                .from('contracts')
                .select('id, file_name, created_at, sector')
                .order('created_at', { ascending: false })
                .limit(10);

            if (fetchError) throw fetchError;

            return data || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown activity fetch error';
            console.error('Error getting activity:', errorMessage);
            throw new Error(errorMessage);
        }
    }, [isAdmin]);

    return {
        isAdmin,
        loading,
        error,
        getStats,
        getAllContracts,
        deleteAnyContract,
        getRecentActivity,
    };
}
