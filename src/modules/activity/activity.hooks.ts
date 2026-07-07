import { useEffect } from "react";
import { useLocation } from "react-router";
import { useAuthStore } from "@/modules/auth/auth.store";
import { logPageVisit } from "./activity.api";

export function usePageTracking() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fullPath = location.pathname + location.search;
    const page = fullPath.slice(0, 500);

    logPageVisit(page).catch((error) => {
      // Gracefully handle or log tracking failure internally to avoid breaking user flow
      console.error("Failed to log page activity", error);
    });
  }, [location.pathname, location.search, accessToken]);
}
