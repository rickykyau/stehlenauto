import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, Car } from "lucide-react";
import type { AvailableOptions } from "@/hooks/useAvailableFilterOptions";
import { CATEGORIES, MAKES, MODELS_BY_MAKE } from "@/hooks/useAvailableFilterOptions";
import { useVehicle } from "@/contexts/VehicleContext";
import { trackEvent } from "@/lib/analytics";

const DECADES = ["2020s", "2010s", "2000s", "1990s", "1980s"] as const;

function getDecadeYears(decade: string): string[] {
  const base = parseInt(decade);
  if (decade === "2020s") return Array.from({ length: 6 }, (_, i) => (2025 - i).toString());
  return Array.from({ length: 10 }, (_, i) => (base + 9 - i).toString());
}

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
  availableOptions?: AvailableOptions;
}

type Section = "year" | "make" | "model" | "category";

const RefineSidebar = ({ filters, onFilterChange, collections, availableOptions }: RefineSidebarProps) => {
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
    // Track each filter change
    if (patch.year !== undefined) {
      trackEvent("filter_applied", { filter_type: "year", filter_value: patch.year || "all" });
    }
    if (patch.make !== undefined) {
      trackEvent("filter_applied", { filter_type: "make", filter_value: patch.make || "all" });
    }
    if (patch.model !== undefined) {
      trackEvent("filter_applied", { filter_type: "model", filter_value: patch.model || "all" });
    }
    if (patch.category !== undefined) {
      const cat = CATEGORIES.find((c) => c.handle === patch.category);
      trackEvent("filter_applied", { filter_type: "category", filter_value: cat?.label || patch.category || "all" });
    }
    onFilterChange({ ...filters, ...patch });
  };

  const clearAll = () => {
    onFilterChange({ year: null, make: null, model: null, category: null });
  };

  const hasOptions = !!availableOptions;
  const currentModels = filters.make ? (MODELS_BY_MAKE[filters.make] || []) : [];

  const sectionValue = (section: Section): string | null => {
    if (section === "year") return filters.year;
    if (section === "make") return filters.make;
    if (section === "model") return filters.model;
    if (section === "category") {
      const cat = CATEGORIES.find((c) => c.handle === filters.category);
      return cat ? cat.label : filters.category;
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
    count,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    count?: number;
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 font-display text-[10px] tracking-widest transition-colors flex items-center justify-between ${
        active ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className={`text-[9px] ${active ? "text-primary/70" : "text-muted-foreground/50"}`}>
          ({count})
        </span>
      )}
    </button>
  );

  // Filter available years for a decade
  const getAvailableDecadeYears = (decade: string) => {
    const allYears = getDecadeYears(decade);
    if (!hasOptions) return allYears;
    return allYears.filter((y) => availableOptions.years.has(y));
  };

  // Check if a decade has any available years
  const decadeHasAvailable = (decade: string) => {
    if (!hasOptions) return true;
    return getAvailableDecadeYears(decade).length > 0;
  };

  const { vehicle, vehicleLabel } = useVehicle();

  // Show "apply vehicle" button when vehicle is saved but filters don't match
  const showApplyVehicle = vehicle && (
    filters.year !== vehicle.year ||
    filters.make !== vehicle.make ||
    filters.model !== vehicle.model
  );

  const applyVehicle = () => {
    if (!vehicle) return;
    trackEvent("filter_applied", { filter_type: "vehicle", filter_value: vehicleLabel });
    onFilterChange({ ...filters, year: vehicle.year, make: vehicle.make, model: vehicle.model });
  };

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

      {/* Apply My Vehicle button */}
      {showApplyVehicle && (
        <button
          onClick={applyVehicle}
          className="w-full flex items-center gap-2 border border-primary/50 text-primary px-3 py-2 mb-4 hover:bg-primary/5 transition-colors"
        >
          <Car className="w-3.5 h-3.5 shrink-0" />
          <div className="text-left">
            <span className="font-display text-[10px] tracking-widest block">FILTER BY MY VEHICLE</span>
            <span className="font-body text-[10px] text-primary/70">{vehicleLabel}</span>
          </div>
        </button>
      )}

      <div className="space-y-1">
        {/* ── YEAR ── */}
        <SectionHeader section="year" label="YEAR" />
        {expanded.year && (
          <div className="pb-3">
            <FilterButton active={!filters.year} onClick={() => update({ year: null })}>
              ALL YEARS
            </FilterButton>
            {DECADES.map((decade) => {
              if (!decadeHasAvailable(decade)) return null;
              const availableYears = getAvailableDecadeYears(decade);
              return (
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
                      {availableYears.map((y) => (
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
                          {hasOptions && availableOptions.years.has(y) && (
                            <span className="ml-1 text-[8px] opacity-60">
                              ({availableOptions.years.get(y)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MAKE ── */}
        <SectionHeader section="make" label="MAKE" />
        {expanded.make && (
          <div className="pb-3">
            <FilterButton active={!filters.make} onClick={() => update({ make: null, model: null })}>
              ALL MAKES
            </FilterButton>
            {MAKES.map((m) => {
              const hasCount = hasOptions && availableOptions.makes.has(m);
              return (
                <FilterButton
                  key={m}
                  active={filters.make === m}
                  onClick={() => update({ make: filters.make === m ? null : m, model: null })}
                >
                  {m.toUpperCase()}
                </FilterButton>
              );
            })}
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
            {currentModels.map((m) => {
              return (
                <FilterButton
                  key={m}
                  active={filters.model === m}
                  onClick={() => update({ model: filters.model === m ? null : m })}
                >
                  {m.toUpperCase()}
                </FilterButton>
              );
            })}
          </div>
        )}

        {/* ── CATEGORY ── */}
        <SectionHeader section="category" label="CATEGORY" />
        {expanded.category && (
          <div className="pb-3">
            <FilterButton active={!filters.category} onClick={() => update({ category: null })}>
              ALL CATEGORIES
            </FilterButton>
            {CATEGORIES.map((cat) => (
              <FilterButton
                key={cat.handle}
                active={filters.category === cat.handle}
                onClick={() => update({ category: filters.category === cat.handle ? null : cat.handle })}
              >
                {cat.label.toUpperCase()}
              </FilterButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RefineSidebar;
