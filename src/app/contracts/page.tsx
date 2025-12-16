'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { ContractData, ContractsListResponse } from '@/types/contract';
import { ContractAnalysis } from '@/components/AnalysisResult';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Lazy load the heavy ContractsTable component
const ContractsTable = dynamic(() => import('@/components/ContractsTable'), {
    loading: () => (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    ),
    ssr: false
});

function ContractsPageContent() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [contracts, setContracts] = useState<ContractData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch contracts from Supabase
    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            setIsLoading(true);

            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                // Silent fail or redirect? For now just stop loading.
                // Ideally redirect to login if not handled by middleware
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/contracts', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const result: ContractsListResponse = await response.json();

            if (result.success && result.data) {
                setContracts(result.data);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteContract = async (id: string) => {
        if (!confirm(language === 'es' ? '¿Estás seguro de que deseas eliminar este contrato?' : 'Are you sure you want to delete this contract?')) {
            return;
        }

        try {
            const response = await fetch(`/api/contracts/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete contract');
            }

            // Refresh the contracts list
            await fetchContracts();

            // Show success message
            alert(language === 'es' ? 'Contrato eliminado exitosamente' : 'Contract deleted successfully');
        } catch (error) {
            console.error('Error deleting contract:', error);
            alert('Error al eliminar el contrato. Por favor, intenta de nuevo.');
        }
    };

    const handleRenameContract = async (id: string, newName: string) => {
        try {
            const response = await fetch(`/api/contracts/${id}/rename`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName }),
            });

            if (!response.ok) {
                throw new Error('Failed to rename contract');
            }

            // Refresh the list
            fetchContracts();
        } catch (error) {
            console.error('Error renaming contract:', error);
            throw error; // Re-throw to let table handle error display
        }
    };

    const handleDownloadContract = async (fileName: string, filePath?: string) => {
        if (!filePath) {
            console.error('No file path found for contract:', fileName);
            alert('No se encontró el archivo original del contrato.');
            return;
        }

        try {
            // Get signed URL from Supabase Storage
            const { getSignedUrlForContract } = await import('@/lib/supabase');
            const { url, error } = await getSignedUrlForContract(filePath);

            if (error || !url) {
                console.error('Error getting signed URL:', error);
                alert('Error al obtener el enlace de descarga. Por favor, intenta de nuevo.');
                return;
            }

            // Trigger browser download
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading contract:', error);
            alert('Error al descargar el contrato. Por favor, intenta de nuevo.');
        }
    };

    const handleViewContract = (contract: ContractAnalysis) => {
        // Navigate to analysis page where the analysis can be viewed
        router.push(`/analysis?expand=${contract.id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Header />

            <div className="container mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => router.push('/')}
                    className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {language === 'es' ? 'Volver al inicio' : 'Back to home'}
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {language === 'es' ? 'Panel de Documentos' : 'Document Dashboard'}
                    </h1>
                    <p className="text-slate-400">
                        {language === 'es'
                            ? 'Gestiona y visualiza todos tus documentos procesados'
                            : 'Manage and view all your processed documents'}
                    </p>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        <p className="mt-4 text-slate-400">
                            {language === 'es' ? 'Cargando documentos...' : 'Loading documents...'}
                        </p>
                    </div>
                ) : (
                    <ContractsTable
                        contracts={contracts}
                        isLoading={isLoading}
                        onDelete={handleDeleteContract}
                        onRename={handleRenameContract}
                        onDownload={handleDownloadContract}
                        onView={handleViewContract}
                    />
                )}
            </div>
        </div>
    );
}

export default function ContractsPage() {
    return (
        <LanguageProvider>
            <ContractsPageContent />
        </LanguageProvider>
    );
}
