
-- Homepage content table for hero slides, featured products, categories
CREATE TABLE public.homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read active content
CREATE POLICY "Anyone can read active homepage content" ON public.homepage_content
  FOR SELECT USING (true);

-- Admins can manage homepage content
CREATE POLICY "Admins can manage homepage content" ON public.homepage_content
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Seed default hero slide
INSERT INTO public.homepage_content (section, content, is_active, display_order)
VALUES ('hero', '{
  "headline": "BUILT TOUGH.\nBOLT ON.\nDRIVE OFF.",
  "subheadline": "Heavy-duty truck & SUV accessories engineered from cold-rolled steel. No drilling required. Guaranteed fitment for your vehicle.",
  "eyebrow": "STEHLEN AUTO — SINCE 2015",
  "primary_button_text": "SHOP ALL PARTS",
  "primary_button_link": "/collections/all",
  "secondary_button_text": "BEST SELLERS",
  "secondary_button_link": "/collections/bull-bars",
  "background_image": ""
}'::jsonb, true, 0);

-- Seed default featured products config
INSERT INTO public.homepage_content (section, content, is_active, display_order)
VALUES ('featured', '{
  "handles": [
    "2020-2023-tesla-model-y-rear-bumper-guard-black",
    "2022-2025-toyota-tundra-5-5-bed-tonneau-cover-led-light-kit",
    "2005-2015-nissan-xterra-class-3-trailer-hitch-ball-mount-kit",
    "2005-2009-ford-mustang-gt-honeycomb-mesh-front-grille-black",
    "2014-2021-toyota-tundra-projector-headlights-sequential-led-chrome",
    "2022-2026-toyota-tundra-5-5ft-bed-rubber-mat-lightweight-v2",
    "rubber-truck-bed-mat-for-dakota-raider-6-5-bed-grey",
    "2022-toyota-tundra-double-cab-rock-sliders-side-steps-texture-black",
    "2014-2021-toyota-tundra-crew-cab-low-profile-roof-basket-system",
    "stehlen-razor-1000-universal-chase-rack-w-led-lights-matte-black",
    "2023-chevy-colorado-5ft-bed-molle-panels-3pc-set",
    "2014-2019-silverado-sierra-rear-underseat-storage-organizer-box"
  ]
}'::jsonb, true, 0);

-- Seed default categories config
INSERT INTO public.homepage_content (section, content, is_active, display_order)
VALUES ('categories', '{
  "categories": [
    {"handle":"bull-guards-grille-guards","title":"Bull Guards & Grille Guards","visible":true,"order":0},
    {"handle":"tonneau-covers","title":"Tonneau Covers","visible":true,"order":1},
    {"handle":"trailer-hitches","title":"Trailer Hitches","visible":true,"order":2},
    {"handle":"front-grilles","title":"Front Grilles","visible":true,"order":3},
    {"handle":"headlights","title":"Headlights","visible":true,"order":4},
    {"handle":"truck-bed-mats","title":"Truck Bed Mats","visible":true,"order":5},
    {"handle":"floor-mats","title":"Floor Mats","visible":true,"order":6},
    {"handle":"running-boards-side-steps","title":"Running Boards & Side Steps","visible":true,"order":7},
    {"handle":"roof-racks-baskets","title":"Roof Racks & Baskets","visible":true,"order":8},
    {"handle":"chase-racks-sport-bars","title":"Chase Racks & Sport Bars","visible":true,"order":9},
    {"handle":"molle-panels","title":"MOLLE Panels","visible":true,"order":10},
    {"handle":"under-seat-storage","title":"Under Seat Storage","visible":true,"order":11}
  ]
}'::jsonb, true, 0);

-- Drop the old redundant profiles SELECT policy (the new one from Phase 1 already covers both admin + self)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
