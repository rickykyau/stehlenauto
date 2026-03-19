import { useEffect, useState } from "react";
import { Users, UserPlus, Package, DollarSign, Tag, Activity, ShoppingCart, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface KPI {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading: boolean;
}

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [newUsersToday, setNewUsersToday] = useState<number | null>(null);
  const [activePromos, setActivePromos] = useState<number | null>(null);
  const [activeNow, setActiveNow] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [revenueMonth, setRevenueMonth] = useState<number | null>(null);
  const [avgOrderValue, setAvgOrderValue] = useState<number | null>(null);
  const [ordersToday, setOrdersToday] = useState<number | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const fifteenAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const [
        profilesRes, newRes, promosRes, activeRes,
        recentUsersRes, activityRes,
        ordersCountRes, ordersTodayRes, revenueRes, alertsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("promo_codes").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("user_activity_log").select("user_id", { count: "exact", head: true }).gte("created_at", fifteenAgo),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("user_activity_log").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("orders").select("total_price").gte("created_at", monthStart),
        supabase.from("inventory_alerts").select("*").eq("alert_status", "active").order("current_quantity", { ascending: true }).limit(10),
      ]);

      setTotalUsers(profilesRes.count ?? 0);
      setNewUsersToday(newRes.count ?? 0);
      setActivePromos(promosRes.count ?? 0);
      setActiveNow(activeRes.count ?? 0);
      setRecentUsers(recentUsersRes.data ?? []);
      setRecentActivity(activityRes.data ?? []);
      setTotalOrders(ordersCountRes.count ?? 0);
      setOrdersToday(ordersTodayRes.count ?? 0);
      setInventoryAlerts((alertsRes.data as any[]) ?? []);

      // Calculate revenue and AOV
      const revenueData = (revenueRes.data ?? []) as any[];
      const rev = revenueData.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0);
      setRevenueMonth(rev);
      setAvgOrderValue(revenueData.length > 0 ? rev / revenueData.length : 0);

      setLoading(false);
    };
    load();
  }, []);

  const kpis: KPI[] = [
    { label: "Total Users", value: totalUsers ?? "–", icon: Users, loading },
    { label: "New Users Today", value: newUsersToday ?? "–", icon: UserPlus, loading },
    { label: "Total Orders", value: totalOrders ?? "–", icon: Package, loading },
    { label: "Revenue This Month", value: revenueMonth !== null ? `$${revenueMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "–", icon: DollarSign, loading },
    { label: "Avg Order Value", value: avgOrderValue !== null ? `$${avgOrderValue.toFixed(2)}` : "–", icon: ShoppingCart, loading },
    { label: "Orders Today", value: ordersToday ?? "–", icon: Package, loading },
    { label: "Active Promos", value: activePromos ?? "–", icon: Tag, loading },
    { label: "Active Users (15m)", value: activeNow ?? "–", icon: Activity, loading },
  ];

  const handleAcknowledge = async (alertId: string) => {
    await supabase.from("inventory_alerts").update({ alert_status: "acknowledged" }).eq("id", alertId);
    setInventoryAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <kpi.icon className="w-4 h-4" />
              <span className="font-display text-[9px] tracking-widest uppercase">{kpi.label}</span>
            </div>
            <p className="font-display text-2xl text-foreground">
              {kpi.loading ? <span className="loading-bar w-12 inline-block" /> : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Inventory Alerts */}
      {inventoryAlerts.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-display text-[10px] tracking-widest text-amber-400">LOW STOCK ALERTS ({inventoryAlerts.length})</h3>
          </div>
          <div className="space-y-2">
            {inventoryAlerts.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between text-sm font-body">
                <div>
                  <span className="text-foreground">{a.variant_title}</span>
                  <span className="text-amber-400 ml-2">({a.current_quantity} left)</span>
                </div>
                <button
                  onClick={() => handleAcknowledge(a.id)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display text-[10px] tracking-widest text-muted-foreground">RECENT SIGNUPS</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">NAME</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-body text-foreground">
                      {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-body text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && !loading && (
                  <tr><td colSpan={2} className="px-4 py-6 text-center text-muted-foreground text-xs">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display text-[10px] tracking-widest text-muted-foreground">RECENT TRANSACTIONS</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">ORDER #</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">CUSTOMER</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">DATE</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">ITEMS</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">TOTAL</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">PAYMENT</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">PROMO</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-body text-foreground font-medium">#{o.order_number}</td>
                    <td className="px-4 py-2.5 font-body text-foreground">{o.customer_name || "—"}</td>
                    <td className="px-4 py-2.5 font-body text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 font-body text-muted-foreground">{Array.isArray(o.line_items) ? o.line_items.length : 0}</td>
                    <td className="px-4 py-2.5 font-body text-foreground">${Number(o.total_price).toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-wider ${
                        o.financial_status === "paid" ? "bg-emerald-500/15 text-emerald-400" :
                        o.financial_status === "refunded" ? "bg-destructive/20 text-destructive" :
                        "bg-amber-500/15 text-amber-400"
                      }`}>
                        {(o.financial_status || "pending").replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-body text-xs text-muted-foreground">{o.promo_code_used || "—"}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && !loading && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-xs">
                    No transactions yet. Orders will appear here once Shopify sync is configured.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
