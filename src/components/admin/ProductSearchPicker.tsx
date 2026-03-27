import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react";
import { storefrontApiRequest } from "@/lib/shopify";

interface PickerResult {
  handle: string;
  title: string;
  imageUrl: string | null;
  price: string;
}

interface ProductSearchPickerProps {
  value: string | null;
  onSelect: (product: PickerResult) => void;
  onClear: () => void;
  autoFocus?: boolean;
}

export default function ProductSearchPicker({ value, onSelect, onClear, autoFocus }: ProductSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const searchProducts = async (q: string) => {
    setSearching(true);
    try {
      const result = await storefrontApiRequest(`
        query SearchProducts($query: String!) {
          products(first: 8, query: $query) {
            edges { node { id title handle featuredImage { url } priceRange { minVariantPrice { amount } } } }
          }
        }
      `, { query: q });
      const items = result?.data?.products?.edges?.map((e: any) => ({
        handle: e.node.handle,
        title: e.node.title,
        imageUrl: e.node.featuredImage?.url || null,
        price: parseFloat(e.node.priceRange?.minVariantPrice?.amount || "0").toFixed(2),
      })) ?? [];
      setResults(items);
      setOpen(true);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded bg-muted/30">
          <span className="font-body text-sm text-foreground flex-1 truncate">{value}</span>
          <button onClick={onClear} className="text-muted-foreground hover:text-destructive">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoFocus={autoFocus}
            className="pr-8"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {searching ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Search className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      )}

      {open && results.length > 0 && !value && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-[250px] overflow-y-auto border border-border bg-card rounded shadow-lg">
          {results.map((p) => (
            <button
              key={p.handle}
              onClick={() => {
                onSelect(p);
                setOpen(false);
                setQuery("");
                setResults([]);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/30 text-left"
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt="" className="w-8 h-8 object-cover border border-border rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground truncate">{p.title}</p>
                <p className="font-display text-xs text-primary">${p.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
