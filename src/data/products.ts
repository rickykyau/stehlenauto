/**
 * SHOPIFY DATA MAPPING:
 * Products: Shopify Admin → Products
 * Collections: Shopify Admin → Collections
 * 
 * In Liquid:
 * - {{ product.title }}, {{ product.price | money }}, {{ product.images }}, etc.
 * - {{ collection.title }}, {{ collection.products }}, etc.
 * 
 * All descriptions, features, and specs are scraped from the live Stehlen Auto Shopify store.
 */

export interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  compareAt?: number;
  category: string;
  make: string;
  model: string[];
  yearRange: string;
  image: string;
  images: string[];
  specs: Record<string, string>;
  description: string;
  features: string[];
  fitment: string[];
  inStock: boolean;
  sku: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  count: number;
  image: string;
}

const CDN = "https://stehlenauto.myshopify.com/cdn/shop/files";

export const collections: Collection[] = [
  { id: "bull-guards", slug: "bull-guards-grille-guards", title: "Bull Guards & Grille Guards", description: "Protect your truck with premium bull guards and grille guards. Our selection includes heavy-duty designs built to withstand impacts while enhancing your vehicle's aggressive look. All products include guaranteed fitment and lifetime warranty.", count: 358, image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800` },
  { id: "grilles", slug: "front-grilles", title: "Front Grilles", description: "Upgrade your truck's front end with aggressive mesh, honeycomb, and rivet-style grilles. Direct OEM replacement with no modifications needed.", count: 160, image: `${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800` },
  { id: "tonneau", slug: "tonneau-covers", title: "Tonneau Covers", description: "Secure and protect your truck bed with our premium tonneau covers. Choose from hard tri-fold, soft roll-up, and low-profile designs. Weather-resistant construction keeps your cargo safe while improving fuel efficiency.", count: 287, image: `${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800` },
  { id: "chase-rack", slug: "chase-rack-sport-bar", title: "Chase Rack / Sport Bar", description: "Heavy gauge steel chase racks with LED light mounts. Universal fitment for full-size trucks.", count: 3, image: `${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773329881&width=800` },
  { id: "trailer-hitches", slug: "trailer-hitches", title: "Trailer Hitches", description: "Class 1-5 trailer hitches and wiring kits for cars, trucks, and SUVs. Guaranteed fitment and easy bolt-on installation.", count: 310, image: `${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800` },
  { id: "ford-parts", slug: "ford-parts", title: "Ford Parts", description: "Premium accessories for Ford trucks including F-150, F-250, F-350, Bronco, and Ranger. All products feature guaranteed fitment with easy installation.", count: 245, image: `${CDN}/LISTING_uss-f15015cc-bk-t-g.jpg?v=1773347272&width=800` },
  { id: "chevy-parts", slug: "chevy-parts", title: "Chevy Parts", description: "Shop accessories for Chevrolet trucks including Silverado, Colorado, and Avalanche. Guaranteed fitment and lifetime warranty on all Stehlen Auto products.", count: 172, image: `${CDN}/LISTING_tc-lth-ws-2_1c0fa165-1448-4b8a-86d1-707455db8956.jpg?v=1773341758&width=800` },
  { id: "dodge-parts", slug: "dodge-parts", title: "Dodge / Ram Parts", description: "Accessories for Dodge Ram 1500, 2500, 3500 trucks. Grilles, tonneau covers, bull guards, and more.", count: 180, image: `${CDN}/LISTING_fg-ram94-me-mb-ws-1.jpg?v=1773332038&width=800` },
];

export const products: Product[] = [
  // ═══════════════════════════════════════════
  // FRONT GRILLES
  // ═══════════════════════════════════════════
  {
    id: "fg-1", slug: "2005-2009-ford-mustang-gt-honeycomb-mesh-front-grille-black",
    title: "2005-2009 Ford Mustang GT Honeycomb Mesh Front Grille - Black", price: 32.82,
    category: "grilles", make: "Ford", model: ["Mustang GT"], yearRange: "2005-2009",
    image: `${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800`,
    images: [`${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-1.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-2.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-3.jpg?v=1773332154&width=800`],
    specs: { MPN: "GRZH-MST-0509-GT-BK", Color: "Black", Style: "Honeycomb Mesh", "Fog Light Cutouts": "No", Logo: "No", Condition: "New", "Part Number": "FG-ZH-MUS05GT-ME-BK" },
    description: "Upgrade the front end of your 2005-2009 Ford Mustang GT with this sleek honeycomb mesh front grille in a bold black finish. Designed as a direct replacement for the factory grille, this aftermarket upgrade delivers an aggressive, custom look that transforms your Mustang's appearance without the need for costly modifications.",
    features: [
      "Aggressive Honeycomb Mesh Design — Bold mesh pattern adds a custom, high-performance appearance to your Mustang GT",
      "Sleek Black Finish — Matte black styling complements any exterior color and enhances the front-end aesthetic",
      "Direct OEM Replacement — Designed to fit in place of the factory grille for a seamless, bolt-on installation",
      "Durable Construction — Built with high-quality materials to withstand daily driving and harsh weather conditions",
      "Clean Logo-Free Design — Smooth, unbranded appearance for a minimalist custom look",
      "No Fog Light Cutouts — Streamlined design without fog light openings for a flush, uniform appearance"
    ],
    fitment: [
      "2005-2009 Ford Mustang GT Base Convertible 2-Door",
      "2005-2009 Ford Mustang GT Base Coupe 2-Door",
      "2005-2009 Ford Mustang GT Convertible 2-Door",
      "2005-2009 Ford Mustang GT Coupe 2-Door"
    ],
    inStock: true, sku: "FG-ZH-MUS05GT-ME-BK"
  },
  {
    id: "fg-2", slug: "2022-2024-toyota-tundra-led-front-grille-lex-style-glossy-black",
    title: "2022-2024 Toyota Tundra LED Front Grille Lex Style - Glossy Black", price: 140.28,
    category: "grilles", make: "Toyota", model: ["Tundra"], yearRange: "2022-2024",
    image: `${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`,
    images: [`${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`, `${CDN}/fg-mesh-style-st-6_26f4ac9a-bee2-4fcb-8832-6d4c11709b14.jpg?v=1773332137&width=800`, `${CDN}/fg-tun22-bllb-bk-ks-st-1.jpg?v=1773332138&width=800`],
    specs: { Material: "ABS Composite", Finish: "Glossy Black", LEDs: "Integrated Amber", Style: "Lex Style", Installation: "Direct Replacement" },
    description: "Transform your 2022-2024 Toyota Tundra with this premium Lex-style front grille featuring integrated LED amber accent lights. The glossy black finish delivers a bold, luxury-inspired aesthetic that sets your Tundra apart from the crowd. Engineered as a direct replacement for the factory grille, this upgrade requires no cutting, drilling, or modification.",
    features: [
      "Premium Lex-Style Design — Luxury-inspired grille pattern elevates your Tundra's front-end presence",
      "Integrated LED Amber Lights — Built-in LED accent lights add visibility and aggressive styling",
      "High-Gloss Black Finish — Mirror-like black coating for a sleek, modern appearance",
      "Direct OEM Replacement — Fits in place of your factory grille with no modifications required",
      "Durable ABS Construction — Weather-resistant and UV-stable material for lasting good looks",
      "Complete Hardware Included — Everything needed for a straightforward bolt-on installation"
    ],
    fitment: [
      "2022-2024 Toyota Tundra SR", "2022-2024 Toyota Tundra SR5",
      "2022-2024 Toyota Tundra Limited", "2022-2024 Toyota Tundra Platinum",
      "2022-2024 Toyota Tundra 1794 Edition"
    ],
    inStock: true, sku: "FG-TUN22-BLLB-BK-KS"
  },
  {
    id: "fg-3", slug: "2022-2024-toyota-tundra-lex-style-abs-front-grille-glossy-black",
    title: "2022-2024 Toyota Tundra Lex Style ABS Front Grille - Glossy Black", price: 84.64,
    category: "grilles", make: "Toyota", model: ["Tundra"], yearRange: "2022-2024",
    image: `${CDN}/LISTING_fg-tun22-bl-bk-ks-ws-1.jpg?v=1773332126&width=800`,
    images: [`${CDN}/LISTING_fg-tun22-bl-bk-ks-ws-1.jpg?v=1773332126&width=800`, `${CDN}/fg-mesh-style-st-6.jpg?v=1773332126&width=800`],
    specs: { Material: "ABS Composite", Finish: "Glossy Black", Style: "Lex Style", Installation: "Direct Replacement" },
    description: "Give your 2022-2024 Toyota Tundra a luxury-inspired look with this Lex-style ABS front grille in a glossy black finish. This non-LED version delivers the same premium styling as its LED counterpart at a more accessible price point. The direct replacement design ensures a perfect factory fit with no cutting or drilling required.",
    features: [
      "Luxury Lex-Style Design — Premium grille pattern for a high-end front-end appearance",
      "High-Gloss Black Finish — Deep, reflective black coating complements any Tundra color",
      "Lightweight ABS Composite — Durable and weather-resistant construction",
      "No-Modification Installation — Bolts directly to factory mounting points",
      "UV-Resistant Material — Maintains color and finish even under harsh sun exposure"
    ],
    fitment: [
      "2022-2024 Toyota Tundra (All Trims)"
    ],
    inStock: true, sku: "FG-TUN22-BL-BK-KS"
  },
  {
    id: "fg-4", slug: "2004-2007-volkswagen-touareg-front-grille-black-torg-0206-bk",
    title: "2004-2007 Volkswagen Touareg Front Grille Black - TORG-0206-BK", price: 21.92,
    category: "grilles", make: "Volkswagen", model: ["Touareg"], yearRange: "2004-2007",
    image: `${CDN}/LISTING_fg-tor03-h-bk-ws-1.jpg?v=1773332101&width=800`,
    images: [`${CDN}/LISTING_fg-tor03-h-bk-ws-1.jpg?v=1773332101&width=800`, `${CDN}/fg-tor03-h-bk-1.jpg?v=1773332101&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Installation: "Direct Replacement", MPN: "TORG-0206-BK" },
    description: "Restore or upgrade the front end of your 2004-2007 Volkswagen Touareg with this direct replacement front grille in a clean black finish. Engineered to match factory specifications, this grille snaps into place using the original mounting points for a hassle-free installation.",
    features: [
      "Direct OEM Replacement — Matches factory dimensions and mounting for a perfect fit",
      "Black Finish — Clean, understated styling that complements the Touareg's design",
      "Durable ABS Construction — Resistant to impacts, UV fading, and extreme temperatures",
      "Easy Snap-In Installation — Uses existing clips and mounting points",
      "Quality Tested — Verified fitment for 2004-2007 model years"
    ],
    fitment: [
      "2004-2007 Volkswagen Touareg (All Trims)"
    ],
    inStock: true, sku: "TORG-0206-BK"
  },
  {
    id: "fg-5", slug: "2005-2011-toyota-tacoma-studded-mesh-rivet-style-front-grille-matte-black",
    title: "2005-2011 Toyota Tacoma Studded Mesh Rivet Style Front Grille - Matte Black", price: 42.87,
    category: "grilles", make: "Toyota", model: ["Tacoma"], yearRange: "2005-2011",
    image: `${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`,
    images: [`${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`, `${CDN}/fg-taco05-rvt-me-mb-1.jpg?v=1773332090&width=800`, `${CDN}/fg-taco05-rvt-me-mb-2.jpg?v=1773332090&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Studded Mesh Rivet", Installation: "Direct Replacement" },
    description: "Add rugged, off-road-inspired style to your 2005-2011 Toyota Tacoma with this studded mesh rivet-style front grille. The matte black finish and exposed rivet detailing give your Tacoma an aggressive, custom appearance that stands out on the trail or on the street. Designed as a direct OEM replacement for easy installation.",
    features: [
      "Studded Rivet Design — Exposed hardware accents deliver a rugged, tactical appearance",
      "Aggressive Mesh Pattern — Open-weave mesh adds airflow and an off-road-ready look",
      "Matte Black Finish — Low-sheen coating for a tough, understated aesthetic",
      "Direct OEM Replacement — Drops into factory location with no modifications needed",
      "Premium ABS Material — Lightweight, impact-resistant, and UV-stable construction"
    ],
    fitment: [
      "2005-2011 Toyota Tacoma (All Cab Configurations)"
    ],
    inStock: true, sku: "FG-TACO05-RVT-ME-MB"
  },
  {
    id: "fg-6", slug: "1999-2006-chevy-silverado-tahoe-suburban-front-grille-matte-black",
    title: "1999-2006 Chevy Silverado Tahoe Suburban Front Grille Matte Black", price: 32.11,
    category: "grilles", make: "Chevy", model: ["Silverado", "Tahoe", "Suburban"], yearRange: "1999-2006",
    image: `${CDN}/LISTING_fg-sil99-h-mb-ws-1.jpg?v=1773332075&width=800`,
    images: [`${CDN}/LISTING_fg-sil99-h-mb-ws-1.jpg?v=1773332075&width=800`, `${CDN}/fg-sil99-h-mb-1.jpg?v=1773332075&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Horizontal Bar", Installation: "Direct Replacement" },
    description: "Replace your worn or damaged factory grille with this matte black horizontal bar-style front grille for the 1999-2006 Chevy Silverado, Tahoe, and Suburban. This direct OEM replacement uses the same mounting points as the factory unit, making installation straightforward with basic hand tools.",
    features: [
      "Classic Horizontal Bar Design — Timeless styling that enhances your truck's front-end presence",
      "Matte Black Finish — Rugged, low-sheen coating that hides road grime and scratches",
      "Multi-Vehicle Fitment — Designed for Silverado, Tahoe, and Suburban models",
      "Direct OEM Replacement — Uses factory mounting points for a perfect, gap-free fit",
      "Durable ABS Construction — Built to withstand the elements year after year"
    ],
    fitment: [
      "1999-2002 Chevrolet Silverado 1500", "2003-2006 Chevrolet Silverado 1500 (Old Body)",
      "1999-2006 Chevrolet Tahoe", "1999-2006 Chevrolet Suburban"
    ],
    inStock: true, sku: "FG-SIL99-H-MB"
  },
  {
    id: "fg-7", slug: "99-06-chevy-silverado-tahoe-suburban-black-horizontal-grille",
    title: "99-06 Chevy Silverado Tahoe Suburban Black Horizontal Grille", price: 33.90,
    category: "grilles", make: "Chevy", model: ["Silverado", "Tahoe", "Suburban"], yearRange: "1999-2006",
    image: `${CDN}/LISTING_fg-sil99-h-bk-ws-1.jpg?v=1773332063&width=800`,
    images: [`${CDN}/LISTING_fg-sil99-h-bk-ws-1.jpg?v=1773332063&width=800`, `${CDN}/fg-sil99-h-bk-1.jpg?v=1773332063&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Style: "Horizontal Bar", Installation: "Direct Replacement" },
    description: "Upgrade the front end of your 1999-2006 Chevy Silverado, Tahoe, or Suburban with this glossy black horizontal bar-style front grille. The deeper black finish offers a more polished, refined look compared to the matte version, while still delivering the same reliable factory-fit installation.",
    features: [
      "Horizontal Bar Design — Clean, classic styling for a refined front-end upgrade",
      "Glossy Black Finish — Deep, polished coating for a premium appearance",
      "Direct Factory Replacement — Matches OEM mounting points exactly",
      "Fits Multiple GM Models — Compatible with Silverado, Tahoe, and Suburban",
      "Impact-Resistant ABS — Engineered to handle daily driving conditions"
    ],
    fitment: [
      "1999-2002 Chevrolet Silverado 1500", "1999-2006 Chevrolet Tahoe",
      "1999-2006 Chevrolet Suburban"
    ],
    inStock: true, sku: "FG-SIL99-H-BK"
  },
  {
    id: "fg-8", slug: "2007-2010-chrysler-sebring-bentley-style-chrome-mesh-grille-abs",
    title: "2007-2010 Chrysler Sebring Bentley Style Chrome Mesh Grille - ABS", price: 42.33,
    category: "grilles", make: "Chrysler", model: ["Sebring"], yearRange: "2007-2010",
    image: `${CDN}/LISTING_fg-seb08-me-ch-ws-1.jpg?v=1773332048&width=800`,
    images: [`${CDN}/LISTING_fg-seb08-me-ch-ws-1.jpg?v=1773332048&width=800`, `${CDN}/fg-seb08-me-ch-1.jpg?v=1773332048&width=800`],
    specs: { Material: "ABS Composite", Finish: "Chrome", Style: "Bentley Mesh", Installation: "Direct Replacement" },
    description: "Give your 2007-2010 Chrysler Sebring a luxury-inspired look with this Bentley-style chrome mesh front grille. The intricate mesh pattern and chrome finish create an upscale appearance that transforms the entire front end of your vehicle. Built from durable ABS composite for long-lasting performance.",
    features: [
      "Bentley-Inspired Mesh Design — Luxury styling that elevates your Sebring's appearance",
      "Chrome Finish — Bright, mirror-like coating for a high-end, showroom look",
      "Direct OEM Replacement — Bolts to factory mounting points with no modifications",
      "Premium ABS Construction — Lightweight, durable, and corrosion-resistant",
      "Complete Assembly — Includes all necessary hardware for installation"
    ],
    fitment: [
      "2007-2010 Chrysler Sebring (All Trims)"
    ],
    inStock: true, sku: "FG-SEB08-ME-CH"
  },
  {
    id: "fg-9", slug: "1994-2002-dodge-ram-1500-2500-3500-mesh-front-grille-matte-black",
    title: "1994-2002 Dodge Ram 1500 2500 3500 Mesh Front Grille Matte Black", price: 31.47,
    category: "grilles", make: "Dodge", model: ["Ram 1500", "Ram 2500", "Ram 3500"], yearRange: "1994-2002",
    image: `${CDN}/LISTING_fg-ram94-me-mb-ws-1.jpg?v=1773332038&width=800`,
    images: [`${CDN}/LISTING_fg-ram94-me-mb-ws-1.jpg?v=1773332038&width=800`, `${CDN}/fg-ram94-me-mb-1.jpg?v=1773332038&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Mesh", Installation: "Direct Replacement" },
    description: "Upgrade your 1994-2002 Dodge Ram with this aggressive mesh-style front grille in a durable matte black finish. The open-weave mesh pattern replaces the factory grille for a bold, custom appearance that adds character to your Ram's front end. Designed for all Ram 1500, 2500, and 3500 models.",
    features: [
      "Aggressive Mesh Pattern — Open-weave design for improved airflow and bold styling",
      "Matte Black Finish — Tough, low-sheen coating that complements any truck color",
      "Universal Ram Fitment — Fits 1500, 2500, and 3500 models from 1994-2002",
      "Direct Factory Replacement — No cutting, drilling, or modifications needed",
      "Weather-Resistant ABS — Built to handle rain, snow, sun, and road debris"
    ],
    fitment: [
      "1994-2002 Dodge Ram 1500", "1994-2002 Dodge Ram 2500",
      "1994-2002 Dodge Ram 3500"
    ],
    inStock: true, sku: "FG-RAM94-ME-MB"
  },
  {
    id: "fg-10", slug: "1994-2002-dodge-ram-1500-2500-3500-mesh-front-grille-black",
    title: "1994-2002 Dodge Ram 1500 2500 3500 Mesh Front Grille - Black", price: 33.56,
    category: "grilles", make: "Dodge", model: ["Ram 1500", "Ram 2500", "Ram 3500"], yearRange: "1994-2002",
    image: `${CDN}/LISTING_fg-ram94-me-bk-ws-1.jpg?v=1773332021&width=800`,
    images: [`${CDN}/LISTING_fg-ram94-me-bk-ws-1.jpg?v=1773332021&width=800`, `${CDN}/fg-ram94-me-bk-1.jpg?v=1773332021&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Style: "Mesh", Installation: "Direct Replacement" },
    description: "Replace your factory grille with this glossy black mesh-style front grille for the 1994-2002 Dodge Ram. The slightly more polished finish gives your Ram a refined yet aggressive look. Compatible with Ram 1500, 2500, and 3500 trucks.",
    features: [
      "Open Mesh Design — Allows maximum airflow while adding custom styling",
      "Glossy Black Finish — Deeper, richer black for a more polished appearance",
      "Tri-Model Compatibility — Fits Ram 1500, 2500, and 3500",
      "Bolt-On Installation — Uses factory hardware and mounting points",
      "Durable ABS Material — UV-resistant and built for all-weather use"
    ],
    fitment: [
      "1994-2002 Dodge Ram 1500", "1994-2002 Dodge Ram 2500", "1994-2002 Dodge Ram 3500"
    ],
    inStock: true, sku: "FG-RAM94-ME-BK"
  },
  {
    id: "fg-11", slug: "1994-2002-dodge-ram-1500-2500-3500-horizontal-front-grille-matte-black",
    title: "1994-2002 Dodge Ram 1500 2500 3500 Horizontal Front Grille Matte Black", price: 33.05,
    category: "grilles", make: "Dodge", model: ["Ram 1500", "Ram 2500", "Ram 3500"], yearRange: "1994-2002",
    image: `${CDN}/LISTING_fg-ram94-h-mb-ws-1.jpg?v=1773332011&width=800`,
    images: [`${CDN}/LISTING_fg-ram94-h-mb-ws-1.jpg?v=1773332011&width=800`, `${CDN}/fg-ram94-h-mb-1.jpg?v=1773332011&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Horizontal Bar", Installation: "Direct Replacement" },
    description: "Classic horizontal bar-style front grille in matte black for the 1994-2002 Dodge Ram. This grille features clean, horizontal lines that give your Ram a traditional yet updated appearance. Perfect as a replacement for a damaged or faded factory grille.",
    features: [
      "Horizontal Bar Style — Clean, classic design with parallel bar detailing",
      "Matte Black Finish — Durable, low-gloss coating for a rugged look",
      "Full Ram Compatibility — Fits 1500, 2500, and 3500 truck models",
      "Factory-Spec Mounting — Aligns with OEM clip and screw locations",
      "All-Weather Durability — Resists cracking, fading, and warping"
    ],
    fitment: [
      "1994-2002 Dodge Ram 1500", "1994-2002 Dodge Ram 2500", "1994-2002 Dodge Ram 3500"
    ],
    inStock: true, sku: "FG-RAM94-H-MB"
  },
  {
    id: "fg-12", slug: "2013-2024-ram-1500-oem-mesh-style-front-grille-black",
    title: "2013-2024 Ram 1500 OEM Mesh Style Front Grille - Black", price: 62.58,
    category: "grilles", make: "Dodge", model: ["Ram 1500"], yearRange: "2013-2024",
    image: `${CDN}/LISTING_fg-ram14oe-me-bk-ws-1.jpg?v=1773331978&width=800`,
    images: [`${CDN}/LISTING_fg-ram14oe-me-bk-ws-1.jpg?v=1773331978&width=800`, `${CDN}/fg-ram14oe-me-bk-1.jpg?v=1773331978&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Style: "OEM Mesh", Installation: "Direct Replacement", "Compatible Trims": "Tradesman, Express, Big Horn" },
    description: "Restore the factory look of your 2013-2024 Ram 1500 with this OEM-style mesh front grille in black. Designed to replicate the original equipment grille, this replacement delivers a clean, understated appearance while using the exact factory mounting system for a seamless fit.",
    features: [
      "OEM-Style Mesh Pattern — Replicates the factory grille design exactly",
      "Black Finish — Clean appearance that matches factory styling",
      "Wide Year Compatibility — Fits 2013 through 2024 Ram 1500 models",
      "Exact Factory Fit — Uses original mounting clips and hardware locations",
      "Premium ABS Material — Same quality construction as OEM parts"
    ],
    fitment: [
      "2013-2024 Ram 1500 Tradesman", "2013-2024 Ram 1500 Express",
      "2013-2024 Ram 1500 Big Horn"
    ],
    inStock: false, sku: "FG-RAM14OE-ME-BK"
  },
  {
    id: "fg-13", slug: "2013-2022-ram-1500-honeycomb-rebel-style-front-grille-matte-black",
    title: "2013-2022 Ram 1500 Honeycomb Rebel Style Front Grille - Matte Black", price: 88.75,
    category: "grilles", make: "Dodge", model: ["Ram 1500"], yearRange: "2013-2022",
    image: `${CDN}/LISTING_fg-ram131500-rb-mb-ws-1.jpg?v=1773331962&width=800`,
    images: [`${CDN}/LISTING_fg-ram131500-rb-mb-ws-1.jpg?v=1773331962&width=800`, `${CDN}/fg-ram131500-rb-mb-1.jpg?v=1773331962&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Honeycomb Rebel", Installation: "Direct Replacement" },
    description: "Give your Ram 1500 the aggressive Rebel look with this honeycomb-style front grille in matte black. Inspired by the Ram Rebel trim package, this grille features a bold honeycomb pattern that adds a rugged, off-road-ready aesthetic to any 2013-2022 Ram 1500. No modifications needed — bolts directly to the factory mounting points.",
    features: [
      "Rebel-Inspired Honeycomb Design — Off-road-ready styling that commands attention",
      "Matte Black Finish — Tough, low-sheen coating for a tactical appearance",
      "Direct Bolt-On Fit — Uses factory hardware with no modifications required",
      "Premium ABS Construction — Lightweight and impact-resistant material",
      "Broad Compatibility — Fits classic and new-generation Ram 1500 models"
    ],
    fitment: [
      "2013-2018 Ram 1500 (Classic Body)", "2019-2022 Ram 1500 (New Body)"
    ],
    inStock: true, sku: "FG-RAM131500-RB-MB"
  },

  // ═══════════════════════════════════════════
  // CHASE RACK / SPORT BAR
  // ═══════════════════════════════════════════
  {
    id: "cr-1", slug: "universal-chase-rack-tire-carrier-matte-black-finish",
    title: "Universal Full Size Chase Rack Tire Carrier - Matte Black", price: 64.82,
    category: "chase-rack", make: "Universal", model: ["Full Size Trucks"], yearRange: "Universal",
    image: `${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-2_4443dc5c-2a42-40b7-867f-7d9d7477a259.jpg?v=1773329905&width=800`,
    images: [`${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-2_4443dc5c-2a42-40b7-867f-7d9d7477a259.jpg?v=1773329905&width=800`, `${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-3_909c71d1-7a6b-41a2-b0b0-fca8e2c10833.jpg?v=1773329905&width=800`, `${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-4_93b17786-70cb-4fe3-b12e-3016453337b9.jpg?v=1773329905&width=800`],
    specs: { Fitment: "Universal Full Size", Finish: "Matte Black", Material: "Heavy-Duty Steel", "Tire Mount": "Included", Installation: "Bolt-On" },
    description: "Carry a spare tire securely on your full-size truck bed with this universal chase rack tire carrier in matte black. Built from heavy-duty steel with a durable powder-coat finish, this tire carrier mounts to most full-size truck beds and provides a convenient, off-road-ready spare tire solution without sacrificing bed space.",
    features: [
      "Integrated Tire Carrier — Securely mounts a full-size spare tire to your truck bed",
      "Universal Full-Size Fitment — Designed to work with most full-size truck beds",
      "Heavy-Duty Steel Construction — Engineered to handle the weight and vibration of trail riding",
      "Matte Black Powder-Coat — Corrosion-resistant finish for all-weather durability",
      "Bolt-On Installation — Mounts to bed rails without drilling into the truck body"
    ],
    fitment: [
      "Universal — Fits most full-size truck beds (Ford F-150, Chevy Silverado, Ram 1500, Toyota Tundra, etc.)"
    ],
    inStock: true, sku: "CRJZ-TR-4000FS-AR-MB"
  },
  {
    id: "cr-2", slug: "stehlen-razor-3000-universal-chase-rack-w-led-lights-texture-black",
    title: "Stehlen Razor 3000 Universal Chase Rack w/LED Lights - Texture Black", price: 221.47,
    category: "chase-rack", make: "Universal", model: ["Full Size Trucks"], yearRange: "Universal",
    image: `${CDN}/LISTING_crjz-raz-3000-st-tb-ws-1.jpg?v=1773329888&width=800`,
    images: [`${CDN}/LISTING_crjz-raz-3000-st-tb-ws-1.jpg?v=1773329888&width=800`, `${CDN}/crjz-raz-3000-st-tb-2.jpg?v=1772182951&width=800`, `${CDN}/crjz-raz-3000-st-tb-3.jpg?v=1772182951&width=800`],
    specs: { MPN: "sb027-TB", Finish: "Texture Black", Design: "Universal Adjustable", Lighting: "Integrated LED Brake & Fog Lights", "Part Number": "CRJZ-RAZ-3000-ST-TB" },
    description: "Dominate the road with the Stehlen Razor Series 3000 Universal Adjustable Chase Rack in a rugged texture black finish. This versatile roll bar features integrated LED brake and fog lights for enhanced visibility and safety, while its adjustable design ensures a custom fit for your truck bed. Built for both style and function, this chase rack delivers serious off-road presence and practical cargo management.",
    features: [
      "Integrated LED Brake and Fog Lights — Superior visibility and safety on and off road",
      "Universal Adjustable Design — Custom, secure fit across multiple truck bed sizes",
      "Durable Texture Black Finish — Resists scratches, chips, and UV fading",
      "Heavy-Duty Steel Construction — Built to handle rugged off-road conditions",
      "Sleek Sport Bar Styling — Enhances your truck's aggressive appearance",
      "Bolt-On Installation — No drilling required for most applications"
    ],
    fitment: [
      "1999-2019 Chevrolet Silverado 1500", "2001-2019 Chevrolet Silverado 2500 HD",
      "2007-2019 Chevrolet Silverado 3500 HD", "Universal — Most full-size truck beds"
    ],
    inStock: true, sku: "CRJZ-RAZ-3000-ST-TB"
  },
  {
    id: "cr-3", slug: "stehlen-razor-1000-universal-chase-rack-w-led-lights-matte-black",
    title: "Stehlen Razor 1000 Universal Chase Rack w/ LED Lights - Matte Black", price: 161.77,
    category: "chase-rack", make: "Universal", model: ["Full Size Trucks"], yearRange: "Universal",
    image: `${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773329881&width=800`,
    images: [`${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773329881&width=800`, `${CDN}/crjz-raz-1000-st-mb-2.jpg?v=1772182967&width=800`, `${CDN}/crjz-raz-1000-st-mb-3.jpg?v=1772182967&width=800`],
    specs: { Finish: "Matte Black", Design: "Universal Adjustable", Lighting: "Integrated LED Lights", Material: "Heavy-Duty Steel", "Part Number": "CRJZ-RAZ-1000-ST-MB" },
    description: "The Stehlen Razor Series 1000 delivers an aggressive sport bar profile with integrated LED lights in a clean matte black finish. This entry-level chase rack provides the same universal adjustable fitment and heavy-duty steel construction as the higher-end models, making it an excellent value for truck owners who want style and function without breaking the bank.",
    features: [
      "Integrated LED Lights — Built-in lighting for enhanced visibility",
      "Universal Adjustable Design — Fits most full-size truck beds",
      "Matte Black Powder-Coat — Durable finish resists corrosion and UV damage",
      "Heavy-Gauge Steel Frame — Engineered for strength and longevity",
      "Sport Bar Profile — Adds a sleek, aggressive look to your truck bed",
      "No-Drill Installation — Clamps to bed rails for easy setup"
    ],
    fitment: [
      "Universal — Fits most full-size truck beds"
    ],
    inStock: false, sku: "CRJZ-RAZ-1000-ST-MB"
  },

  // ═══════════════════════════════════════════
  // TONNEAU COVERS
  // ═══════════════════════════════════════════
  {
    id: "tc-1", slug: "2022-2025-toyota-tundra-5-5-bed-tonneau-cover-led-light-kit",
    title: "2022-2025 Toyota Tundra 5.5' Bed Tonneau Cover & LED Light Kit", price: 301.92,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2022-2025",
    image: `${CDN}/LISTING_tc-lth_2btbl-16w8p-01-ws-2_a9465d73-f185-4ae9-8440-381b63cd3658.jpg?v=1773343109&width=800`,
    images: [`${CDN}/LISTING_tc-lth_2btbl-16w8p-01-ws-2_a9465d73-f185-4ae9-8440-381b63cd3658.jpg?v=1773343109&width=800`, `${CDN}/tbl-16w8p-03_6ebba15c-789a-461f-b4b5-c939e94fb066.jpg?v=1773343109&width=800`],
    specs: { "Bed Size": "5.5 Ft (Short Bed)", "Cover Type": "Low Profile Solid Hard Tri-Fold", "LED Configuration": "8 Pods, 2 LEDs per Pod (16 Total)", "LED Wattage": "1 Watt per LED", "LED Color": "White", "LED Power Source": "AA Batteries", "Part Number": "TC-TUN22-5.5-LTH+TBL-16W8P-01" },
    description: "Upgrade your 2022-2025 Toyota Tundra with this premium combo package featuring a low-profile solid hard tri-fold tonneau cover and a truck bed LED lighting kit. Designed specifically for the 5.5-foot short bed, this combination delivers superior cargo protection with a sleek, aerodynamic profile while illuminating your truck bed for easy access day or night.",
    features: [
      "Low-Profile Solid Hard Tri-Fold Design — Sleek, factory-integrated appearance",
      "Durable Hard Panel Construction — Superior weather protection and security",
      "8-Pod LED Light Kit — 16 bright white 1-watt LEDs with control box included",
      "Battery-Powered LED System — AA batteries, no hardwiring required",
      "Tri-Fold Design — Quick bed access without full cover removal",
      "Custom-Fit — Engineered specifically for 2022+ Toyota Tundra 5.5' short bed"
    ],
    fitment: [
      "2022-2025 Toyota Tundra (5.5' Short Bed Only)"
    ],
    inStock: true, sku: "TC-LTH-TBL-TUN22-55"
  },
  {
    id: "tc-2", slug: "2014-2021-toyota-tundra-6-5-soft-tri-fold-tonneau-cover-w-led-lights",
    title: "2014-2021 Toyota Tundra 6.5' Soft Tri-Fold Tonneau Cover w/ LED Lights", price: 123.88,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-tfs-ws-1_d4293ec4-1b41-4d5d-baec-95ed2aedeaa8.jpg?v=1773343096&width=800`,
    images: [`${CDN}/LISTING_tc-tfs-ws-1_d4293ec4-1b41-4d5d-baec-95ed2aedeaa8.jpg?v=1773343096&width=800`, `${CDN}/tbl-16w8p-03_34fbe51a-3a99-4d39-8d1b-900eb879296c.jpg?v=1773343096&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Soft Tri-Fold", "LED Kit": "Included", Installation: "Clamp-On", Material: "Marine-Grade Vinyl" },
    description: "Protect your cargo and light up your truck bed with this soft tri-fold tonneau cover and LED lighting combo for the 2014-2021 Toyota Tundra. The marine-grade vinyl construction provides reliable weather protection, while the included LED bed light kit makes nighttime loading a breeze. The tri-fold design allows quick partial or full bed access.",
    features: [
      "Soft Tri-Fold Design — Folds in three sections for partial or full bed access",
      "Marine-Grade Vinyl — Premium weather-resistant material that won't crack or fade",
      "LED Bed Light Kit — 8-pod system with 16 bright white LEDs included",
      "Clamp-On Installation — No-drill mounting with adjustable clamps",
      "Lightweight Construction — Easy to fold, flip, and remove by one person",
      "Improved Fuel Economy — Aerodynamic cover reduces drag on the highway"
    ],
    fitment: [
      "2014-2021 Toyota Tundra (6.5' Bed Only)"
    ],
    inStock: true, sku: "TC-TFS-TBL-TUN14-65"
  },
  {
    id: "tc-3", slug: "2014-2021-toyota-tundra-6-5-bed-soft-tri-fold-tonneau-cover",
    title: "2014-2021 Toyota Tundra 6.5' Bed Soft Tri-Fold Tonneau Cover", price: 103.61,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-tfs-ws-1_fb887556-d2a5-471a-96fc-010041a2e47d.jpg?v=1773343065&width=800`,
    images: [`${CDN}/LISTING_tc-tfs-ws-1_fb887556-d2a5-471a-96fc-010041a2e47d.jpg?v=1773343065&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Soft Tri-Fold", Installation: "Clamp-On", Material: "Marine-Grade Vinyl" },
    description: "Keep your cargo secure and dry with this soft tri-fold tonneau cover for the 2014-2021 Toyota Tundra 6.5' bed. The marine-grade vinyl construction withstands rain, snow, and UV exposure while the tri-fold design gives you flexible access to your truck bed. Easy clamp-on installation requires no drilling or special tools.",
    features: [
      "Tri-Fold Design — Three-panel folding for flexible bed access options",
      "Marine-Grade Vinyl — Waterproof and UV-resistant for all-season use",
      "No-Drill Clamp-On Mount — Installs in minutes without modifying your truck",
      "Flush Low-Profile Fit — Sits flat against the bed rails for a clean look",
      "Easy One-Person Operation — Lightweight panels fold and unfold easily"
    ],
    fitment: [
      "2014-2021 Toyota Tundra (6.5' Bed Only)"
    ],
    inStock: true, sku: "TC-TFS-TUN14-65"
  },
  {
    id: "tc-4", slug: "2014-toyota-tundra-6-5-bed-low-profile-hard-tri-fold-tonneau-cover-w-led",
    title: "2014+ Toyota Tundra 6.5' Bed Low Profile Hard Tri-Fold Tonneau Cover w/ LED", price: 305.20,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_ca550746-3098-47df-8ff7-f7a24fa0dfea.jpg?v=1773343059&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_ca550746-3098-47df-8ff7-f7a24fa0dfea.jpg?v=1773343059&width=800`, `${CDN}/tbl-16w8p-03_684e8a5e-fbcb-4f02-beba-5b8f9c941c90.jpg?v=1773343059&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold Low Profile", "LED Kit": "Included", Material: "Aluminum Panels", "LED Count": "16 LEDs (8 pods)" },
    description: "The ultimate bed protection for your Toyota Tundra — this low-profile hard tri-fold tonneau cover combines aircraft-grade aluminum panels with a built-in LED bed light kit. The flush-mount design sits below the bed rail line for a factory-integrated appearance while providing maximum security for your cargo.",
    features: [
      "Low-Profile Hard Panels — Sits below bed rail line for a sleek, integrated look",
      "Aircraft-Grade Aluminum — Maximum strength with minimal weight",
      "8-Pod LED Bed Light Kit — Illuminate your entire bed with bright white LEDs",
      "Tri-Fold Mechanism — Fold two-thirds for quick access or remove entirely",
      "Weather-Sealed Design — Perimeter seals keep rain, snow, and dust out",
      "Lockable Panels — Built-in latch system secures your cargo"
    ],
    fitment: [
      "2014-2021 Toyota Tundra (6.5' Bed)", "2022-2025 Toyota Tundra (6.5' Bed)"
    ],
    inStock: true, sku: "TC-LTH-TBL-TUN14-65"
  },
  {
    id: "tc-5", slug: "2014-toyota-tundra-6-5ft-bed-hard-tri-fold-tonneau-cover-243365",
    title: "2014+ Toyota Tundra 6.5ft Bed Hard Tri-Fold Tonneau Cover - 243365", price: 284.93,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_de4090d0-ab43-4c57-8671-4bb9a29d9a57.jpg?v=1773343030&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_de4090d0-ab43-4c57-8671-4bb9a29d9a57.jpg?v=1773343030&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold", Material: "Aluminum", "Part Number": "243365" },
    description: "Protect your 2014+ Toyota Tundra truck bed with this hard tri-fold tonneau cover. Built from lightweight aluminum panels with a durable textured finish, this cover provides excellent security and weather resistance. The tri-fold design allows you to access your bed in seconds without removing the entire cover.",
    features: [
      "Hard Tri-Fold Construction — Rigid panels provide superior protection vs. soft covers",
      "Aluminum Build — Lightweight yet strong enough to support distributed loads",
      "Textured Black Finish — Hides scratches and complements dark truck colors",
      "Quick-Access Tri-Fold — Open one, two, or all three panels as needed",
      "Integrated Drain System — Channels water away from your cargo area"
    ],
    fitment: [
      "2014-2025 Toyota Tundra (6.5' Bed Only)"
    ],
    inStock: true, sku: "TC-LTH-TUN14-65"
  },
  {
    id: "tc-6", slug: "2014-2021-toyota-tundra-6-5-roll-up-tonneau-cover-w-led-lights",
    title: "2014-2021 Toyota Tundra 6.5' Roll-Up Tonneau Cover w/ LED Lights", price: 102.46,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-lru-ws-1_8ca6684b-3dc5-49f2-a20b-4724d27575a5.jpg?v=1773343028&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_8ca6684b-3dc5-49f2-a20b-4724d27575a5.jpg?v=1773343028&width=800`, `${CDN}/tbl-16w8p-03_952644ac-9a5e-4a80-b833-218a32a3396f.jpg?v=1773343028&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", "LED Kit": "Included", Installation: "Clamp-On", Material: "Vinyl" },
    description: "Get the convenience of a roll-up tonneau cover with the bonus of LED bed lighting for your 2014-2021 Toyota Tundra. The lock-and-roll mechanism lets you secure or fully open your bed in seconds, while the included 8-pod LED kit adds bright white illumination for nighttime loading. Easy clamp-on installation — no drilling required.",
    features: [
      "Lock-and-Roll Mechanism — Secure your cover or roll it up in seconds",
      "8-Pod LED Bed Light Kit — Bright white lighting for nighttime visibility",
      "Vinyl Construction — Weather-resistant cover keeps cargo dry",
      "Full Bed Access — Rolls up completely to the cab for unrestricted access",
      "Clamp-On Installation — Mounts without drilling or permanent modifications",
      "Low-Profile Design — Sits flush with bed rails for a clean appearance"
    ],
    fitment: [
      "2014-2021 Toyota Tundra (6.5' Bed Only)"
    ],
    inStock: true, sku: "TC-LRU-TBL-TUN14-65"
  },
  {
    id: "tc-7", slug: "2014-2021-toyota-tundra-6-5-bed-roll-up-tonneau-cover-503365",
    title: "2014-2021 Toyota Tundra 6.5' Bed Roll-Up Tonneau Cover - 503365", price: 82.19,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-lru-ws-1_33688960-39ea-4601-ae5b-97e63c378ba5.jpg?v=1773343000&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_33688960-39ea-4601-ae5b-97e63c378ba5.jpg?v=1773343000&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", Installation: "Clamp-On", "Part Number": "503365", Material: "Vinyl" },
    description: "Simple, effective bed protection for your 2014-2021 Toyota Tundra. This roll-up tonneau cover features a durable vinyl construction that keeps your cargo dry and out of sight. The roll-up design provides full bed access when you need it, and the clamp-on mounting system installs in minutes without any drilling.",
    features: [
      "Roll-Up Design — Quick, easy access to your entire truck bed",
      "Durable Vinyl Material — Resists water, UV, and everyday wear",
      "Clamp-On Mounting — No-drill installation on your bed rails",
      "Tension Control — Adjustable tensioners keep the cover taut and wrinkle-free",
      "Lightweight — One-person operation for rolling and unrolling"
    ],
    fitment: [
      "2014-2021 Toyota Tundra (6.5' Bed Only)"
    ],
    inStock: true, sku: "TC-LRU-TUN14-65"
  },
  {
    id: "tc-8", slug: "2014-2021-toyota-tundra-6-5-tonneau-cover-w-led-bed-lights",
    title: "2014-2021 Toyota Tundra 6.5' Tonneau Cover w/ LED Bed Lights", price: 88.31,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_72c1cba0-bb15-48b2-9c8e-1ff2353732f4.jpg?v=1773342996&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_72c1cba0-bb15-48b2-9c8e-1ff2353732f4.jpg?v=1773342996&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hidden Snap Soft Roll-Up", "LED Kit": "Included", Installation: "Clamp-On", "LED Pods": "8 pods, 16 LEDs" },
    description: "This combo kit pairs a hidden snap soft roll-up tonneau cover with an 8-pod LED bed lighting system for your 2014-2021 Toyota Tundra 6.5' bed. The hidden snap design creates a smooth, streamlined appearance without visible fasteners, while the battery-powered LED kit adds practical illumination without wiring complications.",
    features: [
      "Hidden Snap Design — Concealed fasteners for a clean, seamless look",
      "Soft Roll-Up Cover — Flexible vinyl rolls up toward the cab for full access",
      "8-Pod LED System — 16 bright white LEDs illuminate your entire bed",
      "Battery-Powered LEDs — AA batteries, no hardwiring needed",
      "Clamp-On Installation — Quick mounting with no permanent modifications",
      "Weather-Resistant — Keeps cargo protected from rain, snow, and dust"
    ],
    fitment: [
      "2014-2021 Toyota Tundra (6.5' Bed Only)"
    ],
    inStock: true, sku: "TC-HSS-TBL-TUN14-65"
  },
  {
    id: "tc-9", slug: "2014-2021-toyota-tundra-6-5-bed-soft-roll-up-tonneau-cover",
    title: "2014-2021 Toyota Tundra 6.5' Bed Soft Roll-Up Tonneau Cover", price: 68.04,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-hss-ws-1_8b1d5c7e-444d-4b30-8abb-991352680ada.jpg?v=1773342966&width=800`,
    images: [`${CDN}/LISTING_tc-hss-ws-1_8b1d5c7e-444d-4b30-8abb-991352680ada.jpg?v=1773342966&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hidden Snap Soft Roll-Up", Installation: "Clamp-On", Material: "Vinyl" },
    description: "Affordable, reliable bed protection for your Tundra. This hidden snap soft roll-up tonneau cover delivers clean looks and practical function at an entry-level price point. The concealed snap fasteners create a smooth surface while the roll-up design gives you instant full bed access when needed.",
    features: [
      "Hidden Snap Soft Roll-Up — Clean appearance with no visible hardware",
      "Budget-Friendly Protection — Great value for everyday cargo security",
      "Clamp-On Mounting — Installs in minutes with no drilling",
      "Full Bed Access — Rolls all the way up to the rear window",
      "Vinyl Construction — Resists water and UV for reliable protection"
    ],
    fitment: [
      "2014-2021 Toyota Tundra (6.5' Bed Only)"
    ],
    inStock: true, sku: "TC-HSS-TUN14-65"
  },

  // ═══════════════════════════════════════════
  // CHEVY PARTS
  // ═══════════════════════════════════════════
  {
    id: "ch-1", slug: "2005-2006-chevy-equinox-pontiac-torrent-trailer-wiring-harness",
    title: "2005-2006 Chevy Equinox & Pontiac Torrent Trailer Wiring Harness", price: 13.49,
    category: "chevy-parts", make: "Chevy", model: ["Equinox"], yearRange: "2005-2006",
    image: `${CDN}/LISTING_thw-equi05-ee560-ws-1.jpg?v=1773346836&width=800`,
    images: [`${CDN}/LISTING_thw-equi05-ee560-ws-1.jpg?v=1773346836&width=800`, `${CDN}/thw-equi05-ee560-2_381ccd1e-c372-4d57-958c-08906e613586.jpg?v=1773346836&width=800`],
    specs: { Type: "Trailer Wiring Harness", Connector: "4-Way Flat", Installation: "Plug-In", "Wire Length": "56 inches" },
    description: "Add trailer towing capability to your 2005-2006 Chevy Equinox or Pontiac Torrent with this plug-in trailer wiring harness. The 4-way flat connector provides standard turn signal, brake light, and tail light connections to your trailer. Simply plugs into your vehicle's existing wiring — no splicing or cutting required.",
    features: [
      "Plug-In Installation — Connects to your vehicle's factory wiring harness",
      "4-Way Flat Connector — Standard connection for most utility trailers",
      "No Cutting or Splicing — Maintains factory electrical integrity",
      "56-Inch Wire Length — Plenty of reach to route to your hitch area",
      "Includes Dust Cover — Protects the connector when not in use"
    ],
    fitment: [
      "2005-2006 Chevrolet Equinox", "2006 Pontiac Torrent"
    ],
    inStock: true, sku: "THW-EQUI05-EE560"
  },
  {
    id: "ch-2", slug: "2005-2006-chevy-equinox-class-3-trailer-hitch-wiring-combo",
    title: "2005-2006 Chevy Equinox Class 3 Trailer Hitch & Wiring Combo", price: 89.88,
    category: "chevy-parts", make: "Chevy", model: ["Equinox"], yearRange: "2005-2006",
    image: `${CDN}/LISTING_th-equi05-c591_2bthw-equi05-ee560-ws-1.jpg?v=1773343997&width=800`,
    images: [`${CDN}/LISTING_th-equi05-c591_2bthw-equi05-ee560-ws-1.jpg?v=1773343997&width=800`, `${CDN}/th-equi05-c591_2bthw-equi05-ee560-wst.jpg?v=1773343997&width=800`],
    specs: { Class: "Class 3", Type: "Hitch + Wiring Combo", "Receiver Size": "2 inch", "Tongue Weight": "350 lbs", "Gross Trailer Weight": "3500 lbs", Installation: "Bolt-On" },
    description: "Complete towing solution for your 2005-2006 Chevy Equinox — this combo includes a Class 3 trailer hitch with a 2-inch receiver and a matching plug-in wiring harness. The hitch bolts directly to the frame with no cutting or welding, and the wiring connects to your vehicle's factory harness for a clean, professional installation.",
    features: [
      "Class 3 Hitch — 2-inch receiver supports up to 3,500 lbs gross trailer weight",
      "Complete Wiring Kit — 4-way flat connector included for trailer light connection",
      "Bolt-On Installation — Mounts to vehicle frame without welding or drilling",
      "Plug-In Wiring — No cutting or splicing of factory wires required",
      "Heavy-Duty Steel — Black powder-coat finish resists rust and corrosion",
      "350 lb Tongue Weight Capacity — Handles standard utility trailers with ease"
    ],
    fitment: [
      "2005-2006 Chevrolet Equinox (All Trims)"
    ],
    inStock: true, sku: "TH-EQUI05-C591-COMBO"
  },
  {
    id: "ch-3", slug: "2004-2011-chevrolet-cobalt-hhr-trailer-hitch-class-1",
    title: "2004-2011 Chevy Cobalt HHR Pontiac G5 Class 1 Trailer Hitch", price: 70.01,
    category: "chevy-parts", make: "Chevy", model: ["Cobalt", "HHR"], yearRange: "2004-2011",
    image: `${CDN}/LISTING_th-cob05-a447-ws-1.jpg?v=1773343517&width=800`,
    images: [`${CDN}/LISTING_th-cob05-a447-ws-1.jpg?v=1773343517&width=800`, `${CDN}/th-cob05-a447-1.jpg?v=1773343518&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", "Tongue Weight": "200 lbs", "Gross Trailer Weight": "2000 lbs", Installation: "Bolt-On" },
    description: "Add light-duty towing capability to your compact car with this Class 1 trailer hitch for the 2004-2011 Chevy Cobalt, HHR, and Pontiac G5. The 1.25-inch receiver supports up to 2,000 lbs of gross trailer weight, perfect for small utility trailers, bike racks, and cargo carriers. Bolt-on installation with no frame modifications.",
    features: [
      "Class 1 Hitch — 1.25-inch receiver for light-duty towing applications",
      "2,000 lb GTW Capacity — Handles bike racks, cargo carriers, and small trailers",
      "Bolt-On Installation — Mounts to vehicle frame with included hardware",
      "Multi-Vehicle Fitment — Compatible with Cobalt, HHR, and Pontiac G5",
      "Black Powder-Coat Finish — Corrosion-resistant for long-term durability"
    ],
    fitment: [
      "2005-2010 Chevrolet Cobalt", "2006-2011 Chevrolet HHR", "2007-2009 Pontiac G5"
    ],
    inStock: true, sku: "TH-COB05-A447"
  },
  {
    id: "ch-4", slug: "1995-2005-chevrolet-cavalier-pontiac-sunfire-class-1-trailer-hitch",
    title: "1995-2005 Chevy Cavalier Pontiac Sunfire Class 1 Trailer Hitch", price: 67.54,
    category: "chevy-parts", make: "Chevy", model: ["Cavalier"], yearRange: "1995-2005",
    image: `${CDN}/LISTING_th-cav95-a109-ws-1_6aa00b0a-55a1-4ce1-89e6-44c53cec6395.jpg?v=1773343497&width=800`,
    images: [`${CDN}/LISTING_th-cav95-a109-ws-1_6aa00b0a-55a1-4ce1-89e6-44c53cec6395.jpg?v=1773343497&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", "Tongue Weight": "200 lbs", "Gross Trailer Weight": "2000 lbs" },
    description: "Class 1 trailer hitch designed for the 1995-2005 Chevy Cavalier and Pontiac Sunfire. Supports up to 2,000 lbs of gross trailer weight with a 1.25-inch receiver opening. Perfect for mounting a bike rack, cargo carrier, or towing a small utility trailer behind your compact car.",
    features: [
      "Class 1 Rating — 200 lb tongue weight, 2,000 lb gross trailer weight",
      "1.25-Inch Receiver — Compatible with Class 1 accessories and ball mounts",
      "Bolt-On Design — No welding or frame modifications required",
      "Dual Vehicle Fitment — Works with both Cavalier and Sunfire models",
      "Durable Steel Construction — Built for years of reliable service"
    ],
    fitment: [
      "1995-2005 Chevrolet Cavalier (All Trims)", "1995-2005 Pontiac Sunfire (All Trims)"
    ],
    inStock: true, sku: "TH-CAV95-A109"
  },
  {
    id: "ch-5", slug: "2008-2017-buick-enclave-chevy-traverse-class-3-hitch-kit-curt",
    title: "2008-2017 Buick Enclave Chevy Traverse Class 3 Hitch Kit - CURT", price: 91.59,
    category: "chevy-parts", make: "Chevy", model: ["Traverse"], yearRange: "2008-2017",
    image: `${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`, `${CDN}/th-acad07-c424_2bth-bmount-l2-1.jpg?v=1773343164&width=800`],
    specs: { Class: "Class 3", Type: "Hitch + Ball Mount Kit", "Receiver Size": "2 inch", Brand: "CURT", "Tongue Weight": "525 lbs", "Gross Trailer Weight": "3500 lbs" },
    description: "Complete CURT Class 3 hitch kit with ball mount for the 2008-2017 Buick Enclave and Chevy Traverse. This all-in-one package gives you everything needed to start towing — the hitch receiver bolts to the frame while the included ball mount slides into the 2-inch receiver for immediate use.",
    features: [
      "Complete Kit — Hitch receiver plus ball mount included",
      "Class 3 Rating — 3,500 lb gross trailer weight, 525 lb tongue weight",
      "CURT Brand Quality — Industry-leading fitment and durability",
      "2-Inch Receiver — Standard size for most towing accessories",
      "Bolt-On Installation — No welding required, mounts to vehicle frame"
    ],
    fitment: [
      "2008-2017 Buick Enclave", "2009-2017 Chevrolet Traverse",
      "2007-2016 GMC Acadia", "2007-2010 Saturn Outlook"
    ],
    inStock: true, sku: "TH-ACAD07-C424-KIT"
  },
  {
    id: "ch-6", slug: "2008-2017-buick-enclave-chevrolet-traverse-class-3-trailer-hitch",
    title: "2008-2017 Buick Enclave Chevy Traverse Class 3 Trailer Hitch", price: 72.39,
    category: "chevy-parts", make: "Chevy", model: ["Traverse"], yearRange: "2008-2017",
    image: `${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`, `${CDN}/th-acad07-c424-1.jpg?v=1773343153&width=800`],
    specs: { Class: "Class 3", "Receiver Size": "2 inch", "Tongue Weight": "525 lbs", "Gross Trailer Weight": "3500 lbs", Finish: "Black Powder-Coat" },
    description: "Add towing capability to your full-size crossover with this Class 3 trailer hitch for the 2008-2017 Buick Enclave and Chevy Traverse. The 2-inch receiver supports up to 3,500 lbs of gross trailer weight for boats, utility trailers, and campers. Hitch receiver only — ball mount sold separately.",
    features: [
      "Class 3 Hitch Receiver — 2-inch opening for standard ball mounts",
      "3,500 lb Towing Capacity — Handle boats, utility trailers, and small campers",
      "525 lb Tongue Weight — Supports properly loaded trailers with ease",
      "Black Powder-Coat Finish — Rust and corrosion protection",
      "Bolt-On Installation — Vehicle-specific mounting for a perfect fit"
    ],
    fitment: [
      "2008-2017 Buick Enclave", "2009-2017 Chevrolet Traverse"
    ],
    inStock: true, sku: "TH-ACAD07-C424"
  },
  {
    id: "ch-7", slug: "99-07-chevy-silverado-gmc-sierra-6-5-roll-up-tonneau-cover-w-led",
    title: "99-07 Chevy Silverado GMC Sierra 6.5' Roll Up Tonneau Cover w/ LED", price: 100.53,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "1999-2007",
    image: `${CDN}/LISTING_tc-lru_2btbl-16w8p-01-ws-1_2b9a03c1-67b6-4e06-8852-a9ae0f256478.jpg?v=1773341793&width=800`,
    images: [`${CDN}/LISTING_tc-lru_2btbl-16w8p-01-ws-1_2b9a03c1-67b6-4e06-8852-a9ae0f256478.jpg?v=1773341793&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", "LED Kit": "Included", Installation: "Clamp-On", "LED Pods": "8 pods, 16 LEDs" },
    description: "Combo package for your 1999-2007 Chevy Silverado or GMC Sierra — includes a roll-up vinyl tonneau cover and an 8-pod LED bed light kit. The lock-and-roll cover protects your cargo from the elements while the battery-powered LED system lights up your bed for nighttime use. Clamp-on installation means no permanent modifications to your truck.",
    features: [
      "Roll-Up Tonneau Cover — Lock it down or roll it up for full bed access",
      "8-Pod LED Bed Lights — 16 white LEDs with battery-powered control box",
      "Clamp-On Installation — No-drill mounting preserves your truck's bed rails",
      "Durable Vinyl Cover — Resists water, UV, and everyday wear and tear",
      "Compatible with Both Brands — Fits Silverado and Sierra with 6.5' beds"
    ],
    fitment: [
      "1999-2007 Chevrolet Silverado 1500 (6.5' Bed)",
      "1999-2007 GMC Sierra 1500 (6.5' Bed)"
    ],
    inStock: true, sku: "TC-LRU-SIL99-65"
  },
  {
    id: "ch-8", slug: "99-07-chevy-silverado-gmc-sierra-6-5-roll-up-tonneau-cover",
    title: "99-07 Chevy Silverado GMC Sierra 6.5' Roll Up Tonneau Cover", price: 80.26,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "1999-2007",
    image: `${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", Installation: "Clamp-On", Material: "Vinyl" },
    description: "Affordable roll-up tonneau cover for the classic body 1999-2007 Chevy Silverado and GMC Sierra. This no-frills cover provides reliable weather protection and cargo concealment at an excellent price point. The roll-up design gives you instant full bed access, and the clamp-on rails install without drilling.",
    features: [
      "Roll-Up Design — Full bed access in seconds",
      "Vinyl Construction — Weather-resistant and easy to clean",
      "Clamp-On Rails — No-drill installation on bed rails",
      "Tension Adjusters — Keep the cover smooth and taut",
      "Budget-Friendly — Quality protection without the premium price tag"
    ],
    fitment: [
      "1999-2007 Chevrolet Silverado 1500 (6.5' Bed)",
      "1999-2007 GMC Sierra 1500 (6.5' Bed)"
    ],
    inStock: true, sku: "TC-LRU-SIL99"
  },
  {
    id: "ch-9", slug: "2019-chevy-silverado-gmc-sierra-6-5-tri-fold-tonneau-cover-w-led",
    title: "2019+ Chevy Silverado GMC Sierra 6.5' Tri-Fold Tonneau Cover w/ LED", price: 297.86,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_1c0fa165-1448-4b8a-86d1-707455db8956.jpg?v=1773341758&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_1c0fa165-1448-4b8a-86d1-707455db8956.jpg?v=1773341758&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold", "LED Kit": "Included", Material: "Aluminum Panels", "LED Count": "16 LEDs (8 pods)" },
    description: "Premium hard tri-fold tonneau cover with LED bed light kit for the 2019+ Chevy Silverado and GMC Sierra 6.5' bed. The aluminum panel construction provides maximum security and weather protection, while the included LED kit adds practical illumination for loading and unloading after dark.",
    features: [
      "Hard Tri-Fold Aluminum Panels — Maximum security and weather protection",
      "8-Pod LED Bed Light Kit — 16 bright white LEDs included",
      "Low-Profile Design — Sits flush for a factory-integrated appearance",
      "Quick-Access Folding — Open one, two, or all three panels",
      "Perimeter Weather Seals — Keeps water and debris out of your bed",
      "Clamp-On Installation — No drilling into your truck bed"
    ],
    fitment: [
      "2019-2025 Chevrolet Silverado 1500 (6.5' Bed)",
      "2019-2025 GMC Sierra 1500 (6.5' Bed)"
    ],
    inStock: true, sku: "TC-LTH-SIL19-65"
  },
  {
    id: "ch-10", slug: "2019-chevy-silverado-gmc-sierra-6-5ft-hard-tri-fold-tonneau-cover",
    title: "2019+ Chevy Silverado/GMC Sierra 6.5ft Hard Tri-Fold Tonneau Cover", price: 277.59,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_40fe2199-91c3-4325-8420-c8bddf7aed52.jpg?v=1773341724&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_40fe2199-91c3-4325-8420-c8bddf7aed52.jpg?v=1773341724&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold", Material: "Aluminum", Finish: "Textured Black" },
    description: "Solid protection for your 2019+ Silverado or Sierra with this hard tri-fold tonneau cover. Lightweight aluminum panels fold in three sections for versatile bed access, while the textured black finish complements your truck's styling. Perimeter seals keep rain and dust out of your cargo area.",
    features: [
      "Hard Tri-Fold Panels — Rigid aluminum construction for superior protection",
      "Textured Black Finish — Durable, scratch-hiding surface treatment",
      "Three-Position Folding — Access one-third, two-thirds, or full bed",
      "Weather-Sealed Perimeter — Rubber gaskets keep out water and dust",
      "No-Drill Clamp-On — Quick installation without permanent modifications"
    ],
    fitment: [
      "2019-2025 Chevrolet Silverado 1500 (6.5' Bed)",
      "2019-2025 GMC Sierra 1500 (6.5' Bed)"
    ],
    inStock: true, sku: "TC-LTH-SIL19"
  },

  // ═══════════════════════════════════════════
  // FORD PARTS
  // ═══════════════════════════════════════════
  {
    id: "fd-1", slug: "2015-2023-ford-f-150-f-250-f-350-underseat-storage-organizer-box",
    title: "2015-2023 Ford F-150 F-250 F-350 Underseat Storage Organizer Box", price: 68.15,
    category: "ford-parts", make: "Ford", model: ["F-150", "F-250", "F-350"], yearRange: "2015-2023",
    image: `${CDN}/LISTING_uss-f15015cc-bk-t-g.jpg?v=1773347272&width=800`,
    images: [`${CDN}/LISTING_uss-f15015cc-bk-t-g.jpg?v=1773347272&width=800`, `${CDN}/uss-f15015cc-bk-1.jpg?v=1773347272&width=800`, `${CDN}/uss-f15015cc-bk-3.jpg?v=1773347272&width=800`],
    specs: { Fitment: "Crew Cab Only", Material: "Heavy-Duty Polymer", Color: "Black", Installation: "Slide-In", Dimensions: "Custom-Fit" },
    description: "Maximize the hidden storage space under your rear seat with this custom-fit underseat storage organizer for 2015-2023 Ford F-150, F-250, and F-350 Crew Cab trucks. Made from heavy-duty polymer, this organizer keeps tools, emergency gear, documents, and valuables secure and out of sight. Simply slides under the rear seat — no modifications needed.",
    features: [
      "Custom-Fit Design — Engineered specifically for Ford Super Duty Crew Cab rear seats",
      "Heavy-Duty Polymer — Impact-resistant material that won't crack or warp",
      "Divided Compartments — Multiple sections organize tools, gear, and valuables",
      "Concealed Storage — Items stay hidden and secure under the rear seat",
      "Slide-In Installation — No tools, drilling, or modifications required",
      "Easy to Clean — Wipe down with a damp cloth to remove dirt and debris"
    ],
    fitment: [
      "2015-2023 Ford F-150 SuperCrew Cab",
      "2017-2023 Ford F-250 Super Duty Crew Cab",
      "2017-2023 Ford F-350 Super Duty Crew Cab"
    ],
    inStock: true, sku: "USS-F15015CC-BK"
  },
  {
    id: "fd-2", slug: "1986-1992-ford-ranger-trailer-wiring-harness-t-connector-55314",
    title: "1986-1992 Ford Ranger Trailer Wiring Harness T-Connector - 55314", price: 8.71,
    category: "ford-parts", make: "Ford", model: ["Ranger"], yearRange: "1986-1992",
    image: `${CDN}/LISTING_thw-rang86-4w-ef314-0.jpg?v=1773347007&width=800`,
    images: [`${CDN}/LISTING_thw-rang86-4w-ef314-0.jpg?v=1773347007&width=800`, `${CDN}/thw-rang86-4w-ef314-2.jpg?v=1773347007&width=800`],
    specs: { Type: "T-Connector", Connector: "4-Way Flat", Installation: "Plug-In", "Part Number": "55314" },
    description: "Simple plug-in trailer wiring T-connector for the 1986-1992 Ford Ranger. This budget-friendly connector taps into your truck's existing taillight wiring to provide standard trailer light signals. No cutting, splicing, or special tools required — just plug in and tow.",
    features: [
      "T-Connector Design — Taps into existing taillight wiring easily",
      "4-Way Flat Output — Standard connection for most utility trailers",
      "Plug-In Installation — No wire cutting or splicing needed",
      "Affordable Solution — Get towing capability at the lowest cost",
      "Dust Cover Included — Protects connector from dirt and moisture"
    ],
    fitment: [
      "1986-1992 Ford Ranger (All Cab Configurations)"
    ],
    inStock: true, sku: "THW-RANG86-4W-EF314"
  },
  {
    id: "fd-3", slug: "2013-2016-ford-escape-trailer-wiring-harness-4-way-t-connector",
    title: "2013-2016 Ford Escape Trailer Wiring Harness 4-Way T-Connector", price: 23.63,
    category: "ford-parts", make: "Ford", model: ["Escape"], yearRange: "2013-2016",
    image: `${CDN}/LISTING_thw-escp13-4w-ef164-t-2.jpg?v=1773346861&width=800`,
    images: [`${CDN}/LISTING_thw-escp13-4w-ef164-t-2.jpg?v=1773346861&width=800`, `${CDN}/thw-escp13-4w-ef164-2.jpg?v=1773346861&width=800`],
    specs: { Type: "T-Connector", Connector: "4-Way Flat", Installation: "Plug-In", "Converter Type": "Powered" },
    description: "Add trailer lighting capability to your 2013-2016 Ford Escape with this powered 4-way T-connector wiring harness. The powered converter draws directly from the vehicle battery to ensure clean, consistent trailer light signals without overloading the vehicle's electronics. Plugs into the factory taillight connector — no wire splicing needed.",
    features: [
      "Powered Converter — Battery-direct power for consistent trailer light signals",
      "4-Way Flat T-Connector — Standard output for trailers and cargo carriers",
      "Plug-In Connection — Mates directly with Ford Escape factory wiring",
      "No Splicing Required — Clean installation preserves factory electrical system",
      "Circuit Protected — Built-in fuse protection for safe operation"
    ],
    fitment: [
      "2013-2016 Ford Escape (All Trims)"
    ],
    inStock: true, sku: "THW-ESCP13-4W-EF164"
  },
  {
    id: "fd-4", slug: "2015-2021-ford-transit-150-250-350-class-3-hitch-ball-mount-kit",
    title: "2015-2021 Ford Transit 150/250/350 Class 3 Hitch & Ball Mount Kit", price: 84.96,
    category: "ford-parts", make: "Ford", model: ["Transit"], yearRange: "2015-2021",
    image: `${CDN}/LISTING_th-tran15-c193_2bth-bmount-l2-ws-1.jpg?v=1773346714&width=800`,
    images: [`${CDN}/LISTING_th-tran15-c193_2bth-bmount-l2-ws-1.jpg?v=1773346714&width=800`, `${CDN}/th-bmount-l2-1_d3e7defe-de1a-4af1-be57-e276fd408095.jpg?v=1773346714&width=800`],
    specs: { Class: "Class 3", Type: "Hitch + Ball Mount", "Receiver Size": "2 inch", "Tongue Weight": "525 lbs", "Gross Trailer Weight": "3500 lbs", Installation: "Bolt-On" },
    description: "Complete towing setup for your Ford Transit van — this kit includes a Class 3 hitch receiver and a ball mount. The 2-inch receiver supports up to 3,500 lbs of gross trailer weight, making it ideal for cargo trailers, equipment haulers, and other commercial towing applications. Bolts directly to the Transit's frame.",
    features: [
      "Complete Towing Kit — Hitch receiver plus ball mount included",
      "Class 3 Rating — 3,500 lb GTW for commercial towing needs",
      "2-Inch Receiver — Standard size for most towing accessories",
      "Bolt-On Installation — Vehicle-specific mounting with included hardware",
      "Commercial-Grade Build — Designed for the demands of daily fleet use",
      "Black Powder-Coat — Corrosion protection for all-weather service"
    ],
    fitment: [
      "2015-2021 Ford Transit 150", "2015-2021 Ford Transit 250",
      "2015-2021 Ford Transit 350"
    ],
    inStock: true, sku: "TH-TRAN15-C193-KIT"
  },
  {
    id: "fd-5", slug: "2015-2021-ford-transit-150-250-350-class-3-trailer-hitch-13193",
    title: "2015-2021 Ford Transit 150/250/350 Class 3 Trailer Hitch - 13193", price: 65.75,
    category: "ford-parts", make: "Ford", model: ["Transit"], yearRange: "2015-2021",
    image: `${CDN}/LISTING_th-tran15-c193-ws-1.jpg?v=1773346685&width=800`,
    images: [`${CDN}/LISTING_th-tran15-c193-ws-1.jpg?v=1773346685&width=800`, `${CDN}/th-tran15-c193-2.jpg?v=1773346685&width=800`],
    specs: { Class: "Class 3", "Receiver Size": "2 inch", "Tongue Weight": "525 lbs", "Gross Trailer Weight": "3500 lbs", "Part Number": "13193" },
    description: "Class 3 trailer hitch receiver for the 2015-2021 Ford Transit full-size van. This hitch-only unit (ball mount sold separately) provides a solid foundation for all your towing and hauling needs with a 2-inch receiver opening and 3,500 lb towing capacity.",
    features: [
      "Class 3 Hitch Receiver — 2-inch opening for standard accessories",
      "3,500 lb GTW — Tow cargo trailers, equipment, and more",
      "Bolt-On Design — Mounts to Transit frame with no welding",
      "Heavy-Gauge Steel — Industrial-strength construction",
      "Rust-Resistant Finish — Powder-coated for long-lasting protection"
    ],
    fitment: [
      "2015-2021 Ford Transit 150/250/350 (All Wheelbases)"
    ],
    inStock: true, sku: "TH-TRAN15-C193"
  },
  {
    id: "fd-6", slug: "2019-2023-ford-ranger-class-3-trailer-hitch-2-receiver-curt-13417",
    title: "2019-2023 Ford Ranger Class 3 Trailer Hitch 2\" Receiver - CURT 13417", price: 70.72,
    category: "ford-parts", make: "Ford", model: ["Ranger"], yearRange: "2019-2023",
    image: `${CDN}/LISTING_th-rang19-c417-ws-1.jpg?v=1773345801&width=800`,
    images: [`${CDN}/LISTING_th-rang19-c417-ws-1.jpg?v=1773345801&width=800`, `${CDN}/th-class-3-2_09934db1-c6f7-44eb-b77f-7f41d70ac20a.jpg?v=1773345801&width=800`],
    specs: { Class: "Class 3", "Receiver Size": "2 inch", Brand: "CURT", "Part Number": "13417", "Tongue Weight": "500 lbs", "Gross Trailer Weight": "3500 lbs" },
    description: "CURT Class 3 trailer hitch for the 2019-2023 Ford Ranger mid-size truck. This hitch provides a 2-inch receiver opening with a 3,500 lb towing capacity — perfect for boat trailers, utility trailers, and recreational towing. CURT's vehicle-specific design ensures a precise, no-drill fit.",
    features: [
      "CURT #13417 — Vehicle-specific design for guaranteed fitment",
      "Class 3 Rating — 3,500 lb GTW, 500 lb tongue weight",
      "2-Inch Receiver — Compatible with standard ball mounts and accessories",
      "No-Drill Bolt-On — Mounts to existing frame holes for clean installation",
      "Black Powder-Coat — A-coat rust-prevention primer plus carbide powder-coat"
    ],
    fitment: [
      "2019-2023 Ford Ranger (All Cab Configurations)"
    ],
    inStock: true, sku: "TH-RANG19-C417"
  },
  {
    id: "fd-7", slug: "1994-2004-ford-mustang-class-1-trailer-hitch-black",
    title: "1994-2004 Ford Mustang Class 1 Trailer Hitch - Black", price: 66.87,
    category: "ford-parts", make: "Ford", model: ["Mustang"], yearRange: "1994-2004",
    image: `${CDN}/LISTING_th-mus94-a041-ws-1.jpg?v=1773345373&width=800`,
    images: [`${CDN}/LISTING_th-mus94-a041-ws-1.jpg?v=1773345373&width=800`, `${CDN}/th-mus94-a041-1.jpg?v=1773345373&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", Finish: "Black Powder-Coat", "Tongue Weight": "200 lbs", "Gross Trailer Weight": "2000 lbs" },
    description: "Mount a bike rack, cargo carrier, or light trailer to your 1994-2004 Ford Mustang with this Class 1 trailer hitch. The 1.25-inch receiver sits discreetly beneath the rear bumper and supports up to 2,000 lbs of gross trailer weight. Black powder-coat finish matches your Mustang's sporty styling.",
    features: [
      "Class 1 Rating — 2,000 lb GTW for light-duty towing and accessories",
      "1.25-Inch Receiver — Perfect for bike racks and cargo carriers",
      "Low-Profile Design — Tucks neatly behind the rear bumper",
      "Black Powder-Coat — Matches the Mustang's sporty aesthetic",
      "Bolt-On Installation — No welding or frame modifications"
    ],
    fitment: [
      "1994-2004 Ford Mustang (V6 and GT, Coupe and Convertible)"
    ],
    inStock: false, sku: "TH-MUS94-A041"
  },
  {
    id: "fd-8", slug: "2000-2007-ford-focus-wagon-class-1-trailer-hitch-black-11296",
    title: "2000-2007 Ford Focus Wagon Class 1 Trailer Hitch - Black | 11296", price: 62.50,
    category: "ford-parts", make: "Ford", model: ["Focus"], yearRange: "2000-2007",
    image: `${CDN}/LISTING_th-foc005d-a296-ws-1.jpg?v=1773344411&width=800`,
    images: [`${CDN}/LISTING_th-foc005d-a296-ws-1.jpg?v=1773344411&width=800`, `${CDN}/th-foc005d-a296-1.jpg?v=1773344411&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", Finish: "Black Powder-Coat", "Part Number": "11296", "Tongue Weight": "200 lbs", "Gross Trailer Weight": "2000 lbs" },
    description: "Class 1 trailer hitch for the 2000-2007 Ford Focus Wagon. This compact hitch provides a 1.25-inch receiver for mounting bike racks, cargo carriers, or towing small utility trailers. The black powder-coat finish provides long-lasting corrosion protection.",
    features: [
      "Class 1 Hitch — Light-duty towing and accessory mounting",
      "1.25-Inch Receiver — Compatible with Class 1 accessories",
      "Wagon-Specific Fitment — Designed for the Focus Wagon body style",
      "Black Powder-Coat — Durable, corrosion-resistant finish",
      "Bolt-On Design — Installs with basic hand tools"
    ],
    fitment: [
      "2000-2007 Ford Focus Wagon (ZTW, ZXW)"
    ],
    inStock: true, sku: "TH-FOC005D-A296"
  },

  // ═══════════════════════════════════════════
  // BULL GUARDS
  // ═══════════════════════════════════════════
  {
    id: "bg-1", slug: "01-04-nissan-frontier-xterra-advanced-bull-guard-led-light-bar",
    title: "01-04 Nissan Frontier Xterra Advanced Bull Guard LED Light Bar", price: 131.14,
    category: "bull-guards", make: "Nissan", model: ["Frontier", "Xterra"], yearRange: "2001-2004",
    image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`,
    images: [`${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`, `${CDN}/bghd-al-mb-1_902d2c1c-a045-4335-ab0d-59da546085da.jpg?v=1773328302&width=800`],
    specs: { MPN: "P4S13009", Finish: "Matte Black", Includes: "Bull guard, built-in LED light bar, wiring switch", Material: "Heavy-Duty Steel", "Part Number": "BGHD-FRON00-AL-MB" },
    description: "Upgrade the front-end protection and style of your Nissan Frontier or Xterra with this Advanced Series Bull Guard featuring built-in LED light bar and switch. Finished in a sleek matte black coating, this bull guard delivers rugged off-road capability while enhancing your truck's aggressive appearance. Designed for a precise bolt-on fit, it provides reliable front-end defense against trail debris, brush, and minor impacts.",
    features: [
      "Built-in LED Light Bar — Included switch for enhanced nighttime visibility",
      "Durable Matte Black Powder-Coat — Resists corrosion and UV fading",
      "Heavy-Duty Steel Construction — Maximum front-end protection",
      "Advanced Series Design — Complements the factory styling of your Nissan",
      "Vehicle-Specific Bolt-On — No drilling or cutting required",
      "Protects Against Trail Hazards — Brush, debris, and minor impacts"
    ],
    fitment: [
      "2001-2004 Nissan Frontier (All Cab Configurations)",
      "2002-2004 Nissan Xterra"
    ],
    inStock: true, sku: "BGHD-AL-MB"
  },

  // ═══════════════════════════════════════════
  // DODGE / RAM PARTS
  // ═══════════════════════════════════════════
  {
    id: "dg-1", slug: "00-04-dodge-dakota-5-5-tonneau-cover-led-bed-light-kit-combo",
    title: "00-04 Dodge Dakota 5.5' Tonneau Cover & LED Bed Light Kit Combo", price: 87.07,
    category: "dodge-parts", make: "Dodge", model: ["Dakota"], yearRange: "2000-2004",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`],
    specs: { "Bed Size": "5.5 Ft (66\") Short Bed", "LED Count": "16 LEDs (8 pods, 2 LEDs per pod)", "LED Wattage": "1 Watt per LED", "LED Color": "White", "Power Source": "AA Batteries", "Part Number": "TC-DAK00-5.5-HSS+TBL-16W8P-01" },
    description: "Upgrade your 2000-2004 Dodge Dakota with this premium combo kit featuring a hidden snap soft roll-up vinyl tonneau cover paired with a powerful truck bed LED lighting system. This all-in-one package delivers weather protection for your cargo while illuminating your truck bed for easy nighttime loading and unloading. Designed specifically for the 5.5-foot short bed Dakota, this combo offers exceptional value and convenience.",
    features: [
      "Hidden Snap Soft Roll-Up Vinyl Cover — Sleek, streamlined look with no visible fasteners",
      "8-Pod LED Bed Light System — 16 bright white LEDs (2 per pod, 1 watt each)",
      "Battery-Powered LED Control Box — AA batteries, no hardwiring required",
      "Durable Vinyl Construction — Weather-resistant cargo protection",
      "Soft Roll-Up Design — Full bed access when needed",
      "No-Drill Hidden Snap Mounting — Easy installation preserves your truck bed"
    ],
    fitment: [
      "2000-2004 Dodge Dakota — Fleetside 5.5 Ft (66\") Short Bed models without Dodge Cargo Rail System only"
    ],
    inStock: true, sku: "TC-HSS-TBL-DAK00"
  },
  {
    id: "dg-2", slug: "00-04-dodge-dakota-roll-up-tonneau-cover-led-bed-light-kit-5-5",
    title: "00-04 Dodge Dakota Roll-Up Tonneau Cover & LED Bed Light Kit 5.5'", price: 99.74,
    category: "dodge-parts", make: "Dodge", model: ["Dakota"], yearRange: "2000-2004",
    image: `${CDN}/LISTING_tc-lru-ws-1_186c6227-4d9e-4991-be6d-4bc30e83781e.jpg?v=1773338753&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_186c6227-4d9e-4991-be6d-4bc30e83781e.jpg?v=1773338753&width=800`],
    specs: { "Bed Size": "5.5' (66\") Short Bed", "Cover Style": "Roll-Up", "Cover Material": "Vinyl", "LED Pods": "8 pods, 2 LEDs per pod (16 total)", "LED Wattage": "1 Watt per LED", "LED Color": "White", "Power Source": "AA Batteries", "Part Number": "TC-DAK00-5.5-LRU+TBL-16W8P-01" },
    description: "Transform your Dodge Dakota's truck bed with this premium combo package featuring a roll-up vinyl tonneau cover and an 8-pod LED bed lighting system. Designed specifically for the 2000-2004 Dodge Dakota Quad Cab with a 5.5' short bed, this kit delivers both security and visibility in one comprehensive solution. The tonneau cover keeps your cargo protected from the elements while the powerful LED lights illuminate your entire bed for easy loading and unloading day or night.",
    features: [
      "Roll-Up Vinyl Tonneau Cover — Weather-resistant cargo protection with full bed access",
      "8-Pod LED Lighting System — 16 bright white LEDs (2 per pod, 1 watt each)",
      "Convenient Control Box — Easy on/off LED light operation",
      "Battery-Powered LED System — AA batteries, no hardwiring required",
      "Durable Vinyl Construction — Long-lasting weather resistance",
      "Lock and Roll-Up Design — Quick, full bed access when needed"
    ],
    fitment: [
      "2000-2004 Dodge Dakota — Fleetside 5.5 Ft (66\") Short Bed models without Dodge Cargo Rail System only"
    ],
    inStock: true, sku: "TC-LRU-TBL-DAK00"
  },

  // ═══════════════════════════════════════════
  // ADDITIONAL TONNEAU - Silverado new gen
  // ═══════════════════════════════════════════
  {
    id: "tc-10", slug: "2019-chevy-silverado-gmc-sierra-1500-6-5-tonneau-cover-led-kit",
    title: "2019+ Chevy Silverado/GMC Sierra 1500 6.5' Tonneau Cover & LED Kit", price: 120.02,
    category: "tonneau", make: "Chevy", model: ["Silverado 1500"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-fru2_2btbl-16w8p-01-ws-1_5dbff481-2187-4ee9-b380-b69658fc6768.jpg?v=1773341723&width=800`,
    images: [`${CDN}/LISTING_tc-fru2_2btbl-16w8p-01-ws-1_5dbff481-2187-4ee9-b380-b69658fc6768.jpg?v=1773341723&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Flush Roll-Up", "LED Kit": "Included", Installation: "Clamp-On", "LED Pods": "8 pods, 16 LEDs" },
    description: "Flush roll-up tonneau cover with LED bed light kit for the 2019+ Chevy Silverado and GMC Sierra 1500 6.5' bed. The flush design sits level with the bed rails for a streamlined, factory-integrated appearance, while the included 8-pod LED kit adds practical lighting for nighttime loading.",
    features: [
      "Flush Roll-Up Design — Sits level with bed rails for a clean, aerodynamic profile",
      "8-Pod LED Bed Light Kit — 16 bright white LEDs for nighttime visibility",
      "Battery-Powered LEDs — No hardwiring needed",
      "Clamp-On Installation — Quick, no-drill mounting",
      "Weather-Resistant Vinyl — Keeps cargo dry and protected"
    ],
    fitment: [
      "2019-2025 Chevrolet Silverado 1500 (6.5' Bed)",
      "2019-2025 GMC Sierra 1500 (6.5' Bed)"
    ],
    inStock: true, sku: "TC-FRU2-SIL19-65"
  },
  {
    id: "tc-11", slug: "2019-chevy-silverado-gmc-sierra-1500-6-5-flush-roll-up-tonneau-cover",
    title: "2019+ Chevy Silverado/GMC Sierra 1500 6.5' Flush Roll-Up Tonneau Cover", price: 99.75,
    category: "tonneau", make: "Chevy", model: ["Silverado 1500"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-fru2-uni-ws-1_e7254a51-12d8-41b7-b9ce-9079a0f6477b.jpg?v=1773341689&width=800`,
    images: [`${CDN}/LISTING_tc-fru2-uni-ws-1_e7254a51-12d8-41b7-b9ce-9079a0f6477b.jpg?v=1773341689&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Flush Roll-Up", Installation: "Clamp-On", Material: "Vinyl" },
    description: "Clean, flush-mount roll-up tonneau cover for the 2019+ Silverado and Sierra 1500 with a 6.5' bed. The low-profile design creates a seamless appearance when closed, while the roll-up mechanism gives you instant full bed access. Affordable protection that installs in minutes.",
    features: [
      "Flush-Mount Profile — Sits level with bed rails for a factory look",
      "Roll-Up Mechanism — Quick full bed access when you need it",
      "Vinyl Construction — Durable, water-resistant material",
      "Clamp-On Rails — No-drill, no-tool installation",
      "Tension Control — Keeps the cover smooth and wrinkle-free"
    ],
    fitment: [
      "2019-2025 Chevrolet Silverado 1500 (6.5' Bed)",
      "2019-2025 GMC Sierra 1500 (6.5' Bed)"
    ],
    inStock: true, sku: "TC-FRU2-SIL19"
  },
  {
    id: "tc-12", slug: "2019-chevy-silverado-gmc-sierra-5-8ft-tri-fold-tonneau-cover-w-led",
    title: "2019+ Chevy Silverado GMC Sierra 5.8ft Tri-Fold Tonneau Cover w/ LED", price: 306.35,
    category: "tonneau", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_9776e136-90a1-42f6-858f-9b6d7e6a3545.jpg?v=1773341686&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_9776e136-90a1-42f6-858f-9b6d7e6a3545.jpg?v=1773341686&width=800`],
    specs: { "Bed Length": "5.8 ft", Type: "Hard Tri-Fold", "LED Kit": "Included", Material: "Aluminum", "LED Count": "16 LEDs (8 pods)" },
    description: "Premium hard tri-fold tonneau cover with LED bed light kit for the 2019+ Silverado and Sierra with the shorter 5.8ft bed (standard cab and double cab). Aluminum panel construction provides security and weather protection, with the bonus of an 8-pod LED lighting system for nighttime use.",
    features: [
      "Hard Tri-Fold Aluminum — Rigid panels for maximum cargo security",
      "8-Pod LED Light Kit — 16 bright white LEDs included",
      "5.8ft Short Bed Specific — Engineered for the shorter bed length",
      "Low-Profile Design — Factory-integrated appearance",
      "Weather-Sealed Edges — Perimeter seals keep water out",
      "Quick Three-Panel Folding — Flexible bed access options"
    ],
    fitment: [
      "2019-2025 Chevrolet Silverado 1500 (5.8' Bed)",
      "2019-2025 GMC Sierra 1500 (5.8' Bed)"
    ],
    inStock: true, sku: "TC-LTH-SIL19-58"
  },
  {
    id: "tc-13", slug: "2019-chevy-silverado-gmc-sierra-5-8ft-hard-tri-fold-tonneau-cover",
    title: "2019+ Chevy Silverado/GMC Sierra 5.8ft Hard Tri-Fold Tonneau Cover", price: 277.59,
    category: "tonneau", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_9a9e494e-e739-44f9-95b4-eb44926bdf13.jpg?v=1773341654&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_9a9e494e-e739-44f9-95b4-eb44926bdf13.jpg?v=1773341654&width=800`],
    specs: { "Bed Length": "5.8 ft", Type: "Hard Tri-Fold", Material: "Aluminum", Finish: "Textured Black" },
    description: "Hard tri-fold tonneau cover for the 2019+ Silverado and Sierra 5.8ft bed. Lightweight aluminum panels with a textured black finish provide excellent cargo protection without adding significant weight to your truck. The tri-fold design lets you access your bed in sections or remove the cover entirely.",
    features: [
      "Aluminum Tri-Fold Panels — Strong, lightweight construction",
      "Textured Black Finish — Scratch-resistant surface treatment",
      "5.8ft Bed Fitment — Purpose-built for the shorter bed option",
      "Three-Section Folding — Partial or full bed access",
      "Integrated Drain Channels — Directs water away from cargo"
    ],
    fitment: [
      "2019-2025 Chevrolet Silverado 1500 (5.8' Bed)",
      "2019-2025 GMC Sierra 1500 (5.8' Bed)"
    ],
    inStock: true, sku: "TC-LTH-SIL19-58B"
  },

  // ═══════════════════════════════════════════
  // HEADLIGHTS
  // ═══════════════════════════════════════════
  {
    id: "hl-1", slug: "01-03-honda-civic-crystal-headlights-sequential-led-bar-black",
    title: "01-03 Honda Civic Crystal Headlights Sequential LED Bar - Black", price: 84.04,
    category: "bull-guards", make: "Honda", model: ["Civic"], yearRange: "2001-2003",
    image: `${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`,
    images: [`${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`, `${CDN}/hlnb-civ01lsq-jdma-1.jpg?v=1773333056&width=800`],
    specs: { Type: "Crystal Headlights", "LED Bar": "Sequential Turn Signal", Finish: "Black Housing", "Bulb Type": "H1/H1", Lens: "Clear", Installation: "Direct Replacement" },
    description: "Transform the look of your 2001-2003 Honda Civic with these crystal headlights featuring a sequential LED light bar. The JDM-inspired design delivers a modern, aggressive look with sequential amber turn signals that sweep from inside to outside. Black housing with clear lens for maximum visibility and style. Direct replacement — plugs into factory wiring.",
    features: [
      "Sequential LED Turn Signal Bar — Sweeping amber animation for a modern, high-end look",
      "Crystal Clear Lens — Maximum light output and visibility",
      "Black Housing — Aggressive, JDM-inspired styling",
      "Direct OEM Replacement — Plugs into factory wiring and mounts without modification",
      "H1/H1 Bulb Compatible — Uses standard halogen bulbs (included)",
      "DOT/SAE Compliant — Legal for on-road use"
    ],
    fitment: [
      "2001-2003 Honda Civic (2-Door and 4-Door)"
    ],
    inStock: true, sku: "HLNB-CIV01LSQ-JDMA"
  },
];

// ═══════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export function getProductsByMake(make: string): Product[] {
  return products.filter((p) => p.make === make);
}
