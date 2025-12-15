export type SectorId = 'financial' | 'technology' | 'construction' | 'healthcare' | 'real_estate' | 'public_sector' | 'hr' | 'legal' | 'insurance' | 'utilities' | 'logistics' | 'pharma';

export interface SectorTemplate {
    id: SectorId;
    nameEs: string;
    nameEn: string;
    icon: string;
    dataPoints: string[];
    defaultPoints: string[]; // Top 10 critical points
    description: string;
}

// ==================== FINANCIAL SERVICES / BANKING ====================
const FINANCIAL_POINTS = [
    "Tasa de Interés",
    "Principal del Préstamo",
    "Plazo de Amortización",
    "Garantías/Colateral",
    "Eventos de Default",
    "Penalizaciones por Mora",
    "Prepago Permitido",
    "Comisiones y Cargos",
    "Covenant Financieros",
    "Calificación Crediticia Requerida",
    "Seguro Requerido",
    "Destino de los Fondos",
    "Frecuencia de Pago",
    "Método de Cálculo Interés",
    "Jurisdicción Regulatoria",
    "Cumplimiento AML/KYC",
    "Divulgaciones Obligatorias",
    "Derecho de Setoff",
    "Subordinación de Deuda",
    "Cross-Default Provisions",
    "Reporting Financiero",
    "Auditorías Permitidas",
    "Material Adverse Change",
    "Representations & Warranties",
    "Indemnización",
    "Confidencialidad",
    "Cesión de Contrato",
    "Ley Aplicable",
    "Resolución de Disputas",
    "Entidad Prestamista"
];

// Top 5 defaults are defined at the end of the file in SECTOR_DEFAULTS

// ==================== TECHNOLOGY / SaaS ====================
const TECHNOLOGY_POINTS = [
    "Tipo de Licencia",
    "Límites de Usuarios",
    "Nivel de Servicio (SLA)",
    "Uptime Garantizado",
    "Propiedad Intelectual",
    "Código Fuente Escrow",
    "Protección de Datos (GDPR)",
    "Seguridad de Datos",
    "Backup y Recuperación",
    "Límites de API",
    "Personalización Permitida",
    "Integración con Terceros",
    "Certificaciones de Seguridad",
    "Auditorías de Seguridad",
    "Notificación de Brechas",
    "Retención de Datos",
    "Portabilidad de Datos",
    "Soporte Técnico Incluido",
    "Horario de Soporte",
    "Actualizaciones y Upgrades",
    "Versión del Software",
    "Ambiente de Desarrollo/Test",
    "Documentación Técnica",
    "Training Incluido",
    "Escalabilidad",
    "Límites de Almacenamiento",
    "Restricciones Geográficas",
    "Compliance Regulatorio",
    "Penalizaciones SLA",
    "Plan de Migración"
];



// ==================== CONSTRUCTION / INFRASTRUCTURE ====================
const CONSTRUCTION_POINTS = [
    "Presupuesto Total Obra",
    "Plazo de Ejecución",
    "Fecha de Inicio Obras",
    "Fianza de Cumplimiento",
    "Fianza de Anticipo",
    "Certificaciones de Calidad",
    "Certificaciones de Seguridad",
    "Seguro de Responsabilidad Civil",
    "Seguro Todo Riesgo Obra",
    "Penalizaciones por Retraso",
    "Bonificaciones por Adelanto",
    "Hitos de Pago",
    "Certificaciones Mensuales",
    "Retención de Garantía",
    "Plazo de Garantía",
    "Vicios Ocultos",
    "Modificados Permitidos",
    "Límite de Subcontratación",
    "Homologación Subcontratistas",
    "Prevención de Riesgos",
    "Coordinación de Seguridad",
    "Plan de Calidad",
    "Control de Materiales",
    "Certificados de Materiales",
    "Acta de Replanteo",
    "Acta de Recepción",
    "Libro de Órdenes",
    "Resolución por Incumplimiento",
    "Fuerza Mayor",
    "Arbitraje de Construcción"
];

const CONSTRUCTION_DEFAULTS = [
    "Presupuesto Total Obra",
    "Plazo de Ejecución",
    "Fianza de Cumplimiento",
    "Seguro Todo Riesgo Obra",
    "Penalizaciones por Retraso",
    "Hitos de Pago",
    "Plazo de Garantía",
    "Certificaciones de Seguridad",
    "Acta de Recepción",
    "Modificados Permitidos"
];

