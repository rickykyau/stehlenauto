
-- Orders table (cache from Shopify)
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id text UNIQUE NOT NULL,
  user_id uuid,
  order_number text NOT NULL,
  email text,
  customer_name text,
  total_price numeric NOT NULL DEFAULT 0,
  subtotal_price numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  promo_code_used text,
  financial_status text NOT NULL DEFAULT 'pending',
  fulfillment_status text NOT NULL DEFAULT 'unfulfilled',
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  shipping_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Products cache table
CREATE TABLE public.products_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id text UNIQUE NOT NULL,
  title text NOT NULL,
  vendor text,
  product_type text,
  status text NOT NULL DEFAULT 'active',
  tags text[],
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  fitment_vehicles jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_synced_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage products_cache" ON public.products_cache
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can read products_cache" ON public.products_cache
  FOR SELECT TO public USING (true);

-- Inventory alerts table
CREATE TABLE public.inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products_cache(id) ON DELETE CASCADE NOT NULL,
  variant_id text NOT NULL,
  variant_title text,
  current_quantity integer NOT NULL DEFAULT 0,
  threshold integer NOT NULL DEFAULT 10,
  alert_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory_alerts" ON public.inventory_alerts
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Admin audit log table
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage audit_log" ON public.admin_audit_log
  FOR ALL TO authenticated USING (is_admin(auth.uid()));
