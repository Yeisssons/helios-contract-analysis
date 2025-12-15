'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UNIVERSAL_DATA_POINTS, DataPoint } from '@/constants/dataPoints';

interface ReanalysisModalProps {
    contractId: string;
    contractName: string;
    existingDataPoints: string[];
    isOpen: boolean;
    onClose: () => void;
    onReanalyze: (id: string, newDataPoints: string[]) => Promise<void>;
    fileAvailable: boolean;
}

export default function ReanalysisModal({
    contractId,
    contractName,
    existingDataPoints,
    isOpen,
    onClose,
    onReanalyze,
    fileAvailable
}: ReanalysisModalProps) {
    const { language } = useLanguage();
    const [selectedNewPoints, setSelectedNewPoints] = useState<DataPoint[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Available points are those not already extracted
    const availablePoints = UNIVERSAL_DATA_POINTS.filter(
        point => !existingDataPoints.includes(point)
    );

    const togglePoint = (point: DataPoint) => {
        setSelectedNewPoints(prev =>
            prev.includes(point)
                ? prev.filter(p => p !== point)
                : [...prev, point]
        );
    };

    const handleReanalyze = async () => {
        if (selectedNewPoints.length === 0) return;

        setIsProcessing(true);
        try {
            await onReanalyze(contractId, selectedNewPoints);
            setSelectedNewPoints([]);
            onClose();
        } catch (error) {
            console.error('Reanalysis failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-emerald-400" />
                                    {language === 'es' ? 'Re-analizar Contrato' : 'Re-analyze Contract'}
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">{contractName}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                            {!fileAvailable ? (
                                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-medium">
                                            {language === 'es' ? 'Archivo no disponible' : 'File not available'}
                                        </p>
                                        <p className="text-sm text-red-300/70 mt-1">
                                            {language === 'es'
                                                ? 'El archivo original no está en caché. Por favor, suba el documento de nuevo si desea re-analizarlo.'
                                                : 'The original file is not in cache. Please re-upload the document if you want to re-analyze it.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Existing Data Points */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-slate-300 mb-3">
                                            {language === 'es' ? 'Datos ya extraídos:' : 'Already extracted:'}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {existingDataPoints.map(point => (
                                                <div
                                                    key={point}
                                                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium flex items-center gap-1.5"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    {point}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Available Data Points */}
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-300 mb-3">
                                            {language === 'es'
                                                ? `Seleccionar nuevos datos a extraer (${selectedNewPoints.length} seleccionados):`
                                                : `Select new data to extract (${selectedNewPoints.length} selected):`}
                                        </h3>

                                        {availablePoints.length === 0 ? (
                                            <p className="text-slate-400 text-sm">
                                                {language === 'es'
                                                    ? 'Todos los datos disponibles ya han sido extraídos.'
                                                    : 'All available data points have been extracted.'}
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {availablePoints.map(point => (
                                                    <button
                                                        key={point}
                                                        onClick={() => togglePoint(point)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${selectedNewPoints.includes(point)
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${selectedNewPoints.includes(point)
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-white/10'
                                                                }`}
                                                        >
                                                            {selectedNewPoints.includes(point) && (
                                                                <Check className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                        <span className="truncate">{point}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                {language === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleReanalyze}
                                disabled={!fileAvailable || selectedNewPoints.length === 0 || isProcessing}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {language === 'es' ? 'Procesando...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        {language === 'es' ? 'Extraer Datos' : 'Extract Data'}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
