/**
 * SHOPIFY TEMPLATE: templates/product.liquid
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, Minus, Plus, ShoppingCart, Truck, RotateCcw, Shield,
  Loader2, Check, X as XIcon, ZoomIn, AlertTriangle,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import { useShopifyProduct } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { useVehicle } from "@/contexts/VehicleContext";
import { parseFitmentSubAttributes, parseFitmentNotes, SUB_ATTRIBUTE_CATEGORIES, type FitmentSubAttributes } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";

/* ─── Description Parser ─── */

interface ParsedDescription {
  overview: string;
  features: string[];
  fitment: string;
  specifications: Record<string, string>;
}

function parseDescription(html: string | undefined, plain: string | undefined): ParsedDescription {
  const result: ParsedDescription = { overview: "", features: [], fitment: "", specifications: {} };
  if (!html && !plain) return result;

  const text = html || plain || "";

  // Try splitting by common header patterns
  const sectionRegex = /(?:<[^>]*>)*\s*(?:<strong>|<b>)?\s*(Features|Vehicle Fitment|Specifications|Product Overview)\s*(?:<\/strong>|<\/b>)?\s*(?:<[^>]*>)*/gi;
  const parts: { label: string; start: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(text)) !== null) {
    parts.push({ label: match[1].toLowerCase(), start: match.index + match[0].length });
  }

  if (parts.length === 0) {
    // No structured headers — put everything in overview
    result.overview = stripHtml(text);
    return result;
  }

  // Content before first header → overview
  const beforeFirst = text.slice(0, parts[0].start - (text.slice(0, parts[0].start).match(/(?:<[^>]*>)*\s*(?:<strong>|<b>)?\s*(?:Features|Vehicle Fitment|Specifications|Product Overview)\s*(?:<\/strong>|<\/b>)?\s*(?:<[^>]*>)*/i)?.[0]?.length || 0));
  result.overview = stripHtml(beforeFirst).trim();

  for (let i = 0; i < parts.length; i++) {
    const content = text.slice(parts[i].start, i + 1 < parts.length ? parts[i + 1].start - 100 : undefined);
    const cleaned = stripHtml(content).trim();
    const sectionContent = i + 1 < parts.length
      ? text.slice(parts[i].start, text.indexOf(text.match(new RegExp(`(?:<[^>]*>)*\\s*(?:<strong>|<b>)?\\s*${parts[i + 1].label}`, "i"))?.[0] || "", parts[i].start))
      : text.slice(parts[i].start);

    const cleanSection = stripHtml(sectionContent).trim();

    switch (parts[i].label) {
      case "product overview":
        if (!result.overview) result.overview = cleanSection;
        break;
      case "features":
        result.features = extractBullets(sectionContent);
        break;
      case "vehicle fitment":
        result.fitment = sectionContent; // Keep HTML for table rendering
        break;
      case "specifications":
        result.specifications = extractKeyValues(sectionContent);
        break;
    }
  }

  if (!result.overview) result.overview = stripHtml(text.slice(0, 500));
  return result;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li|ul|ol|h[1-6]|tr|td|th|table|tbody|thead)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractBullets(html: string): string[] {
  // Try <li> items first
  const liMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches.map((li) => stripHtml(li)).filter(Boolean);
  }
  // Fallback: split by newlines
  return stripHtml(html)
    .split("\n")
    .map((l) => l.replace(/^[\-•*]\s*/, "").trim())
    .filter((l) => l.length > 5);
}

function extractKeyValues(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  const text = stripHtml(html);
  const lines = text.split("\n").filter(Boolean);
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 40) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key && val) result[key] = val;
    }
  }
  return result;
}

/* ─── Year/Fitment Matching ─── */

function parseYearRange(title: string): [number, number] | null {
  const rangeMatch = title.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  const plusMatch = title.match(/(\d{4})\+/);
  if (plusMatch) return [parseInt(plusMatch[1]), new Date().getFullYear()];
  const singleMatch = title.match(/^(\d{4})\s/);
  if (singleMatch) return [parseInt(singleMatch[1]), parseInt(singleMatch[1])];
  return null;
}

function checkFitment(title: string, year: string, make: string, model: string): boolean {
  const y = parseInt(year);
  const range = parseYearRange(title);
  if (!range) return false;
  const yearFits = y >= range[0] && y <= range[1];
  const makeFits = title.toLowerCase().includes(make.toLowerCase());
  const modelFits = title.toLowerCase().includes(model.toLowerCase());
  return yearFits && makeFits && modelFits;
}

