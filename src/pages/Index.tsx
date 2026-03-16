/**
 * SHOPIFY TEMPLATE: templates/index.liquid
 * SECTIONS: hero, category-carousel (12), featured-products carousel, trust-badges
 */
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import HorizontalCarousel from "@/components/HorizontalCarousel";
import SiteFooter from "@/components/SiteFooter";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";
import { useVehicle } from "@/contexts/VehicleContext";
import { isUniversalProduct } from "@/lib/shopify";

/* ─── All 12 Categories ─── */

const ALL_CATEGORIES = [
  { handle: "bull-guards-grille-guards", title: "Bull Guards & Grille Guards", fallbackCount: 190, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_blgr-tmy20-bk-ws-1.jpg?v=1773608061" },
  { handle: "tonneau-covers", title: "Tonneau Covers", fallbackCount: 287, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_tc-lth_2btbl-16w8p-01-ws-2_a9465d73-f185-4ae9-8440-381b63cd3658.jpg?v=1773608065" },
  { handle: "trailer-hitches", title: "Trailer Hitches", fallbackCount: 288, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_th-xte05-c514_2bth-bmount-l2-ws-1.jpg?v=1773608068" },
  { handle: "front-grilles", title: "Front Grilles", fallbackCount: 168, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_fg-zh-mus05gt-me-bk-ws-1.jpg?v=1773608072" },
  { handle: "headlights", title: "Headlights", fallbackCount: 161, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_hlpnb-tun14lsq-lam-ac-ws-1.jpg?v=1773608075" },
  { handle: "truck-bed-mats", title: "Truck Bed Mats", fallbackCount: 119, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_tbm-tun22-5.5-rb-v2-w-1.jpg?v=1773608078" },
  { handle: "floor-mats", title: "Floor Mats", fallbackCount: 52, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_tbm-dak00-6.5-rb-gy-ws-1.jpg?v=1773608081" },
  { handle: "running-boards-side-steps", title: "Running Boards & Side Steps", fallbackCount: 51, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_sbrs-rs2-tb-ws-1.jpg?v=1773608085" },
  { handle: "roof-racks-baskets", title: "Roof Racks & Baskets", fallbackCount: 6, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_rr-lp-fullsize-uni-ws-1_b80d4918-e311-4039-8d13-c3c613105c8b.jpg?v=1773608088" },
  { handle: "chase-racks-sport-bars", title: "Chase Racks & Sport Bars", fallbackCount: 3, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_crjz-raz-1000-st-mb-ws-1_135fbf61-e2a7-409b-9228-51a321b81ac9.jpg?v=1773608092" },
  { handle: "molle-panels", title: "MOLLE Panels", fallbackCount: 3, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_mp-colo23-5-3p-ws-1_de4c08ed-efa7-41bf-93b1-57376cde9caa.jpg?v=1773608095" },
  { handle: "under-seat-storage", title: "Under Seat Storage", fallbackCount: 2, image: "https://cdn.shopify.com/s/files/1/0724/2638/9551/collections/LISTING_uss-sil14cc-bk-ws-2.jpg?v=1773608098" },
];

const COLLECTION_IMAGE_QUERY = `
  query GetCollectionInfo($handle: String!) {
    collectionByHandle(handle: $handle) {
      image { url }
      products(first: 250) {
        edges { node { id title productType featuredImage { url } } }
      }
    }
  }
`;

/** Parse year range from a product title. Returns [startYear, endYear] or null. */
function parseYearRange(title: string): [number, number] | null {
  const rangeMatch = title.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  const plusMatch = title.match(/(\d{4})\+/);
  if (plusMatch) return [parseInt(plusMatch[1]), new Date().getFullYear()];
  const singleMatch = title.match(/^(\d{4})\s/);
  if (singleMatch) return [parseInt(singleMatch[1]), parseInt(singleMatch[1])];
  return null;
}

interface CategoryProductNode {
  id: string;
  title: string;
  productType: string;
  featuredImage: { url: string } | null;
}

function countVehicleMatches(
  products: CategoryProductNode[],
  vehicle: { year: string; make: string; model: string }
): number {
  return products.filter((p) => {
    const title = p.title.toLowerCase();
    // Universal products always count
    if (title.includes("universal")) return true;
    // Check make
    if (!title.includes(vehicle.make.toLowerCase())) return false;
    // Check model
    if (!title.includes(vehicle.model.toLowerCase())) return false;
    // Check year
    const y = parseInt(vehicle.year);
    const range = parseYearRange(p.title);
    if (!range) return false;
    return y >= range[0] && y <= range[1];
  }).length;
}

function useCategoryData() {
  return useQuery({
    queryKey: ["category-data-all"],
    queryFn: async () => {
      const results: Record<string, { count: number; image: string; products: CategoryProductNode[] }> = {};
      await Promise.all(
        ALL_CATEGORIES.map(async (cat) => {
          try {
            const data = await storefrontApiRequest(COLLECTION_IMAGE_QUERY, { handle: cat.handle });
            const col = data?.data?.collectionByHandle;
            const products = (col?.products?.edges || []).map((e: any) => e.node) as CategoryProductNode[];
            const count = products.length || cat.fallbackCount;
            const apiImage = col?.image?.url || null;
            results[cat.handle] = { count, image: apiImage || cat.image || "", products };
          } catch {
            results[cat.handle] = { count: cat.fallbackCount, image: cat.image || "", products: [] };
          }
        })
      );
      return results;
    },
    staleTime: 300_000,
  });
}

/* ─── Featured Products — fetch specific handles for category diversity ─── */

const FEATURED_HANDLES = [
  "2020-2023-tesla-model-y-rear-bumper-guard-black",
  "2022-2025-toyota-tundra-5-5-bed-tonneau-cover-led-light-kit",
  "2005-2015-nissan-xterra-class-3-trailer-hitch-ball-mount-kit",
  "2005-2009-ford-mustang-gt-honeycomb-mesh-front-grille-black",
  "2014-2021-toyota-tundra-projector-headlights-sequential-led-chrome",
  "2022-2026-toyota-tundra-5-5ft-bed-rubber-mat-lightweight-v2",
  "rubber-truck-bed-mat-for-dakota-raider-6-5-bed-grey",
  "2022-toyota-tundra-double-cab-rock-sliders-side-steps-texture-black",
  "2014-2021-toyota-tundra-crew-cab-low-profile-roof-basket-system",
  "stehlen-razor-1000-universal-chase-rack-w-led-lights-matte-black",
  "2023-chevy-colorado-5ft-bed-molle-panels-3pc-set",
  "2014-2019-silverado-sierra-rear-underseat-storage-organizer-box",
];

const PRODUCT_FRAGMENT = `
  id title handle productType
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) {
    edges {
      node {
        id title
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
`;

const FEATURED_PRODUCTS_QUERY = `
  query GetFeaturedByHandle {
    ${FEATURED_HANDLES.map((h, i) => `p${i + 1}: productByHandle(handle: "${h}") { ${PRODUCT_FRAGMENT} }`).join("\n    ")}
  }
`;

function normalizeFeaturedNode(node: any): ShopifyProduct {
  const firstVariant = node.variants?.edges?.[0]?.node;
  return {
    node: {
      id: node.id,
      title: node.title,
      description: "",
      handle: node.handle,
      productType: node.productType || "",
      priceRange: node.priceRange,
      compareAtPriceRange: firstVariant?.compareAtPrice
        ? { minVariantPrice: firstVariant.compareAtPrice }
        : undefined,
      images: {
        edges: node.featuredImage
          ? [{ node: { url: node.featuredImage.url, altText: node.featuredImage.altText ?? null } }]
          : [],
      },
      variants: { edges: node.variants?.edges || [] },
      options: [],
    },
  };
}

function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products-by-handle"],
    queryFn: async () => {
      try {
        const response = await storefrontApiRequest(FEATURED_PRODUCTS_QUERY);
        console.log("Featured products API response:", response);
        const data = response?.data;
        if (!data) return [];

        const products: ShopifyProduct[] = [];
        for (let i = 1; i <= FEATURED_HANDLES.length; i++) {
          const node = data[`p${i}`];
          if (node) products.push(normalizeFeaturedNode(node));
        }
        console.log("Featured products count:", products.length);
        return products;
      } catch (error) {
        console.error("Featured products fetch failed:", error);
        return [];
      }
    },
    staleTime: 300_000,
  });
}

function FeaturedProductsSection() {
  const { data: products, isLoading } = useFeaturedProducts();

  if (isLoading) {
    return (
      <section className="border-b border-border">
        <div className="px-4 lg:px-8 py-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">FEATURED PRODUCTS</h2>
          <Link to="/collections/all" className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
            SHOP ALL <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="px-4 lg:px-8 py-6 border-b border-border flex items-center justify-between">
        <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">FEATURED PRODUCTS</h2>
        <Link to="/collections/all" className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
          SHOP ALL <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <HorizontalCarousel>
        {products.map((product) => (
          <ProductCard key={product.node.id} product={product} compact />
        ))}
      </HorizontalCarousel>
    </section>
  );
}

/* ─── Category Card ─── */

function CategoryCard({ handle, title, count, image }: { handle: string; title: string; count: number; image: string }) {
  return (
    <Link to={`/collections/all?category=${handle}`} className="group relative aspect-[4/3] border border-border overflow-hidden block">
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-card" />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)" }} />
      <div className="absolute bottom-0 left-0 p-4">
        <span className="font-display text-xs tracking-wider block mb-1">{title.toUpperCase()}</span>
        <span className="font-body text-xs text-muted-foreground">{count} Products</span>
      </div>
    </Link>
  );
}

/* ─── Main Page ─── */

const IndexTemplate = () => {
  const { data: categoryData } = useCategoryData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSection />

      {/* Shop by Category Carousel */}
      <section className="border-b border-border">
        <div className="px-4 lg:px-8 py-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xs tracking-[0.15em] text-muted-foreground">SHOP BY CATEGORY</h2>
          <Link to="/collections/all" className="flex items-center gap-2 text-primary font-display text-xs tracking-widest btn-press hover:brightness-110">
            VIEW ALL <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <HorizontalCarousel loop>
          {ALL_CATEGORIES.map((cat) => {
            const info = categoryData?.[cat.handle];
            return (
              <CategoryCard
                key={cat.handle}
                handle={cat.handle}
                title={cat.title}
                count={info?.count ?? cat.fallbackCount}
                image={info?.image || cat.image || ""}
              />
            );
          })}
        </HorizontalCarousel>
      </section>

      <FeaturedProductsSection />

      {/* Trust Badges */}
      <section className="border-t border-border grid grid-cols-2 md:grid-cols-4">
        {[
          { label: "FREE SHIPPING", desc: "On all orders" },
          { label: "GUARANTEED FITMENT", desc: "Fits your vehicle or money back" },
          { label: "MANUFACTURER WARRANTY", desc: "On every product" },
          { label: "EASY RETURNS", desc: "30-day hassle-free returns" },
        ].map((trust, i) => (
          <div key={i} className="p-6 border-r border-b border-border last:border-r-0 text-center">
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
