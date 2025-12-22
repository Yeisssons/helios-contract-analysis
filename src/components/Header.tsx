'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import LanguageToggle from './LanguageToggle';
import ConnectionStatus from './ConnectionStatus';
import { Home, Calendar, FileText, BarChart3, LogOut, User, Shield, Sparkles, Users } from 'lucide-react';

export default function Header() {
    const { t, language } = useLanguage();
    const { user, signOut } = useAuth();
    const { isAdmin } = useAdmin();
    const pathname = usePathname();

    const navItems = [
        { href: '/', labelEs: 'Inicio', labelEn: 'Home', icon: Home },
        { href: '/contracts', labelEs: 'Documentos', labelEn: 'Documents', icon: FileText },
        { href: '/analysis', labelEs: 'Análisis', labelEn: 'Analysis', icon: BarChart3 },
        { href: '/calendar', labelEs: 'Calendario', labelEn: 'Calendar', icon: Calendar },
        { href: '/team', labelEs: 'Equipo', labelEn: 'Team', icon: Users },
    ];

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 backdrop-blur-xl bg-background/60 supports-[backdrop-filter]:bg-background/60">
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo & Title */}
                    <Link href="/" className="flex items-center gap-3.5 group">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)]">
                            <Sparkles className="w-5 h-5 text-white" fill="currentColor" strokeWidth={1} />
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
                        </div>
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400 tracking-tight">
                                Helios
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium leading-none opacity-50">
                                by YSN Solutions
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                                        ${isActive
                                            ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                                    <span>{language === 'es' ? item.labelEs : item.labelEn}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Connection Status - only show when authenticated */}
                        {user && <ConnectionStatus />}

                        <LanguageToggle />

                        <div className="w-px h-8 bg-white/10 hidden sm:block" />

                        {user && (
                            <div className="flex items-center gap-3">
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 transition-all hover:bg-red-500/20"
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>ADMIN</span>
                                    </Link>
                                )}

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-sm font-medium text-zinc-200">
                                            {user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                            {isAdmin ? 'Administrator' : 'User'}
                                        </span>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
                                        title={language === 'es' ? 'Perfil' : 'Profile'}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center group-hover:border-white/10">
                                            <User className="w-4 h-4" />
                                        </div>
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
                                        title={language === 'es' ? 'Cerrar sesión' : 'Sign out'}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center group-hover:border-white/10">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-white/5 overflow-x-auto pb-2">
                    <nav className="flex items-center gap-1 p-2 min-w-max">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all
                                        ${isActive
                                            ? 'text-primary bg-primary/10'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{language === 'es' ? item.labelEs : item.labelEn}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}
