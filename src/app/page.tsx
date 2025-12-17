'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import ContractsTable from '@/components/ContractsTable';
import CalendarView from '@/components/CalendarView';
import ContractChat from '@/components/ContractChat';
import AnalysisResult, { ContractAnalysis } from '@/components/AnalysisResult';
import { exportContractsToExcel } from '@/utils/excelExport';
import { ContractData, ContractsListResponse, ContractRecord } from '@/types/contract';
import DashboardStats from '@/components/DashboardStats';
import { Download, List, Calendar } from 'lucide-react';

type ViewMode = 'list' | 'calendar';

const HISTORY_STORAGE_KEY = 'contratoalert_history';

function HomeContent() {
  const { t, language } = useLanguage();
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState<ContractAnalysis | null>(null);
  const [history, setHistory] = useState<ContractAnalysis[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Create a session file cache to store uploaded File objects
  // Key: fileName, Value: File object
  const [fileCache, setFileCache] = useState<Record<string, File>>({});

  // Load contracts from Supabase on mount
  useEffect(() => {
    async function fetchContracts() {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        const response = await fetch('/api/contracts', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const result: ContractsListResponse = await response.json();

        if (result.success && result.data) {
          // Convert Supabase data to ContractAnalysis format
          // Cast to unknown first if the API response type is generic, then to ContractRecord[]
          const rawRecords = result.data as unknown as ContractRecord[];

          const contractsHistory = rawRecords.map((contract) => ({
            id: contract.id,
            fileName: contract.file_name,
            filePath: contract.file_path,
            contractType: contract.contract_type || 'Contrato General',
            effectiveDate: contract.effective_date || '',
            renewalDate: contract.renewal_date || '',
            noticePeriodDays: contract.notice_period_days ?? 30,
            terminationClauseReference: contract.termination_clause_reference || '',
            sector: contract.sector || '',
            tags: contract.tags || [],
            extractedData: contract.extracted_data || {},
            dataSources: contract.data_sources || {},
            abusiveClauses: contract.abusive_clauses || [],
            alerts: contract.alerts || [],
            riskLevel: contract.risk_level || 'medium',
            createdAt: contract.created_at,
            lastModified: contract.last_modified,
            requestedDataPoints: [],
          }));

          setHistory(contractsHistory);
          // NOTE: We no longer auto-set latestAnalysis here
          // Home page should be empty after refresh
          // Analysis is only shown after:
          // 1. New document upload
          // 2. Navigation from /contracts with ?contract=id param
        }
      } catch (error) {
        console.error('Error loading contracts from Supabase:', error);
      } finally {
        setHistoryLoaded(true);
      }
    }

    fetchContracts();
  }, []);

  // Handle loading a specific contract from URL query params
  const [contractIdFromUrl, setContractIdFromUrl] = useState<string | null>(null);
  const [loadingFromUrl, setLoadingFromUrl] = useState(false);

  // Check URL on mount and when window location changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const contractId = params.get('contract');
      if (contractId && contractId !== contractIdFromUrl) {
        setContractIdFromUrl(contractId);
      }
    };

    checkUrlParams();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', checkUrlParams);
    return () => window.removeEventListener('popstate', checkUrlParams);
  }, [contractIdFromUrl]);

  // Fetch contract when contractIdFromUrl changes
  useEffect(() => {
    if (!contractIdFromUrl || loadingFromUrl) return;

    setLoadingFromUrl(true);

    // Fetch the specific contract from API
    fetch(`/api/contracts/${contractIdFromUrl}`)
      .then(response => response.json())
      .then(result => {
        if (result.success && result.data) {
          const contract = result.data;
          // Transform to ContractAnalysis format
          const analysis: ContractAnalysis = {
            id: contract.id,
            fileName: contract.fileName || contract.file_name,
            filePath: contract.filePath || contract.file_path,
            contractType: contract.contractType || contract.contract_type || 'Contrato General',
            effectiveDate: contract.effectiveDate || contract.effective_date || '',
            renewalDate: contract.renewalDate || contract.renewal_date || '',
            noticePeriodDays: contract.noticePeriodDays ?? contract.notice_period_days ?? 30,
            terminationClauseReference: contract.terminationClauseReference || contract.termination_clause_reference || '',
            sector: contract.sector || '',
            tags: contract.tags || [],
            extractedData: contract.extractedData || contract.extracted_data || {},
            dataSources: contract.dataSources || contract.data_sources || {},
            abusiveClauses: contract.abusiveClauses || contract.abusive_clauses || [],
            alerts: contract.alerts || [],
            riskScore: contract.riskScore ?? contract.risk_score ?? 5,
            requestedDataPoints: Object.keys(contract.extractedData || contract.extracted_data || {}),
          };

          setLatestAnalysis(analysis);
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Clean URL after loading and reset state
          window.history.replaceState({}, '', '/');
          setContractIdFromUrl(null);
        }
      })
      .catch(error => {
        console.error('Error fetching contract for analysis:', error);
      })
      .finally(() => {
        setLoadingFromUrl(false);
      });
  }, [contractIdFromUrl, loadingFromUrl]);

  // No longer saving to localStorage - data is persisted in Supabase

  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contracts');
      const result: ContractsListResponse = await response.json();

      if (result.success && result.data) {
        setContracts(result.data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle successful upload
  // We accept the processed ContractData AND the original File
  // Note: The FileUpload must pass the original file now, or we need to update it to do so.
  // Actually FileUpload calls onUploadSuccess(result.data). We need to change that.
  // But wait, the handler signature in FileUpload is (contract: ContractData). 
  // I need to update both FileUpload and this handler.
  // For now, let's assume we update FileUpload to pass (contract, file).
  const handleUploadSuccess = (contract: ContractData, file?: File) => {
    // Store original file in cache if provided
    if (file) {
      setFileCache(prev => ({
        ...prev,
        [contract.fileName]: file
      }));
    }

    // Transform ContractData to ContractAnalysis formatted extended fields
    const analysis: ContractAnalysis = {
      id: contract.id,
      fileName: contract.fileName,
      contractType: contract.contractType,
      effectiveDate: contract.effectiveDate,
      renewalDate: contract.renewalDate,
      noticePeriodDays: contract.noticePeriodDays,
      terminationClauseReference: contract.terminationClauseReference,
      // Pass through new fields if they exist from API/Mock
      summary: (contract as any)?.summary || `Contrato de ${contract?.contractType?.toLowerCase() || 'general'}...`,
      parties: (contract as any)?.parties || [],
      riskScore: (contract as any)?.riskScore ?? 5,
      alerts: (contract as any)?.alerts || [],
      abusiveClauses: (contract as any)?.abusiveClauses || [],
      customQuery: contract?.customQuery,
      customAnswer: contract?.customAnswer,
      // Data points for audit
      extractedData: contract.extractedData,
      requestedDataPoints: contract.requestedDataPoints,
      sector: contract.sector,
      // Management fields
      tags: contract.tags,
    };

    // Update state (this will trigger localStorage save via useEffect)
    setLatestAnalysis(analysis);
    setHistory(prev => [analysis, ...prev]);
    setContracts(prev => [contract, ...prev]);
  };

  const handleExportToExcel = () => {
    if (contracts.length === 0) return;
    exportContractsToExcel(contracts as any[], language);
  };

  const handleDismissAnalysis = () => {
    setLatestAnalysis(null);
  };

  // Handle viewing a contract from the table
  const handleViewContract = (contract: ContractAnalysis) => {
    setLatestAnalysis(contract);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle deleting a contract
  const handleDeleteContract = async (id: string) => {
    try {
      // Call API to delete from database and storage
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }

      // Update local state
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);

      if (latestAnalysis?.id === id) {
        setLatestAnalysis(null);
      }
      setContracts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Error al eliminar el contrato. Por favor, intenta de nuevo.');
    }
  };

  // Handle downloading origin file
  const handleDownloadContract = async (fileName: string) => {
    try {
      // Find the contract in history to get its file path
      const contract = contracts.find(h => h.fileName === fileName);

      if (!contract?.filePath) {
        console.error('No file path found for contract:', fileName);
        alert('No se encontró el archivo original del contrato.');
        return;
      }

      // Get signed URL from Supabase Storage
      const { getSignedUrlForContract } = await import('@/lib/supabase');
      const { url, error } = await getSignedUrlForContract(contract.filePath);

      if (error || !url) {
        console.error('Error getting signed URL:', error);
        alert('Error al obtener el enlace de descarga. Por favor, intenta de nuevo.');
        return;
      }

      // Download the file
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

  // Clear history function (Deprecated for DB mode, or should call API to wipe all)
  const handleClearHistory = async () => {
    if (confirm(language === 'es' ? '¿Estás seguro de que deseas borrar TODOS los contratos?' : 'Are you sure you want to delete ALL contracts?')) {
      // Implement API call for bulk delete if needed
      // For now, minimal implementation:
      alert('Bulk delete not yet implemented in DB mode for safety.');
    }
  };

  // Contract Management Handlers

  // Rename a contract
  const handleRename = (id: string, newName: string) => {
    if (!newName.trim()) return;

    const now = new Date().toISOString();

    // Update in all relevant states
    setContracts(prev =>
      prev.map(c =>
        c.id === id ? { ...c, fileName: newName, lastModified: now } : c
      )
    );

    setHistory(prev =>
      prev.map(h =>
        h.id === id ? { ...h, fileName: newName } : h
      )
    );

    if (latestAnalysis?.id === id) {
      setLatestAnalysis({ ...latestAnalysis, fileName: newName });
    }

    // Update file cache key if exists
    const oldContract = contracts.find(c => c.id === id);
    if (oldContract && fileCache[oldContract.fileName]) {
      setFileCache(prev => {
        const newCache = { ...prev };
        newCache[newName] = newCache[oldContract.fileName];
        delete newCache[oldContract.fileName];
        return newCache;
      });
    }
  };

  // Update tags for a contract
  const handleUpdateTags = (id: string, tags: string[]) => {
    const now = new Date().toISOString();

    setContracts(prev =>
      prev.map(c =>
        c.id === id ? { ...c, tags, lastModified: now } : c
      )
    );

    setHistory(prev =>
      prev.map(h =>
        h.id === id ? { ...h, tags } : h
      )
    );

    if (latestAnalysis?.id === id) {
      setLatestAnalysis({ ...latestAnalysis, tags });
    }
  };

  // Re-analyze with new data points
  const handleReanalyze = async (id: string, newDataPoints: string[]) => {
    const contract = contracts.find(c => c.id === id);
    if (!contract) {
      alert(language === 'es' ? 'Contrato no encontrado' : 'Contract not found');
      return;
    }

    const file = fileCache[contract.fileName];
    if (!file) {
      alert(
        language === 'es'
          ? 'Archivo original no disponible en caché. Por favor, suba el documento de nuevo.'
          : 'Original file not available in cache. Please upload the document again.'
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataPoints', JSON.stringify(newDataPoints));

      if (contract.customQuery) {
        formData.append('customQuery', contract.customQuery);
      }

      const response = await fetch('/api/process-contract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        const now = new Date().toISOString();

        // Merge new extractedData with existing
        const mergedData = {
          ...contract,
          extractedData: {
            ...contract.extractedData,
            ...result.data.extractedData,
          },
          lastModified: now,
        };

        setContracts(prev =>
          prev.map(c => (c.id === id ? mergedData : c))
        );

        setHistory(prev =>
          prev.map(h =>
            h.id === id
              ? {
                ...h,
                extractedData: mergedData.extractedData,
              }
              : h
          )
        );

        if (latestAnalysis?.id === id) {
          setLatestAnalysis({
            ...latestAnalysis,
            extractedData: mergedData.extractedData,
          });
        }

        alert(
          language === 'es'
            ? `✓ Re-análisis completado. ${Object.keys(result.data.extractedData || {}).length} datos adicionales extraídos.`
            : `✓ Re-analysis complete. ${Object.keys(result.data.extractedData || {}).length} additional data points extracted.`
        );
      }
    } catch (error) {
      console.error('Re-analysis error:', error);
      alert(language === 'es' ? 'Error en re-análisis' : 'Re-analysis error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground antialiased selection:bg-primary/30 selection:text-white">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Main glow - Emerald/Primary */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />

        {/* Secondary glow - Blue/Purple */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-1000" />

        {/* Accent glow - Center/Top */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[30vw] h-[30vw] bg-purple-500/5 rounded-full blur-[100px] mix-blend-screen opacity-50" />

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-8 md:space-y-16">
          {/* Hero / Upload Section */}
          <section className="relative">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
                {t('uploadTitle')}
              </h2>
              <p className="text-lg text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                {t('uploadDescription')}
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
          </section>

          {/* Latest Analysis Result - Floating Card */}
          {latestAnalysis ? (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  {t('latestAnalysis')}
                </h2>
                <button
                  onClick={handleDismissAnalysis}
                  className="text-sm font-medium text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  {t('dismiss')}
                </button>
              </div>

              <div className="glass-strong rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                <AnalysisResult
                  analysis={latestAnalysis}
                  onRename={handleRename}
                  onUpdateTags={handleUpdateTags}
                  onReanalyze={handleReanalyze}
                  fileAvailable={!!fileCache[latestAnalysis.fileName]}
                />
              </div>
            </section>
          ) : null}

          {/* Dashboard Stats and Contracts Table */}
          <section>
            {viewMode === 'list' ? (
              <>
                <DashboardStats contracts={contracts} />
                <ContractsTable
                  contracts={contracts}
                  onView={handleViewContract}
                  onDelete={handleDeleteContract}
                  onDownload={handleDownloadContract}
                />
              </>
            ) : null}
          </section>
        </main>

        {/* Premium Footer */}
        {/* Floating Query Widget        */}

        {/* Floating Query Widget        */}
        <ContractChat contracts={contracts as any} />
      </div>
    </div>
  );
}



export default function Home() {
  return (
    <LanguageProvider defaultLanguage="es">
      <ErrorBoundary>
        <HomeContent />
      </ErrorBoundary>
    </LanguageProvider>
  );
}
