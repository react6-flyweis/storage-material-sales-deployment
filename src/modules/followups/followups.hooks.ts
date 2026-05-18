import { useQuery } from "@tanstack/react-query";
import {
  getUpcomingFollowUps,
  type UpcomingFollowUpsResponse,
} from "./followups.api";

export function useUpcomingFollowUpsQuery() {
  return useQuery<UpcomingFollowUpsResponse>({
    queryKey: ["sales", "followups", "upcoming"],
    queryFn: getUpcomingFollowUps,
    staleTime: 60 * 1000,
  });
}
