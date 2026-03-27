import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface BannerSettings {
  enabled: boolean;
  text: string;
  bg_color: string;
  text_color: string;
  link_url: string;
  link_label: string;
  start_date: string | null;
  end_date: string | null;
}

const DEFAULT: BannerSettings = {
  enabled: false,
  text: "",
  bg_color: "#18181b",
  text_color: "#ffffff",
  link_url: "",
  link_label: "",
  start_date: null,
  end_date: null,
};

export default function AdminSettingsPage() {
  const [banner, setBanner] = useState<BannerSettings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "announcement_banner")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setBanner({ ...DEFAULT, ...(data.value as any) });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "announcement_banner",
          value: banner as any,
          updated_by: session?.user?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    setSaving(false);
    if (error) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
  };

  if (loading) return <div className="loading-bar w-32 mx-auto mt-12" />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs tracking-widest text-foreground">ANNOUNCEMENT BANNER</h3>
          <div className="flex items-center gap-2">
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">
              {banner.enabled ? "ENABLED" : "DISABLED"}
            </span>
            <Switch
              checked={banner.enabled}
              onCheckedChange={(checked) => setBanner({ ...banner, enabled: checked })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-display text-[10px] tracking-widest">BANNER TEXT (max 120 chars)</Label>
          <Input
            value={banner.text}
            onChange={(e) => setBanner({ ...banner, text: e.target.value.slice(0, 120) })}
            placeholder="Free shipping on all orders $99+ — No membership required"
          />
          <p className="text-[10px] text-muted-foreground">{banner.text.length}/120</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="font-display text-[10px] tracking-widest">LINK LABEL (optional)</Label>
            <Input
              value={banner.link_label}
              onChange={(e) => setBanner({ ...banner, link_label: e.target.value })}
              placeholder="Shop Now"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-display text-[10px] tracking-widest">LINK URL (optional)</Label>
            <Input
              value={banner.link_url}
              onChange={(e) => setBanner({ ...banner, link_url: e.target.value })}
              placeholder="/collections/all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="font-display text-[10px] tracking-widest">BACKGROUND COLOR</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={banner.bg_color}
                onChange={(e) => setBanner({ ...banner, bg_color: e.target.value })}
                className="w-10 h-10 border border-input cursor-pointer bg-transparent"
              />
              <Input value={banner.bg_color} onChange={(e) => setBanner({ ...banner, bg_color: e.target.value })} className="flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-display text-[10px] tracking-widest">TEXT COLOR</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={banner.text_color}
                onChange={(e) => setBanner({ ...banner, text_color: e.target.value })}
                className="w-10 h-10 border border-input cursor-pointer bg-transparent"
              />
              <Input value={banner.text_color} onChange={(e) => setBanner({ ...banner, text_color: e.target.value })} className="flex-1" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="font-display text-[10px] tracking-widest">START DATE (optional)</Label>
            <Input
              type="datetime-local"
              value={banner.start_date ?? ""}
              onChange={(e) => setBanner({ ...banner, start_date: e.target.value || null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-display text-[10px] tracking-widest">END DATE (optional)</Label>
            <Input
              type="datetime-local"
              value={banner.end_date ?? ""}
              onChange={(e) => setBanner({ ...banner, end_date: e.target.value || null })}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-1.5">
          <Label className="font-display text-[10px] tracking-widest">PREVIEW</Label>
          <div
            className="relative flex items-center justify-center px-10 py-2.5 text-sm font-body font-medium"
            style={{ backgroundColor: banner.bg_color, color: banner.text_color }}
          >
            <span className="text-center">
              {banner.text || "Your announcement text here"}
            </span>
            {banner.link_label && (
              <span className="ml-2 underline opacity-80">{banner.link_label}</span>
            )}
            <span className="absolute right-3 opacity-50">✕</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
