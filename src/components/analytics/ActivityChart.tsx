'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface ActivityChartProps {
    data: { day: string; completed: number; created: number }[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
    const { language } = useLanguage();

    // Find max value for scaling
    const maxValue = Math.max(...data.flatMap(d => [d.completed, d.created]), 1);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">⚡</span>
                <h3 className="text-white font-semibold">
                    {language === 'es' ? 'Actividad Semanal' : 'Weekly Activity'}
                </h3>
            </div>

            {/* Chart Area */}
            <div className="relative h-48 mb-4">
                <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <defs>
                        <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                        </linearGradient>
                        <linearGradient id="createdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                        <line
                            key={i}
                            x1="0"
                            y1={30 * i}
                            x2="400"
                            y2={30 * i}
                            stroke="#27272a"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Completed area */}
                    <path
                        d={`
                            M 0 150
                            ${data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 400;
                            const y = 150 - (d.completed / maxValue) * 130;
                            return `L ${x} ${y}`;
                        }).join(' ')}
                            L 400 150
                            Z
                        `}
                        fill="url(#completedGradient)"
                    />

                    {/* Completed line */}
                    <path
                        d={`
                            M ${0} ${150 - (data[0]?.completed / maxValue) * 130}
                            ${data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 400;
                            const y = 150 - (d.completed / maxValue) * 130;
                            return `L ${x} ${y}`;
                        }).join(' ')}
                        `}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Created line (dashed) */}
                    <path
                        d={`
                            M ${0} ${150 - (data[0]?.created / maxValue) * 130}
                            ${data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 400;
                            const y = 150 - (d.created / maxValue) * 130;
                            return `L ${x} ${y}`;
                        }).join(' ')}
                        `}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points for completed */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 400;
                        const y = 150 - (d.completed / maxValue) * 130;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#10b981"
                                stroke="#09090b"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between px-2">
                {data.map((d, i) => (
                    <span key={i} className="text-xs text-zinc-500">{d.day}</span>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-zinc-400">
                        {language === 'es' ? 'Completadas' : 'Completed'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs text-zinc-400">
                        {language === 'es' ? 'Creadas' : 'Created'}
                    </span>
                </div>
            </div>
        </div>
    );
}
