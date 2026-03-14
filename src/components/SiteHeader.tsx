import { Search, ShoppingCart, Phone } from "lucide-react";
import logo from "@/assets/stehlen-logo.png";

interface SiteHeaderProps {
  vehicle?: { year: string; make: string; model: string } | null;
}

const SiteHeader = ({ vehicle }: SiteHeaderProps) => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 h-8">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">(909) 895-4112</span>
          </div>
          <span className="font-display text-[10px] tracking-widest text-primary">FREE SHIPPING ON ALL ORDERS</span>
          <span className="font-display text-[10px] tracking-widest text-muted-foreground hidden md:block">FONTANA, CA</span>
        </div>
      </div>

      {/* Main header */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="Stehlen Auto" className="h-8 w-auto" />
        </div>

        {/* Vehicle badge */}
        {vehicle && (
          <div className="hidden md:flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-1.5">
            <div className="w-2 h-2 bg-primary" />
            <span className="font-display text-xs tracking-wider text-primary">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground font-display text-[9px] flex items-center justify-center">0</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
