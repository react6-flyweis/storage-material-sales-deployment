import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCommunicationTimelineProvider,
  getUpcomingFollowUps,
  type UpcomingFollowUpsResponse,
  createFollowUpProvider,
  completeFollowUpProvider,
  type CreateFollowUpPayload,
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

export function useCreateFollowUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFollowUpPayload) =>
      createFollowUpProvider(payload),
    onSuccess: (response) => {
      if (!response.success) return;

      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "communication-timeline"],
      });
    },
  });
}

export function useCompleteFollowUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followUpId: string) => completeFollowUpProvider(followUpId),
    onSuccess: (response) => {
      if (!response?.success) return;

      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "communication-timeline"],
      });
    },
  });
}
