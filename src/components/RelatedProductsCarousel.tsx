import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
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
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Sync initial products
  useEffect(() => {
    if (!initializedRef.current && initialProducts.length > 0) {
      initializedRef.current = true;
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows, products]);

  const scrollBy = (direction: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.getBoundingClientRect().width || 280;
    el.scrollBy({ left: direction * (cardWidth + 12), behavior: "smooth" });
  };

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

  // Load more when scrolling near end
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth > el.scrollWidth - 300) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (products.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="px-4 lg:px-8 py-4 border-b border-border">
        <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">YOU MAY ALSO LIKE</h2>
      </div>
      <div className="relative group/carousel">
        {/* Left fade + arrow */}
        {showLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scrollBy(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-background/60 border border-border text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Right fade + arrow */}
        {showRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scrollBy(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-background/60 border border-border text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto p-4 lg:p-6 scrollbar-none"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {products.map((p) => (
            <div
              key={p.node.id}
              data-card
              className="shrink-0 w-[calc(50%-6px)] lg:w-[calc(25%-9px)]"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard product={p} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProductsCarousel;
