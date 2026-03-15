import { useState, useCallback, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import HorizontalCarousel from "@/components/HorizontalCarousel";
import { storefrontApiRequest, PRODUCTS_QUERY } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";

interface RelatedProductsCarouselProps {
  initialProducts: ShopifyProduct[];
  excludeHandle: string;
  productType?: string;
}

const MAX_PRODUCTS = 20;
const BATCH_SIZE = 8;

const RelatedProductsCarousel = ({ initialProducts, excludeHandle, productType }: RelatedProductsCarouselProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && initialProducts.length > 0) {
      initializedRef.current = true;
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || products.length >= MAX_PRODUCTS) return;
    setLoading(true);
    try {
      const query = productType ? `product_type:*${productType}*` : undefined;
      const result = await storefrontApiRequest(PRODUCTS_QUERY, {
        first: BATCH_SIZE,
        query: query || null,
        sortKey: "BEST_SELLING",
        reverse: false,
        after: cursor || null,
      });
      const newProducts = (result?.data?.products?.edges || []) as ShopifyProduct[];
      const filtered = newProducts.filter((p) => p.node.handle !== excludeHandle);
      const pageInfo = result?.data?.products?.pageInfo;
      setProducts((prev) => {
        const existing = new Set(prev.map((p) => p.node.id));
        const unique = filtered.filter((p) => !existing.has(p.node.id));
        return [...prev, ...unique].slice(0, MAX_PRODUCTS);
      });
      setCursor(pageInfo?.endCursor || null);
      setHasMore(pageInfo?.hasNextPage || false);
    } catch (err) {
      console.error("Failed to load more related products:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, products.length, cursor, productType, excludeHandle]);

  if (products.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="px-4 lg:px-8 py-4 border-b border-border">
        <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">YOU MAY ALSO LIKE</h2>
      </div>
      <HorizontalCarousel onNearEnd={loadMore}>
        {products.map((p) => (
          <ProductCard key={p.node.id} product={p} compact />
        ))}
      </HorizontalCarousel>
    </section>
  );
};

export default RelatedProductsCarousel;
