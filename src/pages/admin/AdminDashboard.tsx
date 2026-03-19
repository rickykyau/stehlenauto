import { useEffect, useState } from "react";
import { Users, UserPlus, Package, DollarSign, Tag, Activity } from "lucide-react";
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
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fifteenAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const [profilesRes, newRes, promosRes, activeRes, recentUsersRes, activityRes] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
          supabase.from("promo_codes").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("user_activity_log").select("user_id", { count: "exact", head: true }).gte("created_at", fifteenAgo),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10),
          supabase.from("user_activity_log").select("*").order("created_at", { ascending: false }).limit(20),
        ]);

      setTotalUsers(profilesRes.count ?? 0);
      setNewUsersToday(newRes.count ?? 0);
      setActivePromos(promosRes.count ?? 0);
      setActiveNow(activeRes.count ?? 0);
      setRecentUsers(recentUsersRes.data ?? []);
      setRecentActivity(activityRes.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const kpis: KPI[] = [
    { label: "Total Users", value: totalUsers ?? "–", icon: Users, loading: loading },
    { label: "New Users Today", value: newUsersToday ?? "–", icon: UserPlus, loading: loading },
    { label: "Total Orders", value: "–", icon: Package, loading: false },
    { label: "Revenue This Month", value: "–", icon: DollarSign, loading: false },
    { label: "Active Promo Codes", value: activePromos ?? "–", icon: Tag, loading: loading },
    { label: "Active Users (15m)", value: activeNow ?? "–", icon: Activity, loading: loading },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

        {/* Recent Activity */}
        <div className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display text-[10px] tracking-widest text-muted-foreground">RECENT ACTIVITY</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">EVENT</th>
                  <th className="px-4 py-2 font-display text-[9px] tracking-widest text-muted-foreground">TIME</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-display text-[9px] tracking-wider">
                        {a.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-body text-muted-foreground text-xs">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recentActivity.length === 0 && !loading && (
                  <tr><td colSpan={2} className="px-4 py-6 text-center text-muted-foreground text-xs">No activity yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
