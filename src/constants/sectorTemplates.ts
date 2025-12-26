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
// Ordenados alfabéticamente
const FINANCIAL_POINTS = [
    "Auditorías Permitidas",
    "Calificación Crediticia Requerida",
    "Cesión de Contrato",
    "Comisiones y Cargos",
    "Confidencialidad",
    "Covenant Financieros",
    "Cross-Default Provisions",
    "Cumplimiento AML/KYC",
    "Derecho de Setoff",
    "Destino de los Fondos",
    "Divulgaciones Obligatorias",
    "Entidad Prestamista",
    "Eventos de Default",
    "Fecha de Vencimiento",
    "Frecuencia de Pago",
    "Garantías/Colateral",
    "Indemnización",
    "Jurisdicción Regulatoria",
    "Ley Aplicable",
    "Material Adverse Change",
    "Método de Cálculo Interés",
    "Penalizaciones por Mora",
    "Plazo de Amortización",
    "Prepago Permitido",
    "Principal del Préstamo",
    "Reporting Financiero",
    "Representations & Warranties",
    "Resolución de Disputas",
    "Seguro Requerido",
    "Subordinación de Deuda",
    "Tasa de Interés"
];

// ==================== TECHNOLOGY / SaaS ====================
// Ordenados alfabéticamente
const TECHNOLOGY_POINTS = [
    "Actualizaciones y Upgrades",
    "Ambiente de Desarrollo/Test",
    "Auditorías de Seguridad",
    "Backup y Recuperación",
    "Certificaciones de Seguridad",
    "Código Fuente Escrow",
    "Compliance Regulatorio",
    "Documentación Técnica",
    "Escalabilidad",
    "Fecha de Entrega",
    "Horario de Soporte",
    "Integración con Terceros",
    "Límites de Almacenamiento",
    "Límites de API",
    "Límites de Usuarios",
    "Nivel de Servicio (SLA)",
    "Notificación de Brechas",
    "Penalizaciones SLA",
    "Personalización Permitida",
    "Plan de Migración",
    "Portabilidad de Datos",
    "Precio del Proyecto",
    "Propiedad Intelectual",
    "Protección de Datos (GDPR)",
    "Restricciones Geográficas",
    "Retención de Datos",
    "Seguridad de Datos",
    "Soporte Técnico Incluido",
    "Tipo de Licencia",
    "Training Incluido",
    "Uptime Garantizado",
    "Versión del Software"
];

