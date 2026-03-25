import { useState, useEffect } from "react";
import { Truck, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { useVehicle } from "@/contexts/VehicleContext";
import { useYMMConfig } from "@/hooks/useYMMConfig";
import { useIsMobile } from "@/hooks/use-mobile";

const YMMBanner = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const { vehicle } = useVehicle();
  const { makes, models, years } = useYMMConfig();
  const { setVehicle } = useVehicle();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [pulseCount, setPulseCount] = useState(0);

  // Pulse animation — 2 pulses then stop
  useEffect(() => {
    if (pulseCount >= 2) return;
    const timer = setTimeout(() => setPulseCount((c) => c + 1), 600);
    return () => clearTimeout(timer);
  }, [pulseCount]);

  if (vehicle) return null;

  const handleSubmit = () => {
    if (year && make && model) {
      const v = { year, make, model };
      setVehicle(v);
      trackEvent("vehicle_selected", { vehicle_year: year, vehicle_make: make, vehicle_model: model });
      navigate("/collections/all");
    }
  };

  const pulseClass = pulseCount < 2 ? "animate-pulse" : "";

  // Mobile: single tap bar that opens modal
  if (isMobile) {
    return (
      <div
        onClick={onOpenModal}
        className="w-full bg-[hsl(220,15%,7%)] border-b border-border cursor-pointer"
      >
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-primary shrink-0" />
            <span className="font-display text-[10px] tracking-widest text-foreground font-bold">
              FIND PARTS FOR YOUR TRUCK
            </span>
          </div>
          <ChevronRight className={`w-5 h-5 text-primary ${pulseClass}`} />
        </div>
      </div>
    );
  }

  // Desktop: inline dropdowns
  return (
    <div className="w-full bg-[hsl(220,15%,7%)] border-b border-border">
      <div className="flex items-center justify-between px-6 h-[72px]">
        {/* Left: label */}
        <div className="flex items-center gap-3 shrink-0">
          <Truck className="w-5 h-5 text-primary" />
          <span className="font-display text-xs tracking-widest text-foreground font-bold whitespace-nowrap">
            FIND PARTS GUARANTEED TO FIT YOUR TRUCK
          </span>
        </div>

        {/* Center: dropdowns */}
        <div className="flex items-center gap-0 mx-6 border border-border">
          <div className="relative border-r border-border">
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setMake(""); setModel(""); }}
              className="h-10 w-[120px] px-3 bg-input text-foreground font-display text-[11px] tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">YEAR</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative border-r border-border">
            <select
              value={make}
              onChange={(e) => { setMake(e.target.value); setModel(""); }}
              disabled={!year}
              className="h-10 w-[140px] px-3 bg-input text-foreground font-display text-[11px] tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
            >
              <option value="">MAKE</option>
              {makes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
              className="h-10 w-[140px] px-3 bg-input text-foreground font-display text-[11px] tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
            >
              <option value="">MODEL</option>
              {make && models[make]?.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Right: submit button */}
        <button
          onClick={handleSubmit}
          disabled={!year || !make || !model}
          className={`h-10 px-6 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all ${pulseClass}`}
        >
          FIND MY PARTS
        </button>
      </div>
    </div>
  );
};

export default YMMBanner;
