'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
    Activity, Filter, Download, Calendar, User, Zap, ArrowLeft,
    TrendingUp, Users, Brain
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';

interface ActivityLog {
    id: string;
    user_id: string;
    action_type: string;
    agent_used: string | null;
    user_plan: string | null;
    metadata: Record<string, any>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    profiles: { email: string } | null;
}

interface LogsStats {
    totalActions: number;
    uniqueUsers: number;
    topAgent: string | null;
    planBreakdown: Record<string, number>;
    actionBreakdown: Record<string, number>;
}

export default function ActivityLogsPage() {
    const { isAdmin, loading: adminLoading } = useAdmin();
    const { language } = useLanguage();
    const router = useRouter();
    const isSpanish = language === 'es';

    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<LogsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [actionTypeFilter, setActionTypeFilter] = useState('');
    const [agentFilter, setAgentFilter] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 50;

    // Redirect non-admins
    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, adminLoading, router]);

    // Fetch logs
    useEffect(() => {
        if (!isAdmin) return;

        fetchLogs();
    }, [isAdmin, startDate, endDate, actionTypeFilter, agentFilter, page]);

    const fetchLogs = async () => {
        setLoading(true);

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (actionTypeFilter) params.append('actionType', actionTypeFilter);
        if (agentFilter) params.append('agentUsed', agentFilter);
        params.append('limit', pageSize.toString());
        params.append('offset', (page * pageSize).toString());

        try {
            const response = await fetch(`/api/admin/activity-logs?${params}`);
            const result = await response.json();

            if (result.success) {
                setLogs(result.data.logs);
                setStats(result.data.stats);
                setTotal(result.data.total);
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(isSpanish ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            user_login: 'bg-blue-500/20 text-blue-400',
            document_upload: 'bg-emerald-500/20 text-emerald-400',
            document_analysis: 'bg-purple-500/20 text-purple-400',
            plan_upgrade: 'bg-yellow-500/20 text-yellow-400',
            error: 'bg-red-500/20 text-red-400',
        };

        return colors[action] || 'bg-zinc-500/20 text-zinc-400';
    };

    if (adminLoading || !isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <Header />

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                <button
                    onClick={() => router.push('/admin')}
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {isSpanish ? 'Volver al Panel Admin' : 'Back to Admin Panel'}
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {isSpanish ? 'Registro de Actividad' : 'Activity Logs'}
                        </h1>
                        <p className="text-zinc-400">
                            {isSpanish ? 'Monitoreo de acciones de usuarios' : 'User activity monitoring'}
                        </p>
                    </div>
                </div>

                {/* Stats Dashboard */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <div className="text-sm text-zinc-400">{isSpanish ? 'Total Acciones' : 'Total Actions'}</div>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.totalActions.toLocaleString()}</div>
                        </div>

                        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <div className="text-sm text-zinc-400">{isSpanish ? 'Usuarios Únicos' : 'Unique Users'}</div>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.uniqueUsers.toLocaleString()}</div>
                        </div>

                        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Brain className="w-5 h-5 text-purple-400" />
                                <div className="text-sm text-zinc-400">{isSpanish ? 'Agente Más Usado' : 'Top Agent'}</div>
                            </div>
                            <div className="text-lg font-bold text-white truncate">
                                {stats.topAgent || 'N/A'}
                            </div>
                        </div>

                        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <div className="text-sm text-zinc-400">{isSpanish ? 'Plan Breakdown' : 'Plan Breakdown'}</div>
                            </div>
                            <div className="text-sm text-zinc-300 space-y-1">
                                <div>Free: {stats.planBreakdown.free || 0}</div>
                                <div>Pro: {stats.planBreakdown.pro || 0}</div>
                                <div>Enterprise: {stats.planBreakdown.enterprise || 0}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-semibold text-white">
                            {isSpanish ? 'Filtros' : 'Filters'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                {isSpanish ? 'Fecha Inicio' : 'Start Date'}
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                {isSpanish ? 'Fecha Fin' : 'End Date'}
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                {isSpanish ? 'Tipo de Acción' : 'Action Type'}
                            </label>
                            <select
                                value={actionTypeFilter}
                                onChange={(e) => setActionTypeFilter(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                            >
                                <option value="">{isSpanish ? 'Todas' : 'All'}</option>
                                <option value="user_login">Login</option>
                                <option value="document_upload">Upload</option>
                                <option value="document_analysis">Analysis</option>
                                <option value="plan_upgrade">Plan Upgrade</option>
                                <option value="error">Error</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                {isSpanish ? 'Agente IA' : 'AI Agent'}
                            </label>
                            <select
                                value={agentFilter}
                                onChange={(e) => setAgentFilter(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                            >
                                <option value="">{isSpanish ? 'Todos' : 'All'}</option>
                                <option value="gemini_2.5_flash">Gemini 2.5 Flash</option>
                                <option value="gemini_3_flash">Gemini 3 Flash</option>
                                <option value="gpt-5">GPT-5</option>
                                <option value="claude">Claude</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-800/50 border-b border-white/5">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                                        {isSpanish ? 'Fecha' : 'Date'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                                        {isSpanish ? 'Usuario' : 'User'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                                        {isSpanish ? 'Acción' : 'Action'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                                        {isSpanish ? 'Agente' : 'Agent'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                                        Plan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                                        IP
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                            {isSpanish ? 'Cargando...' : 'Loading...'}
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                            {isSpanish ? 'No se encontraron registros' : 'No logs found'}
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-4 py-3 text-sm text-zinc-300">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300">
                                                {log.profiles?.email || log.user_id.slice(0, 8) + '...'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action_type)}`}>
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-400">
                                                {log.agent_used || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-400">
                                                {log.user_plan || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-500 font-mono text-xs">
                                                {log.ip_address || '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {total > pageSize && (
                        <div className="px-4 py-4 border-t border-white/5 flex items-center justify-between">
                            <div className="text-sm text-zinc-400">
                                {isSpanish ? 'Mostrando' : 'Showing'} {page * pageSize + 1} - {Math.min((page + 1) * pageSize, total)} {isSpanish ? 'de' : 'of'} {total}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSpanish ? 'Anterior' : 'Previous'}
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={(page + 1) * pageSize >= total}
                                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSpanish ? 'Siguiente' : 'Next'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
