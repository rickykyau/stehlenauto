
CREATE TABLE public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own activity"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_activity_log_event_type ON public.user_activity_log(event_type);
CREATE INDEX idx_activity_log_created_at ON public.user_activity_log(created_at DESC);
