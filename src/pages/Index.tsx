/**
 * SHOPIFY TEMPLATE: templates/index.liquid
 * SECTIONS: hero, category-grid, trust-badges, reviews
 */
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import SiteFooter from "@/components/SiteFooter";
import CustomerReviews from "@/components/CustomerReviews";

/* ─── Categories config ─── */

const CATEGORIES = [
  { handle: "tonneau-covers", title: "Tonneau Covers", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_tc-lth_2btbl-16w8p-01-ws-2_a9465d73-f185-4ae9-8440-381b63cd3658.jpg?v=1773608065" },
  { handle: "running-boards-side-steps", title: "Running Boards", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_sbrs-rs2-tb-ws-1.jpg?v=1773608085" },
  { handle: "bull-guards-grille-guards", title: "Bull Bars & Brush Guards", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_blgr-tmy20-bk-ws-1.jpg?v=1773608061" },
  { handle: "front-grilles", title: "Grilles", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773608072" },
  { handle: "headlights", title: "Headlights & Tail Lights", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_hlpnb-tun14lsq-lam-ac-ws-1.jpg?v=1773608075" },
  { handle: "trailer-hitches", title: "Hitches & Towing", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_th-xte05-c514_2bth-bmount-l2-ws-1.jpg?v=1773608068" },
  { handle: "chase-racks-sport-bars", title: "Bumpers", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773608092" },
  { handle: "molle-panels", title: "Fenders & Body Kits", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_mp-colo23-5-3p-ws-1_de4c08ed-efa7-41bf-93b1-57376cde9caa.jpg?v=1773608095" },
  { handle: "truck-bed-mats", title: "Bed Mats & Liners", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_tbm-tun22-5.5-rb-v2-w-1.jpg?v=1773608078" },
  { handle: "roof-racks-baskets", title: "Roof Racks", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_rr-lp-fullsize-uni-ws-1_b80d4918-e311-4039-8d13-c3c613105c8b.jpg?v=1773608088" },
  { handle: "floor-mats", title: "Floor Mats", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_tbm-dak00-6.5-rb-gy-ws-1.jpg?v=1773608081" },
  { handle: "under-seat-storage", title: "Accessories", image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_uss-sil14cc-bk-ws-2.jpg?v=1773608098" },
];

/* ─── Category Tile ─── */

function CategoryTile({ handle, title }: {
  handle: string;
  title: string;
  image: string;
}) {
  const cat = CATEGORIES.find((c) => c.handle === handle);
  const img = cat?.image || "";

  return (
    <Link
      to={`/collections/all?category=${handle}`}
      className="group relative aspect-[4/3] overflow-hidden block border border-border hover:border-[#f5a823] transition-colors duration-300"
      onClick={() => trackEvent("category_tile_clicked", { category: handle })}
    >
      {img ? (
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-card" />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 40%, transparent 70%)" }}
      />
      <div className="absolute bottom-0 left-0 p-4">
        <span className="font-display text-sm tracking-wider font-bold text-white drop-shadow-lg block">
          {title.toUpperCase()}
        </span>
      </div>
    </Link>
  );
}

/* ─── Main Page ─── */

const IndexTemplate = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSection onOpenYMM={() => window.dispatchEvent(new CustomEvent("open-ymm-modal"))} />

      {/* Shop by Category Grid */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-8 py-6 border-b border-border">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border p-px">
          {CATEGORIES.map((cat) => (
            <CategoryTile
              key={cat.handle}
              handle={cat.handle}
              title={cat.title}
              image={cat.image}
            />
          ))}
        </div>
      </section>

      <CustomerReviews />

      {/* Trust Badges */}
      <section className="border-t border-border grid grid-cols-2 md:grid-cols-4">
        {[
          { label: "FREE SHIPPING", desc: "On all orders" },
          { label: "GUARANTEED FITMENT", desc: "Fits your vehicle or money back" },
          { label: "MANUFACTURER WARRANTY", desc: "On every product" },
          { label: "EASY RETURNS", desc: "30-day hassle-free returns" },
        ].map((trust, i) => (
          <div
            key={i}
            className="p-6 border-r border-b border-border last:border-r-0 text-center cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => trackEvent("trust_badge_clicked", { badge_type: trust.label.toLowerCase().replace(/\s+/g, "_") })}
          >
            <div className="w-3 h-3 bg-primary mx-auto mb-3" />
            <h4 className="font-display text-xs tracking-widest mb-1">{trust.label}</h4>
            <p className="font-body text-xs text-muted-foreground">{trust.desc}</p>
          </div>
        ))}
      </section>

      <SiteFooter />
    </div>
  );
};

export default IndexTemplate;
