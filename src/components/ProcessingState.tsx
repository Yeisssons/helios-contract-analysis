'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STATUS_MESSAGES = {
    es: [
        "Leyendo documento...",
        "Identificando partes contratantes...",
        "Extrayendo fechas clave...",
        "Analizando cláusulas...",
        "Buscando cláusulas abusivas...",
        "Calculando puntuación de riesgo...",
        "Generando alertas...",
        "Finalizando informe..."
    ],
    en: [
        "Reading document...",
        "Identifying contracting parties...",
        "Extracting key dates...",
        "Analyzing clauses...",
        "Detecting abusive clauses...",
        "Calculating risk score...",
        "Generating alerts...",
        "Finalizing report..."
    ]
};

export default function ProcessingState() {
    const { language } = useLanguage();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    const messages = language === 'es' ? STATUS_MESSAGES.es : STATUS_MESSAGES.en;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 1200); // Change message every 1.2 seconds

        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            {/* Animated Container */}
            <div className="relative">
                {/* Pulsing Glow Background */}
                <motion.div
                    className="absolute inset-0 rounded-full blur-3xl opacity-50"
                    animate={{
                        background: [
                            'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
                        ],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ width: '300px', height: '300px', left: '-50px', top: '-50px' }}
                />

                {/* Document Icon Container */}
                <div className="relative z-10">
                    {/* Main Document Icon */}
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full" />
                        <FileText
                            className="w-32 h-32 text-white/10"
                            strokeWidth={1}
                        />
                        <FileText
                            className="w-32 h-32 text-white/80 absolute inset-0"
                            strokeWidth={1}
                            style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
                        />
                    </motion.div>

                    {/* Scanning Laser Line */}
                    <motion.div
                        className="absolute left-0 right-0 h-0.5 rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 1), rgba(59, 130, 246, 1), transparent)',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)',
                        }}
                        animate={{
                            top: ['0%', '100%', '0%'],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Data Points Particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                            style={{
                                left: `${20 + i * 12}%`,
                                top: `${30 + (i % 3) * 20}%`,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Dynamic Status Message */}
            <div className="mt-12 h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMessageIndex}
                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4 }}
                        className="text-center"
                    >
                        <p className="text-xl font-light tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                            {messages[currentMessageIndex]}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Indicator Dots */}
            <div className="flex gap-3 mt-4">
                {messages.map((_, index) => (
                    <motion.div
                        key={index}
                        className="w-1.5 h-1.5 rounded-full"
                        animate={{
                            backgroundColor: index === currentMessageIndex
                                ? 'rgb(255, 255, 255)'
                                : 'rgba(255, 255, 255, 0.1)',
                            scale: index === currentMessageIndex ? 1.5 : 1,
                            boxShadow: index === currentMessageIndex ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                        }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>

            <motion.div
                className="mt-8 px-4 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <p className="mt-2 text-sm text-slate-400">Helios AI is analyzing your contract...</p>
                <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
                    Helios AI Engine
                </p>
            </motion.div>
        </div>
    );
}
