import { apiClient } from "@/modules/auth/auth.api";

export type SendChatDropOffPayload = {
  leadId: string;
  message: string;
};

export type SendChatDropOffResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export type WarmPreset = "twice_week" | "weekly" | "d7_15_30" | "custom";
export type ColdPreset = "d7_15_30" | "every_15" | "monthly" | "custom";
export type ChatPreset = "default" | "twice_day" | "daily" | "custom";

export interface FollowupAutomationConfigPayload {
  channels?: {
    sms: boolean;
    email: boolean;
  };
  timezone?: string;
  chatDropOff: {
    enabled: boolean;
    inactivityMinutes?: number;
    maxAttempts: number;
    attemptIntervalsMinutes: number[];
  };
  manualReminder: {
    defaultReminderMinutes: number;
    sendDueNowReminder: boolean;
  };
  leadFollowUp?: {
    warm?: {
      enabled?: boolean;
      preset?: WarmPreset;
      maxAttempts?: number;
      intervalsDays?: number[];
    };
    cold?: {
      enabled?: boolean;
      preset?: ColdPreset;
      maxAttempts?: number;
      intervalsDays?: number[];
    };
  };
}

export type FollowUpAutomationConfig = {
  key?: string;
  chatDropOff?: {
    enabled: boolean;
    inactivityMinutes?: number;
    maxAttempts: number;
    attemptIntervalsMinutes: number[];
    requireNotQuoteReady?: boolean;
    requireNotHandedToSales?: boolean;
  };


  manualReminder?: {
    defaultReminderMinutes: number;
    sendDueNowReminder: boolean;
  };
  leadFollowUp?: {
    warm?: {
      enabled?: boolean;
      preset?: WarmPreset;
      maxAttempts?: number;
      intervalsDays?: number[];
    };
    cold?: {
      enabled?: boolean;
      preset?: ColdPreset;
      maxAttempts?: number;
      intervalsDays?: number[];
    };
  };
  channels?: {
    sms: boolean;
    email: boolean;
  };
  timezone?: string;
};

export type GetAutomationConfigResponse = {
  success: boolean;
  data: {
    config: FollowUpAutomationConfig;
  };
};

export type RunAutomationSweepResponse = {
  success: boolean;
  data: {
    chatDropOff?: { scanned: number; sent: number };
    coldLead?: { scanned: number; sent: number };
    invoiceReminder?: { scanned: number; sent: number };
    manualReminder?: { scanned: number; sent: number };
    meetingReminder?: { scanned: number; sent: number };
  };
};

export async function sendChatDropOffNowProvider(leadId: string, message: string) {
  const response = await apiClient.post<SendChatDropOffResponse>(
    `/api/followup-automation/chat/${encodeURIComponent(leadId)}/send-now`,
    { message }
  );

  return response.data;
}

export async function sendChatDropOffFollowUp({
  leadId,
  message,
}: SendChatDropOffPayload): Promise<SendChatDropOffResponse> {
  return sendChatDropOffNowProvider(leadId, message);
}

export async function getAutomationConfigProvider() {
  const response = await apiClient.get<GetAutomationConfigResponse>(
    "/api/followup-automation/config"
  );

  return response.data;
}

export async function updateAutomationConfigProvider(
  payload: Partial<FollowUpAutomationConfig>
) {
  const response = await apiClient.put<{ success: boolean; data: unknown }>(
    "/api/followup-automation/config",
    payload
  );

  return response.data;
}

export async function runAutomationSweepProvider() {
  const response = await apiClient.post<RunAutomationSweepResponse>(
    "/api/followup-automation/run-now"
  );

  return response.data;
}