/* ─── Lightbox Component ─── */

const Lightbox = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
      <XIcon className="w-6 h-6" />
    </button>
    <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
  </div>
);

/* ─── Fitment List (deduplicated) ─── */

const FitmentList = ({ html }: { html: string }) => {
  const lines = stripHtml(html)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  const seen = new Set<string>();
  const unique = lines.filter((l) => {
    const key = l.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (unique.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {unique.map((line, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="w-1 h-1 mt-2 bg-primary shrink-0" />
          <span className="font-body text-sm text-muted-foreground leading-relaxed">{line}</span>
        </li>
      ))}
    </ul>
  );
};

/* ─── Tab Types ─── */

type TabKey = "overview" | "features" | "fitment" | "specifications";

const TAB_LABELS: Record<TabKey, string> = {
  overview: "OVERVIEW",
  features: "FEATURES",
  fitment: "VEHICLE FITMENT",
  specifications: "SPECIFICATIONS",
};

/* ─── Main Component ─── */

const ProductTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading: productLoading } = useShopifyProduct(slug || "");
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { vehicle, vehicleLabel } = useVehicle();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [siblingProducts, setSiblingProducts] = useState<Array<{ handle: string; title: string; subAttr: FitmentSubAttributes }>>([]);

  // Track product view (GA4 standard)
  useEffect(() => {
    if (product) {
      const viewPrice = parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
      trackEvent("view_item", {
        currency: "USD",
        value: viewPrice,
        items: [{
          item_id: product.id,
          item_name: product.title,
          item_brand: product.vendor || "Stehlen",
          price: viewPrice,
          quantity: 1,
          item_category: product.productType || undefined,
        }],
      });
    }
  }, [product?.id]);

  const parsed = useMemo(
    () => parseDescription(product?.descriptionHtml, product?.description),
    [product?.descriptionHtml, product?.description]
  );

  const isUniversal = useMemo(() => {
    if (!product) return false;
    return (product.tags || []).some((t: string) => t.toLowerCase() === 'universal fit');
  }, [product]);

  const fitmentStatus = useMemo(() => {
    if (!vehicle || !product) return null;
    if (isUniversal) return 'universal';
    return checkFitment(product.title, vehicle.year, vehicle.make, vehicle.model);
  }, [vehicle, product, isUniversal]);

  // Parse fitment sub-attributes (with fallback to products_cache via Admin API)
  const [cacheSubAttrs, setCacheSubAttrs] = useState<FitmentSubAttributes | null>(null);
  const [cacheNotes, setCacheNotes] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    // If Storefront API returned the metafields, no need to fallback
    const storefrontSub = parseFitmentSubAttributes(product);
    if (storefrontSub) return;
    // Fallback: fetch from products_cache (synced via Admin API)
    const handle = product.handle;
    if (!handle) return;
    supabase
      .from("products_cache")
      .select("fitment_subattributes, fitment_notes")
      .eq("handle", handle)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.fitment_subattributes) {
          const parsed = typeof data.fitment_subattributes === 'string'
            ? JSON.parse(data.fitment_subattributes)
            : data.fitment_subattributes;
          const hasValue = Object.values(parsed).some((v: any) => v && String(v).trim().length > 0);
          if (hasValue) setCacheSubAttrs(parsed);
        }
        if (data?.fitment_notes) {
          setCacheNotes(data.fitment_notes);
        }
      });
  }, [product]);

  const fitmentSubAttrs = useMemo(() => {
    if (!product) return null;
    return parseFitmentSubAttributes(product) || cacheSubAttrs;
  }, [product, cacheSubAttrs]);

  const fitmentNotes = useMemo(() => {
    if (!product) return null;
    return parseFitmentNotes(product) || cacheNotes;
  }, [product, cacheNotes]);

  // Determine which sub-attribute is relevant for this product type
  const relevantSubAttr = useMemo(() => {
    if (!product || !fitmentSubAttrs) return null;
    const pt = (product.productType || "").toLowerCase();
    if (pt.includes("tonneau") || pt.includes("bed mat")) {
      const val = fitmentSubAttrs.bed_length;
      return val ? { field: "bed_length" as const, label: "Bed Length", value: val } : null;
    }
    if (pt.includes("running board") || pt.includes("floor mat")) {
      const val = fitmentSubAttrs.cab_size;
      return val ? { field: "cab_size" as const, label: "Cab Type", value: val } : null;
    }
    // Check if any value is present
    if (fitmentSubAttrs.bed_length) return { field: "bed_length" as const, label: "Bed Length", value: fitmentSubAttrs.bed_length };
    if (fitmentSubAttrs.cab_size) return { field: "cab_size" as const, label: "Cab Type", value: fitmentSubAttrs.cab_size };
    return null;
  }, [product, fitmentSubAttrs]);

  // Fetch sibling products with different sub-attributes
  useEffect(() => {
    if (!product || !relevantSubAttr || !vehicle) {
      setSiblingProducts([]);
      return;
    }
    const fetchSiblings = async () => {
      try {
        const { data } = await supabase
          .from("products_cache")
          .select("handle, title, fitment_subattributes")
          .eq("status", "active")
          .ilike("product_type", `%${product.productType}%`)
          .ilike("title", `%${vehicle.make}%${vehicle.model}%`)
          .neq("handle", product.handle)
          .not("fitment_subattributes", "is", null)
          .limit(10);

        if (data) {
          const seen = new Set<string>();
          const siblings = data
            .filter((p: any) => {
              if (!p.fitment_subattributes) return false;
              const subAttr = typeof p.fitment_subattributes === "string" ? JSON.parse(p.fitment_subattributes) : p.fitment_subattributes;
              const val = String(subAttr[relevantSubAttr.field] || "").trim();
              if (!val || val === relevantSubAttr.value || seen.has(val)) return false;
              seen.add(val);
              return true;
            })
            .map((p: any) => ({
              handle: p.handle,
              title: p.title,
              subAttr: typeof p.fitment_subattributes === "string" ? JSON.parse(p.fitment_subattributes) : p.fitment_subattributes,
            }));
          setSiblingProducts(siblings);
        }
      } catch { /* silent */ }
    };
    fetchSiblings();
  }, [product?.handle, relevantSubAttr?.field, relevantSubAttr?.value, vehicle?.make, product?.productType]);

  // Determine if customer needs sub-attribute warning
  const showSubAttrWarning = useMemo(() => {
    if (!vehicle || !relevantSubAttr) return false;
    // Show warning if product has sub-attribute but user hasn't confirmed
    return true; // Product is sub-attribute specific
  }, [vehicle, relevantSubAttr]);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="font-display text-sm tracking-wider text-muted-foreground mb-4">PRODUCT NOT FOUND</p>
          <Link to="/collections/all" className="font-display text-xs tracking-widest text-primary hover:brightness-110">← BACK TO PRODUCTS</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const images = product.images?.edges || [];
  const variants = product.variants?.edges || [];
  const selectedVariant = variants[selectedVariantIdx]?.node || variants[0]?.node;
  const price = parseFloat(selectedVariant?.price?.amount || "0");
  const compareAt = selectedVariant?.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice.amount) : null;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    const cartPrice = parseFloat(selectedVariant.price.amount);
    trackEvent("add_to_cart", {
      currency: "USD",
      value: cartPrice * qty,
      items: [{
        item_id: product.id,
        item_name: product.title,
        item_brand: product.vendor || "Stehlen",
        price: cartPrice,
        quantity: qty,
        item_category: product.productType || undefined,
        variant: selectedVariant.title,
      }],
    });
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: qty,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
  };

  // Determine available tabs
  const tabs: TabKey[] = ["overview"];
  if (parsed.features.length > 0) tabs.push("features");
  if (parsed.fitment) tabs.push("fitment");
  if (Object.keys(parsed.specifications).length > 0) tabs.push("specifications");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {lightboxOpen && images[selectedImage] && (
        <Lightbox
          src={images[selectedImage].node.url}
          alt={images[selectedImage].node.altText || product.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="border-b border-border px-4 lg:px-8 py-3 flex items-center gap-2">
        <Link to="/" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <Link to="/collections/all" className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors">PRODUCTS</Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-display text-[10px] tracking-widest text-foreground truncate max-w-[300px]">
          {product.title.toUpperCase()}
        </span>
      </div>

      {/* ── Product Layout: Image + Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">

        {/* Left: Image Gallery */}
        <div className="border-b lg:border-b-0 lg:border-r border-border p-4 lg:p-6 lg:sticky lg:top-0 lg:self-start">
          <div className="flex gap-3">
            {/* Vertical Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImage(i);
                      trackEvent("product_image_viewed", { item_id: product.id, image_index: i, action: "click" });
                    }}
                    className={`w-16 h-16 border-2 overflow-hidden transition-colors shrink-0 ${
                      selectedImage === i ? "border-primary" : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div
              className="relative flex-1 bg-card cursor-pointer group max-h-[500px] overflow-hidden"
              onClick={() => {
                setLightboxOpen(true);
                trackEvent("product_image_viewed", { item_id: product.id, image_index: selectedImage, action: "zoom" });
              }}
            >
              <img
                src={images[selectedImage]?.node?.url || "/placeholder.svg"}
                alt={images[selectedImage]?.node?.altText || product.title}
                className="w-full h-full object-contain max-h-[500px]"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/20">
                <ZoomIn className="w-8 h-8 text-foreground/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Info + Tabs */}
        <div className="p-4 lg:p-6 flex flex-col">
          {/* Title */}
          <h1 className="text-lg lg:text-xl font-display font-bold tracking-wider leading-tight mb-3">
            {product.title.toUpperCase()}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-display text-2xl font-bold text-primary">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="font-display text-sm text-muted-foreground line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Fitment Badge */}
          {vehicle && fitmentStatus !== null && (
            <div className={`flex items-center gap-2 px-3 py-2 mb-3 border ${
              fitmentStatus === 'universal' || fitmentStatus === true
                ? "border-green-600/40 bg-green-600/10 text-green-400"
                : "border-red-600/40 bg-red-600/10 text-red-400"
            }`}>
              {fitmentStatus === 'universal' || fitmentStatus === true ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <XIcon className="w-4 h-4 shrink-0" />
              )}
              <span className="font-display text-[10px] tracking-widest">
                {fitmentStatus === 'universal'
                  ? "UNIVERSAL FIT — WORKS WITH ANY VEHICLE"
                  : fitmentStatus === true
                    ? `FITS YOUR ${vehicleLabel.toUpperCase()}`
                    : `DOES NOT FIT YOUR ${vehicleLabel.toUpperCase()}`}
              </span>
            </div>
          )}

          {/* Sub-Attribute Badge */}
          {relevantSubAttr && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 border border-primary/30 bg-primary/5">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-display text-[10px] tracking-widest text-primary">
                {relevantSubAttr.label.toUpperCase()}: {relevantSubAttr.value.toUpperCase()}
              </span>
            </div>
          )}

          {/* Fitment Notes */}
          {fitmentNotes && (
            <p className="font-body text-xs text-muted-foreground italic mb-3 px-1">
              {fitmentNotes}
            </p>
          )}

          {/* Sub-Attribute Configurator (sibling products) */}
          {relevantSubAttr && siblingProducts.length > 0 && (
            <div className="mb-3">
              <h3 className="font-display text-[10px] tracking-widest text-muted-foreground mb-1.5">
                SELECT YOUR {relevantSubAttr.label.toUpperCase()}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Current product option - highlighted */}
                <button className="px-3 py-1.5 border-2 border-primary bg-primary/10 text-primary font-display text-[10px] tracking-wider">
                  {relevantSubAttr.value.toUpperCase()}
                </button>
                {/* Sibling options */}
                {siblingProducts.map((sib) => {
                  const sibVal = sib.subAttr[relevantSubAttr.field];
                  if (!sibVal) return null;
                  return (
                    <button
                      key={sib.handle}
                      onClick={() => {
                        trackEvent("fitment_subattribute_selected", {
                          item_id: product.id,
                          attribute_type: relevantSubAttr.field,
                          attribute_value: sibVal,
                          source: "pdp_configurator",
                        });
                        navigate(`/products/${sib.handle}`);
                      }}
                      className="px-3 py-1.5 border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground font-display text-[10px] tracking-wider transition-colors"
                    >
                      {String(sibVal).toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-Attribute Warning */}
          {vehicle && relevantSubAttr && (
            <div className="flex items-start gap-2 px-3 py-2 mb-3 border border-yellow-600/40 bg-yellow-600/10">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <span className="font-display text-[10px] tracking-widest text-yellow-500">
                {relevantSubAttr.field === "bed_length"
                  ? "THIS PRODUCT IS BED-LENGTH SPECIFIC. PLEASE CONFIRM YOUR BED LENGTH BEFORE ORDERING."
                  : "THIS PRODUCT IS CAB-SIZE SPECIFIC. PLEASE CONFIRM YOUR CAB CONFIGURATION BEFORE ORDERING."}
              </span>
            </div>
          )}

          {variants.length > 1 && product.options?.some((o: { name: string }) => o.name !== "Title") && (
            <div className="mb-3">
              {product.options
                .filter((o: { name: string }) => o.name !== "Title")
                .map((option: { name: string; values: string[] }) => (
                  <div key={option.name} className="mb-3">
                    <h3 className="font-display text-[10px] tracking-widest text-muted-foreground mb-1.5">{option.name.toUpperCase()}</h3>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value: string) => {
                        const variantIdx = variants.findIndex((v) =>
                          v.node.selectedOptions.some((so) => so.name === option.name && so.value === value)
                        );
                        const isSelected = selectedVariant?.selectedOptions.some(
                          (so) => so.name === option.name && so.value === value
                        );
                        return (
                          <button
                            key={value}
                            onClick={() => {
                              if (variantIdx >= 0) {
                                setSelectedVariantIdx(variantIdx);
                                trackEvent("product_variant_selected", { item_id: product.id, variant_type: option.name, variant_value: value });
                              }
                            }}
                            className={`px-3 py-1.5 border font-display text-[10px] tracking-wider transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex gap-3 mb-4">
            <div className="flex border border-border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="w-12 h-10 flex items-center justify-center border-x border-border font-display text-sm">
                {qty}
              </div>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-press"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || !selectedVariant?.availableForSale}
              className="flex-1 h-10 bg-primary text-primary-foreground font-display text-xs font-bold uppercase tracking-widest btn-press hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cartLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !selectedVariant?.availableForSale ? (
                "SOLD OUT"
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  ADD TO CART
                </>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Truck, label: "Free", sublabel: "Shipping" },
              { icon: RotateCcw, label: "30-Day", sublabel: "Returns" },
              { icon: Shield, label: "Manufacturer", sublabel: "Warranty" },
            ].map(({ icon: Icon, label, sublabel }) => (
              <div
                key={label}
                className="flex items-center gap-2 border border-border p-2 bg-card cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => trackEvent("trust_badge_clicked", { badge_type: `${label}_${sublabel}`.toLowerCase().replace(/\s+/g, "_") })}
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="font-display text-[9px] tracking-wider text-foreground block leading-tight">{label}</span>
                  <span className="font-display text-[9px] tracking-wider text-muted-foreground block leading-tight">{sublabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabbed Content (inside right column) ── */}
          <div className="border-t border-border pt-3">
            {/* Tab bar */}
            <div className="flex border-b border-border overflow-x-auto overflow-y-hidden scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    trackEvent("product_tab_clicked", { item_id: product.id, tab_name: TAB_LABELS[tab].toLowerCase().replace(/\s+/g, "_") });
                  }}
                  className={`px-4 py-2.5 font-display text-[10px] tracking-widest whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="pt-4">
              {activeTab === "overview" && (
                <div className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {parsed.overview || product.description}
                </div>
              )}

              {activeTab === "features" && (
                <ul className="space-y-2">
                  {parsed.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 mt-1.5 bg-primary shrink-0" />
                      <span className="font-body text-sm text-muted-foreground leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "fitment" && (
                <div>
                  {vehicle && (
                    <div className={`flex items-center gap-2 px-3 py-2 mb-4 border ${
                      fitmentStatus
                        ? "border-green-600/40 bg-green-600/10 text-green-400"
                        : "border-red-600/40 bg-red-600/10 text-red-400"
                    }`}>
                      {fitmentStatus ? <Check className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                      <span className="font-display text-[10px] tracking-widest">
                        {fitmentStatus ? `FITS YOUR ${vehicleLabel.toUpperCase()}` : `DOES NOT FIT YOUR ${vehicleLabel.toUpperCase()}`}
                      </span>
                    </div>
                  )}
                  <FitmentList html={parsed.fitment} />
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="border border-border">
                  {Object.entries(parsed.specifications).map(([key, val], i) => (
                    <div key={key} className={`flex ${i > 0 ? "border-t border-border" : ""}`}>
                      <div className="w-1/3 px-3 py-2 bg-card font-display text-[10px] tracking-widest text-muted-foreground border-r border-border">
                        {key.toUpperCase()}
                      </div>
                      <div className="flex-1 px-3 py-2 font-body text-sm text-foreground">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products Carousel ── */}
      <RelatedProductsCarousel
        currentProductId={product.id}
        currentProductHandle={slug || ""}
        currentProductType={product.productType || ""}
        tags={product.tags || []}
      />

      <SiteFooter />
    </div>
  );
};

export default ProductTemplate;
