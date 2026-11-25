import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelMeetingProvider,
  completeMeetingProvider,
  createMeetingProvider,
  editMeetingProvider,
  getAdminMeetingsProvider,
  type CreateMeetingPayload,
  type MeetingsQueryParams,
  type UpdateMeetingPayload,
} from "./meetings.api";

const MEETINGS_KEY = ["meetings"] as const;

export function useCreateMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) =>
      createMeetingProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEETINGS_KEY });
    },
  });
}

export function useUpdateMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      payload,
    }: {
      meetingId: string;
      payload: UpdateMeetingPayload;
    }) => editMeetingProvider(meetingId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEETINGS_KEY });
    },
  });
}

export function useCompleteMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => completeMeetingProvider(meetingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEETINGS_KEY });
    },
  });
}

export function useCancelMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => cancelMeetingProvider(meetingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEETINGS_KEY });
    },
  });
}

export function useMeetingsQuery(params?: MeetingsQueryParams) {
  return useQuery({
    queryKey: ["meetings", "admin-list", params],
    queryFn: () => getAdminMeetingsProvider(params),
  });
}
