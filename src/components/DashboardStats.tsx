'use client';

import { useMemo } from 'react';
import { ContractData } from '@/types/contract';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Activity,
    AlertTriangle,
    Calendar,
    FileText,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
    contracts: ContractData[];
}

export default function DashboardStats({ contracts }: DashboardStatsProps) {
    const { t } = useLanguage();

    const stats = useMemo(() => {
        const total = contracts.length;
        // riskScore might be numeric or optional in ContractData
        const highRisk = contracts.filter(c => (c.riskScore || 0) >= 7).length;
        const mediumRisk = contracts.filter(c => (c.riskScore || 0) >= 4 && (c.riskScore || 0) < 7).length;

        // Expiring in 30 days
        const now = new Date();
        const thirtyDaysInfo = new Date();
        thirtyDaysInfo.setDate(thirtyDaysInfo.getDate() + 30);

        const expiringSoon = contracts.filter(c => {
            if (!c.renewalDate) return false;
            const date = new Date(c.renewalDate);
            return date >= now && date <= thirtyDaysInfo;
        }).length;

        // Sector Distribution (Top 3)
        const sectors: Record<string, number> = {};
        contracts.forEach(c => {
            const s = c.sector || 'Unclassified';
            sectors[s] = (sectors[s] || 0) + 1;
        });
        const topSectors = Object.entries(sectors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return { total, highRisk, mediumRisk, expiringSoon, topSectors };
    }, [contracts]);

    const cards = [
        {
            label: 'Total Contracts',
            value: stats.total,
            icon: FileText,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            desc: 'Stored in vault'
        },
        {
            label: 'High Risk',
            value: stats.highRisk,
            icon: ShieldAlert,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            desc: 'Immediate attention'
        },
        {
            label: 'Expiring Soon',
            value: stats.expiringSoon,
            icon: Calendar,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            desc: 'Next 30 days'
        }
    ];

    if (contracts.length === 0) return null;

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-4 text-white/90 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                {t('dashboardOverview') || 'Overview'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl hover:border-slate-600 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-sm">{card.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
                                <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
                            </div>
                            <div className={cn("p-2 rounded-lg", card.bg)}>
                                <card.icon className={cn("w-6 h-6", card.color)} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Simple Visual Bar for Risk Distribution */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Risk Distribution</span>
                    <span className="text-xs text-slate-500">{stats.highRisk + stats.mediumRisk} flags detected</span>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                        style={{ width: `${(stats.highRisk / stats.total) * 100}%` }}
                        className="h-full bg-red-500/80 transition-all duration-1000"
                        title="High Risk"
                    />
                    <div
                        style={{ width: `${(stats.mediumRisk / stats.total) * 100}%` }}
                        className="h-full bg-amber-500/80 transition-all duration-1000"
                        title="Medium Risk"
                    />
                    <div
                        style={{ width: `${((stats.total - stats.highRisk - stats.mediumRisk) / stats.total) * 100}%` }}
                        className="h-full bg-emerald-500/80 transition-all duration-1000"
                        title="Low Risk"
                    />
                </div>
            </div>
        </div>
    );
}
