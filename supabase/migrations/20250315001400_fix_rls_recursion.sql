-- Breaking the circular dependency by using SECURITY DEFINER functions
-- These functions bypass RLS on the tables they query.

CREATE OR REPLACE FUNCTION public.is_project_owner(p_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects WHERE id = p_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_project_member(p_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Checks if user is a member of the project OR the parent client
  RETURN EXISTS (
    SELECT 1 FROM public.client_members 
    WHERE (project_id = p_id OR client_id = (SELECT client_id FROM public.projects WHERE id = p_id)) 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-implement projects_select using functions
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() 
    OR 
    public.can_view_client(client_id) 
    OR 
    public.is_project_member(id)
);

-- Re-implement client_members_select using functions
DROP POLICY IF EXISTS "client_members_select" ON public.client_members;
CREATE POLICY "client_members_select" ON public.client_members FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() 
    OR 
    public.can_view_client(client_id) 
    OR 
    public.is_project_owner(project_id)
);
