import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { products, collections } from "@/data/products";

const Index = () => {
  const [vehicle, setVehicle] = useState<{ year: string; make: string; model: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState("bull-guards");

  const filteredProducts = products
    .filter((p) => p.category === activeCategory)
    .slice(0, 6);

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader vehicle={vehicle} />

      <HeroSection onVehicleSelect={setVehicle} />

      {/* Category Grid */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-6 py-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
          <Link to="/collections/bull-guards-grille-guards" className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
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
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="font-display text-xs tracking-wider block">{cat.title.toUpperCase()}</span>
                <span className="font-display text-[10px] tracking-widest text-primary">{cat.count} PARTS</span>
              </div>
            </Link>
          ))}
        </div>
        {/* Second row */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {collections.slice(4, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="group relative aspect-[4/3] border-r border-b border-border last:border-r-0 overflow-hidden"
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="font-display text-xs tracking-wider block">{cat.title.toUpperCase()}</span>
                <span className="font-display text-[10px] tracking-widest text-primary">{cat.count} PARTS</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content: Sidebar + Products */}
      <div className="flex">
        <CategorySidebar activeCategory={activeCategory} onCategorySelect={setActiveCategory} />

        <main className="flex-1 min-w-0">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm tracking-wider">
                {vehicle ? `PARTS FOR ${vehicle.year} ${vehicle.make} ${vehicle.model}`.toUpperCase() : "FEATURED PARTS"}
              </h2>
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                {displayProducts.length} ITEMS
              </span>
            </div>
            <div className="flex items-center gap-2 border border-border px-3 py-1.5">
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">SORT: BEST SELLING</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-0 stagger-fade-in">
            {displayProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`} className="border-r border-b border-border">
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
