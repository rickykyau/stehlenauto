/**
 * SHOPIFY TEMPLATE: templates/collection.liquid
 */
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Loader2, SlidersHorizontal, Truck, X } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import FitmentSelector from "@/components/FitmentSelector";
import RefineSidebar, { type RefineFilters } from "@/components/RefineSidebar";
import { useShopifyProducts, useShopifyCollections } from "@/hooks/useShopifyProducts";
import { useVehicle } from "@/contexts/VehicleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAvailableFilterOptions } from "@/hooks/useAvailableFilterOptions";
import type { ShopifyProduct } from "@/lib/shopify";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type SortOption = "best-selling" | "price-ascending" | "price-descending" | "title-ascending";

const SORT_LABELS: Record<SortOption, string> = {
  "best-selling": "BEST SELLERS",
  "price-ascending": "PRICE: LOW → HIGH",
  "price-descending": "PRICE: HIGH → LOW",
  "title-ascending": "NEWEST",
};

const SORT_MAP: Record<SortOption, { sortKey: 'BEST_SELLING' | 'PRICE' | 'TITLE'; reverse: boolean }> = {
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  "price-ascending": { sortKey: "PRICE", reverse: false },
  "price-descending": { sortKey: "PRICE", reverse: true },
  "title-ascending": { sortKey: "TITLE", reverse: false },
};

const ITEMS_PER_PAGE = 48;

/** Map category handles to search keywords for product_type matching */
const CATEGORY_KEYWORDS: Record<string, string> = {
  "bull-guards-grille-guards": "bull guard",
  "tonneau-covers": "tonneau cover",
  "trailer-hitches": "trailer hitch",
  "front-grilles": "grille",
  "headlights": "headlight",
  "truck-bed-mats": "truck bed mat",
  "floor-mats": "floor mat",
  "running-boards-side-steps": "running board",
  "roof-racks-baskets": "roof rack",
  "chase-racks-sport-bars": "chase rack",
  "molle-panels": "molle panel",
  "under-seat-storage": "under seat storage",
};

/** Parse year range from a product title. Returns [startYear, endYear] or null. */
function parseYearRange(title: string): [number, number] | null {
  const rangeMatch = title.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  const plusMatch = title.match(/(\d{4})\+/);
  if (plusMatch) return [parseInt(plusMatch[1]), new Date().getFullYear()];
  const singleMatch = title.match(/^(\d{4})\s/);
  if (singleMatch) return [parseInt(singleMatch[1]), parseInt(singleMatch[1])];
  return null;
}

/** Check if a product title's year range includes the selected year */
function matchesYear(title: string, year: string): boolean {
  const y = parseInt(year);
  const range = parseYearRange(title);
  if (!range) return false;
  return y >= range[0] && y <= range[1];
}

/** Check if a product is universal fit */
function isUniversalProduct(product: ShopifyProduct): boolean {
  const title = product.node.title.toLowerCase();
  if (title.includes("universal")) return true;
  // No year range in title = likely universal
  const hasYearRange = parseYearRange(product.node.title) !== null;
  const hasMakeInTitle = KNOWN_MAKES_LC.some((m) => title.includes(m));
  if (!hasYearRange && !hasMakeInTitle) return true;
  return false;
}

const KNOWN_MAKES_LC = [
  "chevy", "chevrolet", "chrysler", "dodge", "ford", "gmc", "honda",
  "jeep", "nissan", "ram", "toyota", "volkswagen",
];

/** Build a Shopify query string from the active filters (excluding year/make/model which are client-side) */
function buildShopifyQuery(
  filters: RefineFilters,
  collectionTitle: string | null,
  categoryHandle: string | null
): string | undefined {
  const parts: string[] = [];

  if (collectionTitle) {
    parts.push(`product_type:${collectionTitle}`);
  } else if (categoryHandle && CATEGORY_KEYWORDS[categoryHandle]) {
    parts.push(`product_type:*${CATEGORY_KEYWORDS[categoryHandle]}*`);
  }

  // Make/model filtering is done client-side to include universal products
  return parts.length > 0 ? parts.join(" ") : undefined;
}

