'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'es';

// Translation dictionary for all UI text
const translations = {
    en: {
        // Header
        appName: 'ContratoAlert',
        appTagline: 'Powered by YSN Solutions',
        keyDataPoints: 'Key Data Points',
        dataPoints: 'Data Points',
        autoExtraction: 'Auto Extraction',

        // Upload Section
        uploadTitle: 'Upload Contract',
        uploadDescription: 'Upload a PDF or DOCX contract file to automatically extract renewal data',
        dropzoneText: 'Drag & drop your contract here',
        dropzoneOr: 'or',
        browseFiles: 'browse files',
        dropHere: 'Drop your contract here',
        processing: 'Processing contract...',
        extractingData: 'Extracting data with AI',
        fileTypes: 'PDF • DOCX • Max 10MB',
        uploadSuccess: 'Contract processed successfully!',
        uploadError: 'Failed to process contract',

        // Analysis Result
        analysisTitle: 'Contract Analysis',
        latestAnalysis: 'Latest Analysis',
        summary: 'Summary',
        parties: 'Parties Involved',
        keyDates: 'Key Dates',
        effectiveDate: 'Effective Date',
        renewalDate: 'Renewal Date',
        noticePeriod: 'Notice Period',
        days: 'days',
        terminationClause: 'Termination Clause',
        riskScore: 'Risk Score',
        riskLow: 'Low Risk',
        riskMedium: 'Medium Risk',
        riskHigh: 'High Risk',
        alerts: 'Alerts & Warnings',
        noAlerts: 'No alerts for this contract',
        contractType: 'Contract Type',
        dismiss: 'Dismiss',

        // Abusive Clauses & Legal Audit
        legalAudit: 'Legal Audit',
        abusiveClauses: 'Potentially Abusive Clauses',
        noAbusiveClauses: 'No abusive clauses detected',
        legalReviewRecommended: 'Legal review recommended',

        // Action Buttons
        scheduleReminder: 'Schedule Reminder',
        draftEmail: 'Draft Email',
        calendarDownloaded: 'Calendar event downloaded!',
        emailCopied: 'Email draft copied to clipboard!',
        emailCopyFailed: 'Failed to copy. Opening in new window...',

        // Dashboard
        dashboardTitle: 'Document Dashboard',
        dashboardSubtitle: 'View and manage all processed documents with renewal alerts',
        dashboardDescription: 'View and manage all processed documents with renewal alerts',
        dashboardOverview: 'Overview',
        refresh: 'Refresh',
        noContracts: 'No documents yet',
        noContractsDescription: 'Upload your first document above to see it appear here with extracted renewal data.',
        showing: 'Showing',
        contracts: 'documents',
        contract: 'document',

        // Table Headers
        fileName: 'File Name',
        type: 'Type',
        status: 'Status',
        expired: 'Expired',
        dueSoon: 'Due Soon',
        upcoming: 'Upcoming',
        active: 'Active',

        // Export
        exportExcel: 'Export to Excel',
        exportToExcel: 'Export to Excel',
        exportHistory: 'Export History',
        historyEmpty: 'No documents to export',

        // Footer
        copyright: '© 2024 YSN Solutions. All rights reserved.',
        poweredBy: 'Powered by YSN Solutions',

        // General
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        close: 'Close',
        copy: 'Copy',
        download: 'Download',
    },
    es: {
        // Header
        appName: 'ContratoAlert',
        appTagline: 'Powered by YSN Solutions',
        keyDataPoints: 'Datos Clave',
        dataPoints: 'Puntos de Datos',
        autoExtraction: 'Extracción Automática',

        // Upload Section
        uploadTitle: 'Motor de Inteligencia Estratégica',
        uploadDescription: 'Transforma archivos y datos en decisiones inteligentes al instante',
        dropzoneText: 'Arrastra y suelta tu contrato aquí',
        dropzoneOr: 'o',
        browseFiles: 'buscar archivos',
        dropHere: 'Suelta tu contrato aquí',
        processing: 'Procesando contrato...',
        extractingData: 'Extrayendo datos con IA',
        fileTypes: 'PDF • DOCX • Máx 10MB',
        uploadSuccess: '¡Contrato procesado exitosamente!',
        uploadError: 'Error al procesar el contrato',

        // Analysis Result
        analysisTitle: 'Análisis de Contrato',
        latestAnalysis: 'Último Análisis',
        summary: 'Resumen',
        parties: 'Partes Involucradas',
        keyDates: 'Fechas Clave',
        effectiveDate: 'Fecha de Vigencia',
        renewalDate: 'Fecha de Renovación',
        noticePeriod: 'Período de Aviso',
        days: 'días',
        terminationClause: 'Cláusula de Terminación',
        riskScore: 'Puntuación de Riesgo',
        riskLow: 'Riesgo Bajo',
        riskMedium: 'Riesgo Medio',
        riskHigh: 'Riesgo Alto',
        alerts: 'Alertas y Advertencias',
        noAlerts: 'Sin alertas para este contrato',
        contractType: 'Tipo de Contrato',
        dismiss: 'Cerrar',

        // Abusive Clauses & Legal Audit
        legalAudit: 'Auditoría Legal',
        abusiveClauses: 'Cláusulas Potencialmente Abusivas',
        noAbusiveClauses: 'No se detectaron cláusulas abusivas',
        legalReviewRecommended: 'Revisión legal recomendada',

        // Action Buttons
        scheduleReminder: 'Agendar Recordatorio',
        draftEmail: 'Redactar Email',
        calendarDownloaded: '¡Evento de calendario descargado!',
        emailCopied: '¡Borrador de email copiado al portapapeles!',
        emailCopyFailed: 'Error al copiar. Abriendo en nueva ventana...',

        // Dashboard
        dashboardTitle: 'Panel de Documentos',
        dashboardSubtitle: 'Visualiza y gestiona todos los documentos con alertas de renovación',
        dashboardDescription: 'Visualiza y gestiona todos los documentos procesados con alertas de renovación',
        dashboardOverview: 'Resumen General',
        refresh: 'Actualizar',
        noContracts: 'Sin documentos aún',
        noContractsDescription: 'Sube tu primer documento arriba para verlo aquí con los datos de renovación extraídos.',
        showing: 'Mostrando',
        contracts: 'documentos',
        contract: 'documento',

        // Table Headers
        fileName: 'Nombre del Archivo',
        type: 'Tipo',
        status: 'Estado',
        expired: 'Vencido',
        dueSoon: 'Vence Pronto',
        upcoming: 'Próximo',
        active: 'Activo',

        // Export
        exportExcel: 'Exportar a Excel',
        exportToExcel: 'Exportar a Excel',
        exportHistory: 'Exportar Historial',
        historyEmpty: 'Sin documentos para exportar',

        // Footer
        copyright: '© 2024 YSN Solutions. Todos los derechos reservados.',
        poweredBy: 'Powered by YSN Solutions',

        // General
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        close: 'Cerrar',
        copy: 'Copiar',
        download: 'Descargar',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
    defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'es' }: LanguageProviderProps) {
    const [language, setLanguage] = useState<Language>(defaultLanguage);

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => prev === 'en' ? 'es' : 'en');
    }, []);

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || key;
    }, [language]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        toggleLanguage,
        t,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
