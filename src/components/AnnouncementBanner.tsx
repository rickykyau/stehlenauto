import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BannerSettings {
  enabled: boolean;
  text: string;
  bg_color: string;
  text_color: string;
  link_url: string;
}

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("banner_dismissed")) {
      setDismissed(true);
      return;
    }
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "announcement_banner")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setBanner(data.value as unknown as BannerSettings);
      });
  }, []);

  if (dismissed || !banner?.enabled || !banner.text) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("banner_dismissed", "1");
  };

  const content = (
    <span className="font-body text-xs sm:text-sm font-medium">{banner.text}</span>
  );

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2"
      style={{ backgroundColor: banner.bg_color, color: banner.text_color }}
    >
      {banner.link_url ? (
        <a href={banner.link_url} className="hover:underline">{content}</a>
      ) : (
        content
      )}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
        style={{ color: banner.text_color }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
