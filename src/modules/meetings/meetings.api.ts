import { apiClient } from "@/modules/auth/auth.api";

export type CreateMeetingPayload = {
  customerId: string;
  leadId: string;
  title: string;
  meetingTime: string;
  duration: number;
  mode: "online" | "in-person";
  meetingLink: string;
  notes?: string;

};

export type CreateMeetingResponse = {
  success: boolean;
  message: string;
  data: unknown;
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
  mode: "online" | "in-person";
  meetingLink?: string;
  notes?: string;
  status: "scheduled" | "cancelled" | "completed" | string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GetAdminMeetingsData = {
  meeting?: Meeting;
  meetings?: Meeting[];
};

export type GetMeetingsResponse = {
  success: boolean;
  message: string;
  data: GetAdminMeetingsData;
};

export async function createMeetingProvider(payload: CreateMeetingPayload) {
  const response = await apiClient.post<CreateMeetingResponse>(
    "/api/sales/meeting",
    payload,
  );

  return response.data;
}

export async function editMeetingProvider(
  meetingId: string,
  payload: CreateMeetingPayload,
) {
  const response = await apiClient.put<CreateMeetingResponse>(
    `/api/sales/meeting/${meetingId}`,
    payload,
  );

  return response.data;
}

export async function getAdminMeetingsProvider() {
  const response = await apiClient.get<GetMeetingsResponse>(
    "/api/sales/meeting",
  );

  return response.data;
}
