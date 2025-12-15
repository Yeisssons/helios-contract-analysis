'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
    FileText,
    Calendar,
    Clock,
    Search,
    Eye,
    EyeOff,
    Trash2,
    Building2,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight,
    ChevronDown,
    ChevronUp,
    BarChart3,
    Shield,
    Zap,
    Target,
    TrendingUp,
    Filter,
    Grid3X3,
    List,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDataPointTranslation } from '@/constants/dataPointTranslations';

interface AnalysisRecord {
    id: string;
    fileName: string;
    filePath?: string;
    contractType: string;
    sector?: string;
    effectiveDate?: string;
    renewalDate?: string;
    riskScore?: number;
    createdAt?: string;
    extractedData?: Record<string, any>;
    abusiveClauses?: (string | { reference?: string; explanation?: string; severity?: string })[];
    alerts?: (string | { message: string; severity: string })[];
    summary?: string;
}

function AnalysisHistoryContent() {
    const { language } = useLanguage();
    const router = useRouter();
    const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [summaryId, setSummaryId] = useState<string | null>(null);  // For quick summary view
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    // Handle URL parameter for auto-expand
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const expandParam = params.get('expand');
        if (expandParam) {
            setExpandedId(expandParam);
            // Clean URL after reading
            window.history.replaceState({}, '', '/analysis');
        }
    }, []);

    useEffect(() => {
        async function fetchAnalyses() {
            try {
                const response = await fetch('/api/contracts');
                const result = await response.json();

                if (result.success && result.data) {
                    const transformedData = result.data.map((c: any) => ({
                        id: c.id,
                        fileName: c.fileName || c.file_name,
                        filePath: c.filePath || c.file_path,
                        contractType: c.contractType || c.contract_type || 'General',
                        sector: c.sector || 'legal',
                        effectiveDate: c.effectiveDate || c.effective_date,
                        renewalDate: c.renewalDate || c.renewal_date,
                        riskScore: c.riskScore || c.risk_score,
                        createdAt: c.createdAt || c.created_at,
                        extractedData: c.extractedData || c.extracted_data || {},
                        abusiveClauses: c.abusiveClauses || c.abusive_clauses || [],
                        alerts: c.alerts || [],
                        summary: c.summary,
                    }));
                    setAnalyses(transformedData);
                }
            } catch (error) {
                console.error('Error fetching analyses:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAnalyses();
    }, []);

    const sectors = ['all', ...new Set(analyses.map(a => a.sector).filter(Boolean))];

    const filteredAnalyses = analyses.filter(a => {
        const matchesSearch = a.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.contractType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = selectedSector === 'all' || a.sector === selectedSector;
        return matchesSearch && matchesSector;
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const getRiskColor = (score?: number) => {
        if (!score) return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
        if (score < 4) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
        if (score < 7.5) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
    };

    const getSectorLabel = (sectorId?: string) => {
        const sectorLabels: Record<string, { es: string; en: string }> = {
            'financial': { es: 'Financiero', en: 'Financial' },
            'technology': { es: 'Tecnología', en: 'Technology' },
            'construction': { es: 'Construcción', en: 'Construction' },
            'healthcare': { es: 'Salud', en: 'Healthcare' },
            'real_estate': { es: 'Inmobiliario', en: 'Real Estate' },
            'public_sector': { es: 'Sector Público', en: 'Public Sector' },
            'hr': { es: 'Laboral', en: 'HR' },
            'legal': { es: 'Legal', en: 'Legal' },
            'insurance': { es: 'Seguros', en: 'Insurance' },
            'utilities': { es: 'Utilities', en: 'Utilities' },
            'logistics': { es: 'Logística', en: 'Logistics' },
            'pharma': { es: 'Farmacéutica', en: 'Pharmaceutical' },
        };
        const label = sectorLabels[sectorId || 'legal'] || { es: sectorId, en: sectorId };
        return language === 'es' ? label.es : label.en;
    };

    const toggleExpanded = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleViewDocument = (id: string) => {
        router.push(`/contracts/${id}`);
    };

    const handleDelete = async (id: string, fileName: string) => {
        if (!confirm(language === 'es'
            ? `¿Estás seguro de eliminar el análisis de "${fileName}"?`
            : `Are you sure you want to delete the analysis of "${fileName}"?`
        )) return;

        try {
            const response = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setAnalyses(prev => prev.filter(a => a.id !== id));
                if (expandedId === id) setExpandedId(null);
            }
        } catch (error) {
            console.error('Error deleting analysis:', error);
        }
    };

    // Stats
    const totalAnalyses = analyses.length;
    const highRiskCount = analyses.filter(a => (a.riskScore || 0) >= 7.5).length;
    const alertsCount = analyses.filter(a => (a.abusiveClauses?.length || 0) > 0).length;
    const avgRisk = analyses.length > 0
        ? (analyses.reduce((sum, a) => sum + (a.riskScore || 0), 0) / analyses.length).toFixed(1)
        : '0';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10">
                <Header />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with unique branding */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/25">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {language === 'es' ? 'Centro de Análisis' : 'Analysis Center'}
                                </h1>
                                <p className="text-slate-400">
                                    {language === 'es'
                                        ? 'Explora y gestiona todos tus análisis de IA'
                                        : 'Explore and manage all your AI analyses'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Stats Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30 p-5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm text-purple-300/80">
                                        {language === 'es' ? 'Total' : 'Total'}
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{totalAnalyses}</p>
                                <p className="text-xs text-purple-400/60 mt-1">
                                    {language === 'es' ? 'análisis realizados' : 'analyses performed'}
                                </p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/30 p-5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-amber-400" />
                                    <span className="text-sm text-amber-300/80">
                                        {language === 'es' ? 'Riesgo Medio' : 'Avg Risk'}
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{avgRisk}</p>
                                <p className="text-xs text-amber-400/60 mt-1">/10</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/30 p-5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <span className="text-sm text-red-300/80">
                                        {language === 'es' ? 'Alto Riesgo' : 'High Risk'}
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{highRiskCount}</p>
                                <p className="text-xs text-red-400/60 mt-1">
                                    {language === 'es' ? 'requieren atención' : 'need attention'}
                                </p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/30 p-5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    <span className="text-sm text-emerald-300/80">
                                        {language === 'es' ? 'Con Alertas' : 'With Alerts'}
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{alertsCount}</p>
                                <p className="text-xs text-emerald-400/60 mt-1">
                                    {language === 'es' ? 'cláusulas detectadas' : 'clauses detected'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-wrap gap-4 items-center mb-6">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[250px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder={language === 'es' ? 'Buscar análisis...' : 'Search analyses...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        {/* Sector Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {sectors.map(sector => (
                                <button
                                    key={sector}
                                    onClick={() => setSelectedSector(sector || 'all')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedSector === sector
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    {sector === 'all'
                                        ? (language === 'es' ? 'Todos' : 'All')
                                        : getSectorLabel(sector)}
                                </button>
                            ))}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Grid3X3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Featured Expanded Analysis Section - Shows at top when an analysis is expanded */}
                    <AnimatePresence>
                        {expandedId && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mb-8"
                            >
                                {(() => {
                                    const expandedAnalysis = analyses.find(a => a.id === expandedId);
                                    if (!expandedAnalysis) return null;
                                    const riskColors = getRiskColor(expandedAnalysis.riskScore);

                                    return (
                                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-800/50 to-slate-800/50 border-2 border-purple-500/50 shadow-xl shadow-purple-500/10">
                                            {/* Header Bar */}
                                            <div className="flex items-center justify-between px-6 py-4 bg-purple-500/10 border-b border-purple-500/30">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-xl ${riskColors.bg} ${riskColors.border} border flex items-center justify-center`}>
                                                        <span className={`text-2xl font-bold ${riskColors.text}`}>
                                                            {expandedAnalysis.riskScore?.toFixed(0) || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">{expandedAnalysis.fileName}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                                                                {getSectorLabel(expandedAnalysis.sector)}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{formatDate(expandedAnalysis.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setExpandedId(null)}
                                                    className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                                                    title={language === 'es' ? 'Cerrar' : 'Close'}
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Extracted Data */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                                            <FileText className="w-4 h-4" />
                                                            {language === 'es' ? 'Datos Extraídos' : 'Extracted Data'}
                                                            <span className="text-xs text-slate-500">({Object.keys(expandedAnalysis.extractedData || {}).length})</span>
                                                        </h4>
                                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                            {Object.entries(expandedAnalysis.extractedData || {}).map(([key, value]) => (
                                                                <div key={key} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-purple-500/30 transition-colors">
                                                                    <p className="text-xs text-slate-500 mb-1">
                                                                        {getDataPointTranslation(key, language)}
                                                                    </p>
                                                                    <p className="text-sm text-white">
                                                                        {String(value) || '-'}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                            {Object.keys(expandedAnalysis.extractedData || {}).length === 0 && (
                                                                <p className="text-slate-500 text-sm italic py-4 text-center">
                                                                    {language === 'es' ? 'Sin datos extraídos' : 'No data extracted'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Alerts & Clauses */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            {language === 'es' ? 'Alertas y Cláusulas' : 'Alerts & Clauses'}
                                                            <span className="text-xs text-slate-500">({expandedAnalysis.abusiveClauses?.length || 0})</span>
                                                        </h4>
                                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                            {(expandedAnalysis.abusiveClauses || []).map((clause: any, idx: number) => (
                                                                <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors">
                                                                    <p className="text-sm text-red-300">
                                                                        ⚠️ {typeof clause === 'string' ? clause : clause.description || clause.text || JSON.stringify(clause)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                            {(expandedAnalysis.alerts || []).map((alert: any, idx: number) => (
                                                                <div key={`alert-${idx}`} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                                                                    <p className="text-sm text-amber-300">
                                                                        ⚠️ {typeof alert === 'string' ? alert : alert.message || JSON.stringify(alert)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                            {(expandedAnalysis.abusiveClauses?.length || 0) === 0 && (expandedAnalysis.alerts?.length || 0) === 0 && (
                                                                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                                                                    <p className="text-sm text-emerald-400 flex items-center justify-center gap-2">
                                                                        <CheckCircle className="w-5 h-5" />
                                                                        {language === 'es' ? '¡Sin alertas detectadas!' : 'No alerts detected!'}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Summary if available */}
                                                {expandedAnalysis.summary && (
                                                    <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-700/30">
                                                        <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                                            {language === 'es' ? 'Resumen' : 'Summary'}
                                                        </h4>
                                                        <p className="text-sm text-slate-300">{expandedAnalysis.summary}</p>
                                                    </div>
                                                )}

                                                {/* Action buttons */}
                                                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
                                                    <button
                                                        onClick={() => handleViewDocument(expandedAnalysis.id)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                        {language === 'es' ? 'Ver PDF' : 'View PDF'}
                                                    </button>
                                                    <button
                                                        onClick={() => setExpandedId(null)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors"
                                                    >
                                                        <EyeOff className="w-4 h-4" />
                                                        {language === 'es' ? 'Cerrar Análisis' : 'Close Analysis'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Analysis Cards */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        </div>
                    ) : filteredAnalyses.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <BarChart3 className="w-10 h-10 text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-lg">
                                {searchTerm || selectedSector !== 'all'
                                    ? (language === 'es' ? 'No se encontraron análisis' : 'No analyses found')
                                    : (language === 'es' ? 'Aún no hay análisis' : 'No analyses yet')}
                            </p>
                            <p className="text-slate-500 text-sm mt-2">
                                {language === 'es' ? 'Sube un documento para comenzar' : 'Upload a document to get started'}
                            </p>
                        </div>
                    ) : (
                        <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
                            {filteredAnalyses.map((analysis, index) => {
                                const riskColors = getRiskColor(analysis.riskScore);
                                const isExpanded = expandedId === analysis.id;
                                const dataPointsCount = Object.keys(analysis.extractedData || {}).length;

                                return (
                                    <motion.div
                                        key={analysis.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`group relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-xl border transition-all duration-300 ${isExpanded
                                            ? 'border-purple-500/50 shadow-xl shadow-purple-500/10'
                                            : 'border-slate-700/50 hover:border-slate-600/50'
                                            } ${viewMode === 'cards' && isExpanded ? 'lg:col-span-2' : ''}`}
                                    >
                                        {/* Card Header */}
                                        <div className="p-5">
                                            <div className="flex items-start gap-4">
                                                {/* Risk Score Circle */}
                                                <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl ${riskColors.bg} ${riskColors.border} border flex items-center justify-center`}>
                                                    <span className={`text-2xl font-bold ${riskColors.text}`}>
                                                        {analysis.riskScore?.toFixed(0) || '-'}
                                                    </span>
                                                    <span className={`absolute -bottom-1 text-[10px] ${riskColors.text}`}>
                                                        /10
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-semibold text-lg truncate mb-1">
                                                        {analysis.fileName}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium">
                                                            {getSectorLabel(analysis.sector)}
                                                        </span>
                                                        <span className="text-slate-500">•</span>
                                                        <span className="text-slate-400 flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatDate(analysis.createdAt)}
                                                        </span>
                                                        {(analysis.abusiveClauses?.length || 0) > 0 && (
                                                            <>
                                                                <span className="text-slate-500">•</span>
                                                                <span className="text-red-400 flex items-center gap-1">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                    {analysis.abusiveClauses?.length} {language === 'es' ? 'alertas' : 'alerts'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {/* Quick Summary Button */}
                                                    <button
                                                        onClick={() => setSummaryId(summaryId === analysis.id ? null : analysis.id)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${summaryId === analysis.id
                                                            ? 'bg-amber-600 text-white'
                                                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                                            }`}
                                                        title={language === 'es' ? 'Resumen rápido' : 'Quick summary'}
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        <span className="hidden sm:inline text-sm">
                                                            {language === 'es' ? 'Resumen' : 'Summary'}
                                                        </span>
                                                    </button>
                                                    {/* Full Analysis Button */}
                                                    <button
                                                        onClick={() => toggleExpanded(analysis.id)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${isExpanded
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                                            }`}
                                                        title={language === 'es' ? 'Análisis completo' : 'Full analysis'}
                                                    >
                                                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        <span className="hidden sm:inline text-sm">
                                                            {language === 'es'
                                                                ? (isExpanded ? 'Ocultar' : 'Completo')
                                                                : (isExpanded ? 'Hide' : 'Full')}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDocument(analysis.id)}
                                                        className="p-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                                        title={language === 'es' ? 'Ver PDF' : 'View PDF'}
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(analysis.id, analysis.fileName)}
                                                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title={language === 'es' ? 'Eliminar' : 'Delete'}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Quick Stats Row */}
                                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/50">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Zap className="w-4 h-4 text-amber-400" />
                                                    <span className="text-slate-400">
                                                        {dataPointsCount} {language === 'es' ? 'datos' : 'data points'}
                                                    </span>
                                                </div>
                                                {analysis.renewalDate && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-blue-400" />
                                                        <span className="text-slate-400">
                                                            {language === 'es' ? 'Renueva' : 'Renews'}: {formatDate(analysis.renewalDate)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Summary Section */}
                                        <AnimatePresence>
                                            {summaryId === analysis.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 py-4 bg-amber-500/5 border-t border-amber-500/20">
                                                        <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                                                            <Zap className="w-4 h-4" />
                                                            {language === 'es' ? 'Resumen Rápido' : 'Quick Summary'}
                                                        </h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                                <p className="text-xs text-slate-500 mb-1">{language === 'es' ? 'Riesgo' : 'Risk'}</p>
                                                                <p className={`text-lg font-bold ${getRiskColor(analysis.riskScore).text}`}>
                                                                    {analysis.riskScore?.toFixed(1) || '-'}/10
                                                                </p>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                                <p className="text-xs text-slate-500 mb-1">{language === 'es' ? 'Alertas' : 'Alerts'}</p>
                                                                <p className="text-lg font-bold text-red-400">
                                                                    {analysis.abusiveClauses?.length || 0}
                                                                </p>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                                <p className="text-xs text-slate-500 mb-1">{language === 'es' ? 'Datos' : 'Data'}</p>
                                                                <p className="text-lg font-bold text-purple-400">
                                                                    {Object.keys(analysis.extractedData || {}).length}
                                                                </p>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                                <p className="text-xs text-slate-500 mb-1">{language === 'es' ? 'Renovación' : 'Renewal'}</p>
                                                                <p className="text-sm font-medium text-blue-400 truncate">
                                                                    {analysis.renewalDate ? formatDate(analysis.renewalDate) : '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {/* Top 3 Alerts Preview */}
                                                        {(analysis.abusiveClauses?.length || 0) > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-slate-500 mb-2">{language === 'es' ? 'Alertas principales:' : 'Top alerts:'}</p>
                                                                <div className="space-y-1">
                                                                    {analysis.abusiveClauses?.slice(0, 3).map((clause: any, idx: number) => (
                                                                        <div key={idx} className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded truncate">
                                                                            ⚠️ {typeof clause === 'string' ? clause.substring(0, 100) : (clause.description || clause.text || '').substring(0, 100)}...
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Expanded Analysis View */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 border-t border-slate-700/50">
                                                        <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Extracted Data */}
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                                                    <FileText className="w-4 h-4" />
                                                                    {language === 'es' ? 'Datos Extraídos' : 'Extracted Data'}
                                                                </h4>
                                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                                                    {Object.entries(analysis.extractedData || {}).map(([key, value]) => (
                                                                        <div key={key} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                                                                            <p className="text-xs text-slate-500 mb-1">
                                                                                {getDataPointTranslation(key, language)}
                                                                            </p>
                                                                            <p className="text-sm text-white">
                                                                                {String(value) || '-'}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                    {Object.keys(analysis.extractedData || {}).length === 0 && (
                                                                        <p className="text-slate-500 text-sm italic">
                                                                            {language === 'es' ? 'Sin datos extraídos' : 'No data extracted'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Alerts & Clauses */}
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                                                                    <AlertTriangle className="w-4 h-4" />
                                                                    {language === 'es' ? 'Alertas y Cláusulas' : 'Alerts & Clauses'}
                                                                </h4>
                                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                                                    {(analysis.abusiveClauses || []).map((clause: any, idx: number) => (
                                                                        <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                                            <p className="text-sm text-red-300">
                                                                                {typeof clause === 'string' ? clause : clause.description || clause.text || JSON.stringify(clause)}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                    {(analysis.alerts || []).map((alert: any, idx: number) => (
                                                                        <div key={`alert-${idx}`} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                                            <p className="text-sm text-amber-300">
                                                                                {typeof alert === 'string' ? alert : alert.message || JSON.stringify(alert)}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                    {(analysis.abusiveClauses?.length || 0) === 0 && (analysis.alerts?.length || 0) === 0 && (
                                                                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                                            <p className="text-sm text-emerald-400 flex items-center gap-2">
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                {language === 'es' ? 'No se detectaron alertas' : 'No alerts detected'}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Summary if available */}
                                                        {analysis.summary && (
                                                            <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700/30">
                                                                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                                                                    {language === 'es' ? 'RESUMEN' : 'SUMMARY'}
                                                                </h4>
                                                                <p className="text-sm text-slate-300">{analysis.summary}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function AnalysisHistoryPage() {
    return (
        <LanguageProvider defaultLanguage="es">
            <ErrorBoundary fallback={
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                    <div className="bg-slate-800 p-6 rounded-xl border border-red-500/30 text-center max-w-md">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                        <p className="text-slate-400 mb-4">We encountered an error loading the analysis history.</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-purple-600 rounded-lg text-white">
                            Reload Page
                        </button>
                    </div>
                </div>
            }>
                <AnalysisHistoryContent />
            </ErrorBoundary>
        </LanguageProvider>
    );
}
