/**
 * SHOPIFY TEMPLATE: templates/index.liquid
 * SECTIONS: hero, category-grid (top 4), featured-products, trust-badges
 */
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest } from "@/lib/shopify";

const TOP_CATEGORIES = [
  {
    handle: "bull-guards-grille-guards",
    title: "Bull Guards & Grille Guards",
    fallbackCount: 190,
    image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_blgr-tmy20-bk-ws-1.jpg?v=1773608061",
  },
  {
    handle: "trailer-hitches",
    title: "Trailer Hitches",
    fallbackCount: 288,
    image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_th-xte05-c514_2bth-bmount-l2-ws-1.jpg?v=1773608068",
  },
  {
    handle: "tonneau-covers",
    title: "Tonneau Covers",
    fallbackCount: 287,
    image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_tc-lth_2btbl-16w8p-01-ws-2_a9465d73-f185-4ae9-8440-381b63cd3658.jpg?v=1773608065",
  },
  {
    handle: "headlights",
    title: "Headlights",
    fallbackCount: 161,
    image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_hlpnb-tun14lsq-lam-ac-ws-1.jpg?v=1773608075",
  },
];

const COLLECTION_COUNT_QUERY = `
  query GetCollectionCount($handle: String!) {
    collectionByHandle(handle: $handle) {
      products(first: 250) {
        edges { node { id } }
      }
    }
  }
`;

function useCategoryCounts() {
  return useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const results: Record<string, number> = {};
      await Promise.all(
        TOP_CATEGORIES.map(async (cat) => {
          try {
            const data = await storefrontApiRequest(COLLECTION_COUNT_QUERY, { handle: cat.handle });
            results[cat.handle] = data?.data?.collectionByHandle?.products?.edges?.length || cat.fallbackCount;
          } catch {
            results[cat.handle] = cat.fallbackCount;
          }
        })
      );
      return results;
    },
    staleTime: 300_000,
  });
}

const IndexTemplate = () => {
  const { data, isLoading } = useShopifyProducts({ first: 4, sortKey: 'BEST_SELLING' });
  const { data: categoryCounts } = useCategoryCounts();
  const featuredProducts = data?.products || [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSection />

      {/* Category Grid */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-8 py-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
          <Link to="/collections/all" className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
            VIEW ALL <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {TOP_CATEGORIES.map((cat) => {
            const count = categoryCounts?.[cat.handle] ?? cat.fallbackCount;
            return (
              <Link
                key={cat.handle}
                to={`/collections/${cat.handle}`}
                className="group relative aspect-[4/3] border-r border-b border-border last:border-r-0 overflow-hidden"
              >
                <img src={cat.image} alt={cat.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)" }} />
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="font-display text-xs tracking-wider block mb-1">{cat.title.toUpperCase()}</span>
                  <span className="font-body text-xs text-muted-foreground">{count} Products</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-8 py-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">FEATURED PRODUCTS</h2>
          <Link to="/collections/all" className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
            SHOP ALL <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade-in">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="font-display text-xs tracking-widest text-muted-foreground">NO PRODUCTS FOUND</p>
            </div>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Trust Badges */}
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

export default IndexTemplate;
