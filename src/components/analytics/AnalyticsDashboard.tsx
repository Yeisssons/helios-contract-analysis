'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import MetricsGrid from './MetricsGrid';
import ActivityChart from './ActivityChart';
import ProductivityGauge from './ProductivityGauge';
import InsightsPanel from './InsightsPanel';
import { SectorChart, PriorityChart } from './Charts';
import { Loader2, RefreshCw } from 'lucide-react';

interface AnalyticsData {
    totalDocuments: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completionRate: number;
    tasksPerDocument: number;
    productivityScore: number;
    weeklyActivity: { day: string; completed: number; created: number }[];
    documentsBySector: { sector: string; count: number }[];
    tasksByPriority: { priority: string; count: number }[];
    insights: { type: 'warning' | 'success' | 'info' | 'danger'; title: string; message: string }[];
}

export default function AnalyticsDashboard() {
    const { session } = useAuth();
    const { language } = useLanguage();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async (isRefresh = false) => {
        if (!session?.access_token) return;

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await fetch('/api/analytics', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await response.json();

            if (!response.ok) {
                console.error('Analytics error:', result.error);
                return;
            }

            setData(result);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-400">
                    {language === 'es' ? 'No se pudieron cargar las métricas' : 'Could not load metrics'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Refresh button */}
            <div className="flex justify-end">
                <button
                    onClick={() => fetchAnalytics(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {language === 'es' ? 'Actualizar' : 'Refresh'}
                </button>
            </div>

            {/* Metrics Grid */}
            <MetricsGrid
                totalDocuments={data.totalDocuments}
                totalTasks={data.totalTasks}
                completedTasks={data.completedTasks}
                pendingTasks={data.pendingTasks}
                completionRate={data.completionRate}
                tasksPerDocument={data.tasksPerDocument}
            />

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityChart data={data.weeklyActivity} />
                </div>
                <div>
                    <ProductivityGauge score={data.productivityScore} />
                </div>
            </div>

            {/* Secondary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SectorChart data={data.documentsBySector} />
                <PriorityChart data={data.tasksByPriority} />
                <InsightsPanel insights={data.insights} />
            </div>
        </div>
    );
}
