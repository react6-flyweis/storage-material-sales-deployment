import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendChatDropOffFollowUp,
  type SendChatDropOffPayload,
  type SendChatDropOffResponse,
} from "./automation.api";

export function useSendChatDropOffMutation() {
  const queryClient = useQueryClient();

  return useMutation<SendChatDropOffResponse, Error, SendChatDropOffPayload>({
    mutationFn: (payload: SendChatDropOffPayload) =>
      sendChatDropOffFollowUp(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "followups"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["chat", "history", variables.leadId],
      });
    },
  });
}
