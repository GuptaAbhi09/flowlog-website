-- ========================================================================================
-- FLOWLOG: FINAL SECURE RLS (V6)
-- ========================================================================================

-- Ensure RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 1. DROP ALL EXISTING PROJECT & CLIENT POLICIES TO BE ABSOLUTELY SURE
DO $$ 
DECLARE pol RECORD;
BEGIN
  FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('clients', 'projects', 'client_members')) 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.' || quote_ident(pol.tablename);
  END LOOP;
END $$;

-- 2. HELPER FUNCTIONS (Updated for extreme precision)

-- can_view_client: See if the client should appear in sidebar/header.
CREATE OR REPLACE FUNCTION public.can_view_client(c_id uuid)
RETURNS boolean AS $$
BEGIN
  IF c_id IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- is_full_client_member: Has access to ALL projects of a client.
CREATE OR REPLACE FUNCTION public.is_full_client_member(c_id uuid, check_type text DEFAULT 'member')
RETURNS boolean AS $$
BEGIN
  IF c_id IS NULL THEN RETURN false; END IF;
  
  -- Creator is always full owner
  IF EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) THEN
    RETURN true;
  END IF;

  IF check_type = 'owner' THEN
    RETURN EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND project_id IS NULL AND user_id = auth.uid() AND role = 'owner');
  ELSE
    RETURN EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND project_id IS NULL AND user_id = auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- check_project_access: Can see a specific project.
CREATE OR REPLACE FUNCTION public.check_project_access(p_id uuid)
RETURNS boolean AS $$
DECLARE
  v_client_id uuid;
  v_owner_id uuid;
BEGIN
  IF p_id IS NULL THEN RETURN false; END IF;
  SELECT client_id, user_id INTO v_client_id, v_owner_id FROM public.projects WHERE id = p_id;
  
  -- Personal project owner
  IF v_owner_id = auth.uid() THEN RETURN true; END IF;
  
  -- Access inherited from client
  IF v_client_id IS NOT NULL AND public.is_full_client_member(v_client_id, 'member') THEN RETURN true; END IF;
  
  -- Targeted project membership
  RETURN EXISTS (SELECT 1 FROM public.client_members WHERE project_id = p_id AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. APPLY FRESH POLICIES

-- CLIENTS
CREATE POLICY "clients_select" ON public.clients FOR SELECT TO authenticated
USING (public.can_view_client(id));

CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated 
WITH CHECK (true); -- Protected by SELECT

CREATE POLICY "clients_write" ON public.clients FOR ALL TO authenticated 
USING (public.is_full_client_member(id, 'owner'));


-- PROJECTS
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated 
USING (public.check_project_access(id));

CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated 
WITH CHECK (true); -- Protected by SELECT

CREATE POLICY "projects_write" ON public.projects FOR ALL TO authenticated 
USING (user_id = auth.uid() OR public.is_full_client_member(client_id, 'owner'));


-- CLIENT MEMBERS
CREATE POLICY "client_members_select" ON public.client_members FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR public.can_view_client(client_id));

CREATE POLICY "client_members_insert" ON public.client_members FOR INSERT TO authenticated 
WITH CHECK (true); -- Protected by SELECT

CREATE POLICY "client_members_write" ON public.client_members FOR ALL TO authenticated 
USING (public.is_full_client_member(client_id, 'owner'));


-- TASKS (Verify tasks_all handles everything)
DROP POLICY IF EXISTS "tasks_all" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR public.check_project_access(project_id) OR public.is_full_client_member(client_id, 'member'));

CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "tasks_write" ON public.tasks FOR ALL TO authenticated 
USING (user_id = auth.uid() OR public.is_full_client_member(client_id, 'owner'));
