CREATE TABLE public.sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'idle',
  progress integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sync_status" ON public.sync_status FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can read sync_status" ON public.sync_status FOR SELECT TO public USING (true);

INSERT INTO public.sync_status (sync_type, status) VALUES ('products', 'idle'), ('orders', 'idle');