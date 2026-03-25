import { useEffect, useRef } from "react";
import { ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import { useVehicle } from "@/contexts/VehicleContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import heroBg from "@/assets/hero-bullbar.jpg";

interface HeroSlide {
  headline: string;
  subheadline: string;
  eyebrow: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  background_image: string;
}

const DEFAULT_SLIDE: HeroSlide = {
  headline: "BUILT TOUGH.\nBOLT ON.\nDRIVE OFF.",
  subheadline: "Heavy-duty truck & SUV accessories engineered from cold-rolled steel. No drilling required. Guaranteed fitment for your vehicle.",
  eyebrow: "STEHLEN AUTO — SINCE 2015",
  primary_button_text: "SHOP ALL PARTS",
  primary_button_link: "/collections/all",
  secondary_button_text: "BEST SELLERS",
  secondary_button_link: "/collections/all?sort_by=best-selling",
  background_image: "",
};

function useHeroContent() {
  return useQuery({
    queryKey: ["homepage-hero"],
    queryFn: async () => {
      const { data } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("section", "hero")
        .eq("is_active", true)
        .order("display_order");
      if (!data || data.length === 0) return [DEFAULT_SLIDE];
      return data.map((r) => r.content as unknown as HeroSlide);
    },
    staleTime: 60_000,
  });
}

const HeroSection = () => {
  const { vehicle } = useVehicle();
  const { data: slides } = useHeroContent();
  const slide = slides?.[0] ?? DEFAULT_SLIDE;
  const bgImage = slide.background_image || heroBg;
  const headlineLines = slide.headline.split("\\n").length > 1
    ? slide.headline.split("\\n")
    : slide.headline.split("\n");
  const viewedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const promoName = headlineLines.join(" ").trim();

  useEffect(() => {
    if (viewedRef.current || !sectionRef.current) return;
    const el = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackEvent("promotion_viewed", { promotion_id: "hero_banner", promotion_name: promoName, creative_slot: "hero" });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [promoName]);

  const trackHeroClick = () => {
    trackEvent("promotion_clicked", { promotion_id: "hero_banner", promotion_name: promoName, creative_slot: "hero" });
  };

  return (
    <section ref={sectionRef} className="relative border-b border-border overflow-hidden">
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      <div className="relative px-6 lg:px-16 py-16 lg:py-24 min-h-[480px] lg:min-h-[540px] flex flex-col justify-center max-w-3xl">
        {slide.eyebrow && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="font-display text-[10px] tracking-[0.25em] text-primary">{slide.eyebrow}</span>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-display font-bold leading-[1.05] tracking-wider mb-6">
          {headlineLines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line.includes("BOLT ON") ? <span className="text-primary">{line}</span> : line}
            </span>
          ))}
        </h1>

        {slide.subheadline && (
          <p className="font-body text-base text-muted-foreground max-w-lg mb-10 leading-relaxed">
            {slide.subheadline}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-5 mb-12">
          {slide.primary_button_text && (
            <Link
              to={slide.primary_button_link || "/collections/all"}
              className="inline-flex items-center gap-3 h-16 px-10 bg-primary text-primary-foreground font-display text-base font-bold uppercase tracking-widest btn-press hover:brightness-110 transition-all shadow-lg shadow-primary/30"
              onClick={trackHeroClick}
            >
              {slide.primary_button_text}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          {slide.secondary_button_text && (
            <Link
              to={slide.secondary_button_link || "/collections/all?sort_by=best-selling"}
              className="inline-flex items-center gap-2 h-16 px-10 border-2 border-foreground/20 text-foreground font-display text-base tracking-widest hover:border-primary hover:text-primary transition-colors btn-press"
              onClick={trackHeroClick}
            >
              {slide.secondary_button_text}
            </Link>
          )}
        </div>

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
