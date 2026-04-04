import { useState, useEffect, forwardRef, useMemo } from "react";
import { Truck, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { useVehicle } from "@/contexts/VehicleContext";
import { useYMMTree } from "@/hooks/useYMMTree";
import { useIsMobile } from "@/hooks/use-mobile";

interface YMMBannerProps {
  onOpenModal: () => void;
}

const YMMBanner = forwardRef<HTMLDivElement, YMMBannerProps>(({ onOpenModal }, ref) => {
  const { vehicle, vehicleLabel, setVehicle } = useVehicle();
  const { years, makesForYear, modelsForYearMake, isLoading } = useYMMTree();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [pulseCount, setPulseCount] = useState(0);

  const availableMakes = useMemo(() => (year ? makesForYear(year) : []), [year, makesForYear]);
  const availableModels = useMemo(() => (year && make ? modelsForYearMake(year, make) : []), [year, make, modelsForYearMake]);
  const showNoModels = !!(year && make && availableModels.length === 0 && !isLoading);

  useEffect(() => {
    if (pulseCount >= 2) return;
    const timer = setTimeout(() => setPulseCount((c) => c + 1), 600);
    return () => clearTimeout(timer);
  }, [pulseCount]);

  useEffect(() => {
    if (make && !availableMakes.includes(make)) {
      setMake("");
      setModel("");
    }
  }, [make, availableMakes]);

  useEffect(() => {
    if (model && !availableModels.includes(model)) {
      setModel("");
    }
  }, [model, availableModels]);

  const handleSubmit = () => {
    if (year && make && model) {
      const v = { year, make, model };
      setVehicle(v);
      trackEvent("vehicle_selected", { vehicle_year: year, vehicle_make: make, vehicle_model: model });
      navigate("/collections/all");
    }
  };

  const pulseClass = pulseCount < 2 ? "animate-pulse" : "";

  if (isMobile) {
    if (vehicle) {
      return (
        <div
          ref={ref}
          onClick={onOpenModal}
          className="w-full border-b border-border cursor-pointer"
          style={{ background: "hsl(145, 60%, 20%)", minHeight: 60 }}
        >
          <div className="flex items-center justify-between px-4 h-[60px]">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400 shrink-0" />
              <span className="font-display text-[12px] tracking-wider text-white font-bold">
                SHOWING PARTS FOR {vehicleLabel.toUpperCase()}
              </span>
            </div>
            <span className="font-body text-xs text-green-300 underline shrink-0">Change</span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        onClick={onOpenModal}
        className="w-full border-b border-border cursor-pointer"
        style={{ background: "hsl(var(--primary))", minHeight: 60 }}
      >
        <div className="flex items-center justify-between px-4 h-[60px]">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary-foreground shrink-0" />
            <span className="font-display text-[13px] tracking-wider text-primary-foreground font-bold">
              TAP HERE — FIND PARTS FOR YOUR VEHICLE
            </span>
          </div>
          <ChevronRight className={`w-5 h-5 text-primary-foreground ${pulseClass}`} />
        </div>
      </div>
    );
  }

  if (vehicle) return <div ref={ref} />;

  return (
    <div ref={ref} className="w-full bg-[hsl(220,15%,7%)] border-b border-border overflow-x-hidden">
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 min-[1100px]:flex-nowrap min-[1100px]:h-[72px] min-[1100px]:py-0 min-[1100px]:justify-between">
        <div className="flex items-center gap-3 shrink-0 w-full min-[1100px]:w-auto">
          <Truck className="w-5 h-5 text-primary" />
          <span className="font-display text-xs tracking-widest text-foreground font-bold whitespace-nowrap">
            FIND PARTS GUARANTEED TO FIT YOUR VEHICLE
          </span>
        </div>

        <div className="flex items-center gap-0 w-full min-[1100px]:w-auto min-[1100px]:mx-6">
          <div className="flex items-center border border-border flex-1 min-w-0">
            <div className="relative border-r border-border flex-1 min-w-0">
              <select
                value={year}
                onChange={(e) => {
                  const nextYear = e.target.value;
                  setYear(nextYear);
                  setMake("");
                  setModel("");
                }}
                className="h-10 w-full px-3 bg-input text-foreground font-display text-[11px] tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">YEAR</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative border-r border-border flex-1 min-w-0">
              <select
                value={make}
                onChange={(e) => {
                  const nextMake = e.target.value;
                  setMake(nextMake);
                  setModel("");
                }}
                disabled={!year || availableMakes.length === 0}
                className="h-10 w-full px-3 bg-input text-foreground font-display text-[11px] tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
              >
                <option value="">{year && availableMakes.length === 0 ? "NO MAKES AVAILABLE" : "MAKE"}</option>
                {availableMakes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative flex-1 min-w-0">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!make || availableModels.length === 0}
                className="h-10 w-full px-3 bg-input text-foreground font-display text-[11px] tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
              >
                <option value="">{showNoModels ? "NO MODELS AVAILABLE" : "MODEL"}</option>
                {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!year || !make || !model}
            className={`h-10 px-6 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all ${pulseClass}`}
          >
            FIND MY PARTS
          </button>
        </div>
      </div>

      {showNoModels && (
        <div className="px-6 pb-3 text-sm font-body text-muted-foreground">
          We don't carry parts for this vehicle yet.{" "}
          <Link to="/collections/all" className="text-primary hover:underline font-medium">
            Browse all parts instead
          </Link>
        </div>
      )}
    </div>
  );
});

YMMBanner.displayName = "YMMBanner";

export default YMMBanner;
