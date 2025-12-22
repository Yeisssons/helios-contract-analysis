'use client';

import { AlertTriangle, TrendingUp, FileText, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Insight {
    type: 'warning' | 'success' | 'info' | 'danger';
    title: string;
    message: string;
}

interface InsightsPanelProps {
    insights: Insight[];
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
    const { language } = useLanguage();

    const getInsightStyle = (type: string) => {
        switch (type) {
            case 'warning':
                return {
                    icon: AlertTriangle,
                    iconColor: 'text-yellow-400',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/20',
                };
            case 'success':
                return {
                    icon: TrendingUp,
                    iconColor: 'text-emerald-400',
                    bgColor: 'bg-emerald-500/10',
                    borderColor: 'border-emerald-500/20',
                };
            case 'danger':
                return {
                    icon: AlertTriangle,
                    iconColor: 'text-red-400',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/20',
                };
            default:
                return {
                    icon: FileText,
                    iconColor: 'text-blue-400',
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/20',
                };
        }
    };

    if (insights.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-semibold">
                        {language === 'es' ? 'Insights IA' : 'AI Insights'}
                    </h3>
                </div>
                <p className="text-zinc-500 text-sm">
                    {language === 'es'
                        ? 'Los insights aparecerán aquí cuando haya suficiente actividad.'
                        : 'Insights will appear here when there is enough activity.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-semibold">
                    {language === 'es' ? 'Insights IA' : 'AI Insights'}
                </h3>
            </div>

            <div className="space-y-3">
                {insights.map((insight, index) => {
                    const style = getInsightStyle(insight.type);
                    const Icon = style.icon;

                    return (
                        <div
                            key={index}
                            className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
                                <div>
                                    <p className="text-white font-medium text-sm">
                                        {insight.title}
                                    </p>
                                    <p className="text-zinc-400 text-sm mt-0.5">
                                        {insight.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
