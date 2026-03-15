/**
 * SHOPIFY TEMPLATE: templates/product.liquid
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShoppingCart, Truck, RotateCcw, Shield, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { useShopifyProduct, useShopifyProducts } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";

const ProductTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading: productLoading } = useShopifyProduct(slug || "");
  const { addItem, isLoading: cartLoading } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Fetch related products
  const { data: relatedData } = useShopifyProducts({ first: 4 });
  const relatedProducts = (relatedData?.products || []).filter(p => p.node.handle !== slug).slice(0, 4);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <SiteFooter />
      </div>
    );
  }

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

  const images = product.images?.edges || [];
  const variants = product.variants?.edges || [];
  const selectedVariant = variants[selectedVariantIdx]?.node || variants[0]?.node;
  const price = parseFloat(selectedVariant?.price?.amount || "0");
  const compareAt = selectedVariant?.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice.amount) : null;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: qty,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
  };

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
              src={images[selectedImage]?.node?.url || "/placeholder.svg"}
              alt={images[selectedImage]?.node?.altText || product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 p-4 border-t border-border overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 shrink-0 border-2 overflow-hidden transition-colors ${
                    selectedImage === i ? "border-primary" : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.node.url} alt="" className="w-full h-full object-cover" loading="lazy" />
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
            <span className="font-display text-3xl font-bold text-primary">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="font-display text-sm text-muted-foreground line-through">
                ${compareAt.toFixed(2)}
              </span>
            )}
          </div>

          {/* Variant selector */}
          {variants.length > 1 && product.options?.some((o: { name: string }) => o.name !== "Title") && (
            <div className="mb-6">
              {product.options
                .filter((o: { name: string }) => o.name !== "Title")
                .map((option: { name: string; values: string[] }) => (
                  <div key={option.name} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-5 bg-primary" />
                      <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground">{option.name.toUpperCase()}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value: string) => {
                        const variantIdx = variants.findIndex(v =>
                          v.node.selectedOptions.some(so => so.name === option.name && so.value === value)
                        );
                        const isSelected = selectedVariant?.selectedOptions.some(
                          so => so.name === option.name && so.value === value
                        );
                        return (
                          <button
                            key={value}
                            onClick={() => variantIdx >= 0 && setSelectedVariantIdx(variantIdx)}
                            className={`px-4 py-2 border font-display text-xs tracking-wider transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}

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
              onClick={handleAddToCart}
              disabled={cartLoading || !selectedVariant?.availableForSale}
              className="flex-1 h-12 bg-primary text-primary-foreground font-display text-sm font-bold uppercase tracking-widest btn-press hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cartLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !selectedVariant?.availableForSale ? (
                "SOLD OUT"
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  ADD TO CART
                </>
              )}
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
          {product.description && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary" />
                <h2 className="font-display text-sm tracking-[0.15em] text-muted-foreground">PRODUCT OVERVIEW</h2>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border">
          <div className="px-4 lg:px-8 py-6 border-b border-border">
            <h2 className="font-display text-sm tracking-[0.15em] text-muted-foreground">YOU MAY ALSO LIKE</h2>
          </div>
          <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade-in">
            {relatedProducts.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default ProductTemplate;
