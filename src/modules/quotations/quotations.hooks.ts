import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createQuotationProvider,
  convertEstimateToQuotationProvider,
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

export function useQuotationQuery(
  quotationId?: string,
  params?: { includeEstimate?: boolean; includeDocuments?: boolean }
) {
  return useQuery({
    queryKey: ["sales", "quotation", quotationId, params],
    queryFn: () => getQuotationByIdProvider(quotationId!, params),
    enabled: Boolean(quotationId),
  });
}

export function useConvertEstimateToQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estimateId: string) =>
      convertEstimateToQuotationProvider(estimateId),
    onSuccess: (_, estimateId) => {
      void queryClient.invalidateQueries({ queryKey: ["sales", "estimates"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
      if (estimateId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "estimate", estimateId],
        });
      }
    },
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
      estimateId,
    }: {
      quotationId?: string;
      note?: string;
      estimateId?: string;
    }) => {
      const targetId = quotationId || estimateId || "";
      return submitQuotationForApprovalProvider(targetId, { note, estimateId });
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
      if (variables.quotationId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "quotation", variables.quotationId],
        });
      }
      if (variables.estimateId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "quotation", variables.estimateId],
        });
      }
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

