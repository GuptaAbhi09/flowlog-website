-- ========================================================================================
-- FLOWLOG: FIX INVITATION BUG & PRIVATE CLIENTS (V3)
-- ========================================================================================

-- 1. Create a secure RPC that bypasses RLS so a user can see the name of the client they are invited to.
CREATE OR REPLACE FUNCTION public.get_invite_details(p_token text)
RETURNS json AS $$
DECLARE
  v_invite public.client_invites;
  v_client_name text;
  v_project_name text;
BEGIN
  -- Find the pending invite
  SELECT * INTO v_invite FROM public.client_invites 
  WHERE token = p_token AND status = 'pending';
  
  -- If not found, return null
  IF NOT FOUND THEN RETURN NULL; END IF;
  
  -- Fetch names directly (Security Definer bypasses RLS safely)
  IF v_invite.client_id IS NOT NULL THEN
    SELECT name INTO v_client_name FROM public.clients WHERE id = v_invite.client_id;
  END IF;
  
  IF v_invite.project_id IS NOT NULL THEN
    SELECT name INTO v_project_name FROM public.projects WHERE id = v_invite.project_id;
  END IF;
  
  -- Return combined result
  RETURN json_build_object(
    'invite', row_to_json(v_invite),
    'client_name', v_client_name,
    'project_name', v_project_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Drop the overly permissive clients_select policy
DROP POLICY IF EXISTS "clients_select" ON public.clients;

-- 3. Replace it with a STRICT policy that only allows Owners and Active Members to see clients
-- This fixes the bug where clients were visible in the sidebar before accepting the invite.
CREATE POLICY "clients_select" ON public.clients FOR SELECT TO anon, authenticated
USING (
  created_by = auth.uid() 
  OR public.check_client_access(id)
);

-- ========================================================================================
-- FIX FOR "client_members" AND "projects" TO SUPPORT PROJECT-ONLY INVITES
-- ========================================================================================
-- Note: Currently check_client_access returns TRUE if there is ANY client_members row.
-- If someone is invited to a specific PROJECT, they shouldn't see all clients!
-- We need to fix check_client_access to only return TRUE if project_id is NULL!

CREATE OR REPLACE FUNCTION public.check_client_access(c_id uuid, check_type text DEFAULT 'member')
RETURNS boolean AS $$
BEGIN
  IF c_id IS NULL THEN RETURN false; END IF;
  
  IF check_type = 'owner' THEN
    RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND project_id IS NULL AND user_id = auth.uid() AND role = 'owner');
  ELSE
    RETURN EXISTS (SELECT 1 FROM public.clients WHERE id = c_id AND created_by = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.client_members WHERE client_id = c_id AND project_id IS NULL AND user_id = auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
