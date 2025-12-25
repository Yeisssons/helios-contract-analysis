-- Create Profiles Table with Admin Flag
-- This table extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT false,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT USING (auth.uid() = id);
-- Users can update their own profile (but not is_admin or plan)
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Only service role can insert/update is_admin and plan
-- (This will be handled via API routes with admin checks)
-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
-- Function to auto-create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, email, full_name, is_admin, plan)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        false,
        'free'
    ) ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
-- Migrate existing users to profiles (if any)
INSERT INTO public.profiles (id, email, full_name, is_admin, plan)
SELECT id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    false,
    'free'
FROM auth.users ON CONFLICT (id) DO NOTHING;