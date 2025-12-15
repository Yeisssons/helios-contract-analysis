/**
 * Core contract data interface
 * All fields extracted from AI analysis or user input
 */
export interface ContractData {
    id: string;
    fileName: string;
    filePath?: string;  // Path in Supabase Storage
    contractType: string;
    effectiveDate: string; // YYYY-MM-DD
    renewalDate: string;   // YYYY-MM-DD
    noticePeriodDays: number;
    terminationClauseReference: string;
    createdAt: string;
    // Extended AI analysis fields
    summary?: string;
    parties?: string[];
    riskScore?: number;
    alerts?: string[];
    abusiveClauses?: (AbusiveClause | string)[];
    // Custom AI extraction
    customQuery?: string;
    customAnswer?: string;
    // Dynamic data points
    extractedData?: Record<string, string>;
    requestedDataPoints?: string[];  // Data audit tracking
    dataSources?: Record<string, string>;  // Maps data point key → verbatim PDF quote
    sector?: string;  // Sector used for extraction
    // Management features
    tags?: string[];           // Professional classification tags
    userNotes?: string;        // Optional user notes
    lastModified?: string;     // Track updates (ISO string)
}

/**
 * Abusive clause detected by AI
 */
export interface AbusiveClause {
    reference?: string;
    explanation?: string;
    severity?: 'low' | 'medium' | 'high';
}

/**
 * API Error response structure
 */
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

/**
 * Supabase database contract record (raw from DB)
 */
export interface ContractRecord {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    sector?: string;
    contract_type?: string;
    effective_date?: string;
    renewal_date?: string;
    notice_period_days?: number;
    termination_clause_reference?: string;
    risk_score?: number;
    risk_level?: string;
    alerts?: string[];
    abusive_clauses?: (string | AbusiveClause)[];
    extracted_data?: Record<string, string>;
    data_sources?: Record<string, string>;
    tags?: string[];
    created_at: string;
    updated_at?: string;
    last_modified?: string;
}

export interface ProcessContractRequest {
    file: File;
}

export interface ProcessContractResponse {
    success: boolean;
    data?: ContractData;
    error?: string;
}

export interface ContractsListResponse {
    success: boolean;
    data?: ContractData[];
    error?: string;
}

export type SortField = keyof Pick<ContractData,
    'fileName' | 'contractType' | 'effectiveDate' | 'renewalDate' | 'noticePeriodDays' | 'terminationClauseReference'
>;

export type SortDirection = 'asc' | 'desc';

/**
 * Calendar/Event document type
 */
export interface CalendarDocument {
    id: string;
    title: string;
    effectiveDate: string;
    renewalDate: string;
    noticePeriodDays: number;
    sector?: string;
    riskScore?: number;
}

