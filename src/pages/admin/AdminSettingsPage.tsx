import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BannerSettings {
  enabled: boolean;
  text: string;
  bg_color: string;
  text_color: string;
  link_url: string;
}

const DEFAULT: BannerSettings = {
  enabled: false,
  text: "",
  bg_color: "#D4A017",
  text_color: "#000000",
  link_url: "",
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
        if (data?.value) setBanner(data.value as unknown as BannerSettings);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("site_settings")
      .update({
        value: banner as any,
        updated_by: session?.user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "announcement_banner");

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
        <h3 className="font-display text-xs tracking-widest text-foreground">ANNOUNCEMENT BANNER</h3>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={banner.enabled}
              onChange={(e) => setBanner({ ...banner, enabled: e.target.checked })}
              className="accent-primary"
            />
            <span className="font-body text-sm text-foreground">Show announcement banner</span>
          </label>
        </div>

        <div className="space-y-1.5">
          <Label className="font-display text-[10px] tracking-widest">BANNER TEXT</Label>
          <Input
            value={banner.text}
            onChange={(e) => setBanner({ ...banner, text: e.target.value })}
            placeholder="Free shipping on orders over $50!"
          />
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

        <div className="space-y-1.5">
          <Label className="font-display text-[10px] tracking-widest">LINK URL (OPTIONAL)</Label>
          <Input
            value={banner.link_url}
            onChange={(e) => setBanner({ ...banner, link_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* Preview */}
        <div className="space-y-1.5">
          <Label className="font-display text-[10px] tracking-widest">PREVIEW</Label>
          <div
            className="px-4 py-2.5 text-center text-sm font-body font-medium"
            style={{ backgroundColor: banner.bg_color, color: banner.text_color }}
          >
            {banner.text || "Your announcement text here"}
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
