import { useDocumentUsage } from '@/hooks/useDocumentUsage';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UsageIndicator() {
    const { used, limit, plan, isAtLimit, isNearLimit, loading } = useDocumentUsage();

    if (loading) return null;

    const percentage = Math.min((used / limit) * 100, 100);

    return (
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/5">
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider leading-none mb-1">
                    Docs {new Date().toLocaleDateString('default', { month: 'short' })}
                </span>
                <div className="flex items-center gap-1.5 leading-none">
                    <span className={`text-xs font-bold ${isAtLimit ? 'text-red-400' : 'text-white'}`}>
                        {used}
                    </span>
                    <span className="text-[10px] text-zinc-600">/</span>
                    <span className="text-[10px] text-zinc-500">{limit}</span>
                </div>
            </div>

            {/* Circular Progress or Simple Bar */}
            <div className="w-1.5 h-8 bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                    className={`absolute bottom-0 left-0 w-full transition-all duration-500 ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                    style={{ height: `${percentage}%` }}
                />
            </div>

            {isAtLimit && plan === 'free' && (
                <Link
                    href="/pricing"
                    className="ml-1 p-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Upgrade to Pro"
                >
                    <AlertCircle className="w-3 h-3" />
                </Link>
            )}
        </div>
    );
}
