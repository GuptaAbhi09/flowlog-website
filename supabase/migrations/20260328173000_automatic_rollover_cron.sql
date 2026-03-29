-- ========================================================================================
-- PRODUCTION-READY AUTOMATIC TASK ROLLOVER (IST, SAFE, OPTIMIZED)
-- ========================================================================================

-- 0. Ensure pg_cron extension exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ========================================================================================
-- 1. INDEXES (PERFORMANCE)
-- ========================================================================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_daylog
ON public.tasks(user_id, day_log_id);

CREATE INDEX IF NOT EXISTS idx_daylogs_user_date
ON public.day_logs(user_id, date);

-- ========================================================================================
-- 2. UNIQUE CONSTRAINT (DATA SAFETY)
-- ========================================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_user_date'
    ) THEN
        ALTER TABLE public.day_logs
        ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);
    END IF;
END $$;

-- ========================================================================================
-- 3. MAIN FUNCTION (SET-BASED, NO LOOP, IST SAFE)
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.automatic_task_rollover()
RETURNS void AS $$
DECLARE
    v_today_date date := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
    -- Security safety
    SET search_path = public;

    -- STEP 1: Ensure today's day_logs exist for all users who have pending tasks
    INSERT INTO public.day_logs (user_id, date)
    SELECT DISTINCT t.user_id, v_today_date
    FROM public.tasks t
    JOIN public.day_logs dl ON t.day_log_id = dl.id
    WHERE t.is_completed = false 
      AND dl.date < v_today_date
    ON CONFLICT (user_id, date) DO NOTHING;

    -- STEP 2: Move all pending tasks (SET-BASED, NO SUBQUERY)
    UPDATE public.tasks t
    SET day_log_id = dl_today.id,
        source = 'sod'
    FROM public.day_logs dl_today,
         public.day_logs dl_old
    WHERE t.day_log_id = dl_old.id
      AND t.user_id = dl_today.user_id
      AND dl_today.date = v_today_date
      AND dl_old.date < v_today_date
      AND t.is_completed = false
      AND t.day_log_id != dl_today.id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================================
-- 4. SAFE CRON SETUP (NO CRASH IF EXISTS)
-- ========================================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM cron.job WHERE jobname = 'daily-task-rollover'
    ) THEN
        PERFORM cron.unschedule('daily-task-rollover');
    END IF;
END $$;

-- ========================================================================================
-- 5. SCHEDULE CRON (IST MIDNIGHT)
-- ========================================================================================

-- 00:00 IST = 18:30 UTC
SELECT cron.schedule(
    'daily-task-rollover',
    '30 18 * * *',
    'SELECT public.automatic_task_rollover()'
);

-- ========================================================================================
-- DONE ✅
-- ========================================================================================
