import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import HorizontalCarousel from "@/components/HorizontalCarousel";
import { storefrontApiRequest, COLLECTION_PRODUCTS_QUERY, PRODUCTS_QUERY, MAKE_COLLECTION_MAP } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { trackEvent } from "@/lib/analytics";

interface RelatedProductsCarouselProps {
  currentProductId: string;
  currentProductHandle: string;
  currentProductType: string;
  tags: string[];
}

const RelatedProductsCarousel = ({ currentProductId, currentProductHandle, currentProductType, tags }: RelatedProductsCarouselProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const make = useMemo(() => {
    const tag = tags.find(t => t.toLowerCase().startsWith('make:'));
    return tag ? tag.slice(5) : null;
  }, [tags]);

  const model = useMemo(() => {
    const tag = tags.find(t => t.toLowerCase().startsWith('model:'));
    return tag ? tag.slice(6) : null;
  }, [tags]);

  const isUniversal = useMemo(() =>
    tags.some(t => t.toLowerCase() === 'universal fit'),
    [tags]
  );

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        let fetched: ShopifyProduct[] = [];

        if (!isUniversal && make) {
          const collectionHandle = MAKE_COLLECTION_MAP[make];
          if (collectionHandle) {
            const result = await storefrontApiRequest(COLLECTION_PRODUCTS_QUERY, {
              handle: collectionHandle,
              first: 40,
              after: null,
              sortKey: "BEST_SELLING",
              reverse: false,
            });
            fetched = (result?.data?.collectionByHandle?.products?.edges || []) as ShopifyProduct[];
          }
        } else {
          // Universal or no make — fetch general best sellers
          const result = await storefrontApiRequest(PRODUCTS_QUERY, {
            first: 40,
            query: null,
            sortKey: "BEST_SELLING",
            reverse: false,
            after: null,
          });
          fetched = (result?.data?.products?.edges || []) as ShopifyProduct[];
        }

        // Exclude current product
        const others = fetched.filter(p => p.node.id !== currentProductId && p.node.handle !== currentProductHandle);

        // Split by same model vs different model
        const sameModel: ShopifyProduct[] = [];
        const diffModel: ShopifyProduct[] = [];
        for (const p of others) {
          if (model && p.node.title.toLowerCase().includes(model.toLowerCase())) {
            sameModel.push(p);
          } else {
            diffModel.push(p);
          }
        }

        // Deduplicate by productType for variety
        const seen = new Set<string>();
        seen.add(currentProductType.toLowerCase());
        const diverse: ShopifyProduct[] = [];

        for (const p of [...sameModel, ...diffModel]) {
          const type = p.node.productType?.toLowerCase() || '';
          if (!seen.has(type)) {
            seen.add(type);
            diverse.push(p);
          }
        }

        // If we don't have enough diverse types, fill with same-model products of any type
        if (diverse.length < 8) {
          for (const p of [...sameModel, ...diffModel]) {
            if (diverse.length >= 12) break;
            if (!diverse.some(d => d.node.id === p.node.id)) {
              diverse.push(p);
            }
          }
        }

        setProducts(diverse.slice(0, 12));
      } catch (err) {
        console.error("Failed to load related products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProductId, currentProductHandle, currentProductType, make, model, isUniversal]);

  if (loading || products.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="px-4 lg:px-8 py-4 border-b border-border">
        <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">YOU MAY ALSO LIKE</h2>
      </div>
      <HorizontalCarousel>
        {products.map((p) => (
          <ProductCard key={p.node.id} product={p} compact />
        ))}
      </HorizontalCarousel>
    </section>
  );
};

export default RelatedProductsCarousel;
