import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createQuotationProvider,
  getQuotationByIdProvider,
  getQuotationsProvider,
  sendQuotationProvider,
  submitQuotationForApprovalProvider,
  type CreateQuotationPayload,
  type SendQuotationPayload,
} from "./quotations.api";

export function useQuotationsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["sales", "quotations", page, limit],
    queryFn: () => getQuotationsProvider(page, limit),
  });
}

export function useQuotationQuery(quotationId?: string) {
  return useQuery({
    queryKey: ["sales", "quotation", quotationId],
    queryFn: () => getQuotationByIdProvider(quotationId!),
    enabled: Boolean(quotationId),
  });
}

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuotationPayload) =>
      createQuotationProvider(payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
    },
  });
}

export function useSubmitQuotationForApprovalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quotationId,
      note,
    }: {
      quotationId: string;
      note?: string;
    }) => submitQuotationForApprovalProvider(quotationId, note),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "quotation", variables.quotationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["sales", "estimates"] });
    },
  });
}

export function useSendQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quotationId,
      payload,
    }: {
      quotationId: string;
      payload?: SendQuotationPayload;
    }) => sendQuotationProvider(quotationId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "quotation", variables.quotationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["sales", "estimates"] });
    },
  });
}

