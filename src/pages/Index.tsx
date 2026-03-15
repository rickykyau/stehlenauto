/**
 * SHOPIFY TEMPLATE: templates/index.liquid
 * SECTIONS: hero, category-grid, featured-products, trust-badges
 */
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useShopifyProducts, useShopifyCollections } from "@/hooks/useShopifyProducts";

const IndexTemplate = () => {
  const { data, isLoading } = useShopifyProducts({ first: 8 });
  const { data: shopifyCollections, isLoading: collectionsLoading } = useShopifyCollections(50);
  const featuredProducts = data?.products || [];

  // Filter to only show product-type category collections
  const allowedHandles = [
    'bull-guards-grille-guards',
    'tonneau-covers',
    'trailer-hitches',
    'front-grilles',
    'headlights',
    'truck-bed-mats',
    'floor-mats',
    'running-boards-side-steps',
    'roof-racks-baskets',
    'chase-racks-sport-bars',
    'molle-panels',
    'under-seat-storage'
  ];

  const categoryCollections = (shopifyCollections || [])
    .filter(col => {
      const handle = col.node.handle;
      return allowedHandles.includes(handle) && !handle.endsWith('-parts') && handle !== 'frontpage';
    })
    .map(col => ({
      ...col,
      productCount: col.node.products?.edges?.length || 0
    }))
    .sort((a, b) => b.productCount - a.productCount);

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
        {collectionsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {(shopifyCollections || []).map((col) => (
              <Link
                key={col.node.id}
                to={`/collections/${col.node.handle}`}
                className="group relative aspect-[4/3] border-r border-b border-border last:border-r-0 overflow-hidden"
              >
                {col.node.image ? (
                  <img src={col.node.image.url} alt={col.node.image.altText || col.node.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="font-display text-xs tracking-wider block">{col.node.title.toUpperCase()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
