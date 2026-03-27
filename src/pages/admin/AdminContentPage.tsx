import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import CmsImageUpload from "@/components/admin/CmsImageUpload";
import ProductSearchPicker from "@/components/admin/ProductSearchPicker";

/* ── Types ── */
interface HeroSlide {
  headline: string;
  subheadline: string;
  eyebrow: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  background_image: string;
  dbId?: string;
}

interface FeaturedCard {
  product_handle: string | null;
  custom_link: string | null;
  title: string;
  description: string;
  image_url: string | null;
  product_image_url: string | null;
}

interface CategoryItem {
  handle: string;
  title: string;
  description?: string;
  image_url?: string;
  visible: boolean;
  order: number;
}

const DEFAULT_HERO: HeroSlide = {
  headline: "", subheadline: "", eyebrow: "",
  primary_button_text: "", primary_button_link: "",
  secondary_button_text: "", secondary_button_link: "",
  background_image: "",
};

const DEFAULT_CARD: FeaturedCard = {
  product_handle: null, custom_link: null,
  title: "", description: "",
  image_url: null, product_image_url: null,
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<"hero" | "featured" | "categories">("hero");
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // ── Hero ──
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  // ── Featured ──
  const [featuredCards, setFeaturedCards] = useState<FeaturedCard[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // ── Categories ──
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesId, setCategoriesId] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const { data } = await supabase.from("homepage_content").select("*").order("display_order");
    if (!data) return;

    const heroes = data.filter((r) => r.section === "hero");
    setHeroSlides(heroes.map((h) => ({ ...(h.content as any), dbId: h.id })));
    setHeroLoading(false);

    const feat = data.find((r) => r.section === "featured");
    if (feat) {
      const content = feat.content as any;
      // Migrate from old handles-only format
      if (content.handles && !content.cards) {
        const migrated: FeaturedCard[] = content.handles.map((h: string) => ({
          ...DEFAULT_CARD,
          product_handle: h,
          title: h.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        }));
        setFeaturedCards(migrated);
      } else {
        setFeaturedCards(content.cards ?? []);
      }
      setFeaturedId(feat.id);
    }
    setFeaturedLoading(false);

    const cats = data.find((r) => r.section === "categories");
    if (cats) {
      setCategories(((cats.content as any).categories ?? []).sort((a: CategoryItem, b: CategoryItem) => a.order - b.order));
      setCategoriesId(cats.id);
    }
    setCategoriesLoading(false);
  };

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  // ── Hero handlers ──
  const updateHeroSlide = (i: number, field: string, value: string) => {
    const updated = [...heroSlides];
    (updated[i] as any)[field] = value;
    setHeroSlides(updated);
  };

  const saveHero = async () => {
    setSaving(true);
    const session = await getSession();
    await supabase.from("homepage_content").delete().eq("section", "hero");
    for (let i = 0; i < heroSlides.length; i++) {
      const { dbId, ...content } = heroSlides[i];
      await supabase.from("homepage_content").insert({
        section: "hero", content: content as any, is_active: true,
        display_order: i, updated_by: session?.user?.id ?? null,
      });
    }
    setSaving(false);
    toast({ title: "Hero slides saved" });
    loadAll();
  };

  // ── Featured handlers ──
  const updateFeaturedCard = (i: number, field: keyof FeaturedCard, value: any) => {
    const updated = [...featuredCards];
    (updated[i] as any)[field] = value;
    setFeaturedCards(updated);
  };

  const moveFeatured = (i: number, dir: number) => {
    const arr = [...featuredCards];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setFeaturedCards(arr);
  };

  const saveFeatured = async () => {
    if (!featuredId) return;
    setSaving(true);
    const session = await getSession();
    // Save in new cards format, but also keep handles for backward compat
    const handles = featuredCards.map(c => c.product_handle).filter(Boolean);
    await supabase.from("homepage_content").update({
      content: { cards: featuredCards, handles } as any,
      updated_by: session?.user?.id ?? null,
      updated_at: new Date().toISOString(),
    }).eq("id", featuredId);
    setSaving(false);
    toast({ title: "Featured products saved" });
  };

  // ── Category handlers ──
  const moveCategory = (i: number, dir: number) => {
    const arr = [...categories];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    arr.forEach((c, idx) => c.order = idx);
    setCategories(arr);
  };

  const updateCategory = (i: number, field: keyof CategoryItem, value: any) => {
    const updated = [...categories];
    (updated[i] as any)[field] = value;
    setCategories(updated);
  };

  const saveCategories = async () => {
    if (!categoriesId) return;
    setSaving(true);
    const session = await getSession();
    await supabase.from("homepage_content").update({
      content: { categories } as any,
      updated_by: session?.user?.id ?? null,
      updated_at: new Date().toISOString(),
    }).eq("id", categoriesId);
    setSaving(false);
    toast({ title: "Categories saved" });
  };

  // ── Announcement ──
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementLinkLabel, setAnnouncementLinkLabel] = useState("");
  const [announcementLinkUrl, setAnnouncementLinkUrl] = useState("");
  const [announcementBgColor, setAnnouncementBgColor] = useState("#18181b");
  const [announcementTextColor, setAnnouncementTextColor] = useState("#ffffff");
  const [announcementStartDate, setAnnouncementStartDate] = useState("");
  const [announcementEndDate, setAnnouncementEndDate] = useState("");
  const [announcementLoading, setAnnouncementLoading] = useState(true);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "announcement_banner").maybeSingle().then(({ data }) => {
      if (data?.value) {
        const v = data.value as any;
        setAnnouncementEnabled(v.enabled ?? false);
        setAnnouncementText(v.text ?? "");
        setAnnouncementLinkLabel(v.link_label ?? "");
        setAnnouncementLinkUrl(v.link_url ?? "");
        setAnnouncementBgColor(v.bg_color ?? "#18181b");
        setAnnouncementTextColor(v.text_color ?? "#ffffff");
        setAnnouncementStartDate(v.start_date ?? "");
        setAnnouncementEndDate(v.end_date ?? "");
      }
      setAnnouncementLoading(false);
    });
  }, []);

  const saveAnnouncement = async () => {
    setSaving(true);
    const session = await getSession();
    const value = {
      enabled: announcementEnabled,
      text: announcementText,
      link_label: announcementLinkLabel,
      link_url: announcementLinkUrl,
      bg_color: announcementBgColor,
      text_color: announcementTextColor,
      start_date: announcementStartDate || null,
      end_date: announcementEndDate || null,
    };
    await supabase.from("site_settings").upsert(
      { key: "announcement_banner", value: value as any, updated_by: session?.user?.id ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    setSaving(false);
    toast({ title: "Announcement saved" });
  };

  const TABS = [
    { key: "announcement" as const, label: "Announcement" },
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

      {/* ═══ Announcement ═══ */}
      {tab === "announcement" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">ANNOUNCEMENT BAR</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="font-display text-[10px] tracking-widest text-muted-foreground">{announcementEnabled ? "ENABLED" : "DISABLED"}</span>
                <button
                  onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors ${announcementEnabled ? "bg-primary" : "bg-muted"} relative`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${announcementEnabled ? "translate-x-5" : ""}`} />
                </button>
              </label>
            </div>

            <div className="space-y-1.5">
              <Label className="font-display text-[10px] tracking-widest">MESSAGE (max 120 chars)</Label>
              <Input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value.slice(0, 120))} placeholder="Free shipping on all orders $99+ — No membership required" />
              <p className="text-[10px] text-muted-foreground">{announcementText.length}/120</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">LINK LABEL (optional)</Label>
                <Input value={announcementLinkLabel} onChange={(e) => setAnnouncementLinkLabel(e.target.value)} placeholder="Shop Now" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">LINK URL</Label>
                <Input value={announcementLinkUrl} onChange={(e) => setAnnouncementLinkUrl(e.target.value)} placeholder="/collections/all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">BACKGROUND COLOR</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={announcementBgColor} onChange={(e) => setAnnouncementBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <Input value={announcementBgColor} onChange={(e) => setAnnouncementBgColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">TEXT COLOR</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={announcementTextColor} onChange={(e) => setAnnouncementTextColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <Input value={announcementTextColor} onChange={(e) => setAnnouncementTextColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">START DATE (optional)</Label>
                <Input type="datetime-local" value={announcementStartDate} onChange={(e) => setAnnouncementStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">END DATE (optional)</Label>
                <Input type="datetime-local" value={announcementEndDate} onChange={(e) => setAnnouncementEndDate(e.target.value)} />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-1.5">
              <p className="font-display text-[9px] tracking-widest text-muted-foreground">PREVIEW</p>
              <div className="relative flex items-center justify-center px-10 py-2 rounded" style={{ backgroundColor: announcementBgColor, color: announcementTextColor }}>
                <span className="text-sm font-medium">{announcementText || "Your announcement text here"}</span>
                {announcementLinkLabel && (
                  <span className="ml-2 underline text-sm font-medium opacity-80">{announcementLinkLabel}</span>
                )}
                <span className="absolute right-3 opacity-50">✕</span>
              </div>
            </div>
          </div>

          <Button onClick={saveAnnouncement} disabled={saving}>
            {saving ? "Saving..." : "Save Announcement"}
          </Button>
        </div>
      )}

      {/* ═══ Hero Section ═══ */}
      {tab === "hero" && (
        <div className="space-y-4">
          {heroSlides.map((slide, i) => (
            <div key={i} className="border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">SLIDE {i + 1}</h4>
                {heroSlides.length > 1 && (
                  <button onClick={() => setHeroSlides(heroSlides.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
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

              {/* Image Upload */}
              <CmsImageUpload
                label="BACKGROUND IMAGE"
                value={slide.background_image}
                onChange={(url) => updateHeroSlide(i, "background_image", url)}
                previewWidth={300}
              />

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
            <Button variant="outline" onClick={() => setHeroSlides([...heroSlides, { ...DEFAULT_HERO }])} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Slide
            </Button>
            <Button onClick={saveHero} disabled={saving}>
              {saving ? "Saving..." : "Save Hero Slides"}
            </Button>
          </div>
        </div>
      )}

      {/* ═══ Featured Products ═══ */}
      {tab === "featured" && (
        <div className="space-y-4">
          <div className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">
                FEATURED PRODUCTS ({featuredCards.length})
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFeaturedCards([...featuredCards, { ...DEFAULT_CARD }])}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product
              </Button>
            </div>

            <div className="divide-y divide-border">
              {featuredCards.map((card, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex gap-4">
                    {/* Image column */}
                    <div className="w-[150px] shrink-0">
                      <CmsImageUpload
                        label="CARD IMAGE"
                        value={card.image_url || card.product_image_url || ""}
                        onChange={(url) => updateFeaturedCard(i, "image_url", url)}
                        previewWidth={150}
                        previewHeight={150}
                      />
                    </div>

                    {/* Fields column */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="space-y-1.5">
                        <Label className="font-display text-[10px] tracking-widest">TITLE</Label>
                        <Input
                          value={card.title}
                          onChange={(e) => updateFeaturedCard(i, "title", e.target.value)}
                          placeholder="Step Bar"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-display text-[10px] tracking-widest">DESCRIPTION</Label>
                        <Textarea
                          value={card.description}
                          onChange={(e) => updateFeaturedCard(i, "description", e.target.value)}
                          placeholder="Keep your truck bed protected..."
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-display text-[10px] tracking-widest">LINKED PRODUCT</Label>
                        <ProductSearchPicker
                          value={card.product_handle}
                          autoFocus={!card.product_handle && !card.title}
                          onSelect={(p) => {
                            updateFeaturedCard(i, "product_handle", p.handle);
                            if (!card.title) updateFeaturedCard(i, "title", p.title);
                            if (!card.image_url && p.imageUrl) updateFeaturedCard(i, "product_image_url", p.imageUrl);
                          }}
                          onClear={() => updateFeaturedCard(i, "product_handle", null)}
                        />
                      </div>

                      {!card.product_handle && (
                        <div className="space-y-1.5">
                          <Label className="font-display text-[10px] tracking-widest">CUSTOM LINK</Label>
                          <Input
                            value={card.custom_link || ""}
                            onChange={(e) => updateFeaturedCard(i, "custom_link", e.target.value)}
                            placeholder="/collections/tonneau-covers"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions column */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button onClick={() => moveFeatured(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveFeatured(i, 1)} disabled={i === featuredCards.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFeaturedCards(featuredCards.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive mt-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {featuredCards.length === 0 && (
                <p className="px-4 py-6 text-center text-muted-foreground font-body text-sm">No products selected</p>
              )}
            </div>
          </div>

          <Button onClick={saveFeatured} disabled={saving}>
            {saving ? "Saving..." : "Save Featured Products"}
          </Button>
        </div>
      )}

      {/* ═══ Categories ═══ */}
      {tab === "categories" && (
        <div className="space-y-4">
          <div className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
              <h4 className="font-display text-[10px] tracking-widest text-muted-foreground">HOMEPAGE CATEGORIES</h4>
            </div>
            <div className="divide-y divide-border">
              {categories.map((cat, i) => (
                <div key={cat.handle} className={`p-4 space-y-3 ${!cat.visible ? "opacity-50" : ""}`}>
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-[120px] shrink-0">
                      <CmsImageUpload
                        label="IMAGE"
                        value={cat.image_url || ""}
                        onChange={(url) => updateCategory(i, "image_url", url)}
                        previewWidth={120}
                        previewHeight={120}
                      />
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="space-y-1.5">
                        <Label className="font-display text-[10px] tracking-widest">TITLE</Label>
                        <Input
                          value={cat.title}
                          onChange={(e) => updateCategory(i, "title", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-display text-[10px] tracking-widest">DESCRIPTION</Label>
                        <Textarea
                          value={cat.description || ""}
                          onChange={(e) => updateCategory(i, "description", e.target.value)}
                          placeholder="Category description..."
                          rows={2}
                          className="resize-none text-sm"
                        />
                      </div>
                      <p className="font-display text-[10px] text-muted-foreground">Handle: {cat.handle}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button onClick={() => moveCategory(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveCategory(i, 1)} disabled={i === categories.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button onClick={() => updateCategory(i, "visible", !cat.visible)} className="text-muted-foreground hover:text-foreground mt-2">
                        {cat.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
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
