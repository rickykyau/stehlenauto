/**
 * SHOPIFY TEMPLATE: templates/collection.liquid
 */
import { useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, SlidersHorizontal, X, ChevronUp } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { products, collections, getProductsByCategory } from "@/data/products";
import { useVehicle } from "@/contexts/VehicleContext";

type SortOption = "best-selling" | "price-ascending" | "price-descending" | "title-ascending";

const SORT_LABELS: Record<SortOption, string> = {
  "best-selling": "BEST SELLING",
  "price-ascending": "PRICE: LOW → HIGH",
  "price-descending": "PRICE: HIGH → LOW",
  "title-ascending": "A–Z",
};

const ITEMS_PER_PAGE = 24;

/** Parse all individual years from a yearRange like "2005-2009" or "2022-2024" */
const parseYears = (yearRange: string): number[] => {
  const match = yearRange.match(/(\d{4})\s*-\s*(\d{4})/);
  if (match) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    const years: number[] = [];
    for (let y = start; y <= end; y++) years.push(y);
    return years;
  }
  const single = yearRange.match(/(\d{4})/);
  if (single) return [parseInt(single[1])];
  return [];
};

const CollectionTemplate = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({ make: true, year: true, category: true });
  const { vehicle, vehicleLabel, clearVehicle } = useVehicle();

  const sort = (searchParams.get("sort_by") as SortOption) || "best-selling";
  const filterMake = searchParams.get("filter.p.vendor") || searchParams.get("make") || "";
  const filterYear = searchParams.get("year") || "";
  const filterCategory = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // If vehicle is set and no explicit make filter in URL, use the vehicle's make
  const effectiveMake = filterMake || (vehicle?.make ?? "");

  const collection = handle === "all" ? null : collections.find((c) => c.slug === handle);
  const isAllProducts = handle === "all" || !handle;

  const categoryProducts = useMemo(() => {
    if (isAllProducts) return products;
    if (!collection) return products;
    return getProductsByCategory(collection.id);
  }, [collection, isAllProducts]);

  const makes = useMemo(() => {
    const set = new Set(categoryProducts.map((p) => p.make));
    return Array.from(set).sort();
  }, [categoryProducts]);

  // Extract unique years from products
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    categoryProducts.forEach((p) => parseYears(p.yearRange).forEach((y) => yearSet.add(y)));
    return Array.from(yearSet).sort((a, b) => b - a); // newest first
  }, [categoryProducts]);

  // Extract unique categories
  const categoryOptions = useMemo(() => {
    const catSet = new Set(categoryProducts.map((p) => p.category));
    return collections.filter((c) => catSet.has(c.id));
  }, [categoryProducts]);

  // Check if we're showing all (overridden)
  const showingAll = filterMake === "__all__";
  const actualEffectiveMake = showingAll ? "" : effectiveMake;

  const filteredFinal = useMemo(() => {
    let list = [...categoryProducts];
    if (actualEffectiveMake) list = list.filter((p) => p.make === actualEffectiveMake);
    if (filterYear) {
      const y = parseInt(filterYear);
      list = list.filter((p) => parseYears(p.yearRange).includes(y));
    }
    if (filterCategory) list = list.filter((p) => p.category === filterCategory);
    switch (sort) {
      case "price-ascending": list.sort((a, b) => a.price - b.price); break;
      case "price-descending": list.sort((a, b) => b.price - a.price); break;
      case "title-ascending": list.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return list;
  }, [categoryProducts, sort, actualEffectiveMake, filterYear, filterCategory]);

  const totalPagesFinal = Math.ceil(filteredFinal.length / ITEMS_PER_PAGE);
  const paginatedFinal = filteredFinal.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    setSearchParams(params);
  };

  const setSort = (s: SortOption) => updateParam("sort_by", s);

  const setMakeFilter = (make: string) => {
    const params = new URLSearchParams(searchParams);
    if (make) params.set("filter.p.vendor", make);
    else params.delete("filter.p.vendor");
    params.delete("make");
    params.delete("page");
    setSearchParams(params);
  };

  const handleClearVehicle = () => {
    clearVehicle();
    const params = new URLSearchParams(searchParams);
    params.delete("filter.p.vendor");
    params.delete("make");
    params.delete("page");
    setSearchParams(params);
  };

  const handleShowAllMakes = () => {
    const params = new URLSearchParams(searchParams);
    params.set("filter.p.vendor", "__all__");
    params.delete("make");
    params.delete("page");
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("filter.p.vendor");
    params.delete("make");
    params.delete("year");
    params.delete("category");
    params.delete("page");
    if (vehicle) params.set("filter.p.vendor", "__all__");
    setSearchParams(params);
  };

  const activeFilterCount = [actualEffectiveMake, filterYear, filterCategory].filter(Boolean).length;

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFilter = (key: string) => setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const title = isAllProducts ? "All Products" : (collection?.title || "All Products");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Announcement (only if no vehicle set) */}
      {!vehicle && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center">
          <span className="font-display text-[11px] tracking-widest text-primary">EASY 30-DAY RETURNS | NO HASSLE, NO QUESTIONS ASKED</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-border px-4 lg:px-8 py-3 flex items-center gap-2">
        <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-display text-[10px] tracking-widest text-foreground">{title.toUpperCase()}</span>
      </div>

      {/* Collection Header */}
      <div className="border-b border-border px-4 lg:px-8 py-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">{title.toUpperCase()}</h1>
        {vehicle && !showingAll && actualEffectiveMake && (
          <p className="font-body text-sm text-muted-foreground mt-2">
            Filtered for your {vehicleLabel}. <button onClick={handleShowAllMakes} className="text-primary hover:brightness-110 underline underline-offset-2">Show all makes</button>
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 text-primary font-display text-[11px] tracking-widest"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            REFINE{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <span className="font-display text-[10px] tracking-widest text-muted-foreground">
            {filteredFinal.length} {filteredFinal.length === 1 ? "PRODUCT" : "PRODUCTS"}
          </span>

          {/* Active filter chips */}
          <div className="hidden md:flex items-center gap-2">
            {actualEffectiveMake && !vehicle && (
              <button onClick={() => setMakeFilter("")} className="flex items-center gap-1 bg-primary/10 border border-primary/30 px-2 py-1 text-primary font-display text-[10px] tracking-widest">
                {actualEffectiveMake} <X className="w-3 h-3" />
              </button>
            )}
            {filterYear && (
              <button onClick={() => updateParam("year", "")} className="flex items-center gap-1 bg-primary/10 border border-primary/30 px-2 py-1 text-primary font-display text-[10px] tracking-widest">
                {filterYear} <X className="w-3 h-3" />
              </button>
            )}
            {filterCategory && (
              <button onClick={() => updateParam("category", "")} className="flex items-center gap-1 bg-primary/10 border border-primary/30 px-2 py-1 text-primary font-display text-[10px] tracking-widest">
                {collections.find((c) => c.id === filterCategory)?.title || filterCategory} <X className="w-3 h-3" />
              </button>
            )}
            {activeFilterCount > 1 && (
              <button onClick={clearAllFilters} className="text-muted-foreground hover:text-destructive font-display text-[10px] tracking-widest transition-colors">
                CLEAR ALL
              </button>
            )}
          </div>
        </div>

        {/* Sort dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 border border-border px-3 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
            SORT: {SORT_LABELS[sort]} <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute right-0 top-full mt-1 z-20 border border-border bg-card min-w-[200px] hidden group-hover:block shadow-lg">
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
        </div>
      </div>

      <div className="flex">
        {/* Filter Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 border-r border-border shrink-0`}>
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <h3 className="font-display text-xs tracking-[0.15em] text-primary font-bold">REFINE RESULTS</h3>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                CLEAR
              </button>
            )}
          </div>

          {/* Make filter */}
          <FilterSection title="MAKE" expanded={expandedFilters.make} onToggle={() => toggleFilter("make")}>
            <button
              onClick={() => { handleShowAllMakes(); }}
              className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                !actualEffectiveMake || showingAll ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
              }`}
            >
              All Makes
            </button>
            {makes.map((make) => (
              <button
                key={make}
                onClick={() => setMakeFilter(make)}
                className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                  actualEffectiveMake === make ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                }`}
              >
                {make}
              </button>
            ))}
          </FilterSection>

          {/* Year filter */}
          <FilterSection title="YEAR" expanded={expandedFilters.year} onToggle={() => toggleFilter("year")}>
            <button
              onClick={() => updateParam("year", "")}
              className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                !filterYear ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
              }`}
            >
              All Years
            </button>
            <div className="max-h-48 overflow-y-auto">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => updateParam("year", String(year))}
                  className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                    filterYear === String(year) ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Category filter (only on "all" page) */}
          {isAllProducts && categoryOptions.length > 1 && (
            <FilterSection title="CATEGORY" expanded={expandedFilters.category} onToggle={() => toggleFilter("category")}>
              <button
                onClick={() => updateParam("category", "")}
                className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                  !filterCategory ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                }`}
              >
                All Categories
              </button>
              {categoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.id)}
                  className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                    filterCategory === cat.id ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </FilterSection>
          )}

          {/* Collection links (when on a specific collection) */}
          {!isAllProducts && (
            <div className="p-5">
              <h4 className="font-display text-[10px] tracking-[0.15em] text-muted-foreground mb-3">CATEGORIES</h4>
              <div className="space-y-0.5">
                <Link
                  to="/collections/all"
                  className="block px-3 py-2 font-body text-sm text-secondary-foreground hover:bg-accent transition-colors"
                >
                  All Products
                </Link>
                {collections.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/collections/${cat.slug}`}
                    className={`block px-3 py-2 font-body text-sm transition-colors ${
                      cat.slug === handle ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-fade-in">
            {paginatedFinal.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image}
                title={product.title}
                price={`$${product.price.toFixed(2)}`}
                slug={product.slug}
                compareAt={product.compareAt ? `$${product.compareAt.toFixed(2)}` : undefined}
                inStock={product.inStock}
              />
            ))}
          </div>

          {filteredFinal.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-sm tracking-wider text-muted-foreground">
                NO PRODUCTS FOUND {vehicle ? `FOR YOUR ${vehicleLabel.toUpperCase()}` : ""}
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                {vehicle && (
                  <button onClick={handleShowAllMakes} className="font-display text-xs tracking-widest text-primary hover:brightness-110">SHOW ALL MAKES</button>
                )}
                <button onClick={clearAllFilters} className="font-display text-xs tracking-widest text-muted-foreground hover:text-foreground">CLEAR ALL FILTERS</button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPagesFinal > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              {Array.from({ length: totalPagesFinal }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 font-display text-xs tracking-wider border transition-colors btn-press ${
                    page === p ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

/** Collapsible filter section */
const FilterSection = ({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) => (
  <div className="border-b border-border">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-5">
      <h4 className="font-display text-[10px] tracking-[0.15em] text-muted-foreground">{title}</h4>
      {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
    {expanded && <div className="px-5 pb-4 space-y-0.5">{children}</div>}
  </div>
);

export default CollectionTemplate;
