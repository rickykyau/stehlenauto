import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackGA4Event, logActivity } from "@/lib/analytics";

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const url = location.pathname + location.search;
    trackGA4Event("page_view", { page_path: url });
    logActivity("page_view", { path: url });
  }, [location.pathname, location.search]);
}
