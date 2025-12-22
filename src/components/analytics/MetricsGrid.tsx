'use client';

import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MetricsGridProps {
    totalDocuments: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
    tasksPerDocument: number;
}

export default function MetricsGrid({
    totalDocuments,
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate,
    tasksPerDocument,
}: MetricsGridProps) {
    const { language } = useLanguage();

    const metrics = [
        {
            label: language === 'es' ? 'Documentos Analizados' : 'Documents Analyzed',
            value: totalDocuments,
            icon: FileText,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
        {
            label: language === 'es' ? 'Tareas Totales' : 'Total Tasks',
            value: totalTasks,
            icon: Users,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
        {
            label: language === 'es' ? 'Completadas' : 'Completed',
            value: completedTasks,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
        },
        {
            label: language === 'es' ? 'Pendientes' : 'Pending',
            value: pendingTasks,
            icon: Clock,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
        },
        {
            label: language === 'es' ? 'Tasa de Completado' : 'Completion Rate',
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: completionRate >= 70 ? 'text-emerald-400' : completionRate >= 40 ? 'text-yellow-400' : 'text-red-400',
            bgColor: completionRate >= 70 ? 'bg-emerald-500/10' : completionRate >= 40 ? 'bg-yellow-500/10' : 'bg-red-500/10',
            trend: completionRate >= 50 ? 'up' : 'down',
        },
        {
            label: language === 'es' ? 'Tareas/Documento' : 'Tasks/Document',
            value: tasksPerDocument,
            icon: AlertCircle,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                    <div
                        key={index}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-zinc-500 uppercase tracking-wide">
                                {metric.label}
                            </span>
                            <div className={`p-1.5 rounded-lg ${metric.bgColor}`}>
                                <Icon className={`w-4 h-4 ${metric.color}`} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className={`text-2xl font-bold ${metric.color}`}>
                                {metric.value}
                            </span>
                            {metric.trend && (
                                <span className={`text-xs ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {metric.trend === 'up' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
