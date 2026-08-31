import {
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
  editFollowUpProvider,
  type CreateFollowUpPayload,
  type EditFollowUpPayload,
} from "./followups.api";

export function useUpcomingFollowUpsQuery() {
  return useQuery<UpcomingFollowUpsResponse>({
    queryKey: ["sales", "followups", "upcoming"],
    queryFn: getUpcomingFollowUps,
  });
}

export function useCommunicationTimelineQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ["sales", "followups", "communication-timeline", page, limit],
    queryFn: () => getCommunicationTimelineProvider(page, limit),
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
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads"],
      });
    },
  });
}

export function useEditFollowUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpId,
      payload,
    }: {
      followUpId: string;
      payload: EditFollowUpPayload;
    }) => editFollowUpProvider(followUpId, payload),
    onSuccess: (response) => {
      if (!response?.success) return;

      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "communication-timeline"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads"],
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
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads"],
      });
    },
  });
}
