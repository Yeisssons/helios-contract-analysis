'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    Trash2,
    Edit2,
    Check,
    X,
    File,
    Loader
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ContractData, SortField, SortDirection } from '@/types/contract';
import { ContractAnalysis } from './AnalysisResult';

interface ContractsTableProps {
    contracts: ContractData[];
    isLoading?: boolean;
    onView?: (contract: ContractAnalysis) => void;
    onDelete?: (id: string) => void;
    onDownload?: (fileName: string, filePath?: string) => void;
    onRename?: (id: string, newName: string) => Promise<void>;
}

export default function ContractsTable({ contracts, isLoading, onView, onDelete, onDownload, onRename }: ContractsTableProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [sortField, setSortField] = useState<SortField>('renewalDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>('');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedContracts = useMemo(() => {
        return [...contracts].sort((a, b) => {
            let comparison = 0;

            if (sortField === 'noticePeriodDays') {
                comparison = a.noticePeriodDays - b.noticePeriodDays;
            } else {
                const aValue = a[sortField]?.toString().toLowerCase() || '';
                const bValue = b[sortField]?.toString().toLowerCase() || '';
                comparison = aValue.localeCompare(bValue);
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [contracts, sortField, sortDirection]);

    const handleView = (contract: ContractData) => {
        if (onView) {
            // Convert ContractData to ContractAnalysis format
            const analysis: ContractAnalysis = {
                id: contract.id,
                fileName: contract.fileName,
                contractType: contract.contractType,
                effectiveDate: contract.effectiveDate,
                renewalDate: contract.renewalDate,
                noticePeriodDays: contract.noticePeriodDays,
                terminationClauseReference: contract.terminationClauseReference,
                customQuery: contract.customQuery,
                customAnswer: contract.customAnswer,
            };
            onView(analysis);
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmId(id);
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmId && onDelete) {
            onDelete(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null);
    };

    const handleEditStart = (id: string, currentName: string) => {
        setEditingId(id);
        setEditingName(currentName);
    };

    const handleEditSave = async () => {
        if (editingId && editingName.trim() && onRename) {
            try {
                await onRename(editingId, editingName.trim());
                setEditingId(null);
                setEditingName('');
            } catch (error) {
                console.error('Failed to rename:', error);
                alert('Error al renombrar el contrato');
            }
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingName('');
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return (
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortDirection === 'asc' ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return '-';
        }
    };

    const getDaysUntilRenewal = (renewalDate: string) => {
        const today = new Date();
        const renewal = new Date(renewalDate);
        const diffTime = renewal.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getRenewalBadge = (renewalDate: string) => {
        const days = getDaysUntilRenewal(renewalDate);

        if (days < 0) {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">{t('expired')}</span>;
        }
        if (days <= 30) {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">{t('dueSoon')}</span>;
        }
        if (days <= 90) {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">{t('upcoming')}</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">{t('active')}</span>;
    };

    if (isLoading) {
        return (
            <div className="glass rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="relative w-12 h-12 mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-zinc-400 font-medium animate-pulse">{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (contracts.length === 0) {
        return (
            <div className="glass rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-xl">
                        <File className="w-10 h-10 text-zinc-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('noContracts')}</h3>
                    <p className="text-zinc-500 max-w-sm leading-relaxed">
                        {t('noContractsDescription')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="glass-strong rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200 shadow-2xl ring-1 ring-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {language === 'es' ? '¿Eliminar contrato?' : 'Delete contract?'}
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {language === 'es' ? 'Esta acción es irreversible.' : 'This action cannot be undone.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={handleDeleteCancel}
                                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                {language === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20"
                            >
                                {language === 'es' ? 'Eliminar' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-5 text-left">
                                    <button
                                        onClick={() => handleSort('fileName')}
                                        className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors group"
                                    >
                                        {t('fileName')}
                                        <div className="text-zinc-600 group-hover:text-primary transition-colors">
                                            <SortIcon field="fileName" />
                                        </div>
                                    </button>
                                </th>
                                <th className="px-6 py-5 text-left">
                                    <button
                                        onClick={() => handleSort('contractType')}
                                        className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors group"
                                    >
                                        {t('type')}
                                        <div className="text-zinc-600 group-hover:text-primary transition-colors">
                                            <SortIcon field="contractType" />
                                        </div>
                                    </button>
                                </th>
                                <th className="px-6 py-5 text-left hidden lg:table-cell">
                                    <button
                                        onClick={() => handleSort('effectiveDate')}
                                        className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors group"
                                    >
                                        {t('effectiveDate')}
                                        <div className="text-zinc-600 group-hover:text-primary transition-colors">
                                            <SortIcon field="effectiveDate" />
                                        </div>
                                    </button>
                                </th>
                                <th className="px-6 py-5 text-left">
                                    <button
                                        onClick={() => handleSort('renewalDate')}
                                        className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors group"
                                    >
                                        {t('renewalDate')}
                                        <div className="text-zinc-600 group-hover:text-primary transition-colors">
                                            <SortIcon field="renewalDate" />
                                        </div>
                                    </button>
                                </th>
                                <th className="px-6 py-5 text-left hidden md:table-cell">
                                    <button
                                        onClick={() => handleSort('noticePeriodDays')}
                                        className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors group"
                                    >
                                        {t('noticePeriod')}
                                        <div className="text-zinc-600 group-hover:text-primary transition-colors">
                                            <SortIcon field="noticePeriodDays" />
                                        </div>
                                    </button>
                                </th>
                                <th className="px-6 py-5 text-left">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                        {t('status')}
                                    </span>
                                </th>
                                <th className="px-6 py-5 text-center">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                        {language === 'es' ? 'Acciones' : 'Actions'}
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedContracts.map((contract) => (
                                <tr
                                    key={contract.id}
                                    className="hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 ring-1 ring-white/10 flex items-center justify-center flex-shrink-0 group-hover:ring-primary/20 transition-all">
                                                <File className="w-5 h-5 text-zinc-500 group-hover:text-primary transition-colors" />
                                            </div>
                                            {editingId === contract.id ? (
                                                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg ring-1 ring-primary/30">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleEditSave();
                                                            if (e.key === 'Escape') handleEditCancel();
                                                        }}
                                                        className="px-2 py-1 bg-transparent text-sm text-white focus:outline-none min-w-[200px]"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={handleEditSave}
                                                        className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleEditCancel}
                                                        className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group/title">
                                                    <span className="text-sm font-medium text-zinc-200 truncate max-w-[200px]" title={contract.fileName}>
                                                        {contract.fileName}
                                                    </span>
                                                    {onRename && (
                                                        <button
                                                            onClick={() => handleEditStart(contract.id, contract.fileName)}
                                                            className="opacity-0 group-hover/title:opacity-100 p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                            title={language === 'es' ? 'Renombrar' : 'Rename'}
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-white/5">
                                            {contract.contractType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className="text-sm text-zinc-400 font-mono">{formatDate(contract.effectiveDate)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-zinc-300 font-mono">{formatDate(contract.renewalDate)}</span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/50 text-xs font-medium text-zinc-300 border border-white/5">
                                            {contract.noticePeriodDays}
                                            <span className="text-zinc-500">{t('days')}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRenewalBadge(contract.renewalDate)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            {deleteConfirmId === contract.id ? (
                                                <div className="flex items-center gap-1 bg-red-500/10 p-1 rounded-lg border border-red-500/20">
                                                    <button
                                                        onClick={handleDeleteConfirm}
                                                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteCancel}
                                                        className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/contracts/${contract.id}`);
                                                        }}
                                                        className="p-2 rounded-xl text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                        title={language === 'es' ? 'Ver PDF' : 'View PDF'}
                                                    >
                                                        <File className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleView(contract);
                                                        }}
                                                        className="p-2 rounded-xl text-zinc-500 hover:text-primary hover:bg-primary/10 transition-colors"
                                                        title={language === 'es' ? 'Ver análisis' : 'View analysis'}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDownload && onDownload(contract.fileName, contract.filePath);
                                                        }}
                                                        className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                                                        title={language === 'es' ? 'Descargar' : 'Download'}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>

                                                    {onDelete && (
                                                        <button
                                                            onClick={() => handleDeleteClick(contract.id)}
                                                            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                            title={language === 'es' ? 'Eliminar' : 'Delete'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                    <p className="text-sm text-zinc-500">
                        {t('showing')} <span className="font-semibold text-zinc-300">{contracts.length}</span> {contracts.length !== 1 ? t('contracts') : t('contract')}
                    </p>
                </div>
            </div>
        </>
    );
}
