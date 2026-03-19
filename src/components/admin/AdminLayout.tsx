import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ShoppingCart,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  Ticket,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Products", path: "/admin/products", icon: Package, badgeKey: "products" },
  { label: "Promo Codes", path: "/admin/promo-codes", icon: Tag },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Content", path: "/admin/content", icon: FileText },
  { label: "Audit Log", path: "/admin/audit-log", icon: ClipboardList },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [productsSyncing, setProductsSyncing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("inventory_alerts")
      .select("id", { count: "exact", head: true })
      .eq("alert_status", "active")
      .then(({ count }) => setAlertCount(count ?? 0));
  }, [isAdmin]);

  // Poll sync status for sidebar indicator
  useEffect(() => {
    if (!isAdmin) return;

    const checkSync = async () => {
      const { data } = await supabase
        .from("sync_status")
        .select("status")
        .eq("sync_type", "products")
        .maybeSingle();
      setProductsSyncing(data?.status === "in_progress");
    };

    checkSync();
    const interval = setInterval(checkSync, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-bar w-32" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="h-14 flex items-center px-4 border-b border-border gap-2">
          <span className="font-display text-xs tracking-[0.15em] text-primary">STEHLEN AUTO</span>
          <span className="font-display text-[9px] tracking-widest text-muted-foreground">ADMIN</span>
        </div>

        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto sidebar-scroll">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            const showBadge = (item as any).badgeKey === "products" && alertCount > 0;
            const showSyncIndicator = (item as any).badgeKey === "products" && productsSyncing;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-body transition-colors ${
                  active
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {showSyncIndicator && (
                  <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                )}
                {showBadge && !showSyncIndicator && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-display">
                    <AlertTriangle className="w-3 h-3" />
                    {alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
          <h2 className="font-display text-xs tracking-widest text-foreground">
            {NAV_ITEMS.find((i) => i.path === location.pathname)?.label?.toUpperCase() || "ADMIN"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-muted-foreground">{userName}</span>
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-display text-xs flex items-center justify-center">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
