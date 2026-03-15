import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { handle: "bull-guards-grille-guards", label: "Bull Guards & Grille Guards" },
  { handle: "tonneau-covers", label: "Tonneau Covers" },
  { handle: "trailer-hitches", label: "Trailer Hitches" },
  { handle: "front-grilles", label: "Front Grilles" },
  { handle: "headlights", label: "Headlights" },
  { handle: "truck-bed-mats", label: "Truck Bed Mats" },
  { handle: "floor-mats", label: "Floor Mats" },
  { handle: "running-boards-side-steps", label: "Running Boards & Side Steps" },
  { handle: "roof-racks-baskets", label: "Roof Racks & Baskets" },
  { handle: "chase-racks-sport-bars", label: "Chase Racks & Sport Bars" },
  { handle: "molle-panels", label: "MOLLE Panels" },
  { handle: "under-seat-storage", label: "Under Seat Storage" },
];

const DECADES = ["2020s", "2010s", "2000s", "1990s", "1980s"] as const;

function getDecadeYears(decade: string): string[] {
  const base = parseInt(decade);
  if (decade === "2020s") return Array.from({ length: 6 }, (_, i) => (2025 - i).toString());
  return Array.from({ length: 10 }, (_, i) => (base + 9 - i).toString());
}

const MAKES = [
  "Chevy", "Chrysler", "Dodge", "Ford", "GMC", "Honda",
  "Jeep", "Nissan", "Ram", "Toyota", "Universal", "Volkswagen",
];

