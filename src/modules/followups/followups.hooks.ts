import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCommunicationTimelineProvider,
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

export function useCommunicationTimelineQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ["sales", "followups", "communication-timeline", page, limit],
    queryFn: () => getCommunicationTimelineProvider(page, limit),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
