/**
 * SHOPIFY TEMPLATE: templates/collection.liquid
 */
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Loader2, SlidersHorizontal, Truck, X, Mail } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import FitmentSelector from "@/components/FitmentSelector";
import RefineSidebar, { type RefineFilters } from "@/components/RefineSidebar";
import { useShopifyProducts, useShopifyCollections, useCollectionProducts } from "@/hooks/useShopifyProducts";
import { useVehicle } from "@/contexts/VehicleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAvailableFilterOptions, CATEGORIES } from "@/hooks/useAvailableFilterOptions";
import type { ShopifyProduct } from "@/lib/shopify";
import { isUniversalProduct, MAKE_COLLECTION_MAP, COLLECTION_PRODUCTS_QUERY, storefrontApiRequest, buildYMMTagQuery } from "@/lib/shopify";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

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

/** Check if product matches category by productType */
function matchesCategory(product: ShopifyProduct, categoryHandle: string): boolean {
  const keyword = CATEGORY_KEYWORDS[categoryHandle];
  if (!keyword) return false;
  const productType = (product.node.productType || "").toLowerCase();
  return productType.includes(keyword.toLowerCase());
}


/* ─── Empty Vehicle State Component ─── */

function EmptyVehicleState({
  filters,
  activeCategoryLabel,
  universalProducts,
  onFilterChange,
}: {
  filters: RefineFilters;
  activeCategoryLabel: string | null;
  universalProducts: ShopifyProduct[];
  onFilterChange: (f: RefineFilters) => void;
}) {
  const [email, setEmail] = useState("");
  const vehicleStr = [filters.year, filters.make, filters.model].filter(Boolean).join(" ");
  const makeModel = [filters.make, filters.model].filter(Boolean).join(" ");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(`We'll notify you when we add ${makeModel} parts!`);
    setEmail("");
  };

  return (
    <div className="py-8">
      {/* Friendly message */}
      <div className="text-center mb-8">
        <p className="font-display text-sm tracking-widest text-foreground mb-2">
          {activeCategoryLabel
            ? `NO ${activeCategoryLabel.toUpperCase()} FOUND FOR YOUR ${vehicleStr.toUpperCase()}`
            : `WE DON'T HAVE ${makeModel.toUpperCase()}-SPECIFIC PARTS YET`}
        </p>
        <p className="font-body text-sm text-muted-foreground">
          {universalProducts.length > 0
            ? "But we've got you covered with universal accessories!"
            : "Browse our full catalog to find what you need."}
        </p>
      </div>

      {/* Universal products */}
      {universalProducts.length > 0 && (
        <div className="mb-8">
          <div className="border-t border-border pt-4 mb-4">
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">
              UNIVERSAL ACCESSORIES THAT WORK WITH YOUR {vehicleStr.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {universalProducts.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Category cards */}
      <div className="mb-8">
        <div className="border-t border-border pt-4 mb-4">
          <span className="font-display text-[10px] tracking-widest text-muted-foreground">BROWSE OUR FULL CATALOG</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.handle}
              onClick={() => onFilterChange({ year: null, make: null, model: null, category: cat.handle })}
              className="border border-border p-3 text-left transition-colors hover:border-primary/40 group"
            >
              <span className="font-display text-[10px] tracking-widest text-foreground group-hover:text-primary transition-colors block">
                {cat.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Email capture */}
      <div className="border-t border-border pt-6">
        <div className="max-w-md mx-auto text-center">
          <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">
            WANT {makeModel.toUpperCase()} PARTS? LET US KNOW!
          </p>
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full h-10 pl-9 pr-3 bg-input border border-border text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-primary text-primary-foreground font-display text-[10px] tracking-widest hover:brightness-110 transition-colors"
            >
              NOTIFY ME
            </button>
          </form>
        </div>
      </div>
    </div>
  );
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
  const [includeUniversal, setIncludeUniversal] = useState(true);
  const [filters, setFilters] = useState<RefineFilters>({
    year: null,
    make: null,
    model: null,
    category: null,
  });
  const vehicleSyncedRef = useRef(false);
  const viewItemListFiredRef = useRef<string | null>(null);
  const lastCategoryParam = useRef<string | null>(null);
  const lastMakeParam = useRef<string | null>(null);

  const { vehicle, vehicleLabel, clearVehicle } = useVehicle();
  const isMobile = useIsMobile();
  const { data: shopifyCollections, isLoading: collectionsLoading } = useShopifyCollections(50);

  // Sync category and make from URL search params — reactive to changes
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const makeParam = searchParams.get("make");

    // Only update if params actually changed
    if (categoryParam !== lastCategoryParam.current || makeParam !== lastMakeParam.current) {
      lastCategoryParam.current = categoryParam;
      lastMakeParam.current = makeParam;

      setFilters((prev) => ({
        ...prev,
        // When navigating via menu links, replace filters entirely
        category: categoryParam || (makeParam ? null : prev.category),
        make: makeParam || (categoryParam ? null : prev.make),
        model: makeParam ? null : prev.model,
      }));
      if (makeParam) setVehicleOverridden(true);
      setAllProducts([]);
    }
  }, [searchParams]);

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

  // Resolve display title
  const activeCategoryLabel = filters.category
    ? CATEGORIES.find((c) => c.handle === filters.category)?.label || null
    : null;
  const title = activeCategoryLabel
    ? activeCategoryLabel
    : isAllProducts
      ? "All Products"
      : collection?.node.title || handle || "All Products";

  const { sortKey, reverse } = SORT_MAP[sort];

  // ── Determine data fetching strategy ──
  // Make filter → fetch from make's collection via collectionByHandle
  // Category filter (no make) → fetch via products query with product_type filter
  // Both → fetch from make collection, filter by category client-side
  // Neither → fetch all products

  const makeCollectionHandle = useMemo(() => {
    if (filters.make && filters.make !== "Universal" && MAKE_COLLECTION_MAP[filters.make]) {
      return MAKE_COLLECTION_MAP[filters.make];
    }
    // Non-"all" collection routes (e.g. /collections/ford-parts)
    if (!isAllProducts && handle) {
      return handle;
    }
    return null;
  }, [filters.make, isAllProducts, handle]);

  // Build a product_type query for category filtering (used when no make collection)
  const categoryProductQuery = useMemo(() => {
    if (makeCollectionHandle) return undefined; // category filtering done client-side when fetching from make collection
    if (filters.category && CATEGORY_KEYWORDS[filters.category]) {
      return `product_type:*${CATEGORY_KEYWORDS[filters.category]}*`;
    }
    if (filters.make === "Universal") {
      return "tag:'universal fit'";
    }
    return undefined;
  }, [filters.category, filters.make, makeCollectionHandle]);

  // Fetch from a specific make collection when a make filter is active
  const { data: collectionData, isLoading: collectionLoading } = useCollectionProducts({
    collectionHandle: makeCollectionHandle,
    first: ITEMS_PER_PAGE,
    sortKey,
    reverse,
  });

  // Fetch via products query when no make collection (all products or category-filtered)
  const { data: allProductsData, isLoading: allProductsLoading } = useShopifyProducts({
    first: ITEMS_PER_PAGE,
    sortKey,
    reverse,
    query: categoryProductQuery,
  });

  // Choose the right data source
  const isUsingCollection = !!makeCollectionHandle;
  const sourceData = isUsingCollection ? collectionData : allProductsData;
  const isLoading = isUsingCollection ? collectionLoading : allProductsLoading;

  const initialProducts = sourceData?.products || [];
  const pageInfo = sourceData?.pageInfo;
  const rawDisplayProducts = allProducts.length > 0 ? allProducts : initialProducts;

  // Client-side filtering: only year/model + category when fetching from make collection
  const { vehicleProducts, universalProducts } = useMemo(() => {
    let filtered = rawDisplayProducts;

    // If we fetched from make collection but also have a category filter, apply category client-side
    if (filters.make && MAKE_COLLECTION_MAP[filters.make] && filters.category) {
      filtered = filtered.filter((p) => matchesCategory(p, filters.category!));
    }

    // Year filtering is always client-side (parse from product titles)
    if (filters.year) {
      filtered = filtered.filter((p) =>
        isUniversalProduct(p) || matchesYear(p.node.title, filters.year!)
      );
    }

    // Model filtering is always client-side
    if (filters.model) {
      filtered = filtered.filter((p) =>
        isUniversalProduct(p) || p.node.title.toLowerCase().includes(filters.model!.toLowerCase())
      );
    }

    // Separate vehicle-specific and universal products
    const hasVehicleFilter = filters.year || filters.make || filters.model;
    if (hasVehicleFilter && filters.make !== "Universal") {
      const vehicleSpecific = filtered.filter((p) => !isUniversalProduct(p));
      const universal = filtered.filter((p) => isUniversalProduct(p));
      return { vehicleProducts: vehicleSpecific, universalProducts: universal };
    }
    return { vehicleProducts: filtered, universalProducts: [] as ShopifyProduct[] };
  }, [rawDisplayProducts, filters.year, filters.make, filters.model, filters.category]);

  const displayProducts = includeUniversal
    ? [...vehicleProducts, ...universalProducts]
    : vehicleProducts;
  const currentHasMore = allProducts.length > 0 ? hasMore : (pageInfo?.hasNextPage || false);
  const currentCursor = allProducts.length > 0 ? nextCursor : (pageInfo?.endCursor || null);

  // Fire view_item_list once per unique list
  const listName = title || "All Products";
  useEffect(() => {
    if (!isLoading && displayProducts.length > 0 && viewItemListFiredRef.current !== listName) {
      viewItemListFiredRef.current = listName;
      trackEvent("view_item_list", {
        item_list_name: listName,
        items: displayProducts.slice(0, 5).map((product, index) => ({
          item_id: product.node.id,
          item_name: product.node.title,
          item_category: listName,
          price: parseFloat(product.node.priceRange.minVariantPrice.amount),
          index,
        })),
      });
    }
  }, [isLoading, displayProducts, listName]);

  // Fire ymm_completed / fitment_no_results when full YMM selection renders
  const ymmFiredRef = useRef("");
  useEffect(() => {
    if (!filters.year || !filters.make || !filters.model || isLoading) return;
    const key = `${filters.year}-${filters.make}-${filters.model}`;
    if (ymmFiredRef.current === key) return;
    ymmFiredRef.current = key;
    trackEvent("ymm_completed", {
      vehicle_year: filters.year,
      vehicle_make: filters.make,
      vehicle_model: filters.model,
      results_count: displayProducts.length,
    });
    if (displayProducts.length === 0) {
      trackEvent("fitment_no_results", {
        vehicle_year: filters.year,
        vehicle_make: filters.make,
        vehicle_model: filters.model,
      });
    }
  }, [filters.year, filters.make, filters.model, isLoading, displayProducts.length]);

  // Reset on query/sort change
  const queryKey = `${makeCollectionHandle}-${categoryProductQuery}-${sortKey}-${reverse}-${filters.make}-${filters.category}`;
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
      if (makeCollectionHandle) {
        // Load more from make collection
        const result = await storefrontApiRequest(COLLECTION_PRODUCTS_QUERY, {
          handle: makeCollectionHandle,
          first: ITEMS_PER_PAGE,
          after: currentCursor,
          sortKey: sortKey === 'BEST_SELLING' ? 'BEST_SELLING' : sortKey === 'PRICE' ? 'PRICE' : sortKey === 'TITLE' ? 'TITLE' : 'BEST_SELLING',
          reverse,
        });
        const newProducts = (result?.data?.collectionByHandle?.products?.edges || []) as ShopifyProduct[];
        const newPageInfo = result?.data?.collectionByHandle?.products?.pageInfo;
        const base = allProducts.length > 0 ? allProducts : initialProducts;
        setAllProducts([...base, ...newProducts]);
        setNextCursor(newPageInfo?.endCursor || null);
        setHasMore(newPageInfo?.hasNextPage || false);
      } else {
        // Load more from products query (all products or category-filtered)
        const { storefrontApiRequest: apiReq, PRODUCTS_QUERY } = await import("@/lib/shopify");
        const result = await apiReq(PRODUCTS_QUERY, {
          first: ITEMS_PER_PAGE,
          query: categoryProductQuery || null,
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
      }
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, currentCursor, makeCollectionHandle, categoryProductQuery, sortKey, reverse, allProducts, initialProducts]);

  const setSort = (s: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_by", s);
    setSearchParams(params);
    setShowSortMenu(false);
    trackEvent("sort_changed", { sort_option: s });
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
              {CATEGORIES.find((c) => c.handle === filters.category)?.label.toUpperCase() || filters.category.replace(/-/g, " ").toUpperCase()}
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
          {/* Universal toggle */}
          {universalProducts.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUniversal}
                  onChange={(e) => setIncludeUniversal(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary"
                />
                <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                  INCLUDE UNIVERSAL FIT PRODUCTS ({universalProducts.length})
                </span>
              </label>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : vehicleProducts.length === 0 && (filters.year || filters.make || filters.model) && filters.make !== "Universal" ? (
            <EmptyVehicleState
              filters={filters}
              activeCategoryLabel={activeCategoryLabel}
              universalProducts={universalProducts}
              onFilterChange={handleFilterChange}
            />
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
                {vehicleProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product} listName={listName} index={index} />
                ))}
                {includeUniversal && universalProducts.length > 0 && (
                  <>
                    {vehicleProducts.length > 0 && (
                      <div className="col-span-full border-t border-border pt-4 mt-2 mb-2">
                        <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                          {vehicleProducts.length < 5 ? "MORE PRODUCTS THAT MAY INTEREST YOU" : "UNIVERSAL FIT"}
                        </span>
                      </div>
                    )}
                    {universalProducts.map((product, uIdx) => (
                      <ProductCard key={product.node.id} product={product} listName={listName} index={vehicleProducts.length + uIdx} />
                    ))}
                  </>
                )}
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
