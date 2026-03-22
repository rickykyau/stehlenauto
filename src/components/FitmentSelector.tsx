import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Truck, ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useVehicle } from "@/contexts/VehicleContext";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { buildYMMTagQuery } from "@/lib/shopify";

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

interface FitmentSelectorProps {
  onVehicleSelect?: (vehicle: { year: string; make: string; model: string }) => void;
}

const FitmentSelector = ({ onVehicleSelect }: FitmentSelectorProps) => {
  const { vehicle: savedVehicle, setVehicle, clearVehicle } = useVehicle();
  const navigate = useNavigate();
  const [year, setYear] = useState(savedVehicle?.year || "");
  const [make, setMake] = useState(savedVehicle?.make || "");
  const [model, setModel] = useState(savedVehicle?.model || "");
  const completedRef = useRef(false);

  // Track abandonment on unmount
  useEffect(() => {
    return () => {
      if (completedRef.current) return;
      const hasStarted = !!(year || make);
      const isComplete = !!(year && make && model);
      if (hasStarted && !isComplete) {
        const lastStep = make ? "make" : year ? "year" : "none";
        trackEvent("ymm_abandoned", {
          last_step: lastStep,
          vehicle_year: year || null,
          vehicle_make: make || null,
        });
      }
    };
  }, [year, make, model]);

  // Build full YMM tag query when all three are selected for exact count
  const fullYMMQuery = useMemo(() => {
    if (!year || !make || !model) return undefined;
    return buildYMMTagQuery({ year, make, model });
  }, [year, make, model]);

  // Fetch products matching full YMM for accurate count
  const { data } = useShopifyProducts({ first: 250, query: fullYMMQuery });
  const matchCount = data?.products?.length ?? 0;

  const handleSubmit = () => {
    if (year && make && model) {
      completedRef.current = true;
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
            onChange={(e) => { const v = e.target.value; setYear(v); setMake(""); setModel(""); if (v) trackEvent("ymm_step_completed", { step: "year", value: v }); }}
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
            onChange={(e) => { const v = e.target.value; setMake(v); setModel(""); if (v) trackEvent("ymm_step_completed", { step: "make", value: v }); }}
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
            onChange={(e) => { const v = e.target.value; setModel(v); if (v) trackEvent("ymm_step_completed", { step: "model", value: v }); }}
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
            trackEvent("ymm_cleared", { had_vehicle: !!(year && make && model) });
            completedRef.current = true; // prevent abandonment fire on clear
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
