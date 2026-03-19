import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { storefrontApiRequest } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";

/* ── Types ── */
interface HeroSlide {
  id?: string;
  headline: string;
  subheadline: string;
  eyebrow: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  background_image: string;
}

interface CategoryItem {
  handle: string;
  title: string;
  visible: boolean;
  order: number;
}

const DEFAULT_HERO: HeroSlide = {
  headline: "", subheadline: "", eyebrow: "",
  primary_button_text: "", primary_button_link: "",
  secondary_button_text: "", secondary_button_link: "",
  background_image: "",
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<"hero" | "featured" | "categories">("hero");
  const { toast } = useToast();

  // ── Hero ──
  const [heroSlides, setHeroSlides] = useState<(HeroSlide & { id?: string; dbId?: string })[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  // ── Featured ──
  const [featuredHandles, setFeaturedHandles] = useState<string[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);
  const [productSearching, setProductSearching] = useState(false);

  // ── Categories ──
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesId, setCategoriesId] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data } = await supabase.from("homepage_content").select("*").order("display_order");
    if (!data) return;

    // Hero
    const heroes = data.filter((r) => r.section === "hero");
    setHeroSlides(heroes.map((h) => ({ ...(h.content as any), dbId: h.id })));
    setHeroLoading(false);

    // Featured
    const feat = data.find((r) => r.section === "featured");
    if (feat) {
      setFeaturedHandles((feat.content as any).handles ?? []);
      setFeaturedId(feat.id);
    }
    setFeaturedLoading(false);

    // Categories
    const cats = data.find((r) => r.section === "categories");
    if (cats) {
      setCategories(((cats.content as any).categories ?? []).sort((a: CategoryItem, b: CategoryItem) => a.order - b.order));
      setCategoriesId(cats.id);
    }
    setCategoriesLoading(false);
  };

  // ── Hero handlers ──
  const addHeroSlide = () => setHeroSlides([...heroSlides, { ...DEFAULT_HERO }]);
  const removeHeroSlide = (i: number) => setHeroSlides(heroSlides.filter((_, idx) => idx !== i));
  const updateHeroSlide = (i: number, field: string, value: string) => {
    const updated = [...heroSlides];
    (updated[i] as any)[field] = value;
    setHeroSlides(updated);
  };

  const saveHero = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    // Delete existing hero rows
    await supabase.from("homepage_content").delete().eq("section", "hero");

    // Insert new ones
    for (let i = 0; i < heroSlides.length; i++) {
      const { dbId, ...content } = heroSlides[i];
      await supabase.from("homepage_content").insert({
        section: "hero",
        content: content as any,
        is_active: true,
        display_order: i,
        updated_by: session?.user?.id ?? null,
      });
    }
    setSaving(false);
    toast({ title: "Hero slides saved" });
    loadAll();
  };

  // ── Featured handlers ──
  const searchProducts = async (query: string) => {
    if (query.length < 2) return;
    setProductSearching(true);
    try {
      const result = await storefrontApiRequest(`
        query SearchProducts($query: String!) {
          products(first: 10, query: $query) {
            edges { node { id title handle featuredImage { url } priceRange { minVariantPrice { amount } } } }
          }
        }
      `, { query });
      setProductSearchResults(result?.data?.products?.edges?.map((e: any) => e.node) ?? []);
    } catch {
      setProductSearchResults([]);
    }
    setProductSearching(false);
  };

  const addFeaturedProduct = (handle: string) => {
    if (!featuredHandles.includes(handle)) {
      setFeaturedHandles([...featuredHandles, handle]);
    }
    setProductSearchOpen(false);
    setProductSearchQuery("");
    setProductSearchResults([]);
  };

  const removeFeaturedProduct = (handle: string) => {
    setFeaturedHandles(featuredHandles.filter((h) => h !== handle));
  };

  const moveFeatured = (i: number, dir: number) => {
    const arr = [...featuredHandles];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setFeaturedHandles(arr);
  };

  const saveFeatured = async () => {
    if (!featuredId) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("homepage_content").update({
      content: { handles: featuredHandles } as any,
      updated_by: session?.user?.id ?? null,
      updated_at: new Date().toISOString(),
    }).eq("id", featuredId);
    setSaving(false);
    toast({ title: "Featured products saved" });
  };

  // ── Category handlers ──
  const toggleCategoryVisibility = (i: number) => {
    const updated = [...categories];
    updated[i].visible = !updated[i].visible;
    setCategories(updated);
  };

  const moveCategory = (i: number, dir: number) => {
    const arr = [...categories];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    arr.forEach((c, idx) => c.order = idx);
    setCategories(arr);
  };

  const updateCategoryTitle = (i: number, title: string) => {
    const updated = [...categories];
    updated[i].title = title;
    setCategories(updated);
  };

  const saveCategories = async () => {
    if (!categoriesId) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("homepage_content").update({
      content: { categories } as any,
      updated_by: session?.user?.id ?? null,
      updated_at: new Date().toISOString(),
    }).eq("id", categoriesId);
    setSaving(false);
    toast({ title: "Categories saved" });
  };

  const TABS = [
    { key: "hero" as const, label: "Hero Section" },
    { key: "featured" as const, label: "Featured Products" },
    { key: "categories" as const, label: "Categories" },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-0 border border-border bg-card">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-4 py-2.5 font-display text-[10px] tracking-widest transition-colors ${
              tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      {tab === "hero" && (
        <div className="space-y-4">
          {heroSlides.map((slide, i) => (
            <div key={i} className="border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">SLIDE {i + 1}</h4>
                {heroSlides.length > 1 && (
                  <button onClick={() => removeHeroSlide(i)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">EYEBROW</Label>
                <Input value={slide.eyebrow} onChange={(e) => updateHeroSlide(i, "eyebrow", e.target.value)} placeholder="STEHLEN AUTO — SINCE 2015" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">HEADLINE (use \n for line breaks)</Label>
                <Input value={slide.headline} onChange={(e) => updateHeroSlide(i, "headline", e.target.value)} placeholder="BUILT TOUGH.\nBOLT ON.\nDRIVE OFF." />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">SUBHEADLINE</Label>
                <Input value={slide.subheadline} onChange={(e) => updateHeroSlide(i, "subheadline", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-display text-[10px] tracking-widest">PRIMARY BUTTON TEXT</Label>
                  <Input value={slide.primary_button_text} onChange={(e) => updateHeroSlide(i, "primary_button_text", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-display text-[10px] tracking-widest">PRIMARY BUTTON LINK</Label>
                  <Input value={slide.primary_button_link} onChange={(e) => updateHeroSlide(i, "primary_button_link", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-display text-[10px] tracking-widest">SECONDARY BUTTON TEXT</Label>
                  <Input value={slide.secondary_button_text} onChange={(e) => updateHeroSlide(i, "secondary_button_text", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-display text-[10px] tracking-widest">SECONDARY BUTTON LINK</Label>
                  <Input value={slide.secondary_button_link} onChange={(e) => updateHeroSlide(i, "secondary_button_link", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">BACKGROUND IMAGE URL</Label>
                <Input value={slide.background_image} onChange={(e) => updateHeroSlide(i, "background_image", e.target.value)} placeholder="https://..." />
              </div>

              {/* Preview */}
              <div className="border border-border p-4 bg-background">
                <p className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">PREVIEW</p>
                <div className="relative min-h-[120px] bg-card overflow-hidden p-4">
                  {slide.background_image && (
                    <img src={slide.background_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  )}
                  <div className="relative">
                    {slide.eyebrow && <p className="font-display text-[9px] tracking-[0.2em] text-primary mb-2">{slide.eyebrow}</p>}
                    <h3 className="font-display text-lg tracking-wider font-bold leading-tight">
                      {slide.headline.split("\\n").map((line, li) => (
                        <span key={li}>
                          {li > 0 && <br />}
                          {line.includes("BOLT ON") ? <span className="text-primary">{line}</span> : line}
                        </span>
                      ))}
                    </h3>
                    {slide.subheadline && <p className="font-body text-xs text-muted-foreground mt-2 max-w-md">{slide.subheadline}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <Button variant="outline" onClick={addHeroSlide} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Slide
            </Button>
            <Button onClick={saveHero} disabled={saving}>
              {saving ? "Saving..." : "Save Hero Slides"}
            </Button>
          </div>
        </div>
      )}

      {/* Featured Products */}
      {tab === "featured" && (
        <div className="space-y-4">
          <div className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">
                FEATURED PRODUCTS ({featuredHandles.length})
              </h4>
              <Button size="sm" variant="outline" onClick={() => setProductSearchOpen(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </Button>
            </div>
            <div className="divide-y divide-border">
              {featuredHandles.map((handle, i) => (
                <div key={handle} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveFeatured(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveFeatured(i, 1)} disabled={i === featuredHandles.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-body text-sm text-foreground flex-1 truncate">{handle}</span>
                  <button onClick={() => removeFeaturedProduct(handle)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {featuredHandles.length === 0 && (
                <p className="px-4 py-6 text-center text-muted-foreground font-body text-sm">No products selected</p>
              )}
            </div>
          </div>
          <Button onClick={saveFeatured} disabled={saving}>
            {saving ? "Saving..." : "Save Featured Products"}
          </Button>

          {/* Product search dialog */}
          <Dialog open={productSearchOpen} onOpenChange={setProductSearchOpen}>
            <DialogContent className="sm:max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-sm tracking-widest">ADD PRODUCT</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search products..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchProducts(productSearchQuery)}
                  />
                  <Button size="sm" onClick={() => searchProducts(productSearchQuery)}>
                    {productSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border border border-border">
                  {productSearchResults.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => addFeaturedProduct(p.handle)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/30 text-left"
                    >
                      {p.featuredImage?.url && (
                        <img src={p.featuredImage.url} alt="" className="w-10 h-10 object-cover border border-border" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-foreground truncate">{p.title}</p>
                        <p className="font-display text-xs text-primary">${parseFloat(p.priceRange?.minVariantPrice?.amount || "0").toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                  {productSearchResults.length === 0 && productSearchQuery && !productSearching && (
                    <p className="px-4 py-4 text-center text-muted-foreground text-xs">No results</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Categories */}
      {tab === "categories" && (
        <div className="space-y-4">
          <div className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">HOMEPAGE CATEGORIES</h4>
            </div>
            <div className="divide-y divide-border">
              {categories.map((cat, i) => (
                <div key={cat.handle} className={`flex items-center gap-3 px-4 py-2.5 ${!cat.visible ? "opacity-50" : ""}`}>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveCategory(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveCategory(i, 1)} disabled={i === categories.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <Input
                    value={cat.title}
                    onChange={(e) => updateCategoryTitle(i, e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <span className="font-body text-[10px] text-muted-foreground shrink-0">{cat.handle}</span>
                  <button onClick={() => toggleCategoryVisibility(i)} className="text-muted-foreground hover:text-foreground">
                    {cat.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={saveCategories} disabled={saving}>
            {saving ? "Saving..." : "Save Categories"}
          </Button>
        </div>
      )}
    </div>
  );
}
