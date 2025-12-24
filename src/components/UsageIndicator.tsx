'use client';

import { useDocumentUsage } from '@/hooks/useDocumentUsage';
import { FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function UsageIndicator() {
    const { used, limit, plan, isAtLimit, isNearLimit, loading } = useDocumentUsage();

    if (loading) return null;

    const percentage = Math.min((used / limit) * 100, 100);
    const remaining = limit - used;

    // Determine status color
    const getStatusColor = () => {
        if (isAtLimit) return 'from-red-500 to-rose-500';
        if (isNearLimit) return 'from-amber-500 to-orange-500';
        return 'from-emerald-500 to-teal-500';
    };

    const getStatusTextColor = () => {
        if (isAtLimit) return 'text-red-400';
        if (isNearLimit) return 'text-amber-400';
        return 'text-emerald-400';
    };

    const getStatusBgColor = () => {
        if (isAtLimit) return 'bg-red-500/10 border-red-500/20';
        if (isNearLimit) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-emerald-500/10 border-emerald-500/20';
    };

    return (
        <div className={`hidden lg:flex items-center gap-4 px-4 py-2.5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${getStatusBgColor()}`}>
            {/* Icon */}
            <div className={`p-2 rounded-xl bg-gradient-to-br ${getStatusColor()} shadow-lg`}>
                <FileText className="w-4 h-4 text-white" />
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
                <span className="text-[11px] uppercase text-zinc-400 font-medium tracking-wide">
                    {plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Enterprise'}
                </span>
                <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-bold ${getStatusTextColor()}`}>
                        {used}
                    </span>
                    <span className="text-sm text-zinc-500">/</span>
                    <span className="text-sm text-zinc-400 font-medium">{limit}</span>
                </div>
            </div>

            {/* Circular Progress */}
            <div className="relative w-10 h-10">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                        className="text-zinc-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        r="15"
                        cx="18"
                        cy="18"
                    />
                    <circle
                        className={getStatusTextColor()}
                        strokeWidth="3"
                        strokeDasharray={`${percentage}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        r="15"
                        cx="18"
                        cy="18"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-[10px] font-bold ${getStatusTextColor()}`}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>

            {/* Upgrade Button (only show when at limit on free plan) */}
            {isAtLimit && plan === 'free' && (
                <Link
                    href="/pricing"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
                >
                    <Sparkles className="w-3 h-3" />
                    Pro
                </Link>
            )}
        </div>
    );
}
