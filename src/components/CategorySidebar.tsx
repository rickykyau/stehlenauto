import { useState } from "react";
import { Shield, Zap, Crosshair, Layers, ChevronRight, Menu, X } from "lucide-react";

const categories = [
  { id: "bull-guards", label: "Bull Guards & Grille Guards", icon: Shield, count: 358 },
  { id: "side-steps", label: "Side Steps & Running Boards", icon: Layers, count: 240 },
  { id: "tonneau", label: "Tonneau Covers", icon: Layers, count: 185 },
  { id: "headlights", label: "Headlights & Tail Lights", icon: Zap, count: 420 },
  { id: "chase-rack", label: "Chase Rack / Sport Bar", icon: Crosshair, count: 95 },
  { id: "grilles", label: "Front Grilles", icon: Shield, count: 160 },
];

interface CategorySidebarProps {
  activeCategory?: string;
  onCategorySelect?: (id: string) => void;
}

const CategorySidebar = ({ activeCategory, onCategorySelect }: CategorySidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-hard btn-press"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <nav className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-300 lg:transform-none
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">CATEGORIES</h2>
        </div>

        <div className="py-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { onCategorySelect?.(cat.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                  isActive
                    ? "border-l-primary bg-sidebar-accent text-sidebar-accent-foreground"
                    : "border-l-transparent text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-body text-sm flex-1">{cat.label}</span>
                <span className="font-display text-[10px] text-muted-foreground">{cat.count}</span>
                <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${isActive ? "rotate-90" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-auto p-4 border-t border-sidebar-border space-y-3">
          {["Free Shipping", "Guaranteed Fitment", "Manufacturer Warranty", "30-Day Returns"].map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary" />
              <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">{badge}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-background/60 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
};

export default CategorySidebar;
