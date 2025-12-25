'use client';

import { Shield, Lock, FileText, Cookie, ArrowLeft, Eye, UserCheck, Mail, Calendar, Globe } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PoliciesPage() {
    const { language } = useLanguage();
    const isSpanish = language === 'es';

    const sections = [
        {
            id: 'privacy',
            icon: Shield,
            title: isSpanish ? 'Política de Privacidad' : 'Privacy Policy',
            color: 'emerald',
        },
        {
            id: 'terms',
            icon: FileText,
            title: isSpanish ? 'Términos de Servicio' : 'Terms of Service',
            color: 'blue',
        },
        {
            id: 'cookies',
            icon: Cookie,
            title: isSpanish ? 'Política de Cookies' : 'Cookie Policy',
            color: 'purple',
        },
        {
            id: 'dpa',
            icon: Lock,
            title: isSpanish ? 'Acuerdo de Procesamiento de Datos' : 'Data Processing Agreement',
            color: 'orange',
        },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-24 relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    {isSpanish ? 'Volver al Inicio' : 'Back to Home'}
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-white">
                        {isSpanish ? 'Políticas y Legal' : 'Policies & Legal'}
                    </span>
                </h1>
                <p className="text-zinc-400 mb-12">{isSpanish ? 'Última actualización: Diciembre 2024' : 'Last updated: December 2024'}</p>

                {/* Quick Nav */}
                <div className="grid md:grid-cols-4 gap-4 mb-16">
                    {sections.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-all group"
                        >
                            <section.icon className={`w-6 h-6 text-${section.color}-400 mb-2`} />
                            <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                                {section.title}
                            </div>
                        </a>
                    ))}
                </div>

                <div className="space-y-16">
                    {/* Privacy Policy */}
                    <section id="privacy" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <Shield className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-semibold text-white">{isSpanish ? 'Política de Privacidad' : 'Privacy Policy'}</h2>
                        </div>

                        <div className="prose prose-invert prose-emerald max-w-none space-y-6 text-zinc-300">
                            <p className="text-lg">
                                {isSpanish
                                    ? 'En YSN Solutions, nos tomamos tu privacidad muy en serio. Como responsable del tratamiento de datos ("Data Controller"), cumplimos con el RGPD (UE) y la LOPDGDD (España).'
                                    : 'At YSN Solutions, we take your privacy very seriously. As Data Controller, we comply with GDPR (EU) and LOPDGDD (Spain).'}
                            </p>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-emerald-400" />
                                    {isSpanish ? '1. Datos que Recopilamos' : '1. Data We Collect'}
                                </h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>{isSpanish ? 'Información de cuenta: email, nombre, contraseña (hash)' : 'Account information: email, name, password (hashed)'}</li>
                                    <li>{isSpanish ? 'Documentos subidos: contratos y archivos para análisis' : 'Uploaded documents: contracts and files for analysis'}</li>
                                    <li>{isSpanish ? 'Datos de uso: logs de análisis, preferencias' : 'Usage data: analysis logs, preferences'}</li>
                                    <li>{isSpanish ? 'Información de pago: procesada por Stripe (no almacenamos tarjetas)' : 'Payment information: processed by Stripe (we don\'t store cards)'}</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-emerald-400" />
                                    {isSpanish ? '2. Uso de la Información' : '2. Use of Information'}
                                </h3>
                                <p>{isSpanish
                                    ? 'Utilizamos tus datos exclusivamente para: (a) proporcionar el servicio de análisis, (b) mejorar la plataforma, (c) comunicaciones de servicio esenciales. NUNCA vendemos ni compartimos tus datos con terceros no autorizados.'
                                    : 'We use your data exclusively to: (a) provide the analysis service, (b) improve the platform, (c) essential service communications. We NEVER sell or share your data with unauthorized third parties.'
                                }</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-emerald-400" />
                                    {isSpanish ? '3. Protección de Datos' : '3. Data Protection'}
                                </h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>{isSpanish ? 'Encriptación AES-256 en reposo' : 'AES-256 encryption at rest'}</li>
                                    <li>{isSpanish ? 'TLS 1.3 en tránsito' : 'TLS 1.3 in transit'}</li>
                                    <li>{isSpanish ? 'Servidores en la UE (Frankfurt)' : 'Servers in EU (Frankfurt)'}</li>
                                    <li>{isSpanish ? 'Row Level Security (RLS) a nivel de base de datos' : 'Row Level Security (RLS) at database level'}</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-emerald-400" />
                                    {isSpanish ? '4. Tus Derechos (ARCO + GDPR)' : '4. Your Rights (GDPR)'}
                                </h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>{isSpanish ? 'Acceso:' : 'Access:'}</strong> {isSpanish ? 'Solicita una copia de tus datos' : 'Request a copy of your data'}</li>
                                    <li><strong>{isSpanish ? 'Rectificación:' : 'Rectification:'}</strong> {isSpanish ? 'Corrige datos inexactos' : 'Correct inaccurate data'}</li>
                                    <li><strong>{isSpanish ? 'Supresión:' : 'Deletion:'}</strong> {isSpanish ? 'Solicita eliminación permanente (derecho al olvido)' : 'Request permanent deletion (right to be forgotten)'}</li>
                                    <li><strong>{isSpanish ? 'Portabilidad:' : 'Portability:'}</strong> {isSpanish ? 'Exporta tus datos en formato legible' : 'Export your data in readable format'}</li>
                                    <li><strong>{isSpanish ? 'Oposición:' : 'Objection:'}</strong> {isSpanish ? 'Oponte a ciertos procesamientos' : 'Object to certain processing'}</li>
                                </ul>
                                <p className="mt-4">
                                    {isSpanish
                                        ? 'Para ejercer tus derechos, contacta: '
                                        : 'To exercise your rights, contact: '}
                                    <a href="mailto:dpo@ysnsolutions.com" className="text-emerald-400 hover:text-emerald-300">dpo@ysnsolutions.com</a>
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-400" />
                                    {isSpanish ? '5. Retención de Datos' : '5. Data Retention'}
                                </h3>
                                <p>{isSpanish
                                    ? 'Documentos: se almacenan mientras los necesites y puedes eliminarlos en cualquier momento desde tu panel. Al eliminar, se borran permanentemente en <24h. Datos de facturación: retenidos por obligación legal (6 años).'
                                    : 'Documents: stored as long as you need them and you can delete them anytime from your dashboard. Upon deletion, permanently erased in <24h. Billing data: retained for legal obligation (6 years).'
                                }</p>
                            </div>
                        </div>
                    </section>

                    {/* Terms of Service */}
                    <section id="terms" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-3xl font-semibold text-white">{isSpanish ? 'Términos de Servicio' : 'Terms of Service'}</h2>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-6 text-zinc-300">
                            <p>{isSpanish
                                ? 'Al usar Helios, aceptas los siguientes términos:'
                                : 'By using Helios, you agree to the following terms:'
                            }</p>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? '1. Licencia de Uso' : '1. License to Use'}</h3>
                                <p>{isSpanish
                                    ? 'Te otorgamos una licencia no exclusiva, intransferible y revocable para usar Helios conforme a tu plan de suscripción.'
                                    : 'We grant you a non-exclusive, non-transferable, and revocable license to use Helios according to your subscription plan.'
                                }</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? '2. Propiedad Intelectual' : '2. Intellectual Property'}</h3>
                                <p>{isSpanish
                                    ? 'Tú conservas todos los derechos sobre tus documentos y contenido. Nosotros conservamos la propiedad del software, diseño y marca Helios.'
                                    : 'You retain all rights to your documents and content. We retain ownership of the software, design, and Helios brand.'
                                }</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? '3. Uso Aceptable' : '3. Acceptable Use'}</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>{isSpanish ? 'No intentes violar la seguridad del sistema' : 'Do not attempt to violate system security'}</li>
                                    <li>{isSpanish ? 'No uses el servicio para actividades ilegales' : 'Do not use the service for illegal activities'}</li>
                                    <li>{isSpanish ? 'No compartas credenciales de acceso' : 'Do not share access credentials'}</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? '4. Limitación de Responsabilidad' : '4. Limitation of Liability'}</h3>
                                <p>{isSpanish
                                    ? 'Helios se proporciona "tal cual". No nos responsabilizamos de decisiones tomadas basándote en los análisis. Los resultados de IA son orientativos y deben ser revisados por profesionales legales.'
                                    : 'Helios is provided "as is". We are not responsible for decisions made based on analyses. AI results are indicative and should be reviewed by legal professionals.'
                                }</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? '5. Cancelación' : '5. Cancellation'}</h3>
                                <p>{isSpanish
                                    ? 'Puedes cancelar tu suscripción en cualquier momento desde tu panel. No hay penalizaciones ni reembolsos prorrateados.'
                                    : 'You can cancel your subscription anytime from your dashboard. No penalties or prorated refunds.'
                                }</p>
                            </div>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section id="cookies" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Cookie className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-3xl font-semibold text-white">{isSpanish ? 'Política de Cookies' : 'Cookie Policy'}</h2>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-6 text-zinc-300">
                            <p>{isSpanish
                                ? 'Utilizamos cookies propias y de terceros para mejorar nuestros servicios.'
                                : 'We use first-party and third-party cookies to improve our services.'
                            }</p>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? 'Tipos de Cookies' : 'Types of Cookies'}</h3>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li>
                                        <strong>{isSpanish ? 'Cookies Esenciales (Técnicas):' : 'Essential cookies (Technical):'}</strong>{' '}
                                        {isSpanish
                                            ? 'Necesarias para autenticación, seguridad y funcionamiento básico. No pueden desactivarse.'
                                            : 'Necessary for authentication, security, and basic operation. Cannot be disabled.'}
                                    </li>
                                    <li>
                                        <strong>{isSpanish ? 'Cookies Analíticas:' : 'Analytics Cookies:'}</strong>{' '}
                                        {isSpanish
                                            ? 'Nos ayudan a entender cómo se usa la plataforma (Google Analytics). Puedes desactivarlas.'
                                            : 'Help us understand how the platform is used (Google Analytics). You can disable them.'}
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? 'Cómo Gestionar Cookies' : 'How to Manage Cookies'}</h3>
                                <p>{isSpanish
                                    ? 'Puedes configurar tu navegador para rechazar cookies. Ten en cuenta que esto puede afectar la funcionalidad del sitio.'
                                    : 'You can configure your browser to reject cookies. Note that this may affect site functionality.'
                                }</p>
                            </div>
                        </div>
                    </section>

                    {/* DPA */}
                    <section id="dpa" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                                <Lock className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-3xl font-semibold text-white">{isSpanish ? 'Acuerdo de Procesamiento de Datos (DPA)' : 'Data Processing Agreement (DPA)'}</h2>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-6 text-zinc-300">
                            <p className="text-lg font-medium text-emerald-400">
                                {isSpanish
                                    ? '✓ Disponible automáticamente para todos los planes'
                                    : '✓ Automatically available for all plans'}
                            </p>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? 'Roles GDPR' : 'GDPR Roles'}</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>{isSpanish ? 'Tú (Cliente):' : 'You (Client):'}</strong> Data Controller (Responsable del Tratamiento)</li>
                                    <li><strong>{isSpanish ? 'Nosotros (YSN Solutions):' : 'Us (YSN Solutions):'}</strong> Data Processor (Encargado del Tratamiento)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">{isSpanish ? 'Nuestros Compromisos' : 'Our Commitments'}</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>{isSpanish ? 'Solo procesamos datos según tus instrucciones' : 'We only process data according to your instructions'}</li>
                                    <li>{isSpanish ? 'Garantizamos confidencialidad y seguridad' : 'We guarantee confidentiality and security'}</li>
                                    <li>{isSpanish ? 'No subcontratamos sin autorización' : 'No subcontracting without authorization'}</li>
                                    <li>{isSpanish ? 'Asistimos con derechos de interesados' : 'We assist with data subject rights'}</li>
                                    <li>{isSpanish ? 'Eliminamos datos al terminar el servicio' : 'We delete data upon service termination'}</li>
                                </ul>
                            </div>

                            <p className="mt-8">
                                {isSpanish ? 'Para solicitar una copia firmada del DPA: ' : 'To request a signed copy of the DPA: '}
                                <a href="mailto:dpo@ysnsolutions.com" className="text-emerald-400 hover:text-emerald-300">dpo@ysnsolutions.com</a>
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-white/10 pt-16 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {isSpanish ? '¿Preguntas sobre Privacidad o Legal?' : 'Questions about Privacy or Legal?'}
                        </h2>
                        <p className="text-zinc-400 mb-8">
                            {isSpanish
                                ? 'Nuestro equipo legal está disponible para ayudarte.'
                                : 'Our legal team is available to help you.'}
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
        </div>
    );
}
