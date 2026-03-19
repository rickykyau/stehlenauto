import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Search, ChevronDown, ChevronUp, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { toast } from "sonner";
import { fuzzyMatch } from "@/lib/fuzzy-search";

interface ProductCache {
  id: string;
  shopify_product_id: string;
  title: string;
  vendor: string | null;
  product_type: string | null;
  status: string;
  tags: string[];
  variants: any[];
  images: any[];
  fitment_vehicles: any[];
  last_synced_at: string;
  cb_item_name: string | null;
  part_number: string | null;
  metafields: any[];
}

interface SyncStatus {
  sync_type: string;
  status: string;
  progress: number;
  total: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

type SortField = "cb_item_name" | "title";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 50;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductCache[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    let all: any[] = [];
    let from = 0;
    const step = 1000;
    while (true) {
      const { data } = await supabase
        .from("products_cache")
        .select("*")
        .order("title", { ascending: true })
        .range(from, from + step - 1);
      const rows = (data as any[]) ?? [];
      all = all.concat(rows);
      if (rows.length < step) break;
      from += step;
    }
    setProducts(all);
    setLoading(false);
  };

  const fetchLastSync = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "last_products_sync")
      .maybeSingle();
    if (data?.value && typeof data.value === "object" && "timestamp" in (data.value as any)) {
      setLastSync((data.value as any).timestamp);
    }
  };

  const fetchSyncStatus = useCallback(async () => {
    const { data } = await supabase
      .from("sync_status")
      .select("*")
      .eq("sync_type", "products")
      .maybeSingle();
    if (data) setSyncStatus(data as any);
    return data as SyncStatus | null;
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchLastSync();
    fetchSyncStatus();
  }, []);

  // Poll sync status while in_progress
  useEffect(() => {
    if (syncStatus?.status !== "in_progress") return;
    const interval = setInterval(async () => {
      const status = await fetchSyncStatus();
      if (status && status.status !== "in_progress") {
        // Sync finished while we were watching
        if (status.status === "completed") {
          toast.success("Product sync completed!");
          await fetchProducts();
          await fetchLastSync();
        } else if (status.status === "failed") {
          toast.error("Sync failed: " + (status.error_message || "Unknown error"));
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [syncStatus?.status, fetchSyncStatus]);

  const handleSync = async () => {
    // Optimistically set status
    setSyncStatus((prev) => prev ? { ...prev, status: "in_progress", progress: 0, total: 0, error_message: null } : null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Fire and forget — the edge function updates sync_status in the DB
      supabase.functions.invoke("sync-shopify-products", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      }).then(async (res) => {
        // If the response comes back while still on this page
        if (res.error) {
          toast.error("Sync failed: " + res.error.message);
        }
        await fetchSyncStatus();
        await fetchProducts();
        await fetchLastSync();
      });
      // Start polling immediately
      await fetchSyncStatus();
    } catch (err: any) {
      toast.error("Sync failed: " + err.message);
      await fetchSyncStatus();
    }
  };

  const isSyncing = syncStatus?.status === "in_progress";

  const getTotalInventory = (variants: any[]) =>
    variants.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0);

  const getPriceRange = (variants: any[]) => {
    const prices = variants.map((v: any) => parseFloat(v.price || "0")).filter(Boolean);
    if (prices.length === 0) return "—";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const productTypes = [...new Set(products.map((p) => p.product_type).filter(Boolean))] as string[];

  const filtered = useMemo(() => products
    .filter((p) => {
      const q = search.trim();
      const skus = p.variants.map((v: any) => v.sku || "").join(" ");
      const tags = (p.tags || []).join(" ");
      const matchesSearch = !q || fuzzyMatch(q, p.title, p.cb_item_name, p.product_type, skus, tags);
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      const matchesType = filterType === "all" || p.product_type === filterType;
      const matchesLow = !filterLowStock || getTotalInventory(p.variants) < 10;
      return matchesSearch && matchesStatus && matchesType && matchesLow;
    })
    .sort((a, b) => {
      const valA = (a[sortField] || "").toLowerCase();
      const valB = (b[sortField] || "").toLowerCase();
      const cmp = valA.localeCompare(valB);
      return sortDir === "asc" ? cmp : -cmp;
    }), [products, search, filterStatus, filterType, filterLowStock, sortField, sortDir]);

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus, filterType, filterLowStock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, filtered.length);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, safePage - 2);
      let end = Math.min(totalPages - 1, safePage + 2);
      if (safePage <= 3) end = Math.min(5, totalPages - 1);
      if (safePage >= totalPages - 2) start = Math.max(totalPages - 4, 2);
      if (start > 2) pages.push(-1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push(-2);
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? "text-primary" : ""}`} />
      </span>
    </th>
  );

  const syncProgressPercent = syncStatus?.total ? Math.round((syncStatus.progress / syncStatus.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Sync Status Banner */}
      {isSyncing && (
        <div className="border border-primary/30 bg-primary/5 p-4 flex items-center gap-4">
          <RefreshCw className="w-4 h-4 text-primary animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body text-foreground">
              Syncing products… {syncStatus.progress > 0 && `${syncStatus.progress.toLocaleString()}`}
              {syncStatus.total > 0 && `/${syncStatus.total.toLocaleString()}`}
            </p>
            {syncStatus.total > 0 && (
              <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${syncProgressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {syncStatus?.status === "failed" && (
        <div className="border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-4">
          <XCircle className="w-4 h-4 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body text-foreground">
              Sync failed: {syncStatus.error_message || "Unknown error"}
            </p>
            {syncStatus.completed_at && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(syncStatus.completed_at).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleSync}
            className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground font-display text-xs tracking-widest hover:bg-primary/90 transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm font-body">
          {products.length} products {lastSync && `· Last synced ${new Date(lastSync).toLocaleString()}`}
        </p>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-display text-xs tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "SYNCING…" : "SYNC PRODUCTS"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, CB Item Name, SKU, type…"
            className="w-full pl-10 pr-4 py-2 bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm font-body text-foreground"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm font-body text-foreground"
        >
          <option value="all">All Types</option>
          {productTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-sm font-body text-foreground cursor-pointer">
          <input type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} className="accent-primary" />
          Low Stock
        </label>
      </div>

      {/* Table */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <SortHeader field="cb_item_name" label="CB ITEM NAME" />
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">PART #</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground w-12"></th>
              <SortHeader field="title" label="TITLE" />
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">TYPE</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">VARIANTS</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">PRICE</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">INVENTORY</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">STATUS</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : paginatedProducts.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-xs">
                {products.length === 0 ? 'No products synced yet. Click "Sync Products" to fetch from Shopify.' : "No matching products."}
              </td></tr>
            ) : (
              paginatedProducts.map((p) => {
                const totalInv = getTotalInventory(p.variants);
                const isLow = totalInv < 10;
                return (
                  <ProductRow
                    key={p.id}
                    product={p}
                    totalInv={totalInv}
                    isLow={isLow}
                    priceRange={getPriceRange(p.variants)}
                    expanded={expandedId === p.id}
                    onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body text-muted-foreground">
            Showing {showingFrom}–{showingTo} of {filtered.length.toLocaleString()} products
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              className="p-2 border border-border hover:bg-accent/50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {pageNumbers.map((pn, i) =>
              pn < 0 ? (
                <span key={`e${i}`} className="px-1 text-muted-foreground text-xs">…</span>
              ) : (
                <button
                  key={pn}
                  onClick={() => setCurrentPage(pn)}
                  className={`min-w-[32px] h-8 text-xs font-display tracking-wider border transition-colors ${
                    pn === safePage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  {pn}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              className="p-2 border border-border hover:bg-accent/50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Extracted row component ── */
function ProductRow({ product: p, totalInv, isLow, priceRange, expanded, onToggle }: {
  product: ProductCache;
  totalInv: number;
  isLow: boolean;
  priceRange: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border hover:bg-accent/30 cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-3 font-body text-foreground text-xs max-w-[160px] truncate">
          {p.cb_item_name || <span className="text-muted-foreground">—</span>}
        </td>
        <td className="px-4 py-3 font-body text-muted-foreground text-xs max-w-[140px] truncate">
          {p.part_number || <span className="text-muted-foreground">—</span>}
        </td>
        <td className="px-4 py-3">
          {p.images?.[0] ? (
            <img src={(p.images[0] as any).src} alt="" className="w-10 h-10 object-cover border border-border" />
          ) : (
            <div className="w-10 h-10 bg-muted border border-border" />
          )}
        </td>
        <td className="px-4 py-3 font-body text-foreground font-medium max-w-[250px] truncate">{p.title}</td>
        <td className="px-4 py-3 font-body text-muted-foreground text-xs">{p.product_type || "—"}</td>
        <td className="px-4 py-3 font-body text-muted-foreground">{p.variants.length}</td>
        <td className="px-4 py-3 font-body text-foreground">{priceRange}</td>
        <td className="px-4 py-3 font-body">
          <span className={`flex items-center gap-1 ${isLow ? "text-amber-400" : "text-foreground"}`}>
            {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
            {totalInv}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-wider ${
            p.status === "active" ? "bg-emerald-500/15 text-emerald-400" :
            p.status === "draft" ? "bg-amber-500/15 text-amber-400" :
            "bg-muted text-muted-foreground"
          }`}>
            {p.status.toUpperCase()}
          </span>
        </td>
        <td className="px-4 py-3">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-accent/10">
          <td colSpan={10} className="px-6 py-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-display text-[9px] tracking-widest text-muted-foreground mb-3">VARIANTS</h4>
                <div className="space-y-1">
                  {p.variants.map((v: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm font-body">
                      <span className="text-foreground">{v.title} {v.sku && <span className="text-muted-foreground">({v.sku})</span>}</span>
                      <span className={`${v.inventory_quantity < 10 ? "text-amber-400" : "text-muted-foreground"}`}>
                        ${parseFloat(v.price).toFixed(2)} · {v.inventory_quantity} in stock
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-display text-[9px] tracking-widest text-muted-foreground mb-3">INFO</h4>
                <div className="text-sm font-body space-y-1">
                  <p><span className="text-muted-foreground">CB Item Name:</span> <span className="text-foreground">{p.cb_item_name || "—"}</span></p>
                  <p><span className="text-muted-foreground">Vendor:</span> <span className="text-foreground">{p.vendor || "—"}</span></p>
                  <p><span className="text-muted-foreground">Shopify ID:</span> <span className="text-foreground">{p.shopify_product_id}</span></p>
                  <p><span className="text-muted-foreground">Last synced:</span> <span className="text-foreground">{new Date(p.last_synced_at).toLocaleString()}</span></p>
                </div>
                {p.fitment_vehicles.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">FITMENT</h4>
                    <div className="flex flex-wrap gap-1">
                      {p.fitment_vehicles.slice(0, 10).map((v: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-display tracking-wider">
                          {v.year} {v.make} {v.model}
                        </span>
                      ))}
                      {p.fitment_vehicles.length > 10 && (
                        <span className="text-xs text-muted-foreground">+{p.fitment_vehicles.length - 10} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-display text-[9px] tracking-widest text-muted-foreground mb-3">METAFIELDS</h4>
                {(p.metafields && p.metafields.length > 0) ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {p.metafields.map((mf: any, i: number) => (
                      <div key={i} className="text-sm font-body">
                        <span className="text-muted-foreground">{mf.namespace}.{mf.key}:</span>{" "}
                        <span className="text-foreground break-all">
                          {typeof mf.value === "string" && mf.value.length > 100 ? mf.value.slice(0, 100) + "…" : mf.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No metafields</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
