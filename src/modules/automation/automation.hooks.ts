import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendChatDropOffNowProvider,
  getAutomationConfigProvider,
  updateAutomationConfigProvider,
  runAutomationSweepProvider,
  type FollowUpAutomationConfig,
} from "./automation.api";

export function useSendChatDropOffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, message }: { leadId: string; message: string }) =>
      sendChatDropOffNowProvider(leadId, message),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["chat-history", variables.leadId] });
      void queryClient.invalidateQueries({ queryKey: ["chat", "history", variables.leadId] });
      void queryClient.invalidateQueries({ queryKey: ["lead", "detail", variables.leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "detail", variables.leadId] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", variables.leadId] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "followups"] });
      void queryClient.invalidateQueries({ queryKey: ["followups"] });
    },
  });
}

export function useAutomationConfigQuery() {
  return useQuery({
    queryKey: ["followup-automation", "config"],
    queryFn: getAutomationConfigProvider,
    staleTime: 60 * 1000,
  });
}

export function useUpdateAutomationConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<FollowUpAutomationConfig>) =>
      updateAutomationConfigProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["followup-automation", "config"] });
    },
  });
}

export function useRunAutomationSweepMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runAutomationSweepProvider,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["followups"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "followups"] });
      void queryClient.invalidateQueries({ queryKey: ["calendar", "events"] });
    },
  });
}
