import { ExternalLink, LogOut, Package, Settings, MapPin, Truck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useVehicle } from "@/contexts/VehicleContext";
import { useCustomer } from "@/contexts/CustomerContext";

const SHOPIFY_ACCOUNT_URL = "https://shopify.com/72426389551/account";

const AccountPage = () => {
  const { customer, loading, logout } = useCustomer();
  const { vehicle, vehicleLabel } = useVehicle();

  const firstName = customer?.firstName || localStorage.getItem("customerFirstName") || "Customer";

  const handleLogout = () => {
    logout();
    localStorage.removeItem("customerFirstName");
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("loginProvider");
    window.location.href = `${SHOPIFY_ACCOUNT_URL}/logout`;
  };

  const accountLinks = [
    {
      href: SHOPIFY_ACCOUNT_URL,
      icon: <Settings className="w-5 h-5 text-primary" />,
      title: "ACCOUNT SETTINGS",
      desc: "Manage your profile and login",
    },
    {
      href: `${SHOPIFY_ACCOUNT_URL}/orders`,
      icon: <Package className="w-5 h-5 text-primary" />,
      title: "MY ORDERS",
      desc: "Track orders and view history",
    },
    {
      href: `${SHOPIFY_ACCOUNT_URL}/addresses`,
      icon: <MapPin className="w-5 h-5 text-primary" />,
      title: "MY ADDRESSES",
      desc: "Manage shipping addresses",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-xl md:text-2xl tracking-widest text-foreground">
            WELCOME, {firstName.toUpperCase()}!
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors font-display text-[10px] tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT
          </button>
        </div>

        {/* Account links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {accountLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border bg-card p-5 hover:border-primary/50 hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-3">
                {link.icon}
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
              <h3 className="font-display text-xs tracking-widest text-foreground mb-1">{link.title}</h3>
              <p className="font-body text-xs text-muted-foreground">{link.desc}</p>
            </a>
          ))}
        </div>

        {/* My Vehicle */}
        <div className="border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-primary" />
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">MY VEHICLE</span>
          </div>
          {vehicle ? (
            <p className="font-body text-sm text-foreground">{vehicleLabel}</p>
          ) : (
            <p className="font-body text-sm text-muted-foreground">No vehicle saved.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default AccountPage;
