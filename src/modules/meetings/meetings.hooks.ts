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

export function useMeetingsQuery() {
  return useQuery({
    queryKey: ["meetings", "admin-list"],
    queryFn: getAdminMeetingsProvider,
    staleTime: 60 * 1000,
  });
}