const MODELS_BY_MAKE: Record<string, string[]> = {
  Ford: ["Bronco", "Edge", "Escape", "Excursion", "Expedition", "Explorer", "F-150", "F-250", "F-350", "F-450", "Flex", "Focus", "Maverick", "Mustang", "Ranger", "Super Duty"],
  Chevy: ["Avalanche", "Blazer", "Colorado", "Equinox", "Express", "Malibu", "S-10", "Silverado 1500", "Silverado 2500", "Silverado 3500", "Suburban", "Tahoe", "Trailblazer", "Traverse"],
  Dodge: ["Charger", "Challenger", "Dakota", "Durango", "Grand Caravan", "Journey", "Nitro"],
  GMC: ["Acadia", "Canyon", "Envoy", "Jimmy", "Sierra 1500", "Sierra 2500", "Sierra 3500", "Terrain", "Yukon"],
  Toyota: ["4Runner", "Camry", "Corolla", "FJ Cruiser", "Highlander", "Land Cruiser", "RAV4", "Sequoia", "Tacoma", "Tundra"],
  Nissan: ["Armada", "Frontier", "Murano", "Pathfinder", "Rogue", "Titan", "Xterra"],
  Jeep: ["Cherokee", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Liberty", "Patriot", "Renegade", "Wrangler"],
  Ram: ["1500", "2500", "3500"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  Chrysler: ["200", "300", "Pacifica", "Town & Country", "Voyager"],
  Volkswagen: ["Atlas", "Golf", "Jetta", "Passat", "Tiguan", "Touareg"],
  Universal: ["Universal"],
};

export interface RefineFilters {
  year: string | null;
  make: string | null;
  model: string | null;
  category: string | null;
}

interface RefineSidebarProps {
  filters: RefineFilters;
  onFilterChange: (filters: RefineFilters) => void;
  collections: Array<{ node: { id: string; handle: string; title: string } }>;
}

type Section = "year" | "make" | "model" | "category";

const RefineSidebar = ({ filters, onFilterChange, collections }: RefineSidebarProps) => {
  const [expanded, setExpanded] = useState<Record<Section, boolean>>({
    year: true,
    make: true,
    model: true,
    category: true,
  });
  const [expandedDecades, setExpandedDecades] = useState<Record<string, boolean>>({});

  const toggle = (s: Section) => setExpanded((prev) => ({ ...prev, [s]: !prev[s] }));
  const toggleDecade = (d: string) => setExpandedDecades((prev) => ({ ...prev, [d]: !prev[d] }));

  const update = (patch: Partial<RefineFilters>) => {
    onFilterChange({ ...filters, ...patch });
  };

  const clearAll = () => {
    onFilterChange({ year: null, make: null, model: null, category: null });
  };

  // Categories are hardcoded, no dependency on collections prop

  const currentModels = filters.make ? (MODELS_BY_MAKE[filters.make] || []) : [];

  const sectionValue = (section: Section): string | null => {
    if (section === "year") return filters.year;
    if (section === "make") return filters.make;
    if (section === "model") return filters.model;
    if (section === "category") {
      const cat = collections.find((c) => c.node.handle === filters.category);
      return cat ? cat.node.title : filters.category;
    }
    return null;
  };

  const SectionHeader = ({ section, label }: { section: Section; label: string }) => {
    const val = sectionValue(section);
    return (
      <button
        onClick={() => toggle(section)}
        className="w-full flex items-center justify-between py-2"
      >
        <h3 className="font-display text-[10px] tracking-widest text-muted-foreground">
          {label}{val && !expanded[section] ? `: ${val.toUpperCase()}` : ""}
        </h3>
        {expanded[section] ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    );
  };

  const FilterButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 font-display text-[10px] tracking-widest transition-colors ${
        active ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          <span className="font-display text-xs tracking-widest text-primary font-bold">REFINE RESULTS</span>
        </div>
        <button
          onClick={clearAll}
          className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          CLEAR
        </button>
      </div>

      <div className="space-y-1">
        {/* ── YEAR ── */}
        <SectionHeader section="year" label="YEAR" />
        {expanded.year && (
          <div className="pb-3">
            <FilterButton active={!filters.year} onClick={() => update({ year: null })}>
              ALL YEARS
            </FilterButton>
            {DECADES.map((decade) => (
              <div key={decade}>
                <button
                  onClick={() => toggleDecade(decade)}
                  className="w-full flex items-center justify-between px-2 py-1.5 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  {decade.toUpperCase()}
                  {expandedDecades[decade] ? (
                    <ChevronDown className="w-2.5 h-2.5" />
                  ) : (
                    <ChevronRight className="w-2.5 h-2.5" />
                  )}
                </button>
                {expandedDecades[decade] && (
                  <div className="flex flex-wrap gap-1 px-2 pb-2">
                    {getDecadeYears(decade).map((y) => (
                      <button
                        key={y}
                        onClick={() => update({ year: filters.year === y ? null : y })}
                        className={`px-2 py-1 font-display text-[10px] tracking-wider border transition-colors ${
                          filters.year === y
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── MAKE ── */}
        <SectionHeader section="make" label="MAKE" />
        {expanded.make && (
          <div className="pb-3">
            <FilterButton active={!filters.make} onClick={() => update({ make: null, model: null })}>
              ALL MAKES
            </FilterButton>
            {MAKES.map((m) => (
              <FilterButton
                key={m}
                active={filters.make === m}
                onClick={() => update({ make: filters.make === m ? null : m, model: null })}
              >
                {m.toUpperCase()}
              </FilterButton>
            ))}
          </div>
        )}

        {/* ── MODEL ── */}
        <SectionHeader section="model" label="MODEL" />
        {expanded.model && (
          <div className="pb-3">
            <FilterButton active={!filters.model} onClick={() => update({ model: null })}>
              ALL MODELS
            </FilterButton>
            {currentModels.length === 0 && !filters.make && (
              <p className="px-2 py-1 font-display text-[10px] tracking-widest text-muted-foreground/60 italic">
                SELECT A MAKE FIRST
              </p>
            )}
            {currentModels.map((m) => (
              <FilterButton
                key={m}
                active={filters.model === m}
                onClick={() => update({ model: filters.model === m ? null : m })}
              >
                {m.toUpperCase()}
              </FilterButton>
            ))}
          </div>
        )}

        {/* ── CATEGORY ── */}
        <SectionHeader section="category" label="CATEGORY" />
        {expanded.category && (
          <div className="pb-3">
            <FilterButton active={!filters.category} onClick={() => update({ category: null })}>
              ALL CATEGORIES
            </FilterButton>
            {categoryCollections.map((c) => (
              <FilterButton
                key={c.node.id}
                active={filters.category === c.node.handle}
                onClick={() => update({ category: filters.category === c.node.handle ? null : c.node.handle })}
              >
                {c.node.title.toUpperCase()}
              </FilterButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RefineSidebar;
