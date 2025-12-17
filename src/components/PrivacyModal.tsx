'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Check, ExternalLink, Settings, Cookie } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'intro' | 'preferences'>('intro');
    const [accepted, setAccepted] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: false,
        marketing: false
    });
    const { language } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage for prior acceptance (v2 for granular consent)
        const storedConsent = localStorage.getItem('privacy_consent_v2');
        if (!storedConsent) {
            // Check legacy v1 to maybe migrate or re-ask
            setTimeout(() => setIsOpen(true), 1500);
        }
    }, []);

    const handleAcceptAll = () => {
        saveConsent({ essential: true, analytics: true, marketing: true });
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    const saveConsent = (prefs: typeof preferences) => {
        localStorage.setItem('privacy_consent_v2', JSON.stringify({
            ...prefs,
            timestamp: new Date().toISOString()
        }));
        setAccepted(true);
        setTimeout(() => setIsOpen(false), 500);
    };

    const togglePreference = (key: keyof typeof preferences) => {
        if (key === 'essential') return; // Cannot toggle essential
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 pb-0 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                                <Shield className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {language === 'es' ? 'Compromiso de Privacidad YSN Solutions' : 'YSN Solutions Privacy Commitment'}
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    {language === 'es' ? 'Tu confianza es nuestra prioridad' : 'Your trust is our priority'}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {step === 'intro' ? (
                                <div className="space-y-4">
                                    <p className="text-zinc-300 leading-relaxed text-sm">
                                        {language === 'es'
                                            ? 'Utilizamos tecnologías para mejorar tu experiencia y garantizar la seguridad de tus datos. Tus documentos son procesados de forma privada y nunca se utilizan para entrenar modelos públicos.'
                                            : 'We use technologies to enhance your experience and ensure your data security. Your documents are processed privately and never used to train public models.'}
                                    </p>

                                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                                        <div className="flex items-start gap-2 text-xs text-zinc-400">
                                            <Lock className="w-3.5 h-3.5 mt-0.5 text-emerald-400" />
                                            <span>{language === 'es' ? 'Encriptación AES-256' : 'AES-256 Encryption'}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-zinc-400">
                                            <Cookie className="w-3.5 h-3.5 mt-0.5 text-blue-400" />
                                            <span>{language === 'es' ? 'Gestión granular de cookies' : 'Granular cookie management'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-6">
                                        <button
                                            onClick={handleAcceptAll}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20"
                                        >
                                            {language === 'es' ? 'Aceptar Todo' : 'Accept All'}
                                        </button>
                                        <button
                                            onClick={() => setStep('preferences')}
                                            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            {language === 'es' ? 'Configurar Preferencias' : 'Manage Preferences'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Preferences Toggles */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div>
                                                <p className="text-white font-medium text-sm">{language === 'es' ? 'Esenciales' : 'Essential'}</p>
                                                <p className="text-xs text-zinc-500">{language === 'es' ? 'Requerido para funcionar' : 'Required to function'}</p>
                                            </div>
                                            <div className="opacity-50 cursor-not-allowed">
                                                <Check className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => togglePreference('analytics')}
                                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                                        >
                                            <div>
                                                <p className="text-white font-medium text-sm">{language === 'es' ? 'Analíticas' : 'Analytics'}</p>
                                                <p className="text-xs text-zinc-500">{language === 'es' ? 'Para mejorar el servicio' : 'To improve service'}</p>
                                            </div>
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${preferences.analytics ? 'bg-emerald-600' : 'bg-zinc-700'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${preferences.analytics ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-6">
                                        <button
                                            onClick={handleSavePreferences}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                            {language === 'es' ? 'Guardar Preferencias' : 'Save Preferences'}
                                        </button>
                                        <button
                                            onClick={() => setStep('intro')}
                                            className="text-xs text-zinc-500 hover:text-white transition-colors text-center"
                                        >
                                            {language === 'es' ? 'Volver' : 'Back'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/5 bg-black/20 text-center">
                            <a href="/security" target="_blank" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
                                {language === 'es' ? 'Ver Política de Privacidad Completa' : 'View Full Privacy Policy'} <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
