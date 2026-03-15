-- Hardening RLS for client_members to ensure project owners can ALWAYS see their team
-- Even if client_id is NULL (personal projects)

DROP POLICY IF EXISTS "client_members_select" ON public.client_members;

CREATE POLICY "client_members_select" ON public.client_members FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() 
    OR 
    public.can_view_client(client_id) 
    OR 
    EXISTS (
        SELECT 1 FROM public.projects p 
        WHERE p.id = project_id AND p.user_id = auth.uid()
    )
);

-- Ensure projects are visible to owners even if not in a client
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated 
USING (
    user_id = auth.uid() 
    OR 
    public.can_view_client(client_id) 
    OR 
    id IN (SELECT project_id FROM public.client_members WHERE user_id = auth.uid())
);

-- Fix the delete policy for projects
DROP POLICY IF EXISTS "projects_delete" ON public.projects;
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated 
USING (user_id = auth.uid());

-- Fix the delete policy for clients
DROP POLICY IF EXISTS "clients_delete" ON public.clients;
CREATE POLICY "clients_delete" ON public.clients FOR DELETE TO authenticated 
USING (created_by = auth.uid());
