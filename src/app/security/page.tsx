'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, Database, Server, FileText, CheckCircle, ExternalLink, Mail, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
    const { language } = useLanguage();

    const sections = {
        architecture: {
            title: language === 'es' ? 'Arquitectura Segura' : 'Secure Architecture',
            desc: language === 'es'
                ? 'Helios está construido sobre una arquitectura "Privacy-First" que garantiza el aislamiento total de tus datos. Utilizamos Supabase con Row Level Security (RLS) para asegurar que cada documento solo sea accesible por su propietario legítimo.'
                : 'Helios is built on a "Privacy-First" architecture that ensures total data isolation. We use Supabase with Row Level Security (RLS) to ensure that each document is only accessible by its legitimate owner.'
        },
        retention: {
            title: language === 'es' ? 'Retención y Control de Datos' : 'Data Retention & Control',
            desc: language === 'es'
                ? 'Tú tienes el control absoluto. Tus documentos se almacenan de forma segura mientras los necesites y puedes eliminarlos permanentemente en cualquier momento. Al eliminar un archivo, se borra de nuestros servidores y de la base de datos de forma irreversible.'
                : 'You have absolute control. Your documents are stored securely as long as you need them and you can permanently delete them at any time. When you delete a file, it is irreversibly erased from our servers and database.'
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-white/5 bg-slate-900/50">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09090b]" />

                <div className="relative max-w-5xl mx-auto px-6 py-24 mb-10">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {language === 'es' ? 'Volver al inicio' : 'Back to home'}
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <span className="text-emerald-400 font-medium tracking-wide uppercase text-sm">
                            {language === 'es' ? 'Centro de Confianza' : 'Trust Center'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {language === 'es'
                            ? 'Seguridad y Privacidad sin compromisos'
                            : 'Uncompromising Security & Privacy'}
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
                        {language === 'es'
                            ? 'Entendemos la sensibilidad de tus documentos legales. Por eso hemos construido Helios con una arquitectura "Privacy-First".'
                            : 'We understand the sensitivity of your legal documents. That\'s why we built Helios with a "Privacy-First" architecture.'}
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-24 space-y-24">

                {/* Core Pillars */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Private AI */}
                    <div id="private-ai" className="p-8 rounded-2xl bg-zinc-900 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                            {language === 'es' ? 'IA Privada' : 'Private AI'}
                        </h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            {language === 'es'
                                ? 'Tus datos NO se utilizan para entrenar nuestros modelos. Utilizamos instancias empresariales de Google Gemini con garantías de "Data Privacy" contractualmente aseguradas.'
                                : 'Your data is NOT used to train our models. We use enterprise instances of Google Gemini with contractually assured "Data Privacy" guarantees.'}
                        </p>
                    </div>

                    {/* Encryption */}
                    <div id="encryption" className="p-8 rounded-2xl bg-zinc-900 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                            {language === 'es' ? 'Encriptación Bancaria' : 'Bank-Grade Encryption'}
                        </h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            {language === 'es'
                                ? 'Todos los documentos se encriptan en tránsito (TLS 1.3) y en reposo (AES-256) utilizando la infraestructura certificada de Google Cloud y Supabase.'
                                : 'All documents are encrypted in transit (TLS 1.3) and at rest (AES-256) using certified Google Cloud and Supabase infrastructure.'}
                        </p>
                    </div>

                    {/* Isolation */}
                    <div id="isolation" className="p-8 rounded-2xl bg-zinc-900 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                            {language === 'es' ? 'Aislamiento de Datos' : 'Data Isolation'}
                        </h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            {language === 'es'
                                ? 'Implementamos Row Level Security (RLS) a nivel de base de datos. Es técnicamente imposible que un usuario acceda a documentos de otra organización.'
                                : 'We implement Row Level Security (RLS) at the database level. It is technically impossible for a user to access documents from another organization.'}
                        </p>
                    </div>
                </div>

                {/* Technical Architecture Detail */}
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8">
                        {/* Architecture Block */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="w-6 h-6 text-emerald-400" />
                                <h2 className="text-2xl font-bold text-white">{sections.architecture.title}</h2>
                            </div>
                            <p className="text-zinc-400 leading-relaxed">
                                {sections.architecture.desc}
                            </p>
                        </div>

                        {/* Retention Block */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Trash2 className="w-6 h-6 text-red-400" />
                                <h2 className="text-2xl font-bold text-white">{sections.retention.title}</h2>
                            </div>
                            <p className="text-zinc-400 leading-relaxed">
                                {sections.retention.desc}
                            </p>
                        </div>
                    </div>

                    {/* Certification List */}
                    <div>
                        <h2 id="certified" className="text-3xl font-bold text-white mb-6">
                            {language === 'es' ? 'Infraestructura Certificada' : 'Certified Infrastructure'}
                        </h2>
                        <ul className="space-y-4 mb-8">
                            {[
                                language === 'es' ? 'Google Cloud Platform (ISO 27001, SOC 2)' : 'Google Cloud Platform (ISO 27001, SOC 2)',
                                language === 'es' ? 'Supabase Enterprise (GDPR Compliant)' : 'Supabase Enterprise (GDPR Compliant)',
                                language === 'es' ? 'Vercel Secure Compute' : 'Vercel Secure Compute',
                                language === 'es' ? 'Stripe Payments (PCI DSS Level 1)' : 'Stripe Payments (PCI DSS Level 1)'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-300">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
                                Data Processing Agreement
                            </h3>
                            <div className="space-y-4 text-sm text-slate-300">
                                <p>
                                    {language === 'es'
                                        ? 'Actuamos como "Data Processors" (Encargados) bajo el RGPD. Tú eres el "Data Controller" (Responsable).'
                                        : 'We act as "Data Processors" under GDPR. You are the "Data Controller".'}
                                </p>
                                <p>
                                    {language === 'es'
                                        ? 'Tienes derecho a: Acceso, Rectificación, y Borrado permanente de tus datos en cualquier momento desde tu panel de control.'
                                        : 'You have the right to: Access, Rectification, and Permanent Deletion of your data at any time from your dashboard.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="border-t border-white/10 pt-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {language === 'es' ? 'Delegado de Protección de Datos (DPO)' : 'Data Protection Officer (DPO)'}
                    </h2>
                    <p className="text-zinc-400 mb-8">
                        {language === 'es'
                            ? 'Para consultas sobre privacidad o ejercer tus derechos ARCO.'
                            : 'For privacy inquiries or to exercise your GDPR rights.'}
                    </p>
                    <a
                        href="mailto:dpo@ysnsolutions.com"
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
                    >
                        <Mail className="w-5 h-5" />
                        dpo@ysnsolutions.com
                    </a>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-zinc-600">
                    <p>© 2024 YSN Solutions. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
