import { useState } from "react";
import { Shield, Truck, ChevronDown } from "lucide-react";

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
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const handleSubmit = () => {
    if (year && make && model) {
      onVehicleSelect?.({ year, make, model });
    }
  };

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Truck className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-display tracking-widest">SELECT YOUR VEHICLE</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
        {/* Year */}
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

        {/* Make */}
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

        {/* Model */}
        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!make}
            className="w-full h-12 px-4 bg-input text-foreground font-display text-sm tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
          >
            <option value="">MODEL</option>
            {make && MODELS[make]?.map((m) => <option key={m} value={m}>{m}</option>)}
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
          FIND PARTS
        </div>
      </button>
    </div>
  );
};

export default FitmentSelector;
