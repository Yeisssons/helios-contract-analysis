'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Shield, FileText, ExternalLink } from 'lucide-react';

export default function Footer() {
    const { language } = useLanguage();
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            es: {
                copyright: '© 2024 YSN Legal Platform. Todos los derechos reservados.',
                security: 'Centro de Seguridad',
                privacy: 'Políticas y Privacidad',
                terms: 'Términos de Servicio',
                contact: 'Contacto',
                poweredBy: 'Impulsado por',
            },
            en: {
                copyright: '© 2024 YSN Legal Platform. All rights reserved.',
                security: 'Security Center',
                privacy: 'Policies & Privacy',
                terms: 'Terms of Service',
                contact: 'Contact',
                poweredBy: 'Powered by',
            }
        };
        return translations[language]?.[key] || translations['en'][key];
    };

    return (
        <footer className="w-full border-t border-white/5 mt-auto bg-black/40 backdrop-blur-lg z-10 relative">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="font-light">{t('copyright')}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {t('contact')}
                        </Link>
                        <Link href="/policies" className="hover:text-white transition-colors flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            {t('privacy')}
                        </Link>
                        <Link href="/pricing" className="hover:text-white transition-colors flex items-center gap-1.5">
                            <span className="font-semibold">$</span>
                            {language === 'es' ? 'Precios' : 'Pricing'}
                        </Link>
                        <Link href="/security" className="hover:text-white transition-colors flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            {t('security')}
                        </Link>

                        <p className="flex items-center gap-1.5 pl-6 border-l border-white/10 hidden md:flex">
                            {t('poweredBy')}
                            <span className="font-semibold text-emerald-500 tracking-wide">YSN Solutions</span>
                        </p>
                    </div>

                </div>
            </div>
        </footer>
    );
}
