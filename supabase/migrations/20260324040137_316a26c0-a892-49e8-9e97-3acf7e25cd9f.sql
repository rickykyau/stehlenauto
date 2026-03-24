
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency_code text NOT NULL DEFAULT 'USD';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS synced_at timestamptz NOT NULL DEFAULT now();

CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
