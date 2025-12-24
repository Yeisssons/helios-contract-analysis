import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { APP_CONFIG } from '@/config/constants';

interface UsageData {
    used: number;
    limit: number;
    plan: string;
    isNearLimit: boolean;
    isAtLimit: boolean;
    loading: boolean;
}

export function useDocumentUsage() {
    const { user } = useAuth();
    const [data, setData] = useState<UsageData>({
        used: 0,
        limit: 5,
        plan: 'free',
        isNearLimit: false,
        isAtLimit: false,
        loading: true
    });

    useEffect(() => {
        let mounted = true;

        const fetchUsage = async () => {
            if (!user) {
                if (mounted) setData(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                // 1. Get Plan
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_tier')
                    .eq('id', user.id)
                    .single();

                const plan = profile?.plan_tier || 'free';
                const limit = APP_CONFIG.PLANS[plan as keyof typeof APP_CONFIG.PLANS]?.documents || 5;

                // 2. Count Documents this Month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

                const { count } = await supabase
                    .from('contracts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('created_at', startOfMonth);

                const used = count || 0;
                const percentage = (used / limit) * 100;

                if (mounted) {
                    setData({
                        used,
                        limit,
                        plan,
                        isNearLimit: percentage >= 80 && used < limit, // 80% used but not full
                        isAtLimit: used >= limit,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching usage:', error);
                if (mounted) setData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchUsage();

        // Optional: Subscription to realtime changes could go here

        return () => { mounted = false; };
    }, [user]);

    return data;
}
