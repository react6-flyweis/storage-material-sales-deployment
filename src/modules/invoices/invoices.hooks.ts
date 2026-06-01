import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createInvoiceDraftProvider,
  getInvoiceDetailProvider,
  getInvoiceStatsProvider,
  getInvoicesProvider,
  sendInvoiceProvider,
  type CreateInvoiceDraftPayload,
  type InvoiceListParams,
} from "./invoices.api";

export function useInvoiceStatsQuery() {
  return useQuery({
    queryKey: ["invoices", "stats"],
    queryFn: getInvoiceStatsProvider,
    staleTime: 60 * 1000,
  });
}

export function useInvoiceDetailQuery(
  invoiceId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["invoices", "detail", invoiceId],
    queryFn: () => getInvoiceDetailProvider(invoiceId!),
    enabled: Boolean(invoiceId) && enabled,
    staleTime: 60 * 1000,
  });
}

export function useInvoicesQuery(params: InvoiceListParams = {}) {
  const {
    startDate = "",
    endDate = "",
    status = "",
    leadId = "",
    search = "",
    page = 1,
    limit = 20,
  } = params;

  return useQuery({
    queryKey: [
      "invoices",
      page,
      limit,
      startDate,
      endDate,
      status,
      leadId,
      search.trim(),
    ],
    queryFn: () =>
      getInvoicesProvider({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status || undefined,
        leadId: leadId || undefined,
        search: search.trim() || undefined,
        page,
        limit,
      }),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: string;
      payload: CreateInvoiceDraftPayload;
    }) => createInvoiceDraftProvider(leadId, payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useEditInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      payload,
    }: {
      invoiceId: string;
      payload: CreateInvoiceDraftPayload;
    }) =>
      // lazy import to avoid circular issues if any
      import("./invoices.api").then((m) =>
        m.editInvoiceDraftProvider(invoiceId, payload),
      ),
    onSuccess: (response) => {
      if (!response.success) return;

      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["invoices", "detail"] });
    },
  });
}

export function useSendInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => sendInvoiceProvider(invoiceId),
    onSuccess: (response) => {
      if (!response.success) return;

      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["invoices", "detail"] });
    },
  });
}
