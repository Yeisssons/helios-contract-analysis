'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 max-w-lg"
            >
                {/* Icon Container */}
                <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative flex items-center justify-center w-32 h-32 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                        <AlertTriangle className="w-16 h-16 text-red-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
                        System Malfunction
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        We encountered an unexpected error while processing your request. Our engineering team has been notified.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-zinc-600 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white hover:shadow-lg hover:shadow-red-500/25 transition-all font-medium"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        <span>Try Again</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
