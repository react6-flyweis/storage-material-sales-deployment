import { useQuery } from "@tanstack/react-query";
import {
  getUpcomingFollowUps,
  type UpcomingFollowUpItem,
} from "./followups.api";

export function useUpcomingFollowUpsQuery() {
  return useQuery<UpcomingFollowUpItem[]>({
    queryKey: ["sales", "followups", "upcoming"],
    queryFn: getUpcomingFollowUps,
    staleTime: 60 * 1000,
  });
}
