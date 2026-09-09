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
  getQuotationStatsProvider,
  sendQuotationProvider,
  markQuotationSentProvider,
  submitQuotationForApprovalProvider,
  getLatestApprovedTaxByLeadProvider,
  type CreateQuotationPayload,
  type SendQuotationPayload,
  type MarkQuotationSentPayload,
  type GetQuotationsParams,
  type LatestApprovedTaxResponse,
} from "./quotations.api";

export function useQuotationsQuery(
  pageOrParams: number | GetQuotationsParams = 1,
  limit = 20
) {
  const queryKey =
    typeof pageOrParams === "object"
      ? ["sales", "quotations", pageOrParams]
      : ["sales", "quotations", pageOrParams, limit];

  return useQuery({
    queryKey,
    queryFn: () => getQuotationsProvider(pageOrParams, limit),
  });
}

export function useQuotationStatsQuery() {
  return useQuery({
    queryKey: ["sales", "quotations", "stats"],
    queryFn: getQuotationStatsProvider,
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

export { type MarkQuotationSentPayload };

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
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    },
  });
}

export function useMarkQuotationSentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quotationId,
      payload,
    }: {
      quotationId: string;
      payload?: MarkQuotationSentPayload;
    }) => markQuotationSentProvider(quotationId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "quotation", variables.quotationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["sales", "estimates"] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    },
  });
}

export { type LatestApprovedTaxResponse };

export function useLatestApprovedTaxByLeadQuery(
  leadId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["leads", leadId, "quotations", "latest-approved-tax"],
    queryFn: () => getLatestApprovedTaxByLeadProvider(leadId!),
    enabled: Boolean(leadId) && enabled,
  });
}


