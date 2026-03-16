import { useRef, useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, CheckCircle } from "lucide-react";

const REVIEWS = [
  { name: "Mike R.", rating: 5, product: "Bull Bar — Ford F-150", review: "Couldn't be happier with how it looks on my truck. Installation took a little longer than expected but it was worth every penny. Extremely sturdy and the matte black finish is beautiful." },
  { name: "James T.", rating: 5, product: "Tonneau Cover — Toyota Tundra", review: "Overall quality is excellent! Easy to install in under an hour. Keeps everything dry and secure. Highly recommend." },
  { name: "Carlos M.", rating: 5, product: "Running Boards — Chevy Silverado", review: "The install was a breeze and the quality is great. Perfect fit for my Silverado. Makes getting in and out of the truck so much easier." },
  { name: "David L.", rating: 5, product: "Trailer Hitch Kit — Nissan Xterra", review: "Great fit and finish. Well packaged with nice-looking hardware. Bolted right on with no issues. Exactly what I needed for towing my boat." },
  { name: "Sarah K.", rating: 4, product: "Front Grille — Ford Mustang GT", review: "The quality of the grille is amazing, completely transformed the front end of my car. Made my Mustang look brand new! Only reason for 4 stars is shipping took a bit longer than expected." },
  { name: "Robert W.", rating: 5, product: "Headlights — Toyota Tundra", review: "Night and day difference from the stock headlights. The LED projectors are bright and crisp. Install was straightforward. A+ customer service too." },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < count ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

const CustomerReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollByOne = useCallback((direction: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-review]") as HTMLElement | null;
    const cardWidth = card ? card.getBoundingClientRect().width + 12 : 380;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (direction > 0 && el.scrollLeft >= maxScroll - 5) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction < 0 && el.scrollLeft <= 5) {
      el.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  }, []);

  // Auto-advance every 6s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => scrollByOne(1), 6000);
    return () => clearInterval(interval);
  }, [isPaused, scrollByOne]);

  return (
    <section className="border-b border-border">
      <div className="px-4 lg:px-8 py-6 border-b border-border flex items-center justify-between">
        <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">WHAT OUR CUSTOMERS SAY</h2>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
          </div>
          <span className="font-display text-xs tracking-wider text-muted-foreground">4.8/5</span>
        </div>
      </div>

      <div
        className="relative group/carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left fade + arrow */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <button
          onClick={() => scrollByOne(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-background/60 border border-border text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Previous review"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right fade + arrow */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <button
          onClick={() => scrollByOne(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-background/60 border border-border text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Next review"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto p-4 lg:p-6 scrollbar-none"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              data-review
              className="shrink-0 w-[calc(100%-12px)] md:w-[calc(33.333%-8px)] border border-border bg-card p-5 flex flex-col gap-3 hover:bg-accent/40 transition-colors duration-200"
              style={{ scrollSnapAlign: "start" }}
            >
              <Stars count={r.rating} />
              <p className="font-body text-sm text-secondary-foreground line-clamp-3 leading-relaxed flex-1">
                "{r.review}"
              </p>
              <div className="flex items-end justify-between pt-2 border-t border-border">
                <div>
                  <span className="font-display text-xs tracking-wider text-foreground block">{r.name}</span>
                  <span className="flex items-center gap-1 text-[11px] text-green-500 mt-0.5">
                    <CheckCircle className="w-3 h-3" /> Verified Purchase
                  </span>
                </div>
                <span className="font-body text-[11px] text-primary text-right max-w-[140px]">{r.product}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
