import { ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bullbar.jpg";

const HeroSection = () => {
  return (
    <section className="relative border-b border-border overflow-hidden">
      {/* Background image — full bleed */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="relative px-6 lg:px-16 py-16 lg:py-24 min-h-[480px] lg:min-h-[540px] flex flex-col justify-center max-w-3xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-[2px] bg-primary" />
          <span className="font-display text-[10px] tracking-[0.25em] text-primary">STEHLEN AUTO — SINCE 2015</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-display font-bold leading-[1.05] tracking-wider mb-6">
          BUILT TOUGH.<br />
          <span className="text-primary">BOLT ON.</span><br />
          DRIVE OFF.
        </h1>

        {/* Sub-copy */}
        <p className="font-body text-base text-muted-foreground max-w-lg mb-10 leading-relaxed">
          Heavy-duty truck & SUV accessories engineered from cold-rolled steel. 
          No drilling required. Guaranteed fitment for your vehicle.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-5 mb-12">
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-3 h-16 px-10 bg-primary text-primary-foreground font-display text-base font-bold uppercase tracking-widest btn-press hover:brightness-110 transition-all shadow-lg shadow-primary/30"
          >
            SHOP ALL PARTS
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/collections/bull-bars"
            className="inline-flex items-center gap-2 h-16 px-10 border-2 border-foreground/20 text-foreground font-display text-base tracking-widest hover:border-primary hover:text-primary transition-colors btn-press"
          >
            BEST SELLERS
          </Link>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center gap-6 lg:gap-10">
          {[
            { icon: Truck, text: "FREE SHIPPING" },
            { icon: Shield, text: "FITMENT GUARANTEED" },
            { icon: RotateCcw, text: "30-DAY RETURNS" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
