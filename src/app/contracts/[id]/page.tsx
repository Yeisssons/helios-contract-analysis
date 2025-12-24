'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Copy, Check, ArrowLeft, Download, AlertCircle, Search, X, Save, Edit3,
    FileText, LayoutTemplate, Calendar, CalendarPlus, Mail,
    Gauge, ShieldAlert, Sparkles, AlertTriangle, Lock
} from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import ContractChat from '@/components/ContractChat';
import { toast } from 'sonner';
import {
    downloadCalendarEvent,
    generateCancellationDraft,
    copyToClipboard as clipboardCopy
} from '@/utils/businessTools';
import SuggestedTaskCard, { generateSuggestedTasks } from '@/components/SuggestedTaskCard';

interface ContractDetail {
    id: string;
    fileName: string;
    filePath: string;
    contractType?: string;
    effectiveDate?: string;
    renewalDate?: string;
    noticePeriodDays?: number;
    terminationClauseReference?: string;
    sector?: string;
    extractedData?: Record<string, unknown>;
    dataSources?: Record<string, string>;
    abusiveClauses?: Array<{ clause: string; severity: string; recommendation: string }>;
    alerts?: Array<{ message: string; severity: string }>;
    riskLevel?: string;
    riskScore?: number;
    summary?: string;
    parties?: string[];
    requestedDataPoints?: string[];
}

function ContractDetailContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const contractId = params?.id as string;
    const searchTerm = searchParams?.get('search') || '';

    const [contract, setContract] = useState<ContractDetail | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [copiedField, setCopiedField] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContract, setEditedContract] = useState<ContractDetail | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
    const [showSearchPanel, setShowSearchPanel] = useState(!!searchTerm);

    useEffect(() => {
        if (!contractId) return;

        async function fetchContractDetails() {
            try {
                // Get session for authentication
                const { supabase } = await import('@/lib/supabase');
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    throw new Error('Not authenticated');
                }

                // Fetch contract and profile (plan)
                const [contractRes, profileRes] = await Promise.all([
                    fetch(`/api/contracts/${contractId}`, {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    }),
                    supabase
                        .from('profiles')
                        .select('plan')
                        .eq('id', session.user.id)
                        .single()
                ]);

                const result = await contractRes.json();
                if (!result.success || !result.data) {
                    throw new Error(result.error || 'Contract not found');
                }

                if (profileRes.data?.plan) {
                    setUserPlan(profileRes.data.plan as any);
                }

                setContract(result.data);
                setEditedContract(JSON.parse(JSON.stringify(result.data))); // Deep copy

                // Get PDF signed URL
                if (result.data.filePath) {
                    const { getSignedUrlForContract } = await import('@/lib/supabase');
                    const { url, error: urlError } = await getSignedUrlForContract(result.data.filePath);

                    if (urlError || !url) {
                        throw new Error('Failed to load PDF');
                    }

                    setPdfUrl(url);
                }
            } catch (err) {
                console.error('Error fetching contract:', err);
                setError(err instanceof Error ? err.message : 'Failed to load contract');
            } finally {
                setIsLoading(false);
            }
        }

        fetchContractDetails();
    }, [contractId]);

    const handleSave = async () => {
        if (!editedContract) return;
        setIsSaving(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                alert(language === 'es' ? 'No estás autenticado' : 'Not authenticated');
                return;
            }

            const res = await fetch('/api/contracts/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    id: contractId,
                    extractedData: editedContract.extractedData,
                    sector: editedContract.sector,
                    effectiveDate: editedContract.effectiveDate,
                    renewalDate: editedContract.renewalDate
                })
            });

            const result = await res.json();
            if (result.success) {
                setContract(result.data); // Update main view
                setIsEditing(false);
                setShowToast(true); // Reuse toast for success
                setTimeout(() => setShowToast(false), 3000);
            } else {
                alert('Error saving: ' + result.error);
            }
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDataChange = (key: string, value: string) => {
        if (!editedContract) return;
        setEditedContract({
            ...editedContract,
            extractedData: {
                ...editedContract.extractedData,
                [key]: value
            }
        });
    };

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setShowToast(true); // Re-using toast state for "copied" feedback
            setTimeout(() => {
                setCopiedField('');
                setShowToast(false);
            }, 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = async () => {
        if (!pdfUrl || !contract) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = contract.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    // Auto-save draft
    useEffect(() => {
        if (isEditing && editedContract) {
            const draftKey = `draft_contract_${contractId}`;
            localStorage.setItem(draftKey, JSON.stringify({
                data: editedContract,
                timestamp: Date.now()
            }));
        }
    }, [editedContract, isEditing, contractId]);

    // Check for draft on mount or edit mode entry
    useEffect(() => {
        if (isEditing) {
            const draftKey = `draft_contract_${contractId}`;
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                try {
                    const { data, timestamp } = JSON.parse(savedDraft);
                    // If draft is less than 24 hours old and different from current
                    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                        toast(language === 'es' ? 'Borrador encontrado' : 'Unsaved draft found', {
                            description: language === 'es' ? '¿Quieres restaurar tus cambios no guardados?' : 'Do you want to restore your unsaved changes?',
                            action: {
                                label: language === 'es' ? 'Restaurar' : 'Restore',
                                onClick: () => setEditedContract(data)
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing draft', e);
                }
            }
        }
    }, [isEditing, contractId, language]);

    // Loading state with skeleton
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="p-6 space-y-6">
                    {/* Header skeleton */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-6 w-64 rounded-lg bg-white/5 animate-pulse" />
                            <div className="h-3 w-32 rounded-lg bg-white/5 animate-pulse" />
                        </div>
                    </div>

                    {/* Main content skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left - Data points */}
                        <div className="space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="h-3 w-24 mb-2 rounded bg-white/5 animate-pulse" />
                                    <div className="h-5 w-full rounded bg-white/5 animate-pulse" />
                                </div>
                            ))}
                        </div>

                        {/* Right - PDF placeholder */}
                        <div className="h-[600px] rounded-xl bg-white/5 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center glass p-10 rounded-2xl border border-white/5 shadow-2xl">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-3">
                        {language === 'es' ? 'Error al cargar contrato' : 'Error loading contract'}
                    </h2>
                    <p className="text-zinc-400 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/contracts')}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                        {language === 'es' ? 'Volver a Contratos' : 'Back to Contracts'}
                    </button>
                </div>
            </div>
        );
    }

    const extractedDataEntries = Object.entries(isEditing && editedContract ? editedContract.extractedData || {} : contract.extractedData || {});

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header - Glass & Sticky */}
            <header className="glass-strong border-b border-white/5 sticky top-0 z-20 backdrop-blur-xl">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.push('/contracts')}
                                className="group p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white max-w-2xl truncate tracking-tight">{contract.fileName}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <LayoutTemplate className="w-3.5 h-3.5 text-zinc-500" />
                                    {isEditing && editedContract ? (
                                        <input
                                            type="text"
                                            className="bg-black/30 border border-white/10 rounded px-2 py-0.5 text-xs text-zinc-300 w-48 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                                            value={editedContract.sector || ''}
                                            onChange={(e) => setEditedContract({ ...editedContract, sector: e.target.value })}
                                            placeholder="Sector"
                                        />
                                    ) : (
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                                            {contract.sector || (language === 'es' ? 'General' : 'General')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => { setIsEditing(false); setEditedContract(JSON.parse(JSON.stringify(contract))); }}
                                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        disabled={isSaving}
                                    >
                                        {language === 'es' ? 'Cancelar' : 'Cancel'}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        {language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white text-sm font-medium rounded-xl transition-all"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    {language === 'es' ? 'Editar Datos' : 'Edit Data'}
                                </button>
                            )}
                            <div className="w-[1px] h-8 bg-white/10 mx-2" />
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white text-sm font-medium rounded-xl transition-all group no-print"
                            >
                                <span className="group-hover:scale-110 transition-transform">🖨️</span>
                                {language === 'es' ? 'Imprimir' : 'Print'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 hover:border-primary/50 text-zinc-400 hover:text-primary text-sm font-medium rounded-xl transition-all group no-print"
                            >
                                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                {language === 'es' ? 'PDF Original' : 'Original PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Split-Screen Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - PDF Viewer */}
                <div className="w-1/2 bg-[#0F1115] relative border-r border-white/5 flex flex-col no-print">
                    {/* Search Overlay */}
                    {showSearchPanel && searchTerm && (
                        <div className="absolute top-4 left-4 right-4 z-10 glass-strong rounded-xl border border-primary/20 shadow-xl p-3 animate-in fade-in slide-in-from-top-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Search className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                                        {language === 'es' ? 'Buscando en PDF' : 'Searching in PDF'}
                                    </p>
                                    <p className="text-sm text-white font-medium truncat max-w-xs">"{decodeURIComponent(searchTerm)}"</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSearchPanel(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {pdfUrl ? (
                        <iframe src={pdfUrl} className="w-full h-full" title="Contract PDF" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
                            <FileText className="w-16 h-16 opacity-20" />
                            <p>{language === 'es' ? 'Vista previa PDF no disponible' : 'PDF preview not available'}</p>
                        </div>
                    )}
                </div>

                {/* Right Panel - Extracted Data */}
                <div className="w-1/2 overflow-y-auto bg-background p-8 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Title Section */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {language === 'es' ? 'Datos del Contrato' : 'Contract Data'}
                                    </h2>
                                    <p className="text-sm text-zinc-400">
                                        {language === 'es' ? 'Información extraída y verificada' : 'Extracted and verified information'}
                                    </p>
                                </div>
                            </div>
                            {isEditing && (
                                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest animate-pulse">
                                    {language === 'es' ? 'Modo Edición' : 'Editing Mode'}
                                </span>
                            )}
                        </div>

                        {/* Dates Section (Quick Edit) */}
                        {(contract.effectiveDate || contract.renewalDate || isEditing) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border transition-all ${isEditing ? 'bg-zinc-900 border-white/10' : 'bg-white/[0.02] border-white/5'}`}>
                                    <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                        <Calendar className="w-4 h-4" />
                                        {language === 'es' ? 'Fecha Inicio' : 'Effective Date'}
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-primary/50 focus:outline-none"
                                            value={editedContract?.effectiveDate || ''}
                                            onChange={(e) => setEditedContract(prev => prev ? ({ ...prev, effectiveDate: e.target.value }) : null)}
                                        />
                                    ) : (
                                        <p className="text-lg font-mono text-zinc-200">{contract.effectiveDate || '-'}</p>
                                    )}
                                </div>
                                <div className={`p-4 rounded-xl border transition-all ${isEditing ? 'bg-zinc-900 border-white/10' : 'bg-white/[0.02] border-white/5'}`}>
                                    <div className="flex items-center gap-2 mb-2 text-amber-500/80 text-xs font-bold uppercase tracking-wider">
                                        <Calendar className="w-4 h-4" />
                                        {language === 'es' ? 'Renovación' : 'Renewal Date'}
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-primary/50 focus:outline-none"
                                            value={editedContract?.renewalDate || ''}
                                            onChange={(e) => setEditedContract(prev => prev ? ({ ...prev, renewalDate: e.target.value }) : null)}
                                        />
                                    ) : (
                                        <p className="text-lg font-mono text-amber-400">{contract.renewalDate || '-'}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ============ PREMIUM ANALYSIS PANEL (Pro/Enterprise) ============ */}
                        {userPlan !== 'free' && (
                            <>
                                {/* Risk Score Visualization */}
                                {contract.riskScore !== undefined && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                            <Gauge className="w-4 h-4" />
                                            {language === 'es' ? 'Puntuación de Riesgo' : 'Risk Score'}
                                        </div>
                                        <div className={`flex items-center gap-6 p-5 rounded-2xl ${contract.riskScore < 4 ? 'bg-emerald-500/10' : contract.riskScore < 7.5 ? 'bg-amber-500/10' : 'bg-red-500/10'} border border-white/5 relative overflow-hidden`}>
                                            <div className="relative w-20 h-20 flex-shrink-0">
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
                                                        className={contract.riskScore < 4 ? 'text-emerald-400' : contract.riskScore < 7.5 ? 'text-amber-400' : 'text-red-400'}
                                                        strokeDasharray={`${(contract.riskScore / 10) * 100}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className={`text-2xl font-bold ${contract.riskScore < 4 ? 'text-emerald-400' : contract.riskScore < 7.5 ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {contract.riskScore.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className={`text-lg font-bold mb-1 ${contract.riskScore < 4 ? 'text-emerald-400' : contract.riskScore < 7.5 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    {contract.riskScore < 4 ? (language === 'es' ? 'Riesgo Bajo' : 'Low Risk') : contract.riskScore < 7.5 ? (language === 'es' ? 'Riesgo Medio' : 'Medium Risk') : (language === 'es' ? 'Riesgo Alto' : 'High Risk')}
                                                </p>
                                                <p className="text-xs text-zinc-400 font-medium">
                                                    {language === 'es' ? 'Puntuación de riesgo AI' : 'AI Risk Score'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Abusive Clauses Warning */}
                                {contract.abusiveClauses && contract.abusiveClauses.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                                            <ShieldAlert className="w-4 h-4" />
                                            {language === 'es' ? 'Cláusulas Abusivas Detectadas' : 'Abusive Clauses Detected'}
                                        </div>
                                        <div className="space-y-3">
                                            {contract.abusiveClauses.map((clause, index) => (
                                                <div key={index} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                                    <p className="text-sm text-red-200/90 leading-relaxed font-medium">{clause.clause}</p>
                                                    {clause.recommendation && (
                                                        <p className="text-xs text-red-400/60 mt-2">{clause.recommendation}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Alerts Section */}
                                {contract.alerts && contract.alerts.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                                            <AlertTriangle className="w-4 h-4" />
                                            {language === 'es' ? 'Alertas' : 'Alerts'}
                                        </div>
                                        <div className="space-y-3">
                                            {contract.alerts.map((alert, index) => (
                                                <div key={index} className="flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-zinc-300">{alert.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <button
                                        onClick={() => {
                                            downloadCalendarEvent({
                                                fileName: contract.fileName,
                                                contractType: contract.contractType || '',
                                                effectiveDate: contract.effectiveDate || '',
                                                renewalDate: contract.renewalDate || '',
                                                noticePeriodDays: contract.noticePeriodDays || 30,
                                                terminationClauseReference: contract.terminationClauseReference || ''
                                            });
                                            toast.success(language === 'es' ? 'Evento añadido al calendario' : 'Event added to calendar');
                                        }}
                                        className="group flex items-center gap-2.5 px-5 py-3 bg-zinc-900 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                    >
                                        <CalendarPlus className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                                        <span className="font-semibold text-zinc-300 group-hover:text-white text-sm">
                                            {language === 'es' ? 'Agendar Recordatorio' : 'Schedule Reminder'}
                                        </span>
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                const draft = generateCancellationDraft({
                                                    fileName: contract.fileName,
                                                    contractType: contract.contractType || '',
                                                    effectiveDate: contract.effectiveDate || '',
                                                    renewalDate: contract.renewalDate || '',
                                                    noticePeriodDays: contract.noticePeriodDays || 30,
                                                    terminationClauseReference: contract.terminationClauseReference || '',
                                                    parties: contract.parties || []
                                                });
                                                clipboardCopy(draft);
                                                toast.success(language === 'es' ? 'Borrador copiado al portapapeles' : 'Draft copied to clipboard');
                                            }}
                                            className="group flex items-center gap-2.5 px-5 py-3 bg-zinc-900 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                        >
                                            <Mail className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                                            <span className="font-semibold text-zinc-300 group-hover:text-white text-sm">
                                                {language === 'es' ? 'Redactar Email' : 'Draft Email'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Suggested Tasks */}
                                {(() => {
                                    const suggestedTasks = generateSuggestedTasks({
                                        riskScore: contract.riskScore,
                                        abusiveClauses: contract.abusiveClauses?.map(c => c.clause),
                                        alerts: contract.alerts?.map(a => a.message),
                                        renewalDate: contract.renewalDate,
                                        terminationClauseReference: contract.terminationClauseReference
                                    }, language as 'es' | 'en');

                                    if (suggestedTasks.length === 0) return null;

                                    return (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                                                <Sparkles className="w-4 h-4" />
                                                {language === 'es' ? 'Tareas Sugeridas' : 'Suggested Tasks'}
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300">
                                                    {suggestedTasks.length}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {suggestedTasks.map(task => (
                                                    <SuggestedTaskCard
                                                        key={task.id}
                                                        task={task}
                                                        teamMembers={[]}
                                                        language={language as 'es' | 'en'}
                                                        contractName={contract.fileName}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        )}

                        {/* FREE PLAN UPGRADE PROMPT */}
                        {userPlan === 'free' && (
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">
                                            {language === 'es' ? 'Análisis Avanzado' : 'Advanced Analysis'}
                                        </h3>
                                        <p className="text-sm text-zinc-400 mb-3">
                                            {language === 'es'
                                                ? 'Actualiza a Pro para acceder a: Puntuación de riesgo, Cláusulas abusivas, Alertas automáticas, Tareas sugeridas, y más.'
                                                : 'Upgrade to Pro to unlock: Risk scoring, Abusive clauses detection, Automatic alerts, Suggested tasks, and more.'}
                                        </p>
                                        <a
                                            href="/pricing"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium rounded-lg transition-all"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            {language === 'es' ? 'Actualizar a Pro' : 'Upgrade to Pro'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Extracted Data Points List */}
                        {extractedDataEntries.length > 0 ? (
                            <div className="space-y-4">
                                {extractedDataEntries.map(([key, value]) => {
                                    const sourceQuote = contract.dataSources?.[key];
                                    const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

                                    return (
                                        <div
                                            key={key}
                                            className={`relative group rounded-xl p-5 border transition-all duration-300 ${isEditing
                                                ? 'bg-zinc-900/50 border-primary/20 shadow-lg shadow-primary/5'
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{key}</p>
                                                    {sourceQuote && !isEditing && (
                                                        <button
                                                            onClick={() => copyToClipboard(sourceQuote, key)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-medium flex items-center gap-1.5"
                                                        >
                                                            {copiedField === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                            {language === 'es' ? 'Copiar Fuente' : 'Copy Source'}
                                                        </button>
                                                    )}
                                                </div>

                                                {isEditing ? (
                                                    <textarea
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-y min-h-[80px]"
                                                        value={displayValue}
                                                        onChange={(e) => handleDataChange(key, e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-base text-zinc-200 leading-relaxed font-light">{displayValue}</p>
                                                )}

                                                {sourceQuote && !isEditing && (
                                                    <div className="mt-2 pt-3 border-t border-white/5">
                                                        <p className="text-sm text-zinc-500 italic font-serif">"{sourceQuote}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-500 text-sm font-medium">
                                    {language === 'es' ? 'No hay datos extraídos disponibles' : 'No extracted data available'}
                                </p>
                            </div>
                        )}

                        {/* Footer Spacer */}
                        <div className="h-20" />
                    </div>
                </div>
            </div>

            {/* Premium Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="glass-strong px-6 py-4 rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/20 text-primary">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">
                                {language === 'es' ? 'Texto copiado al portapapeles' : 'Text copied to clipboard'}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                {language === 'es'
                                    ? 'Usa Ctrl+F en el PDF para buscar'
                                    : 'Use Ctrl+F in the PDF viewer to search'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Chat Widget */}
            {contract && (
                <ContractChat
                    contracts={[contract as any]}
                    initialContractId={contract.id}
                    userPlan={userPlan}
                />
            )}
        </div>
    );
}

export default function ContractDetailPage() {
    return (
        <LanguageProvider defaultLanguage="es">
            <ContractDetailContent />
        </LanguageProvider>
    );
}
