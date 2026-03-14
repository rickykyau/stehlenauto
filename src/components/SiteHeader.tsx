/**
 * SHOPIFY SECTION: sections/header.liquid
 * 
 * Liquid mapping:
 * - Logo: {{ section.settings.logo | image_url }}
 * - Cart count: {{ cart.item_count }}
 * - Search: Shopify predictive search
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import logo from "@/assets/stehlen-logo.png";
import { collections } from "@/data/products";

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      {/* Main header */}
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
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
          <Link
            to="/collections/all"
            className="hidden lg:flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-2 text-primary font-display text-[11px] tracking-widest hover:bg-primary/10 transition-colors btn-press"
          >
            SELECT YOUR VEHICLE
          </Link>
          <button className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground font-display text-[9px] flex items-center justify-center">0</span>
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

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-border bg-card">
          <Link 
            to="/collections/all" 
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-3 font-display text-xs tracking-widest text-primary border-b border-border"
          >
            ALL PRODUCTS
          </Link>
          {collections.map((c) => (
            <Link
              key={c.id}
              to={`/collections/${c.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 font-body text-sm text-secondary-foreground border-b border-border hover:bg-accent transition-colors"
            >
              {c.title}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
