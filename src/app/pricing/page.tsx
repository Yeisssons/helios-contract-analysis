'use client';

import { useState } from 'react';
import {
    Check, X, Zap, Building2, ArrowLeft, Sparkles, Loader2,
    Shield, Lock, Database, FileText, MessageCircle, Clock,
    HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const STRIPE_PRICE_ID_PRO = 'price_1Qvn5P2eZvKYlo2CLpM';

export default function PricingPage() {
    const { language } = useLanguage();
    const { user, session } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleCheckout = async (priceId: string) => {
        if (!user) {
            toast.error(language === 'es' ? 'Inicia sesión para continuar' : 'Please login to continue');
            router.push('/login?redirect=/pricing');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`,
                },
                body: JSON.stringify({
                    priceId,
                    redirectUrl: window.location.origin + '/dashboard',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Checkout error:', data);
                toast.error(language === 'es' ? 'Error al iniciar pago' : 'Failed to start payment');
                setLoading(false);
                return;
            }

            window.location.href = data.url;

        } catch (error) {
            console.error('Checkout exception:', error);
            toast.error(language === 'es' ? 'Error de conexión' : 'Connection error');
            setLoading(false);
        }
    };

    const isSpanish = language === 'es';

    const t = {
        back: isSpanish ? 'Volver al Inicio' : 'Back to Home',
        title: isSpanish ? 'Planes y Precios' : 'Plans & Pricing',
        subtitle: isSpanish
            ? 'Elige el plan que mejor se adapte a tus necesidades. Sin sorpresas, sin costes ocultos.'
            : 'Choose the plan that best fits your needs. No surprises, no hidden costs.',
        monthly: isSpanish ? '/mes' : '/month',
        getStarted: isSpanish ? 'Comenzar Gratis' : 'Get Started Free',
        upgrade: isSpanish ? 'Obtener Pro' : 'Get Pro',
        upgradeProcessing: isSpanish ? 'Procesando...' : 'Processing...',
        contactSales: isSpanish ? 'Contactar Ventas' : 'Contact Sales',
        popular: isSpanish ? 'Más Popular' : 'Most Popular',
        freePlan: isSpanish ? 'Gratuito' : 'Free',
        freeDesc: isSpanish ? 'Perfecto para empezar' : 'Perfect to get started',
        proPlan: 'Pro',
        proDesc: isSpanish ? 'Para profesionales y equipos pequeños' : 'For professionals and small teams',
        enterprisePlan: 'Enterprise',
        enterpriseDesc: isSpanish ? 'Solución completa para grandes organizaciones' : 'Complete solution for large organizations',
        freeFeatures: isSpanish ? [
            '5 documentos al mes',
            'IA: Gemini 2.5 Flash',
            'Exportación a Excel',
            'Soporte por email',
        ] : [
            '5 documents per month',
            'AI: Gemini 2.5 Flash',
            'Excel export',
            'Email support',
        ],
        proFeatures: isSpanish ? [
            '100 documentos al mes',
            'IA: Gemini 3 Flash (Premium)',
            'Alertas de renovación',
            'Chat con documentos',
            'Equipos (5 miembros)',
            'Soporte prioritario',
        ] : [
            '100 documents per month',
            'AI: Gemini 3 Flash (Premium)',
            'Renewal alerts',
            'Chat with documents',
            'Teams (5 members)',
            'Priority support',
        ],
        enterpriseFeatures: isSpanish ? [
            'Documentos ilimitados',
            'IA: GPT-5, Claude, Gemini Pro',
            'Miembros ilimitados',
            'SSO (SAML/OIDC)',
            'API dedicada',
            'SLA garantizado 99.5%',
            'Onboarding personalizado',
        ] : [
            'Unlimited documents',
            'AI: GPT-5, Claude, Gemini Pro',
            'Unlimited members',
            'SSO (SAML/OIDC)',
            'Dedicated API',
            'Guaranteed 99.5% SLA',
            'Personalized onboarding',
        ],
    };

    // Comparison table data
    const comparisonRows = [
        {
            feature: isSpanish ? 'Entrenamiento con tus datos' : 'Training with your data',
            helios: { value: isSpanish ? 'NUNCA' : 'NEVER', positive: true },
            publicAI: { value: isSpanish ? 'Probable' : 'Likely', positive: false },
            manual: { value: 'N/A', positive: null },
        },
        {
            feature: isSpanish ? 'GDPR Nativo & DPA' : 'Native GDPR & DPA',
            helios: { value: isSpanish ? 'Sí (Firmado)' : 'Yes (Signed)', positive: true },
            publicAI: { value: isSpanish ? 'Gris / No claro' : 'Gray / Unclear', positive: false },
            manual: { value: isSpanish ? 'Depende del humano' : 'Depends on human', positive: null },
        },
        {
            feature: isSpanish ? 'Aislamiento de Datos (RLS)' : 'Data Isolation (RLS)',
            helios: { value: 'Row-Level Security', positive: true },
            publicAI: { value: isSpanish ? 'Base compartida' : 'Shared database', positive: false },
            manual: { value: isSpanish ? 'Archivos locales' : 'Local files', positive: null },
        },
        {
            feature: isSpanish ? 'Retención automática (30 días)' : 'Automatic retention (30 days)',
            helios: { value: isSpanish ? 'Sí' : 'Yes', positive: true },
            publicAI: { value: isSpanish ? 'Indefinido' : 'Indefinite', positive: false },
            manual: { value: 'N/A', positive: null },
        },
        {
            feature: isSpanish ? 'Análisis de riesgos con IA' : 'AI risk analysis',
            helios: { value: isSpanish ? 'Avanzado' : 'Advanced', positive: true },
            publicAI: { value: isSpanish ? 'Genérico' : 'Generic', positive: null },
            manual: { value: isSpanish ? 'Lento y costoso' : 'Slow & expensive', positive: false },
        },
    ];

    // FAQs
    const faqs = [
        {
            q: isSpanish ? '¿Qué modelo de IA usa Helios?' : 'What AI model does Helios use?',
            a: isSpanish
                ? 'Utilizamos modelos de última generación según tu plan: Gemini 2.5 Flash (gratis), Gemini 3 Flash (Pro), y acceso a GPT-5, Claude Sonnet 4.5 y Gemini 3 Pro para Enterprise.'
                : 'We use cutting-edge models based on your plan: Gemini 2.5 Flash (free), Gemini 3 Flash (Pro), and access to GPT-5, Claude Sonnet 4.5 and Gemini 3 Pro for Enterprise.',
        },
        {
            q: isSpanish ? '¿Mi información se usa para entrenar la IA?' : 'Is my data used to train the AI?',
            a: isSpanish
                ? 'Absolutamente no. Utilizamos APIs empresariales con garantías DPA (Data Processing Agreement). Tus documentos se procesan en tiempo real y se eliminan según tu configuración de retención. Nunca se utilizan para entrenamiento.'
                : 'Absolutely not. We use enterprise APIs with DPA (Data Processing Agreement) guarantees. Your documents are processed in real-time and deleted according to your retention settings. They are never used for training.',
        },
        {
            q: isSpanish ? '¿Qué diferencia hay entre los planes en cuanto a la IA?' : 'What\'s the difference between plans regarding AI?',
            a: isSpanish
                ? 'Gratuito: Gemini 2.5 Flash (5 docs/mes). Pro: Gemini 3 Flash (100 docs/mes). Enterprise: GPT-5, Claude Sonnet 4.5, Gemini 3 Pro (500+ docs/mes, configurable).'
                : 'Free: Gemini 2.5 Flash (5 docs/month). Pro: Gemini 3 Flash (100 docs/month). Enterprise: GPT-5, Claude Sonnet 4.5, Gemini 3 Pro (500+ docs/month, configurable).',
        },
        {
            q: isSpanish ? '¿Dónde se alojan mis datos?' : 'Where is my data hosted?',
            a: isSpanish
                ? 'Tus datos se procesan exclusivamente en servidores situados en la Unión Europea (Frankfurt) bajo estrictas normativas GDPR. Utilizamos cifrado AES-256 en reposo y TLS 1.3 en tránsito.'
                : 'Your data is processed exclusively on servers located in the European Union (Frankfurt) under strict GDPR regulations. We use AES-256 encryption at rest and TLS 1.3 in transit.',
        },
        {
            q: isSpanish ? '¿Qué pasa si cancelo mi suscripción?' : 'What happens if I cancel my subscription?',
            a: isSpanish
                ? 'Tus datos se eliminan permanentemente de nuestros servidores activos inmediatamente. Mantenemos logs de facturación por obligación legal, pero tu propiedad intelectual desaparece.'
                : 'Your data is permanently deleted from our active servers immediately. We maintain billing logs for legal obligation, but your intellectual property disappears.',
        },
        {
            q: isSpanish ? '¿Puedo exportar mis análisis?' : 'Can I export my analyses?',
            a: isSpanish
                ? 'Sí, todos los planes permiten exportar tus análisis a Excel. Eres dueño de tu información en todo momento.'
                : 'Yes, all plans allow you to export your analyses to Excel. You own your information at all times.',
        },
        {
            q: isSpanish ? '¿Cómo funciona la prueba gratuita?' : 'How does the free trial work?',
            a: isSpanish
                ? 'El plan Gratuito te permite analizar hasta 5 documentos al mes sin compromiso. No se requiere tarjeta de crédito para empezar.'
                : 'The Free plan allows you to analyze up to 5 documents per month with no commitment. No credit card required to start.',
        },
        {
            q: isSpanish ? '¿Puedo elegir qué modelo de IA usar?' : 'Can I choose which AI model to use?',
            a: isSpanish
                ? 'En el plan Enterprise, puedes configurar tu modelo preferido (Gemini, GPT, Claude) según tus necesidades específicas. Contacta con ventas para personalizar tu configuración.'
                : 'In the Enterprise plan, you can configure your preferred model (Gemini, GPT, Claude) according to your specific needs. Contact sales to customize your setup.',
        },
    ];

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-24">

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
                            className="w-full py-3 rounded-xl bg-zinc-800 text-white font-semibold text-center hover:bg-zinc-700 transition-colors block"
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
                            onClick={() => handleCheckout(STRIPE_PRICE_ID_PRO)}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t.upgradeProcessing}
                                </>
                            ) : (
                                t.upgrade
                            )}
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
                            <span className="text-4xl font-bold">{isSpanish ? 'A medida' : 'Custom'}</span>
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
                            className="w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 font-semibold text-center hover:bg-purple-500/30 transition-colors block"
                        >
                            {t.contactSales}
                        </a>
                    </div>
                </div>

                {/* ============ COMPARISON SECTION ============ */}
                <section className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">
                            {isSpanish ? 'Helios vs. El Resto' : 'Helios vs. The Rest'}
                        </h2>
                        <p className="text-zinc-400">
                            {isSpanish
                                ? '¿Por qué los profesionales del derecho nos eligen?'
                                : 'Why do legal professionals choose us?'}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left py-4 px-4 text-zinc-500 font-medium">
                                        {isSpanish ? 'Característica' : 'Feature'}
                                    </th>
                                    <th className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <span className="text-emerald-400 font-semibold">Helios</span>
                                        </div>
                                    </th>
                                    <th className="py-4 px-4 text-center text-zinc-500 font-medium">
                                        {isSpanish ? 'IAs Públicas (Gratis)' : 'Public AIs (Free)'}
                                    </th>
                                    <th className="py-4 px-4 text-center text-zinc-500 font-medium">
                                        {isSpanish ? 'Revisión Manual' : 'Manual Review'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonRows.map((row, i) => (
                                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-900/30">
                                        <td className="py-4 px-4 text-white flex items-center gap-2">
                                            {row.feature}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${row.helios.positive
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {row.helios.positive && <Check className="w-3 h-3" />}
                                                {row.helios.value}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-flex items-center gap-1 text-sm ${row.publicAI.positive === false
                                                ? 'text-red-400'
                                                : 'text-zinc-500'
                                                }`}>
                                                {row.publicAI.positive === false && <X className="w-3 h-3" />}
                                                {row.publicAI.value}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center text-zinc-500 text-sm">
                                            {row.manual.value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ============ PRIVACY FAQ SECTION ============ */}
                <section className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">
                            {isSpanish ? 'Preguntas Frecuentes sobre Privacidad' : 'Privacy FAQ'}
                        </h2>
                        <p className="text-zinc-400">
                            {isSpanish
                                ? 'Tu tranquilidad es nuestra prioridad'
                                : 'Your peace of mind is our priority'}
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/50 transition-colors"
                                >
                                    <span className="flex items-center gap-3 text-white font-medium">
                                        <HelpCircle className="w-5 h-5 text-emerald-400" />
                                        {faq.q}
                                    </span>
                                    {openFaq === i
                                        ? <ChevronUp className="w-5 h-5 text-zinc-400" />
                                        : <ChevronDown className="w-5 h-5 text-zinc-400" />
                                    }
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-5">
                                        <p className="text-zinc-400 pl-8">
                                            {faq.a}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ============ CTA SECTION ============ */}
                <section className="text-center">
                    <p className="text-zinc-400 mb-4">
                        {isSpanish ? '¿Aún tienes dudas?' : 'Still have questions?'}
                    </p>
                    <a
                        href="mailto:solutionsysn@gmail.com"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {isSpanish ? 'Hablar con un Experto' : 'Talk to an Expert'}
                    </a>
                </section>
            </div>
        </div>
    );
}
