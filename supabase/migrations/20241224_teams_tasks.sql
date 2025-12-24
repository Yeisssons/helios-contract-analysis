-- Migration: Create Team Management Tables
-- Description: Sets up teams, team_members, and tasks for CRM and collaboration features.

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Mi Equipo',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their owned team" ON public.teams
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their team" ON public.teams
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can create a team" ON public.teams
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 2. Create Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- The user who 'owns' or created this member entry
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'member', -- owner, admin, member
    status TEXT DEFAULT 'active', -- active, invited, inactive
    avatar TEXT DEFAULT '👤',
    joined_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of teams they are in or own" ON public.team_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    );

CREATE POLICY "Users can manage members of their owned teams" ON public.team_members
    FOR ALL USING (
        team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()) OR
        user_id = auth.uid()
    );

-- 3. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks of their team" ON public.tasks
    FOR SELECT USING (
        created_by = auth.uid() OR
        team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()) OR
        assigned_to IN (SELECT id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can manage their tasks" ON public.tasks
    FOR ALL USING (
        created_by = auth.uid() OR
        team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    );

-- Add helper indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team ON public.tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
