-- Fix INSERT policies that were dropped or ignored because sqleditor.sql was skipped.

-- DROP any existing faulty INSERT policies
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "client_members_insert" ON public.client_members;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;

-- RECREATE WITH CHECK (true) since SELECT policies protect visibility.
CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "client_members_insert" ON public.client_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);

-- Ensure tasks default policy has an INSERT as well (tasks_all handles it if FOR ALL, but let's be explicit if needed)
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
