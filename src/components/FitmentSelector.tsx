import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Truck, ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useVehicle } from "@/contexts/VehicleContext";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { buildYMMTagQuery } from "@/lib/shopify";
import { useYMMTree } from "@/hooks/useYMMTree";

interface FitmentSelectorProps {
  onVehicleSelect?: (vehicle: { year: string; make: string; model: string }) => void;
}

const FitmentSelector = ({ onVehicleSelect }: FitmentSelectorProps) => {
  const { years, makesForYear, modelsForYearMake, isLoading } = useYMMTree();
  const { vehicle: savedVehicle, setVehicle, clearVehicle } = useVehicle();
  const navigate = useNavigate();
  const [year, setYear] = useState(savedVehicle?.year || "");
  const [make, setMake] = useState(savedVehicle?.make || "");
  const [model, setModel] = useState(savedVehicle?.model || "");
  const completedRef = useRef(false);

  // Derived filtered lists
  const availableMakes = useMemo(() => (year ? makesForYear(year) : []), [year, makesForYear]);
  const availableModels = useMemo(() => (year && make ? modelsForYearMake(year, make) : []), [year, make, modelsForYearMake]);

  // If selected make is no longer available after year change, reset
  useEffect(() => {
    if (year && make && !availableMakes.includes(make)) {
      setMake("");
      setModel("");
    }
  }, [year, make, availableMakes]);

  // If selected model is no longer available, reset
  useEffect(() => {
    if (year && make && model && !availableModels.includes(model)) {
      setModel("");
    }
  }, [year, make, model, availableModels]);

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

  // Show no-models fallback when year+make selected but zero models exist
  const showNoModels = !!(year && make && availableModels.length === 0 && !isLoading);

  return (
    <div className="border border-border bg-card p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Truck className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-display tracking-widest">SELECT YOUR VEHICLE</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body ml-8">We'll show you parts guaranteed to fit — no guessing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
        {/* Year */}
        <div className="relative border-b md:border-b-0 md:border-r border-border">
          <select
            value={year}
            onChange={(e) => { const v = e.target.value; setYear(v); setMake(""); setModel(""); if (v) trackEvent("ymm_step_completed", { step: "year", value: v }); }}
            className="w-full h-12 px-4 bg-input text-foreground font-display text-sm tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">YEAR</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Make — filtered by year */}
        <div className="relative border-b md:border-b-0 md:border-r border-border">
          <select
            value={make}
            onChange={(e) => { const v = e.target.value; setMake(v); setModel(""); if (v) trackEvent("ymm_step_completed", { step: "make", value: v }); }}
            disabled={!year || availableMakes.length === 0}
            className="w-full h-12 px-4 bg-input text-foreground font-display text-sm tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
          >
            <option value="">{year && availableMakes.length === 0 ? "NO MAKES AVAILABLE" : "MAKE"}</option>
            {availableMakes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Model — filtered by year + make */}
        <div className="relative">
          <select
            value={model}
            onChange={(e) => { const v = e.target.value; setModel(v); if (v) trackEvent("ymm_step_completed", { step: "model", value: v }); }}
            disabled={!make || availableModels.length === 0}
            className="w-full h-12 px-4 bg-input text-foreground font-display text-sm tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
          >
            <option value="">{showNoModels ? "NO MODELS AVAILABLE" : "MODEL"}</option>
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* No models fallback message */}
      {showNoModels && (
        <div className="mt-3 p-3 border border-border bg-muted/50 text-sm font-body text-muted-foreground">
          We don't carry parts for this vehicle yet.{" "}
          <Link to="/collections/all" className="text-primary hover:underline font-medium">
            Browse all parts instead
          </Link>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!year || !make || !model}
        className="mt-4 w-full h-12 bg-primary text-primary-foreground font-display text-sm font-bold uppercase tracking-widest btn-press disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:brightness-110"
      >
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          FIND MY PARTS{matchCount > 0 ? ` (${matchCount})` : ""}
        </div>
      </button>

      {(year || make || model || savedVehicle) && (
        <button
          onClick={() => {
            trackEvent("ymm_cleared", { had_vehicle: !!(year && make && model) });
            completedRef.current = true;
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
