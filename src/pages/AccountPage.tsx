import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Package, MapPin, Truck, LogOut, ChevronRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useVehicle } from "@/contexts/VehicleContext";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const AccountPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { vehicle, vehicleLabel } = useVehicle();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(session.user);
      const { data } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", session.user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    trackEvent("logout");
    await supabase.auth.signOut();
    navigate("/");
  };

  const getDisplayName = () => {
    if (profile?.first_name) return profile.first_name;
    const meta = user?.user_metadata;
    if (meta?.given_name) return meta.given_name;
    const fullName = meta?.full_name || meta?.name;
    if (fullName) return fullName.split(" ")[0];
    return user?.email?.split("@")[0] || "there";
  };

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded" />)}
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const accountLinks = [
    { to: "/account/settings", icon: <Settings className="w-5 h-5 text-primary" />, title: "ACCOUNT SETTINGS", desc: "Manage your profile info" },
    { to: "/account/orders", icon: <Package className="w-5 h-5 text-primary" />, title: "MY ORDERS", desc: "Track orders and view history" },
    { to: "/account/addresses", icon: <MapPin className="w-5 h-5 text-primary" />, title: "MY ADDRESSES", desc: "Manage shipping addresses" },
    { to: "/account/vehicles", icon: <Truck className="w-5 h-5 text-primary" />, title: "MY VEHICLES", desc: "Manage your saved vehicles" },
  ];

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-xl md:text-2xl tracking-widest text-foreground">
            WELCOME, {getDisplayName().toUpperCase()}!
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors font-display text-[10px] tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {accountLinks.map((link) => (
            <Link
              key={link.title}
              to={link.to}
              className="border border-border bg-card p-5 hover:border-primary/50 hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-3">
                {link.icon}
                <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
              <h3 className="font-display text-xs tracking-widest text-foreground mb-1">{link.title}</h3>
              <p className="font-body text-xs text-muted-foreground">{link.desc}</p>
            </Link>
          ))}
        </div>

        {/* Quick vehicle preview */}
        <div className="border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">PRIMARY VEHICLE</span>
            </div>
            <Link to="/account/vehicles" className="text-xs text-primary hover:underline font-display tracking-wider">MANAGE</Link>
          </div>
          {vehicle ? (
            <p className="font-body text-sm text-foreground">{vehicleLabel}</p>
          ) : (
            <p className="font-body text-sm text-muted-foreground">No vehicle saved yet.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default AccountPage;
