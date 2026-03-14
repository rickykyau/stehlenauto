/**
 * SHOPIFY TEMPLATE: templates/index.liquid
 * SECTIONS: hero, fitment-selector, category-grid, featured-products, trust-badges
 * 
 * Liquid notes:
 * - Hero: section with image picker + text fields
 * - Category grid: {% for collection in collections %} with collection.image
 * - Featured products: {% for product in collections['frontpage'].products %}
 * - Fitment selector: Requires Shopify app or custom JS (design reference only)
 */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { products, collections } from "@/data/products";

const IndexTemplate = () => {
  const [vehicle, setVehicle] = useState<{ year: string; make: string; model: string } | null>(null);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "bull-guards";

  const filteredProducts = products
    .filter((p) => p.category === activeCategory)
    .slice(0, 6);

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader vehicle={vehicle} />
      <HeroSection onVehicleSelect={setVehicle} />

      {/* SECTION: category-grid 
          Liquid: {% for collection in collections %}
          Each links to /collections/{{ collection.handle }} */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-6 py-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
          <Link to="/collections/all" className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
            VIEW ALL <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {collections.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="group relative aspect-[4/3] border-r border-b border-border last:border-r-0 overflow-hidden"
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="font-display text-xs tracking-wider block">{cat.title.toUpperCase()}</span>
                <span className="font-display text-[10px] tracking-widest text-primary">{cat.count} PARTS</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {collections.slice(4, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="group relative aspect-[4/3] border-r border-b border-border last:border-r-0 overflow-hidden"
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="font-display text-xs tracking-wider block">{cat.title.toUpperCase()}</span>
                <span className="font-display text-[10px] tracking-widest text-primary">{cat.count} PARTS</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION: featured-products
          Liquid: {% for product in collections['frontpage'].products limit: 6 %}
          Sidebar: static links to /collections/{{ handle }}, not client-side filtering */}
      <div className="flex">
        {/* Sidebar: collection links (Liquid: {% for collection in collections %}) */}
        <nav className="hidden lg:block w-72 border-r border-border shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">CATEGORIES</h2>
          </div>
          <div className="py-2">
            {collections.map((cat) => (
              <Link
                key={cat.id}
                to={`/collections/${cat.slug}`}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2 border-l-transparent text-sidebar-foreground hover:bg-sidebar-accent/50 hover:border-l-primary"
              >
                <span className="font-body text-sm flex-1">{cat.title}</span>
                <span className="font-display text-[10px] text-muted-foreground">{cat.count}</span>
              </Link>
            ))}
          </div>
          {/* Trust badges */}
          <div className="p-4 border-t border-border space-y-3">
            {["Free Shipping", "Guaranteed Fitment", "Manufacturer Warranty", "30-Day Returns"].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary" />
                <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">{badge}</span>
              </div>
            ))}
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm tracking-wider">FEATURED PARTS</h2>
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                {displayProducts.length} ITEMS
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-0 stagger-fade-in">
            {displayProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.slug}`} className="block border-r border-b border-border">
                <ProductCard
                  image={product.image}
                  title={product.title}
                  price={`$${product.price.toFixed(2)}`}
                  category={product.category}
                  inStock={product.inStock}
                  specs={Object.entries(product.specs).slice(0, 2).map(([, v]) => v).join(" · ").toUpperCase()}
                />
              </Link>
            ))}
          </div>
        </main>
      </div>

      {/* SECTION: trust-badges */}
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
