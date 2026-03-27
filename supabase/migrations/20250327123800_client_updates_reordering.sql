-- Add position column to client_updates for drag-and-drop reordering
ALTER TABLE public.client_updates ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

-- Update existing rows to have distinct positions if needed (usually fine)
-- If many rows have the same position, order by created_at then
WITH ordered AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 as new_pos
  FROM public.client_updates
)
UPDATE public.client_updates cu
SET position = ordered.new_pos
FROM ordered
WHERE cu.id = ordered.id;
