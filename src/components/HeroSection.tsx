import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bullbar.jpg";
import FitmentSelector from "./FitmentSelector";

interface HeroSectionProps {
  onVehicleSelect?: (vehicle: { year: string; make: string; model: string }) => void;
}

const HeroSection = ({ onVehicleSelect }: HeroSectionProps) => {
  return (
    <section className="relative border-b border-border">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
        {/* Left: Copy */}
        <div className="flex flex-col justify-center p-8 lg:p-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="font-display text-[10px] tracking-[0.2em] text-primary">STEHLEN AUTO</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-wider mb-6">
            ENGINEERED<br />
            FOR THE<br />
            <span className="text-primary">LONG HAUL</span>
          </h1>

          <p className="font-body text-muted-foreground max-w-md mb-8 leading-relaxed">
            Heavy-duty truck accessories built from cold-rolled steel. 
            Bolt-on installation. No drilling. Guaranteed fitment for your vehicle.
          </p>

          <button className="self-start flex items-center gap-3 h-12 px-8 bg-primary text-primary-foreground font-display text-sm font-bold uppercase tracking-widest btn-press hover:brightness-110 transition-all">
            SHOP ALL PARTS
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Fitment selector */}
        <div className="flex items-center p-8 lg:p-16">
          <div className="w-full max-w-md ml-auto">
            <FitmentSelector onVehicleSelect={onVehicleSelect} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
