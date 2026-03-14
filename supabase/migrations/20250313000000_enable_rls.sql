-- ---------------------------------------------------------------------------
-- Work OS – Phase 6: Row Level Security (RLS)
-- ---------------------------------------------------------------------------
-- Run this in Supabase SQL Editor or via: supabase db push
-- Requires: tables profiles, clients, client_members, projects, day_logs, tasks, meetings, inbox_items
-- ---------------------------------------------------------------------------

-- 1) Add created_by to clients (so creator has access before adding self as member)
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 2) Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- PROFILES: authenticated read all; insert own (for sign up); update own
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- CLIENTS: access if creator (created_by) or member (client_members)
-- ---------------------------------------------------------------------------
CREATE POLICY "clients_select_member_or_creator"
ON public.clients FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
  OR created_by IS NULL  /* legacy rows before RLS */
);

CREATE POLICY "clients_insert_authenticated"
ON public.clients FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "clients_update_member_or_creator"
ON public.clients FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
  OR created_by IS NULL
)
WITH CHECK (true);

CREATE POLICY "clients_delete_creator_only"
ON public.clients FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- CLIENT_MEMBERS: see members of clients you belong to; add if owner; remove self or if owner
-- ---------------------------------------------------------------------------
CREATE POLICY "client_members_select_same_client"
ON public.client_members FOR SELECT TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
  OR client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid())
);

CREATE POLICY "client_members_insert_owner_or_creator"
ON public.client_members FOR INSERT TO authenticated
WITH CHECK (
  (user_id = auth.uid() AND client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()))
  OR (client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid() AND role = 'owner'
  ))
);

CREATE POLICY "client_members_delete_self_or_owner"
ON public.client_members FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- ---------------------------------------------------------------------------
-- PROJECTS: access if client is one you're a member of (or client's creator)
-- ---------------------------------------------------------------------------
CREATE POLICY "projects_select_via_client"
ON public.projects FOR SELECT TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
  OR client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "projects_insert_via_client"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
  OR client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "projects_update_via_client"
ON public.projects FOR UPDATE TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
  OR client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
  OR client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "projects_delete_via_client"
ON public.projects FOR DELETE TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
  OR client_id IN (
    SELECT client_id FROM public.client_members WHERE user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- DAY_LOGS: own rows only
-- ---------------------------------------------------------------------------
CREATE POLICY "day_logs_select_own"
ON public.day_logs FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "day_logs_insert_own"
ON public.day_logs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "day_logs_update_own"
ON public.day_logs FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "day_logs_delete_own"
ON public.day_logs FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- TASKS: own via user_id (task owner)
-- ---------------------------------------------------------------------------
CREATE POLICY "tasks_select_own"
ON public.tasks FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "tasks_insert_own"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update_own"
ON public.tasks FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_delete_own"
ON public.tasks FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- MEETINGS: all authenticated can read; only creator can update/delete
-- ---------------------------------------------------------------------------
CREATE POLICY "meetings_select_authenticated"
ON public.meetings FOR SELECT TO authenticated
USING (true);

CREATE POLICY "meetings_insert_authenticated"
ON public.meetings FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "meetings_update_own"
ON public.meetings FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "meetings_delete_own"
ON public.meetings FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- INBOX_ITEMS: own rows only
-- ---------------------------------------------------------------------------
CREATE POLICY "inbox_items_select_own"
ON public.inbox_items FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "inbox_items_insert_own"
ON public.inbox_items FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "inbox_items_update_own"
ON public.inbox_items FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "inbox_items_delete_own"
ON public.inbox_items FOR DELETE TO authenticated
USING (user_id = auth.uid());