// ==================== HEALTHCARE / MEDICAL ====================
const HEALTHCARE_POINTS = [
    "Cumplimiento HIPAA",
    "Credenciales Médicas",
    "Licencias Profesionales",
    "Seguro de Malpractice",
    "Límites de Cobertura",
    "Documentación Clínica Requerida",
    "Privacidad del Paciente",
    "Acceso a Historias Clínicas",
    "Protocolos de Seguridad",
    "Equipamiento Médico Incluido",
    "Mantenimiento de Equipos",
    "Certificaciones de Equipos",
    "Servicios Cubiertos",
    "Servicios Excluidos",
    "Red de Proveedores",
    "Tarifas Médicas",
    "Facturación a Aseguradoras",
    "Copagos y Deducibles",
    "Autorización Previa Requerida",
    "Emergencias Cubiertas",
    "Telemedicina Permitida",
    "Consentimiento Informado",
    "Segundas Opiniones",
    "Prescripción de Medicamentos",
    "Formulario de Medicamentos",
    "Investigación Clínica",
    "Comité de Ética",
    "Reporte de Eventos Adversos",
    "Auditorías de Calidad",
    "Acreditación Hospitalaria"
];

const HEALTHCARE_DEFAULTS = [
    "Cumplimiento HIPAA",
    "Credenciales Médicas",
    "Seguro de Malpractice",
    "Privacidad del Paciente",
    "Servicios Cubiertos",
    "Tarifas Médicas",
    "Autorización Previa Requerida",
    "Consentimiento Informado",
    "Equipamiento Médico Incluido",
    "Reporte de Eventos Adversos"
];

// ==================== REAL ESTATE / INMOBILIARIO ====================
const INMOBILIARIO_POINTS = [
    "Renta Mensual",
    "Fianza/Depósito",
    "Duración del Contrato",
    "Revisión IPC",
    "Gastos de Comunidad",
    "Pago IBI",
    "Referencia Catastral",
    "Certificado Energético",
    "Uso Permitido",
    "Prohibición Subarriendo",
    "Política de Obras",
    "Mascotas Permitidas",
    "Seguro Obligatorio",
    "Cláusula Desistimiento",
    "Periodo Preaviso",
    "Aval Bancario",
    "Estado del Inmueble",
    "Reparaciones Mayores",
    "Reparaciones Menores",
    "Cesión de Contrato",
    "Opción de Compra",
    "Derecho Tanteo/Retracto",
    "Dirección de Notificaciones",
    "Jurisdicción/Fuero",
    "Periodo de Carencia",
    "Forma de Pago",
    "Solidaridad Arrendatarios",
    "Cédula Habitabilidad",
    "Licencia Actividad",
    "Cláusula Diplomática"
];

const INMOBILIARIO_DEFAULTS = [
    "Renta Mensual",
    "Fianza/Depósito",
    "Duración del Contrato",
    "Revisión IPC",
    "Periodo Preaviso",
    "Uso Permitido",
    "Reparaciones Mayores",
    "Seguro Obligatorio",
    "Referencia Catastral",
    "Forma de Pago"
];

// ==================== PUBLIC SECTOR / SECTOR PÚBLICO ====================
const SECTOR_PUBLICO_POINTS = [
    "Presupuesto Base Licitación",
    "Valor Estimado Contrato",
    "Plazo de Ejecución",
    "Garantía Definitiva",
    "Garantía Provisional",
    "Clasificación CPV",
    "Criterios de Adjudicación",
    "Revisión de Precios",
    "Penalidades por Retraso",
    "Límite Subcontratación",
    "Mesa de Contratación",
    "Fecha Publicación BOE",
    "Solvencia Técnica",
    "Solvencia Económica",
    "División por Lotes",
    "Prórrogas Permitidas",
    "Modificados del Contrato",
    "Acta de Recepción",
    "Plazo de Garantía",
    "Certificaciones Mensuales",
    "Obligación Factura Electrónica",
    "Cumplimiento RGPD",
    "Confidencialidad",
    "Intereses de Demora",
    "Causas de Resolución",
    "Cesión de Contrato",
    "Compromiso UTE",
    "Baja Temeraria",
    "Identidad Adjudicatario",
    "Órgano de Contratación"
];

