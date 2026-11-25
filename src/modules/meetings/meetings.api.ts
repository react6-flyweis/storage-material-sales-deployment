import { apiClient } from "@/modules/auth/auth.api";

/**
 * Meeting mode as stored by the API. Requests may still send `"in-person"`;
 * the backend normalises it to `"offline"`.
 */
export type MeetingMode = "online" | "offline";
export type MeetingModeInput = MeetingMode | "in-person";

export type MeetingStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled";

/**
 * Create body. For the default Zoom flow on online meetings, leave
 * `meetingLink` out — the backend creates the Zoom meeting and returns the
 * join URL. Only send `meetingLink` when staff chose "Use my own link".
 */
export type CreateMeetingPayload = {
  customerId?: string;
  leadId?: string;
  title: string;
  meetingTime: string;
  duration?: number;
  mode: MeetingModeInput;
  meetingLink?: string;
  notes?: string;
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
};

/** Edit body — send only the fields that changed. */
export type UpdateMeetingPayload = Partial<CreateMeetingPayload> & {
  status?: MeetingStatus;
};

export type MeetingUserRef =
  | string
  | {
    _id: string;
    name?: string;
    firstName?: string;
    email?: string;
  };

export type Meeting = {
  _id: string;
  customerId:
  | string
  | {
    _id: string;
    customerId?: string;
    firstName?: string;
    email?: string;
  };
  leadId: string;
  title: string;
  createdBy: MeetingUserRef;
  assignedTo: MeetingUserRef;
  meetingTime: string;
  duration: number;
  mode: MeetingModeInput;
  /** Public join URL — safe to share with the customer. */
  meetingLink?: string;
  /** Host start URL — staff only. */
  zoomStartUrl?: string;
  zoomMeetingId?: string;
  notes?: string;
  reminderMinutes?: number;
  reminderSms?: boolean;
  reminderEmail?: boolean;
  status: MeetingStatus | string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MeetingMutationResponse = {
  success: boolean;
  message: string;
  data?: { meeting?: Meeting };
};

/** @deprecated use MeetingMutationResponse */
export type CreateMeetingResponse = MeetingMutationResponse;

export type GetAdminMeetingsData = {
  meeting?: Meeting;
  meetings?: Meeting[];
};

export type GetMeetingsResponse = {
  success: boolean;
  message: string;
  data: GetAdminMeetingsData;
};

export type MeetingsQueryParams = {
  leadId?: string;
  status?: MeetingStatus;
  search?: string;
};

export async function createMeetingProvider(payload: CreateMeetingPayload) {
  const response = await apiClient.post<MeetingMutationResponse>(
    "/api/sales/meetings",
    payload,
  );

  return response.data;
}

export async function editMeetingProvider(
  meetingId: string,
  payload: UpdateMeetingPayload,
) {
  const response = await apiClient.put<MeetingMutationResponse>(
    `/api/sales/meetings/${encodeURIComponent(meetingId)}`,
    payload,
  );

  return response.data;
}

export async function completeMeetingProvider(meetingId: string) {
  const response = await apiClient.put<MeetingMutationResponse>(
    `/api/sales/meetings/${encodeURIComponent(meetingId)}/complete`,
  );

  return response.data;
}

/** Cancelling also deletes the Zoom meeting server-side. */
export async function cancelMeetingProvider(meetingId: string) {
  return editMeetingProvider(meetingId, { status: "cancelled" });
}

export async function getAdminMeetingsProvider(params?: MeetingsQueryParams) {
  const response = await apiClient.get<GetMeetingsResponse>(
    "/api/sales/meetings",
    { params },
  );

  return response.data;
}
