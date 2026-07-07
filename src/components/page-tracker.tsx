import { usePageTracking } from "@/modules/activity/activity.hooks";

export function PageTracker() {
  usePageTracking();
  return null;
}
