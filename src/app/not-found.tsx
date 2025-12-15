'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 max-w-lg"
            >
                {/* Icon Container */}
                <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative flex items-center justify-center w-32 h-32 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                        <FileQuestion className="w-16 h-16 text-indigo-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
                        Page Not Found
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        The document or page you are looking for seems to have been moved, deleted, or never existed in this timeline.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-white/5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Go Back</span>
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        <span>Home Dashboard</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
