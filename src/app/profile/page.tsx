'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Loader2, Shield, CreditCard, Bell, ChevronRight } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

function ProfileContent() {
    const { user, signOut } = useAuth();
    const { language } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password !== confirmPassword) {
            setErrorMsg(language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setErrorMsg(language === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccessMsg(language === 'es' ? 'Contraseña actualizada correctamente' : 'Password updated successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error updating password:', error);
            setErrorMsg(language === 'es' ? 'Error al actualizar contraseña' : 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {language === 'es' ? 'Configuración de Cuenta' : 'Account Settings'}
                    </h1>
                    <p className="text-slate-400">
                        {language === 'es' ? 'Gestiona tu perfil y preferencias' : 'Manage your profile and preferences'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar Navigation (Visual Only for MVP) */}
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/25">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white font-medium truncate">{user?.email}</p>
                                    <p className="text-xs text-slate-400">Free Plan</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-white bg-slate-700/50 rounded-lg transition-colors">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm font-medium">{language === 'es' ? 'Perfil' : 'Profile'}</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors">
                                    <Bell className="w-4 h-4" />
                                    <span className="text-sm font-medium">{language === 'es' ? 'Notificaciones' : 'Notifications'}</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-sm font-medium">{language === 'es' ? 'Seguridad' : 'Security'}</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-sm font-medium">{language === 'es' ? 'Suscripción' : 'Billing'}</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Profile Details Card */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                        >
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-400" />
                                {language === 'es' ? 'Información Personal' : 'Personal Information'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 opacity-70 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {language === 'es' ? 'El email no se puede cambiar.' : 'Email cannot be changed.'}
                                    </p>
                                </div>
                            </div>
                        </motion.section>

                        {/* Password Update Card */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                        >
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-amber-400" />
                                {language === 'es' ? 'Seguridad' : 'Security'}
                            </h2>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        {language === 'es' ? 'Confirmar Contraseña' : 'Confirm Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {errorMsg && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {errorMsg}
                                    </div>
                                )}

                                {successMsg && (
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                        {successMsg}
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || !password}
                                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <LanguageProvider>
            <ProfileContent />
        </LanguageProvider>
    );
}
