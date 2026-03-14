import { useState } from "react";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";

import productTonneau from "@/assets/product-tonneau.jpg";
import productSidestep from "@/assets/product-sidestep.jpg";
import productGrille from "@/assets/product-grille.jpg";
import productHeadlight from "@/assets/product-headlight.jpg";
import productChaserack from "@/assets/product-chaserack.jpg";
import heroBullbar from "@/assets/hero-bullbar.jpg";

const FEATURED_PRODUCTS = [
  {
    image: heroBullbar,
    title: "ADVANCED BULL GUARD WITH LED LIGHT BAR",
    price: "$131.14",
    category: "Bull Guards",
    specs: "4.5MM COLD ROLLED STEEL · BOLT-ON",
  },
  {
    image: productGrille,
    title: "HONEYCOMB MESH FRONT GRILLE — MATTE BLACK",
    price: "$89.99",
    category: "Front Grilles",
    specs: "ABS COMPOSITE · DIRECT FIT",
  },
  {
    image: productTonneau,
    title: "ROLL-UP TONNEAU COVER & LED BED LIGHT KIT 5.5'",
    price: "$99.74",
    category: "Tonneau Covers",
    specs: "TEAR-RESISTANT VINYL · CLAMP-ON",
  },
  {
    image: productSidestep,
    title: "CHROME SIDE STEP RUNNING BOARDS — PAIR",
    price: "$154.50",
    category: "Side Steps",
    specs: "STAINLESS STEEL · NON-SLIP PADS",
  },
  {
    image: productHeadlight,
    title: "CRYSTAL HEADLIGHTS SEQUENTIAL LED BAR — BLACK",
    price: "$84.04",
    category: "Headlights",
    specs: "DOT COMPLIANT · PLUG & PLAY",
  },
  {
    image: productChaserack,
    title: "CHASE RACK SPORT BAR WITH LIGHT MOUNTS",
    price: "$219.99",
    category: "Chase Rack",
    specs: "HEAVY GAUGE STEEL · TEXTURED BLACK",
  },
];

const CATEGORY_HIGHLIGHTS = [
  { image: heroBullbar, label: "BULL GUARDS & GRILLE GUARDS", count: "358 PARTS" },
  { image: productSidestep, label: "SIDE STEPS & RUNNING BOARDS", count: "240 PARTS" },
  { image: productTonneau, label: "TONNEAU COVERS", count: "185 PARTS" },
  { image: productHeadlight, label: "HEADLIGHTS & TAIL LIGHTS", count: "420 PARTS" },
];

const Index = () => {
  const [vehicle, setVehicle] = useState<{ year: string; make: string; model: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState("bull-guards");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader vehicle={vehicle} />

      <HeroSection onVehicleSelect={setVehicle} />

      {/* Category Grid */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-6 py-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
          <button className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
            VIEW ALL <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {CATEGORY_HIGHLIGHTS.map((cat, i) => (
            <a
              key={i}
              href="#"
              className="group relative aspect-[4/3] border-r border-b border-border last:border-r-0 overflow-hidden"
            >
              <img src={cat.image} alt={cat.label} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500 group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="font-display text-xs tracking-wider block">{cat.label}</span>
                <span className="font-display text-[10px] tracking-widest text-primary">{cat.count}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Main Content: Sidebar + Products */}
      <div className="flex">
        <CategorySidebar activeCategory={activeCategory} onCategorySelect={setActiveCategory} />

        <main className="flex-1 min-w-0">
          {/* Section header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm tracking-wider">
                {vehicle ? `PARTS FOR ${vehicle.year} ${vehicle.make} ${vehicle.model}`.toUpperCase() : "FEATURED PARTS"}
              </h2>
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                {FEATURED_PRODUCTS.length} ITEMS
              </span>
            </div>
            <div className="flex items-center gap-2 border border-border px-3 py-1.5">
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">SORT: BEST SELLING</span>
            </div>
          </div>

          {/* Product grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-0 stagger-fade-in">
            {FEATURED_PRODUCTS.map((product, i) => (
              <div key={i} className="border-r border-b border-border last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r xl:[&:nth-child(3n)]:border-r-0">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Trust strip */}
      <section className="border-t border-border grid grid-cols-2 md:grid-cols-4">
        {[
          { label: "FREE SHIPPING", desc: "On all orders" },
          { label: "GUARANTEED FITMENT", desc: "Fits your vehicle or money back" },
          { label: "MANUFACTURER WARRANTY", desc: "On every product" },
          { label: "EASY RETURNS", desc: "30-day hassle-free returns" },
        ].map((trust, i) => (
          <div key={i} className="p-6 border-r border-b border-border last:border-r-0 text-center">
            <div className="w-3 h-3 bg-primary mx-auto mb-3" />
            <h4 className="font-display text-xs tracking-widest mb-1">{trust.label}</h4>
            <p className="font-body text-xs text-muted-foreground">{trust.desc}</p>
          </div>
        ))}
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
