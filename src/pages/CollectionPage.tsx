import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, ChevronDown, Grid3X3, LayoutList } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { products, collections, getProductsByCategory } from "@/data/products";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "FEATURED",
  "price-asc": "PRICE: LOW TO HIGH",
  "price-desc": "PRICE: HIGH TO LOW",
  "name-asc": "A–Z",
};

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState<SortOption>("featured");
  const [showSort, setShowSort] = useState(false);
  const [filterMake, setFilterMake] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const collection = collections.find((c) => c.slug === slug);

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
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name-asc": list.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return list;
  }, [categoryProducts, sort, filterMake]);

  const title = collection?.title || "All Products";
  const description = collection?.description || "Browse all Stehlen Auto products.";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="border-b border-border px-4 lg:px-6 py-3 flex items-center gap-2">
        <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">
          HOME
        </Link>
        <span className="font-display text-[10px] text-muted-foreground">/</span>
        <span className="font-display text-[10px] tracking-widest text-foreground">{title.toUpperCase()}</span>
      </div>

      {/* Collection header */}
      <div className="border-b border-border px-4 lg:px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wider">{title.toUpperCase()}</h1>
        </div>
        <p className="font-body text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 font-display text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            FILTER
          </button>

          <span className="font-display text-[10px] tracking-widest text-muted-foreground">
            {filtered.length} ITEMS
          </span>
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 border border-border px-3 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            SORT: {SORT_LABELS[sort]}
            <ChevronDown className={`w-3 h-3 transition-transform ${showSort ? "rotate-180" : ""}`} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 z-20 border border-border bg-card min-w-[200px]">
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSort(key); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2 font-display text-[10px] tracking-widest transition-colors ${
                    sort === key ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Filter sidebar */}
        {showFilters && (
          <div className="w-60 border-r border-border p-4 shrink-0">
            <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground mb-3">MAKE</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilterMake("")}
                className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                  !filterMake ? "text-primary bg-primary/5" : "text-secondary-foreground hover:bg-accent"
                }`}
              >
                All Makes
              </button>
              {makes.map((make) => (
                <button
                  key={make}
                  onClick={() => setFilterMake(make)}
                  className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                    filterMake === make ? "text-primary bg-primary/5" : "text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {make}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 stagger-fade-in">
            {filtered.map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`} className="border-r border-b border-border">
                <ProductCard
                  image={product.image}
                  title={product.title}
                  price={`$${product.price.toFixed(2)}`}
                  category={collection?.title || product.category}
                  inStock={product.inStock}
                  specs={Object.entries(product.specs).slice(0, 2).map(([k, v]) => `${v}`).join(" · ").toUpperCase()}
                />
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-sm tracking-wider text-muted-foreground">NO PRODUCTS FOUND</p>
              <button onClick={() => setFilterMake("")} className="mt-4 font-display text-xs tracking-widest text-primary hover:brightness-110">
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default CollectionPage;
