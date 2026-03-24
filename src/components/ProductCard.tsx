/**
 * SHOPIFY SNIPPET: snippets/product-card.liquid
 */
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Loader2, Truck } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { trackEvent, trackKlaviyoEvent } from "@/lib/analytics";
import type { ShopifyProduct } from "@/lib/shopify";
import { isUniversalProduct } from "@/lib/shopify";

export interface CrossSellSource {
  sourceItemId: string;
  placement: "pdp" | "cart" | "post_add";
}

interface ProductCardProps {
  product: ShopifyProduct;
  compact?: boolean;
  listName?: string;
  index?: number;
  crossSellSource?: CrossSellSource;
}

const ProductCard = ({ product, compact = false, listName, index, crossSellSource }: ProductCardProps) => {
  const { addItem, isLoading } = useCartStore();
  const p = product.node;
  const universal = isUniversalProduct(product);
  const firstVariant = p.variants.edges[0]?.node;
  const image = p.images.edges[0]?.node?.url || "/placeholder.svg";
  const price = parseFloat(p.priceRange.minVariantPrice.amount);
  const compareAtRaw = p.compareAtPriceRange?.minVariantPrice?.amount;
  const compareAt = compareAtRaw && parseFloat(compareAtRaw) > 0
    ? parseFloat(compareAtRaw)
    : null;
  const inStock = firstVariant?.availableForSale ?? true;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    trackEvent("add_to_cart", {
      currency: "USD",
      value: price,
      items: [{
        item_id: p.id,
        item_name: p.title,
        item_brand: "Stehlen",
        price,
        quantity: 1,
        item_category: p.productType || undefined,
      }],
    });
    trackKlaviyoEvent("Added to Cart", {
      $value: price,
      AddedItemProductName: p.title,
      AddedItemProductID: p.id,
      AddedItemSKU: firstVariant?.sku || "",
      AddedItemPrice: price,
      AddedItemQuantity: 1,
    });
    if (crossSellSource) {
      trackEvent("cross_sell_added", {
        source_item_id: crossSellSource.sourceItemId,
        added_item_id: p.id,
        added_item_name: p.title,
        placement: crossSellSource.placement,
      });
    }
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });
  };

  const handleSelectItem = () => {
    if (listName !== undefined) {
      trackEvent("select_item", {
        item_list_name: listName,
        item_id: p.id,
        item_name: p.title,
        price,
        index: index ?? 0,
      });
    }
    if (crossSellSource) {
      trackEvent("cross_sell_clicked", {
        source_item_id: crossSellSource.sourceItemId,
        clicked_item_id: p.id,
        clicked_item_name: p.title,
        placement: crossSellSource.placement,
      });
    }
  };

  return (
    <Link to={`/products/${p.handle}`} className="block h-full" onClick={handleSelectItem}>
      <div className="group bg-card border border-border overflow-hidden transition-colors hover:border-primary/40 flex flex-col h-full">
        {/* Image */}
        <div className={`relative ${compact ? "aspect-[4/3]" : "aspect-square"} bg-muted overflow-hidden`}>
          <img
            src={image}
            alt={p.images.edges[0]?.node?.altText || p.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="font-display text-xs tracking-widest text-muted-foreground">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`${compact ? "p-3" : "p-4"} flex flex-col flex-1`}>
          <h4 className={`font-body ${compact ? "text-xs" : "text-sm"} leading-relaxed mb-2 text-foreground/90 line-clamp-2 flex-1`}>{p.title}</h4>
          {universal && (
            <span className="inline-flex items-center gap-1 mb-1 w-fit px-1.5 py-0.5 border border-primary/40 text-primary font-display text-[8px] tracking-widest">
              UNIVERSAL FIT
            </span>
          )}
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg text-primary font-bold">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="font-display text-xs text-muted-foreground line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* CTA — split: View + Add to Cart */}
        <div className="flex border-t border-border">
          <span className="flex-1 h-11 flex items-center justify-center text-muted-foreground font-display text-[10px] tracking-widest transition-colors group-hover:text-foreground">
            VIEW PRODUCT
          </span>
          {inStock ? (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-12 h-11 border-l border-border flex items-center justify-center bg-primary text-primary-foreground transition-colors hover:brightness-110 btn-press shrink-0 relative disabled:opacity-50"
              aria-label="Add to cart"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <Plus className="w-2.5 h-2.5 absolute top-1.5 right-1.5" strokeWidth={3} />
                </>
              )}
            </button>
          ) : (
            <span className="w-12 h-11 border-l border-border flex items-center justify-center bg-muted text-muted-foreground shrink-0 relative">
              <ShoppingCart className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
