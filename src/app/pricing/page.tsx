'use client';

import { Check, Zap, Building2, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PricingPage() {
    const { language } = useLanguage();

    const t = {
        back: language === 'es' ? 'Volver al Inicio' : 'Back to Home',
        title: language === 'es' ? 'Planes y Precios' : 'Plans & Pricing',
        subtitle: language === 'es'
            ? 'Elige el plan que mejor se adapte a tus necesidades. Sin sorpresas, sin costes ocultos.'
            : 'Choose the plan that best fits your needs. No surprises, no hidden costs.',
        monthly: language === 'es' ? '/mes' : '/month',
        getStarted: language === 'es' ? 'Comenzar Gratis' : 'Get Started Free',
        upgrade: language === 'es' ? 'Próximamente' : 'Coming Soon',
        contactSales: language === 'es' ? 'Contactar Ventas' : 'Contact Sales',
        popular: language === 'es' ? 'Más Popular' : 'Most Popular',

        // Plans
        freePlan: language === 'es' ? 'Gratuito' : 'Free',
        freeDesc: language === 'es' ? 'Perfecto para empezar' : 'Perfect to get started',
        proPlan: 'Pro',
        proDesc: language === 'es' ? 'Para profesionales y equipos pequeños' : 'For professionals and small teams',
        enterprisePlan: 'Enterprise',
        enterpriseDesc: language === 'es' ? 'Solución completa para grandes organizaciones' : 'Complete solution for large organizations',

        // Features
        freeFeatures: language === 'es' ? [
            '5 documentos al mes',
            'Análisis con IA básico',
            'Exportación a Excel',
            'Soporte por email',
        ] : [
            '5 documents per month',
            'Basic AI analysis',
            'Excel export',
            'Email support',
        ],
        proFeatures: language === 'es' ? [
            'Documentos ilimitados',
            'Análisis con IA avanzado',
            'Alertas de renovación',
            'Chat con documentos',
            'Plantillas personalizadas',
            'Soporte prioritario',
        ] : [
            'Unlimited documents',
            'Advanced AI analysis',
            'Renewal alerts',
            'Chat with documents',
            'Custom templates',
            'Priority support',
        ],
        enterpriseFeatures: language === 'es' ? [
            'Todo en Pro',
            'SSO (SAML/OIDC)',
            'Workspaces multi-equipo',
            'API dedicada',
            'SLA garantizado',
            'Onboarding personalizado',
            'Facturación anual',
        ] : [
            'Everything in Pro',
            'SSO (SAML/OIDC)',
            'Multi-team workspaces',
            'Dedicated API',
            'Guaranteed SLA',
            'Personalized onboarding',
            'Annual billing',
        ],

        faq: language === 'es' ? '¿Tienes preguntas?' : 'Have questions?',
        faqText: language === 'es'
            ? 'Contáctanos en solutionsysn@gmail.com y te responderemos en menos de 24 horas.'
            : 'Contact us at solutionsysn@gmail.com and we\'ll respond within 24 hours.',
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    {t.back}
                </Link>

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-4">
                        {t.title}
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        {t.subtitle}
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

                    {/* Free Plan */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col hover:border-white/20 transition-all">
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-zinc-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{t.freePlan}</h3>
                            <p className="text-zinc-500 text-sm">{t.freeDesc}</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">€0</span>
                            <span className="text-zinc-500">{t.monthly}</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {t.freeFeatures.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/signup"
                            className="w-full py-3 rounded-xl bg-zinc-800 text-white font-semibold text-center hover:bg-zinc-700 transition-colors"
                        >
                            {t.getStarted}
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border-2 border-emerald-500/30 rounded-2xl p-8 flex flex-col relative scale-105 shadow-[0_0_60px_-20px_rgba(16,185,129,0.3)]">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                {t.popular}
                            </span>
                        </div>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{t.proPlan}</h3>
                            <p className="text-zinc-500 text-sm">{t.proDesc}</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">€29</span>
                            <span className="text-zinc-500">{t.monthly}</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {t.proFeatures.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            disabled
                            className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold text-center cursor-not-allowed opacity-70"
                        >
                            {t.upgrade}
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col hover:border-white/20 transition-all">
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Building2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{t.enterprisePlan}</h3>
                            <p className="text-zinc-500 text-sm">{t.enterpriseDesc}</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">{language === 'es' ? 'A medida' : 'Custom'}</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {t.enterpriseFeatures.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <a
                            href="mailto:solutionsysn@gmail.com?subject=Enterprise%20Inquiry"
                            className="w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 font-semibold text-center hover:bg-purple-500/30 transition-colors"
                        >
                            {t.contactSales}
                        </a>
                    </div>
                </div>

                {/* FAQ CTA */}
                <div className="mt-16 text-center">
                    <p className="text-zinc-400">
                        {t.faq} <a href="mailto:solutionsysn@gmail.com" className="text-emerald-400 hover:underline">solutionsysn@gmail.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
