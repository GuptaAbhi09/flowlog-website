-- ---------------------------------------------------------------------------
-- Work OS – Migration 01: Base Schema
-- ---------------------------------------------------------------------------

-- 1) PROFILES: App-level user data linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id), -- Owner/Creator
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) CLIENT MEMBERS (Association table for team collaboration)
CREATE TABLE IF NOT EXISTS public.client_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'collaborator')),
  added_at timestamptz NOT NULL DEFAULT now()
);

-- 4) PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('planned','in_progress','completed','blocked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) DAY LOGS (Start-of-Day/Personal workspace logs)
CREATE TABLE IF NOT EXISTS public.day_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 6) TASKS (The single source of truth for all work items)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  day_log_id uuid NOT NULL REFERENCES public.day_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id),
  project_id uuid REFERENCES public.projects(id),
  priority text CHECK (priority IN ('high','medium','low')),
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES public.profiles(id),
  position integer NOT NULL DEFAULT 0,
  source text NOT NULL CHECK (source IN ('sod','meeting','inbox')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7) MEETINGS
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client_id uuid REFERENCES public.clients(id),
  notes text NOT NULL DEFAULT '',
  meeting_date timestamptz NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8) INBOX ITEMS (Quick captures)
CREATE TABLE IF NOT EXISTS public.inbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9) AUTH TRIGGER: Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();