const SECTOR_PUBLICO_DEFAULTS = [
    "Presupuesto Base Licitación",
    "Clasificación CPV",
    "Plazo de Ejecución",
    "Garantía Definitiva",
    "Criterios de Adjudicación",
    "Penalidades por Retraso",
    "Fecha Publicación BOE",
    "Solvencia Técnica",
    "Acta de Recepción",
    "Órgano de Contratación"
];

// ==================== HR / LABORAL ====================
const LABORAL_POINTS = [
    "Salario Bruto Anual",
    "Salario Variable/Bonus",
    "Tipo de Jornada",
    "Horario de Trabajo",
    "Convenio Colectivo",
    "Categoría Profesional",
    "Periodo de Prueba",
    "Preaviso Baja Voluntaria",
    "Indemnización Despido",
    "Cláusula No Competencia",
    "Pacto de Permanencia",
    "Exclusividad",
    "Vacaciones Anuales",
    "Beneficios Sociales",
    "Teletrabajo",
    "Lugar de Trabajo",
    "Movilidad Geográfica",
    "Confidencialidad",
    "Propiedad Intelectual",
    "Uso Dispositivos Empresa",
    "Protección de Datos",
    "Prevención Riesgos",
    "Reconocimiento Médico",
    "Código de Conducta",
    "Fecha Antigüedad",
    "Tipo de Contrato",
    "Duración Determinada",
    "Horas Extraordinarias",
    "Distribución Irregular Jornada",
    "Cláusula de Privacidad"
];

const LABORAL_DEFAULTS = [
    "Salario Bruto Anual",
    "Tipo de Contrato",
    "Categoría Profesional",
    "Periodo de Prueba",
    "Tipo de Jornada",
    "Vacaciones Anuales",
    "Preaviso Baja Voluntaria",
    "Indemnización Despido",
    "Convenio Colectivo",
    "Lugar de Trabajo"
];

// ==================== LEGAL / CORPORATE ====================
const LEGAL_CORPORATIVO_POINTS = [
    "Fecha de Vigencia",
    "Fecha de Renovación",
    "Periodo de Aviso",
    "Cláusula de Terminación",
    "Partes Involucradas",
    "Jurisdicción",
    "Ley Aplicable",
    "Idioma del Contrato",
    "Exclusividad",
    "Confidencialidad",
    "No Competencia",
    "Propiedad Intelectual",
    "Moneda",
    "Términos de Pago",
    "Penalizaciones",
    "Impuestos",
    "Límite de Responsabilidad",
    "Indemnización",
    "Garantías",
    "Fuerza Mayor",
    "Protección de Datos (GDPR)",
    "Seguros Requeridos",
    "Derechos de Auditoría",
    "Cesión de Contrato",
    "Soporte y Mantenimiento",
    "Nivel de Servicio (SLA)",
    "Subcontratación",
    "Cambio de Control",
    "Resolución de Disputas",
    "Modificación del Contrato"
];

const LEGAL_CORPORATIVO_DEFAULTS = [
    "Fecha de Vigencia",
    "Fecha de Renovación",
    "Partes Involucradas",
    "Cláusula de Terminación",
    "Términos de Pago",
    "Límite de Responsabilidad",
    "Jurisdicción",
    "Ley Aplicable",
    "Confidencialidad",
    "Resolución de Disputas"
];

// ==================== CORPORATE INSURANCE / SEGUROS CORPORATIVOS ====================
const INSURANCE_POINTS = [
    "Póliza D&O (Directors & Officers)",
    "Responsabilidad Civil General",
    "Lucro Cesante / Business Interruption",
    "Ciberriesgo y Protección Datos",
    "Flota de Vehículos Corporativos",
    "Cobertura de Mercancías en Tránsito",
    "Franquicia Corporativa",
    "Límite Agregado Anual",
    "Prima Neta vs Prima Bruta",
    "Coaseguro Porcentaje",
    "Reaseguro Aplicable",
    "Ámbito Territorial Internacional",
    "Exclusiones Específicas",
    "Período de Retroactividad",
    "Periodo de Notificación Extendido",
    "Sublímites por Garantía",
    "Deducible por Siniestro",
    "Agregado de Deducibles",
    "Valoración a Nuevo vs Depreciado",
    "Cobertura Todo Riesgo",
    "Catástrofes Naturales Cubiertas",
    "Actos Terroristas",
    "Cumplimiento Normativo",
    "Peritación Independiente",
    "Plazo de Declaración Siniestro",
    "Subrogación de Derechos",
    "Rehabilitación de Imagen",
    "Costes de Defensa Jurídica",
    "Gestión de Crisis",
    "Renovación Automática"
];