// ==================== CONSTRUCTION / INFRASTRUCTURE ====================
// Ordenados alfabéticamente
const CONSTRUCTION_POINTS = [
    "Acta de Recepción",
    "Acta de Replanteo",
    "Arbitraje de Construcción",
    "Bonificaciones por Adelanto",
    "Certificaciones de Calidad",
    "Certificaciones de Seguridad",
    "Certificaciones Mensuales",
    "Certificados de Materiales",
    "Control de Materiales",
    "Coordinación de Seguridad",
    "Fecha de Inicio Obras",
    "Fianza de Anticipo",
    "Fianza de Cumplimiento",
    "Fuerza Mayor",
    "Hitos de Pago",
    "Homologación Subcontratistas",
    "Libro de Órdenes",
    "Límite de Subcontratación",
    "Modificados Permitidos",
    "Penalizaciones por Retraso",
    "Plan de Calidad",
    "Plazo de Ejecución",
    "Plazo de Garantía",
    "Presupuesto Total Obra",
    "Prevención de Riesgos",
    "Resolución por Incumplimiento",
    "Retención de Garantía",
    "Seguro de Responsabilidad Civil",
    "Seguro Todo Riesgo Obra",
    "Vicios Ocultos"
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
// Ordenados alfabéticamente
const HEALTHCARE_POINTS = [
    "Acceso a Historias Clínicas",
    "Acreditación Hospitalaria",
    "Auditorías de Calidad",
    "Autorización Previa Requerida",
    "Comité de Ética",
    "Consentimiento Informado",
    "Copagos y Deducibles",
    "Credenciales Médicas",
    "Cumplimiento HIPAA",
    "Emergencias Cubiertas",
    "Equipamiento Médico Incluido",
    "Facturación a Aseguradoras",
    "Formulario de Medicamentos",
    "Investigación Clínica",
    "Licencias Profesionales",
    "Límites de Cobertura",
    "Mantenimiento de Equipos",
    "Prescripción de Medicamentos",
    "Privacidad del Paciente",
    "Protocolos de Seguridad",
    "Red de Proveedores",
    "Reporte de Eventos Adversos",
    "Segundas Opiniones",
    "Seguro de Malpractice",
    "Servicios Cubiertos",
    "Servicios Excluidos",
    "Tarifas Médicas",
    "Telemedicina Permitida",
    "Valor del Contrato"
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
// Ordenados alfabéticamente
const INMOBILIARIO_POINTS = [
    "Aval Bancario",
    "Cédula Habitabilidad",
    "Certificado Energético",
    "Cesión de Contrato",
    "Cláusula Desistimiento",
    "Cláusula Diplomática",
    "Derecho Tanteo/Retracto",
    "Dirección de Notificaciones",
    "Dirección del Inmueble",
    "Duración del Contrato",
    "Fianza/Depósito",
    "Forma de Pago",
    "Gastos de Comunidad",
    "Jurisdicción/Fuero",
    "Licencia Actividad",
    "Mascotas Permitidas",
    "Opción de Compra",
    "Pago IBI",
    "Periodo de Carencia",
    "Periodo Preaviso",
    "Política de Obras",
    "Prohibición Subarriendo",
    "Referencia Catastral",
    "Renta Mensual",
    "Reparaciones Mayores",
    "Reparaciones Menores",
    "Revisión IPC",
    "Seguro Obligatorio",
    "Solidaridad Arrendatarios",
    "Uso Permitido"
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
// Ordenados alfabéticamente
const SECTOR_PUBLICO_POINTS = [
    "Acta de Recepción",
    "Baja Temeraria",
    "Causas de Resolución",
    "Certificaciones Mensuales",
    "Cesión de Contrato",
    "Clasificación CPV",
    "Compromiso UTE",
    "Confidencialidad",
    "Criterios de Adjudicación",
    "Cumplimiento RGPD",
    "División por Lotes",
    "Fecha Publicación BOE",
    "Garantía Definitiva",
    "Garantía Provisional",
    "Identidad Adjudicatario",
    "Intereses de Demora",
    "Límite Subcontratación",
    "Mesa de Contratación",
    "Modificados del Contrato",
    "Obligación Factura Electrónica",
    "Órgano de Contratación",
    "Penalidades por Retraso",
    "Plazo de Ejecución",
    "Plazo de Garantía",
    "Presupuesto Base Licitación",
    "Prórrogas Permitidas",
    "Revisión de Precios",
    "Solvencia Económica",
    "Solvencia Técnica",
    "Valor Estimado Contrato"
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
// Ordenados alfabéticamente
const LABORAL_POINTS = [
    "Beneficios Sociales",
    "Categoría Profesional",
    "Cláusula de Privacidad",
    "Cláusula No Competencia",
    "Código de Conducta",
    "Confidencialidad",
    "Convenio Colectivo",
    "Distribución Irregular Jornada",
    "Duración Determinada",
    "Exclusividad",
    "Fecha Antigüedad",
    "Fecha de Incorporación",
    "Horario de Trabajo",
    "Horas Extraordinarias",
    "Indemnización Despido",
    "Lugar de Trabajo",
    "Movilidad Geográfica",
    "Pacto de Permanencia",
    "Periodo de Prueba",
    "Preaviso Baja Voluntaria",
    "Prevención Riesgos",
    "Propiedad Intelectual",
    "Protección de Datos",
    "Reconocimiento Médico",
    "Salario Bruto Anual",
    "Salario Variable/Bonus",
    "Teletrabajo",
    "Tipo de Contrato",
    "Tipo de Jornada",
    "Uso Dispositivos Empresa",
    "Vacaciones Anuales"
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
// Ordenados alfabéticamente
const LEGAL_CORPORATIVO_POINTS = [
    "Cambio de Control",
    "Cesión de Contrato",
    "Cláusula de Terminación",
    "Confidencialidad",
    "Derechos de Auditoría",
    "Exclusividad",
    "Fecha de Renovación",
    "Fecha de Vigencia",
    "Fuerza Mayor",
    "Garantías",
    "Idioma del Contrato",
    "Impuestos",
    "Indemnización",
    "Jurisdicción",
    "Ley Aplicable",
    "Límite de Responsabilidad",
    "Modificación del Contrato",
    "Moneda",
    "Nivel de Servicio (SLA)",
    "No Competencia",
    "Partes Involucradas",
    "Penalizaciones",
    "Periodo de Aviso",
    "Propiedad Intelectual",
    "Protección de Datos (GDPR)",
    "Resolución de Disputas",
    "Seguros Requeridos",
    "Soporte y Mantenimiento",
    "Subcontratación",
    "Términos de Pago"
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
// Ordenados alfabéticamente
const INSURANCE_POINTS = [
    "Actos Terroristas",
    "Agregado de Deducibles",
    "Ámbito Territorial Internacional",
    "Catástrofes Naturales Cubiertas",
    "Ciberriesgo y Protección Datos",
    "Coaseguro Porcentaje",
    "Cobertura de Mercancías en Tránsito",
    "Cobertura Todo Riesgo",
    "Costes de Defensa Jurídica",
    "Cumplimiento Normativo",
    "Deducible por Siniestro",
    "Exclusiones Específicas",
    "Flota de Vehículos Corporativos",
    "Franquicia Corporativa",
    "Gestión de Crisis",
    "Límite Agregado Anual",
    "Lucro Cesante / Business Interruption",
    "Período de Retroactividad",
    "Periodo de Notificación Extendido",
    "Peritación Independiente",
    "Plazo de Declaración Siniestro",
    "Póliza D&O (Directors & Officers)",
    "Prima Neta vs Prima Bruta",
    "Reaseguro Aplicable",
    "Rehabilitación de Imagen",
    "Renovación Automática",
    "Responsabilidad Civil General",
    "Sublímites por Garantía",
    "Subrogación de Derechos",
    "Valoración a Nuevo vs Depreciado"
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
// Ordenados alfabéticamente
const UTILITIES_POINTS = [
    "Ancho de Banda Simétrico",
    "Backup de Línea (Redundancia)",
    "Cambio Comercializadora Permitido",
    "Caudal Garantizado Mbps",
    "Certificados Origen Renovable (GDO)",
    "Consumo Mínimo Facturado",
    "Factura Electrónica B2B",
    "Garantía de Suministro",
    "IP Fija / Rangos IP Asignados",
    "Latencia Garantizada",
    "Mantenimiento 24x7 Nivel 2/3",
    "Maxímetro Mensual",
    "Monitorización en Tiempo Real",
    "MPLS / Cloud Privado",
    "Penalización Energía Reactiva",
    "Penalización por Corte Servicio",
    "Potencia Contratada P1",
    "Potencia Contratada P2",
    "Potencia Contratada P3",
    "Potencia Contratada P4-P6",
    "Precio Energía Indexado vs Fijo",
    "QoS (Quality of Service)",
    "SLA Disponibilidad (%)",
    "Tarifa de Acceso (6.1TD, 6.2TD, 6.3TD, 6.4TD)",
    "Término Fijo Potencia",
    "Término Variable Energía",
    "Tiempo Máximo Resolución Incidencias",
    "Troncales SIP Empresariales",
    "Vencimiento y Preaviso",
    "VPN Empresarial"
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
// Ordenados alfabéticamente
const LOGISTICS_POINTS = [
    "Almacenamiento Temporal Aduanas",
    "Aranceles e Impuestos Import",
    "Cadena de Frío (2-8°C)",
    "Certificación ISO 9001 Logística",
    "Certificados Fitosanitarios",
    "Consolidación LCL vs FCL",
    "Contrato Marco Logístico",
    "Costes Demoras Portuarias",
    "Cross-Docking vs Warehousing",
    "Despacho Aduanero Incluido",
    "Documentación EUR1/ATR",
    "Embalaje y Paletización",
    "Facturación por Peso/Volumen",
    "Flota Propia vs Subcontratada",
    "Gestión de Devoluciones (RMA)",
    "Gestión de Inventarios (JIT)",
    "Gestión Documental DUA/T1",
    "Incoterms Aplicables (EXW, FOB, CIF, DDP)",
    "Lead Time Comprometido",
    "Penalizaciones Retraso",
    "Responsabilidad por Pérdida",
    "Seguro de Carga Internacional",
    "SLA Entrega (99.x%)",
    "Slots Garantizados Naviera",
    "Tracking en Tiempo Real",
    "Transporte Aéreo Urgente",
    "Transporte Internacional Marítimo",
    "Transporte Terrestre Cross-Border",
    "Trazabilidad Lote/Serie",
    "Última Milla B2B"
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
// Ordenados alfabéticamente
const PHARMA_POINTS = [
    "Acuerdo de Confidencialidad (CDA)",
    "Auditorías Regulatorias",
    "Cadena de Custodia Controlados",
    "Certificado GMP (Good Manufacturing Practice)",
    "Certificado Principio Activo (API)",
    "Comité Ético Investigación",
    "Consentimiento Informado Pacientes",
    "Costes de Desarrollo Compartidos",
    "Cumplimiento FDA/EMA",
    "Cumplimiento GDP (Good Distribution Practice)",
    "Destrucción Controlada Productos",
    "Devolución Stock Caducado",
    "Ensayos Clínicos Fase I-IV",
    "Estabilidad del Producto",
    "Exclusividad Territorial",
    "Farmacovigilancia y Reporte RAM",
    "Fecha de Caducidad",
    "Licencia de Fabricación",
    "Licencia Sanitaria AEMPS",
    "Milestone Payments",
    "Notificación Defectos Calidad",
    "Patente Farmacéutica Vigente",
    "Propiedad Intelectual Formulación",
    "Protección Datos Salud (RGPD)",
    "Protocolo de Estudio Aprobado",
    "Registro Sanitario Producto",
    "Royalties sobre Ventas",
    "Supply Agreement APIs",
    "Temperatura Almacenamiento (2-8°C, 15-25°C)",
    "Trazabilidad Lote Farmacéutico"
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
        "Categoría Profesional",
        "Periodo de Prueba",
        "Tipo de Jornada"
    ],
    // Legal: The 5 corporate contract essentials
    legal: [
        "Fecha de Vigencia",
        "Cláusula de Terminación",
        "Términos de Pago",
        "Límite de Responsabilidad",
        "Jurisdicción"
    ],
    // Insurance: The 5 corporate coverage must-checks
    insurance: [
        "Póliza D&O (Directors & Officers)",
        "Responsabilidad Civil General",
        "Lucro Cesante / Business Interruption",
        "Límite Agregado Anual",
        "Prima Neta vs Prima Bruta"
    ],
    // Utilities: The 5 enterprise service essentials
    utilities: [
        "SLA Disponibilidad (%)",
        "Tarifa de Acceso (6.1TD, 6.2TD, 6.3TD, 6.4TD)",
        "Potencia Contratada P1",
        "Penalización Energía Reactiva",
        "Vencimiento y Preaviso"
    ],
    // Logistics: The 5 supply chain fundamentals
    logistics: [
        "Incoterms Aplicables (EXW, FOB, CIF, DDP)",
        "Lead Time Comprometido",
        "Seguro de Carga Internacional",
        "SLA Entrega (99.x%)",
        "Responsabilidad por Pérdida"
    ],
    // Pharma: The 5 regulatory compliance essentials
    pharma: [
        "Cumplimiento GDP (Good Distribution Practice)",
        "Licencia Sanitaria AEMPS",
        "Ensayos Clínicos Fase I-IV",
        "Certificado GMP (Good Manufacturing Practice)",
        "Temperatura Almacenamiento (2-8°C, 15-25°C)"
    ]
};
