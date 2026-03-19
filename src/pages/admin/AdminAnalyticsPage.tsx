import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const RANGE_OPTIONS = [
  { label: "Today", days: 1 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

const CHART_COLORS = [
  "hsl(38, 91%, 55%)", // primary
  "hsl(220, 10%, 55%)",
  "hsl(142, 72%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 50%)",
];

interface ActivityRow {
  id: string;
  event_type: string;
  event_data: any;
  page_url: string | null;
  user_id: string | null;
  created_at: string;
}

export default function AdminAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState(30);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [promoUsage, setPromoUsage] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
      const [{ data: actData }, { data: usageData }, { data: codesData }] = await Promise.all([
        supabase.from("user_activity_log").select("*").gte("created_at", since).order("created_at", { ascending: true }).limit(1000),
        supabase.from("promo_code_usage").select("*").gte("used_at", since).order("used_at", { ascending: true }),
        supabase.from("promo_codes").select("*"),
      ]);
      setActivity(actData ?? []);
      setPromoUsage((usageData as any[]) ?? []);
      setPromoCodes((codesData as any[]) ?? []);
      setLoading(false);
    };
    load();
  }, [rangeDays]);

  // KPIs
  const pageViews = activity.filter((a) => a.event_type === "page_view").length;
  const uniqueUsers = new Set(activity.filter((a) => a.user_id).map((a) => a.user_id)).size;
  const searches = activity.filter((a) => a.event_type === "search").length;
  const vehicleSelections = activity.filter((a) => a.event_type === "vehicle_selected").length;
  const productViews = activity.filter((a) => a.event_type === "product_viewed").length;
  const addToCarts = activity.filter((a) => a.event_type === "add_to_cart").length;

  const kpis = [
    { label: "Page Views", value: pageViews },
    { label: "Unique Users", value: uniqueUsers },
    { label: "Searches", value: searches },
    { label: "Vehicle Selections", value: vehicleSelections },
    { label: "Product Views", value: productViews },
    { label: "Add to Cart", value: addToCarts },
  ];

  // Daily visitors chart
  const dailyVisitors = useMemo(() => {
    const map: Record<string, number> = {};
    activity.filter((a) => a.event_type === "page_view").forEach((a) => {
      const day = a.created_at.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [activity]);

  // Top products
  const topProducts = useMemo(() => {
    const map: Record<string, number> = {};
    activity.filter((a) => a.event_type === "product_viewed").forEach((a) => {
      const name = (a.event_data as any)?.product_name || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, views]) => ({ name: name.length > 30 ? name.slice(0, 30) + "…" : name, views }));
  }, [activity]);

  // Top searches
  const topSearches = useMemo(() => {
    const map: Record<string, number> = {};
    activity.filter((a) => a.event_type === "search").forEach((a) => {
      const term = (a.event_data as any)?.search_term || "Unknown";
      map[term] = (map[term] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([term, count]) => ({ term, count }));
  }, [activity]);

  // Auth breakdown
  const authBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    activity.filter((a) => a.event_type === "login" || a.event_type === "sign_up").forEach((a) => {
      const method = (a.event_data as any)?.method || "unknown";
      map[method] = (map[method] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activity]);

  // Top vehicles
  const topVehicles = useMemo(() => {
    const map: Record<string, number> = {};
    activity.filter((a) => a.event_type === "vehicle_selected").forEach((a) => {
      const d = a.event_data as any;
      const key = `${d?.year || ""} ${d?.make || ""} ${d?.model || ""}`.trim() || "Unknown";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([vehicle, count]) => ({ vehicle, count }));
  }, [activity]);

  // Signups over time
  const signupsOverTime = useMemo(() => {
    const map: Record<string, number> = {};
    activity.filter((a) => a.event_type === "sign_up").forEach((a) => {
      const day = a.created_at.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [activity]);

  // Funnel
  const funnel = [
    { step: "Page View", count: pageViews },
    { step: "Vehicle Selected", count: vehicleSelections },
    { step: "Product Viewed", count: productViews },
    { step: "Add to Cart", count: addToCarts },
    { step: "Checkout", count: 0 },
  ];

  // Top pages
  const topPages = useMemo(() => {
    const map: Record<string, number> = {};
    activity.filter((a) => a.event_type === "page_view" && a.page_url).forEach((a) => {
      map[a.page_url!] = (map[a.page_url!] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, views]) => ({ page, views }));
  }, [activity]);

  const tooltipStyle = { contentStyle: { backgroundColor: "hsl(220,12%,12%)", border: "1px solid hsl(220,8%,25%)", color: "#fff", fontSize: 12 } };

  return (
    <div className="space-y-6">
      {/* Date range */}
      <div className="flex gap-0 border border-border bg-card w-fit">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.days}
            onClick={() => setRangeDays(r.days)}
            className={`px-4 py-2 font-display text-[10px] tracking-widest transition-colors ${
              rangeDays === r.days ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <div className="loading-bar w-32 mx-auto" />}

      {!loading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="border border-border bg-card p-4 space-y-1">
                <p className="font-display text-[9px] tracking-widest text-muted-foreground uppercase">{k.label}</p>
                <p className="font-display text-2xl text-foreground">{k.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Visitors */}
            <div className="border border-border bg-card p-4">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">DAILY VISITORS</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyVisitors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,8%,20%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Signups over time */}
            <div className="border border-border bg-card p-4">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">USER SIGNUPS</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={signupsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,8%,20%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <div className="border border-border bg-card p-4">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">TOP VIEWED PRODUCTS</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,8%,20%)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "hsl(220,8%,55%)" }} width={120} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="views" fill={CHART_COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Searches */}
            <div className="border border-border bg-card p-4">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">TOP SEARCHES</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topSearches} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,8%,20%)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
                  <YAxis dataKey="term" type="category" tick={{ fontSize: 9, fill: "hsl(220,8%,55%)" }} width={100} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill={CHART_COLORS[4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Auth Breakdown */}
            <div className="border border-border bg-card p-4">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">AUTH METHOD</h4>
              {authBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={authBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {authBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground text-xs py-12">No auth data yet</p>
              )}
            </div>
          </div>

          {/* Top Vehicles */}
          <div className="border border-border bg-card p-4">
            <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">TOP VEHICLES SELECTED</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topVehicles}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,8%,20%)" />
                <XAxis dataKey="vehicle" tick={{ fontSize: 9, fill: "hsl(220,8%,55%)" }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Funnel */}
          <div className="border border-border bg-card p-5">
            <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">USER BEHAVIOR FUNNEL</h4>
            <div className="flex items-end gap-2 justify-center">
              {funnel.map((step, i) => {
                const maxCount = Math.max(...funnel.map((f) => f.count), 1);
                const height = Math.max((step.count / maxCount) * 160, 20);
                const prevCount = i > 0 ? funnel[i - 1].count : step.count;
                const rate = prevCount > 0 ? ((step.count / prevCount) * 100).toFixed(1) : "—";
                return (
                  <div key={step.step} className="flex flex-col items-center gap-1 flex-1 max-w-[140px]">
                    {i > 0 && (
                      <span className="font-display text-[9px] tracking-wider text-primary">{rate}%</span>
                    )}
                    <div
                      className="w-full bg-primary/20 border border-primary/30 flex items-end justify-center transition-all"
                      style={{ height }}
                    >
                      <span className="font-display text-sm text-foreground pb-1">{step.count}</span>
                    </div>
                    <span className="font-display text-[8px] tracking-wider text-muted-foreground text-center">{step.step.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="border border-border bg-card">
              <div className="px-4 py-3 border-b border-border">
                <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">TOP PAGES</h4>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {topPages.map((p) => (
                    <tr key={p.page} className="border-b border-border last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-2 font-body text-foreground truncate max-w-[250px]">{p.page}</td>
                      <td className="px-4 py-2 font-display text-sm text-muted-foreground text-right">{p.views}</td>
                    </tr>
                  ))}
                  {topPages.length === 0 && (
                    <tr><td colSpan={2} className="px-4 py-6 text-center text-muted-foreground text-xs">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Placeholder cards */}
            <div className="space-y-4">
              <div className="border border-border bg-card p-6 text-center">
                <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-1">REVENUE</p>
                <p className="font-body text-sm text-muted-foreground">Coming soon — Shopify integration</p>
              </div>
              <div className="border border-border bg-card p-6 text-center">
                <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-1">ORDERS</p>
                <p className="font-body text-sm text-muted-foreground">Coming soon — Shopify integration</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
