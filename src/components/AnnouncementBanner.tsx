import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

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

function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const viewedRef = useRef(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "announcement_banner")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const b = data.value as unknown as BannerSettings;
          setBanner(b);
          // Check dismiss by message hash
          if (b.text) {
            const key = `sa_announcement_dismissed_${hashText(b.text)}`;
            if (localStorage.getItem(key)) {
              setDismissed(true);
            }
          }
        }
      });
  }, []);

  // Scheduling check
  const now = new Date();
  const isScheduled = banner
    ? (!banner.start_date || new Date(banner.start_date) <= now) &&
      (!banner.end_date || new Date(banner.end_date) > now)
    : false;

  const visible = !dismissed && banner?.enabled && !!banner.text && isScheduled;

  // Track view once
  const bannerText = banner?.text || "";
  useEffect(() => {
    if (viewedRef.current || !visible || !bannerText) return;
    viewedRef.current = true;
    trackEvent("promotion_viewed", {
      promotion_id: "announcement_bar",
      promotion_name: bannerText,
      creative_slot: "announcement_bar",
    });
  }, [visible, bannerText]);

  if (!visible) return null;

  const handleDismiss = () => {
    setDismissed(true);
    const key = `sa_announcement_dismissed_${hashText(banner!.text)}`;
    localStorage.setItem(key, "1");
    trackEvent("announcement_dismissed", { promotion_name: banner!.text });
  };

  const linkLabel = banner!.link_label || "";
  const linkUrl = banner!.link_url || "";

  return (
    <div
      ref={bannerRef}
      className="relative flex items-center justify-center px-10 py-2"
      style={{ backgroundColor: banner!.bg_color || "#18181b", color: banner!.text_color || "#ffffff" }}
    >
      <span className="font-body text-xs sm:text-sm font-medium text-center">
        {banner!.text}
      </span>
      {linkLabel && linkUrl && (
        <a
          href={linkUrl}
          className="ml-2 underline font-body text-xs sm:text-sm font-medium hover:opacity-80"
          onClick={() =>
            trackEvent("promotion_clicked", {
              promotion_id: "announcement_bar",
              promotion_name: banner!.text,
              creative_slot: "announcement_bar",
            })
          }
        >
          {linkLabel}
        </a>
      )}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
        style={{ color: banner!.text_color || "#ffffff" }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
