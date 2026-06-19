import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentScheduleProvider,
  getPaymentScheduleByLeadProvider,
  updatePaymentScheduleProvider,
  type CreatePaymentSchedulePayload,
  type UpdatePaymentSchedulePayload,
} from "./payment-schedules.api";

export function usePaymentScheduleByLeadQuery(
  leadId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["payment-schedules", "lead", leadId],
    queryFn: () => getPaymentScheduleByLeadProvider(leadId!),
    enabled: Boolean(leadId) && enabled,
  });
}

export function useCreatePaymentScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentSchedulePayload) =>
      createPaymentScheduleProvider(payload),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["payment-schedules", "lead", variables.leadId],
      });
    },
  });
}

export function useUpdatePaymentScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: UpdatePaymentSchedulePayload }) =>
      updatePaymentScheduleProvider(leadId, payload),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["payment-schedules", "lead", variables.leadId],
      });
    },
  });
}

