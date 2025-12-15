// Universal Data Points for contract extraction
export const UNIVERSAL_DATA_POINTS = [
    // Pre-selected Core Points
    'Fecha de Vigencia',
    'Fecha de Renovación',
    'Periodo de Aviso', // Changed from Período (accent) to match user req if needed, but usually accents are fine
    'Cláusula de Terminación',
    'Partes Involucradas',

    // Others
    'Jurisdicción',
    'Ley Aplicable',
    'Exclusividad',
    'Términos de Pago',
    'Límite de Responsabilidad',
    'Indemnización',
    'Fuerza Mayor',
    'No Competencia',
    'Confidencialidad',
    'Protección de Datos',
    'Seguros',
    'Derechos de Auditoría',
    'Cesión',
    'Modificación',
    'Notificaciones',
    'Garantías',
    'Propiedad Intelectual',
    'Soporte y Mantenimiento',
    'SLA (Nivel de Servicio)',
    'Penalizaciones',
    'Subcontratación',
    'Cambio de Control',
    'Resolución de Disputas',
    'Impuestos',
    'Moneda',
] as const;

export type DataPoint = typeof UNIVERSAL_DATA_POINTS[number];

// Default selected data points (core 5)
export const DEFAULT_SELECTED_POINTS: DataPoint[] = [
    'Fecha de Vigencia',
    'Fecha de Renovación',
    'Periodo de Aviso',
    'Cláusula de Terminación',
    'Partes Involucradas',
];
