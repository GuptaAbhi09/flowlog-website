-- ---------------------------------------------------------------------------
-- Work OS – Migration 03: Refined RLS Policies
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invites ENABLE ROW LEVEL SECURITY;

-- 1) PROFILES
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- 2) CLIENTS
CREATE POLICY "clients_select_member_or_creator" ON public.clients FOR SELECT TO authenticated
USING (created_by = auth.uid() OR id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid()));

CREATE POLICY "clients_insert_authenticated" ON public.clients FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "clients_update_only_owner" ON public.clients FOR UPDATE TO authenticated
USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "clients_delete_only_owner" ON public.clients FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- 3) CLIENT_MEMBERS
CREATE POLICY "client_members_select_same_client" ON public.client_members FOR SELECT TO authenticated
USING (client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid()) OR client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));

CREATE POLICY "client_members_insert_owner_or_creator" ON public.client_members FOR INSERT TO authenticated
WITH CHECK (
  (user_id = auth.uid() AND client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()))
  OR (client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid() AND role = 'owner'))
);

CREATE POLICY "client_members_delete_self_or_owner" ON public.client_members FOR DELETE TO authenticated
USING (user_id = auth.uid() OR client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid() AND role = 'owner'));

-- 4) PROJECTS (Visibility for members, Management for Owners)
CREATE POLICY "projects_select_via_client" ON public.projects FOR SELECT TO authenticated
USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()) OR client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid()));

CREATE POLICY "projects_insert_only_owner" ON public.projects FOR INSERT TO authenticated
WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));

CREATE POLICY "projects_update_only_owner" ON public.projects FOR UPDATE TO authenticated
USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()))
WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));

CREATE POLICY "projects_delete_only_owner" ON public.projects FOR DELETE TO authenticated
USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));

-- 5) TASKS (Personal + Shared Client views)
CREATE POLICY "tasks_select_all_members" ON public.tasks FOR SELECT TO authenticated
USING (user_id = auth.uid() OR client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid()));

CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update_all_members" ON public.tasks FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid()))
WITH CHECK (user_id = auth.uid() OR client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid()));

CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 6) MEETINGS
CREATE POLICY "meetings_select_via_client" ON public.meetings FOR SELECT TO authenticated
USING (created_by = auth.uid() OR client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid()));

CREATE POLICY "meetings_insert_authenticated" ON public.meetings FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "meetings_update_own" ON public.meetings FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "meetings_delete_own" ON public.meetings FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 7) DAY_LOGS & INBOX (Strict Personal)
CREATE POLICY "day_logs_personal" ON public.day_logs FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "inbox_items_personal" ON public.inbox_items FOR ALL TO authenticated USING (user_id = auth.uid());

-- 8) CLIENT INVITES (Owner Management)
CREATE POLICY "invites_management_owner" ON public.client_invites FOR ALL TO authenticated
USING (client_id IN (SELECT client_id FROM public.client_members WHERE user_id = auth.uid() AND role = 'owner') OR client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