const INSURANCE_DEFAULTS = [
    "Póliza D&O (Directors & Officers)",
    "Responsabilidad Civil General",
    "Lucro Cesante / Business Interruption",
    "Ciberriesgo y Protección Datos",
    "Límite Agregado Anual",
    "Prima Neta vs Prima Bruta",
    "Franquicia Corporativa",
    "Ámbito Territorial Internacional",
    "Exclusiones Específicas",
    "Plazo de Declaración Siniestro"
];

// ==================== ENTERPRISE UTILITIES & TELECOM ====================
const UTILITIES_POINTS = [
    "Tarifa de Acceso (6.1TD, 6.2TD, 6.3TD, 6.4TD)",
    "Potencia Contratada P1",
    "Potencia Contratada P2",
    "Potencia Contratada P3",
    "Potencia Contratada P4-P6",
    "Penalización Energía Reactiva",
    "Certificados Origen Renovable (GDO)",
    "Garantía de Suministro",
    "Maxímetro Mensual",
    "Precio Energía Indexado vs Fijo",
    "SLA Disponibilidad (%)",
    "Caudal Garantizado Mbps",
    "Troncales SIP Empresariales",
    "IP Fija / Rangos IP Asignados",
    "MPLS / Cloud Privado",
    "Mantenimiento 24x7 Nivel 2/3",
    "Penalización por Corte Servicio",
    "Tiempo Máximo Resolución Incidencias",
    "Backup de Línea (Redundancia)",
    "VPN Empresarial",
    "Ancho de Banda Simétrico",
    "Latencia Garantizada",
    "QoS (Quality of Service)",
    "Consumo Mínimo Facturado",
    "Término Fijo Potencia",
    "Término Variable Energía",
    "Cambio Comercializadora Permitido",
    "Monitorización en Tiempo Real",
    "Factura Electrónica B2B",
    "Vencimiento y Preaviso"
];

const UTILITIES_DEFAULTS = [
    "SLA Disponibilidad (%)",
    "Tarifa de Acceso (6.1TD, 6.2TD, 6.3TD, 6.4TD)",
    "Potencia Contratada P1",
    "Penalización Energía Reactiva",
    "Caudal Garantizado Mbps",
    "Penalización por Corte Servicio",
    "Mantenimiento 24x7 Nivel 2/3",
    "IP Fija / Rangos IP Asignados",
    "Vencimiento y Preaviso",
    "Precio Energía Indexado vs Fijo"
];

// ==================== INDUSTRIAL LOGISTICS & SUPPLY CHAIN ====================
const LOGISTICS_POINTS = [
    "Incoterms Aplicables (EXW, FOB, CIF, DDP)",
    "Transporte Internacional Marítimo",
    "Transporte Aéreo Urgente",
    "Transporte Terrestre Cross-Border",
    "Almacenamiento Temporal Aduanas",
    "Gestión Documental DUA/T1",
    "Seguro de Carga Internacional",
    "Embalaje y Paletización",
    "Cadena de Frío (2-8°C)",
    "Tracking en Tiempo Real",
    "Certificados Fitosanitarios",
    "Documentación EUR1/ATR",
    "Despacho Aduanero Incluido",
    "Aranceles e Impuestos Import",
    "Consolidación LCL vs FCL",
    "Lead Time Comprometido",
    "Slots Garantizados Naviera",
    "Cross-Docking vs Warehousing",
    "Gestión de Devoluciones (RMA)",
    "Última Milla B2B",
    "Flota Propia vs Subcontratada",
    "Trazabilidad Lote/Serie",
    "Certificación ISO 9001 Logística",
    "Gestión de Inventarios (JIT)",
    "Costes Demoras Portuarias",
    "Responsabilidad por Pérdida",
    "SLA Entrega (99.x%)",
    "Penalizaciones Retraso",
    "Facturación por Peso/Volumen",
    "Contrato Marco Logístico"
];

