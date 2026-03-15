/**
 * SHOPIFY SECTION: sections/header.liquid
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, MessageCircle, HelpCircle, User, Grid3X3, ChevronRight, ChevronLeft, Truck, Loader2 } from "lucide-react";
import logo from "@/assets/stehlen-logo.png";
import VehicleBar from "./VehicleBar";
import FitmentSelector from "./FitmentSelector";
import { useCartStore } from "@/stores/cartStore";
import { useVehicle } from "@/contexts/VehicleContext";
import { useShopifyCollections } from "@/hooks/useShopifyProducts";

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fitmentOpen, setFitmentOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<null | "category">(null);
  const location = useLocation();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { vehicle, vehicleLabel } = useVehicle();
  const fitmentRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSubMenu(null);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setMenuOpen(!menuOpen); setSubMenu(null); }}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/">
              <img src={logo} alt="Stehlen Auto" className="h-7 w-auto" />
            </Link>
          </div>

          {/* Center: Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="flex w-full border border-border bg-card">
              <div className="flex items-center px-3">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search by Make Model Year, Product Type, or Part Number"
                className="flex-1 h-10 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFitmentOpen(!fitmentOpen)}
              className="hidden lg:flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-2 text-primary font-display text-[11px] tracking-widest hover:bg-primary/10 transition-colors btn-press"
            >
              <Truck className="w-3.5 h-3.5" />
              {vehicle ? vehicleLabel.toUpperCase() : "SELECT YOUR VEHICLE"}
            </button>
            <button onClick={toggleCart} className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press">
              <ShoppingCart className="w-5 h-5" />
              <span className={`absolute top-1 right-1 w-4 h-4 font-display text-[9px] flex items-center justify-center ${itemCount > 0 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"}`}>{itemCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden border-t border-border p-3">
            <div className="flex border border-border bg-card">
              <div className="flex items-center px-3">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 h-10 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        )}
        {/* Fitment dropdown */}
        {fitmentOpen && (
          <div ref={fitmentRef} className="absolute top-full right-0 left-0 lg:left-auto lg:right-8 lg:w-[600px] z-50 border border-border shadow-xl">
            <FitmentSelector onVehicleSelect={() => setFitmentOpen(false)} />
          </div>
        )}
      </header>

      {/* Fitment overlay */}
      {fitmentOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setFitmentOpen(false)} />
      )}

      <VehicleBar />

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => { setMenuOpen(false); setSubMenu(null); }}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[340px] max-w-[85vw] bg-card z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <span className="font-display text-xs tracking-[0.2em] text-muted-foreground">MENU</span>
          <button
            onClick={() => { setMenuOpen(false); setSubMenu(null); }}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Main menu */}
          <div className={`absolute inset-0 overflow-y-auto transition-transform duration-250 ease-in-out ${subMenu ? "-translate-x-full" : "translate-x-0"}`}>
            <div className="border-b border-border">
              <MenuLink icon={<MessageCircle className="w-5 h-5" />} label="Live Chat" to="#" />
              <MenuLink icon={<HelpCircle className="w-5 h-5" />} label="Help Center" to="#" />
              <MenuLink icon={<User className="w-5 h-5" />} label="My Account" to="#" />
            </div>

            <div className="border-b border-border">
              <button
                onClick={() => setSubMenu("category")}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <Grid3X3 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-body text-sm text-foreground">Shop by Category</span>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 py-4">
              <Link
                to="/collections/all"
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-display text-xs tracking-widest hover:brightness-110 transition-all btn-press"
              >
                SHOP ALL PRODUCTS
              </Link>
            </div>
          </div>

          {/* Sub-menu: Category */}
          <div className={`absolute inset-0 overflow-y-auto transition-transform duration-250 ease-in-out ${subMenu === "category" ? "translate-x-0" : "translate-x-full"}`}>
            <button
              onClick={() => setSubMenu(null)}
              className="w-full flex items-center gap-2 px-5 py-4 border-b border-border hover:bg-accent/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
              <span className="font-display text-xs tracking-widest text-primary">BACK</span>
            </button>
            <div className="px-5 pt-4 pb-2">
              <span className="font-display text-[10px] tracking-[0.2em] text-muted-foreground">SHOP BY CATEGORY</span>
            </div>
            {collections.map((c) => (
              <Link
                key={c.id}
                to={`/collections/${c.slug}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors group"
              >
                <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">{c.title}</span>
                <span className="font-display text-[10px] text-muted-foreground">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const MenuLink = ({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors group"
  >
    <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
    <span className="font-body text-sm text-foreground">{label}</span>
  </Link>
);

export default SiteHeader;
