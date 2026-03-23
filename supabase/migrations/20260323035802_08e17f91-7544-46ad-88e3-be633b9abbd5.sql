ALTER TABLE public.products_cache 
ADD COLUMN IF NOT EXISTS fitment_subattributes jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fitment_notes text DEFAULT NULL;