const LOGISTICS_DEFAULTS = [
    "Incoterms Aplicables (EXW, FOB, CIF, DDP)",
    "Lead Time Comprometido",
    "Seguro de Carga Internacional",
    "SLA Entrega (99.x%)",
    "Despacho Aduanero Incluido",
    "Tracking en Tiempo Real",
    "Penalizaciones Retraso",
    "Responsabilidad por Pérdida",
    "Cadena de Frío (2-8°C)",
    "Contrato Marco Logístico"
];

// ==================== PHARMACEUTICAL & LIFE SCIENCES ====================
const PHARMA_POINTS = [
    "Cumplimiento GDP (Good Distribution Practice)",
    "Licencia Sanitaria AEMPS",
    "Ensayos Clínicos Fase I-IV",
    "Protocolo de Estudio Aprobado",
    "Comité Ético Investigación",
    "Consentimiento Informado Pacientes",
    "Protección Datos Salud (RGPD)",
    "Farmacovigilancia y Reporte RAM",
    "Trazabilidad Lote Farmacéutico",
    "Certificado Principio Activo (API)",
    "Cadena de Custodia Controlados",
    "Temperatura Almacenamiento (2-8°C, 15-25°C)",
    "Auditorías Regulatorias",
    "Registro Sanitario Producto",
    "Patente Farmacéutica Vigente",
    "Licencia de Fabricación",
    "Certificado GMP (Good Manufacturing Practice)",
    "Estabilidad del Producto",
    "Fecha de Caducidad",
    "Destrucción Controlada Productos",
    "Notificación Defectos Calidad",
    "Supply Agreement APIs",
    "Acuerdo de Confidencialidad (CDA)",
    "Propiedad Intelectual Formulación",
    "Royalties sobre Ventas",
    "Exclusividad Territorial",
    "Cumplimiento FDA/EMA",
    "Costes de Desarrollo Compartidos",
    "Milestone Payments",
    "Devolución Stock Caducado"
];

const PHARMA_DEFAULTS = [
    "Cumplimiento GDP (Good Distribution Practice)",
    "Licencia Sanitaria AEMPS",
    "Protección Datos Salud (RGPD)",
    "Ensayos Clínicos Fase I-IV",
    "Farmacovigilancia y Reporte RAM",
    "Certificado GMP (Good Manufacturing Practice)",
    "Trazabilidad Lote Farmacéutico",
    "Patente Farmacéutica Vigente",
    "Temperatura Almacenamiento (2-8°C, 15-25°C)",
    "Consentimiento Informado Pacientes"
];

