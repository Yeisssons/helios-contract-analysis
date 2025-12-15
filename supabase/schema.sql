-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Storage: {userId}/contracts/{fileName}
    
    -- Metadata extracted by AI
    sector TEXT,
    contract_type TEXT,
    effective_date TIMESTAMP WITH TIME ZONE,
    renewal_date TIMESTAMP WITH TIME ZONE,
    notice_period_days INTEGER,
    termination_clause_reference TEXT,
    
    -- Risk Analysis
    risk_score NUMERIC DEFAULT 0,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    alerts JSONB DEFAULT '[]'::jsonb,         -- Array of strings or objects
    abusive_clauses JSONB DEFAULT '[]'::jsonb, -- Array of strings or objects
    
    -- Extended Data
    extracted_data JSONB DEFAULT '{}'::jsonb,  -- Key-value pairs
    data_sources JSONB DEFAULT '{}'::jsonb,    -- Where data was found
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Row Level Security (RLS)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own contracts
CREATE POLICY "Users can view own contracts" 
ON public.contracts FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own contracts
CREATE POLICY "Users can insert own contracts" 
ON public.contracts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own contracts
CREATE POLICY "Users can update own contracts" 
ON public.contracts FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own contracts
CREATE POLICY "Users can delete own contracts" 
ON public.contracts FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Storage Policies (Apply in Supabase Storage UI or SQL Editor)
-- Bucket: 'documents'

-- Policy: Authenticated users can upload files
-- (Checking folder name matches user ID requires complex policy function or trigger, 
--  simplified here to 'user must be authenticated')
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Policy: Users can view their own files (owner column usually matches user_id)
-- CREATE POLICY "Users can view own files"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'documents' AND owner = auth.uid());
