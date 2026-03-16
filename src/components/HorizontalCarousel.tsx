import { useRef, useCallback, useEffect, useState, type ReactNode, Children } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalCarouselProps {
  children: ReactNode[];
  loop?: boolean;
  onNearEnd?: () => void;
}

const HorizontalCarousel = ({ children, loop = false, onNearEnd }: HorizontalCarouselProps) => {
  const items = Children.toArray(children);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(loop);
  const [showRight, setShowRight] = useState(true);

  const updateArrows = useCallback(() => {
    if (loop) {
      setShowLeft(true);
      setShowRight(true);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, [loop]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows, items.length]);

  // Near-end detection for lazy loading
  useEffect(() => {
    if (!onNearEnd) return;
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      if (el.scrollLeft + el.clientWidth > el.scrollWidth - 300) {
        onNearEnd();
      }
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [onNearEnd]);

  const scrollByOne = useCallback((direction: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    const cardWidth = card ? card.getBoundingClientRect().width + 12 : 280;

    if (loop) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (direction > 0 && el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      if (direction < 0 && el.scrollLeft <= 5) {
        el.scrollTo({ left: maxScroll, behavior: "smooth" });
        return;
      }
    }

    el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  }, [loop]);

  if (items.length === 0) return null;

  return (
    <div className="relative group/carousel">
      {/* Left fade + arrow */}
      {showLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <button
            onClick={() => scrollByOne(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-background/60 border border-border text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Right fade + arrow */}
      {showRight && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <button
            onClick={() => scrollByOne(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-background/60 border border-border text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto p-4 lg:p-6 scrollbar-none"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            data-card
            className="shrink-0 w-[calc(50%-6px)] lg:w-[calc(25%-9px)]"
            style={{ scrollSnapAlign: "start" }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalCarousel;
