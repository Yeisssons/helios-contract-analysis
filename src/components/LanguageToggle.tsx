'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="
        relative overflow-hidden
        px-4 py-2 rounded-xl
        bg-white/5 backdrop-blur-md
        border border-white/10
        hover:bg-white/10 hover:border-white/20
        transition-all duration-300
        group
      "
            aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-center gap-2">
                {/* Globe icon */}
                <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                </svg>

                {/* Language labels */}
                <div className="flex items-center gap-1 text-sm font-medium">
                    <span className={`
            transition-all duration-300
            ${language === 'en'
                            ? 'text-emerald-400'
                            : 'text-slate-500 group-hover:text-slate-400'
                        }
          `}>
                        EN
                    </span>
                    <span className="text-slate-600">/</span>
                    <span className={`
            transition-all duration-300
            ${language === 'es'
                            ? 'text-emerald-400'
                            : 'text-slate-500 group-hover:text-slate-400'
                        }
          `}>
                        ES
                    </span>
                </div>
            </div>
        </button>
    );
}
