/**
 * Campaign landing page for eBay reactivation emails.
 * URL: /welcome-back
 * noindex, nofollow — not for organic search.
 * Categories + Featured products are pulled from the CMS (admin/content).
 */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, RotateCcw, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, PRODUCTS_QUERY } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";

/* ─── CMS types ─── */
interface CmsCategory {
  handle: string;
  title: string;
  image_url?: string;
  visible: boolean;
  order: number;
}

interface CmsFeaturedCard {
  product_handle: string | null;
  custom_link: string | null;
  title: string;
  description: string;
  image_url: string | null;
  product_image_url: string | null;
}

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

const WelcomeBackPage = () => {
  /* ── GA4 landing event ── */
  useEffect(() => {
    trackEvent("campaign_landing_page_view", { page_name: "welcome-back" });
  }, []);

  /* ── noindex meta ── */
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  /* ── Fetch CMS content (categories + featured) ── */
  const { data: cmsData } = useQuery({
    queryKey: ["welcome-back-cms"],
    queryFn: async () => {
      const { data } = await supabase
        .from("homepage_content")
        .select("section, content")
        .in("section", ["categories", "featured"]);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories: { handle: string; title: string; image: string }[] = (() => {
    const catRow = cmsData?.find((r) => r.section === "categories");
    if (!catRow) return FALLBACK_CATEGORIES;
    const cats = ((catRow.content as any)?.categories ?? []) as CmsCategory[];
    const visible = cats.filter((c) => c.visible).sort((a, b) => a.order - b.order);
    if (visible.length === 0) return FALLBACK_CATEGORIES;
    return visible.map((c) => ({ handle: c.handle, title: c.title, image: c.image_url || "" }));
  })();

  const cmsFeaturedHandles: string[] = (() => {
    const featRow = cmsData?.find((r) => r.section === "featured");
    if (!featRow) return [];
    const content = featRow.content as any;
    if (content?.cards) {
      return (content.cards as CmsFeaturedCard[])
        .map((c) => c.product_handle)
        .filter(Boolean) as string[];
    }
    return content?.handles ?? [];
  })();

  /* ── Fetch featured products from CMS or fallback to best sellers ── */
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["welcome-back-products", cmsFeaturedHandles],
    queryFn: async () => {
      if (cmsFeaturedHandles.length > 0) {
        const query = cmsFeaturedHandles.map((h) => `handle:${h}`).join(" OR ");
        const result = await storefrontApiRequest(PRODUCTS_QUERY, {
          first: cmsFeaturedHandles.length,
          query,
          sortKey: "RELEVANCE",
          reverse: false,
          after: null,
        });
        return (result?.data?.products?.edges || []) as ShopifyProduct[];
      }
      const result = await storefrontApiRequest(PRODUCTS_QUERY, {
        first: 8,
        query: null,
        sortKey: "BEST_SELLING",
        reverse: false,
        after: null,
      });
      return (result?.data?.products?.edges || []) as ShopifyProduct[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!cmsData,
  });

  const featuredHeading = cmsFeaturedHandles.length > 0 ? "FEATURED PRODUCTS" : "BEST SELLERS";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── 1. Sticky Promo Banner ── */}
      <div className="sticky top-0 z-40 w-full py-2.5 px-4 text-center"
        style={{ backgroundColor: "#f5a823" }}>
        <p className="font-display text-xs sm:text-sm font-bold tracking-wider text-zinc-900">
          WELCOME BACK — Use code <span className="underline underline-offset-2">DIRECT10</span> for 10% off your first order
        </p>
      </div>

      {/* ── 2. Hero (compact) ── */}
      <section className="bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
          <p className="font-display text-[10px] sm:text-xs tracking-[0.25em] text-primary mb-3">
            STEHLEN AUTO — DIRECT TO YOU
          </p>
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wider text-white leading-tight mb-3">
            YOUR FAVORITE PARTS.<br className="hidden sm:block" />NOW DIRECT.
          </h1>
          <p className="font-body text-sm text-zinc-400 max-w-xl mb-5 leading-relaxed">
            Same quality you trusted on eBay — now with a fitment guarantee, free shipping, and 10% off with code <span className="text-primary font-bold">DIRECT10</span>.
          </p>
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 h-11 px-8 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest hover:brightness-110 transition-all btn-press"
          >
            SHOP ALL PARTS
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── 3. Shop by Category Grid (from CMS) ── */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-8 py-6 border-b border-border">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(({ handle, title, image }) => (
            <Link
              key={handle}
              to={`/collections/all?category=${handle}`}
              className="group relative aspect-[4/3] overflow-hidden block border border-border hover:border-[#f5a823] transition-colors duration-300"
              onClick={() => trackEvent("category_tile_clicked", { category: handle, source: "welcome_back" })}
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
          ))}
        </div>
      </section>

      {/* ── 4. Featured / Best Sellers (from CMS) ── */}
      <section className="py-10 sm:py-14 px-4 sm:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">{featuredHeading}</h2>
            <Link
              to="/collections/all"
              className="font-display text-[10px] tracking-widest text-primary hover:brightness-110 transition-colors flex items-center gap-1"
            >
              VIEW ALL <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
              {products.map((p, i) => (
                <div key={p.node.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] flex-shrink-0 snap-start">
                  <ProductCard
                    product={p}
                    compact
                    listName="welcome_back_featured"
                    index={i}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Why Buy Direct (single copy) ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-xs tracking-[0.2em] text-muted-foreground text-center mb-10">
            WHY BUY DIRECT?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: ShieldCheck, title: "Fitment Guarantee", desc: "Every part confirmed for your vehicle before it ships." },
              { icon: Truck, title: "Free Shipping", desc: "Free shipping on every order. No minimum." },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day hassle-free returns. No questions asked." },
              { icon: ShieldCheck, title: "Manufacturer Warranty", desc: "Quality assured on every product." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xs tracking-wider text-foreground mb-1">{title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. DIRECT10 CTA ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 bg-zinc-950">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display text-[10px] tracking-[0.25em] text-primary mb-3">EXCLUSIVE OFFER</p>
          <h2 className="font-display text-xl sm:text-3xl font-bold tracking-wider text-white mb-4">
            10% OFF YOUR FIRST ORDER
          </h2>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-primary/60 mb-5 rounded-lg">
            <span className="font-display text-lg sm:text-xl font-bold tracking-[0.2em] text-primary">DIRECT10</span>
          </div>
          <div className="block">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 h-11 px-10 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest hover:brightness-110 transition-all btn-press"
            >
              START SHOPPING
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="font-body text-xs text-zinc-500 mt-4">
            Offer valid through May 31, 2026. One use per customer.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default WelcomeBackPage;
