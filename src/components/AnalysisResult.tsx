'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Shield,
    AlertTriangle,
    Calendar,
    Clock,
    FileText,
    Users,
    Gauge,
    X,
    CheckCircle,
    AlertCircle,
    ShieldAlert,
    CalendarPlus,
    Mail,
    Copy,
    Check,
    Sparkles,
    Edit2,
    RefreshCw,
    ExternalLink,
    ChevronDown
} from 'lucide-react';
import {
    downloadCalendarEvent,
    generateCancellationDraft,
    copyToClipboard,
    generateSectorEmail,
    EMAIL_TEMPLATES_BY_SECTOR
} from '@/utils/businessTools';
import TagSelector from './TagSelector';
import ReanalysisModal from './ReanalysisModal';

export interface ContractAnalysis {
    id?: string;
    fileName: string;
    filePath?: string;
    contractType: string;
    effectiveDate: string;
    renewalDate: string;
    noticePeriodDays: number;
    terminationClauseReference: string;
    summary?: string;
    parties?: string[];
    alerts?: (string | { message: string; severity: string })[];
    riskScore?: number;
    abusiveClauses?: (string | { reference?: string; explanation?: string; severity?: string })[];
    customQuery?: string;
    customAnswer?: string;
    extractedData?: Record<string, string>;
    dataSources?: Record<string, string>;
    requestedDataPoints?: string[];
    sector?: string;
    tags?: string[];
    userNotes?: string;
    lastModified?: string;
}

interface AnalysisResultProps {
    analysis: ContractAnalysis;
    onDismiss?: () => void;
    onRename?: (id: string, newName: string) => void;
    onUpdateTags?: (id: string, tags: string[]) => void;
    onReanalyze?: (id: string, dataPoints: string[]) => Promise<void>;
    fileAvailable?: boolean;
}

