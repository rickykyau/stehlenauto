/**
 * SHOPIFY SECTION: sections/header.liquid
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, MessageCircle, HelpCircle, User, Grid3X3, ChevronRight, ChevronLeft, Truck, Loader2, Car, Wrench } from "lucide-react";
import logo from "@/assets/stehlen-logo.png";
import VehicleBar from "./VehicleBar";
import FitmentSelector from "./FitmentSelector";
import { useCartStore } from "@/stores/cartStore";
import { useVehicle } from "@/contexts/VehicleContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";

/* Hardcoded category list — sorted by product count descending */
const MENU_CATEGORIES = [
  { label: "Bull Guards & Grille Guards", handle: "bull-guards-grille-guards" },
  { label: "Tonneau Covers", handle: "tonneau-covers" },
  { label: "Trailer Hitches", handle: "trailer-hitches" },
  { label: "Front Grilles", handle: "front-grilles" },
  { label: "Headlights", handle: "headlights" },
  { label: "Truck Bed Mats", handle: "truck-bed-mats" },
  { label: "Floor Mats", handle: "floor-mats" },
  { label: "Running Boards & Side Steps", handle: "running-boards-side-steps" },
  { label: "Roof Racks & Baskets", handle: "roof-racks-baskets" },
  { label: "Chase Racks & Sport Bars", handle: "chase-racks-sport-bars" },
  { label: "MOLLE Panels", handle: "molle-panels" },
  { label: "Under Seat Storage", handle: "under-seat-storage" },
];

