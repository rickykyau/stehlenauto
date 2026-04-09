/**
 * SHOPIFY TEMPLATE: templates/product.liquid
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { trackEvent, trackGA4Event, trackKlaviyoEvent } from "@/lib/analytics";
import { checkProductFitment, type FitmentResult } from "@/utils/fitmentMatcher";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, Minus, Plus, ShoppingCart, Truck, RotateCcw, Shield,
  Loader2, Check, X as XIcon, ZoomIn, AlertTriangle, Ruler, ChevronDown, Info,
  Users, Award, Clock,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import { useShopifyProduct } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { useVehicle } from "@/contexts/VehicleContext";
import { parseFitmentSubAttributes, parseFitmentNotes, SUB_ATTRIBUTE_CATEGORIES, type FitmentSubAttributes } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";
import PDPFitmentModal from "@/components/PDPFitmentModal";

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

/* ─── Bed Length Parser ─── */

function parseBedLengthFromTags(tags: string[]): string | null {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    const match = lower.match(/^bed[-_]?length[-_]?([\d.]+)\s*(?:ft|'|foot)?$/);
    if (match) return `${match[1]} ft`;
  }
  return null;
}

function parseBedLengthFromTitle(title: string): string | null {
  const match = title.match(/([\d.]+)\s*(?:ft|'|foot|feet)/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (val >= 4 && val <= 9) return `${match[1]} ft`;
  }
  return null;
}

function isBedLengthOption(option: { name: string; values: string[] }): boolean {
  const name = option.name.toLowerCase();
  return name.includes("bed length") || name.includes("bed size") || name === "length";
}

/* ─── Fitment Attribute Pill Parsers ─── */

const CAB_TYPE_PATTERNS: [RegExp, string][] = [
  [/\bsupercrew\b|\bcrew cab\b/i, "Crew Cab"],
  [/\bsupercab\b|\bextended cab\b/i, "Extended Cab"],
  [/\bregular cab\b|\bstandard cab\b|\bsingle cab\b/i, "Regular Cab"],
  [/\bdouble cab\b/i, "Double Cab"],
  [/\baccess cab\b/i, "Access Cab"],
  [/\bclub cab\b/i, "Club Cab"],
];

const TRIM_KEYWORDS = [
  "Raptor", "Lariat", "King Ranch", "Platinum", "Limited", "XLT", "XL", "FX4", "STX",
  "Laramie", "Rebel", "Longhorn", "Power Wagon", "Denali", "AT4", "Elevation",
  "LT", "LTZ", "Z71", "High Country", "WT", "SR5", "TRD", "Pro-4X", "Nismo", "Pro",
];

function parseCabTypeFromTags(tags: string[], title: string): string | null {
  const combined = (tags.join(" ") + " " + title).toLowerCase();
  for (const [pattern, label] of CAB_TYPE_PATTERNS) {
    if (pattern.test(combined)) return label;
  }
  return null;
}

function parseTrimFromTags(tags: string[]): string | null {
  for (const tag of tags) {
    const trimmed = tag.trim();
    for (const kw of TRIM_KEYWORDS) {
      if (trimmed.toLowerCase() === kw.toLowerCase()) return kw;
    }
  }
  return null;
}

/* ─── Variation Group Types ─── */

interface VariationMember {
  shopify_product_id: string;
  product_handle: string;
  product_title: string;
  price: number | null;
  image_url: string | null;
  option_label: string | null;
  bed_length: string | null;
  cab_type: string | null;
  trim_level: string | null;
  available_for_sale: boolean;
  display_order: number;
}

interface VariationGroup {
  id: string;
  family_name: string;
  option_name: string;
  ymm_base: string;
  category: string;
}

/* ─── Year/Fitment Matching ─── */
// Moved to src/utils/fitmentMatcher.ts

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
  const imagesGalleryRef = useRef<HTMLDivElement>(null);

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
      trackKlaviyoEvent("Viewed Product", {
        ProductName: product.title,
        ProductID: product.id,
        SKU: product.variants?.edges?.[0]?.node?.sku || "",
        ImageURL: product.images?.edges?.[0]?.node?.url || "",
        URL: window.location.href,
        Brand: product.vendor || "Stehlen",
        Price: viewPrice,
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

  const fitmentResult: FitmentResult | null = useMemo(() => {
    if (!vehicle || !product) return null;
    return checkProductFitment(
      product.tags || [],
      product.title,
      { year: parseInt(vehicle.year), make: vehicle.make, model: vehicle.model }
    );
  }, [vehicle, product]);

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
    return true;
  }, [vehicle, relevantSubAttr]);

  // Bed length badge: fixed attribute (not a variant selector)
  const bedLengthBadge = useMemo(() => {
    if (!product) return null;
    // Check sub-attributes first
    if (fitmentSubAttrs?.bed_length) return fitmentSubAttrs.bed_length;
    // Check tags
    const fromTags = parseBedLengthFromTags(product.tags || []);
    if (fromTags) return fromTags;
    // Check title
    return parseBedLengthFromTitle(product.title || "");
  }, [product, fitmentSubAttrs]);

  // Determine which options to show (only multi-value, non-Title)
  const visibleOptions = useMemo(() => {
    if (!product?.options) return [];
    return product.options.filter((o: { name: string; values: string[] }) =>
      o.name !== "Title" && o.values.length > 1
    );
  }, [product?.options]);

  // Check if any visible option is a bed length selector
  const bedLengthOption = useMemo(() => {
    return visibleOptions.find((o: { name: string; values: string[] }) => isBedLengthOption(o)) || null;
  }, [visibleOptions]);

  // Step numbering: only when 2+ selectors visible
  const showStepNumbers = visibleOptions.length >= 2;

  // Fitment vehicle range from tags
  const fitmentVehicleRange = useMemo(() => {
    if (!product) return null;
    const tags = product.tags || [];
    const years = tags.filter((t: string) => /^\d{4}$/.test(t)).map(Number).sort();
    const makes = tags.filter((t: string) => t.startsWith?.("make:"))?.map((t: string) => t.replace("make:", "")) || [];
    const models = tags.filter((t: string) => t.startsWith?.("model:"))?.map((t: string) => t.replace("model:", "")) || [];
    if (years.length === 0) return null;
    const yearRange = years.length === 1 ? `${years[0]}` : `${years[0]}–${years[years.length - 1]}`;
    const make = makes[0] || "";
    const model = models[0] || "";
    return `${yearRange} ${make} ${model}`.trim();
  }, [product]);

  // Fitment attribute pills (parsed from tags/title)
  const fitmentPills = useMemo(() => {
    if (!product) return [];
    const tags = product.tags || [];
    const pills: { label: string; value: string }[] = [];
    const bed = bedLengthBadge;
    if (bed) pills.push({ label: "Bed", value: bed });
    const cab = parseCabTypeFromTags(tags, product.title || "");
    if (cab) pills.push({ label: "Cab", value: cab });
    const trim = parseTrimFromTags(tags);
    if (trim) pills.push({ label: "Trim", value: trim });
    return pills;
  }, [product, bedLengthBadge]);

  // Variation group fetch from Supabase
  const [variationGroup, setVariationGroup] = useState<VariationGroup | null>(null);
  const [variationMembers, setVariationMembers] = useState<VariationMember[]>([]);
  const [variationsVisible, setVariationsVisible] = useState(false);

  useEffect(() => {
    if (!product) return;
    setVariationGroup(null);
    setVariationMembers([]);
    setVariationsVisible(false);
    const shopifyId = product.id?.replace?.("gid://shopify/Product/", "") || "";
    if (!shopifyId) return;
    const fetchVariations = async () => {
      try {
        const { data: memberData } = await supabase
          .from("product_variation_members")
          .select("group_id, fitment_scope")
          .eq("shopify_product_id", shopifyId)
          .maybeSingle();
        if (!memberData?.group_id) return;
        const { data: groupData } = await supabase
          .from("product_variation_groups")
          .select("id, family_name, option_name, ymm_base, category")
          .eq("id", memberData.group_id)
          .maybeSingle();
        if (!groupData) return;
        setVariationGroup(groupData);
        const { data: siblings } = await supabase
          .from("product_variation_members")
          .select("shopify_product_id, product_handle, product_title, price, image_url, option_label, bed_length, cab_type, trim_level, available_for_sale, display_order")
          .eq("group_id", memberData.group_id)
          .order("display_order", { ascending: true });
        if (siblings && siblings.length >= 2) {
          setVariationMembers(siblings as VariationMember[]);
          requestAnimationFrame(() => setVariationsVisible(true));
          const currentStyle = (siblings as VariationMember[]).find(s => s.shopify_product_id === shopifyId)?.option_label || null;
          trackGA4Event("variation_options_shown", {
            product_id: product.id,
            variation_count: siblings.length,
            current_style: currentStyle,
          });
        }
      } catch (e) {
        console.error("Variation group fetch failed:", e);
      }
    };
    fetchVariations();
  }, [product?.id]);

  const currentShopifyId = product?.id?.replace?.("gid://shopify/Product/", "") || "";

  const otherTrimsNotice = useMemo(() => {
    if (variationMembers.length < 2 || !variationGroup) return null;
    const currentTrim = parseTrimFromTags(product?.tags || []);
    if (!currentTrim) return null;
    const otherTrimMembers = variationMembers.filter(m => {
      if (m.shopify_product_id === currentShopifyId) return false;
      return m.trim_level && m.trim_level.toLowerCase() !== currentTrim.toLowerCase();
    });
    if (otherTrimMembers.length === 0) return null;
    return { ymmBase: variationGroup.ymm_base, category: variationGroup.category };
  }, [variationMembers, variationGroup, product?.tags, currentShopifyId]);

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
    trackKlaviyoEvent("Added to Cart", {
      $value: cartPrice * qty,
      AddedItemProductName: product.title,
      AddedItemProductID: product.id,
      AddedItemSKU: selectedVariant.sku || "",
      AddedItemPrice: cartPrice,
      AddedItemQuantity: qty,
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
        <div ref={imagesGalleryRef} className="border-b lg:border-b-0 lg:border-r border-border p-4 lg:p-6 lg:sticky lg:top-0 lg:self-start">
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
          <h1 className="text-lg lg:text-xl font-display font-bold tracking-wider leading-tight mb-2">
            {product.title.toUpperCase()}
          </h1>

          {/* Fitment Badge — above the fold, below title */}
          <div className="mb-2">
            {vehicle && fitmentResult && fitmentResult.status !== "unknown" && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                fitmentResult.status === "universal" || fitmentResult.status === "fits"
                  ? "bg-green-600/15 text-green-500 border border-green-600/30"
                  : fitmentResult.status === "partial"
                    ? "bg-yellow-600/15 text-yellow-500 border border-yellow-600/30"
                    : "bg-red-600/15 text-red-400 border border-red-600/30"
              }`}>
                {(fitmentResult.status === "universal" || fitmentResult.status === "fits") && <Check className="w-3.5 h-3.5" />}
                {fitmentResult.status === "partial" && <AlertTriangle className="w-3.5 h-3.5" />}
                {fitmentResult.status === "does_not_fit" && <XIcon className="w-3.5 h-3.5" />}
                <span>
                  {fitmentResult.status === "universal"
                    ? "Universal Fit"
                    : fitmentResult.status === "fits"
                      ? `✓ Fits your ${vehicleLabel}`
                      : fitmentResult.status === "partial"
                        ? `May fit your ${vehicleLabel}`
                        : `Does not fit your ${vehicleLabel}`}
                </span>
              </div>
            )}
            {vehicle && fitmentResult?.status === "unknown" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Fitment not confirmed for your {vehicleLabel}</span>
              </div>
            )}
            {!vehicle && (
              <button
                onClick={() => {
                  const ymmBtn = document.querySelector('[data-ymm-trigger]') as HTMLElement;
                  ymmBtn?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Check vehicle fitment →</span>
              </button>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-display text-2xl font-bold text-primary">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="font-display text-sm text-muted-foreground line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Fitment Attribute Pills Row */}
          {fitmentPills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {fitmentPills.map(pill => (
                <div key={pill.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                  {pill.label === "Bed" && <Ruler className="w-3 h-3" />}
                  {pill.label === "Cab" && <Truck className="w-3 h-3" />}
                  <span>{pill.label}: {pill.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Partial fitment warnings (expanded) */}
          {vehicle && fitmentResult?.status === "partial" && fitmentResult.warnings.length > 0 && (
            <div className="px-3 py-2 mb-3 border border-yellow-600/40 bg-yellow-600/10">
              <div className="space-y-0.5">
                {fitmentResult.warnings.map((w, i) => (
                  <p key={i} className="font-body text-[10px] text-yellow-500/80">{w}</p>
                ))}
                <p className="font-body text-[10px] text-yellow-500/80 italic">Please confirm your trim before ordering.</p>
              </div>
            </div>
          )}

          {/* Style Variation Selector (from Supabase) */}
          {variationMembers.length >= 2 && (() => {
            const allSameStyle = variationMembers.every(m => m.option_label === variationMembers[0].option_label);
            if (allSameStyle) return null;
            const currentMember = variationMembers.find(m => m.shopify_product_id === currentShopifyId);
            const currentPrice = currentMember?.price || price;
            return (
              <div className={`mb-3 transition-opacity duration-150 ${variationsVisible ? 'opacity-100' : 'opacity-0'}`}>
                <h3 className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">
                  {variationGroup?.option_name?.toUpperCase() || "STYLE OPTIONS"}
                </h3>
                <div className="flex gap-3 overflow-x-auto md:overflow-x-visible md:flex-wrap scrollbar-none snap-x snap-mandatory md:snap-none pb-1 md:pb-0">
                  {variationMembers.map(member => {
                    const isCurrent = member.shopify_product_id === currentShopifyId;
                    const styleLabel = member.option_label || member.product_title.split(" ").slice(0, 3).join(" ");
                    const priceDiff = member.price && currentPrice ? member.price - currentPrice : 0;
                    return (
                      <button
                        key={member.shopify_product_id}
                        onClick={() => {
                          if (!isCurrent) {
                            trackGA4Event("variation_selected", {
                              from_product_id: product.id,
                              to_product_id: member.shopify_product_id,
                              from_style: currentMember?.option_label || "",
                              to_style: member.option_label || "",
                            });
                            navigate(`/products/${member.product_handle}`);
                          }
                        }}
                        className={`relative flex flex-col items-center gap-1 p-2 border rounded flex-shrink-0 snap-start transition-colors min-w-[90px] w-[90px] md:min-w-[100px] md:w-auto ${
                          isCurrent
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40"
                        } ${!member.available_for_sale ? "opacity-50" : ""}`}
                      >
                        {member.image_url ? (
                          <img src={member.image_url} alt={styleLabel} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-display text-[11px] tracking-wider text-foreground text-center leading-tight">
                          {styleLabel}
                        </span>
                        {priceDiff !== 0 && (
                          <span className={`text-[9px] font-semibold ${priceDiff > 0 ? 'text-muted-foreground' : 'text-green-500'}`}>
                            {priceDiff > 0 ? `+$${priceDiff.toFixed(0)}` : `-$${Math.abs(priceDiff).toFixed(0)}`}
                          </span>
                        )}
                        {!member.available_for_sale && (
                          <span className="absolute inset-0 flex items-center justify-center bg-background/60 rounded text-[8px] font-semibold text-muted-foreground">
                            OUT OF STOCK
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* "Also available for other trims" notice */}
          {otherTrimsNotice && (
            <div className="flex items-start gap-2 px-3 py-2 mb-3 bg-muted/50 rounded text-sm">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground">
                  Also available for other {otherTrimsNotice.ymmBase} configurations.
                </span>{" "}
                <Link
                  to={`/collections/${otherTrimsNotice.category.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    trackGA4Event("other_trim_notice_clicked", {
                      product_id: product.id,
                      ymm_base: otherTrimsNotice.ymmBase,
                    });
                  }}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  View all options →
                </Link>
              </div>
            </div>
          )}

          {/* Sub-Attribute Badge (cab type etc.) */}
          {relevantSubAttr && relevantSubAttr.field !== "bed_length" && (
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
                <button className="px-3 py-1.5 border-2 border-primary bg-primary/10 text-primary font-display text-[10px] tracking-wider">
                  {relevantSubAttr.value.toUpperCase()}
                </button>
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

          {/* Sub-Attribute Confirmation */}
          {vehicle && relevantSubAttr && (
            <div className={`flex items-start gap-2 px-3 py-2 mb-3 border ${
              relevantSubAttr.field === "bed_length"
                ? "border-green-600/30 bg-green-600/5"
                : "border-green-600/30 bg-green-600/5"
            }`}>
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-display text-[10px] tracking-widest text-green-500 block">
                  {relevantSubAttr.field === "bed_length"
                    ? `THIS PRODUCT FITS YOUR ${relevantSubAttr.value.toUpperCase()} BED`
                    : `THIS PRODUCT FITS YOUR ${relevantSubAttr.value.toUpperCase()} CAB`}
                </span>
                <button
                  onClick={() => {
                    const el = document.querySelector('[data-accordion-fitment]');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-body text-[10px] text-muted-foreground hover:text-primary transition-colors mt-0.5"
                >
                  {relevantSubAttr.field === "bed_length"
                    ? "Not sure of your bed length? →"
                    : "Not sure of your cab type? →"}
                </button>
              </div>
            </div>
          )}

          {/* Variant Selectors — only options with 2+ values */}
          {visibleOptions.length > 0 && (
            <div className="mb-3">
              {visibleOptions.map((option: { name: string; values: string[] }, optIdx: number) => {
                const isBedLen = isBedLengthOption(option);
                const stepLabel = showStepNumbers ? `Step ${optIdx + 1}: ` : "";
                const label = isBedLen ? `${stepLabel}Select Bed Length` : `${stepLabel}${option.name}`;

                return (
                  <div key={option.name} className="mb-3">
                    <h3 className="font-semibold text-sm text-slate-700 mb-1">
                      {label.toUpperCase()}
                    </h3>
                    {isBedLen && (
                      <p className="font-body text-xs text-muted-foreground mb-2">
                        Measure from the inside of the bulkhead to the inside of the tailgate.
                      </p>
                    )}
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
                            className={`px-4 py-2 border rounded-full font-display text-xs tracking-wider transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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

          {/* Trust & Social Proof Banner */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { icon: Users, title: "300,000+ Customers", badge: "customers" },
              { icon: Award, title: "10+ Years Selling Auto Parts", badge: "experience" },
              { icon: Truck, title: "Free Shipping on Every Order", badge: "shipping" },
              { icon: RotateCcw, title: "30-Day Hassle-Free Returns", badge: "returns" },
            ].map(({ icon: Icon, title, badge }) => (
              <div
                key={badge}
                className="flex items-center gap-2 border border-border bg-card rounded-lg p-2.5 transition-colors hover:border-primary/40 cursor-pointer"
                onClick={() => trackEvent("trust_badge_clicked", { badge_type: badge })}
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="font-display text-[10px] tracking-wider text-foreground leading-tight">{title}</span>
              </div>
            ))}
          </div>

          {/* Fitment Guarantee badge */}
          {vehicle && (fitmentResult?.status === "fits" || fitmentResult?.status === "universal") && (
            <div className="flex items-center gap-2.5 border border-green-600/40 bg-green-600/5 rounded-lg p-3 mb-3">
              <Shield className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <span className="font-display text-xs tracking-wider text-foreground block leading-tight font-bold">Fitment Guaranteed</span>
                <span className="font-body text-[11px] text-muted-foreground block leading-snug mt-0.5">Confirmed to fit your vehicle</span>
              </div>
            </div>
          )}

          {/* Fitment Details Accordion */}
          {(fitmentVehicleRange || bedLengthBadge || fitmentNotes || fitmentSubAttrs?.bed_style) && (
            <Accordion type="single" collapsible defaultValue={typeof window !== 'undefined' && window.innerWidth >= 1024 ? "fitment-details" : undefined}>
              <AccordionItem value="fitment-details" className="border border-border mb-4">
                <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span className="font-display text-[10px] tracking-widest text-foreground">FITMENT DETAILS</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3">
                  <div className="space-y-2 text-sm">
                    {fitmentVehicleRange && (
                      <div className="flex gap-2">
                        <span className="font-semibold text-muted-foreground min-w-[120px]">Vehicle Fitment:</span>
                        <span className="text-foreground">{fitmentVehicleRange}</span>
                      </div>
                    )}
                    {bedLengthBadge && (
                      <div className="flex gap-2">
                        <span className="font-semibold text-muted-foreground min-w-[120px]">Bed Length:</span>
                        <span className="text-foreground">{bedLengthBadge}</span>
                      </div>
                    )}
                    {fitmentSubAttrs?.bed_style && (
                      <div className="flex gap-2">
                        <span className="font-semibold text-muted-foreground min-w-[120px]">Bed Style:</span>
                        <span className="text-foreground">{fitmentSubAttrs.bed_style}</span>
                      </div>
                    )}
                    {fitmentNotes && (
                      <div className="flex gap-2">
                        <span className="font-semibold text-muted-foreground min-w-[120px]">Notes:</span>
                        <span className="text-foreground italic">{fitmentNotes}</span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Shipping & Returns Accordion */}
          <Accordion type="single" collapsible>
            <AccordionItem value="shipping-returns" className="border border-border mb-4">
              <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="font-display text-[10px] tracking-widest text-foreground">SHIPPING & RETURNS</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3">
                <div className="space-y-4 text-sm text-muted-foreground font-body leading-relaxed">
                  <div>
                    <p className="font-display text-[10px] tracking-widest text-foreground mb-1">FREE SHIPPING</p>
                    <p>All orders ship free within the United States. No minimum order required.</p>
                  </div>
                  <div>
                    <p className="font-display text-[10px] tracking-widest text-foreground mb-1">FAST PROCESSING</p>
                    <p>Orders placed before 2 PM PST ship same business day. Estimated delivery: 3–7 business days.</p>
                  </div>
                  <div>
                    <p className="font-display text-[10px] tracking-widest text-foreground mb-1">EASY RETURNS</p>
                    <p>30-day hassle-free returns. If the part doesn't fit or you're not satisfied, return it for a full refund. No restocking fees.</p>
                  </div>
                  <div>
                    <p className="font-display text-[10px] tracking-widest text-foreground mb-1">FITMENT GUARANTEE</p>
                    <p>Every part is confirmed to fit your specific vehicle before it ships. If we got it wrong, we'll pay for return shipping.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
                  {vehicle && fitmentResult && fitmentResult.status !== "unknown" && (
                    <div className={`flex items-center gap-2 px-3 py-2 mb-4 border ${
                      fitmentResult.status === "fits" || fitmentResult.status === "universal"
                        ? "border-green-600/40 bg-green-600/10 text-green-400"
                        : fitmentResult.status === "partial"
                          ? "border-yellow-600/40 bg-yellow-600/10 text-yellow-500"
                          : "border-red-600/40 bg-red-600/10 text-red-400"
                    }`}>
                      {fitmentResult.status === "fits" || fitmentResult.status === "universal"
                        ? <Check className="w-4 h-4" />
                        : fitmentResult.status === "partial"
                          ? <AlertTriangle className="w-4 h-4" />
                          : <XIcon className="w-4 h-4" />}
                      <span className="font-display text-[10px] tracking-widest">
                        {fitmentResult.status === "fits" || fitmentResult.status === "universal"
                          ? `FITS YOUR ${vehicleLabel.toUpperCase()}`
                          : fitmentResult.status === "partial"
                            ? `MAY FIT YOUR ${vehicleLabel.toUpperCase()}`
                            : `DOES NOT FIT YOUR ${vehicleLabel.toUpperCase()}`}
                      </span>
                    </div>
                  )}
                  {vehicle && fitmentResult?.status === "unknown" && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-4 border border-border bg-muted/40 text-muted-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-display text-[10px] tracking-widest">
                        FITMENT NOT CONFIRMED — PLEASE VERIFY COMPATIBILITY
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

      <PDPFitmentModal imagesRef={imagesGalleryRef} />

      <SiteFooter />
    </div>
  );
};

export default ProductTemplate;
