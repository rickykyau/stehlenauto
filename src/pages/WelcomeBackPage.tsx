/**
 * Campaign landing page for eBay reactivation emails.
 * URL: /welcome-back
 * noindex, nofollow — not for organic search.
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Truck, RotateCcw, Tag, Car, CheckCircle2, ArrowRight,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { useVehicle } from "@/contexts/VehicleContext";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, COLLECTION_PRODUCTS_QUERY, PRODUCTS_QUERY, MAKE_COLLECTION_MAP } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";

/* ─── Fallback handles for "best of each category" ─── */
const FALLBACK_HANDLES = [
  "tonneau-covers",
  "front-grilles",
  "bull-guards-grille-guards",
  "running-boards-side-steps",
  "truck-bed-mats",
  "trailer-hitches",
  "headlights",
  "floor-mats",
];

const PRODUCTS_BY_HANDLES_QUERY = `
  query GetProductsByHandles($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $after: String) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after) {
      edges {
        node {
          id title handle description productType vendor tags
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          images(first: 3) { edges { node { url altText } } }
          variants(first: 5) {
            edges {
              node {
                id title availableForSale sku
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
              }
            }
          }
          options { name values }
        }
      }
    }
  }
`;

const WelcomeBackPage = () => {
  const { vehicle } = useVehicle();
  const productsRef = useRef<HTMLElement>(null);

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

  /* ── Fetch products: vehicle-specific or best sellers ── */
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["welcome-back-products", vehicle?.make],
    queryFn: async () => {
      let fetched: ShopifyProduct[] = [];

      if (vehicle?.make) {
        const collectionHandle = MAKE_COLLECTION_MAP[vehicle.make];
        if (collectionHandle) {
          const result = await storefrontApiRequest(COLLECTION_PRODUCTS_QUERY, {
            handle: collectionHandle,
            first: 20,
            after: null,
            sortKey: "BEST_SELLING",
            reverse: false,
          });
          fetched = (result?.data?.collectionByHandle?.products?.edges || []) as ShopifyProduct[];
        }
      }

      if (fetched.length === 0) {
        const result = await storefrontApiRequest(PRODUCTS_BY_HANDLES_QUERY, {
          first: 24,
          query: null,
          sortKey: "BEST_SELLING",
          reverse: false,
          after: null,
        });
        fetched = (result?.data?.products?.edges || []) as ShopifyProduct[];
      }

      // Diversify by product type
      const seen = new Set<string>();
      const diverse: ShopifyProduct[] = [];
      for (const p of fetched) {
        const type = (p.node.productType || "").toLowerCase();
        if (!seen.has(type)) {
          seen.add(type);
          diverse.push(p);
        }
        if (diverse.length >= 8) break;
      }
      // Backfill if not enough types
      if (diverse.length < 8) {
        for (const p of fetched) {
          if (diverse.length >= 8) break;
          if (!diverse.some(d => d.node.id === p.node.id)) diverse.push(p);
        }
      }
      return diverse.slice(0, 8);
    },
    staleTime: 5 * 60 * 1000,
  });

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openYMM = () => {
    const ymmBtn = document.querySelector("[data-ymm-trigger]") as HTMLElement;
    ymmBtn?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── 1. Offer Banner (sticky) ── */}
      <div className="sticky top-0 z-40 w-full py-2.5 px-4 text-center"
        style={{ backgroundColor: "#f5a823" }}>
        <p className="font-display text-xs sm:text-sm font-bold tracking-wider text-zinc-900">
          WELCOME BACK — Use code <span className="underline underline-offset-2">DIRECT10</span> for 10% off your first order
        </p>
      </div>

      {/* ── 2. Hero Section ── */}
      <section className="relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/95 to-zinc-950/60" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <p className="font-display text-[10px] sm:text-xs tracking-[0.25em] text-primary mb-4">
            STEHLEN AUTO — DIRECT TO YOU
          </p>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-wider text-white leading-tight mb-4">
            YOUR FAVORITE PARTS.<br />NOW DIRECT.
          </h1>
          <p className="font-body text-sm sm:text-base text-zinc-400 max-w-xl mb-8 leading-relaxed">
            Same quality you trusted on eBay — now with a fitment guarantee, free shipping, and 10% off your first order.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openYMM}
              className="h-11 px-8 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest hover:brightness-110 transition-all btn-press flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              SELECT YOUR VEHICLE
            </button>
            <button
              onClick={scrollToProducts}
              className="h-11 px-8 border border-zinc-600 text-zinc-300 font-display text-xs tracking-widest hover:border-primary/60 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              BROWSE BEST SELLERS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Trust Bar ── */}
      <section className="border-b border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {[
            { icon: Truck, title: "Free Shipping", sub: "On every order" },
            { icon: ShieldCheck, title: "Fitment Guaranteed", sub: "Confirmed for your vehicle" },
            { icon: RotateCcw, title: "30-Day Returns", sub: "Hassle-free" },
            { icon: ShieldCheck, title: "Manufacturer Warranty", sub: "Quality assured" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 px-4 py-4 sm:py-5 border-r border-b sm:border-b-0 border-border last:border-r-0">
              <Icon className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="font-display text-[10px] sm:text-xs tracking-wider text-foreground block">{title}</span>
                <span className="font-body text-[10px] text-muted-foreground">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Why Buy Direct? ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-xs tracking-[0.2em] text-muted-foreground text-center mb-10">
            WHY BUY DIRECT?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Fitment Guarantee",
                desc: "We confirm every part fits your vehicle before it ships. No guessing.",
              },
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "Free shipping on every order. No minimum. No membership.",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "30-day hassle-free returns. No questions asked.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 border border-border bg-card rounded-lg">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-sm tracking-wider text-foreground mb-2">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Featured Products ── */}
      <section ref={productsRef} className="py-12 sm:py-16 px-4 sm:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-xs tracking-[0.2em] text-muted-foreground text-center mb-2">
            {vehicle ? `TOP PICKS FOR YOUR ${vehicle.year} ${vehicle.make} ${vehicle.model}`.toUpperCase() : "TOP PICKS FOR YOUR VEHICLE"}
          </h2>
          <p className="font-body text-sm text-muted-foreground text-center mb-8">
            Use code <span className="text-primary font-bold">DIRECT10</span> at checkout to save 10%
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p, i) => (
                <ProductCard
                  key={p.node.id}
                  product={p}
                  listName="welcome_back_featured"
                  index={i}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 font-display text-xs tracking-widest text-primary hover:brightness-110 transition-colors"
            >
              VIEW ALL 1,330+ PRODUCTS
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. How It Works ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-xs tracking-[0.2em] text-muted-foreground text-center mb-10">
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: Car,
                title: "Select Your Vehicle",
                desc: "Tell us what you drive",
              },
              {
                step: "02",
                icon: CheckCircle2,
                title: "Browse Guaranteed-Fit Parts",
                desc: "Every product confirmed to fit",
              },
              {
                step: "03",
                icon: Tag,
                title: "Save 10% on Your First Order",
                desc: "Use code DIRECT10 at checkout",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <span className="font-display text-4xl font-bold text-primary/20 block mb-2">{step}</span>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-sm tracking-wider text-foreground mb-1">{title}</h3>
                <p className="font-body text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. DIRECT10 CTA Section ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-xs tracking-[0.25em] text-primary mb-4">EXCLUSIVE OFFER</p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-wider text-white mb-4">
            10% OFF YOUR FIRST ORDER
          </h2>
          <div className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-primary/60 mb-6 rounded-lg">
            <Tag className="w-5 h-5 text-primary" />
            <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.2em] text-primary">DIRECT10</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <button
              onClick={scrollToProducts}
              className="h-12 px-10 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest hover:brightness-110 transition-all btn-press flex items-center justify-center gap-2"
            >
              START SHOPPING
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={openYMM}
              className="h-12 px-10 border border-zinc-600 text-zinc-300 font-display text-xs tracking-widest hover:border-primary/60 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              SELECT YOUR VEHICLE
            </button>
          </div>
          <p className="font-body text-xs text-zinc-500 mt-2">
            Offer valid through May 31, 2026. One use per customer.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default WelcomeBackPage;
