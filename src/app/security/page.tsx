'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import {
    Shield, Lock, Database, Server, FileText, CheckCircle, ExternalLink, Mail,
    Trash2, ArrowLeft, Eye, Cloud, Key, UserCheck, Clock, AlertTriangle,
    FileCheck, Fingerprint, Award
} from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
    const { language } = useLanguage();
    const isSpanish = language === 'es';

    const certifications = [
        {
            icon: Shield,
            name: 'ISO 27001',
            status: isSpanish ? 'En proceso de certificación' : 'Certification in progress',
            description: isSpanish
                ? 'Gestión de seguridad de la información'
                : 'Information security management',
        },
        {
            icon: Award,
            name: 'SOC 2 Type II',
            status: isSpanish ? 'Disponible para Enterprise' : 'Available for Enterprise',
            description: isSpanish
                ? 'Controles organizacionales y de cumplimiento'
                : 'Organizational and compliance controls',
        },
        {
            icon: CheckCircle,
            name: 'GDPR Compliant',
            status: isSpanish ? '100% Cumplimiento' : '100% Compliant',
            description: isSpan ish
            ? 'Reglamento General de Protección de Datos (UE)'
                : 'General Data Protection Regulation (EU)',
        },
        {
            icon: FileCheck,
            name: 'RGPD (España)',
            status: isSpanish ? '100% Cumplimiento' : '100% Compliant',
            description: isSpanish
                ? 'Ley Orgánica de Protección de Datos y LOPDGDD'
                : 'Spanish Data Protection Law',
        },
    ];

    const securityFeatures = [
        {
            icon: Lock,
            title: isSpanish ? 'Encriptación de Nivel Bancario' : 'Bank-Grade Encryption',
            items: [
                isSpanish ? 'TLS 1.3 en tránsito' : 'TLS 1.3 in transit',
                isSpanish ? 'AES-256 en reposo' : 'AES-256 at rest',
                isSpanish ? 'Zero-knowledge architecture' : 'Zero-knowledge architecture',
            ],
        },
        {
            icon: Server,
            title: isSpanish ? 'Infraestructura Segura' : 'Secure Infrastructure',
            items: [
                isSpanish ? 'Servidores en Frankfurt (EU)' : 'Servers in Frankfurt (EU)',
                isSpanish ? 'Backups cifrados automáticos' : 'Encrypted automatic backups',
                isSpanish ? 'Redundancia geográfica' : 'Geographic redundancy',
            ],
        },
        {
            icon: UserCheck,
            title: isSpanish ? 'Control de Acceso' : 'Access Control',
            items: [
                isSpanish ? '2FA/MFA obligatorio' : '2FA/MFA mandatory',
                isSpanish ? 'RBAC (Control basado en roles)' : 'RBAC (Role-Based Access Control)',
                isSpanish ? 'Audit logs completos' : 'Complete audit logs',
            ],
        },
        {
            icon: Eye,
            title: isSpanish ? 'Monitoreo 24/7' : '24/7 Monitoring',
            items: [
                isSpanish ? 'Detectión de intrusiones' : 'Intrusion detection',
                isSpanish ? 'Alertas en tiempo real' : 'Real-time alerts',
                isSpanish ? 'Análisis de comportamiento' : 'Behavior analysis',
            ],
        },
        {
            icon: Database,
            title: isSpanish ? 'Aislamiento de Datos' : 'Data Isolation',
            items: [
                isSpanish ? 'Row Level Security (RLS)' : 'Row Level Security (RLS)',
                isSpanish ? 'Multitenancy estricto' : 'Strict multitenancy',
                isSpanish ? 'Sin acceso cruzado' : 'No cross-access',
            ],
        },
        {
            icon: Trash2,
            title: isSpanish ? 'Eliminación Permanente' : 'Permanent Deletion',
            items: [
                isSpanish ? 'Borrado irreversible en <24h' : 'Irreversible deletion <24h',
                isSpanish ? 'Retención configurable' : 'Configurable retention',
                isSpanish ? 'Cumplimiento derecho al olvido' : 'Right to be forgotten compliance',
            ],
        },
    ];

    const compliance = [
        {
            title: 'GDPR (EU)',
            description: isSpanish
                ? 'Cumplimiento total con Reglamento General de Protección de Datos de la Unión Europea. Data Processing Agreement (DPA) firmado.'
                : 'Full compliance with EU General Data Protection Regulation. Signed Data Processing Agreement (DPA).',
        },
        {
            title: 'RGPD (España)',
            description: isSpanish
                ? 'Alineados con LOPDGDD y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales.'
                : 'Aligned with LOPDGDD and Organic Law 3/2018 on Personal Data Protection and guarantee of digital rights.',
        },
        {
            title: isSpanish ? 'Procesamiento en UE' : 'EU Processing',
            description: isSpanish
                ? 'Todos los datos se procesan exclusivamente en servidores ubicados en la Unión Europea (Frankfurt, Alemania).'
                : 'All data is processed exclusively on servers located in the European Union (Frankfurt, Germany).',
        },
    ];

    const incidentResponse = [
        {
            time: '<1h',
            action: isSpanish ? 'Detección' : 'Detection',
            description: isSpanish ? 'Sistemas automáticos de alerta' : 'Automated alert systems',
        },
        {
            time: '<4h',
            action: isSpanish ? 'Contención' : 'Containment',
            description: isSpanish ? 'Aislamiento del incidente' : 'Incident isolation',
        },
        {
            time: '<24h',
            action: isSpanish ? 'Remediacíon' : 'Remediation',
            description: isSpanish ? 'Corrección y mitigación' : 'Fix and mitigation',
        },
        {
            time: '<72h',
            action: isSpanish ? 'Notificación' : 'Notification',
            description: isSpanish ? 'Comunicación a afectados (GDPR)' : 'Communication to affected parties (GDPR)',
        },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <div className="relative border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-24 relative z-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {isSpanish ? 'Volver al inicio' : 'Back to home'}
                    </Link>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400 font-medium">
                            {isSpanish ? 'Centro de Confianza y Seguridad' : 'Trust & Security Center'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-white">
                            {isSpanish ? 'Tu Información, ' : 'Your Information, '}
                        </span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                            {isSpanish ? 'Nuestra Prioridad Máxima' : 'Our Top Priority'}
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed mb-8">
                        {isSpanish
                            ? 'Entendemos la sensibilidad de tus documentos legales. Helios está construido con una arquitectura "Privacy-First" y seguridad de nivel empresarial.'
                            : 'We understand the sensitivity of your legal documents. Helios is built with a "Privacy-First" architecture and enterprise-grade security.'}
                    </p>

                    {/* Trust Metrics */}
                    <div className="flex flex-wrap gap-8 text-sm">
                        <div className="flex flex-col">
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">100%</div>
                            <div className="text-zinc-500">{isSpanish ? 'Datos en EU' : 'Data in EU'}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">99.9%</div>
                            <div className="text-zinc-500">{isSpanish ? 'Uptime SLA' : 'Uptime SLA'}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">0</div>
                            <div className="text-zinc-500">{isSpanish ? 'Brechas de Datos' : 'Data Breaches'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-24 space-y-24 relative z-10">

                {/* Certifications */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {isSpanish ? 'Certificaciones y Cumplimiento' : 'Certifications & Compliance'}
                    </h2>
                    <p className="text-zinc-400 mb-12">
                        {isSpanish
                            ? 'Comprometidos con los más altos estándares de seguridad y privacidad.'
                            : 'Committed to the highest standards of security and privacy.'}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {certifications.map((cert) => (
                            <div
                                key={cert.name}
                                className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:bg-zinc-900/60 transition-all"
                            >
                                <cert.icon className="w-10 h-10 text-emerald-400 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">{cert.name}</h3>
                                <p className="text-emerald-400 text-sm font-medium mb-2">{cert.status}</p>
                                <p className="text-zinc-500 text-sm">{cert.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Features */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-12">
                        {isSpanish ? 'Características de Seguridad' : 'Security Features'}
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {securityFeatures.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-4">{feature.title}</h3>
                                <ul className="space-y-2">
                                    {feature.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-zinc-400 text-sm">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Privacy First */}
                <section className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-12">
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-emerald-500/20 rounded-2xl">
                            <Fingerprint className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {isSpanish ? 'IA Privada: Tus Datos NUNCA Entrenan Modelos' : 'Private AI: Your Data NEVER Trains Models'}
                            </h2>
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                {isSpanish
                                    ? 'Utilizamos instancias empresariales de Google Gemini, OpenAI GPT, y Anthropic Claude con garantías contractuales DPA. Tus documentos se procesan en tiempo real y se eliminan según tu configuración de retención.'
                                    : 'We use enterprise instances of Google Gemini, OpenAI GPT, and Anthropic Claude with contractual DPA guarantees. Your documents are processed in real-time and deleted according to your retention settings.'}
                            </p>
                            <p className="text-emerald-400 font-semibold">
                                {isSpanish
                                    ? '✓ Cero entrenamiento de modelos con tus datos'
                                    : '✓ Zero model training with your data'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Compliance Details */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-12">
                        {isSpanish ? 'Cumplimiento Normativo' : 'Regulatory Compliance'}
                    </h2>

                    <div className="space-y-6">
                        {compliance.map((item) => (
                            <div
                                key={item.title}
                                className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                        <p className="text-zinc-400">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Incident Response */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {isSpanish ? 'Plan de Respuesta a Incidentes' : 'Incident Response Plan'}
                    </h2>
                    <p className="text-zinc-400 mb-12">
                        {isSpanish
                            ? 'Protocolo estructurado para garantizar respuesta rápida y transparente.'
                            : 'Structured protocol to ensure fast and transparent response.'}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {incidentResponse.map((step, i) => (
                            <div key={step.action} className="relative">
                                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="text-4xl font-bold text-emerald-400 mb-2">{step.time}</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{step.action}</h3>
                                    <p className="text-zinc-500 text-sm">{step.description}</p>
                                </div>
                                {i < incidentResponse.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-emerald-500/30" />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* DPO Contact */}
                <section className="border-t border-white/10 pt-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {isSpanish ? 'Delegado de Protección de Datos (DPO)' : 'Data Protection Officer (DPO)'}
                    </h2>
                    <p className="text-zinc-400 mb-8">
                        {isSpanish
                            ? 'Para consultas sobre privacidad o ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación, Oposición).'
                            : 'For privacy inquiries or to exercise your rights (Access, Rectification, Deletion, Objection).'}
                    </p>
                    <a
                        href="mailto:dpo@ysnsolutions.com"
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
                    >
                        <Mail className="w-5 h-5" />
                        dpo@ysnsolutions.com
                    </a>
                </section>
            </div>
        </div>
    );
}
