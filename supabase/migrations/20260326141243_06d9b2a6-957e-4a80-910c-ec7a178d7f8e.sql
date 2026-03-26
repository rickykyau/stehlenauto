
-- Add missing columns to product_variation_members
ALTER TABLE product_variation_members 
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS fitment_scope text NOT NULL DEFAULT 'exact';

-- Add missing columns to product_variation_groups  
ALTER TABLE product_variation_groups
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
