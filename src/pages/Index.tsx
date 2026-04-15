/**
 * SHOPIFY TEMPLATE: templates/index.liquid
 * SECTIONS: hero, category-grid, trust-badges, reviews
 * Categories are pulled from the CMS (admin/content).
 */
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import SiteFooter from "@/components/SiteFooter";
import CustomerReviews from "@/components/CustomerReviews";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ─── Fallback categories (used if CMS has none) ─── */
const FALLBACK_CATEGORIES = [
  { handle: "tonneau-covers", title: "Tonneau Covers", image: "" },
  { handle: "running-boards-side-steps", title: "Running Boards", image: "" },
  { handle: "bull-guards-grille-guards", title: "Bull Bars & Brush Guards", image: "" },
  { handle: "front-grilles", title: "Grilles", image: "" },
  { handle: "headlights", title: "Headlights & Tail Lights", image: "" },
  { handle: "trailer-hitches", title: "Hitches & Towing", image: "" },
  { handle: "chase-racks-sport-bars", title: "Bumpers", image: "" },
  { handle: "molle-panels", title: "Fenders & Body Kits", image: "" },
  { handle: "truck-bed-mats", title: "Bed Mats & Liners", image: "" },
  { handle: "roof-racks-baskets", title: "Roof Racks", image: "" },
  { handle: "floor-mats", title: "Floor Mats", image: "" },
  { handle: "under-seat-storage", title: "Accessories", image: "" },
];

interface CmsCategory {
  handle: string;
  title: string;
  image_url?: string;
  visible: boolean;
  order: number;
}

/* ─── Category Tile ─── */

function CategoryTile({ handle, title, image }: {
  handle: string;
  title: string;
  image: string;
}) {
  return (
    <Link
      to={`/collections/all?category=${handle}`}
      className="group relative aspect-[4/3] overflow-hidden block border border-border hover:border-[#f5a823] transition-colors duration-300"
      onClick={() => trackEvent("category_tile_clicked", { category: handle })}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-card" />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 40%, transparent 70%)" }}
      />
      <div className="absolute bottom-0 left-0 p-4">
        <span className="font-display text-sm tracking-wider font-bold text-white drop-shadow-lg block">
          {title.toUpperCase()}
        </span>
      </div>
    </Link>
  );
}

/* ─── Main Page ─── */

const IndexTemplate = () => {
  /* ── Fetch CMS categories ── */
  const { data: categories } = useQuery({
    queryKey: ["homepage-cms-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("section", "categories")
        .single();
      if (!data) return FALLBACK_CATEGORIES;
      const cats = ((data.content as any)?.categories ?? []) as CmsCategory[];
      const visible = cats.filter((c) => c.visible).sort((a, b) => a.order - b.order);
      if (visible.length === 0) return FALLBACK_CATEGORIES;
      return visible.map((c) => ({ handle: c.handle, title: c.title, image: c.image_url || "" }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const displayCategories = categories ?? FALLBACK_CATEGORIES;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSection onOpenYMM={() => window.dispatchEvent(new CustomEvent("open-ymm-modal"))} />

      {/* Shop by Category Grid */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-8 py-6 border-b border-border">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border p-px">
          {displayCategories.map((cat) => (
            <CategoryTile
              key={cat.handle}
              handle={cat.handle}
              title={cat.title}
              image={cat.image}
            />
          ))}
        </div>
      </section>

      <CustomerReviews />

      {/* Trust Badges */}
      <section className="border-t border-border grid grid-cols-2 md:grid-cols-4">
        {[
          { label: "FREE SHIPPING", desc: "On all orders" },
          { label: "GUARANTEED FITMENT", desc: "Fits your vehicle or money back" },
          { label: "MANUFACTURER WARRANTY", desc: "On every product" },
          { label: "EASY RETURNS", desc: "30-day hassle-free returns" },
        ].map((trust, i) => (
          <div
            key={i}
            className="p-6 border-r border-b border-border last:border-r-0 text-center cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => trackEvent("trust_badge_clicked", { badge_type: trust.label.toLowerCase().replace(/\s+/g, "_") })}
          >
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

export default IndexTemplate;
