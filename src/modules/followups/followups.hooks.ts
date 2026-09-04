import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommunicationTimelineProvider,
  getUpcomingFollowUps,
  getFollowUpStatsProvider,
  getFollowUpAiScriptsProvider,
  createFollowUpProvider,
  completeFollowUpProvider,
  editFollowUpProvider,
  getFollowUpActivitySummaryProvider,
  getFollowUpActivityDetailProvider,
  getTemperatureTransitionSummaryProvider,
  getTemperatureTransitionsListProvider,
  type UpcomingFollowUpsResponse,
  type CreateFollowUpPayload,
  type EditFollowUpPayload,
  type FollowUpActivityDetailOptions,
  type FollowUpActivityFilters,
  type FollowUpKind,
  type TemperatureTransitionsQueryParams,
} from "./followups.api";

export function useFollowUpStatsQuery() {
  return useQuery({
    queryKey: ["followups", "stats"],
    queryFn: getFollowUpStatsProvider,
    staleTime: 60 * 1000,
  });
}

export function useUpcomingFollowUpsQuery() {
  return useQuery<UpcomingFollowUpsResponse>({
    queryKey: ["sales", "followups", "upcoming"],
    queryFn: getUpcomingFollowUps,
    staleTime: 60 * 1000,
  });
}

export function useFollowUpAiScriptsQuery() {
  return useQuery({
    queryKey: ["followups", "ai-script"],
    queryFn: getFollowUpAiScriptsProvider,
    staleTime: 60 * 1000,
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
    onSuccess: (response, variables) => {
      if (!response?.success && !response?.data) return;

      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["followups", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["followups", "admin", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["followups", "stats"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups", "communication-timeline"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["followups", "activity"],
      });
      if (variables.leadId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "leads", "detail", variables.leadId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["leads", "detail", variables.leadId],
        });
      }
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
        queryKey: ["followups", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["followups", "activity"],
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
        queryKey: ["followups", "upcoming"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["followups", "activity"],
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

export function useFollowUpActivitySummaryQuery(
  filters: FollowUpActivityFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["followups", "activity", "summary", filters],
    queryFn: () => getFollowUpActivitySummaryProvider(filters),
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
    retry: 1,
  });
}

export function useFollowUpActivityDetailQuery(
  leadId: string,
  kind: FollowUpKind = "manual",
  page = 1,
  limit = 20,
  optionsOrEnabled?: FollowUpActivityDetailOptions | boolean,
  enabledParam?: boolean
) {
  const options =
    typeof optionsOrEnabled === "object" ? optionsOrEnabled : undefined;
  const enabled =
    typeof optionsOrEnabled === "boolean"
      ? optionsOrEnabled
      : (enabledParam ?? true);

  return useQuery({
    queryKey: [
      "followups",
      "activity",
      "detail",
      leadId,
      kind,
      page,
      limit,
      options?.startDate,
      options?.endDate,
      options?.transitionState,
    ],
    queryFn: () =>
      getFollowUpActivityDetailProvider(leadId, kind, page, limit, options),
    enabled: Boolean(leadId) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useTemperatureTransitionSummaryQuery(
  startDate?: string,
  endDate?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["followups", "temperature-summary", startDate, endDate],
    queryFn: () => getTemperatureTransitionSummaryProvider(startDate, endDate),
    enabled: enabled && Boolean(startDate || endDate),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useTemperatureTransitionsQuery(
  params: TemperatureTransitionsQueryParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: ["followups", "temperature-transitions", params],
    queryFn: () => getTemperatureTransitionsListProvider(params),
    enabled: enabled && Boolean(params.from && params.to),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
