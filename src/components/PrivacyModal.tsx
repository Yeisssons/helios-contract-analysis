'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyModal() {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        // Check if user has already accepted the privacy policy
        const hasAccepted = localStorage.getItem('ysn_privacy_accepted');
        if (!hasAccepted) {
            // Small delay to show after initial hydration
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        if (!accepted) return;

        localStorage.setItem('ysn_privacy_accepted', 'true');
        setIsOpen(false);
    };

    const t = {
        title: language === 'es' ? 'Compromiso de Privacidad YSN Solutions' : 'YSN Solutions Privacy Commitment',
        description: language === 'es'
            ? 'Tus documentos son procesados efímeramente por IA y almacenados de forma encriptada. No vendemos tus datos ni los usamos para entrenar modelos públicos.'
            : 'Your documents are processed ephemerally by AI and stored in an encrypted format. We do not sell your data or use it to train public models.',
        checkbox: language === 'es' ? 'Acepto la Política de Privacidad y el Acuerdo de Procesamiento de Datos (DPA)' : 'I accept the Privacy Policy and Data Processing Agreement (DPA)',
        button: language === 'es' ? 'Continuar' : 'Continue',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Decorative top bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <Shield className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white leading-tight">
                                    {t.title}
                                </h2>
                            </div>

                            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 mb-6">
                                <p className="text-zinc-300 text-sm leading-relaxed">
                                    {t.description}
                                </p>
                            </div>

                            {/* Trust Badges Mini */}
                            <div className="flex justify-center gap-6 mb-8 py-2">
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <Lock className="w-4 h-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-500 uppercase font-medium">AES-256</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <Shield className="w-4 h-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-500 uppercase font-medium">Private AI</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <Check className="w-4 h-4 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-500 uppercase font-medium">GDPR</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="flex items-start gap-3 group cursor-pointer">
                                    <div className="relative mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={accepted}
                                            onChange={(e) => setAccepted(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-5 h-5 rounded border border-zinc-600 bg-zinc-800 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors" />
                                        <Check className="w-3.5 h-3.5 text-black absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors select-none">
                                        {t.checkbox}
                                    </span>
                                </label>

                                <button
                                    onClick={handleAccept}
                                    disabled={!accepted}
                                    className={`
                                        w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200
                                        ${accepted
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {t.button}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
