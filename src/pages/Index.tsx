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
  { handle: "bull-guards-grille-guards", title: "Bull Guards & Grille Guards", count: 190 },
  { handle: "trailer-hitches", title: "Trailer Hitches", count: 288 },
  { handle: "tonneau-covers", title: "Tonneau Covers", count: 287 },
  { handle: "headlights", title: "Headlights", count: 161 },
];

const COLLECTION_IMAGE_QUERY = `
  query GetCollectionImage($handle: String!) {
    collectionByHandle(handle: $handle) {
      image { url }
      products(first: 1) {
        edges { node { featuredImage { url } } }
      }
    }
  }
`;

function useCategoryImages() {
  return useQuery({
    queryKey: ["category-images"],
    queryFn: async () => {
      const results: Record<string, string> = {};
      await Promise.all(
        TOP_CATEGORIES.map(async (cat) => {
          try {
            const data = await storefrontApiRequest(COLLECTION_IMAGE_QUERY, { handle: cat.handle });
            const col = data?.data?.collectionByHandle;
            results[cat.handle] =
              col?.image?.url ||
              col?.products?.edges?.[0]?.node?.featuredImage?.url ||
              "";
          } catch {
            results[cat.handle] = "";
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
  const { data: categoryImages } = useCategoryImages();
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
            const imageUrl = categoryImages?.[cat.handle];
            return (
              <Link
                key={cat.handle}
                to={`/collections/${cat.handle}`}
                className="group relative aspect-[4/3] border-r border-b border-border last:border-r-0 overflow-hidden"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt={cat.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="font-display text-xs tracking-wider block mb-1">{cat.title.toUpperCase()}</span>
                  <span className="font-body text-xs text-muted-foreground">{cat.count} Products</span>
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
