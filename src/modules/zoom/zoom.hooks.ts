import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getZoomSessionConfig,
  saveZoomMeetingOutcome,
} from "./zoom.api";
import type { ZoomMeetingOutcomePayload } from "./zoom.types";

export function useZoomSessionQuery(meetingId: string) {
  return useQuery({
    queryKey: ["zoom-session", meetingId],
    queryFn: () => getZoomSessionConfig(meetingId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useSaveZoomOutcomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ZoomMeetingOutcomePayload) =>
      saveZoomMeetingOutcome(payload),
    onSuccess: () => {
      // Invalidate meetings and leads queries so UI immediately reflects updated status
      void queryClient.invalidateQueries({ queryKey: ["meetings"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    },
  });
}