/* Hardcoded vehicle makes — sorted alphabetically */
const MENU_VEHICLES = [
  { label: "Acura", handle: "acura-parts" },
  { label: "Audi", handle: "audi-parts" },
  { label: "Buick", handle: "buick-parts" },
  { label: "Chevy", handle: "chevy-parts" },
  { label: "Chrysler", handle: "chrysler-parts" },
  { label: "Dodge", handle: "dodge-parts" },
  { label: "Ford", handle: "ford-parts" },
  { label: "GMC", handle: "gmc-parts" },
  { label: "Honda", handle: "honda-parts" },
  { label: "Hyundai", handle: "hyundai-parts" },
  { label: "Infiniti", handle: "infiniti-parts" },
  { label: "Jeep", handle: "jeep-parts" },
  { label: "Kia", handle: "kia-parts" },
  { label: "Lexus", handle: "lexus-parts" },
  { label: "Lincoln", handle: "lincoln-parts" },
  { label: "Mazda", handle: "mazda-parts" },
  { label: "Mercedes-Benz", handle: "mercedes-benz-parts" },
  { label: "Mercury", handle: "mercury-parts" },
  { label: "Nissan", handle: "nissan-parts" },
  { label: "Pontiac", handle: "pontiac-parts" },
  { label: "Saturn", handle: "saturn-parts" },
  { label: "Subaru", handle: "subaru-parts" },
  { label: "Toyota", handle: "toyota-parts" },
  { label: "Volkswagen", handle: "volkswagen-parts" },
];

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fitmentOpen, setFitmentOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<null | "category" | "vehicle">(null);
  const location = useLocation();
  const navigate = useNavigate();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { vehicle, vehicleLabel } = useVehicle();
  const { customer } = useCustomer();
  const fitmentRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ShopifyProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSubMenu(null);
    setSearchDropdownOpen(false);
    setSearchQuery("");
  }, [location.pathname, location.search]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setSearchDropdownOpen(false);
      }
      if (!searchRef.current?.contains(e.target as Node) && !mobileSearchRef.current) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }
    setSearchLoading(true);
    setSearchDropdownOpen(true);
    try {
      const result = await storefrontApiRequest(PRODUCTS_QUERY, {
        first: 8,
        query,
        sortKey: "RELEVANCE",
        reverse: false,
        after: null,
      });
      const products = (result?.data?.products?.edges || []) as ShopifyProduct[];
      setSearchResults(products);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchDropdownOpen(false);
      navigate(`/collections/all?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const SearchDropdown = () => {
    if (!searchDropdownOpen) return null;
    return (
      <div className="absolute top-full left-0 right-0 z-50 border border-border bg-card shadow-lg max-h-[400px] overflow-y-auto">
        {searchLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="py-6 text-center">
            <p className="font-display text-[10px] tracking-widest text-muted-foreground">NO RESULTS FOUND</p>
          </div>
        ) : (
          searchResults.map((product) => {
            const p = product.node;
            const image = p.images.edges[0]?.node?.url || "/placeholder.svg";
            const price = parseFloat(p.priceRange.minVariantPrice.amount);
            return (
              <Link
                key={p.id}
                to={`/products/${p.handle}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
                onClick={() => setSearchDropdownOpen(false)}
              >
                <img src={image} alt={p.title} className="w-12 h-12 object-cover bg-muted shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-foreground truncate">{p.title}</p>
                  <p className="font-display text-sm text-primary font-bold">${price.toFixed(2)}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    );
  };

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
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchRef}>
            <div className="flex w-full border border-border bg-card">
              <div className="flex items-center px-3">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => { if (searchQuery.length >= 2) setSearchDropdownOpen(true); }}
                placeholder="Search by Make Model Year, Product Type, or Part Number"
                className="flex-1 h-10 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <SearchDropdown />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
            >
              <Search className="w-5 h-5" />
            </button>
            {/* Mobile-only: small truck icon for vehicle selector */}
            <button
              onClick={() => setFitmentOpen(!fitmentOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-primary hover:brightness-110 transition-colors btn-press"
              aria-label="Select your vehicle"
            >
              <Truck className="w-5 h-5" />
            </button>
            {/* Tablet: compact vehicle button */}
            <button
              onClick={() => setFitmentOpen(!fitmentOpen)}
              className="hidden md:flex lg:hidden items-center gap-1.5 border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-primary font-display text-[9px] tracking-widest hover:bg-primary/10 transition-colors btn-press"
            >
              <Truck className="w-3 h-3" />
              {vehicle ? vehicleLabel.toUpperCase() : "SELECT VEHICLE"}
            </button>
            {/* Desktop: full vehicle button */}
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
          <div className="md:hidden border-t border-border p-3 relative" ref={mobileSearchRef}>
            <div className="flex border border-border bg-card">
              <div className="flex items-center px-3">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => { if (searchQuery.length >= 2) setSearchDropdownOpen(true); }}
                placeholder="Search products..."
                className="flex-1 h-10 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
            </div>
            <SearchDropdown />
          </div>
        )}
        {/* Fitment dropdown — full-screen on mobile, dropdown on desktop */}
        {fitmentOpen && (
          <>
            {/* Mobile: full-screen panel */}
            <div ref={fitmentRef} className="md:hidden fixed inset-0 top-16 z-50 bg-background overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-xs tracking-widest text-muted-foreground">SELECT YOUR VEHICLE</span>
                  <button onClick={() => setFitmentOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FitmentSelector onVehicleSelect={() => setFitmentOpen(false)} />
              </div>
            </div>
            {/* Tablet/Desktop: dropdown */}
            <div className="hidden md:block absolute top-full right-0 left-0 lg:left-auto lg:right-8 lg:w-[600px] z-50 border border-border shadow-xl">
              <FitmentSelector onVehicleSelect={() => setFitmentOpen(false)} />
            </div>
          </>
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
              {/* Select Your Vehicle — in hamburger menu */}
              <button
                onClick={() => { setMenuOpen(false); setFitmentOpen(true); }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors group"
              >
                <Truck className="w-5 h-5 text-primary" />
                <span className="font-body text-sm text-foreground">
                  {vehicle ? `My Vehicle: ${vehicleLabel}` : "Select Your Vehicle"}
                </span>
              </button>
            </div>
            <div className="border-b border-border">
              <MenuLink icon={<MessageCircle className="w-5 h-5" />} label="Live Chat" to="#" />
              <MenuLink icon={<HelpCircle className="w-5 h-5" />} label="Help Center" to="/help" />
              <MenuLink icon={<User className="w-5 h-5" />} label="My Account" to="#" />
            </div>

            <div className="border-b border-border">
              <button
                onClick={() => setSubMenu("category")}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-body text-sm text-foreground">Shop by Category</span>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setSubMenu("vehicle")}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-body text-sm text-foreground">Shop by Vehicle</span>
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
            {MENU_CATEGORIES.map((cat) => (
              <Link
                key={cat.handle}
                to={`/collections/all?category=${cat.handle}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors group"
              >
                <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">{cat.label}</span>
              </Link>
            ))}
          </div>

          {/* Sub-menu: Vehicle */}
          <div className={`absolute inset-0 overflow-y-auto transition-transform duration-250 ease-in-out ${subMenu === "vehicle" ? "translate-x-0" : "translate-x-full"}`}>
            <button
              onClick={() => setSubMenu(null)}
              className="w-full flex items-center gap-2 px-5 py-4 border-b border-border hover:bg-accent/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
              <span className="font-display text-xs tracking-widest text-primary">BACK</span>
            </button>
            <div className="px-5 pt-4 pb-2">
              <span className="font-display text-[10px] tracking-[0.2em] text-muted-foreground">SHOP BY VEHICLE</span>
            </div>
            {MENU_VEHICLES.map((v) => (
              <Link
                key={v.handle}
                to={`/collections/all?make=${v.label}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors group"
              >
                <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">{v.label}</span>
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
