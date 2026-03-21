import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Truck, ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useVehicle } from "@/contexts/VehicleContext";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";

const YEARS = Array.from({ length: 30 }, (_, i) => (2025 - i).toString());
const MAKES = ["Ford", "Chevy", "Dodge", "GMC", "Toyota", "Nissan", "Jeep", "Ram"];
const MODELS: Record<string, string[]> = {
  Ford: ["F-150", "F-250", "F-350", "Ranger", "Bronco", "Explorer", "Expedition", "Mustang"],
  Chevy: ["Silverado 1500", "Silverado 2500", "Colorado", "Tahoe", "Suburban", "Traverse"],
  Dodge: ["Ram 1500", "Ram 2500", "Dakota", "Durango", "Charger", "Challenger"],
  GMC: ["Sierra 1500", "Sierra 2500", "Canyon", "Yukon", "Acadia"],
  Toyota: ["Tacoma", "Tundra", "4Runner", "Highlander", "RAV4"],
  Nissan: ["Frontier", "Titan", "Pathfinder", "Xterra", "Armada"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Gladiator", "Compass"],
  Ram: ["1500", "2500", "3500"],
};

/** Parse year range from product title */
function parseYearRange(title: string): [number, number] | null {
  const rangeMatch = title.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  const plusMatch = title.match(/(\d{4})\+/);
  if (plusMatch) return [parseInt(plusMatch[1]), new Date().getFullYear()];
  const singleMatch = title.match(/^(\d{4})\s/);
  if (singleMatch) return [parseInt(singleMatch[1]), parseInt(singleMatch[1])];
  return null;
}

/** Count products matching a specific year+make+model */
function countMatchingProducts(
  products: Array<{ node: { title: string; tags: string[] } }>,
  year: string,
  make: string,
  model: string
): number {
  const y = parseInt(year);
  return products.filter((p) => {
    const title = p.node.title.toLowerCase();
    const range = parseYearRange(p.node.title);
    if (!range) return false;
    const yearFits = y >= range[0] && y <= range[1];
    if (!yearFits) return false;

    // Check make via tags first, then title
    const makeTags = (p.node.tags || [])
      .filter((t) => t.toLowerCase().startsWith("make:"))
      .map((t) => t.substring(5).trim().toLowerCase());
    const makeFits = makeTags.length > 0
      ? makeTags.includes(make.toLowerCase())
      : title.includes(make.toLowerCase());
    if (!makeFits) return false;

    return title.includes(model.toLowerCase());
  }).length;
}

interface FitmentSelectorProps {
  onVehicleSelect?: (vehicle: { year: string; make: string; model: string }) => void;
}

const FitmentSelector = ({ onVehicleSelect }: FitmentSelectorProps) => {
  const { vehicle: savedVehicle, setVehicle, clearVehicle } = useVehicle();
  const navigate = useNavigate();
  const [year, setYear] = useState(savedVehicle?.year || "");
  const [make, setMake] = useState(savedVehicle?.make || "");
  const [model, setModel] = useState(savedVehicle?.model || "");

  // Fetch all products for counting (only when year+make are set)
  const { data } = useShopifyProducts({ first: 250, query: make ? `*${make}*` : undefined });
  const allProducts = data?.products || [];

  // Compute model counts
  const modelCounts = useMemo(() => {
    if (!year || !make || allProducts.length === 0) return new Map<string, number>();
    const counts = new Map<string, number>();
    const models = MODELS[make] || [];
    for (const m of models) {
      counts.set(m, countMatchingProducts(allProducts, year, make, m));
    }
    return counts;
  }, [year, make, allProducts]);

  const handleSubmit = () => {
    if (year && make && model) {
      const v = { year, make, model };
      setVehicle(v);
      onVehicleSelect?.(v);
      trackEvent("vehicle_selected", { vehicle_year: year, vehicle_make: make, vehicle_model: model });
      navigate("/collections/all");
    }
  };

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Truck className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-display tracking-widest">SELECT YOUR VEHICLE</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
        <div className="relative border-b md:border-b-0 md:border-r border-border">
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setMake(""); setModel(""); }}
            className="w-full h-12 px-4 bg-input text-foreground font-display text-sm tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">YEAR</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative border-b md:border-b-0 md:border-r border-border">
          <select
            value={make}
            onChange={(e) => { setMake(e.target.value); setModel(""); }}
            disabled={!year}
            className="w-full h-12 px-4 bg-input text-foreground font-display text-sm tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
          >
            <option value="">MAKE</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!make}
            className="w-full h-12 px-4 bg-input text-foreground font-display text-sm tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
          >
            <option value="">MODEL</option>
            {make && MODELS[make]?.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!year || !make || !model}
        className="mt-4 w-full h-12 bg-primary text-primary-foreground font-display text-sm font-bold uppercase tracking-widest btn-press disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:brightness-110"
      >
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          {year && make && model && modelCounts.get(model) !== undefined
            ? `FIND PARTS (${modelCounts.get(model)} part${modelCounts.get(model) !== 1 ? "s" : ""})`
            : "FIND PARTS"}
        </div>
      </button>

      {(year || make || model || savedVehicle) && (
        <button
          onClick={() => {
            setYear("");
            setMake("");
            setModel("");
            clearVehicle();
          }}
          className="mt-2 w-full text-center font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
};

export default FitmentSelector;
