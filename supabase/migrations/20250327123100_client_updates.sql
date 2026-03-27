-- ========================================================================================
-- FEATURE: CLIENT UPDATES (Notes for individual client progress)
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.client_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  last_update text NOT NULL DEFAULT '',
  next_steps text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_updates_all" ON public.client_updates 
FOR ALL TO authenticated 
USING (user_id = auth.uid());
