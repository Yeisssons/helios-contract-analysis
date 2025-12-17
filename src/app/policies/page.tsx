'use client';

import { Shield, Lock, FileText, Cookie, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PoliciesPage() {
    const { language } = useLanguage();

    const t = {
        back: language === 'es' ? 'Volver al Inicio' : 'Back to Home',
        title: language === 'es' ? 'Políticas y Legal' : 'Policies & Legal',
        lastUpdate: language === 'es' ? 'Última actualización: Diciembre 2024' : 'Last updated: December 2024',

        // Privacy
        privacyTitle: language === 'es' ? 'Política de Privacidad' : 'Privacy Policy',
        privacyIntro: language === 'es'
            ? 'En YSN Solutions, nos tomamos su privacidad muy en serio. Esta política describe cómo recopilamos, usamos y protegemos su información personal.'
            : 'At YSN Solutions, we take your privacy very seriously. This policy describes how we collect, use, and protect your personal information.',
        dataCollectionTitle: language === 'es' ? '1. Recopilación de Datos' : '1. Data Collection',
        dataCollectionText: language === 'es'
            ? 'Solo recopilamos los datos estrictamente necesarios para proporcionar nuestros servicios de análisis. Esto incluye documentos subidos (que son procesados de manera efímera) y datos de cuenta básicos.'
            : 'We only collect data strictly necessary to provide our analysis services. This includes uploaded documents (processed ephemerally) and basic account information.',
        dataUseTitle: language === 'es' ? '2. Uso de la Información' : '2. Use of Information',
        dataUseText: language === 'es'
            ? 'Sus documentos se utilizan exclusivamente para generar los análisis solicitados. No se utilizan para entrenar modelos de IA públicos ni se comparten con terceros no autorizados.'
            : 'Your documents are used exclusively to generate the requested analyses. They are not used to train public AI models or shared with unauthorized third parties.',

        // Cookies
        cookiesTitle: language === 'es' ? 'Política de Cookies' : 'Cookie Policy',
        cookiesIntro: language === 'es'
            ? 'Utilizamos cookies propias y de terceros para mejorar nuestros servicios.'
            : 'We use first-party and third-party cookies to improve our services.',
        essentialCookies: language === 'es'
            ? 'Cookies Esenciales: Necesarias para el funcionamiento técnico de la web (autenticación, seguridad).'
            : 'Essential Cookies: Required for the technical operation of the website (authentication, security).',
        analyticsCookies: language === 'es'
            ? 'Cookies Analíticas: Nos ayudan a entender cómo se usa la plataforma para mejorarla. Puede desactivarlas desde el panel de preferencias.'
            : 'Analytics Cookies: Help us understand how the platform is used to improve it. You can disable them from the preferences panel.',

        // Legal
        legalTitle: language === 'es' ? 'Aviso Legal' : 'Legal Notice',
        owner: language === 'es' ? 'Titular:' : 'Owner:',
        contact: language === 'es' ? 'Contacto:' : 'Contact:',
        address: language === 'es' ? 'Domicilio:' : 'Address:',
        copyright: language === 'es'
            ? 'El contenido de esta plataforma está protegido por derechos de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.'
            : 'The content of this platform is protected by intellectual property rights. Reproduction without express authorization is prohibited.',
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[0%] right-[0%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    {t.back}
                </Link>

                <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
                <p className="text-zinc-400 mb-12">{t.lastUpdate}</p>

                <div className="space-y-12">
                    {/* Privacy Section */}
                    <section id="privacidad" className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <Shield className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">{t.privacyTitle}</h2>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 space-y-4">
                            <p>
                                <strong>YSN Solutions</strong> — {t.privacyIntro}
                            </p>
                            <h3 className="text-white font-medium text-lg mt-4">{t.dataCollectionTitle}</h3>
                            <p>{t.dataCollectionText}</p>
                            <h3 className="text-white font-medium text-lg mt-4">{t.dataUseTitle}</h3>
                            <p>{t.dataUseText}</p>
                        </div>
                    </section>

                    {/* Cookies Section */}
                    <section id="cookies" className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Cookie className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">{t.cookiesTitle}</h2>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 space-y-4">
                            <p>{t.cookiesIntro}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>{t.essentialCookies.split(':')[0]}:</strong> {t.essentialCookies.split(':')[1]}</li>
                                <li><strong>{t.analyticsCookies.split(':')[0]}:</strong> {t.analyticsCookies.split(':')[1]}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Legal Section */}
                    <section id="legal" className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">{t.legalTitle}</h2>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 space-y-4">
                            <p>
                                <strong>{t.owner}</strong> YSN Solutions<br />
                                <strong>{t.contact}</strong> solutionsysn@gmail.com<br />
                                <strong>{t.address}</strong> Vila-real, España
                            </p>
                            <p>{t.copyright}</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
