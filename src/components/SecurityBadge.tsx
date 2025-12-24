'use client';

import { Shield, Lock, MapPin, Server } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

interface SecurityBadgeProps {
    variant?: 'minimal' | 'detailed';
    className?: string;
}

/**
 * Security Badge Component
 * Shows users that their data is protected
 * Use in dashboard, analysis results, and document views
 */
export default function SecurityBadge({ variant = 'minimal', className = '' }: SecurityBadgeProps) {
    const { language } = useLanguage();
    const isSpanish = language === 'es';

    if (variant === 'minimal') {
        return (
            <Link
                href="/security"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors ${className}`}
            >
                <Lock className="w-3 h-3" />
                <span>{isSpanish ? 'Datos cifrados AES-256' : 'AES-256 encrypted'}</span>
                <span className="text-emerald-500">•</span>
                <MapPin className="w-3 h-3" />
                <span>EU</span>
            </Link>
        );
    }

    return (
        <div className={`p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">
                    {isSpanish ? 'Tus datos están protegidos' : 'Your data is protected'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>{isSpanish ? 'Cifrado AES-256' : 'AES-256 encryption'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>Frankfurt, EU</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400 text-lg">🇪🇺</span>
                    <span>{isSpanish ? 'RGPD Nativo' : 'Native GDPR'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-purple-400">🚫</span>
                    <span>{isSpanish ? 'Sin entrenamiento IA' : 'No AI training'}</span>
                </div>
            </div>

            <Link
                href="/security"
                className="mt-3 inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
                {isSpanish ? 'Ver Centro de Confianza →' : 'View Trust Center →'}
            </Link>
        </div>
    );
}
