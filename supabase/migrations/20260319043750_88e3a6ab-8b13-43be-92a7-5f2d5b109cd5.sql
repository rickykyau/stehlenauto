
-- Admin role enum
CREATE TYPE public.admin_role AS ENUM ('owner', 'staff');

-- Admin users table
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = _user_id
  )
$$;

-- RLS: admins can read admin_users
CREATE POLICY "Admins can read admin_users" ON public.admin_users
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Discount type enum
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed_amount');

-- Applies to enum
CREATE TYPE public.applies_to_type AS ENUM ('all', 'specific_products', 'specific_collections');

-- Promo codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  minimum_order_amount numeric,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  applies_to applies_to_type NOT NULL DEFAULT 'all',
  product_ids text[] DEFAULT '{}',
  collection_ids text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS for promo_codes: admins full access, anyone can select active codes
CREATE POLICY "Admins can manage promo_codes" ON public.promo_codes
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes
  FOR SELECT TO authenticated
  USING (is_active = true AND starts_at <= now() AND expires_at > now());

-- Promo code usage table
CREATE TABLE public.promo_code_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id text,
  discount_applied numeric NOT NULL DEFAULT 0,
  used_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo_code_usage" ON public.promo_code_usage
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own usage" ON public.promo_code_usage
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Site settings table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Insert default announcement banner setting
INSERT INTO public.site_settings (key, value)
VALUES ('announcement_banner', '{"enabled": false, "text": "", "bg_color": "#D4A017", "text_color": "#000000", "link_url": ""}'::jsonb);

-- Give admins read access to profiles (for dashboard)
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Give admins read access to user_activity_log
CREATE POLICY "Admins can read all activity" ON public.user_activity_log
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