export default function AnalysisResult({ analysis, onDismiss, onRename, onUpdateTags, onReanalyze, fileAvailable = false }: AnalysisResultProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailDraft, setEmailDraft] = useState('');
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);
    const [copiedEmail, setCopiedEmail] = useState(false);

    // Management state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(analysis.fileName);
    const [showReanalysisModal, setShowReanalysisModal] = useState(false);

    const navigateToPdfWithSearch = (searchTerm: string) => {
        if (!analysis.id) return;
        const encodedSearch = encodeURIComponent(searchTerm.substring(0, 100));
        router.push(`/contracts/${analysis.id}?search=${encodedSearch}`);
    };

    const getRiskColor = (score: number) => {
        if (score < 4) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: t('riskLow') };
        if (score < 7.5) return { bg: 'bg-amber-500/10', text: 'text-amber-400', label: t('riskMedium') };
        return { bg: 'bg-red-500/10', text: 'text-red-400', label: t('riskHigh') };
    };

    const riskInfo = getRiskColor(analysis.riskScore ?? 5);

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const handleScheduleReminder = () => {
        downloadCalendarEvent(analysis);
        setActionFeedback(t('calendarDownloaded'));
        setTimeout(() => setActionFeedback(null), 3000);
    };

    const [showEmailDropdown, setShowEmailDropdown] = useState(false);

    const handleDraftEmail = (emailType?: string) => {
        const sector = analysis.sector || 'legal';
        if (emailType) {
            const draft = generateSectorEmail(analysis, sector, emailType, language);
            setEmailDraft(draft);
        } else {
            const draft = generateCancellationDraft(analysis);
            setEmailDraft(draft);
        }
        setShowEmailModal(true);
        setShowEmailDropdown(false);
    };

    const handleCopyEmail = async () => {
        const success = await copyToClipboard(emailDraft);
        if (success) {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
    };

    const hasAbusiveClauses = analysis.abusiveClauses && analysis.abusiveClauses.length > 0;
    const hasExtractedData = analysis.extractedData && Object.keys(analysis.extractedData).length > 0;

    return (
        <>
            <div className="relative overflow-hidden rounded-2xl glass border border-white/5 shadow-2xl ring-1 ring-white/10 decoration-clone p-0">
                {/* Header gradient - refined */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-purple-500/50" />

                {/* Card content */}
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                                    {t('latestAnalysis')}
                                </span>
                                {hasAbusiveClauses && (
                                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20 flex items-center gap-1.5">
                                        <ShieldAlert className="w-3 h-3" />
                                        {t('legalReviewRecommended')}
                                    </span>
                                )}
                            </div>

                            {/* Filename with Inline Edit */}
                            <div className="flex items-center gap-3 mb-2 group">
                                {isEditingName ? (
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                onRename?.(analysis.id!, editedName);
                                                setIsEditingName(false);
                                            } else if (e.key === 'Escape') {
                                                setEditedName(analysis.fileName);
                                                setIsEditingName(false);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (editedName !== analysis.fileName) {
                                                onRename?.(analysis.id!, editedName);
                                            }
                                            setIsEditingName(false);
                                        }}
                                        autoFocus
                                        className="text-2xl font-bold text-white bg-white/5 px-3 py-1 rounded-lg border border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 max-w-lg"
                                    />
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold text-white truncate max-w-lg tracking-tight" title={analysis.fileName}>
                                            {analysis.fileName}
                                        </h3>
                                        {onRename && analysis.id && (
                                            <button
                                                onClick={() => setIsEditingName(true)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg transition-all text-zinc-500 hover:text-white"
                                                title={language === 'es' ? 'Renombrar' : 'Rename'}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <p className="text-sm text-zinc-400 font-medium tracking-wide">
                                {analysis.contractType}
                            </p>

                            {/* Tags and Re-analyze Controls */}
                            <div className="flex items-center gap-3 mt-4 flex-wrap">
                                {/* Tag Selector */}
                                {onUpdateTags && analysis.id && (
                                    <TagSelector
                                        selectedTags={analysis.tags || []}
                                        onTagsChange={(tags) => onUpdateTags(analysis.id!, tags)}
                                    />
                                )}

                                {/* Re-analyze Button */}
                                {onReanalyze && analysis.id && (
                                    <button
                                        onClick={() => setShowReanalysisModal(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 rounded-lg text-xs font-medium text-purple-300 transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        {language === 'es' ? 'Re-analizar' : 'Re-analyze'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label={t('dismiss')}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Main content grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left column - Summary & Parties */}
                        <div className="space-y-6">
                            {/* Summary */}
                            {analysis.summary && (
                                <div className="space-y-3 group">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-primary transition-colors">
                                        <FileText className="w-4 h-4" />
                                        {t('summary')}
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                                        <p className="text-sm text-zinc-300 leading-relaxed text-pretty">
                                            {analysis.summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Custom Answer / Dato Personalizado */}
                            {analysis.customAnswer && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                                        <Sparkles className="w-4 h-4" />
                                        {language === 'es' ? 'Consulta IA' : 'AI Query'}
                                    </div>
                                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                        {analysis.customQuery && (
                                            <p className="text-xs text-purple-400 mb-2 italic border-b border-purple-500/10 pb-2">
                                                "{analysis.customQuery}"
                                            </p>
                                        )}
                                        <p className="text-sm text-zinc-300 leading-relaxed">
                                            {analysis.customAnswer}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Parties */}
                            {analysis.parties && analysis.parties.length > 0 && (
                                <div className="space-y-3 group">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                                        <Users className="w-4 h-4" />
                                        {t('parties')}
                                    </div>
                                    <div className="pl-1">
                                        <ul className="space-y-2">
                                            {analysis.parties.map((party, index) => (
                                                <li key={index} className="text-sm text-zinc-300 flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                    {party}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Termination Clause */}
                            <div className="space-y-3 group">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-amber-400 transition-colors">
                                    <Shield className="w-4 h-4" />
                                    {t('terminationClause')}
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500/20 to-transparent"></div>
                                    <p className="text-sm text-zinc-400 italic pl-3">
                                        "{analysis.terminationClauseReference}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Dates & Risk */}
                        <div className="space-y-6">
                            {/* Key Dates */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    <Calendar className="w-4 h-4" />
                                    {t('keyDates')}
                                </div>

                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                        <span className="text-sm text-zinc-500 font-medium">{t('effectiveDate')}</span>
                                        <span className="text-sm font-semibold text-zinc-200 font-mono tracking-tight">
                                            {formatDate(analysis.effectiveDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10 hover:border-amber-500/20 transition-all relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm text-amber-500/80 font-medium z-10">{t('renewalDate')}</span>
                                        <span className="text-sm font-semibold text-amber-400 font-mono tracking-tight z-10">
                                            {formatDate(analysis.renewalDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-zinc-500" />
                                            <span className="text-sm text-zinc-500 font-medium">{t('noticePeriod')}</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300">
                                            {analysis.noticePeriodDays}
                                            <span className="text-xs text-zinc-500 font-normal uppercase">{t('days')}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Score */}
                            {analysis.riskScore !== undefined && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        <Gauge className="w-4 h-4" />
                                        {t('riskScore')}
                                    </div>

                                    <div className="p-1">
                                        <div className={`flex items-center gap-6 p-5 rounded-2xl ${riskInfo.bg} border border-white/5 relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-black/20"
                                                        strokeDasharray="100, 100"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        className={riskInfo.text}
                                                        strokeDasharray={`${(analysis.riskScore / 10) * 100}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className={`text-2xl font-bold ${riskInfo.text}`}>
                                                        {analysis.riskScore.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <p className={`text-lg font-bold ${riskInfo.text} mb-1`}>
                                                    {riskInfo.label}
                                                </p>
                                                <div className="h-1.5 w-32 bg-black/20 rounded-full overflow-hidden mb-2">
                                                    <div className={`h-full ${riskInfo.text.replace('text-', 'bg-')} opacity-80`} style={{ width: `${(analysis.riskScore / 10) * 100}%` }} />
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium">
                                                    {language === 'es' ? 'Puntuación de riesgo AI' : 'AI Risk Score'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Data Audit Section */}
                    {analysis.requestedDataPoints && analysis.requestedDataPoints.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                            {(() => {
                                                const sectorNames = {
                                                    'real_estate': { es: 'Inmobiliario', en: 'Real Estate' },
                                                    'public_sector': { es: 'Sector Público', en: 'Public Sector' },
                                                    'hr': { es: 'Laboral / RRHH', en: 'HR / Employment' },
                                                    'legal': { es: 'Legal / Corporativo', en: 'Legal / Corporate' },
                                                    'financial': { es: 'Servicios Financieros', en: 'Financial Services' },
                                                    'technology': { es: 'Tecnología / SaaS', en: 'Technology / SaaS' },
                                                    'construction': { es: 'Construcción', en: 'Construction' },
                                                    'healthcare': { es: 'Salud / Médico', en: 'Healthcare' },
                                                    'insurance': { es: 'Seguros Corporativos', en: 'Corporate Insurance' },
                                                    'utilities': { es: 'Utilities / Telecom', en: 'Enterprise Utilities' },
                                                    'logistics': { es: 'Logística Industrial', en: 'Industrial Logistics' },
                                                    'pharma': { es: 'Farmacéutica', en: 'Pharmaceutical' }
                                                };
                                                const sectorKey = (analysis.sector || 'legal') as keyof typeof sectorNames;
                                                const sectorName = sectorNames[sectorKey] || { es: 'General', en: 'General' };
                                                return language === 'es'
                                                    ? `Auditoría: ${sectorName.es}`
                                                    : `Audit: ${sectorName.en}`;
                                            })()}
                                        </h4>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {analysis.requestedDataPoints.length} {t('dataPoints')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Simple Stats */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        <span className="text-zinc-400">{language === 'es' ? 'Encontrados' : 'Found'}</span>
                                        <span className="font-bold text-white ml-1">
                                            {analysis.requestedDataPoints.filter(p => analysis.extractedData?.[p] && analysis.extractedData?.[p] !== 'No especificado' && analysis.extractedData?.[p] !== 'Not specified').length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {analysis.requestedDataPoints.map(point => {
                                    const value = analysis.extractedData?.[point];
                                    const source = analysis.dataSources?.[point];
                                    const found = value && value !== 'No especificado' && value !== 'Not specified';

                                    return (
                                        <button
                                            key={point}
                                            onClick={() => {
                                                if (found && source) navigateToPdfWithSearch(source);
                                                else if (found && value) navigateToPdfWithSearch(value as string);
                                            }}
                                            disabled={!found}
                                            className={`relative group flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 ${found
                                                ? 'bg-emerald-500/[0.03] border-emerald-500/20 hover:bg-emerald-500/[0.08] hover:border-emerald-500/40 cursor-pointer'
                                                : 'bg-white/[0.01] border-white/5 opacity-60 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between w-full mb-2">
                                                <p className={`text-xs font-semibold uppercase tracking-wide ${found ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                                    {point}
                                                </p>
                                                {found ? (
                                                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
                                                        <CheckCircle className="w-3 h-3" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1 rounded-full bg-white/5 text-zinc-600">
                                                        <X className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>

                                            <p className={`text-sm leading-relaxed line-clamp-2 ${found ? 'text-zinc-200' : 'text-zinc-600 italic'}`}>
                                                {found
                                                    ? (typeof value === 'object' && value !== null ? JSON.stringify(value) : value)
                                                    : (language === 'es' ? 'No detectado' : 'Not detected')}
                                            </p>

                                            {found && (
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Abusive Clauses Section */}
                    {hasAbusiveClauses && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <h4 className="text-sm font-bold uppercase tracking-wider">
                                    {t('legalAudit')} - {t('abusiveClauses')}
                                </h4>
                            </div>
                            <div className="space-y-3">
                                {analysis.abusiveClauses?.map((clause, index) => {
                                    const clauseText = typeof clause === 'object' && clause !== null
                                        ? `${(clause as any).reference || ''}: ${(clause as any).explanation || ''}`
                                        : String(clause);

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => navigateToPdfWithSearch(clauseText)}
                                            className="group flex flex-col md:flex-row md:items-start gap-4 p-5 rounded-xl bg-red-500/5 border border-red-500/20 cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-red-200/90 leading-relaxed font-medium">
                                                    {clauseText}
                                                </p>
                                                <p className="text-xs text-red-400/60 mt-2 font-medium uppercase tracking-wide flex items-center gap-1">
                                                    {language === 'es' ? 'Clic para localizar' : 'Click to locate'}
                                                    <ExternalLink className="w-3 h-3" />
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Alerts section */}
                    {analysis.alerts && analysis.alerts.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 mb-4 text-amber-400">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <h4 className="text-sm font-bold uppercase tracking-wider">
                                    {t('alerts')}
                                </h4>
                            </div>
                            <div className="space-y-3">
                                {analysis.alerts.map((alert, index) => {
                                    const alertText = typeof alert === 'object' && alert !== null
                                        ? JSON.stringify(alert)
                                        : String(alert);

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => navigateToPdfWithSearch(alertText)}
                                            className="group flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 cursor-pointer hover:bg-amber-500/10 transition-all"
                                        >
                                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-zinc-300 group-hover:text-amber-100 transition-colors">
                                                {alertText}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No alerts message */}
                    {(!analysis.alerts || analysis.alerts.length === 0) && !hasAbusiveClauses && !hasExtractedData && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-center p-8 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-400">{t('noAlerts')}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{language === 'es' ? 'El documento parece seguro' : 'Document appears safe'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons - Prominent Stylings */}
                    <div className="mt-10 pt-8 border-t border-white/5">
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {/* Schedule Reminder Button */}
                            <button
                                onClick={handleScheduleReminder}
                                className="group relative flex items-center gap-2.5 px-6 py-3.5 bg-zinc-900 overflow-hidden rounded-xl border border-white/10 transition-all hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CalendarPlus className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">{t('scheduleReminder')}</span>
                            </button>

                            {/* Draft Email Button with Dropdown */}
                            <div className="relative z-20">
                                <div className="flex rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shadow-lg transition-all hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <button
                                        onClick={() => handleDraftEmail()}
                                        className="flex items-center gap-2.5 px-6 py-3.5 hover:bg-white/5 transition-colors group"
                                    >
                                        <Mail className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                                        <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">{t('draftEmail')}</span>
                                    </button>
                                    <div className="w-[1px] bg-white/10" />
                                    <button
                                        onClick={() => setShowEmailDropdown(!showEmailDropdown)}
                                        className="px-3 hover:bg-white/5 transition-colors text-zinc-500 hover:text-white"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showEmailDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Email Type Dropdown */}
                                {showEmailDropdown && (
                                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#0F1115] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50 ring-1 ring-white/5">
                                        <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                                {language === 'es' ? 'Seleccionar Plantilla' : 'Select Template'}
                                            </p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto py-1">
                                            {(EMAIL_TEMPLATES_BY_SECTOR[analysis.sector || 'legal'] || EMAIL_TEMPLATES_BY_SECTOR['legal']).map((template) => (
                                                <button
                                                    key={template.id}
                                                    onClick={() => handleDraftEmail(template.id)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors group"
                                                >
                                                    <span className="text-lg bg-zinc-800 rounded-md p-1 group-hover:bg-zinc-700 transition-colors border border-white/5">{template.icon}</span>
                                                    <div>
                                                        <span className="text-sm font-medium text-zinc-200 group-hover:text-white block">
                                                            {language === 'es' ? template.labelEs : template.labelEn}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Success Feedback */}
                        {actionFeedback && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-400 animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-1 rounded-full bg-emerald-500/20">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                </div>
                                {actionFeedback}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email Draft Modal - Updated to Glass */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-3xl max-h-[85vh] glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{t('draftEmail')}</h3>
                                    <p className="text-xs text-zinc-400">
                                        {language === 'es' ? 'Personaliza y copia tu correo' : 'Customize and copy your email'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="relative group">
                                <textarea
                                    value={emailDraft}
                                    onChange={(e) => setEmailDraft(e.target.value)}
                                    className="w-full h-[400px] bg-black/30 text-zinc-300 font-mono text-sm p-5 rounded-xl border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none leading-relaxed transition-all"
                                    spellCheck={false}
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold bg-black/50 px-2 py-1 rounded">Editable</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5 bg-white/[0.01]">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                {t('close')}
                            </button>
                            <button
                                onClick={handleCopyEmail}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                            >
                                {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>
                                    {copiedEmail ? t('emailCopied') : t('copy')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Re-analysis Modal */}
            {showReanalysisModal && onReanalyze && analysis.id && (
                <ReanalysisModal
                    contractId={analysis.id}
                    contractName={analysis.fileName}
                    existingDataPoints={Object.keys(analysis.extractedData || {})}
                    isOpen={showReanalysisModal}
                    onClose={() => setShowReanalysisModal(false)}
                    onReanalyze={onReanalyze}
                    fileAvailable={fileAvailable}
                />
            )}
        </>
    );
}
