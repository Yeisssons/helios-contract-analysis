import { Shield, Lock, FileText, Cookie, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PoliciesPage() {
    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[0%] right-[0%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Inicio
                </Link>

                <h1 className="text-4xl font-bold mb-2">Políticas y Legal</h1>
                <p className="text-zinc-400 mb-12">Última actualización: Diciembre 2024</p>

                <div className="space-y-12">
                    {/* Privacy Section */}
                    <section id="privacidad" className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <Shield className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">Política de Privacidad</h2>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 space-y-4">
                            <p>
                                En <strong>YSN Solutions</strong>, nos tomamos su privacidad muy en serio. Esta política describe cómo recopilamos, usamos y protegemos su información personal.
                            </p>
                            <h3 className="text-white font-medium text-lg mt-4">1. Recopilación de Datos</h3>
                            <p>
                                Solo recopilamos los datos estrictamente necesarios para proporcionar nuestros servicios de análisis legal. Esto incluye documentos subidos (que son procesados de manera efímera) y datos de cuenta básicos.
                            </p>
                            <h3 className="text-white font-medium text-lg mt-4">2. Uso de la Información</h3>
                            <p>
                                Sus documentos se utilizan <strong>exclusivamente</strong> para generar los análisis solicitados. No se utilizan para entrenar modelos de IA públicos ni se comparten con terceros no autorizados.
                            </p>
                        </div>
                    </section>

                    {/* Cookies Section */}
                    <section id="cookies" className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Cookie className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">Política de Cookies</h2>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 space-y-4">
                            <p>
                                Utilizamos cookies propias y de terceros para mejorar nuestros servicios.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento técnico de la web (autenticación, seguridad).</li>
                                <li><strong>Cookies Analíticas:</strong> Nos ayudan a entender cómo se usa la plataforma para mejorarla. Puede desactivarlas desde el panel de preferencias.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Legal Section */}
                    <section id="legal" className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">Aviso Legal</h2>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 space-y-4">
                            <p>
                                <strong>Titular:</strong> YSN Solutions<br />
                                <strong>Contacto:</strong> solutionsysn@gmail.com<br />
                                <strong>Domicilio:</strong> Madrid, España
                            </p>
                            <p>
                                El contenido de esta plataforma está protegido por derechos de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
