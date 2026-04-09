-- 1. Restrict sync_status to admin-only read access
DROP POLICY IF EXISTS "Anyone can read sync_status" ON public.sync_status;

CREATE POLICY "Admins can read sync_status"
  ON public.sync_status
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- 2. Tighten user_activity_log INSERT to require non-null user_id
DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity_log;

CREATE POLICY "Users can insert own activity"
  ON public.user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);