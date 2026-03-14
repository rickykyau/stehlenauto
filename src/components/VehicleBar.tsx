import { Link } from "react-router-dom";
import { Truck, X, ChevronDown } from "lucide-react";
import { useVehicle } from "@/contexts/VehicleContext";
import { useState } from "react";
import FitmentSelector from "./FitmentSelector";

const VehicleBar = () => {
  const { vehicle, vehicleLabel, clearVehicle } = useVehicle();
  const [showChange, setShowChange] = useState(false);

  if (!vehicle) return null;

  return (
    <div className="sticky top-16 z-40 bg-sidebar border-b border-primary/20">
      <div className="px-4 lg:px-8 h-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-display text-[10px] tracking-widest text-muted-foreground hidden sm:inline">MY VEHICLE:</span>
          <span className="font-display text-[11px] tracking-widest text-foreground font-bold">
            {vehicleLabel.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChange(!showChange)}
            className="flex items-center gap-1 font-display text-[10px] tracking-widest text-primary hover:brightness-110 transition-colors"
          >
            CHANGE
            <ChevronDown className={`w-3 h-3 transition-transform ${showChange ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={clearVehicle}
            className="flex items-center gap-1 font-display text-[10px] tracking-widest text-muted-foreground hover:text-destructive transition-colors"
            title="Clear saved vehicle"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expandable change vehicle panel */}
      {showChange && (
        <div className="border-t border-border px-4 lg:px-8 py-4">
          <div className="max-w-lg">
            <FitmentSelector onVehicleSelect={() => setShowChange(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleBar;
