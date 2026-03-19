import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Search, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  shopify_order_id: string;
  order_number: string;
  email: string | null;
  customer_name: string | null;
  total_price: number;
  subtotal_price: number;
  discount_amount: number;
  promo_code_used: string | null;
  financial_status: string;
  fulfillment_status: string;
  line_items: any[];
  shipping_address: any;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  refunded: "bg-red-500/15 text-red-400",
  partially_refunded: "bg-orange-500/15 text-orange-400",
  fulfilled: "bg-emerald-500/15 text-emerald-400",
  unfulfilled: "bg-amber-500/15 text-amber-400",
  partially_fulfilled: "bg-blue-500/15 text-blue-400",
  shipped: "bg-blue-500/15 text-blue-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterFulfillment, setFilterFulfillment] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"created_at" | "total_price">("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order(sortField, { ascending: sortAsc })
      .limit(500);
    setOrders((data as any[]) ?? []);
    setLoading(false);
  };

  const fetchLastSync = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "last_orders_sync")
      .maybeSingle();
    if (data?.value && typeof data.value === "object" && "timestamp" in (data.value as any)) {
      setLastSync((data.value as any).timestamp);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchLastSync();
  }, [sortField, sortAsc]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("sync-shopify-orders", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data as any;
      toast.success(`Synced ${result.synced} orders from Shopify`);
      await fetchOrders();
      await fetchLastSync();
    } catch (err: any) {
      toast.error("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const toggleSort = (field: "created_at" | "total_price") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || 
      o.order_number.toLowerCase().includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.email || "").toLowerCase().includes(q);
    const matchesPayment = filterPayment === "all" || o.financial_status === filterPayment;
    const matchesFulfill = filterFulfillment === "all" || o.fulfillment_status === filterFulfillment;
    return matchesSearch && matchesPayment && matchesFulfill;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-body">
            {orders.length} orders {lastSync && `· Last synced ${new Date(lastSync).toLocaleString()}`}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-display text-xs tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "SYNCING…" : "SYNC ORDERS"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="w-full pl-10 pr-4 py-2 bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm font-body text-foreground"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially Refunded</option>
        </select>
        <select
          value={filterFulfillment}
          onChange={(e) => setFilterFulfillment(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm font-body text-foreground"
        >
          <option value="all">All Fulfillment</option>
          <option value="unfulfilled">Unfulfilled</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="partially_fulfilled">Partial</option>
          <option value="shipped">Shipped</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">ORDER #</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">CUSTOMER</th>
              <th
                className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground cursor-pointer select-none"
                onClick={() => toggleSort("created_at")}
              >
                <span className="flex items-center gap-1">DATE <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th
                className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground cursor-pointer select-none"
                onClick={() => toggleSort("total_price")}
              >
                <span className="flex items-center gap-1">TOTAL <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">PAYMENT</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">FULFILLMENT</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">PROMO</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-xs">
                {orders.length === 0 ? "No orders synced yet. Click \"Sync Orders\" to fetch from Shopify." : "No matching orders."}
              </td></tr>
            ) : (
              filtered.map((o) => (
                <>
                  <tr
                    key={o.id}
                    className="border-b border-border hover:bg-accent/30 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                  >
                    <td className="px-4 py-3 font-body text-foreground font-medium">#{o.order_number}</td>
                    <td className="px-4 py-3 font-body text-foreground">
                      <div>{o.customer_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 font-body text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-body text-foreground">${Number(o.total_price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-wider ${STATUS_COLORS[o.financial_status] || "bg-muted text-muted-foreground"}`}>
                        {o.financial_status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-wider ${STATUS_COLORS[o.fulfillment_status] || "bg-muted text-muted-foreground"}`}>
                        {o.fulfillment_status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                      {o.promo_code_used || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {expandedId === o.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </td>
                  </tr>
                  {expandedId === o.id && (
                    <tr key={`${o.id}-detail`} className="border-b border-border bg-accent/10">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Line Items */}
                          <div>
                            <h4 className="font-display text-[9px] tracking-widest text-muted-foreground mb-3">LINE ITEMS</h4>
                            <div className="space-y-2">
                              {(o.line_items || []).map((li: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-start text-sm font-body">
                                  <div>
                                    <span className="text-foreground">{li.title}</span>
                                    {li.variant_title && <span className="text-muted-foreground ml-1">({li.variant_title})</span>}
                                    <span className="text-muted-foreground ml-2">×{li.quantity}</span>
                                  </div>
                                  <span className="text-foreground">${Number(li.price).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm font-body">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span><span>${Number(o.subtotal_price).toFixed(2)}</span>
                              </div>
                              {o.discount_amount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                  <span>Discount {o.promo_code_used && `(${o.promo_code_used})`}</span>
                                  <span>-${Number(o.discount_amount).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-foreground font-medium">
                                <span>Total</span><span>${Number(o.total_price).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          {/* Shipping */}
                          <div>
                            <h4 className="font-display text-[9px] tracking-widest text-muted-foreground mb-3">SHIPPING ADDRESS</h4>
                            {o.shipping_address ? (
                              <div className="text-sm font-body text-foreground space-y-0.5">
                                <p>{(o.shipping_address as any).name}</p>
                                <p>{(o.shipping_address as any).address1}</p>
                                {(o.shipping_address as any).address2 && <p>{(o.shipping_address as any).address2}</p>}
                                <p>
                                  {(o.shipping_address as any).city}, {(o.shipping_address as any).province_code} {(o.shipping_address as any).zip}
                                </p>
                                <p>{(o.shipping_address as any).country}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No shipping address</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
