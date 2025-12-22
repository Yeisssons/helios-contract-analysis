-- =====================================================
-- HELIOS TEAM MANAGEMENT MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 6. TEAMS TABLE (Team Management System)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Mi Equipo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team owners can view their team
CREATE POLICY "Team owners can view own team"
ON public.teams FOR SELECT
USING (auth.uid() = owner_id);

-- Team owners can update their team
CREATE POLICY "Team owners can update own team"
ON public.teams FOR UPDATE
USING (auth.uid() = owner_id);

-- Team owners can delete their team
CREATE POLICY "Team owners can delete own team"
ON public.teams FOR DELETE
USING (auth.uid() = owner_id);

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);

-- =====================================================
-- 7. TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'director', 'observer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(team_id, email)
);

-- RLS for Team Members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team owners can manage members
CREATE POLICY "Team owners can view members"
ON public.team_members FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
    OR user_id = auth.uid()
);

CREATE POLICY "Team owners can insert members"
ON public.team_members FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()));

CREATE POLICY "Team owners can update members"
ON public.team_members FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()));

CREATE POLICY "Team owners can delete members"
ON public.team_members FOR DELETE
USING (EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);

-- =====================================================
-- 8. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks in their team or assigned to them
CREATE POLICY "Users can view team tasks"
ON public.tasks FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.team_members WHERE id = assigned_to AND user_id = auth.uid())
    OR created_by = auth.uid()
);

-- Team owners can create tasks
CREATE POLICY "Team owners can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()));

-- Task creators or team owners can update
CREATE POLICY "Task creators can update tasks"
ON public.tasks FOR UPDATE
USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
);

-- Task creators or team owners can delete
CREATE POLICY "Task creators can delete tasks"
ON public.tasks FOR DELETE
USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON public.tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_contract_id ON public.tasks(contract_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- =====================================================
-- 9. FUNCTION: Auto-link user to pending team invites
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_team_link()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.team_members
    SET user_id = NEW.id, status = 'active', joined_at = NOW()
    WHERE email = NEW.email AND status = 'pending' AND user_id IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created_team_link ON auth.users;
CREATE TRIGGER on_auth_user_created_team_link
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_team_link();
