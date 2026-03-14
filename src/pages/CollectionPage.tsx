/**
 * SHOPIFY TEMPLATE: templates/collection.liquid
 * 
 * Liquid mapping:
 * - Title: {{ collection.title }}
 * - Products: {% for product in collection.products %}
 * - Sort: ?sort_by= → {{ collection.sort_by }}
 * - Filters: {% for filter in collection.filters %}
 * - Pagination: {% paginate collection.products by 24 %}
 */
import { useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { products, collections, getProductsByCategory } from "@/data/products";

type SortOption = "best-selling" | "price-ascending" | "price-descending" | "title-ascending";

const SORT_LABELS: Record<SortOption, string> = {
  "best-selling": "BEST SELLING",
  "price-ascending": "PRICE: LOW → HIGH",
  "price-descending": "PRICE: HIGH → LOW",
  "title-ascending": "A–Z",
};

const ITEMS_PER_PAGE = 24;

const CollectionTemplate = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const sort = (searchParams.get("sort_by") as SortOption) || "best-selling";
  const filterMake = searchParams.get("filter.p.vendor") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

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

  const filtered = useMemo(() => {
    let list = [...categoryProducts];
    if (filterMake) list = list.filter((p) => p.make === filterMake);
    switch (sort) {
      case "price-ascending": list.sort((a, b) => a.price - b.price); break;
      case "price-descending": list.sort((a, b) => b.price - a.price); break;
      case "title-ascending": list.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return list;
  }, [categoryProducts, sort, filterMake]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const setSort = (s: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_by", s);
    params.delete("page");
    setSearchParams(params);
  };

  const setMakeFilter = (make: string) => {
    const params = new URLSearchParams(searchParams);
    if (make) params.set("filter.p.vendor", make);
    else params.delete("filter.p.vendor");
    params.delete("page");
    setSearchParams(params);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const title = isAllProducts ? "Products" : (collection?.title || "All Products");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Announcement */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center">
        <span className="font-display text-[11px] tracking-widest text-primary">
          EASY 30-DAY RETURNS | NO HASSLE, NO QUESTIONS ASKED
        </span>
      </div>

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
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 text-primary font-display text-[11px] tracking-widest"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            REFINE RESULTS
          </button>
          <span className="font-display text-[10px] tracking-widest text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "PRODUCT" : "PRODUCTS"}
          </span>
          {filterMake && (
            <button 
              onClick={() => setMakeFilter("")}
              className="flex items-center gap-1 bg-primary/10 border border-primary/30 px-2 py-1 text-primary font-display text-[10px] tracking-widest"
            >
              {filterMake} <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 border border-border px-3 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
            SORT: {SORT_LABELS[sort]}
            <ChevronDown className="w-3 h-3" />
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
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <h3 className="font-display text-xs tracking-[0.15em] text-primary font-bold">REFINE RESULTS</h3>
            </div>
          </div>

          {/* Make filter */}
          <div className="p-5 border-b border-border">
            <h4 className="font-display text-[10px] tracking-[0.15em] text-muted-foreground mb-3">MAKE</h4>
            <div className="space-y-0.5">
              <button
                onClick={() => setMakeFilter("")}
                className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                  !filterMake ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                }`}
              >
                All Makes
              </button>
              {makes.map((make) => (
                <button
                  key={make}
                  onClick={() => setMakeFilter(make)}
                  className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                    filterMake === make ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {make}
                </button>
              ))}
            </div>
          </div>

          {/* Collection links */}
          <div className="p-5">
            <h4 className="font-display text-[10px] tracking-[0.15em] text-muted-foreground mb-3">CATEGORIES</h4>
            <div className="space-y-0.5">
              <Link
                to="/collections/all"
                className={`block px-3 py-2 font-body text-sm transition-colors ${
                  isAllProducts ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-secondary-foreground hover:bg-accent"
                }`}
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
        </aside>

        {/* Product Grid */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-fade-in">
            {paginated.map((product) => (
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

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-sm tracking-wider text-muted-foreground">NO PRODUCTS FOUND</p>
              <button onClick={() => setMakeFilter("")} className="mt-4 font-display text-xs tracking-widest text-primary hover:brightness-110">
                CLEAR FILTERS
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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

export default CollectionTemplate;
