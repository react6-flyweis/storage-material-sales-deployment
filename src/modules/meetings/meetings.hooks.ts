import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createMeetingProvider,
  editMeetingProvider,
  getAdminMeetingsProvider,
  type CreateMeetingPayload,
} from "./meetings.api";

export function useCreateMeetingMutation() {
  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) =>
      createMeetingProvider(payload),
  });
}

export function useUpdateMeetingMutation() {
  return useMutation({
    mutationFn: ({
      meetingId,
      payload,
    }: {
      meetingId: string;
      payload: CreateMeetingPayload;
    }) => editMeetingProvider(meetingId, payload),
  });
}

export function useMeetingsQuery(params?: { leadId?: string }) {
  return useQuery({
    queryKey: ["meetings", "admin-list", params],
    queryFn: () => getAdminMeetingsProvider(params),
  });
}
