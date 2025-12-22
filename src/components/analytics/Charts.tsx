'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface SectorChartProps {
    data: { sector: string; count: number }[];
}

interface PriorityChartProps {
    data: { priority: string; count: number }[];
}

// Donut chart for sectors
export function SectorChart({ data }: SectorChartProps) {
    const { language } = useLanguage();

    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">
                    {language === 'es' ? 'Por Categoría' : 'By Category'}
                </h3>
                <p className="text-zinc-500 text-sm">
                    {language === 'es' ? 'Sin datos disponibles' : 'No data available'}
                </p>
            </div>
        );
    }

    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    // Calculate segments
    let currentAngle = 0;
    const segments = data.map((d, i) => {
        const percentage = d.count / total;
        const angle = percentage * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        return {
            ...d,
            percentage,
            startAngle,
            endAngle: currentAngle,
            color: colors[i % colors.length],
        };
    });

    // Create SVG arc path
    const createArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;

        const x1 = 70 + outerRadius * Math.cos(startRad);
        const y1 = 70 + outerRadius * Math.sin(startRad);
        const x2 = 70 + outerRadius * Math.cos(endRad);
        const y2 = 70 + outerRadius * Math.sin(endRad);
        const x3 = 70 + innerRadius * Math.cos(endRad);
        const y3 = 70 + innerRadius * Math.sin(endRad);
        const x4 = 70 + innerRadius * Math.cos(startRad);
        const y4 = 70 + innerRadius * Math.sin(startRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">
                {language === 'es' ? 'Por Categoría' : 'By Category'}
            </h3>

            <div className="flex items-center gap-6">
                <div className="w-32 h-32 flex-shrink-0">
                    <svg viewBox="0 0 140 140" className="w-full h-full">
                        {segments.map((seg, i) => (
                            <path
                                key={i}
                                d={createArc(seg.startAngle, seg.endAngle, 35, 55)}
                                fill={seg.color}
                                className="transition-opacity hover:opacity-80"
                            />
                        ))}
                        {/* Center circle */}
                        <circle cx="70" cy="70" r="30" fill="#09090b" />
                    </svg>
                </div>

                <div className="flex-1 space-y-2">
                    {segments.slice(0, 4).map((seg, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-xs text-zinc-400 truncate flex-1">
                                {seg.sector}
                            </span>
                            <span className="text-xs text-zinc-500">
                                {seg.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Bar chart for priority
export function PriorityChart({ data }: PriorityChartProps) {
    const { language } = useLanguage();

    const maxCount = Math.max(...data.map(d => d.count), 1);

    const priorityLabels: Record<string, { es: string; en: string; color: string }> = {
        low: { es: 'Baja', en: 'Low', color: '#71717a' },
        medium: { es: 'Media', en: 'Medium', color: '#f59e0b' },
        high: { es: 'Alta', en: 'High', color: '#f97316' },
        urgent: { es: 'Urgente', en: 'Urgent', color: '#ef4444' },
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">
                {language === 'es' ? 'Por Prioridad' : 'By Priority'}
            </h3>

            <div className="space-y-3">
                {data.map((d, i) => {
                    const config = priorityLabels[d.priority] || { es: d.priority, en: d.priority, color: '#71717a' };
                    const percentage = (d.count / maxCount) * 100;

                    return (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">
                                    {language === 'es' ? config.es : config.en}
                                </span>
                                <span className="text-zinc-500">{d.count}</span>
                            </div>
                            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: config.color,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
