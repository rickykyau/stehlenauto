import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Package, Shield, Truck, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, products } from "@/data/products";

const ProductDetailPage = () => {
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
          <Link to="/" className="font-display text-xs tracking-widest text-primary hover:brightness-110">
            ← BACK TO HOME
          </Link>
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

      {/* Breadcrumb */}
      <div className="border-b border-border px-4 lg:px-6 py-3 flex items-center gap-2">
        <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <Link to={`/collections/${product.category}`} className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">
          {product.category.toUpperCase().replace("-", " ")}
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-display text-[10px] tracking-widest text-foreground truncate max-w-[200px]">
          {product.sku}
        </span>
      </div>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
        {/* Left: Images */}
        <div className="border-r border-border">
          {/* Main image */}
          <div className="relative aspect-square bg-muted">
            <img
              src={product.images[selectedImage] || product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {/* Fitment badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary px-3 py-1.5">
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
              <span className="font-display text-[10px] tracking-widest text-primary-foreground font-bold">VERIFIED FIT</span>
            </div>
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex border-t border-border">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-1 aspect-square border-r border-border last:border-r-0 overflow-hidden ${
                    selectedImage === i ? "ring-2 ring-inset ring-primary" : "opacity-60 hover:opacity-100"
                  } transition-opacity`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="p-6 lg:p-10 flex flex-col">
          {/* SKU + Year */}
          <div className="flex items-center gap-4 mb-4">
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">{product.sku}</span>
            <span className="font-display text-[10px] tracking-widest text-primary">{product.yearRange}</span>
          </div>

          {/* Title */}
          <h1 className="text-xl lg:text-2xl font-display font-bold tracking-wider leading-tight mb-2">
            {product.title.toUpperCase()}
          </h1>

          {/* Vehicle compatibility */}
          <p className="font-display text-xs tracking-wider text-muted-foreground mb-6">
            {product.make} {product.model.join(" / ")} · {product.yearRange}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.compareAt && (
              <span className="font-display text-sm text-muted-foreground line-through">
                ${product.compareAt.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            {product.inStock ? (
              <>
                <div className="w-2.5 h-2.5 bg-success" />
                <span className="font-display text-xs tracking-widest text-success">IN STOCK — READY TO SHIP</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 bg-destructive" />
                <span className="font-display text-xs tracking-widest text-destructive">OUT OF STOCK</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Quantity + Add to cart */}
          <div className="flex gap-0 mb-6">
            <div className="flex border border-border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-12 h-12 flex items-center justify-center font-display text-lg text-muted-foreground hover:text-foreground transition-colors btn-press"
              >
                −
              </button>
              <div className="w-12 h-12 flex items-center justify-center border-x border-border font-display text-sm">
                {qty}
              </div>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-12 h-12 flex items-center justify-center font-display text-lg text-muted-foreground hover:text-foreground transition-colors btn-press"
              >
                +
              </button>
            </div>
            <button className="flex-1 h-12 bg-primary text-primary-foreground font-display text-sm font-bold uppercase tracking-widest btn-press hover:brightness-110 transition-all flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              ADD TO BUILD — ${(product.price * qty).toFixed(2)}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {[
              { icon: Truck, label: "FREE SHIPPING" },
              { icon: Shield, label: "GUARANTEED FITMENT" },
              { icon: Check, label: "MANUFACTURER WARRANTY" },
              { icon: Package, label: "30-DAY RETURNS" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 border border-border p-3">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="font-display text-[9px] tracking-widest text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Specs — Blueprint Grid */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-6 py-4 border-b border-border">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">TECHNICAL SPECIFICATIONS</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(product.specs).map(([key, value], i) => (
            <div key={key} className="border-r border-b border-border p-4 last:border-r-0">
              <span className="font-display text-[10px] tracking-widest text-muted-foreground block mb-1">{key.toUpperCase()}</span>
              <span className="font-display text-sm tracking-wider">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Complete the Build */}
      {related.length > 0 && (
        <section className="border-b border-border">
          <div className="px-4 lg:px-6 py-4 border-b border-border">
            <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">COMPLETE THE BUILD</h2>
          </div>
          <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 stagger-fade-in">
            {related.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="border-r border-b border-border last:border-r-0">
                <ProductCard
                  image={p.image}
                  title={p.title}
                  price={`$${p.price.toFixed(2)}`}
                  category={p.category}
                  inStock={p.inStock}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default ProductDetailPage;
