import { apiClient } from "@/modules/auth/auth.api";

export type SendChatDropOffPayload = {
  leadId: string;
  message: string;
};

export type SendChatDropOffResponse = {
  success: boolean;
  message: string;
  data?: {
    chatMessage?: Record<string, unknown>;
    lead?: Record<string, unknown>;
  };
};

export async function sendChatDropOffFollowUp({
  leadId,
  message,
}: SendChatDropOffPayload): Promise<SendChatDropOffResponse> {
  const response = await apiClient.post<SendChatDropOffResponse>(
    `/api/followup-automation/chat/${leadId}/send-now`,
    { message },
  );

  return response.data;
}
