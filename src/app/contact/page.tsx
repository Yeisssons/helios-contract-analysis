'use client';

import { Mail, MapPin, Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
    const { language } = useLanguage();

    const t = {
        title: language === 'es' ? 'Contacto & Soporte' : 'Contact & Support',
        subtitle: language === 'es'
            ? '¿Tienes preguntas sobre nuestra plataforma? Estamos aquí para ayudarte. Contáctanos directamente y te responderemos en menos de 24 horas.'
            : 'Have questions about our platform? We\'re here to help. Contact us directly and we\'ll respond within 24 hours.',
        emailTitle: language === 'es' ? 'Correo Electrónico' : 'Email',
        emailDesc: language === 'es' ? 'Para soporte general, ventas y consultas.' : 'For general support, sales and inquiries.',
        officeTitle: language === 'es' ? 'Oficina Central' : 'Headquarters',
        officeDesc: 'YSN Solutions HQ',
        location: 'Vila-real, España',
        appointment: language === 'es' ? 'Atención presencial solo con cita previa' : 'In-person visits by appointment only',
        back: language === 'es' ? 'Volver al Inicio' : 'Back to Home',
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    {t.back}
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-4">
                        {t.title}
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Card */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-emerald-500/30 transition-all group">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Mail className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{t.emailTitle}</h3>
                        <p className="text-zinc-400 mb-6">{t.emailDesc}</p>
                        <a href="mailto:solutionsysn@gmail.com" className="text-xl text-emerald-400 font-mono hover:underline">
                            solutionsysn@gmail.com
                        </a>
                    </div>

                    {/* Office Card */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-blue-500/30 transition-all group">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Building2 className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{t.officeTitle}</h3>
                        <p className="text-zinc-400 mb-6">{t.officeDesc}</p>
                        <div className="text-zinc-300">
                            <p>{t.location}</p>
                            <p className="text-sm text-zinc-500 mt-2">{t.appointment}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

