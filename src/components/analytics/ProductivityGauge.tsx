'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface ProductivityGaugeProps {
    score: number; // 0-100
}

export default function ProductivityGauge({ score }: ProductivityGaugeProps) {
    const { language } = useLanguage();

    // Determine status text and color based on score
    const getStatus = () => {
        if (score >= 80) return { text: language === 'es' ? 'Excelente' : 'Excellent', color: '#10b981' };
        if (score >= 60) return { text: language === 'es' ? 'Buena' : 'Good', color: '#22c55e' };
        if (score >= 40) return { text: language === 'es' ? 'Moderada' : 'Moderate', color: '#eab308' };
        if (score >= 20) return { text: language === 'es' ? 'Baja' : 'Low', color: '#f97316' };
        return { text: language === 'es' ? 'Crítica' : 'Critical', color: '#ef4444' };
    };

    const status = getStatus();

    // Calculate stroke offset for the progress arc
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const offset = circumference - progress;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">⚡</span>
                <h3 className="text-white font-semibold">
                    {language === 'es' ? 'Productividad' : 'Productivity'}
                </h3>
            </div>

            <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                        {/* Background circle */}
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="#27272a"
                            strokeWidth="10"
                        />

                        {/* Progress arc */}
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke={status.color}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{
                                transition: 'stroke-dashoffset 0.5s ease-in-out',
                                filter: `drop-shadow(0 0 8px ${status.color}40)`,
                            }}
                        />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className="text-4xl font-bold"
                            style={{ color: status.color }}
                        >
                            {score}
                        </span>
                        <span className="text-xs text-zinc-500">/100</span>
                    </div>
                </div>

                <p className="mt-4 text-sm text-zinc-400">
                    {language === 'es' ? 'Productividad' : 'Productivity'}{' '}
                    <span style={{ color: status.color }}>{status.text.toLowerCase()}</span>
                </p>
            </div>
        </div>
    );
}
