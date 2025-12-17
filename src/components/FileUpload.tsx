'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Check, AlertCircle, X, Shield, Settings, ChevronDown, Building2, Star, User, Plus, Save, Edit2, Trash2, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { ContractData, ProcessContractResponse } from '@/types/contract';
import ProcessingState from './ProcessingState';
import { SectorId, getSectorTemplate, SECTOR_TEMPLATES, DEFAULT_SECTOR } from '@/constants/sectorTemplates';
import { getDataPointTranslation, getDataPointDescription } from '@/constants/dataPointTranslations';
import { useSectors, UnifiedSector } from '@/hooks/useSectors';
import { APP_CONFIG } from '@/config/constants';

interface FileUploadProps {
    onUploadSuccess: (contract: ContractData) => void;
    customQuery?: string;
}

export default function FileUpload({ onUploadSuccess, customQuery }: FileUploadProps) {
    const { t, language } = useLanguage();
    const { getUnifiedSectors, getSectorById, createTemplate, deleteTemplate, customTemplates, loading: sectorsLoading } = useSectors();
    const [isUploading, setIsUploading] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [selectedSector, setSelectedSector] = useState<string>(DEFAULT_SECTOR);
    const [availablePoints, setAvailablePoints] = useState<string[]>([]);
    const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
    // Upload status managed by toast now

    // Template creation state
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [templateDataPoints, setTemplateDataPoints] = useState<string[]>([]);
    const [newDataPoint, setNewDataPoint] = useState('');
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // Get unified sectors (system + custom) - memoized to prevent recalculating on every render
    const unifiedSectors = useMemo(() => getUnifiedSectors(), [getUnifiedSectors]);

    // Load saved selections from localStorage on mount
    useEffect(() => {
        const savedSector = localStorage.getItem('dataPoints_selectedSector');
        if (savedSector) {
            setSelectedSector(savedSector);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update available points when sector changes
    useEffect(() => {
        // Try unified sector first, then fall back to system template
        const unifiedSector = getSectorById(selectedSector);
        const dataPoints = unifiedSector?.dataPoints || getSectorTemplate(selectedSector as SectorId).dataPoints;
        const defaultPoints = unifiedSector?.defaultPoints || getSectorTemplate(selectedSector as SectorId).defaultPoints;

        setAvailablePoints(dataPoints);

        // Try to load saved selections for this sector
        const savedPoints = localStorage.getItem(`dataPoints_selected_${selectedSector}`);
        if (savedPoints) {
            try {
                const parsed = JSON.parse(savedPoints);
                // Filter to only include valid points for this sector
                const validPoints = parsed.filter((p: string) => dataPoints.includes(p));
                if (validPoints.length > 0) {
                    setSelectedPoints(validPoints);
                    return;
                }
            } catch (e) {
                console.error('Error loading saved data points:', e);
            }
        }

        // Fallback to defaults if no saved points
        setSelectedPoints(defaultPoints);
    }, [selectedSector, getSectorById]);

    // Save selections to localStorage when they change
    useEffect(() => {
        if (selectedPoints.length > 0) {
            localStorage.setItem(`dataPoints_selected_${selectedSector}`, JSON.stringify(selectedPoints));
            localStorage.setItem('dataPoints_selectedSector', selectedSector);
        }
    }, [selectedPoints, selectedSector]);

    const toggleDataPoint = useCallback((point: string) => {
        setSelectedPoints(prev =>
            prev.includes(point)
                ? prev.filter(p => p !== point)
                : [...prev, point]
        );
    }, []);

    const handleSectorChange = useCallback((sectorId: string) => {
        setSelectedSector(sectorId);
    }, []);

    // Save current selection as a new template
    const saveAsTemplate = async () => {
        if (!newTemplateName.trim() || selectedPoints.length === 0) return;

        setSavingTemplate(true);
        try {
            // Use first 5 selected points as defaults
            const defaultPoints = selectedPoints.slice(0, 5);
            const result = await createTemplate(newTemplateName.trim(), selectedPoints, defaultPoints);

            if (result.success) {
                setShowSaveTemplate(false);
                setNewTemplateName('');
                toast.success(language === 'es' ? 'Plantilla guardada' : 'Template saved');
            } else {
                toast.error(language === 'es' ? 'Error al guardar plantilla' : 'Error saving template');
            }
        } catch (err) {
            console.error('Error saving template:', err);
        } finally {
            setSavingTemplate(false);
        }
    };

    // Delete a custom template
    const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const realId = templateId.replace('custom_', '');
        if (confirm(language === 'es' ? '¿Eliminar esta plantilla?' : 'Delete this template?')) {
            await deleteTemplate(realId);
            toast.success(language === 'es' ? 'Plantilla eliminada' : 'Template deleted');
            if (selectedSector === templateId) {
                setSelectedSector(DEFAULT_SECTOR);
            }
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Strict client-side validation using constants
        if (file.size > APP_CONFIG.UPLOAD.MAX_FILE_SIZE) {
            const maxSizeMB = APP_CONFIG.UPLOAD.MAX_FILE_SIZE / (1024 * 1024);
            toast.error(language === 'es' ? 'Archivo demasiado grande' : 'File too large', {
                description: language === 'es' ? `El límite es ${maxSizeMB}MB` : `Limit is ${maxSizeMB}MB`
            });
            return;
        }

        setIsUploading(true);

        const processPromise = async () => {
            // Step 1: Upload file to Supabase Storage
            const { uploadContractFile } = await import('@/lib/supabase');
            const { path: filePath, error: uploadError } = await uploadContractFile(file);

            if (uploadError || !filePath) {
                throw new Error(uploadError?.message || (language === 'es' ? 'Error al subir archivo' : 'Upload failed'));
            }

            // Step 2: Process contract with AI
            const formData = new FormData();
            formData.append('file', file);
            formData.append('dataPoints', JSON.stringify(selectedPoints));
            formData.append('sector', selectedSector);

            if (customQuery?.trim()) {
                formData.append('customQuery', customQuery.trim());
            }

            const response = await fetch('/api/process-contract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || (language === 'es' ? 'Error al procesar contrato' : 'Processing failed'));
            }

            const result: ProcessContractResponse = await response.json();

            if (!result.success || !result.data) {
                throw new Error(result.error || (language === 'es' ? 'Error al procesar contrato' : 'Processing failed'));
            }

            // Step 3: Save to database
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            const accessToken = session?.access_token;

            if (!accessToken) {
                throw new Error(language === 'es' ? 'Sesión expirada' : 'Session expired');
            }

            const saveResponse = await fetch('/api/save-contract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    id: result.data.id,
                    fileName: file.name,
                    filePath: filePath,
                    contractData: result.data,
                    sector: selectedSector,
                    tags: [],
                    requestedDataPoints: selectedPoints,
                    extractedText: result.data.extractedText, // Pass raw PDF text for chat
                }),
            });

            if (!saveResponse.ok) {
                const saveError = await saveResponse.json();
                throw new Error(saveError.error || 'Database save failed');
            }

            return result.data;
        };

        toast.promise(processPromise(), {
            loading: language === 'es' ? 'Analizando contrato...' : 'Analyzing contract...',
            success: (data) => {
                onUploadSuccess(data);
                return language === 'es' ? '¡Análisis completado!' : 'Analysis complete!';
            },
            error: (err) => {
                console.error(err);
                return language === 'es' ? 'Error en el proceso' : 'Process failed';
            },
            finally: () => setIsUploading(false)
        });

    }, [onUploadSuccess, customQuery, selectedPoints, selectedSector, language]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: APP_CONFIG.UPLOAD.ALLOWED_FILE_TYPES,
        maxFiles: 1,
        maxSize: APP_CONFIG.UPLOAD.MAX_FILE_SIZE,
        disabled: isUploading,
    });

    const dropzoneClass = `
    relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center
    transition-all duration-300 ease-out cursor-pointer backdrop-blur-xl
    ${isDragActive && !isDragReject
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02]'
            : isDragReject
                ? 'border-red-400 bg-red-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }
    ${isUploading ? 'pointer-events-none opacity-70' : ''}
`;

    return (
        <div className="w-full space-y-4">
            {/* Sector & Data Points Configuration - ABOVE dropzone */}
            <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowConfig(!showConfig);
                    }}
                    type="button"
                    className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent hover:via-white/[0.05] transition-all duration-500 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 ring-1 ring-primary/20 shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <span className="text-base font-semibold text-white block group-hover:text-primary transition-colors">
                                {language === 'es' ? 'Configurar Extracción' : 'Configure Extraction'}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">
                                {language === 'es' ? 'Personaliza los datos a analizar' : 'Customize analysis points'}
                            </span>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shadow-inner group-hover:border-primary/30 group-hover:text-primary transition-colors">
                            {selectedPoints.length} {language === 'es' ? 'seleccionados' : 'selected'}
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: showConfig ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="p-2 rounded-full text-zinc-500 group-hover:bg-white/5 group-hover:text-white transition-colors"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showConfig && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="border-t border-white/5 bg-black/20"
                        >
                            <div className="p-6 space-y-6">
                                {/* Sector Selector */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 ml-1">
                                        <Building2 className="w-3 h-3" />
                                        {language === 'es' ? 'Industria / Sector' : 'Industry / Sector'}
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {unifiedSectors.map((sector) => (
                                            <button
                                                key={sector.id}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSectorChange(sector.id);
                                                }}
                                                className={`
                                                    relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                                    ${selectedSector === sector.id
                                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_var(--primary-subtle)]'
                                                        : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                                                    }
                                                `}
                                            >
                                                {sector.isCustom && <User className="w-3.5 h-3.5 flex-shrink-0" />}
                                                <span className="truncate">{language === 'es' ? sector.labelEs : sector.labelEn}</span>
                                                {selectedSector === sector.id && (
                                                    <motion.div
                                                        layoutId="activeSector"
                                                        className="absolute inset-0 rounded-lg ring-1 ring-primary/30 pointer-events-none"
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}
                                            </button>
                                        ))}

                                        {/* Create Custom Template Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTemplateDataPoints(selectedPoints.length > 0 ? [...selectedPoints] : []);
                                                setNewTemplateName('');
                                                setNewDataPoint('');
                                                setShowTemplateModal(true);
                                            }}
                                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-500/80 border border-dashed border-amber-500/30 hover:border-amber-500/50 hover:text-amber-400 hover:from-amber-500/20 hover:to-orange-500/20 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{language === 'es' ? 'Crear' : 'Create'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Data Points Grid */}
                                <div>
                                    <div className="flex items-center justify-between mb-3 ml-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            {language === 'es' ? 'Puntos de Extracción' : 'Extraction Points'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {/* Select All / Deselect All Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (selectedPoints.length === availablePoints.length) {
                                                        // Deselect all
                                                        setSelectedPoints([]);
                                                    } else {
                                                        // Select all
                                                        setSelectedPoints([...availablePoints]);
                                                    }
                                                }}
                                                className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 border border-primary/20"
                                            >
                                                {selectedPoints.length === availablePoints.length
                                                    ? (language === 'es' ? '✗ Deseleccionar todos' : '✗ Deselect All')
                                                    : (language === 'es' ? '✓ Seleccionar todos' : '✓ Select All')
                                                }
                                            </button>
                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                AI POWERED
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {availablePoints.map((point) => {
                                            const isSelected = selectedPoints.includes(point);
                                            const translatedPoint = getDataPointTranslation(point, language);
                                            return (
                                                <button
                                                    key={point}
                                                    type="button"
                                                    title={translatedPoint} // Tooltip for full name on hover
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDataPoint(point);
                                                    }}
                                                    className={`
                                                        group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
                                                        ${isSelected
                                                            ? 'bg-primary/10 text-white border-primary/30 shadow-sm'
                                                            : 'bg-zinc-900/40 text-zinc-500 border-white/5 hover:bg-zinc-800 hover:text-zinc-300 hover:border-white/10'
                                                        }
                                                    `}
                                                >
                                                    <div className={`
                                                        w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors
                                                        ${isSelected ? 'bg-primary' : 'bg-white/5 group-hover:bg-white/10'}
                                                    `}>
                                                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                    </div>
                                                    <span className="truncate">{translatedPoint}</span>
                                                </button>
                                            );
                                        })}

                                        {/* Add Custom Data Point Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newPoint = prompt(
                                                    language === 'es'
                                                        ? 'Ingrese el nombre del nuevo punto de datos:'
                                                        : 'Enter the name of the new data point:'
                                                );
                                                if (newPoint && newPoint.trim()) {
                                                    const trimmedPoint = newPoint.trim();
                                                    if (!availablePoints.includes(trimmedPoint)) {
                                                        setAvailablePoints(prev => [...prev, trimmedPoint]);
                                                        setSelectedPoints(prev => [...prev, trimmedPoint]);
                                                        toast.success(
                                                            language === 'es'
                                                                ? `✓ Punto "${trimmedPoint}" añadido y seleccionado`
                                                                : `✓ Point "${trimmedPoint}" added and selected`
                                                        );
                                                    } else {
                                                        toast.error(
                                                            language === 'es'
                                                                ? 'Este punto de datos ya existe'
                                                                : 'This data point already exists'
                                                        );
                                                    }
                                                }
                                            }}
                                            className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border border-dashed border-primary/30 bg-transparent hover:bg-primary/10 text-primary hover:border-primary/50"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{language === 'es' ? 'Crear' : 'Create'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Save as Template Section */}
                                <div className="pt-4 border-t border-white/5">
                                    <AnimatePresence mode="wait">
                                        {!showSaveTemplate ? (
                                            <motion.div
                                                key="save-btn"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center justify-between"
                                            >
                                                <p className="text-xs text-zinc-500 font-medium">
                                                    {language === 'es'
                                                        ? `${selectedPoints.length} puntos activos para análisis`
                                                        : `${selectedPoints.length} active data points`}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowSaveTemplate(true);
                                                    }}
                                                    disabled={selectedPoints.length === 0}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    <Save className="w-3 h-3" />
                                                    {language === 'es' ? 'Guardar Configuración' : 'Save Config'}
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="save-form"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-white/5"
                                            >
                                                <input
                                                    type="text"
                                                    value={newTemplateName}
                                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder={language === 'es' ? 'Nombre de la plantilla...' : 'Template name...'}
                                                    className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder-zinc-600 font-medium"
                                                    autoFocus
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            saveAsTemplate();
                                                        }}
                                                        disabled={!newTemplateName.trim() || savingTemplate}
                                                        className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
                                                    >
                                                        {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowSaveTemplate(false);
                                                            setNewTemplateName('');
                                                        }}
                                                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dropzone or Processing State */}
            {isUploading ? (
                <div className="card h-64 flex items-center justify-center bg-black/40 border-white/5 backdrop-blur-md">
                    <ProcessingState />
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`
                        relative group overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center
                        transition-all duration-300 ease-out cursor-pointer
                        ${isDragActive
                            ? 'border-primary bg-primary/5 scale-[1.01] shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                        }
                    `}
                >
                    <input {...getInputProps()} />

                    <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
                        <div className={`
                            relative w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500
                            ${isDragActive
                                ? 'bg-primary/20 text-primary rotate-6 scale-110 shadow-[0_0_40px_-10px_var(--primary-DEFAULT)]'
                                : 'bg-gradient-to-br from-white/10 to-white/5 text-zinc-400 group-hover:scale-105 group-hover:text-white group-hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]'
                            }
                        `}>
                            {/* Inner rings for depth */}
                            <div className="absolute inset-0 rounded-3xl border border-white/10" />
                            <div className="absolute inset-2 rounded-2xl border border-white/5" />

                            <Upload className={`w-10 h-10 transition-colors z-10 ${isDragActive ? 'text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-zinc-500 group-hover:text-white'}`} strokeWidth={1.5} />
                        </div>

                        <div className="space-y-2 max-w-sm">
                            <p className="text-xl font-semibold text-white tracking-tight">
                                {isDragActive ? t('dropHere') : (language === 'es' ? 'Análisis Documental Inteligente' : 'Intelligent Document Analysis')}
                            </p>
                            <p className="text-base text-zinc-400 font-light">
                                {language === 'es' ? 'Procesa cualquier tipo de documento (legal, financiero, técnico) al instante' : 'Process any document type (legal, financial, technical) instantly'}
                            </p>
                        </div>

                        {!isUploading && (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-zinc-500 font-medium tracking-wide uppercase">
                                <span>PDF</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                <span>DOCX</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                <span>Max {APP_CONFIG.UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB</span>
                            </div>
                        )}
                    </div>

                    {/* Active Query Badge */}
                    {customQuery && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-4 left-0 right-0 flex justify-center"
                        >
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                <span className="text-xs font-medium text-purple-200">
                                    {language === 'es' ? 'Pregunta activa:' : 'Active question:'} <span className="text-white italic">"{customQuery}"</span>
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                <Link href="/security#encryption" className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-help" title={language === 'es' ? 'Tus datos viajan y se almacenan seguros con encriptación de grado bancario' : 'Your data travels and is stored securely with bank-grade encryption'}>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition-colors">
                        <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300">
                        {language === 'es' ? 'Encriptación AES-256' : 'AES-256 Encryption'}
                    </span>
                </Link>

                <Link href="/security#private-ai" className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-help" title={language === 'es' ? 'No utilizamos tus documentos para entrenar nuestros modelos de IA' : 'We do not use your documents to train our AI models'}>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-colors">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300">
                        {language === 'es' ? 'Procesamiento Privado' : 'Private Processing'}
                    </span>
                </Link>

                <Link href="/security#certified" className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-help" title={language === 'es' ? 'Cumplimos con la normativa europea de protección de datos' : 'We comply with European data protection regulations'}>
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/20 transition-colors">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300">
                        {language === 'es' ? 'Cumplimiento RGPD' : 'GDPR Compliant'}
                    </span>
                </Link>

                <Link href="/security#certified" className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-help" title={language === 'es' ? 'Infraestructura certificada ISO 27001 (Google & Supabase)' : 'ISO 27001 Certified Infrastructure (Google & Supabase)'}>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:text-amber-300 group-hover:bg-amber-500/20 transition-colors">
                        <Check className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300">
                        {language === 'es' ? 'ISO 27001' : 'ISO 27001'}
                    </span>
                </Link>
            </div>

            {/* Template Creation Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowTemplateModal(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-amber-400" />
                                    {language === 'es' ? 'Crear Plantilla Personalizada' : 'Create Custom Template'}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {language === 'es'
                                        ? 'Define los puntos de datos que quieres extraer'
                                        : 'Define the data points you want to extract'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Template Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {language === 'es' ? 'Nombre de la plantilla *' : 'Template name *'}
                            </label>
                            <input
                                type="text"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                placeholder={language === 'es' ? 'Ej: Contratos de Alquiler' : 'Ex: Rental Contracts'}
                                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>

                        {/* Data Points List */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {language === 'es' ? 'Puntos de datos' : 'Data Points'} ({templateDataPoints.length})
                            </label>

                            {templateDataPoints.length > 0 ? (
                                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                                    {templateDataPoints.map((point, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between px-3 py-2 bg-slate-700/30 rounded-lg group"
                                        >
                                            <span className="text-sm text-slate-300">{point}</span>
                                            <button
                                                onClick={() => setTemplateDataPoints(prev => prev.filter((_, i) => i !== idx))}
                                                className="p-1 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic mb-3">
                                    {language === 'es' ? 'Añade puntos de datos para tu plantilla' : 'Add data points for your template'}
                                </p>
                            )}

                            {/* Add new data point */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newDataPoint}
                                    onChange={(e) => setNewDataPoint(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newDataPoint.trim()) {
                                            setTemplateDataPoints(prev => [...prev, newDataPoint.trim()]);
                                            setNewDataPoint('');
                                        }
                                    }}
                                    placeholder={language === 'es' ? 'Nuevo punto de datos...' : 'New data point...'}
                                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                                <button
                                    onClick={() => {
                                        if (newDataPoint.trim()) {
                                            setTemplateDataPoints(prev => [...prev, newDataPoint.trim()]);
                                            setNewDataPoint('');
                                        }
                                    }}
                                    disabled={!newDataPoint.trim()}
                                    className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Suggested Points */}
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-slate-500 mb-2">
                                {language === 'es' ? 'Puntos sugeridos (clic para añadir)' : 'Suggested points (click to add)'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    language === 'es' ? 'Fecha de inicio' : 'Start Date',
                                    language === 'es' ? 'Fecha de fin' : 'End Date',
                                    language === 'es' ? 'Partes involucradas' : 'Parties Involved',
                                    language === 'es' ? 'Valor total' : 'Total Value',
                                    language === 'es' ? 'Condiciones de pago' : 'Payment Terms',
                                    language === 'es' ? 'Penalizaciones' : 'Penalties',
                                    language === 'es' ? 'Cláusulas especiales' : 'Special Clauses',
                                    language === 'es' ? 'Renovación automática' : 'Auto Renewal',
                                ].filter(p => !templateDataPoints.includes(p)).map((point) => (
                                    <button
                                        key={point}
                                        onClick={() => setTemplateDataPoints(prev => [...prev, point])}
                                        className="px-2 py-1 text-xs bg-slate-700/50 text-slate-400 rounded hover:bg-slate-600/50 hover:text-slate-300 transition-all"
                                    >
                                        + {point}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
                            >
                                {language === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newTemplateName.trim() || templateDataPoints.length === 0) return;
                                    setSavingTemplate(true);
                                    try {
                                        const defaultPoints = templateDataPoints.slice(0, 5);
                                        const result = await createTemplate(newTemplateName.trim(), templateDataPoints, defaultPoints);
                                        if (result.success) {
                                            setShowTemplateModal(false);
                                            setNewTemplateName('');
                                            setTemplateDataPoints([]);
                                        } else {
                                            console.error('Error saving template:', result.error);
                                        }
                                    } catch (err) {
                                        console.error('Error saving template:', err);
                                    } finally {
                                        setSavingTemplate(false);
                                    }
                                }}
                                disabled={!newTemplateName.trim() || templateDataPoints.length === 0 || savingTemplate}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {savingTemplate ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {language === 'es' ? 'Guardar Plantilla' : 'Save Template'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
