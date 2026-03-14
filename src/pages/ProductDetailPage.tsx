/**
 * SHOPIFY TEMPLATE: templates/product.liquid
 * 
 * Liquid mapping:
 * - Title: {{ product.title }}
 * - Price: {{ product.price | money }}
 * - Images: {% for image in product.images %}
 * - Variants: {% for variant in product.variants %}
 * - Description: {{ product.description }}
 * - Add to cart: <form action="/cart/add" method="post">
 * - Related: {% for product in collection.products limit: 4 %}
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShoppingCart, Truck, RotateCcw, Shield } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, products } from "@/data/products";

const ProductTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="font-display text-sm tracking-wider text-muted-foreground mb-4">PRODUCT NOT FOUND</p>
          <Link to="/collections/all" className="font-display text-xs tracking-widest text-primary hover:brightness-110">← BACK TO PRODUCTS</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Announcement */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center">
        <span className="font-display text-[11px] tracking-widest text-primary">
          FREE SHIPPING ON ALL ORDERS | FITMENT GUARANTEED
        </span>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-border px-4 lg:px-8 py-3 flex items-center gap-2">
        <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <Link to="/collections/all" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">PRODUCTS</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-display text-[10px] tracking-widest text-foreground truncate max-w-[300px]">
          {product.title.toUpperCase()}
        </span>
      </div>

      {/* Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Images */}
        <div className="border-b lg:border-b-0 lg:border-r border-border">
          <div className="relative aspect-square bg-card">
            <img
              src={product.images[selectedImage] || product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 p-4 border-t border-border overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 shrink-0 border-2 overflow-hidden transition-colors ${
                    selectedImage === i ? "border-primary" : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="p-6 lg:p-10 flex flex-col">
          {/* Title */}
          <h1 className="text-xl lg:text-2xl font-display font-bold tracking-wider leading-tight mb-6">
            {product.title.toUpperCase()}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-border">
            <span className="font-display text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.compareAt && (
              <span className="font-display text-sm text-muted-foreground line-through">
                ${product.compareAt.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex gap-3 mb-6">
            <div className="flex border border-border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-14 h-12 flex items-center justify-center border-x border-border font-display text-sm">
                {qty}
              </div>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              className="flex-1 h-12 bg-primary text-primary-foreground font-display text-sm font-bold uppercase tracking-widest btn-press hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              ADD TO CART
            </button>
          </div>

          {/* Trust badges row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Truck, label: "Free", sublabel: "Shipping" },
              { icon: RotateCcw, label: "30-Day", sublabel: "Returns" },
              { icon: Shield, label: "Manufacturer", sublabel: "Warranty" },
            ].map(({ icon: Icon, label, sublabel }) => (
              <div key={label} className="flex items-center gap-2 border border-border p-3 bg-card">
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="font-display text-[10px] tracking-wider text-foreground block leading-tight">{label}</span>
                  <span className="font-display text-[10px] tracking-wider text-muted-foreground block leading-tight">{sublabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Product Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary" />
              <h2 className="font-display text-sm tracking-[0.15em] text-muted-foreground">PRODUCT OVERVIEW</h2>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary" />
              <h2 className="font-display text-sm tracking-[0.15em] text-muted-foreground">SPECIFICATIONS</h2>
            </div>
            <div className="border border-border">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div key={key} className={`flex ${i > 0 ? "border-t border-border" : ""}`}>
                  <div className="w-40 shrink-0 px-4 py-3 bg-card font-display text-[10px] tracking-widest text-muted-foreground border-r border-border">
                    {key.toUpperCase()}
                  </div>
                  <div className="flex-1 px-4 py-3 font-body text-sm text-foreground/80">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-border">
          <div className="px-4 lg:px-8 py-6 border-b border-border">
            <h2 className="font-display text-sm tracking-[0.15em] text-muted-foreground">YOU MAY ALSO LIKE</h2>
          </div>
          <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade-in">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                image={p.image}
                title={p.title}
                price={`$${p.price.toFixed(2)}`}
                slug={p.slug}
                inStock={p.inStock}
              />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default ProductTemplate;
