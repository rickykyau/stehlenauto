/**
 * SHOPIFY TEMPLATE: templates/collection.liquid
 */
import { useState, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Loader2, SlidersHorizontal, X } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useShopifyProducts, useShopifyCollections } from "@/hooks/useShopifyProducts";
import type { ShopifyProduct } from "@/lib/shopify";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type SortOption = "best-selling" | "price-ascending" | "price-descending" | "title-ascending";

const SORT_LABELS: Record<SortOption, string> = {
  "best-selling": "BEST SELLING",
  "price-ascending": "PRICE: LOW → HIGH",
  "price-descending": "PRICE: HIGH → LOW",
  "title-ascending": "A–Z",
};

const SORT_MAP: Record<SortOption, { sortKey: 'BEST_SELLING' | 'PRICE' | 'TITLE'; reverse: boolean }> = {
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  "price-ascending": { sortKey: "PRICE", reverse: false },
  "price-descending": { sortKey: "PRICE", reverse: true },
  "title-ascending": { sortKey: "TITLE", reverse: false },
};

const PRICE_RANGES = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "$200 – $500", min: 200, max: 500 },
  { label: "$500+", min: 500, max: Infinity },
];

const ITEMS_PER_PAGE = 48;

const CollectionTemplate = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: shopifyCollections, isLoading: collectionsLoading } = useShopifyCollections(50);

  const sort = (searchParams.get("sort_by") as SortOption) || "best-selling";
  const isAllProducts = handle === "all" || !handle;
  const collection = !isAllProducts ? (shopifyCollections || []).find((c) => c.node.handle === handle) : null;
  const title = isAllProducts ? "All Products" : (collection?.node.title || handle || "All Products");

  const shopifyQuery = collection ? `product_type:${collection.node.title}` : selectedCategory || undefined;
  const { sortKey, reverse } = SORT_MAP[sort];

  const { data, isLoading } = useShopifyProducts({
    first: ITEMS_PER_PAGE,
    query: shopifyQuery,
    sortKey,
    reverse,
  });

  // Sync initial data
  const initialProducts = data?.products || [];
  const pageInfo = data?.pageInfo;

  // Use allProducts if we've loaded more, otherwise use initial
  const displayProducts = allProducts.length > 0 ? allProducts : initialProducts;

  // Track pagination state from initial load
  const currentHasMore = allProducts.length > 0 ? hasMore : (pageInfo?.hasNextPage || false);
  const currentCursor = allProducts.length > 0 ? nextCursor : (pageInfo?.endCursor || null);

  // Reset accumulated products when query/sort changes
  const queryKey = `${shopifyQuery}-${sortKey}-${reverse}`;
  const [lastQueryKey, setLastQueryKey] = useState(queryKey);
  if (queryKey !== lastQueryKey) {
    setAllProducts([]);
    setNextCursor(null);
    setHasMore(false);
    setLastQueryKey(queryKey);
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !currentCursor) return;
    setLoadingMore(true);

    try {
      const { storefrontApiRequest, PRODUCTS_QUERY } = await import("@/lib/shopify");
      const result = await storefrontApiRequest(PRODUCTS_QUERY, {
        first: ITEMS_PER_PAGE,
        query: shopifyQuery || null,
        sortKey,
        reverse,
        after: currentCursor,
      });

      const newProducts = (result?.data?.products?.edges || []) as ShopifyProduct[];
      const newPageInfo = result?.data?.products?.pageInfo;

      const base = allProducts.length > 0 ? allProducts : initialProducts;
      setAllProducts([...base, ...newProducts]);
      setNextCursor(newPageInfo?.endCursor || null);
      setHasMore(newPageInfo?.hasNextPage || false);
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, currentCursor, shopifyQuery, sortKey, reverse, allProducts, initialProducts]);

  // Apply client-side price filtering
  const filteredProducts = selectedPriceRange !== null
    ? displayProducts.filter((p) => {
        const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
        const range = PRICE_RANGES[selectedPriceRange];
        return price >= range.min && price < (range.max === Infinity ? 999999 : range.max);
      })
    : displayProducts;

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedPriceRange !== null ? 1 : 0);

  const setSort = (s: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_by", s);
    setSearchParams(params);
    setShowSortMenu(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(null);
    setAllProducts([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="border-b border-border px-4 lg:px-8 py-3 flex items-center gap-2">
        <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-display text-[10px] tracking-widest text-foreground">{title.toUpperCase()}</span>
      </div>

      {/* Collection Header */}
      <div className="border-b border-border px-4 lg:px-8 py-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">{title.toUpperCase()}</h1>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Refine Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 border border-border px-3 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                <SlidersHorizontal className="w-3 h-3" />
                REFINE {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:w-[380px] bg-background border-border">
              <SheetHeader>
                <SheetTitle className="font-display text-sm tracking-widest">REFINE PRODUCTS</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                {/* Category Filter */}
                {isAllProducts && (
                  <div>
                    <h3 className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">CATEGORY</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setSelectedCategory(null); setAllProducts([]); }}
                        className={`w-full text-left px-3 py-2 font-display text-[10px] tracking-widest transition-colors ${
                          !selectedCategory ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        ALL CATEGORIES
                      </button>
                      {(shopifyCollections || []).map((c) => (
                        <button
                          key={c.node.id}
                          onClick={() => { setSelectedCategory(`product_type:${c.node.title}`); setAllProducts([]); }}
                          className={`w-full text-left px-3 py-2 font-display text-[10px] tracking-widest transition-colors ${
                            selectedCategory === `product_type:${c.node.title}` ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {c.node.title.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">PRICE</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedPriceRange(null)}
                      className={`w-full text-left px-3 py-2 font-display text-[10px] tracking-widest transition-colors ${
                        selectedPriceRange === null ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ALL PRICES
                    </button>
                    {PRICE_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPriceRange(i)}
                        className={`w-full text-left px-3 py-2 font-display text-[10px] tracking-widest transition-colors ${
                          selectedPriceRange === i ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {range.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-3 border border-border font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    CLEAR ALL FILTERS
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <span className="font-display text-[10px] tracking-widest text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}
            {currentHasMore && "+"}
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 border border-border px-3 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            SORT: {SORT_LABELS[sort]} <ChevronDown className="w-3 h-3" />
          </button>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 border border-border bg-card min-w-[200px] shadow-lg">
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`w-full text-left px-4 py-2.5 font-display text-[10px] tracking-widest transition-colors ${
                      sort === key ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFilterCount > 0 && (
        <div className="border-b border-border px-4 lg:px-8 py-2 flex items-center gap-2 flex-wrap">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 font-display text-[10px] tracking-widest">
              {selectedCategory.replace("product_type:", "").toUpperCase()}
              <button onClick={() => { setSelectedCategory(null); setAllProducts([]); }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedPriceRange !== null && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 font-display text-[10px] tracking-widest">
              {PRICE_RANGES[selectedPriceRange].label.toUpperCase()}
              <button onClick={() => setSelectedPriceRange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Product Grid */}
      <div className="p-4 lg:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-sm tracking-widest text-muted-foreground mb-4">NO PRODUCTS FOUND</p>
            <Link to="/collections/all" className="font-display text-xs tracking-widest text-primary hover:brightness-110">
              ← VIEW ALL PRODUCTS
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade-in">
              {filteredProducts.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>

            {/* Load More */}
            {currentHasMore && selectedPriceRange === null && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 border border-border px-8 py-3 font-display text-xs tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      LOADING...
                    </>
                  ) : (
                    "LOAD MORE PRODUCTS"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collection links — from Shopify */}
      <section className="border-t border-border">
        <div className="px-4 lg:px-8 py-4 border-b border-border">
          <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground">ALL CATEGORIES</h3>
        </div>
        {collectionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4">
            {(shopifyCollections || []).map((c) => (
              <Link
                key={c.node.id}
                to={`/collections/${c.node.handle}`}
                className={`px-4 py-3 border-r border-b border-border font-display text-[10px] tracking-widest transition-colors ${
                  handle === c.node.handle ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.node.title.toUpperCase()}
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
};

export default CollectionTemplate;
