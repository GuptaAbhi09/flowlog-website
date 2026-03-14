-- ---------------------------------------------------------------------------
-- Work OS – Migration 02: Collaboration System
-- ---------------------------------------------------------------------------

-- 1) CLIENT INVITES: Managing team invitations
CREATE TABLE IF NOT EXISTS public.client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Extra columns/indexes if needed for scaling
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_token ON public.client_invites(token);
