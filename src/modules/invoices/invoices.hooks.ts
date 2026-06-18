import {
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
  markInvoicePaidProvider,
  type CreateInvoiceDraftPayload,
  type InvoiceListParams,
} from "./invoices.api";

export function useInvoiceStatsQuery(params?: { leadId?: string }) {
  return useQuery({
    queryKey: ["invoices", "stats", params?.leadId],
    queryFn: () => getInvoiceStatsProvider(params),
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
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail"] });
    },
  });
}

export function useMarkInvoicePaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => markInvoicePaidProvider(invoiceId),
    onSuccess: (response) => {
      if (!response.success) return;

      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["invoices", "detail"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail"] });
    },
  });
}

