'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import { getSignedUrlForContract } from '@/lib/supabase';

interface Contract {
    id: string;
    file_name: string;
    file_path: string;
    extracted_data?: Record<string, string>;
    data_sources?: Record<string, string>;
    requested_data_points?: string[];
    sector?: string;
}

function PDFViewerContent() {
    const { language } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const [contract, setContract] = useState<Contract | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        async function loadContract() {
            try {
                // Fetch contract details
                const response = await fetch(`/api/contracts/${params.id}`);
                const result = await response.json();

                if (result.success && result.data) {
                    const contractData = result.data;
                    setContract(contractData);

                    // Get signed URL for PDF
                    if (contractData.file_path) {
                        const { url, error } = await getSignedUrlForContract(contractData.file_path);
                        if (url && !error) {
                            setPdfUrl(url);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading contract:', error);
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            loadContract();
        }
    }, [params.id]);

    const handleCopyQuote = async (key: string, quote: string) => {
        try {
            await navigator.clipboard.writeText(quote);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!contract || !pdfUrl) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
                <p className="text-slate-400 mb-4">
                    {language === 'es' ? 'No se pudo cargar el contrato' : 'Could not load contract'}
                </p>
                <button
                    onClick={() => router.push('/contracts')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    {language === 'es' ? 'Volver a Contratos' : 'Back to Contracts'}
                </button>
            </div>
        );
    }

    const dataPoints = contract.requested_data_points || [];
    const extractedData = contract.extracted_data || {};
    const dataSources = contract.data_sources || {};

    return (
        <div className="flex flex-col h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/contracts')}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">{contract.file_name}</h1>
                            <p className="text-sm text-slate-400">
                                {language === 'es' ? 'Visor de Documento' : 'Document Viewer'}
                            </p>
                        </div>
                    </div>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {language === 'es' ? 'Abrir en Nueva Pestaña' : 'Open in New Tab'}
                    </a>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* PDF Viewer */}
                <div className="flex-1 bg-slate-800">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title={contract.file_name}
                    />
                </div>

                {/* Sidebar - Data Points */}
                <div className="w-96 bg-slate-900 border-l border-slate-700/50 overflow-y-auto">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-white mb-4">
                            {language === 'es' ? 'Puntos de Datos Extraídos' : 'Extracted Data Points'}
                        </h2>

                        {dataPoints.length === 0 ? (
                            <p className="text-slate-400 text-sm">
                                {language === 'es' ? 'No hay datos extraídos' : 'No extracted data'}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {dataPoints.map((key) => {
                                    const value = extractedData[key];
                                    const source = dataSources[key];
                                    const hasSource = source && source !== 'No encontrado en el documento' && source !== 'No especificado';

                                    return (
                                        <div
                                            key={key}
                                            className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-emerald-500/50 transition-colors"
                                        >
                                            {/* Data Point Name */}
                                            <div className="text-xs font-medium text-emerald-400 mb-1">
                                                {key}
                                            </div>

                                            {/* Extracted Value */}
                                            <div className="text-sm text-white font-medium mb-2">
                                                {value || 'No especificado'}
                                            </div>

                                            {/* Source Quote */}
                                            {hasSource && (
                                                <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <span className="text-xs text-slate-400">
                                                            {language === 'es' ? 'Fuente:' : 'Source:'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopyQuote(key, source)}
                                                            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"
                                                            title={language === 'es' ? 'Copiar cita' : 'Copy quote'}
                                                        >
                                                            {copiedKey === key ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-300 italic bg-slate-700/30 p-2 rounded">
                                                        "{source}"
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-1">
                                                        {language === 'es'
                                                            ? 'Usa Ctrl+F para buscar en el PDF'
                                                            : 'Use Ctrl+F to search in PDF'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PDFViewerPage() {
    return (
        <LanguageProvider>
            <PDFViewerContent />
        </LanguageProvider>
    );
}
