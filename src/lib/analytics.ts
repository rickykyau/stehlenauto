import { supabase } from "@/integrations/supabase/client";

/* ─── GA4 ─── */

let ga4Loaded = false;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    _learnq?: any[];
  }
}

/* ─── Klaviyo ─── */

export function trackKlaviyoEvent(name: string, data: Record<string, unknown>) {
  if (window._learnq) {
    window._learnq.push(["track", name, data]);
  }
}

export function identifyKlaviyo(props: { $email: string; $first_name?: string; $last_name?: string }) {
  if (window._learnq) {
    window._learnq.push(["identify", props]);
  }
}

export async function initGA4() {
  if (ga4Loaded) return;
  try {
    const { data } = await supabase.functions.invoke("get-ga4-id");
    const id = data?.id;
    if (!id) return;

    // Load gtag.js
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: true });
    ga4Loaded = true;
  } catch (e) {
    console.warn("GA4 init failed:", e);
  }
}

export function trackGA4Event(name: string, params?: Record<string, unknown>) {
  if (window.gtag) {
    window.gtag("event", name, params);
  }
}

/* ─── Supabase Activity Log ─── */

export async function logActivity(
  eventType: string,
  eventData?: Record<string, unknown>
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // Only log for authenticated users

    await supabase.from("user_activity_log" as any).insert({
      user_id: session.user.id,
      event_type: eventType,
      event_data: eventData || {},
      page_url: window.location.pathname + window.location.search,
    });
  } catch {
    // Silent fail — analytics should never break the app
  }
}

/* ─── Combined tracker ─── */

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
) {
  trackGA4Event(name, params);
  logActivity(name, params);
}
