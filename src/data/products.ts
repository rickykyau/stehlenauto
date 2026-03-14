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
  { id: "bull-guards", slug: "bull-guards-grille-guards", title: "Bull Guards & Grille Guards", description: "Protect your truck with premium bull guards and grille guards.", count: 358, image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800` },
  { id: "grilles", slug: "front-grilles", title: "Front Grilles", description: "Upgrade your truck's front end with aggressive styling.", count: 160, image: `${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800` },
  { id: "tonneau", slug: "tonneau-covers", title: "Tonneau Covers", description: "Protect your cargo with roll-up, tri-fold, and hard tonneau covers.", count: 185, image: `${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800` },
  { id: "headlights", slug: "headlights", title: "Headlights & Tail Lights", description: "Crystal, projector, and sequential LED headlights.", count: 420, image: `${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800` },
  { id: "side-steps", slug: "side-steps", title: "Side Steps & Running Boards", description: "Stainless steel and aluminum running boards.", count: 240, image: `${CDN}/LISTING_th-prix97-b225-ws-1.jpg?v=1773393470&width=800` },
  { id: "chase-rack", slug: "chase-rack-sport-bar", title: "Chase Rack / Sport Bar", description: "Heavy gauge steel chase racks with light mounts.", count: 95, image: `${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773393471&width=800` },
  { id: "trailer-hitches", slug: "trailer-hitches", title: "Trailer Hitches", description: "Class 1-5 trailer hitches with wiring kits.", count: 310, image: `${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800` },
  { id: "tonneau-combos", slug: "tonneau-combos", title: "Tonneau Cover Combos", description: "Tonneau covers bundled with LED bed light kits.", count: 120, image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800` },
];

export const products: Product[] = [
  // BULL GUARDS & GRILLE GUARDS
  {
    id: "bg-1", slug: "nissan-frontier-xterra-advanced-bull-guard",
    title: "01-04 Nissan Frontier Xterra Advanced Bull Guard LED Light Bar",
    price: 131.14, category: "bull-guards", make: "Nissan", model: ["Frontier", "Xterra"], yearRange: "2001-2004",
    image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`,
    images: [`${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`, `${CDN}/bghd-al-mb-1_902d2c1c-a045-4335-ab0d-59da546085da.jpg?v=1773328302&width=800`],
    specs: { Material: "Heavy-Duty Steel", Finish: "Matte Black", Installation: "Bolt-On", "LED Bar": "Included", Weight: "45 lbs" },
    description: "Advanced bull guard with integrated LED light bar. Heavy-duty steel construction with matte black powder-coat finish. Direct bolt-on installation with no drilling required.",
    inStock: true, sku: "BGHD-AL-MB",
  },
  {
    id: "bg-2", slug: "lexus-advanced-bull-guard",
    title: "Lexus RX Advanced Bull Guard — Matte Black",
    price: 142.50, category: "bull-guards", make: "Lexus", model: ["RX"], yearRange: "2010-2015",
    image: `${CDN}/LISTING_bghd-av-mb-ws-1.jpg?v=1773393482&width=800`,
    images: [`${CDN}/LISTING_bghd-av-mb-ws-1.jpg?v=1773393482&width=800`],
    specs: { Material: "Heavy-Duty Steel", Finish: "Matte Black", Installation: "Bolt-On", Weight: "42 lbs" },
    description: "Advanced bull guard for Lexus RX. Heavy-duty construction with a sleek matte black finish.",
    inStock: true, sku: "BGHD-AV-MB",
  },

  // FRONT GRILLES
  {
    id: "fg-1", slug: "ford-mustang-gt-honeycomb-mesh-grille",
    title: "2005-2009 Ford Mustang GT Honeycomb Mesh Front Grille - Black",
    price: 32.82, category: "grilles", make: "Ford", model: ["Mustang"], yearRange: "2005-2009",
    image: `${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800`,
    images: [`${CDN}/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-1.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-2.jpg?v=1773332154&width=800`, `${CDN}/fg-zh-mus05gt-me-bk-3.jpg?v=1773332154&width=800`],
    specs: { Material: "ABS Composite", Finish: "Gloss Black", Installation: "Direct Replacement", Pattern: "Honeycomb Mesh" },
    description: "Direct replacement honeycomb mesh front grille for Ford Mustang GT. ABS composite construction with a glossy black finish.",
    inStock: true, sku: "FG-ZH-MUS05GT-ME-BK",
  },
  {
    id: "fg-2", slug: "toyota-tundra-led-front-grille-lex-style",
    title: "2022-2024 Toyota Tundra LED Front Grille Lex Style - Glossy Black",
    price: 140.28, category: "grilles", make: "Toyota", model: ["Tundra"], yearRange: "2022-2024",
    image: `${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`,
    images: [`${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`, `${CDN}/fg-mesh-style-st-6_26f4ac9a-bee2-4fcb-8832-6d4c11709b14.jpg?v=1773332137&width=800`],
    specs: { Material: "ABS Composite", Finish: "Glossy Black", Installation: "Direct Replacement", LEDs: "Integrated", Style: "Lex Style" },
    description: "Premium Lex-style front grille with integrated LED lights. Direct replacement for the factory grille.",
    inStock: true, sku: "FG-TUN22-BLLB-BK-KS",
  },
  {
    id: "fg-3", slug: "toyota-tundra-abs-front-grille-lex-style",
    title: "2022-2024 Toyota Tundra Lex Style ABS Front Grille - Glossy Black",
    price: 84.64, category: "grilles", make: "Toyota", model: ["Tundra"], yearRange: "2022-2024",
    image: `${CDN}/LISTING_fg-tun22-bl-bk-ks-ws-1.jpg?v=1773332126&width=800`,
    images: [`${CDN}/LISTING_fg-tun22-bl-bk-ks-ws-1.jpg?v=1773332126&width=800`, `${CDN}/fg-tun22-bl-bk-ks-st-1.jpg?v=1773332126&width=800`],
    specs: { Material: "ABS Composite", Finish: "Glossy Black", Installation: "Direct Replacement", Style: "Lex Style" },
    description: "Lex-style ABS front grille without LEDs. Clean, aggressive look at a lower price point.",
    inStock: true, sku: "FG-TUN22-BL-BK-KS",
  },
  {
    id: "fg-4", slug: "volkswagen-touareg-front-grille",
    title: "2004-2007 Volkswagen Touareg Front Grille Black",
    price: 21.92, category: "grilles", make: "Volkswagen", model: ["Touareg"], yearRange: "2004-2007",
    image: `${CDN}/LISTING_fg-tor03-h-bk-ws-1.jpg?v=1773332101&width=800`,
    images: [`${CDN}/LISTING_fg-tor03-h-bk-ws-1.jpg?v=1773332101&width=800`, `${CDN}/fg-tor03-h-bk-1.jpg?v=1773332101&width=800`, `${CDN}/fg-tor03-h-bk-2.jpg?v=1773332101&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Installation: "Direct Replacement" },
    description: "Direct replacement front grille for Volkswagen Touareg.",
    inStock: true, sku: "TORG-0206-BK",
  },
  {
    id: "fg-5", slug: "toyota-tacoma-studded-mesh-rivet-grille",
    title: "2005-2011 Toyota Tacoma Studded Mesh Rivet Style Front Grille - Matte Black",
    price: 42.87, category: "grilles", make: "Toyota", model: ["Tacoma"], yearRange: "2005-2011",
    image: `${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`,
    images: [`${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`, `${CDN}/fg-taco05-rvt-me-mb-1.jpg?v=1773332090&width=800`, `${CDN}/fg-taco05-rvt-me-mb-2.jpg?v=1773332090&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Installation: "Direct Replacement", Style: "Studded Mesh Rivet" },
    description: "Aggressive studded mesh rivet-style grille. Matte black finish, direct bolt-on replacement.",
    inStock: true, sku: "FG-TACO05-RVT-ME-MB",
  },
  {
    id: "fg-6", slug: "chevy-silverado-front-grille-matte-black",
    title: "1999-2006 Chevy Silverado Tahoe Suburban Front Grille Matte Black",
    price: 32.11, category: "grilles", make: "Chevy", model: ["Silverado", "Tahoe", "Suburban"], yearRange: "1999-2006",
    image: `${CDN}/LISTING_fg-sil99-h-mb-ws-1.jpg?v=1773332075&width=800`,
    images: [`${CDN}/LISTING_fg-sil99-h-mb-ws-1.jpg?v=1773332075&width=800`, `${CDN}/fg-sil99-h-mb-1.jpg?v=1773332075&width=800`, `${CDN}/fg-sil99-h-mb-2.jpg?v=1773332075&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Installation: "Direct Replacement" },
    description: "Direct replacement front grille for Chevy Silverado, Tahoe, and Suburban. Clean matte black finish.",
    inStock: true, sku: "FG-SIL99-H-MB",
  },
  {
    id: "fg-7", slug: "chevy-silverado-horizontal-grille-black",
    title: "99-06 Chevy Silverado Tahoe Suburban Black Horizontal Grille",
    price: 33.90, category: "grilles", make: "Chevy", model: ["Silverado", "Tahoe", "Suburban"], yearRange: "1999-2006",
    image: `${CDN}/LISTING_fg-sil99-h-bk-ws-1.jpg?v=1773332063&width=800`,
    images: [`${CDN}/LISTING_fg-sil99-h-bk-ws-1.jpg?v=1773332063&width=800`, `${CDN}/fg-sil99-h-bk-1.jpg?v=1773332063&width=800`],
    specs: { Material: "ABS Composite", Finish: "Black", Installation: "Direct Replacement", Style: "Horizontal Bar" },
    description: "Horizontal bar-style front grille for Chevy Silverado/Tahoe/Suburban.",
    inStock: true, sku: "FG-SIL99-H-BK",
  },
  {
    id: "fg-8", slug: "chrysler-sebring-bentley-style-grille",
    title: "2007-2010 Chrysler Sebring Bentley Style Chrome Mesh Grille - ABS",
    price: 38.45, category: "grilles", make: "Chrysler", model: ["Sebring"], yearRange: "2007-2010",
    image: `${CDN}/LISTING_fg-seb08-me-ch-ws-1.jpg?v=1773332048&width=800`,
    images: [`${CDN}/LISTING_fg-seb08-me-ch-ws-1.jpg?v=1773332048&width=800`, `${CDN}/fg-seb08-me-ch-1.jpg?v=1773332048&width=800`],
    specs: { Material: "ABS Composite", Finish: "Chrome", Installation: "Direct Replacement", Style: "Bentley Mesh" },
    description: "Bentley-style chrome mesh grille for Chrysler Sebring.",
    inStock: true, sku: "FG-SEB08-ME-CH",
  },

  // TONNEAU COVERS
  {
    id: "tc-1", slug: "dodge-dakota-tonneau-cover-led-combo",
    title: "00-04 Dodge Dakota 5.5' Tonneau Cover & LED Bed Light Kit Combo",
    price: 87.07, category: "tonneau", make: "Dodge", model: ["Dakota"], yearRange: "2000-2004",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`, `${CDN}/tbl-16w8p-03_302c1a87-a3e3-48e8-843c-ed68a28d0d4d.jpg?v=1773338719&width=800`],
    specs: { "Bed Length": "5.5 ft", Type: "Tri-Fold Hard Shell", Material: "Aluminum/Vinyl", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Tri-fold tonneau cover with LED bed light kit. Clamp-on installation, no drilling.",
    inStock: true, sku: "TC-HSS-TBL-16W8P",
  },
  {
    id: "tc-2", slug: "dodge-dakota-roll-up-tonneau-led",
    title: "00-04 Dodge Dakota Roll-Up Tonneau Cover & LED Bed Light Kit 5.5'",
    price: 99.74, category: "tonneau", make: "Dodge", model: ["Dakota"], yearRange: "2000-2004",
    image: `${CDN}/LISTING_tc-lru-ws-1_186c6227-4d9e-4991-be6d-4bc30e83781e.jpg?v=1773338753&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_186c6227-4d9e-4991-be6d-4bc30e83781e.jpg?v=1773338753&width=800`, `${CDN}/tbl-16w8p-03_91474db1-77d0-4bf2-af89-c98712975a6e.jpg?v=1773338753&width=800`],
    specs: { "Bed Length": "5.5 ft", Type: "Roll-Up", Material: "Tear-Resistant Vinyl", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover with LED bed light kit for Dodge Dakota. Easy clamp-on installation.",
    inStock: true, sku: "TC-LRU-TBL",
  },
  {
    id: "tc-3", slug: "chevy-silverado-roll-up-tonneau-led",
    title: "99-07 Chevy Silverado GMC Sierra 6.5' Roll Up Tonneau Cover w/ LED",
    price: 100.53, category: "tonneau", make: "Chevy", model: ["Silverado"], yearRange: "1999-2007",
    image: `${CDN}/LISTING_tc-lru_2btbl-16w8p-01-ws-1_2b9a03c1-67b6-4e06-8852-a9ae0f256478.jpg?v=1773341793&width=800`,
    images: [`${CDN}/LISTING_tc-lru_2btbl-16w8p-01-ws-1_2b9a03c1-67b6-4e06-8852-a9ae0f256478.jpg?v=1773341793&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", Material: "Tear-Resistant Vinyl", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover with LED bed light kit for Silverado/Sierra 6.5' bed.",
    inStock: true, sku: "TC-LRU-SIL99-65",
  },
  {
    id: "tc-4", slug: "chevy-silverado-roll-up-tonneau",
    title: "99-07 Chevy Silverado GMC Sierra 6.5' Roll Up Tonneau Cover",
    price: 80.26, category: "tonneau", make: "Chevy", model: ["Silverado"], yearRange: "1999-2007",
    image: `${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", Material: "Tear-Resistant Vinyl", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover for Silverado/Sierra 6.5' bed. No LED kit.",
    inStock: true, sku: "TC-LRU-SIL99",
  },
  {
    id: "tc-5", slug: "chevy-silverado-trifold-tonneau-led",
    title: "2019+ Chevy Silverado GMC Sierra 6.5' Tri-Fold Tonneau Cover w/ LED",
    price: 112.99, category: "tonneau", make: "Chevy", model: ["Silverado"], yearRange: "2019-2025",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Tri-Fold", Material: "Aluminum/Vinyl", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Tri-fold tonneau cover with LED bed light kit for 2019+ Silverado/Sierra.",
    inStock: true, sku: "TC-HSS-SIL19",
  },

  // HEADLIGHTS
  {
    id: "hl-1", slug: "honda-civic-crystal-headlights-sequential-led",
    title: "01-03 Honda Civic Crystal Headlights Sequential LED Bar - Black",
    price: 84.04, category: "headlights", make: "Honda", model: ["Civic"], yearRange: "2001-2003",
    image: `${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`,
    images: [`${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`, `${CDN}/hlnb-civ01lsq-jdma-1.jpg?v=1773333056&width=800`],
    specs: { Type: "Crystal Projector", LEDs: "Sequential Bar", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "Crystal headlights with sequential LED light bar for Honda Civic. Plug and play installation.",
    inStock: true, sku: "HLNB-CIV01LSQ-JDMA",
  },
  {
    id: "hl-2", slug: "ford-ranger-headlights-led",
    title: "Ford Ranger Crystal Headlights Sequential LED Bar - Black",
    price: 92.50, category: "headlights", make: "Ford", model: ["Ranger"], yearRange: "2001-2011",
    image: `${CDN}/LISTING_hlnb-rang014plbw-jdma-ws-1a.jpg?v=1773393366&width=800`,
    images: [`${CDN}/LISTING_hlnb-rang014plbw-jdma-ws-1a.jpg?v=1773393366&width=800`],
    specs: { Type: "Crystal Projector", LEDs: "Sequential Bar", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "Crystal headlights with sequential LED light bar for Ford Ranger.",
    inStock: true, sku: "HLNB-RANG014PLBW",
  },
  {
    id: "hl-3", slug: "chevy-silverado-headlights-jdm",
    title: "Chevy Silverado Crystal Headlights JDM Style - Black",
    price: 78.99, category: "headlights", make: "Chevy", model: ["Silverado"], yearRange: "2003-2006",
    image: `${CDN}/LISTING_hlnb-sil034p-jdm-ws-1.jpg?v=1773393368&width=800`,
    images: [`${CDN}/LISTING_hlnb-sil034p-jdm-ws-1.jpg?v=1773393368&width=800`],
    specs: { Type: "Crystal Projector", Style: "JDM", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "JDM-style crystal projector headlights for Chevy Silverado.",
    inStock: true, sku: "HLNB-SIL034P-JDM",
  },

  // TRAILER HITCHES
  {
    id: "th-1", slug: "chevy-equinox-trailer-wiring-harness",
    title: "2005-2006 Chevy Equinox & Pontiac Torrent Trailer Wiring Harness",
    price: 13.49, category: "trailer-hitches", make: "Chevy", model: ["Equinox"], yearRange: "2005-2006",
    image: `${CDN}/LISTING_thw-equi05-ee560-ws-1.jpg?v=1773346836&width=800`,
    images: [`${CDN}/LISTING_thw-equi05-ee560-ws-1.jpg?v=1773346836&width=800`],
    specs: { Type: "Wiring Harness", Connector: "4-Pin Flat", Installation: "Plug & Play" },
    description: "Direct plug-in trailer wiring harness for Chevy Equinox and Pontiac Torrent.",
    inStock: true, sku: "THW-EQUI05-EE560",
  },
  {
    id: "th-2", slug: "chevy-equinox-class-3-hitch-wiring",
    title: "2005-2006 Chevy Equinox Class 3 Trailer Hitch & Wiring Combo",
    price: 89.88, category: "trailer-hitches", make: "Chevy", model: ["Equinox"], yearRange: "2005-2006",
    image: `${CDN}/LISTING_th-equi05-c591_2bthw-equi05-ee560-ws-1.jpg?v=1773343997&width=800`,
    images: [`${CDN}/LISTING_th-equi05-c591_2bthw-equi05-ee560-ws-1.jpg?v=1773343997&width=800`],
    specs: { Class: "3", "Max Tow": "3,500 lbs", "Tongue Weight": "525 lbs", Wiring: "4-Pin Included", Installation: "Bolt-On" },
    description: "Class 3 trailer hitch with 4-pin wiring harness combo.",
    inStock: true, sku: "TH-EQUI05-C591-COMBO",
  },
  {
    id: "th-3", slug: "chevy-cobalt-class-1-trailer-hitch",
    title: "2004-2011 Chevy Cobalt HHR Pontiac G5 Class 1 Trailer Hitch",
    price: 70.01, category: "trailer-hitches", make: "Chevy", model: ["Cobalt", "HHR"], yearRange: "2004-2011",
    image: `${CDN}/LISTING_th-cob05-a447-ws-1.jpg?v=1773343517&width=800`,
    images: [`${CDN}/LISTING_th-cob05-a447-ws-1.jpg?v=1773343517&width=800`],
    specs: { Class: "1", "Max Tow": "2,000 lbs", "Tongue Weight": "200 lbs", Installation: "Bolt-On" },
    description: "Class 1 trailer hitch for Chevy Cobalt, HHR, and Pontiac G5.",
    inStock: true, sku: "TH-COB05-A447",
  },
  {
    id: "th-4", slug: "chevy-cavalier-class-1-trailer-hitch",
    title: "1995-2005 Chevy Cavalier Pontiac Sunfire Class 1 Trailer Hitch",
    price: 67.54, category: "trailer-hitches", make: "Chevy", model: ["Cavalier"], yearRange: "1995-2005",
    image: `${CDN}/LISTING_th-cav95-a109-ws-1_6aa00b0a-55a1-4ce1-89e6-44c53cec6395.jpg?v=1773343497&width=800`,
    images: [`${CDN}/LISTING_th-cav95-a109-ws-1_6aa00b0a-55a1-4ce1-89e6-44c53cec6395.jpg?v=1773343497&width=800`],
    specs: { Class: "1", "Max Tow": "2,000 lbs", "Tongue Weight": "200 lbs", Installation: "Bolt-On" },
    description: "Class 1 trailer hitch for Chevy Cavalier and Pontiac Sunfire.",
    inStock: true, sku: "TH-CAV95-A109",
  },
  {
    id: "th-5", slug: "buick-enclave-chevy-traverse-class-3-hitch-kit",
    title: "2008-2017 Buick Enclave Chevy Traverse Class 3 Hitch Kit - CURT",
    price: 91.59, category: "trailer-hitches", make: "Chevy", model: ["Traverse"], yearRange: "2008-2017",
    image: `${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`],
    specs: { Class: "3", "Max Tow": "3,500 lbs", "Tongue Weight": "525 lbs", Brand: "CURT", Installation: "Bolt-On" },
    description: "CURT Class 3 hitch kit for Buick Enclave and Chevy Traverse.",
    inStock: true, sku: "TH-ACAD07-C424-KIT",
  },
  {
    id: "th-6", slug: "buick-enclave-chevy-traverse-class-3-hitch",
    title: "2008-2017 Buick Enclave Chevy Traverse Class 3 Trailer Hitch",
    price: 72.39, category: "trailer-hitches", make: "Chevy", model: ["Traverse"], yearRange: "2008-2017",
    image: `${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`],
    specs: { Class: "3", "Max Tow": "3,500 lbs", "Tongue Weight": "525 lbs", Installation: "Bolt-On" },
    description: "Class 3 trailer hitch for Buick Enclave and Chevy Traverse.",
    inStock: true, sku: "TH-ACAD07-C424",
  },

  // FORD PARTS
  {
    id: "fp-1", slug: "ford-f150-underseat-storage-organizer",
    title: "2015-2023 Ford F-150 F-250 F-350 Underseat Storage Organizer Box",
    price: 65.99, category: "side-steps", make: "Ford", model: ["F-150", "F-250", "F-350"], yearRange: "2015-2023",
    image: `${CDN}/LISTING_uss-f15015cc-bk-t-g.jpg?v=1773347272&width=800`,
    images: [`${CDN}/LISTING_uss-f15015cc-bk-t-g.jpg?v=1773347272&width=800`, `${CDN}/uss-f15015cc-bk-1.jpg?v=1773347272&width=800`],
    specs: { Material: "High-Impact ABS", Fit: "Crew Cab Only", Compartments: "Dual", Installation: "Drop-In" },
    description: "Underseat storage organizer for Ford F-150/F-250/F-350 Crew Cab. Dual compartments.",
    inStock: true, sku: "USS-F15015CC-BK",
  },

  // Additional products to reach ~50
  {
    id: "bg-3", slug: "gmc-sierra-bull-guard",
    title: "GMC Sierra 1500 Advanced Bull Guard LED Light Bar - Matte Black",
    price: 138.50, category: "bull-guards", make: "GMC", model: ["Sierra 1500"], yearRange: "2007-2013",
    image: `${CDN}/LISTING_bghd-al-mb-ws-1_9b9c1a9e-9503-4871-83b4-e1f3518fa3e1.jpg?v=1773393373&width=800`,
    images: [`${CDN}/LISTING_bghd-al-mb-ws-1_9b9c1a9e-9503-4871-83b4-e1f3518fa3e1.jpg?v=1773393373&width=800`],
    specs: { Material: "Heavy-Duty Steel", Finish: "Matte Black", Installation: "Bolt-On", "LED Bar": "Included", Weight: "48 lbs" },
    description: "Advanced bull guard for GMC Sierra 1500 with integrated LED light bar.",
    inStock: true, sku: "BGHD-AL-MB-GMC",
  },
  {
    id: "bg-4", slug: "ford-f150-bull-guard-led",
    title: "2015-2020 Ford F-150 Advanced Bull Guard LED Light Bar",
    price: 145.99, category: "bull-guards", make: "Ford", model: ["F-150"], yearRange: "2015-2020",
    image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`,
    images: [`${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`],
    specs: { Material: "Heavy-Duty Steel", Finish: "Matte Black", Installation: "Bolt-On", "LED Bar": "Included", Weight: "52 lbs" },
    description: "Advanced bull guard with LED light bar for Ford F-150.",
    inStock: true, sku: "BGHD-AL-MB-F150",
  },
  {
    id: "bg-5", slug: "dodge-ram-1500-bull-guard",
    title: "2009-2018 Dodge Ram 1500 Advanced Bull Guard - Matte Black",
    price: 139.99, category: "bull-guards", make: "Dodge", model: ["Ram 1500"], yearRange: "2009-2018",
    image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`,
    images: [`${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`],
    specs: { Material: "Heavy-Duty Steel", Finish: "Matte Black", Installation: "Bolt-On", Weight: "50 lbs" },
    description: "Advanced bull guard for Dodge Ram 1500. Matte black powder-coat finish.",
    inStock: true, sku: "BGHD-AL-MB-RAM",
  },
  {
    id: "bg-6", slug: "toyota-tacoma-bull-guard-led",
    title: "2016-2023 Toyota Tacoma Advanced Bull Guard LED Light Bar",
    price: 128.75, category: "bull-guards", make: "Toyota", model: ["Tacoma"], yearRange: "2016-2023",
    image: `${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`,
    images: [`${CDN}/LISTING_bghd-al-mb-ws-1_a8c41597-f64a-45a1-a4de-3dedcaabfd47.jpg?v=1773328302&width=800`],
    specs: { Material: "Heavy-Duty Steel", Finish: "Matte Black", Installation: "Bolt-On", "LED Bar": "Included", Weight: "40 lbs" },
    description: "Advanced bull guard with LED light bar for Toyota Tacoma.",
    inStock: true, sku: "BGHD-AL-MB-TAC",
  },
  {
    id: "bg-7", slug: "jeep-wrangler-bull-guard",
    title: "2007-2018 Jeep Wrangler JK Heavy-Duty Bull Guard",
    price: 155.00, category: "bull-guards", make: "Jeep", model: ["Wrangler"], yearRange: "2007-2018",
    image: `${CDN}/LISTING_th-jc84-c084-ws-1.jpg?v=1773393379&width=800`,
    images: [`${CDN}/LISTING_th-jc84-c084-ws-1.jpg?v=1773393379&width=800`],
    specs: { Material: "4.5mm Cold Rolled Steel", Finish: "Textured Black", Installation: "Bolt-On", Weight: "55 lbs" },
    description: "Heavy-duty bull guard for Jeep Wrangler JK. 4.5mm cold rolled steel construction.",
    inStock: true, sku: "BGHD-JK-TB",
  },

  // More tonneau covers
  {
    id: "tc-6", slug: "ford-f150-trifold-tonneau-55",
    title: "2015-2023 Ford F-150 5.5' Tri-Fold Tonneau Cover & LED Kit",
    price: 109.99, category: "tonneau", make: "Ford", model: ["F-150"], yearRange: "2015-2023",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`],
    specs: { "Bed Length": "5.5 ft", Type: "Tri-Fold", Material: "Aluminum/Vinyl", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Tri-fold tonneau cover with LED bed light kit for Ford F-150 5.5' bed.",
    inStock: true, sku: "TC-HSS-F150-55",
  },
  {
    id: "tc-7", slug: "ford-f150-rollup-tonneau-65",
    title: "2015-2023 Ford F-150 6.5' Roll-Up Tonneau Cover",
    price: 85.50, category: "tonneau", make: "Ford", model: ["F-150"], yearRange: "2015-2023",
    image: `${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Roll-Up", Material: "Tear-Resistant Vinyl", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover for Ford F-150 6.5' bed.",
    inStock: true, sku: "TC-LRU-F150-65",
  },
  {
    id: "tc-8", slug: "dodge-ram-trifold-tonneau-65",
    title: "2009-2018 Dodge Ram 1500 6.5' Tri-Fold Tonneau Cover & LED",
    price: 115.99, category: "tonneau", make: "Dodge", model: ["Ram 1500"], yearRange: "2009-2018",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`],
    specs: { "Bed Length": "6.5 ft", Type: "Tri-Fold", Material: "Aluminum/Vinyl", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Tri-fold tonneau cover with LED bed light kit for Dodge Ram 1500.",
    inStock: true, sku: "TC-HSS-RAM-65",
  },
  {
    id: "tc-9", slug: "toyota-tacoma-rollup-tonneau-5",
    title: "2016-2023 Toyota Tacoma 5' Roll-Up Tonneau Cover",
    price: 78.99, category: "tonneau", make: "Toyota", model: ["Tacoma"], yearRange: "2016-2023",
    image: `${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`,
    images: [`${CDN}/LISTING_tc-lru-ws-1_f12654c5-4fb8-4cef-af92-9d28cc734f49.jpg?v=1773341759&width=800`],
    specs: { "Bed Length": "5 ft", Type: "Roll-Up", Material: "Tear-Resistant Vinyl", Installation: "Clamp-On" },
    description: "Roll-up tonneau cover for Toyota Tacoma 5' bed.",
    inStock: true, sku: "TC-LRU-TAC-5",
  },
  {
    id: "tc-10", slug: "nissan-frontier-trifold-tonneau",
    title: "2005-2021 Nissan Frontier 5' Tri-Fold Tonneau Cover & LED",
    price: 105.50, category: "tonneau", make: "Nissan", model: ["Frontier"], yearRange: "2005-2021",
    image: `${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`,
    images: [`${CDN}/LISTING_tc-hss_2btbl-16w8p-01-ws-1_18faf2cb-b81b-4821-bf61-2c74818147b1.jpg?v=1773338719&width=800`],
    specs: { "Bed Length": "5 ft", Type: "Tri-Fold", Material: "Aluminum/Vinyl", "LED Kit": "Included", Installation: "Clamp-On" },
    description: "Tri-fold tonneau cover with LED bed light kit for Nissan Frontier 5' bed.",
    inStock: true, sku: "TC-HSS-FRON-5",
  },

  // More headlights
  {
    id: "hl-4", slug: "ford-f150-projector-headlights",
    title: "2009-2014 Ford F-150 Projector Headlights Sequential LED - Black",
    price: 118.50, category: "headlights", make: "Ford", model: ["F-150"], yearRange: "2009-2014",
    image: `${CDN}/LISTING_hlnb-rang014plbw-jdma-ws-1a.jpg?v=1773393366&width=800`,
    images: [`${CDN}/LISTING_hlnb-rang014plbw-jdma-ws-1a.jpg?v=1773393366&width=800`],
    specs: { Type: "Projector", LEDs: "Sequential Signal", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "Projector headlights with sequential LED signal for Ford F-150.",
    inStock: true, sku: "HLNB-F150-09-PRJ",
  },
  {
    id: "hl-5", slug: "dodge-ram-crystal-headlights",
    title: "2009-2018 Dodge Ram 1500 Crystal Headlights LED DRL - Black",
    price: 105.99, category: "headlights", make: "Dodge", model: ["Ram 1500"], yearRange: "2009-2018",
    image: `${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`,
    images: [`${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`],
    specs: { Type: "Crystal", LEDs: "DRL Bar", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "Crystal headlights with LED DRL bar for Dodge Ram 1500.",
    inStock: true, sku: "HLNB-RAM-09-CRY",
  },
  {
    id: "hl-6", slug: "toyota-tacoma-led-headlights",
    title: "2012-2015 Toyota Tacoma LED DRL Projector Headlights - Black",
    price: 96.75, category: "headlights", make: "Toyota", model: ["Tacoma"], yearRange: "2012-2015",
    image: `${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`,
    images: [`${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`],
    specs: { Type: "Projector", LEDs: "DRL Strip", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "LED DRL projector headlights for Toyota Tacoma.",
    inStock: true, sku: "HLNB-TAC-12-PRJ",
  },
  {
    id: "hl-7", slug: "gmc-sierra-halo-headlights",
    title: "2007-2013 GMC Sierra 1500 Halo Projector Headlights - Black",
    price: 112.25, category: "headlights", make: "GMC", model: ["Sierra 1500"], yearRange: "2007-2013",
    image: `${CDN}/LISTING_hlnb-sil034p-jdm-ws-1.jpg?v=1773393368&width=800`,
    images: [`${CDN}/LISTING_hlnb-sil034p-jdm-ws-1.jpg?v=1773393368&width=800`],
    specs: { Type: "Halo Projector", LEDs: "Angel Eyes", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "Halo projector headlights with angel eyes for GMC Sierra 1500.",
    inStock: true, sku: "HLNB-SIE-07-HALO",
  },
  {
    id: "hl-8", slug: "jeep-wrangler-led-headlights",
    title: "2007-2018 Jeep Wrangler JK 7\" Round LED Headlights",
    price: 89.99, category: "headlights", make: "Jeep", model: ["Wrangler"], yearRange: "2007-2018",
    image: `${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`,
    images: [`${CDN}/LISTING_hlnb-civ01lsq-jdma-ws-1.jpg?v=1773333056&width=800`],
    specs: { Type: "7\" Round LED", LEDs: "High/Low Beam + DRL", Finish: "Black Housing", Compliance: "DOT/SAE", Installation: "Plug & Play" },
    description: "7\" round LED headlights for Jeep Wrangler JK. High/low beam with DRL.",
    inStock: true, sku: "HLNB-JK-7RND",
  },

  // More trailer hitches
  {
    id: "th-7", slug: "ford-f150-class-4-trailer-hitch",
    title: "2009-2014 Ford F-150 Class 4 Trailer Hitch - Heavy Duty",
    price: 125.99, category: "trailer-hitches", make: "Ford", model: ["F-150"], yearRange: "2009-2014",
    image: `${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`],
    specs: { Class: "4", "Max Tow": "10,000 lbs", "Tongue Weight": "1,000 lbs", Installation: "Bolt-On", Finish: "Black Powder Coat" },
    description: "Heavy-duty Class 4 trailer hitch for Ford F-150.",
    inStock: true, sku: "TH-F150-09-C4",
  },
  {
    id: "th-8", slug: "toyota-tacoma-class-3-hitch",
    title: "2005-2015 Toyota Tacoma Class 3 Trailer Hitch",
    price: 78.50, category: "trailer-hitches", make: "Toyota", model: ["Tacoma"], yearRange: "2005-2015",
    image: `${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424-ws-1.jpg?v=1773343153&width=800`],
    specs: { Class: "3", "Max Tow": "5,000 lbs", "Tongue Weight": "500 lbs", Installation: "Bolt-On" },
    description: "Class 3 trailer hitch for Toyota Tacoma.",
    inStock: true, sku: "TH-TAC-05-C3",
  },
  {
    id: "th-9", slug: "jeep-grand-cherokee-class-3-hitch",
    title: "2011-2021 Jeep Grand Cherokee Class 3 Trailer Hitch & Wiring",
    price: 98.75, category: "trailer-hitches", make: "Jeep", model: ["Grand Cherokee"], yearRange: "2011-2021",
    image: `${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`,
    images: [`${CDN}/LISTING_th-acad07-c424_2bth-bmount-l2-ws-1.jpg?v=1773343164&width=800`],
    specs: { Class: "3", "Max Tow": "6,200 lbs", "Tongue Weight": "620 lbs", Wiring: "4-Pin Included", Installation: "Bolt-On" },
    description: "Class 3 trailer hitch with wiring for Jeep Grand Cherokee.",
    inStock: true, sku: "TH-GC-11-C3",
  },

  // Chase racks
  {
    id: "cr-1", slug: "ford-f150-chase-rack-sport-bar",
    title: "2015-2023 Ford F-150 Chase Rack Sport Bar with Light Mounts",
    price: 219.99, category: "chase-rack", make: "Ford", model: ["F-150"], yearRange: "2015-2023",
    image: `${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773393471&width=800`,
    images: [`${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773393471&width=800`],
    specs: { Material: "Heavy Gauge Steel", Finish: "Textured Black", "Light Mounts": "4x Included", Installation: "Bolt-On", Weight: "65 lbs" },
    description: "Chase rack sport bar with 4 light mounting points for Ford F-150.",
    inStock: true, sku: "CRJZ-RAZ-F150",
  },
  {
    id: "cr-2", slug: "chevy-silverado-chase-rack",
    title: "2014-2018 Chevy Silverado 1500 Chase Rack Sport Bar",
    price: 209.99, category: "chase-rack", make: "Chevy", model: ["Silverado"], yearRange: "2014-2018",
    image: `${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773393471&width=800`,
    images: [`${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773393471&width=800`],
    specs: { Material: "Heavy Gauge Steel", Finish: "Textured Black", "Light Mounts": "4x Included", Installation: "Bolt-On", Weight: "62 lbs" },
    description: "Chase rack sport bar for Chevy Silverado 1500.",
    inStock: true, sku: "CRJZ-RAZ-SIL",
  },
  {
    id: "cr-3", slug: "toyota-tundra-chase-rack",
    title: "2014-2021 Toyota Tundra Chase Rack Sport Bar - Matte Black",
    price: 225.50, category: "chase-rack", make: "Toyota", model: ["Tundra"], yearRange: "2014-2021",
    image: `${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773393471&width=800`,
    images: [`${CDN}/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773393471&width=800`],
    specs: { Material: "Heavy Gauge Steel", Finish: "Matte Black", "Light Mounts": "4x Included", Installation: "Bolt-On", Weight: "68 lbs" },
    description: "Chase rack sport bar for Toyota Tundra. Matte black finish.",
    inStock: true, sku: "CRJZ-RAZ-TUN",
  },

  // More Ford specific
  {
    id: "fg-9", slug: "ford-f150-raptor-style-grille",
    title: "2015-2017 Ford F-150 Raptor Style Mesh Front Grille with LEDs",
    price: 95.99, category: "grilles", make: "Ford", model: ["F-150"], yearRange: "2015-2017",
    image: `${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`,
    images: [`${CDN}/LISTING_fg-tun22-bllb-bk-ks-ws-1.jpg?v=1773332137&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", LEDs: "Amber Side Markers", Installation: "Direct Replacement", Style: "Raptor" },
    description: "Raptor-style mesh front grille with amber LED side markers for Ford F-150.",
    inStock: true, sku: "FG-F150-RAP-MB",
  },
  {
    id: "fg-10", slug: "dodge-ram-rebel-style-grille",
    title: "2013-2018 Dodge Ram 1500 Rebel Style Front Grille - Matte Black",
    price: 88.75, category: "grilles", make: "Dodge", model: ["Ram 1500"], yearRange: "2013-2018",
    image: `${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`,
    images: [`${CDN}/LISTING_fg-taco05-rvt-me-mb-ws-1.jpg?v=1773332090&width=800`],
    specs: { Material: "ABS Composite", Finish: "Matte Black", Installation: "Direct Replacement", Style: "Rebel" },
    description: "Rebel-style front grille for Dodge Ram 1500. Matte black finish.",
    inStock: true, sku: "FG-RAM-REB-MB",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter(p => p.category === categoryId);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}
