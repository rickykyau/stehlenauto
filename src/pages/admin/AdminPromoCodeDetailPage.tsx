import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  current_uses: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

interface UsageRow {
  id: string;
  promo_code_id: string;
  user_id: string | null;
  order_id: string | null;
  discount_applied: number;
  used_at: string;
}

const tooltipStyle = { contentStyle: { backgroundColor: "hsl(220,12%,12%)", border: "1px solid hsl(220,8%,25%)", color: "#fff", fontSize: 12 } };

export default function AdminPromoCodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [usageRows, setUsageRows] = useState<UsageRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { first_name: string | null; last_name: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<"used_at" | "discount_applied">("used_at");
  const [sortAsc, setSortAsc] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [{ data: promoData }, { data: usageData }] = await Promise.all([
        supabase.from("promo_codes").select("*").eq("id", id).single(),
        supabase.from("promo_code_usage").select("*").eq("promo_code_id", id).order("used_at", { ascending: false }),
      ]);
      setPromo(promoData as any);
      const rows = (usageData as any[]) ?? [];
      setUsageRows(rows);

      // Fetch profiles for user_ids
      const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);
        const map: Record<string, any> = {};
        (profilesData ?? []).forEach((p: any) => { map[p.user_id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Metrics
  const totalRedemptions = usageRows.length;
  const uniqueCustomers = new Set(usageRows.map((r) => r.user_id).filter(Boolean)).size;
  const totalDiscountGiven = usageRows.reduce((s, u) => s + Number(u.discount_applied), 0);
  const avgDiscount = totalRedemptions > 0 ? totalDiscountGiven / totalRedemptions : 0;

  // Redemptions over time
  const redemptionsOverTime = useMemo(() => {
    const map: Record<string, number> = {};
    usageRows.forEach((u) => {
      const day = u.used_at.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).sort().map(([date, count]) => ({ date: date.slice(5), count }));
  }, [usageRows]);

  // Status
  const getStatus = () => {
    if (!promo) return { label: "—", cls: "" };
    if (!promo.is_active) return { label: "DISABLED", cls: "bg-muted text-muted-foreground" };
    if (new Date(promo.expires_at) <= new Date()) return { label: "EXPIRED", cls: "bg-destructive/20 text-destructive" };
    return { label: "ACTIVE", cls: "bg-emerald-500/15 text-emerald-400" };
  };
  const status = getStatus();

  // Sorted & filtered transactions
  const sortedUsage = useMemo(() => {
    let rows = [...usageRows];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => {
        const profile = r.user_id ? profiles[r.user_id] : null;
        const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.toLowerCase() : "";
        return name.includes(q) || (r.order_id || "").toLowerCase().includes(q);
      });
    }
    rows.sort((a, b) => {
      const valA = sortField === "used_at" ? new Date(a.used_at).getTime() : Number(a.discount_applied);
      const valB = sortField === "used_at" ? new Date(b.used_at).getTime() : Number(b.discount_applied);
      return sortAsc ? valA - valB : valB - valA;
    });
    return rows;
  }, [usageRows, search, sortField, sortAsc, profiles]);

  const pagedUsage = sortedUsage.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sortedUsage.length / PAGE_SIZE);

  const toggleSort = (field: "used_at" | "discount_applied") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="loading-bar w-32" /></div>;
  }

  if (!promo) {
    return <div className="text-center py-12 text-muted-foreground">Promo code not found</div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/admin/promo-codes")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
        <ArrowLeft className="w-4 h-4" /> Back to Promo Codes
      </button>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg tracking-wider text-foreground">{promo.code}</h2>
            <span className={`inline-block px-2 py-0.5 font-display text-[9px] tracking-wider ${status.cls}`}>{status.label}</span>
          </div>
          {promo.description && <p className="font-body text-sm text-muted-foreground">{promo.description}</p>}
          <div className="grid grid-cols-2 gap-3 text-sm font-body">
            <div><span className="text-muted-foreground">Discount:</span> <span className="text-foreground">{promo.discount_type === "percentage" ? `${promo.discount_value}%` : `$${promo.discount_value}`}</span></div>
            <div><span className="text-muted-foreground">Min Order:</span> <span className="text-foreground">{promo.minimum_order_amount ? `$${promo.minimum_order_amount}` : "None"}</span></div>
            <div><span className="text-muted-foreground">Total Limit:</span> <span className="text-foreground">{promo.max_uses ?? "Unlimited"}</span></div>
            <div><span className="text-muted-foreground">Per Customer:</span> <span className="text-foreground">{promo.max_uses_per_user ?? "Unlimited"}</span></div>
            <div><span className="text-muted-foreground">Usage:</span> <span className="text-foreground">{promo.current_uses} / {promo.max_uses ?? "∞"}</span></div>
            <div><span className="text-muted-foreground">Date Range:</span> <span className="text-foreground">{new Date(promo.starts_at).toLocaleDateString()} – {new Date(promo.expires_at).toLocaleDateString()}</span></div>
          </div>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Redemptions", value: totalRedemptions },
            { label: "Unique Customers", value: uniqueCustomers },
            { label: "Total Discount Given", value: `$${totalDiscountGiven.toFixed(2)}` },
            { label: "Avg Discount/Use", value: `$${avgDiscount.toFixed(2)}` },
          ].map((k) => (
            <div key={k.label} className="border border-border bg-card p-4 space-y-1">
              <p className="font-display text-[9px] tracking-widest text-muted-foreground uppercase">{k.label}</p>
              <p className="font-display text-2xl text-foreground">{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Redemptions chart */}
      {redemptionsOverTime.length > 0 && (
        <div className="border border-border bg-card p-4">
          <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">REDEMPTIONS OVER TIME</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={redemptionsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,8%,20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="hsl(38, 91%, 55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transactions table */}
      <div className="border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">TRANSACTIONS ({sortedUsage.length})</h4>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search…"
              className="w-full pl-10 pr-4 py-1.5 bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground cursor-pointer" onClick={() => toggleSort("used_at")}>
                  <span className="flex items-center gap-1">DATE <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">CUSTOMER</th>
                <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">ORDER</th>
                <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground cursor-pointer" onClick={() => toggleSort("discount_applied")}>
                  <span className="flex items-center gap-1">DISCOUNT <ArrowUpDown className="w-3 h-3" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedUsage.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs">No transactions</td></tr>
              ) : (
                pagedUsage.map((u) => {
                  const profile = u.user_id ? profiles[u.user_id] : null;
                  const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "—";
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-2.5 font-body text-muted-foreground text-xs">{new Date(u.used_at).toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-body text-foreground">{name}</td>
                      <td className="px-4 py-2.5 font-body text-muted-foreground text-xs">{u.order_id || "—"}</td>
                      <td className="px-4 py-2.5 font-body text-foreground">${Number(u.discount_applied).toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground font-body">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 text-xs font-display tracking-wider bg-accent/50 text-foreground disabled:opacity-30">PREV</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1 text-xs font-display tracking-wider bg-accent/50 text-foreground disabled:opacity-30">NEXT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
