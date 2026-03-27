-- Fix collaborator removal for project-only members
-- Currently, client_members_write ONLY checks for client ownership.
-- We need to allow project owners to also manage their project members.

DROP POLICY IF EXISTS "client_members_write" ON public.client_members;

CREATE POLICY "client_members_write" ON public.client_members FOR ALL TO authenticated 
USING (
  (client_id IS NOT NULL AND public.is_full_client_member(client_id, 'owner'))
  OR 
  (project_id IS NOT NULL AND public.is_project_owner(project_id))
);

-- Note: is_project_owner and is_full_client_member are already SECURITY DEFINER
-- so they can safely query the tables without recursion.