const CollectionTemplate = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showVehicleChange, setShowVehicleChange] = useState(false);
  const [vehicleOverridden, setVehicleOverridden] = useState(false);
  const [filters, setFilters] = useState<RefineFilters>({
    year: null,
    make: null,
    model: null,
    category: null,
  });
  const vehicleSyncedRef = useRef(false);

  const { vehicle, vehicleLabel, clearVehicle } = useVehicle();
  const isMobile = useIsMobile();
  const { data: shopifyCollections, isLoading: collectionsLoading } = useShopifyCollections(50);

  // Sync filters from saved vehicle on mount (once)
  useEffect(() => {
    if (vehicle && !vehicleSyncedRef.current) {
      vehicleSyncedRef.current = true;
      setFilters((prev) => ({
        ...prev,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
      }));
      setVehicleOverridden(false);
    }
  }, [vehicle]);

  const sort = (searchParams.get("sort_by") as SortOption) || "best-selling";
  const isAllProducts = handle === "all" || !handle;
  const collection = !isAllProducts
    ? (shopifyCollections || []).find((c) => c.node.handle === handle)
    : null;
  const title = isAllProducts
    ? "All Products"
    : collection?.node.title || handle || "All Products";

  // Resolve category title for URL-based collections (non-"all" routes)
  const resolvedCategoryTitle = collection ? collection.node.title : null;

  const shopifyQuery = useMemo(
    () => buildShopifyQuery(filters, resolvedCategoryTitle, filters.category),
    [filters, resolvedCategoryTitle]
  );

  const { sortKey, reverse } = SORT_MAP[sort];

  const { data, isLoading } = useShopifyProducts({
    first: ITEMS_PER_PAGE,
    query: shopifyQuery,
    sortKey,
    reverse,
  });

  const initialProducts = data?.products || [];
  const pageInfo = data?.pageInfo;
  const rawDisplayProducts = allProducts.length > 0 ? allProducts : initialProducts;

  // Client-side year range filtering
  const displayProducts = useMemo(() => {
    if (!filters.year) return rawDisplayProducts;
    return rawDisplayProducts.filter((p) => matchesYear(p.node.title, filters.year!));
  }, [rawDisplayProducts, filters.year]);
  const currentHasMore = allProducts.length > 0 ? hasMore : (pageInfo?.hasNextPage || false);
  const currentCursor = allProducts.length > 0 ? nextCursor : (pageInfo?.endCursor || null);

  // Reset on query/sort change
  const queryKey = `${shopifyQuery}-${sortKey}-${reverse}`;
  const [lastQueryKey, setLastQueryKey] = useState(queryKey);
  if (queryKey !== lastQueryKey) {
    setAllProducts([]);
    setNextCursor(null);
    setHasMore(false);
    setLastQueryKey(queryKey);
  }

  const handleFilterChange = useCallback((newFilters: RefineFilters) => {
    setFilters(newFilters);
    setAllProducts([]);
    // If user manually changes YMM filters, mark vehicle as overridden
    if (vehicle) {
      const ymChanged =
        newFilters.year !== vehicle.year ||
        newFilters.make !== vehicle.make ||
        newFilters.model !== vehicle.model;
      if (ymChanged) setVehicleOverridden(true);
    }
  }, [vehicle]);

  const showAllMakes = () => {
    setVehicleOverridden(true);
    setFilters((prev) => ({ ...prev, year: null, make: null, model: null }));
    setAllProducts([]);
  };

  const handleClearVehicle = () => {
    clearVehicle();
    setVehicleOverridden(false);
    vehicleSyncedRef.current = false;
    setFilters((prev) => ({ ...prev, year: null, make: null, model: null }));
    setAllProducts([]);
  };

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

  const setSort = (s: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_by", s);
    setSearchParams(params);
    setShowSortMenu(false);
  };

  const activeFilterCount =
    (filters.year ? 1 : 0) +
    (filters.make ? 1 : 0) +
    (filters.model ? 1 : 0) +
    (filters.category ? 1 : 0);

  // Compute available filter options from loaded products
  const availableOptions = useAvailableFilterOptions(rawDisplayProducts, filters);

  const sidebarContent = (
    <RefineSidebar
      filters={filters}
      onFilterChange={handleFilterChange}
      collections={shopifyCollections || []}
      availableOptions={availableOptions}
    />
  );

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
        {vehicle && !vehicleOverridden && (
          <div className="mt-2">
            <span className="font-display text-xs tracking-widest text-muted-foreground">
              Filtered for your {vehicleLabel}.
            </span>
            <button
              onClick={showAllMakes}
              className="ml-3 font-display text-xs tracking-widest text-primary hover:brightness-110 transition-colors"
            >
              Show all makes
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile: Refine button that opens drawer */}
          {isMobile && (
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 border border-border px-3 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                  <SlidersHorizontal className="w-3 h-3" />
                  REFINE {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-background border-border overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="sr-only">Refine Results</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {sidebarContent}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <span className="font-display text-[10px] tracking-widest text-muted-foreground">
            {currentHasMore
              ? `${displayProducts.length}+ PRODUCTS`
              : `${displayProducts.length} ${displayProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}`}
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

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="border-b border-border px-4 lg:px-8 py-2 flex items-center gap-2 flex-wrap">
          {filters.year && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 font-display text-[10px] tracking-widest">
              {filters.year}
              <button onClick={() => handleFilterChange({ ...filters, year: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.make && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 font-display text-[10px] tracking-widest">
              {filters.make.toUpperCase()}
              <button onClick={() => handleFilterChange({ ...filters, make: null, model: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.model && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 font-display text-[10px] tracking-widest">
              {filters.model.toUpperCase()}
              <button onClick={() => handleFilterChange({ ...filters, model: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 font-display text-[10px] tracking-widest">
              {(shopifyCollections || []).find((c) => c.node.handle === filters.category)?.node.title.toUpperCase() || filters.category.toUpperCase()}
              <button onClick={() => handleFilterChange({ ...filters, category: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Main Content: Sidebar + Grid */}
      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-[220px] shrink-0 border-r border-border p-4 overflow-y-auto sticky top-0 self-start max-h-[calc(100vh-64px)] sidebar-scroll">
            {sidebarContent}
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1 p-4 lg:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-sm tracking-widest text-muted-foreground mb-4">NO PRODUCTS FOUND</p>
              <Link to="/collections/all" className="font-display text-xs tracking-widest text-primary hover:brightness-110">
                ← VIEW ALL PRODUCTS
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade-in">
                {displayProducts.map((product) => (
                  <ProductCard key={product.node.id} product={product} />
                ))}
              </div>

              {currentHasMore && (
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
      </div>

      {/* Collection links */}
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
