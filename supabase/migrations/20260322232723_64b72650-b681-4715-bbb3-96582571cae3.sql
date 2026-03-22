CREATE TABLE public.ymm_config (
  id integer PRIMARY KEY DEFAULT 1,
  makes jsonb NOT NULL DEFAULT '[]'::jsonb,
  models jsonb NOT NULL DEFAULT '{}'::jsonb,
  years jsonb NOT NULL DEFAULT '[]'::jsonb,
  make_collection_map jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ymm_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ymm_config" ON public.ymm_config FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage ymm_config" ON public.ymm_config FOR ALL TO authenticated USING (is_admin(auth.uid()));