'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin, AdminContract, AdminStats } from '@/hooks/useAdmin';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import {
    Shield, Users, FileText, TrendingUp, Trash2, Eye, Loader2, AlertTriangle,
    Calendar, ArrowLeft, BarChart3, Activity, Clock, AlertCircle, Download,
    ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { convertToCSV } from '@/utils/export';
import Link from 'next/link';
import { toast } from 'sonner';

function AdminPanelContent() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();
    const { isAdmin, loading: adminLoading, getStats, getAllContracts, deleteAnyContract, getRecentActivity } = useAdmin();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [contracts, setContracts] = useState<AdminContract[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts'>('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Cleanup State ---
    const [isScanning, setIsScanning] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [orphanedFiles, setOrphanedFiles] = useState<string[]>([]);
    const [scanComplete, setScanComplete] = useState(false);

    // --- Cleanup Handlers ---
    const handleScan = async () => {
        try {
            setIsScanning(true);
            setScanComplete(false);
            // We need to call an API route for this because supabaseAdmin cannot run on client
            // Wait, src/utils/cleanup.ts uses supabaseAdmin which is SERVER ONLY.
            // We must create an API route for this.
            // ABORT: I cannot import cleanup.ts directly here. 
            // I will create the API route in the next step.
            // For now, let's assume the API exists: /api/admin/cleanup
            const res = await fetch('/api/admin/cleanup?action=scan');
            const data = await res.json();
            if (data.orphaned) {
                setOrphanedFiles(data.orphaned);
                setScanComplete(true);
                if (data.orphaned.length === 0) {
                    toast.success(language === 'es' ? 'Sistema limpio' : 'System is clean');
                } else {
                    toast.warning(language === 'es'
                        ? `${data.orphaned.length} archivos encontrados`
                        : `${data.orphaned.length} files found`);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    const handleCleanup = async () => {
        if (!confirm(language === 'es' ? '¿Eliminar archivos permanentemente?' : 'Delete files permanently?')) return;

        try {
            setIsCleaning(true);
            const res = await fetch('/api/admin/cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paths: orphanedFiles })
            });

            if (res.ok) {
                toast.success(language === 'es' ? 'Limpieza completada' : 'Cleanup complete');
                setOrphanedFiles([]);
            } else {
                throw new Error('Cleanup failed');
            }
        } catch (err) {
            toast.error('Cleanup failed');
        } finally {
            setIsCleaning(false);
        }
    };

    // --- Table State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof AdminContract; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // --- Filter & Sort Logic ---
    const filteredContracts = contracts.filter(contract =>
        contract.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.user_email && contract.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedContracts = [...filteredContracts].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue: any = a[key];
        let bValue: any = b[key];

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) {
            return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // --- Pagination Logic ---
    const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);
    const paginatedContracts = sortedContracts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: keyof AdminContract) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Check admin and load data
    useEffect(() => {
        const loadData = async () => {
            if (adminLoading) return;

            if (!isAdmin) {
                router.push('/');
                return;
            }

            try {
                setLoading(true);
                const [statsData, contractsData, activityData] = await Promise.all([
                    getStats(),
                    getAllContracts(),
                    getRecentActivity(),
                ]);
                setStats(statsData);
                setContracts(contractsData);
                setRecentActivity(activityData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAdmin, adminLoading, router, getStats, getAllContracts, getRecentActivity]);

    // Handle contract deletion
    const handleExport = () => {
        if (!contracts || contracts.length === 0) return;

        // Flatten data for export
        const exportData = contracts.map(c => ({
            ID: c.id,
            FileName: c.file_name,
            Sector: c.sector || 'N/A',
            UserEmail: c.user_email || 'Unknown',
            EffectiveDate: c.effective_date ? new Date(c.effective_date).toLocaleDateString() : '',
            RenewalDate: c.renewal_date ? new Date(c.renewal_date).toLocaleDateString() : '',
            ExtractedData: c.extracted_data ? JSON.stringify(c.extracted_data) : ''
        }));

        convertToCSV(exportData, `contracts_export_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleDelete = async (contractId: string, fileName: string) => {
        if (!confirm(language === 'es'
            ? `¿Eliminar "${fileName}"? Esta acción no se puede deshacer.`
            : `Delete "${fileName}"? This cannot be undone.`
        )) return;

        try {
            await deleteAnyContract(contractId);
            setContracts(prev => prev.filter(c => c.id !== contractId));
            if (stats) {
                setStats({ ...stats, totalContracts: stats.totalContracts - 1 });
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Loading state
    if (adminLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Header />
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Cargando panel de administración...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Not admin - redirect handled in useEffect
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Header />
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
                        <p className="text-slate-400">No tienes permisos de administrador.</p>
                        <Link href="/" className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/10 to-slate-900">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/25">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {language === 'es' ? 'Panel de Administración' : 'Admin Panel'}
                            </h1>
                            <p className="text-slate-400">
                                {language === 'es' ? 'Gestión completa del sistema' : 'Full system management'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
                    >
                        <Download className="w-4 h-4" />
                        {language === 'es' ? 'Exportar CSV' : 'Export CSV'}
                    </button>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'dashboard'
                                ? 'bg-red-500 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4 inline mr-2" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('contracts')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'contracts'
                                ? 'bg-red-500 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Contratos
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-300 text-sm font-medium">Total Contratos</p>
                                        <p className="text-4xl font-bold text-white mt-1">{stats?.totalContracts || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/20">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-300 text-sm font-medium">Este Mes</p>
                                        <p className="text-4xl font-bold text-white mt-1">{stats?.contractsThisMonth || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/20">
                                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-300 text-sm font-medium">Plantillas</p>
                                        <p className="text-4xl font-bold text-white mt-1">{stats?.activeTemplates || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-500/20">
                                        <Activity className="w-6 h-6 text-purple-400" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-300 text-sm font-medium">Admin</p>
                                        <p className="text-lg font-bold text-white mt-1 truncate">{user?.email?.split('@')[0]}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-500/20">
                                        <Shield className="w-6 h-6 text-amber-400" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* System Health Section */}
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-slate-400" />
                                {language === 'es' ? 'Salud del Sistema' : 'System Health'}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-white font-medium">
                                                {language === 'es' ? 'Limpieza de Almacenamiento' : 'Storage Cleanup'}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                {language === 'es'
                                                    ? 'Detectar y eliminar archivos huérfanos'
                                                    : 'Detect and remove orphaned files'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleScan}
                                            disabled={isScanning}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isScanning
                                                ? (language === 'es' ? 'Escaneando...' : 'Scanning...')
                                                : (language === 'es' ? 'Escanear' : 'Scan Now')
                                            }
                                        </button>
                                    </div>

                                    {orphanedFiles.length > 0 ? (
                                        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-red-400">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        {orphanedFiles.length} {language === 'es' ? 'archivos huérfanos' : 'orphaned files'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleCleanup}
                                                    disabled={isCleaning}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {isCleaning
                                                        ? (language === 'es' ? 'Limpiando...' : 'Cleaning...')
                                                        : (language === 'es' ? 'Limpiar Todo' : 'Clean All')
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    ) : scanComplete ? (
                                        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-sm">
                                                {language === 'es' ? 'El sistema está limpio' : 'System is clean'}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-400" />
                                Actividad Reciente
                            </h2>
                            <div className="space-y-3">
                                {recentActivity.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">No hay actividad reciente</p>
                                ) : (
                                    recentActivity.map((item, idx) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-slate-800">
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium truncate max-w-[300px]">{item.file_name}</p>
                                                    <p className="text-xs text-slate-500">{item.sector}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contracts Tab */}
                {activeTab === 'contracts' && (
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <h2 className="text-xl font-bold text-white mb-6">
                            Todos los Contratos ({contracts.length})
                        </h2>

                        {/* Controls */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                            <div className="relative group max-w-md w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={language === 'es' ? 'Buscar contrato, sector o usuario...' : 'Search contract, sector or user...'}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-slate-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    className="bg-slate-900/50 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500/50"
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                >
                                    <option value={10}>10 {language === 'es' ? 'por pág' : '/ page'}</option>
                                    <option value={25}>25 {language === 'es' ? 'por pág' : '/ page'}</option>
                                    <option value={50}>50 {language === 'es' ? 'por pág' : '/ page'}</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                            <table className="w-full">
                                <thead className="bg-slate-900/80">
                                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                                            onClick={() => handleSort('file_name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Archivo
                                                {sortConfig?.key === 'file_name' && (
                                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                                            onClick={() => handleSort('sector')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Sector
                                                {sortConfig?.key === 'sector' && (
                                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                                            onClick={() => handleSort('risk_score')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Riesgo
                                                {sortConfig?.key === 'risk_score' && (
                                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Fecha
                                                {sortConfig?.key === 'created_at' && (
                                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                                    {paginatedContracts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-slate-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="w-8 h-8 opacity-20" />
                                                    <p>{searchTerm ? (language === 'es' ? 'No se encontraron resultados' : 'No results found') : (language === 'es' ? 'No hay contratos' : 'No contracts')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedContracts.map((contract) => (
                                            <tr key={contract.id} className="group hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-all">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium truncate max-w-[200px]" title={contract.file_name}>
                                                                {contract.file_name}
                                                            </p>
                                                            {contract.user_email && (
                                                                <p className="text-xs text-slate-500">{contract.user_email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                                        {contract.sector || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {contract.risk_score !== null ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${contract.risk_score >= 7 ? 'bg-red-500' :
                                                                contract.risk_score >= 4 ? 'bg-amber-500' :
                                                                    'bg-emerald-500'
                                                                }`} />
                                                            <span className={`text-sm font-medium ${contract.risk_score >= 7 ? 'text-red-400' :
                                                                contract.risk_score >= 4 ? 'text-amber-400' :
                                                                    'text-emerald-400'
                                                                }`}>
                                                                {contract.risk_score}/10
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-sm">
                                                    {new Date(contract.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/contracts/${contract.id}`}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 border border-transparent transition-all"
                                                            title={language === 'es' ? 'Ver detalles' : 'View details'}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(contract.id, contract.file_name)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all"
                                                            title={language === 'es' ? 'Eliminar' : 'Delete'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 border-t border-slate-700/50 pt-4">
                                <p className="text-sm text-slate-400">
                                    {language === 'es'
                                        ? `Mostrando ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredContracts.length)} de ${filteredContracts.length}`
                                        : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredContracts.length)} of ${filteredContracts.length}`
                                    }
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-medium text-white px-2">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <LanguageProvider>
            <AdminPanelContent />
        </LanguageProvider>
    );
}
