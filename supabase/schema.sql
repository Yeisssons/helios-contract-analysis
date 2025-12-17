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
-- 4. Audit Logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,         -- e.g., 'UPLOAD', 'VIEW', 'DELETE', 'EXPORT'
    resource TEXT NOT NULL,       -- e.g., 'contract', 'user_profile'
    resource_id TEXT,             -- ID of the affected resource
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own logs
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert (handled via admin client in API routes)
-- or authenticated users if we want client-side logging (rare)
-- For now, let's allow inserts if user matches, but typically we want server-side control.
-- Actually, strict audit usually requires server-only write to prevent tampering.
-- We will insert via supabaseAdmin (service role) so no insert policy needed for 'public' role.

-- 5. User Subscriptions Table (for plan limits)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Plan Info
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    
    -- Usage Tracking
    documents_this_month INTEGER DEFAULT 0,
    usage_reset_date DATE DEFAULT (date_trunc('month', CURRENT_DATE) + interval '1 month')::date,
    
    -- Subscription Details (for future Stripe integration)
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for User Subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own subscription (for usage tracking)
CREATE POLICY "Users can update own subscription"
ON public.user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- Function to auto-create subscription row for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_subscriptions (user_id, plan, documents_this_month)
    VALUES (NEW.id, 'free', 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create subscription on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

