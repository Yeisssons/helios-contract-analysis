'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import {
    User, Mail, Lock, Save, Loader2, Shield, CreditCard, Bell,
    ChevronRight, Trash2, Clock, FileText, Eye, Download, Check,
    AlertTriangle, ExternalLink, Zap
} from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

type Tab = 'profile' | 'notifications' | 'security' | 'subscription';

interface NotificationPrefs {
    emailRenewalAlerts: boolean;
    emailWeeklyDigest: boolean;
    emailTaskAssignments: boolean;
    emailSecurityAlerts: boolean;
}

function ProfileContent() {
    const { user, signOut } = useAuth();
    const { language } = useLanguage();

    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Password state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification preferences
    const [notifications, setNotifications] = useState<NotificationPrefs>({
        emailRenewalAlerts: true,
        emailWeeklyDigest: false,
        emailTaskAssignments: true,
        emailSecurityAlerts: true,
    });

    // Subscription info (mock for now)
    const [subscription] = useState({
        plan: 'free',
        documentsUsed: 3,
        documentsLimit: 5,
        nextRenewal: null as string | null,
    });

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

    const handleSaveNotifications = async () => {
        setLoading(true);
        // In production, save to database
        await new Promise(r => setTimeout(r, 500));
        setSuccessMsg(language === 'es' ? 'Preferencias guardadas' : 'Preferences saved');
        setLoading(false);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const tabs = [
        { id: 'profile' as Tab, label: language === 'es' ? 'Perfil' : 'Profile', icon: User },
        { id: 'notifications' as Tab, label: language === 'es' ? 'Notificaciones' : 'Notifications', icon: Bell },
        { id: 'security' as Tab, label: language === 'es' ? 'Seguridad' : 'Security', icon: Shield },
        { id: 'subscription' as Tab, label: language === 'es' ? 'Suscripción' : 'Subscription', icon: CreditCard },
    ];

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
                    {/* Sidebar Navigation */}
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/25">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white font-medium truncate">{user?.email}</p>
                                    <p className="text-xs text-slate-400 capitalize">
                                        {subscription.plan === 'free' ? 'Free Plan' :
                                            subscription.plan === 'pro' ? 'Pro Plan' : 'Enterprise'}
                                    </p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                                    ? 'text-white bg-slate-700/50'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">

                        {/* ============ PROFILE TAB ============ */}
                        {activeTab === 'profile' && (
                            <>
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

                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                                >
                                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-amber-400" />
                                        {language === 'es' ? 'Cambiar Contraseña' : 'Change Password'}
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
                            </>
                        )}

                        {/* ============ NOTIFICATIONS TAB ============ */}
                        {activeTab === 'notifications' && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                            >
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-blue-400" />
                                    {language === 'es' ? 'Preferencias de Notificación' : 'Notification Preferences'}
                                </h2>

                                <div className="space-y-4">
                                    {/* Renewal Alerts */}
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                                            <div>
                                                <p className="text-white font-medium">
                                                    {language === 'es' ? 'Alertas de Vencimiento' : 'Renewal Alerts'}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {language === 'es'
                                                        ? 'Recibe emails 60, 30, 14 y 7 días antes de que venzan tus contratos'
                                                        : 'Receive emails 60, 30, 14, and 7 days before your contracts expire'}
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailRenewalAlerts}
                                                onChange={(e) => setNotifications({ ...notifications, emailRenewalAlerts: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    {/* Task Assignments */}
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                        <div className="flex items-start gap-3">
                                            <FileText className="w-5 h-5 text-emerald-400 mt-0.5" />
                                            <div>
                                                <p className="text-white font-medium">
                                                    {language === 'es' ? 'Asignaciones de Tareas' : 'Task Assignments'}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {language === 'es'
                                                        ? 'Recibe notificaciones cuando te asignen una tarea'
                                                        : 'Get notified when a task is assigned to you'}
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailTaskAssignments}
                                                onChange={(e) => setNotifications({ ...notifications, emailTaskAssignments: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    {/* Weekly Digest */}
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                                            <div>
                                                <p className="text-white font-medium">
                                                    {language === 'es' ? 'Resumen Semanal' : 'Weekly Digest'}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {language === 'es'
                                                        ? 'Resumen de actividad cada lunes'
                                                        : 'Weekly activity summary every Monday'}
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailWeeklyDigest}
                                                onChange={(e) => setNotifications({ ...notifications, emailWeeklyDigest: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    {/* Security Alerts */}
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-red-400 mt-0.5" />
                                            <div>
                                                <p className="text-white font-medium">
                                                    {language === 'es' ? 'Alertas de Seguridad' : 'Security Alerts'}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {language === 'es'
                                                        ? 'Nuevos accesos y cambios de contraseña'
                                                        : 'New logins and password changes'}
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailSecurityAlerts}
                                                onChange={(e) => setNotifications({ ...notifications, emailSecurityAlerts: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    {successMsg && (
                                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                            {successMsg}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSaveNotifications}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {language === 'es' ? 'Guardar Preferencias' : 'Save Preferences'}
                                        </button>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* ============ SECURITY TAB ============ */}
                        {activeTab === 'security' && (
                            <>
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                                >
                                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-emerald-400" />
                                        {language === 'es' ? 'Privacidad y Datos' : 'Privacy & Data'}
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Data Retention Policy */}
                                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                            <div className="flex items-start gap-3">
                                                <Clock className="w-5 h-5 text-emerald-400 mt-0.5" />
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {language === 'es' ? 'Política de Retención de Datos' : 'Data Retention Policy'}
                                                    </p>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        {language === 'es'
                                                            ? 'Tus documentos se almacenan de forma segura. Los datos de análisis (metadata extraída) se eliminan automáticamente después de 30 días de inactividad para garantizar tu privacidad.'
                                                            : 'Your documents are stored securely. Analysis data (extracted metadata) is automatically deleted after 30 days of inactivity to ensure your privacy.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Your Data */}
                                        <div>
                                            <h3 className="text-white font-medium mb-3">
                                                {language === 'es' ? 'Tus Datos' : 'Your Data'}
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-4 h-4 text-blue-400" />
                                                        <span className="text-slate-300">
                                                            {language === 'es' ? 'Documentos subidos' : 'Uploaded documents'}
                                                        </span>
                                                    </div>
                                                    <span className="text-white font-medium">{subscription.documentsUsed}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                                    <div className="flex items-center gap-3">
                                                        <Eye className="w-4 h-4 text-purple-400" />
                                                        <span className="text-slate-300">
                                                            {language === 'es' ? 'Análisis realizados' : 'Analyses performed'}
                                                        </span>
                                                    </div>
                                                    <span className="text-white font-medium">{subscription.documentsUsed}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div>
                                            <h3 className="text-white font-medium mb-3">
                                                {language === 'es' ? 'Acciones' : 'Actions'}
                                            </h3>
                                            <div className="space-y-3">
                                                <Link
                                                    href="/security"
                                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-slate-300 group-hover:text-white transition-colors">
                                                            {language === 'es' ? 'Ver Centro de Confianza' : 'View Trust Center'}
                                                        </span>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-slate-500" />
                                                </Link>
                                                <button className="flex items-center justify-between w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-red-500/30 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                        <span className="text-slate-300 group-hover:text-white transition-colors">
                                                            {language === 'es' ? 'Eliminar todos mis datos' : 'Delete all my data'}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            </>
                        )}

                        {/* ============ SUBSCRIPTION TAB ============ */}
                        {activeTab === 'subscription' && (
                            <>
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                                >
                                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-purple-400" />
                                        {language === 'es' ? 'Tu Suscripción' : 'Your Subscription'}
                                    </h2>

                                    {/* Current Plan */}
                                    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-slate-400 text-sm">
                                                    {language === 'es' ? 'Plan actual' : 'Current plan'}
                                                </p>
                                                <p className="text-2xl font-bold text-white mt-1">
                                                    {subscription.plan === 'free' ? 'Free' :
                                                        subscription.plan === 'pro' ? 'Pro' : 'Enterprise'}
                                                </p>
                                            </div>
                                            {subscription.plan === 'free' && (
                                                <Link
                                                    href="/pricing"
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                    {language === 'es' ? 'Actualizar a Pro' : 'Upgrade to Pro'}
                                                </Link>
                                            )}
                                        </div>

                                        {/* Usage */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-400">
                                                    {language === 'es' ? 'Documentos este mes' : 'Documents this month'}
                                                </span>
                                                <span className="text-sm text-white">
                                                    {subscription.documentsUsed} / {subscription.documentsLimit}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                                                    style={{ width: `${(subscription.documentsUsed / subscription.documentsLimit) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <h3 className="text-white font-medium mb-3">
                                            {language === 'es' ? 'Características incluidas' : 'Included features'}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { label: language === 'es' ? '5 documentos/mes' : '5 documents/month', included: true },
                                                { label: language === 'es' ? 'Análisis con IA' : 'AI Analysis', included: true },
                                                { label: language === 'es' ? 'Calendario de renovaciones' : 'Renewal calendar', included: true },
                                                { label: language === 'es' ? 'Chat con agente' : 'Agent chat', included: subscription.plan !== 'free' },
                                                { label: language === 'es' ? 'Equipos' : 'Teams', included: subscription.plan !== 'free' },
                                                { label: language === 'es' ? 'Alertas por email' : 'Email alerts', included: subscription.plan !== 'free' },
                                            ].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Check className={`w-4 h-4 ${feature.included ? 'text-emerald-400' : 'text-slate-600'}`} />
                                                    <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                                                        {feature.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {subscription.plan !== 'free' && (
                                        <div className="mt-6 pt-6 border-t border-slate-700">
                                            <p className="text-sm text-slate-400">
                                                {language === 'es'
                                                    ? `Próxima renovación: ${subscription.nextRenewal || 'No establecido'}`
                                                    : `Next renewal: ${subscription.nextRenewal || 'Not set'}`}
                                            </p>
                                            <button className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                                                {language === 'es' ? 'Cancelar suscripción' : 'Cancel subscription'}
                                            </button>
                                        </div>
                                    )}
                                </motion.section>
                            </>
                        )}
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
