-- ========================================================================================
-- FLOWLOG: PRECISE ACCESS CONTROL (V4)
-- ========================================================================================

-- 1. Function to check if a user can SEE a client in their sidebar.
-- A user can see a client if they are a full member OR a member of any project inside it.
CREATE OR REPLACE FUNCTION public.can_view_client(c_id uuid)
RETURNS boolean AS $$
BEGIN
  IF c_id IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to check if a user is a FULL client member (meaning they are invited to the CLIENT, not just a project)
CREATE OR REPLACE FUNCTION public.is_full_client_member(c_id uuid, check_type text DEFAULT 'member')
RETURNS boolean AS $$
BEGIN
  IF c_id IS NULL THEN RETURN false; END IF;
  IF check_type = 'owner' THEN
    RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
      OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND project_id IS NULL AND user_id = auth.uid() AND role = 'owner');
  ELSE
    -- Check for 'member' (either owner or collaborator, but must be project_id IS NULL)
    RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
      OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND project_id IS NULL AND user_id = auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Replace check_project_access to use is_full_client_member.
-- This ensures a project-only member cannot see all projects in the client.
CREATE OR REPLACE FUNCTION public.check_project_access(p_id uuid)
RETURNS boolean AS $$
DECLARE
  v_client_id uuid;
  v_owner_id uuid;
BEGIN
  IF p_id IS NULL THEN RETURN false; END IF;
  SELECT client_id, user_id INTO v_client_id, v_owner_id FROM public.projects WHERE id = p_id;
  
  -- Owner of the project
  IF v_owner_id = auth.uid() THEN RETURN true; END IF;
  
  -- Full client member
  IF v_client_id IS NOT NULL AND public.is_full_client_member(v_client_id, 'member') THEN RETURN true; END IF;
  
  -- Explicit member of this specific project
  RETURN EXISTS (SELECT 1 FROM public.client_members WHERE project_id = p_id AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========================================================================================
-- UPDATE ALL POLICIES TO USE THE NEW PRECISE FUNCTIONS
-- ========================================================================================

-- Drop old policies that relied on the flawed `check_client_access`
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;
DROP POLICY IF EXISTS "client_members_select" ON public.client_members;
DROP POLICY IF EXISTS "client_members_update" ON public.client_members;
DROP POLICY IF EXISTS "client_members_delete" ON public.client_members;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;
DROP POLICY IF EXISTS "invites_access" ON public.client_invites;
DROP POLICY IF EXISTS "meetings_access" ON public.meetings;

-- Recreate Clients with proper view vs edit
CREATE POLICY "clients_select" ON public.clients FOR SELECT TO anon, authenticated 
USING (public.can_view_client(id) OR EXISTS (SELECT 1 FROM public.client_invites WHERE client_id = public.clients.id AND status = 'pending'));

CREATE POLICY "clients_update" ON public.clients FOR UPDATE TO authenticated 
USING (public.is_full_client_member(id, 'owner'));

CREATE POLICY "clients_delete" ON public.clients FOR DELETE TO authenticated 
USING (public.is_full_client_member(id, 'owner'));

-- Client Members
CREATE POLICY "client_members_select" ON public.client_members FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR public.can_view_client(client_id) OR public.check_project_access(project_id));

CREATE POLICY "client_members_update" ON public.client_members FOR UPDATE TO authenticated 
USING (public.is_full_client_member(client_id, 'owner') OR (project_id IS NOT NULL AND public.check_project_access(project_id)));

CREATE POLICY "client_members_delete" ON public.client_members FOR DELETE TO authenticated 
USING (public.is_full_client_member(client_id, 'owner') OR (project_id IS NOT NULL AND public.check_project_access(project_id)));

-- Projects
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated 
USING (user_id = auth.uid() OR public.check_project_access(id) OR public.is_full_client_member(client_id, 'owner'));

-- Invites & Meetings
CREATE POLICY "invites_access" ON public.client_invites FOR ALL TO authenticated 
USING (invited_by = auth.uid() OR email = (auth.jwt() ->> 'email') OR public.is_full_client_member(client_id, 'owner'));

CREATE POLICY "meetings_access" ON public.meetings FOR ALL TO authenticated 
USING (created_by = auth.uid() OR public.can_view_client(client_id));