// ==================== SECTOR TEMPLATES ====================
export const SECTOR_TEMPLATES: SectorTemplate[] = [
    {
        id: 'financial',
        nameEs: 'Servicios Financieros',
        nameEn: 'Financial Services',
        icon: '🏦',
        dataPoints: FINANCIAL_POINTS,
        defaultPoints: [
            "Tasa de Interés",
            "Principal del Préstamo",
            "Garantías/Colateral",
            "Eventos de Default",
            "Frecuencia de Pago"
        ],
        description: 'Préstamos, créditos, inversiones y servicios bancarios'
    },
    {
        id: 'technology',
        nameEs: 'Tecnología / SaaS',
        nameEn: 'Technology / SaaS',
        icon: '💻',
        dataPoints: TECHNOLOGY_POINTS,
        defaultPoints: [
            "Tipo de Licencia",
            "Nivel de Servicio (SLA)",
            "Protección de Datos (GDPR)",
            "Uptime Garantizado",
            "Límites de Usuarios"
        ],
        description: 'Licencias de software, SLAs, APIs y servicios cloud'
    },
    {
        id: 'construction',
        nameEs: 'Construcción',
        nameEn: 'Construction',
        icon: '🏗️',
        dataPoints: CONSTRUCTION_POINTS,
        defaultPoints: [
            "Presupuesto Total Obra",
            "Plazo de Ejecución",
            "Penalizaciones por Retraso",
            "Fianza de Cumplimiento",
            "Hitos de Pago"
        ],
        description: 'Obras, infraestructura, subcontratas y certificaciones'
    },
    {
        id: 'healthcare',
        nameEs: 'Salud / Médico',
        nameEn: 'Healthcare',
        icon: '🏥',
        dataPoints: HEALTHCARE_POINTS,
        defaultPoints: [
            "Cumplimiento HIPAA",
            "Seguro de Malpractice",
            "Servicios Cubiertos",
            "Tarifas Médicas",
            "Autorización Previa Requerida"
        ],
        description: 'Proveedores médicos, equipamiento, seguros de salud'
    },
    {
        id: 'real_estate',
        nameEs: 'Inmobiliario',
        nameEn: 'Real Estate',
        icon: '🏢',
        dataPoints: INMOBILIARIO_POINTS,
        defaultPoints: [
            "Renta Mensual",
            "Duración del Contrato",
            "Fianza/Depósito",
            "Periodo Preaviso",
            "Revisión IPC"
        ],
        description: 'Contratos de arrendamiento, compraventa y gestión inmobiliaria'
    },
    {
        id: 'public_sector',
        nameEs: 'Sector Público',
        nameEn: 'Public Sector',
        icon: '🏛️',
        dataPoints: SECTOR_PUBLICO_POINTS,
        defaultPoints: [
            "Presupuesto Base Licitación",
            "Clasificación CPV",
            "Plazo de Ejecución",
            "Garantía Definitiva",
            "Criterios de Adjudicación"
        ],
        description: 'Licitaciones, contratos públicos y administración'
    },
    {
        id: 'hr',
        nameEs: 'Laboral / RRHH',
        nameEn: 'HR / Employment',
        icon: '👥',
        dataPoints: LABORAL_POINTS,
        defaultPoints: [
            "Salario Bruto Anual",
            "Tipo de Contrato",
            "Periodo de Prueba",
            "Preaviso Baja Voluntaria",
            "Convenio Colectivo"
        ],
        description: 'Contratos laborales, nóminas y gestión de personal'
    },
    {
        id: 'legal',
        nameEs: 'Legal / Corporativo',
        nameEn: 'Legal / Corporate',
        icon: '⚖️',
        dataPoints: LEGAL_CORPORATIVO_POINTS,
        defaultPoints: [
            "Fecha de Vigencia",
            "Cláusula de Terminación",
            "Términos de Pago",
            "Límite de Responsabilidad",
            "Jurisdicción"
        ],
        description: 'Contratos generales, acuerdos corporativos y legal'
    },
    {
        id: 'insurance',
        nameEs: 'Seguros Corporativos',
        nameEn: 'Corporate Insurance',
        icon: '🛡️',
        dataPoints: INSURANCE_POINTS,
        defaultPoints: [
            "Póliza D&O (Directors & Officers)",
            "Lucro Cesante / Business Interruption",
            "Límite Agregado Anual",
            "Prima Neta vs Prima Bruta",
            "Exclusiones Específicas"
        ],
        description: 'Pólizas empresariales, D&O, cyber, lucro cesante y riesgos corporativos'
    },
    {
        id: 'utilities',
        nameEs: 'Utilities & Telecom',
        nameEn: 'Enterprise Utilities',
        icon: '⚡',
        dataPoints: UTILITIES_POINTS,
        defaultPoints: [
            "SLA Disponibilidad (%)",
            "Tarifa de Acceso (6.1TD, 6.2TD, 6.3TD, 6.4TD)",
            "Potencia Contratada P1",
            "Penalización Energía Reactiva",
            "Vencimiento y Preaviso"
        ],
        description: 'Contratos empresariales de energía, telecom, SLA y MPLS'
    },
    {
        id: 'logistics',
        nameEs: 'Logística Industrial',
        nameEn: 'Industrial Logistics',
        icon: '📦',
        dataPoints: LOGISTICS_POINTS,
        defaultPoints: [
            "Incoterms Aplicables (EXW, FOB, CIF, DDP)",
            "Lead Time Comprometido",
            "Seguro de Carga Internacional",
            "SLA Entrega (99.x%)",
            "Responsabilidad por Pérdida"
        ],
        description: 'Supply chain, Incoterms, transporte internacional y aduanas'
    },
    {
        id: 'pharma',
        nameEs: 'Farmacéutica',
        nameEn: 'Pharmaceutical',
        icon: '💊',
        dataPoints: PHARMA_POINTS,
        defaultPoints: [
            "Cumplimiento GDP (Good Distribution Practice)",
            "Licencia Sanitaria AEMPS",
            "Ensayos Clínicos Fase I-IV",
            "Certificado GMP (Good Manufacturing Practice)",
            "Temperatura Almacenamiento (2-8°C, 15-25°C)"
        ],
        description: 'GDP, ensayos clínicos, regulación sanitaria y patentes'
    }
];

