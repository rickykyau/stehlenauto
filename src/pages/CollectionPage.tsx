/**
 * SHOPIFY TEMPLATE: templates/collection.liquid
 * 
 * Liquid mapping:
 * - Title: {{ collection.title }}
 * - Description: {{ collection.description }}
 * - Products: {% for product in collection.products %}
 * - Sort: Uses ?sort_by= URL param → {{ collection.sort_by }}
 * - Filters: Shopify Storefront Filtering API (tag-based or metafield)
 *   {% for filter in collection.filters %}
 * - Pagination: {% paginate collection.products by 24 %}
 * - Breadcrumbs: Static, no Liquid object needed
 */
import { useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { products, collections, getProductsByCategory } from "@/data/products";

type SortOption = "best-selling" | "price-ascending" | "price-descending" | "title-ascending";

const SORT_LABELS: Record<SortOption, string> = {
  "best-selling": "BEST SELLING",
  "price-ascending": "PRICE: LOW TO HIGH",
  "price-descending": "PRICE: HIGH TO LOW",
  "title-ascending": "A–Z",
};

const CollectionTemplate = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Shopify uses ?sort_by= URL param
  const sort = (searchParams.get("sort_by") as SortOption) || "best-selling";
  // Shopify uses ?filter.p.vendor= or tag-based filtering
  const filterMake = searchParams.get("filter.p.vendor") || "";

  const collection = collections.find((c) => c.slug === handle);

  const categoryProducts = useMemo(() => {
    if (!collection) return products;
    return getProductsByCategory(collection.id);
  }, [collection]);

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

  const setSort = (s: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_by", s);
    setSearchParams(params);
  };

  const setMakeFilter = (make: string) => {
    const params = new URLSearchParams(searchParams);
    if (make) params.set("filter.p.vendor", make);
    else params.delete("filter.p.vendor");
    setSearchParams(params);
  };

  const title = collection?.title || "All Products";
  const description = collection?.description || "Browse all Stehlen Auto products.";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb — Liquid: static markup */}
      <div className="border-b border-border px-4 lg:px-6 py-3 flex items-center gap-2">
        <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-display text-[10px] tracking-widest text-foreground">{title.toUpperCase()}</span>
      </div>

      {/* Collection header — Liquid: {{ collection.title }}, {{ collection.description }} */}
      <div className="border-b border-border px-4 lg:px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wider">{title.toUpperCase()}</h1>
        </div>
        <p className="font-body text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>

      {/* Toolbar — Liquid: sort uses ?sort_by= URL param, no JS needed */}
      <div className="border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-[10px] tracking-widest text-muted-foreground">
            {filtered.length} ITEMS
          </span>
        </div>

        {/* Sort — maps to Shopify's ?sort_by= */}
        <div className="relative group">
          <button className="flex items-center gap-2 border border-border px-3 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            SORT: {SORT_LABELS[sort]}
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute right-0 top-full mt-1 z-20 border border-border bg-card min-w-[200px] hidden group-hover:block">
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`w-full text-left px-4 py-2 font-display text-[10px] tracking-widest transition-colors ${
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
        {/* Filter sidebar — Liquid: {% for filter in collection.filters %} */}
        <div className="hidden lg:block w-60 border-r border-border shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground">FILTER</h3>
            </div>
          </div>

          {/* Make filter — Liquid: uses ?filter.p.vendor= URL params */}
          <div className="p-4 border-b border-border">
            <h4 className="font-display text-[10px] tracking-[0.15em] text-muted-foreground mb-3">MAKE</h4>
            <div className="space-y-0.5">
              <button
                onClick={() => setMakeFilter("")}
                className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                  !filterMake ? "text-primary bg-primary/5" : "text-secondary-foreground hover:bg-accent"
                }`}
              >
                All Makes
              </button>
              {makes.map((make) => (
                <button
                  key={make}
                  onClick={() => setMakeFilter(make)}
                  className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                    filterMake === make ? "text-primary bg-primary/5" : "text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {make}
                </button>
              ))}
            </div>
          </div>

          {/* Collection links */}
          <div className="p-4">
            <h4 className="font-display text-[10px] tracking-[0.15em] text-muted-foreground mb-3">CATEGORIES</h4>
            <div className="space-y-0.5">
              {collections.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/collections/${cat.slug}`}
                  className={`block px-3 py-2 font-body text-sm transition-colors ${
                    cat.slug === handle ? "text-primary bg-primary/5" : "text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid — Liquid: {% for product in collection.products %} */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 stagger-fade-in">
            {filtered.map((product) => (
              <Link key={product.id} to={`/products/${product.slug}`} className="block border-r border-b border-border">
                <ProductCard
                  image={product.image}
                  title={product.title}
                  price={`$${product.price.toFixed(2)}`}
                  category={collection?.title || product.category}
                  inStock={product.inStock}
                  specs={Object.entries(product.specs).slice(0, 2).map(([, v]) => v).join(" · ").toUpperCase()}
                />
              </Link>
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

          {/* Pagination placeholder — Liquid: {% paginate collection.products by 24 %} */}
          {filtered.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 font-display text-xs tracking-wider border transition-colors btn-press ${
                    page === 1 ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {page}
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
