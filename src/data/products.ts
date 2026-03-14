/**
 * SHOPIFY DATA MAPPING:
 * Products: Shopify Admin → Products
 * Collections: Shopify Admin → Collections
 * 
 * In Liquid:
 * - {{ product.title }}, {{ product.price | money }}, {{ product.images }}, etc.
 * - {{ collection.title }}, {{ collection.products }}, etc.
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
  features?: string[];
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
  // FRONT GRILLES (scraped from /collections/bull-guards-grille-guards)
  // ═══════════════════════════════════════════
  {
    id: "fg-1", slug: "2005-2009-ford-mustang-gt-honeycomb-mesh-front-grille-black",
    title: "2005-2009 Ford Mustang GT Honeycomb Mesh Front Grille - Black", price: 32.82,
    category: "grilles", make: "Ford", model: ["Mustang GT"], yearRange: "2005-2009",
    image: `${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800`,
    images: [`${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-1.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-2.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-3.jpg?v=1773332154&width=800`],
    specs: { MPN: "GRZH-MST-0509-GT-BK", Color: "Black", Style: "Honeycomb Mesh", "Fog Light Cutouts": "No", Condition: "New" },
    description: "Upgrade the front end of your 2005-2009 Ford Mustang GT with this sleek honeycomb mesh front grille in a bold black finish. Designed as a direct replacement for the factory grille.",
    features: ["Aggressive Honeycomb Mesh Design", "Sleek Black Finish", "Direct OEM Replacement", "Durable Construction", "Clean Logo-Free Design"],
    inStock: true, sku: "FG-ZH-MUS05GT-ME-BK"
  },
  {
    id: "fg-2", slug: "2022-2024-toyota-tundra-led-front-grille-lex-style-glossy-black",
    title: "2022-2024 Toyota Tundra LED Front Grille Lex Style - Glossy Black", price: 140.28,
    category: "grilles", make: "Toyota", model: ["Tundra"], yearRange: "2022-2024",
    image: `${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`,
    images: [`${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`, `${CDN}/fg-mesh-style-st-6_26f4ac9a-bee2-4fcb-8832-6d4c11709b14.jpg?v=1773332137&width=800`, `${CDN}/fg-tun22-bllb-bk-ks-st-1.jpg?v=1773332138&width=800`],
    specs: { Material: "ABS Composite", Finish: "Glossy Black", LEDs: "Integrated", Style: "Lex Style" },
    description: "Premium Lex-style front grille with integrated LED lights for the 2022-2024 Toyota Tundra.",
    inStock: true, sku: "FG-TUN22-BLLB-BK-KS"
  },
  {
    id: "fg-3", slug: "2022-2024-toyota-tundra-lex-style-abs-front-grille-glossy-black",
    title: "2022-2024 Toyota Tundra Lex Style ABS Front Grille - Glossy Black", price: 84.64,
    category: "grilles", make: "Toyota", model: ["Tundra"], yearRange: "2022-2024",
    image: `${CDN}/LISTING_fg-tun22-bl-bk-ks-ws-1.jpg?v=1773332126&width=800`,
    images: [`${CDN}/LISTING_fg-tun22-bl-bk-ks-ws-1.jpg?v=1773332126&width=800`, `${CDN}/fg-mesh-style-st-6.jpg?v=1773332126&width=800`],
    specs: { Material: "ABS Composite", Finish: "Glossy Black", Style: "Lex Style" },
    description: "Lex-style ABS front grille for 2022-2024 Toyota Tundra without LEDs.",
    inStock: true, sku: "FG-TUN22-BL-BK-KS"
  },
  {
    id: "fg-4", slug: "2004-2007-volkswagen-touareg-front-grille-black-torg-0206-bk",
    title: "2004-2007 Volkswagen Touareg Front Grille Black - TORG-0206-BK", price: 21.92,
    category: "grilles", make: "Volkswagen", model: ["Touareg"], yearRange: "2004-2007",
    image: `${CDN}/LISTING_fg-tor03-h-bk-ws-1.jpg?v=1773332101&width=800`,
    images: [`${CDN}/LISTING_fg-tor03-h-bk-ws-1.jpg?v=1773332101&width=800`, `${CDN}/fg-tor03-h-bk-1.jpg?v=1773332101&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Installation: "Direct Replacement" },
    description: "Direct replacement front grille for 2004-2007 Volkswagen Touareg.",
    inStock: true, sku: "TORG-0206-BK"
  },
  {
    id: "fg-5", slug: "2005-2011-toyota-tacoma-studded-mesh-rivet-style-front-grille-matte-black",
    title: "2005-2011 Toyota Tacoma Studded Mesh Rivet Style Front Grille - Matte Black", price: 42.87,
    category: "grilles", make: "Toyota", model: ["Tacoma"], yearRange: "2005-2011",
    image: `${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`,
    images: [`${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`, `${CDN}/fg-taco05-rvt-me-mb-1.jpg?v=1773332090&width=800`, `${CDN}/fg-taco05-rvt-me-mb-2.jpg?v=1773332090&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Studded Mesh Rivet" },
    description: "Aggressive studded mesh rivet-style grille for 2005-2011 Toyota Tacoma.",
    inStock: true, sku: "FG-TACO05-RVT-ME-MB"
  },
  {
    id: "fg-6", slug: "1999-2006-chevy-silverado-tahoe-suburban-front-grille-matte-black",
    title: "1999-2006 Chevy Silverado Tahoe Suburban Front Grille Matte Black", price: 32.11,
    category: "grilles", make: "Chevy", model: ["Silverado", "Tahoe", "Suburban"], yearRange: "1999-2006",
    image: `${CDN}/LISTING_fg-sil99-h-mb-ws-1.jpg?v=1773332075&width=800`,
    images: [`${CDN}/LISTING_fg-sil99-h-mb-ws-1.jpg?v=1773332075&width=800`, `${CDN}/fg-sil99-h-mb-1.jpg?v=1773332075&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Installation: "Direct Replacement" },
    description: "Direct replacement front grille for 1999-2006 Chevy Silverado, Tahoe, and Suburban.",
    inStock: true, sku: "FG-SIL99-H-MB"
  },
  {
    id: "fg-7", slug: "99-06-chevy-silverado-tahoe-suburban-black-horizontal-grille",
    title: "99-06 Chevy Silverado Tahoe Suburban Black Horizontal Grille", price: 33.90,
    category: "grilles", make: "Chevy", model: ["Silverado", "Tahoe", "Suburban"], yearRange: "1999-2006",
    image: `${CDN}/LISTING_fg-sil99-h-bk-ws-1.jpg?v=1773332063&width=800`,
    images: [`${CDN}/LISTING_fg-sil99-h-bk-ws-1.jpg?v=1773332063&width=800`, `${CDN}/fg-sil99-h-bk-1.jpg?v=1773332063&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Style: "Horizontal Bar" },
    description: "Horizontal bar-style front grille for 1999-2006 Chevy Silverado, Tahoe, and Suburban.",
    inStock: true, sku: "FG-SIL99-H-BK"
  },
  {
    id: "fg-8", slug: "2007-2010-chrysler-sebring-bentley-style-chrome-mesh-grille-abs",
    title: "2007-2010 Chrysler Sebring Bentley Style Chrome Mesh Grille - ABS", price: 42.33,
    category: "grilles", make: "Chrysler", model: ["Sebring"], yearRange: "2007-2010",
    image: `${CDN}/LISTING_fg-seb08-me-ch-ws-1.jpg?v=1773332048&width=800`,
    images: [`${CDN}/LISTING_fg-seb08-me-ch-ws-1.jpg?v=1773332048&width=800`, `${CDN}/fg-seb08-me-ch-1.jpg?v=1773332048&width=800`],
    specs: { Material: "ABS Composite", Finish: "Chrome", Style: "Bentley Mesh" },
    description: "Bentley-style chrome mesh grille for 2007-2010 Chrysler Sebring.",
    inStock: true, sku: "FG-SEB08-ME-CH"
  },
  {
    id: "fg-9", slug: "1994-2002-dodge-ram-1500-2500-3500-mesh-front-grille-matte-black",
    title: "1994-2002 Dodge Ram 1500 2500 3500 Mesh Front Grille Matte Black", price: 31.47,
    category: "grilles", make: "Dodge", model: ["Ram 1500", "Ram 2500", "Ram 3500"], yearRange: "1994-2002",
    image: `${CDN}/LISTING_fg-ram94-me-mb-ws-1.jpg?v=1773332038&width=800`,
    images: [`${CDN}/LISTING_fg-ram94-me-mb-ws-1.jpg?v=1773332038&width=800`, `${CDN}/fg-ram94-me-mb-1.jpg?v=1773332038&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Mesh" },
    description: "Mesh front grille in matte black for 1994-2002 Dodge Ram trucks.",
    inStock: true, sku: "FG-RAM94-ME-MB"
  },
  {
    id: "fg-10", slug: "1994-2002-dodge-ram-1500-2500-3500-mesh-front-grille-black",
    title: "1994-2002 Dodge Ram 1500 2500 3500 Mesh Front Grille - Black", price: 33.56,
    category: "grilles", make: "Dodge", model: ["Ram 1500", "Ram 2500", "Ram 3500"], yearRange: "1994-2002",
    image: `${CDN}/LISTING_fg-ram94-me-bk-ws-1.jpg?v=1773332021&width=800`,
    images: [`${CDN}/LISTING_fg-ram94-me-bk-ws-1.jpg?v=1773332021&width=800`, `${CDN}/fg-ram94-me-bk-1.jpg?v=1773332021&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Style: "Mesh" },
    description: "Black mesh front grille for 1994-2002 Dodge Ram 1500/2500/3500.",
    inStock: true, sku: "FG-RAM94-ME-BK"
  },
  {
    id: "fg-11", slug: "1994-2002-dodge-ram-1500-2500-3500-horizontal-front-grille-matte-black",
    title: "1994-2002 Dodge Ram 1500 2500 3500 Horizontal Front Grille Matte Black", price: 33.05,
    category: "grilles", make: "Dodge", model: ["Ram 1500", "Ram 2500", "Ram 3500"], yearRange: "1994-2002",
    image: `${CDN}/LISTING_fg-ram94-h-mb-ws-1.jpg?v=1773332011&width=800`,
    images: [`${CDN}/LISTING_fg-ram94-h-mb-ws-1.jpg?v=1773332011&width=800`, `${CDN}/fg-ram94-h-mb-1.jpg?v=1773332011&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Horizontal Bar" },
    description: "Horizontal bar-style matte black front grille for 1994-2002 Dodge Ram trucks.",
    inStock: true, sku: "FG-RAM94-H-MB"
  },
  {
    id: "fg-12", slug: "2013-2024-ram-1500-oem-mesh-style-front-grille-black",
    title: "2013-2024 Ram 1500 OEM Mesh Style Front Grille - Black", price: 62.58,
    category: "grilles", make: "Dodge", model: ["Ram 1500"], yearRange: "2013-2024",
    image: `${CDN}/LISTING_fg-ram14oe-me-bk-ws-1.jpg?v=1773331978&width=800`,
    images: [`${CDN}/LISTING_fg-ram14oe-me-bk-ws-1.jpg?v=1773331978&width=800`, `${CDN}/fg-ram14oe-me-bk-1.jpg?v=1773331978&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Style: "OEM Mesh" },
    description: "OEM mesh-style front grille for 2013-2024 Ram 1500.",
    inStock: false, sku: "FG-RAM14OE-ME-BK"
  },
  {
    id: "fg-13", slug: "2013-2022-ram-1500-honeycomb-rebel-style-front-grille-matte-black",
    title: "2013-2022 Ram 1500 Honeycomb Rebel Style Front Grille - Matte Black", price: 88.75,
    category: "grilles", make: "Dodge", model: ["Ram 1500"], yearRange: "2013-2022",
    image: `${CDN}/LISTING_fg-ram131500-rb-mb-ws-1.jpg?v=1773331962&width=800`,
    images: [`${CDN}/LISTING_fg-ram131500-rb-mb-ws-1.jpg?v=1773331962&width=800`, `${CDN}/fg-ram131500-rb-mb-1.jpg?v=1773331962&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Style: "Honeycomb Rebel" },
    description: "Honeycomb Rebel-style front grille for 2013-2022 Ram 1500.",
    inStock: true, sku: "FG-RAM131500-RB-MB"
  },

  // ═══════════════════════════════════════════
  // CHASE RACK / SPORT BAR (scraped from /collections/chase-rack-sport-bar)
  // ═══════════════════════════════════════════
  {
    id: "cr-1", slug: "universal-chase-rack-tire-carrier-matte-black-finish",
    title: "Universal Full Size Chase Rack Tire Carrier - Matte Black", price: 64.82,
    category: "chase-rack", make: "Universal", model: ["Full Size Trucks"], yearRange: "Universal",
    image: `${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-2_4443dc5c-2a42-40b7-867f-7d9d7477a259.jpg?v=1773329905&width=800`,
    images: [`${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-2_4443dc5c-2a42-40b7-867f-7d9d7477a259.jpg?v=1773329905&width=800`, `${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-3_909c71d1-7a6b-41a2-b0b0-fca8e2c10833.jpg?v=1773329905&width=800`, `${CDN}/crjz-tr-4000fs-ar-mb_crjz-tire-fs-mb-4_93b17786-70cb-4fe3-b12e-3016453337b9.jpg?v=1773329905&width=800`],
    specs: { Fitment: "Universal Full Size", Finish: "Matte Black", Material: "Heavy-Duty Steel" },
    description: "Universal full-size chase rack tire carrier in matte black. Fits most full-size truck beds.",
    inStock: true, sku: "CRJZ-TR-4000FS-AR-MB"
  },
  {
    id: "cr-2", slug: "stehlen-razor-3000-universal-chase-rack-w-led-lights-texture-black",
    title: "Stehlen Razor 3000 Universal Chase Rack w/LED Lights - Texture Black", price: 221.47,
    category: "chase-rack", make: "Universal", model: ["Full Size Trucks"], yearRange: "Universal",
    image: `${CDN}/LISTING_crjz-raz-3000-st-tb-ws-1.jpg?v=1773329888&width=800`,
    images: [`${CDN}/LISTING_crjz-raz-3000-st-tb-ws-1.jpg?v=1773329888&width=800`, `${CDN}/crjz-raz-3000-st-tb-2.jpg?v=1772182951&width=800`, `${CDN}/crjz-raz-3000-st-tb-3.jpg?v=1772182951&width=800`],
    specs: { Fitment: "Universal Full Size", Finish: "Texture Black", LEDs: "Included", Material: "Heavy-Duty Steel" },
    description: "Stehlen Razor 3000 universal chase rack with integrated LED lights in texture black finish.",
    inStock: true, sku: "CRJZ-RAZ-3000-ST-TB"
  },
  {
    id: "cr-3", slug: "stehlen-razor-1000-universal-chase-rack-w-led-lights-matte-black",
    title: "Stehlen Razor 1000 Universal Chase Rack w/ LED Lights - Matte Black", price: 161.77,
    category: "chase-rack", make: "Universal", model: ["Full Size Trucks"], yearRange: "Universal",
    image: `${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773329881&width=800`,
    images: [`${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773329881&width=800`, `${CDN}/crjz-raz-1000-st-mb-2.jpg?v=1772182967&width=800`, `${CDN}/crjz-raz-1000-st-mb-3.jpg?v=1772182967&width=800`],
    specs: { Fitment: "Universal Full Size", Finish: "Matte Black", LEDs: "Included", Material: "Heavy-Duty Steel" },
    description: "Stehlen Razor 1000 universal chase rack with LED lights in matte black.",
    inStock: false, sku: "CRJZ-RAZ-1000-ST-MB"
  },

  // ═══════════════════════════════════════════
  // TONNEAU COVERS (scraped from /collections/tonneau-covers)
  // ═══════════════════════════════════════════
  {
    id: "tc-1", slug: "2022-2025-toyota-tundra-5-5-bed-tonneau-cover-led-light-kit",
    title: "2022-2025 Toyota Tundra 5.5' Bed Tonneau Cover & LED Light Kit", price: 301.92,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2022-2025",
    image: `${CDN}/LISTING_tc-lth_2btbl-16w8p-01-ws-2_a9465d73-f185-4ae9-8440-381b63cd3658.jpg?v=1773343109&width=800`,
    images: [`${CDN}/LISTING_tc-lth_2btbl-16w8p-01-ws-2_a9465d73-f185-4ae9-8440-381b63cd3658.jpg?v=1773343109&width=800`, `${CDN}/tbl-16w8p-03_6ebba15c-789a-461f-b4b5-c939e94fb066.jpg?v=1773343109&width=800`],
    specs: { "Bed Length": "5.5 ft", Type: "Hard Tri-Fold", "LED Kit": "Included", Material: "Aluminum" },
    description: "Premium hard tri-fold tonneau cover with LED bed light kit for 2022-2025 Toyota Tundra.",
    inStock: true, sku: "TC-LTH-TBL-TUN22-55"
  },
  {
    id: "tc-2", slug: "2014-2021-toyota-tundra-6-5-soft-tri-fold-tonneau-cover-w-led-lights",
    title: "2014-2021 Toyota Tundra 6.5' Soft Tri-Fold Tonneau Cover w/ LED Lights", price: 123.88,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-tfs-ws-1_d4293ec4-1b41-4d5d-baec-95ed2aedeaa8.jpg?v=1773343096&width=800`,
    images: [`${CDN}/LISTING_tc-tfs-ws-1_d4293ec4-1b41-4d5d-baec-95ed2aedeaa8.jpg?v=1773343096&width=800`, `${CDN}/tbl-16w8p-03_34fbe51a-3a99-4d39-8d1b-900eb879296c.jpg?v=1773343096&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Soft Tri-Fold", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Soft tri-fold tonneau cover with LED bed light kit for 2014-2021 Toyota Tundra 6.5' bed.",
    inStock: true, sku: "TC-TFS-TBL-TUN14-65"
  },
  {
    id: "tc-3", slug: "2014-2021-toyota-tundra-6-5-bed-soft-tri-fold-tonneau-cover",
    title: "2014-2021 Toyota Tundra 6.5' Bed Soft Tri-Fold Tonneau Cover", price: 103.61,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-tfs-ws-1_fb887556-d2a5-471a-96fc-010041a2e47d.jpg?v=1773343065&width=800`,
    images: [`${CDN}/LISTING_tc-tfs-ws-1_fb887556-d2a5-471a-96fc-010041a2e47d.jpg?v=1773343065&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Soft Tri-Fold", Installation: "Clamp-On" },
    description: "Soft tri-fold tonneau cover for 2014-2021 Toyota Tundra 6.5' bed.",
    inStock: true, sku: "TC-TFS-TUN14-65"
  },
  {
    id: "tc-4", slug: "2014-toyota-tundra-6-5-bed-low-profile-hard-tri-fold-tonneau-cover-w-led",
    title: "2014+ Toyota Tundra 6.5' Bed Low Profile Hard Tri-Fold Tonneau Cover w/ LED", price: 305.20,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_ca550746-3098-47df-8ff7-f7a24fa0dfea.jpg?v=1773343059&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_ca550746-3098-47df-8ff7-f7a24fa0dfea.jpg?v=1773343059&width=800`, `${CDN}/tbl-16w8p-03_684e8a5e-fbcb-4f02-beba-5b8f9c941c90.jpg?v=1773343059&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold Low Profile", "LED Kit": "Included", Material: "Aluminum" },
    description: "Low-profile hard tri-fold tonneau cover with LED lights for 2014+ Toyota Tundra 6.5' bed.",
    inStock: true, sku: "TC-LTH-TBL-TUN14-65"
  },
  {
    id: "tc-5", slug: "2014-toyota-tundra-6-5ft-bed-hard-tri-fold-tonneau-cover-243365",
    title: "2014+ Toyota Tundra 6.5ft Bed Hard Tri-Fold Tonneau Cover - 243365", price: 284.93,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_de4090d0-ab43-4c57-8671-4bb9a29d9a57.jpg?v=1773343030&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_de4090d0-ab43-4c57-8671-4bb9a29d9a57.jpg?v=1773343030&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold", Material: "Aluminum", "Part Number": "243365" },
    description: "Hard tri-fold tonneau cover for 2014+ Toyota Tundra 6.5ft bed.",
    inStock: true, sku: "TC-LTH-TUN14-65"
  },
  {
    id: "tc-6", slug: "2014-2021-toyota-tundra-6-5-roll-up-tonneau-cover-w-led-lights",
    title: "2014-2021 Toyota Tundra 6.5' Roll-Up Tonneau Cover w/ LED Lights", price: 102.46,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-lru-ws-1_8ca6684b-3dc5-49f2-a20b-4724d27575a5.jpg?v=1773343028&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_8ca6684b-3dc5-49f2-a20b-4724d27575a5.jpg?v=1773343028&width=800`, `${CDN}/tbl-16w8p-03_952644ac-9a5e-4a80-b833-218a32a3396f.jpg?v=1773343028&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover with LED bed light kit for 2014-2021 Toyota Tundra.",
    inStock: true, sku: "TC-LRU-TBL-TUN14-65"
  },
  {
    id: "tc-7", slug: "2014-2021-toyota-tundra-6-5-bed-roll-up-tonneau-cover-503365",
    title: "2014-2021 Toyota Tundra 6.5' Bed Roll-Up Tonneau Cover - 503365", price: 82.19,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-lru-ws-1_33688960-39ea-4601-ae5b-97e63c378ba5.jpg?v=1773343000&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_33688960-39ea-4601-ae5b-97e63c378ba5.jpg?v=1773343000&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", Installation: "Clamp-On", "Part Number": "503365" },
    description: "Roll-up tonneau cover for 2014-2021 Toyota Tundra 6.5' bed.",
    inStock: true, sku: "TC-LRU-TUN14-65"
  },
  {
    id: "tc-8", slug: "2014-2021-toyota-tundra-6-5-tonneau-cover-w-led-bed-lights",
    title: "2014-2021 Toyota Tundra 6.5' Tonneau Cover w/ LED Bed Lights", price: 88.31,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_72c1cba0-bb15-48b2-9c8e-1ff2353732f4.jpg?v=1773342996&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_72c1cba0-bb15-48b2-9c8e-1ff2353732f4.jpg?v=1773342996&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Snap-On", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Tonneau cover with LED bed lights for 2014-2021 Toyota Tundra 6.5' bed.",
    inStock: true, sku: "TC-HSS-TBL-TUN14-65"
  },
  {
    id: "tc-9", slug: "2014-2021-toyota-tundra-6-5-bed-soft-roll-up-tonneau-cover",
    title: "2014-2021 Toyota Tundra 6.5' Bed Soft Roll-Up Tonneau Cover", price: 68.04,
    category: "tonneau", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_tc-hss-ws-1_8b1d5c7e-444d-4b30-8abb-991352680ada.jpg?v=1773342966&width=800`,
    images: [`${CDN}/LISTING_tc-hss-ws-1_8b1d5c7e-444d-4b30-8abb-991352680ada.jpg?v=1773342966&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Soft Roll-Up", Installation: "Clamp-On" },
    description: "Soft roll-up tonneau cover for 2014-2021 Toyota Tundra 6.5' bed.",
    inStock: true, sku: "TC-HSS-TUN14-65"
  },

  // ═══════════════════════════════════════════
  // CHEVY PARTS (scraped from /collections/chevy-parts)
  // ═══════════════════════════════════════════
  {
    id: "ch-1", slug: "2005-2006-chevy-equinox-pontiac-torrent-trailer-wiring-harness",
    title: "2005-2006 Chevy Equinox & Pontiac Torrent Trailer Wiring Harness", price: 13.49,
    category: "chevy-parts", make: "Chevy", model: ["Equinox"], yearRange: "2005-2006",
    image: `${CDN}/LISTING_thw-equi05-ee560-ws-1.jpg?v=1773346836&width=800`,
    images: [`${CDN}/LISTING_thw-equi05-ee560-ws-1.jpg?v=1773346836&width=800`, `${CDN}/thw-equi05-ee560-2_381ccd1e-c372-4d57-958c-08906e613586.jpg?v=1773346836&width=800`],
    specs: { Type: "Trailer Wiring Harness", Connector: "4-Way Flat", Installation: "Plug-In" },
    description: "Trailer wiring harness for 2005-2006 Chevy Equinox and Pontiac Torrent.",
    inStock: true, sku: "THW-EQUI05-EE560"
  },
  {
    id: "ch-2", slug: "2005-2006-chevy-equinox-class-3-trailer-hitch-wiring-combo",
    title: "2005-2006 Chevy Equinox Class 3 Trailer Hitch & Wiring Combo", price: 89.88,
    category: "chevy-parts", make: "Chevy", model: ["Equinox"], yearRange: "2005-2006",
    image: `${CDN}/LISTING_th-equi05-c591_2bthw-equi05-ee560-ws-1.jpg?v=1773343997&width=800`,
    images: [`${CDN}/LISTING_th-equi05-c591_2bthw-equi05-ee560-ws-1.jpg?v=1773343997&width=800`, `${CDN}/th-equi05-c591_2bthw-equi05-ee560-wst.jpg?v=1773343997&width=800`],
    specs: { Class: "Class 3", Type: "Hitch + Wiring Combo", "Receiver Size": "2 inch", Installation: "Bolt-On" },
    description: "Class 3 trailer hitch with wiring combo for 2005-2006 Chevy Equinox.",
    inStock: true, sku: "TH-EQUI05-C591-COMBO"
  },
  {
    id: "ch-3", slug: "2004-2011-chevrolet-cobalt-hhr-trailer-hitch-class-1",
    title: "2004-2011 Chevy Cobalt HHR Pontiac G5 Class 1 Trailer Hitch", price: 70.01,
    category: "chevy-parts", make: "Chevy", model: ["Cobalt", "HHR"], yearRange: "2004-2011",
    image: `${CDN}/LISTING_th-cob05-a447-ws-1.jpg?v=1773343517&width=800`,
    images: [`${CDN}/LISTING_th-cob05-a447-ws-1.jpg?v=1773343517&width=800`, `${CDN}/th-cob05-a447-1.jpg?v=1773343518&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", "Tongue Weight": "200 lbs", "Gross Trailer Weight": "2000 lbs" },
    description: "Class 1 trailer hitch for 2004-2011 Chevy Cobalt, HHR, and Pontiac G5.",
    inStock: true, sku: "TH-COB05-A447"
  },
  {
    id: "ch-4", slug: "1995-2005-chevrolet-cavalier-pontiac-sunfire-class-1-trailer-hitch",
    title: "1995-2005 Chevy Cavalier Pontiac Sunfire Class 1 Trailer Hitch", price: 67.54,
    category: "chevy-parts", make: "Chevy", model: ["Cavalier"], yearRange: "1995-2005",
    image: `${CDN}/LISTING_th-cav95-a109-ws-1_6aa00b0a-55a1-4ce1-89e6-44c53cec6395.jpg?v=1773343497&width=800`,
    images: [`${CDN}/LISTING_th-cav95-a109-ws-1_6aa00b0a-55a1-4ce1-89e6-44c53cec6395.jpg?v=1773343497&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", "Tongue Weight": "200 lbs", "Gross Trailer Weight": "2000 lbs" },
    description: "Class 1 trailer hitch for 1995-2005 Chevy Cavalier and Pontiac Sunfire.",
    inStock: true, sku: "TH-CAV95-A109"
  },
  {
    id: "ch-5", slug: "2008-2017-buick-enclave-chevy-traverse-class-3-hitch-kit-curt",
    title: "2008-2017 Buick Enclave Chevy Traverse Class 3 Hitch Kit - CURT", price: 91.59,
    category: "chevy-parts", make: "Chevy", model: ["Traverse"], yearRange: "2008-2017",
    image: `${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`, `${CDN}/th-acad07-c424_2bth-bmount-l2-1.jpg?v=1773343164&width=800`],
    specs: { Class: "Class 3", Type: "Hitch + Ball Mount Kit", "Receiver Size": "2 inch", Brand: "CURT" },
    description: "Class 3 hitch kit with ball mount for 2008-2017 Buick Enclave and Chevy Traverse.",
    inStock: true, sku: "TH-ACAD07-C424-KIT"
  },
  {
    id: "ch-6", slug: "2008-2017-buick-enclave-chevrolet-traverse-class-3-trailer-hitch",
    title: "2008-2017 Buick Enclave Chevy Traverse Class 3 Trailer Hitch", price: 72.39,
    category: "chevy-parts", make: "Chevy", model: ["Traverse"], yearRange: "2008-2017",
    image: `${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`, `${CDN}/th-acad07-c424-1.jpg?v=1773343153&width=800`],
    specs: { Class: "Class 3", "Receiver Size": "2 inch", "Tongue Weight": "525 lbs", "Gross Trailer Weight": "3500 lbs" },
    description: "Class 3 trailer hitch for 2008-2017 Buick Enclave and Chevy Traverse.",
    inStock: true, sku: "TH-ACAD07-C424"
  },
  {
    id: "ch-7", slug: "99-07-chevy-silverado-gmc-sierra-6-5-roll-up-tonneau-cover-w-led",
    title: "99-07 Chevy Silverado GMC Sierra 6.5' Roll Up Tonneau Cover w/ LED", price: 100.53,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "1999-2007",
    image: `${CDN}/LISTING_tc-lru_2btbl-16w8p-01-ws-1_2b9a03c1-67b6-4e06-8852-a9ae0f256478.jpg?v=1773341793&width=800`,
    images: [`${CDN}/LISTING_tc-lru_2btbl-16w8p-01-ws-1_2b9a03c1-67b6-4e06-8852-a9ae0f256478.jpg?v=1773341793&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover with LED bed light kit for 1999-2007 Chevy Silverado / GMC Sierra.",
    inStock: true, sku: "TC-LRU-SIL99-65"
  },
  {
    id: "ch-8", slug: "99-07-chevy-silverado-gmc-sierra-6-5-roll-up-tonneau-cover",
    title: "99-07 Chevy Silverado GMC Sierra 6.5' Roll Up Tonneau Cover", price: 80.26,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "1999-2007",
    image: `${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover for 1999-2007 Chevy Silverado / GMC Sierra 6.5' bed.",
    inStock: true, sku: "TC-LRU-SIL99"
  },
  {
    id: "ch-9", slug: "2019-chevy-silverado-gmc-sierra-6-5-tri-fold-tonneau-cover-w-led",
    title: "2019+ Chevy Silverado GMC Sierra 6.5' Tri-Fold Tonneau Cover w/ LED", price: 297.86,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_1c0fa165-1448-4b8a-86d1-707455db8956.jpg?v=1773341758&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_1c0fa165-1448-4b8a-86d1-707455db8956.jpg?v=1773341758&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold", "LED Kit": "Included", Material: "Aluminum" },
    description: "Hard tri-fold tonneau cover with LED for 2019+ Chevy Silverado / GMC Sierra 6.5' bed.",
    inStock: true, sku: "TC-LTH-SIL19-65"
  },
  {
    id: "ch-10", slug: "2019-chevy-silverado-gmc-sierra-6-5ft-hard-tri-fold-tonneau-cover",
    title: "2019+ Chevy Silverado/GMC Sierra 6.5ft Hard Tri-Fold Tonneau Cover", price: 277.59,
    category: "chevy-parts", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_40fe2199-91c3-4325-8420-c8bddf7aed52.jpg?v=1773341724&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_40fe2199-91c3-4325-8420-c8bddf7aed52.jpg?v=1773341724&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Hard Tri-Fold", Material: "Aluminum" },
    description: "Hard tri-fold tonneau cover for 2019+ Chevy Silverado / GMC Sierra 6.5ft bed.",
    inStock: true, sku: "TC-LTH-SIL19"
  },

  // ═══════════════════════════════════════════
  // FORD PARTS (scraped from /collections/ford-parts)
  // ═══════════════════════════════════════════
  {
    id: "fd-1", slug: "2015-2023-ford-f-150-f-250-f-350-underseat-storage-organizer-box",
    title: "2015-2023 Ford F-150 F-250 F-350 Underseat Storage Organizer Box", price: 68.15,
    category: "ford-parts", make: "Ford", model: ["F-150", "F-250", "F-350"], yearRange: "2015-2023",
    image: `${CDN}/LISTING_uss-f15015cc-bk-t-g.jpg?v=1773347272&width=800`,
    images: [`${CDN}/LISTING_uss-f15015cc-bk-t-g.jpg?v=1773347272&width=800`, `${CDN}/uss-f15015cc-bk-1.jpg?v=1773347272&width=800`, `${CDN}/uss-f15015cc-bk-3.jpg?v=1773347272&width=800`],
    specs: { Fitment: "Crew Cab", Material: "Heavy-Duty Polymer", Color: "Black", Installation: "Slide-In" },
    description: "Underseat storage organizer box for 2015-2023 Ford F-150/F-250/F-350 Crew Cab.",
    inStock: true, sku: "USS-F15015CC-BK"
  },
  {
    id: "fd-2", slug: "1986-1992-ford-ranger-trailer-wiring-harness-t-connector-55314",
    title: "1986-1992 Ford Ranger Trailer Wiring Harness T-Connector - 55314", price: 8.71,
    category: "ford-parts", make: "Ford", model: ["Ranger"], yearRange: "1986-1992",
    image: `${CDN}/LISTING_thw-rang86-4w-ef314-0.jpg?v=1773347007&width=800`,
    images: [`${CDN}/LISTING_thw-rang86-4w-ef314-0.jpg?v=1773347007&width=800`, `${CDN}/thw-rang86-4w-ef314-2.jpg?v=1773347007&width=800`],
    specs: { Type: "T-Connector", Connector: "4-Way Flat", Installation: "Plug-In" },
    description: "Trailer wiring harness T-connector for 1986-1992 Ford Ranger.",
    inStock: true, sku: "THW-RANG86-4W-EF314"
  },
  {
    id: "fd-3", slug: "2013-2016-ford-escape-trailer-wiring-harness-4-way-t-connector",
    title: "2013-2016 Ford Escape Trailer Wiring Harness 4-Way T-Connector", price: 23.63,
    category: "ford-parts", make: "Ford", model: ["Escape"], yearRange: "2013-2016",
    image: `${CDN}/LISTING_thw-escp13-4w-ef164-t-2.jpg?v=1773346861&width=800`,
    images: [`${CDN}/LISTING_thw-escp13-4w-ef164-t-2.jpg?v=1773346861&width=800`, `${CDN}/thw-escp13-4w-ef164-2.jpg?v=1773346861&width=800`],
    specs: { Type: "T-Connector", Connector: "4-Way Flat", Installation: "Plug-In" },
    description: "4-way T-connector trailer wiring harness for 2013-2016 Ford Escape.",
    inStock: true, sku: "THW-ESCP13-4W-EF164"
  },
  {
    id: "fd-4", slug: "2015-2021-ford-transit-150-250-350-class-3-hitch-ball-mount-kit",
    title: "2015-2021 Ford Transit 150/250/350 Class 3 Hitch & Ball Mount Kit", price: 84.96,
    category: "ford-parts", make: "Ford", model: ["Transit"], yearRange: "2015-2021",
    image: `${CDN}/LISTING_th-tran15-c193_2bth-bmount-l2-ws-1.jpg?v=1773346714&width=800`,
    images: [`${CDN}/LISTING_th-tran15-c193_2bth-bmount-l2-ws-1.jpg?v=1773346714&width=800`, `${CDN}/th-bmount-l2-1_d3e7defe-de1a-4af1-be57-e276fd408095.jpg?v=1773346714&width=800`],
    specs: { Class: "Class 3", Type: "Hitch + Ball Mount", "Receiver Size": "2 inch", Installation: "Bolt-On" },
    description: "Class 3 hitch with ball mount kit for 2015-2021 Ford Transit 150/250/350.",
    inStock: true, sku: "TH-TRAN15-C193-KIT"
  },
  {
    id: "fd-5", slug: "2015-2021-ford-transit-150-250-350-class-3-trailer-hitch-13193",
    title: "2015-2021 Ford Transit 150/250/350 Class 3 Trailer Hitch - 13193", price: 65.75,
    category: "ford-parts", make: "Ford", model: ["Transit"], yearRange: "2015-2021",
    image: `${CDN}/LISTING_th-tran15-c193-ws-1.jpg?v=1773346685&width=800`,
    images: [`${CDN}/LISTING_th-tran15-c193-ws-1.jpg?v=1773346685&width=800`, `${CDN}/th-tran15-c193-2.jpg?v=1773346685&width=800`],
    specs: { Class: "Class 3", "Receiver Size": "2 inch", "Tongue Weight": "525 lbs", "Gross Trailer Weight": "3500 lbs" },
    description: "Class 3 trailer hitch for 2015-2021 Ford Transit 150/250/350.",
    inStock: true, sku: "TH-TRAN15-C193"
  },
  {
    id: "fd-6", slug: "2019-2023-ford-ranger-class-3-trailer-hitch-2-receiver-curt-13417",
    title: "2019-2023 Ford Ranger Class 3 Trailer Hitch 2\" Receiver - CURT 13417", price: 70.72,
    category: "ford-parts", make: "Ford", model: ["Ranger"], yearRange: "2019-2023",
    image: `${CDN}/LISTING_th-rang19-c417-ws-1.jpg?v=1773345801&width=800`,
    images: [`${CDN}/LISTING_th-rang19-c417-ws-1.jpg?v=1773345801&width=800`, `${CDN}/th-class-3-2_09934db1-c6f7-44eb-b77f-7f41d70ac20a.jpg?v=1773345801&width=800`],
    specs: { Class: "Class 3", "Receiver Size": "2 inch", Brand: "CURT", "Part Number": "13417" },
    description: "CURT Class 3 trailer hitch with 2\" receiver for 2019-2023 Ford Ranger.",
    inStock: true, sku: "TH-RANG19-C417"
  },
  {
    id: "fd-7", slug: "1994-2004-ford-mustang-class-1-trailer-hitch-black",
    title: "1994-2004 Ford Mustang Class 1 Trailer Hitch - Black", price: 66.87,
    category: "ford-parts", make: "Ford", model: ["Mustang"], yearRange: "1994-2004",
    image: `${CDN}/LISTING_th-mus94-a041-ws-1.jpg?v=1773345373&width=800`,
    images: [`${CDN}/LISTING_th-mus94-a041-ws-1.jpg?v=1773345373&width=800`, `${CDN}/th-mus94-a041-1.jpg?v=1773345373&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", Finish: "Black" },
    description: "Class 1 trailer hitch in black for 1994-2004 Ford Mustang.",
    inStock: false, sku: "TH-MUS94-A041"
  },
  {
    id: "fd-8", slug: "2000-2007-ford-focus-wagon-class-1-trailer-hitch-black-11296",
    title: "2000-2007 Ford Focus Wagon Class 1 Trailer Hitch - Black | 11296", price: 62.50,
    category: "ford-parts", make: "Ford", model: ["Focus"], yearRange: "2000-2007",
    image: `${CDN}/LISTING_th-foc005d-a296-ws-1.jpg?v=1773344411&width=800`,
    images: [`${CDN}/LISTING_th-foc005d-a296-ws-1.jpg?v=1773344411&width=800`, `${CDN}/th-foc005d-a296-1.jpg?v=1773344411&width=800`],
    specs: { Class: "Class 1", "Receiver Size": "1.25 inch", Finish: "Black", "Part Number": "11296" },
    description: "Class 1 trailer hitch for 2000-2007 Ford Focus Wagon.",
    inStock: true, sku: "TH-FOC005D-A296"
  },

  // ═══════════════════════════════════════════
  // BULL GUARDS (additional from /collections/bull-guards-grille-guards)
  // ═══════════════════════════════════════════
  {
    id: "bg-1", slug: "01-04-nissan-frontier-xterra-advanced-bull-guard-led-light-bar",
    title: "01-04 Nissan Frontier Xterra Advanced Bull Guard LED Light Bar", price: 131.14,
    category: "bull-guards", make: "Nissan", model: ["Frontier", "Xterra"], yearRange: "2001-2004",
    image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`,
    images: [`${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`, `${CDN}/bghd-al-mb-1_902d2c1c-a045-4335-ab0d-59da546085da.jpg?v=1773328302&width=800`],
    specs: { Material: "Heavy-Duty Steel", Finish: "Matte Black", "LED Bar": "Included", Installation: "Bolt-On", Weight: "45 lbs" },
    description: "Advanced bull guard with integrated LED light bar for 2001-2004 Nissan Frontier and Xterra.",
    features: ["Heavy-Duty Steel Construction", "Integrated LED Light Bar", "Matte Black Powder-Coat Finish", "Bolt-On Installation"],
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
    specs: { "Bed Length": "5.5 ft", Type: "Tri-Fold", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Tonneau cover and LED bed light kit combo for 2000-2004 Dodge Dakota 5.5' bed.",
    inStock: true, sku: "TC-HSS-TBL-DAK00"
  },
  {
    id: "dg-2", slug: "00-04-dodge-dakota-roll-up-tonneau-cover-led-bed-light-kit-5-5",
    title: "00-04 Dodge Dakota Roll-Up Tonneau Cover & LED Bed Light Kit 5.5'", price: 99.74,
    category: "dodge-parts", make: "Dodge", model: ["Dakota"], yearRange: "2000-2004",
    image: `${CDN}/LISTING_tc-lru-ws-1_186c6227-4d9e-4991-be6d-4bc30e83781e.jpg?v=1773338753&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_186c6227-4d9e-4991-be6d-4bc30e83781e.jpg?v=1773338753&width=800`],
    specs: { "Bed Length": "5.5 ft", Type: "Roll-Up", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover and LED bed light kit for 2000-2004 Dodge Dakota.",
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
    specs: { "Bed Length": "6.5 ft", Type: "Flush Roll-Up", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Flush roll-up tonneau cover with LED kit for 2019+ Silverado/Sierra 1500 6.5' bed.",
    inStock: true, sku: "TC-FRU2-SIL19-65"
  },
  {
    id: "tc-11", slug: "2019-chevy-silverado-gmc-sierra-1500-6-5-flush-roll-up-tonneau-cover",
    title: "2019+ Chevy Silverado/GMC Sierra 1500 6.5' Flush Roll-Up Tonneau Cover", price: 99.75,
    category: "tonneau", make: "Chevy", model: ["Silverado 1500"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-fru2-uni-ws-1_e7254a51-12d8-41b7-b9ce-9079a0f6477b.jpg?v=1773341689&width=800`,
    images: [`${CDN}/LISTING_tc-fru2-uni-ws-1_e7254a51-12d8-41b7-b9ce-9079a0f6477b.jpg?v=1773341689&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Flush Roll-Up", Installation: "Clamp-On" },
    description: "Flush roll-up tonneau cover for 2019+ Silverado/Sierra 1500 6.5' bed.",
    inStock: true, sku: "TC-FRU2-SIL19"
  },
  {
    id: "tc-12", slug: "2019-chevy-silverado-gmc-sierra-5-8ft-tri-fold-tonneau-cover-w-led",
    title: "2019+ Chevy Silverado GMC Sierra 5.8ft Tri-Fold Tonneau Cover w/ LED", price: 306.35,
    category: "tonneau", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_9776e136-90a1-42f6-858f-9b6d7e6a3545.jpg?v=1773341686&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_9776e136-90a1-42f6-858f-9b6d7e6a3545.jpg?v=1773341686&width=800`],
    specs: { "Bed Length": "5.8 ft", Type: "Hard Tri-Fold", "LED Kit": "Included", Material: "Aluminum" },
    description: "Hard tri-fold tonneau cover with LED for 2019+ Silverado/Sierra 5.8ft bed.",
    inStock: true, sku: "TC-LTH-SIL19-58"
  },
  {
    id: "tc-13", slug: "2019-chevy-silverado-gmc-sierra-5-8ft-hard-tri-fold-tonneau-cover",
    title: "2019+ Chevy Silverado/GMC Sierra 5.8ft Hard Tri-Fold Tonneau Cover", price: 277.59,
    category: "tonneau", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-lth-ws-2_9a9e494e-e739-44f9-95b4-eb44926bdf13.jpg?v=1773341654&width=800`,
    images: [`${CDN}/LISTING_tc-lth-ws-2_9a9e494e-e739-44f9-95b4-eb44926bdf13.jpg?v=1773341654&width=800`],
    specs: { "Bed Length": "5.8 ft", Type: "Hard Tri-Fold", Material: "Aluminum" },
    description: "Hard tri-fold tonneau cover for 2019+ Silverado/Sierra 5.8ft bed.",
    inStock: true, sku: "TC-LTH-SIL19-58B"
  },

  // ═══════════════════════════════════════════
  // HEADLIGHTS (reference — from search results)
  // ═══════════════════════════════════════════
  {
    id: "hl-1", slug: "01-03-honda-civic-crystal-headlights-sequential-led-bar-black",
    title: "01-03 Honda Civic Crystal Headlights Sequential LED Bar - Black", price: 84.04,
    category: "bull-guards", make: "Honda", model: ["Civic"], yearRange: "2001-2003",
    image: `${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`,
    images: [`${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`, `${CDN}/hlnb-civ01lsq-jdma-1.jpg?v=1773333056&width=800`],
    specs: { Type: "Crystal Headlights", "LED Bar": "Sequential", Finish: "Black Housing", Bulb: "H1/H1" },
    description: "Crystal headlights with sequential LED bar for 2001-2003 Honda Civic.",
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