export const getSectorTemplate = (sectorId: SectorId): SectorTemplate => {
    const template = SECTOR_TEMPLATES.find(s => s.id === sectorId);
    if (!template) {
        // Default to legal/corporate
        return SECTOR_TEMPLATES.find(s => s.id === 'legal')!;
    }
    return template;
};

export const DEFAULT_SECTOR: SectorId = 'legal';

// Quick access to defaults - TOP 5 DEAL KILLERS per sector
export const SECTOR_DEFAULTS: Record<SectorId, string[]> = {
    // Financial: The 5 points that make or break a loan/credit facility
    financial: [
        "Tasa de Interés",
        "Principal del Préstamo",
        "Garantías/Colateral",
        "Eventos de Default",
        "Frecuencia de Pago"
    ],
    // Technology: The 5 SaaS contract essentials
    technology: [
        "Tipo de Licencia",
        "Nivel de Servicio (SLA)",
        "Protección de Datos (GDPR)",
        "Uptime Garantizado",
        "Límites de Usuarios"
    ],
    // Construction: The 5 project-critical terms
    construction: [
        "Presupuesto Total Obra",
        "Plazo de Ejecución",
        "Penalizaciones por Retraso",
        "Fianza de Cumplimiento",
        "Hitos de Pago"
    ],
    // Healthcare: The 5 compliance & liability essentials
    healthcare: [
        "Cumplimiento HIPAA",
        "Seguro de Malpractice",
        "Servicios Cubiertos",
        "Tarifas Médicas",
        "Autorización Previa Requerida"
    ],
    // Real Estate: The 5 rental/lease fundamentals
    real_estate: [
        "Renta Mensual",
        "Duración del Contrato",
        "Fianza/Depósito",
        "Periodo Preaviso",
        "Revisión IPC"
    ],
    // Public Sector: The 5 procurement must-haves
    public_sector: [
        "Presupuesto Base Licitación",
        "Clasificación CPV",
        "Plazo de Ejecución",
        "Garantía Definitiva",
        "Criterios de Adjudicación"
    ],
    // HR: The 5 employment contract basics
    hr: [
        "Salario Bruto Anual",
        "Tipo de Contrato",
        "Periodo de Prueba",
        "Preaviso Baja Voluntaria",
        "Convenio Colectivo"
    ],
    // Legal/Corporate: The 5 universal contract pillars
    legal: [
        "Fecha de Vigencia",
        "Cláusula de Terminación",
        "Términos de Pago",
        "Límite de Responsabilidad",
        "Jurisdicción"
    ],
    // Insurance: The 5 policy deal-breakers
    insurance: [
        "Póliza D&O (Directors & Officers)",
        "Lucro Cesante / Business Interruption",
        "Límite Agregado Anual",
        "Prima Neta vs Prima Bruta",
        "Exclusiones Específicas"
    ],
    // Utilities: The 5 corporate energy/telecom essentials
    utilities: [
        "SLA Disponibilidad (%)",
        "Tarifa de Acceso (6.1TD, 6.2TD, 6.3TD, 6.4TD)",
        "Potencia Contratada P1",
        "Penalización Energía Reactiva",
        "Vencimiento y Preaviso"
    ],
    // Logistics: The 5 supply chain critical terms
    logistics: [
        "Incoterms Aplicables (EXW, FOB, CIF, DDP)",
        "Lead Time Comprometido",
        "Seguro de Carga Internacional",
        "SLA Entrega (99.x%)",
        "Responsabilidad por Pérdida"
    ],
    // Pharma: The 5 regulatory & compliance essentials
    pharma: [
        "Cumplimiento GDP (Good Distribution Practice)",
        "Licencia Sanitaria AEMPS",
        "Ensayos Clínicos Fase I-IV",
        "Certificado GMP (Good Manufacturing Practice)",
        "Temperatura Almacenamiento (2-8°C, 15-25°C)"
    ]
};
