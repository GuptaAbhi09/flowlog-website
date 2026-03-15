-- ========================================================================================
-- FLOWLOG: COMPLETE SCHEMA & SECURE RLS (FINAL V1)
-- ========================================================================================
-- Run this entire file in your Supabase SQL Editor. 
-- It is safe to re-run. It ensures all tables, columns, defaults, and policies are perfectly aligned.

-- ========================================================================================
-- 1. TABLES & SCHEMA SETUP (Safe / IF NOT EXISTS)
-- ========================================================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Ensure the column exists and has the correct default for older records
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.clients ALTER COLUMN created_by SET DEFAULT auth.uid();

-- CLIENT MEMBERS
CREATE TABLE IF NOT EXISTS public.client_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id uuid, -- Reference added later via alter
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'collaborator')),
  added_at timestamptz NOT NULL DEFAULT now()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) DEFAULT auth.uid(),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('planned','in_progress','completed','blocked')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_members ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.projects ALTER COLUMN user_id SET DEFAULT auth.uid();

-- DAY LOGS
CREATE TABLE IF NOT EXISTS public.day_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE public.day_logs ALTER COLUMN user_id SET DEFAULT auth.uid();

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  day_log_id uuid NOT NULL REFERENCES public.day_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id),
  project_id uuid REFERENCES public.projects(id),
  priority text CHECK (priority IN ('high','medium','low')),
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id),
  position integer NOT NULL DEFAULT 0,
  source text NOT NULL CHECK (source IN ('sod','meeting','inbox')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES auth.users(id);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.tasks ALTER COLUMN user_id SET DEFAULT auth.uid();

-- MEETINGS
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client_id uuid REFERENCES public.clients(id),
  notes text NOT NULL DEFAULT '',
  meeting_date timestamptz NOT NULL,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ALTER COLUMN created_by SET DEFAULT auth.uid();

-- INBOX ITEMS
CREATE TABLE IF NOT EXISTS public.inbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inbox_items ALTER COLUMN user_id SET DEFAULT auth.uid();

-- CLIENT INVITES
CREATE TABLE IF NOT EXISTS public.client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_invites ALTER COLUMN invited_by SET DEFAULT auth.uid();


-- ========================================================================================
-- 2. AUTH TRIGGER (Automatically create profile when user signs up)
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ========================================================================================
-- 3. ENABLE RLS (Row Level Security) ON ALL TABLES
-- ========================================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invites ENABLE ROW LEVEL SECURITY;


-- ========================================================================================
-- 4. HELPER FUNCTIONS (Bypass RLS securely to break infinite recursion)
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.check_client_access(c_id uuid, check_type text DEFAULT 'member')
RETURNS boolean AS $$
BEGIN
  IF c_id IS NULL THEN RETURN false; END IF;
  
  IF check_type = 'owner' THEN
    RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND user_id = auth.uid() AND role = 'owner');
  ELSE
    RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND user_id = auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_project_access(p_id uuid)
RETURNS boolean AS $$
DECLARE
  v_client_id uuid;
  v_owner_id uuid;
BEGIN
  IF p_id IS NULL THEN RETURN false; END IF;
  SELECT client_id, user_id INTO v_client_id, v_owner_id FROM public.projects WHERE id = p_id;
  IF v_owner_id = auth.uid() THEN RETURN true; END IF;
  IF v_client_id IS NOT NULL AND public.check_client_access(v_client_id, 'member') THEN RETURN true; END IF;
  RETURN EXISTS (SELECT 1 FROM public.client_members WHERE project_id = p_id AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========================================================================================
-- 5. CLEANUP OLD POLICIES (Safety Drop)
-- ========================================================================================
DO $$ 
DECLARE pol RECORD;
BEGIN
  FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.' || quote_ident(pol.tablename);
  END LOOP;
END $$;


-- ========================================================================================
-- 6. FRESH SOLID & TESTED POLICIES
-- ========================================================================================

-- PROFILES
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- CLIENTS
CREATE POLICY "clients_select" ON public.clients FOR SELECT TO anon, authenticated 
USING (created_by = auth.uid() OR public.check_client_access(id) OR EXISTS (SELECT 1 FROM public.client_invites WHERE client_id = public.clients.id AND status = 'pending'));

CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid()); -- Works now because created_by has a DEFAULT of auth.uid()

CREATE POLICY "clients_update" ON public.clients FOR UPDATE TO authenticated 
USING (public.check_client_access(id, 'owner'));

CREATE POLICY "clients_delete" ON public.clients FOR DELETE TO authenticated 
USING (public.check_client_access(id, 'owner'));

-- CLIENT_MEMBERS
CREATE POLICY "client_members_select" ON public.client_members FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR public.check_client_access(client_id) OR public.check_project_access(project_id));

CREATE POLICY "client_members_insert" ON public.client_members FOR INSERT TO authenticated 
WITH CHECK (
  public.check_client_access(client_id, 'owner') 
  OR public.check_project_access(project_id) 
  OR EXISTS (
    SELECT 1 FROM public.client_invites 
    WHERE (client_id = public.client_members.client_id OR project_id = public.client_members.project_id) 
    AND email = (auth.jwt() ->> 'email') 
    AND status = 'pending'
  )
);

CREATE POLICY "client_members_update" ON public.client_members FOR UPDATE TO authenticated 
USING (public.check_client_access(client_id, 'owner') OR (project_id IS NOT NULL AND public.check_project_access(project_id)));

CREATE POLICY "client_members_delete" ON public.client_members FOR DELETE TO authenticated 
USING (public.check_client_access(client_id, 'owner') OR (project_id IS NOT NULL AND public.check_project_access(project_id)));

-- PROJECTS
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated 
USING (public.check_project_access(id));

CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid() OR public.check_client_access(client_id, 'owner'));

CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated 
USING (public.check_project_access(id));

CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated 
USING (public.check_project_access(id) OR public.check_client_access(client_id, 'owner'));

-- TASKS
CREATE POLICY "tasks_all" ON public.tasks FOR ALL TO authenticated 
USING (user_id = auth.uid() OR public.check_project_access(project_id)) 
WITH CHECK (user_id = auth.uid());

-- INVITES
CREATE POLICY "invites_read_anon" ON public.client_invites FOR SELECT TO anon 
USING (status = 'pending');

CREATE POLICY "invites_access" ON public.client_invites FOR ALL TO authenticated 
USING (invited_by = auth.uid() OR email = (auth.jwt() ->> 'email') OR public.check_client_access(client_id, 'owner'));

-- PERSONAL DATA (Day Logs, Inbox, Meetings)
CREATE POLICY "day_logs_all" ON public.day_logs FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "inbox_items_all" ON public.inbox_items FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "meetings_access" ON public.meetings FOR ALL TO authenticated USING (created_by = auth.uid() OR public.check_client_access(client_id));

-- ========================================================================================
-- 7. DATA FIX (Link unowned projects to client creators)
-- ========================================================================================
UPDATE public.projects p SET user_id = c.created_by FROM public.clients c WHERE p.client_id = c.id AND p.user_id IS NULL AND c.created_by IS NOT NULL;
