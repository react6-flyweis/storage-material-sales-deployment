import { apiClient } from "@/modules/auth/auth.api";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

type InvoiceReferencePerson = {
  name?: string | null;
  email?: string | null;
};

type InvoiceCustomerReference = {
  _id?: string;
  customerId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export type InvoiceDocument = {
  _id: string;
  leadId?: string | null;
  paymentScheduleId?: string | null;
  customerId?: string | InvoiceCustomerReference | null;
  invoiceNumber?: string | null;
  poNumber?: string | null;
  date?: string | null;
  daysToPay?: number | null;
  dueDate?: string | null;
  subtotal?: number | null;
  markupTotal?: number | null;
  discount?: number | null;
  depositAmount?: number | null;
  totalAmount?: number | null;
  status?: InvoiceStatus | string | null;
  lineItems?: InvoiceLineItem[] | null;
  createdBy?: InvoiceReferencePerson | string | null;
  paidBy?: InvoiceReferencePerson | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type InvoiceLineItem = {
  _id?: string;
  id?: string;
  description?: string | null;
  notes?: string | null;
  images?: string[] | null;
  items?: string[] | null;
  rate?: number | null;
  markup?: number | null;
  quantity?: number | null;
  tax?: number | null;
  total?: number | null;
  photos?: string[] | null;
};

export type PaymentScheduleStage = {
  _id?: string;
  stageName?: string | null;
  amount?: number | null;
  amountType?: "percentage" | "fixed" | string | null;
  dueDate?: string | null;
  status?: string | null;
  invoiceId?: string | null;
};

export type PaymentScheduleDocument = {
  _id: string;
  leadId?: string | null;
  customerId?: string | null;
  totalAmount?: number | null;
  stages?: PaymentScheduleStage[] | null;
};

export type InvoiceListItem = {
  invoiceNumber: string;
  projectName: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  invoice: InvoiceDocument;
};

export type InvoicesListResponse = {
  success: boolean;
  message: string;
  data: {
    invoices: InvoiceListItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export type InvoiceListParams = {
  startDate?: string;
  endDate?: string;
  status?: InvoiceStatus | "";
  leadId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type InvoiceStats = {
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  overdue: number;
};

type InvoiceStatsResponse = {
  success: boolean;
  message: string;
  data: InvoiceStats;
};

export type InvoiceDetailResponse = {
  success: boolean;
  message: string;
  data: {
    invoice: Omit<InvoiceDocument, "lineItems"> & {
      lineItems?: InvoiceLineItem[] | null;
    };
    paymentSchedule?: PaymentScheduleDocument | null;
  };
};

export type InvoiceDetail = InvoiceDetailResponse["data"]["invoice"];

export type CreateInvoiceLineItemPayload = {
  description?: string;
  notes?: string;
  images?: string[];
  items?: string[];
  rate: number;
  markup: number;
  quantity: number;
  tax: number;
  total: number;
};

export type CreateInvoiceDraftPayload = {
  date?: string;
  daysToPay?: number;
  lineItems?: CreateInvoiceLineItemPayload[];
  subtotal?: number;
  markupTotal?: number;
  discount?: number;
  depositAmount?: number;
  totalAmount: number;
  paymentScheduleId?: string;
  paymentScheduleStageId?: string;
};

export type CreateInvoiceDraftResponse = {
  success: boolean;
  message: string;
  data: {
    invoice: InvoiceDocument & {
      quotationId?: string | null;
      paymentScheduleId?: string | null;
      paymentScheduleStageId?: string | null;
      sentAt?: string | null;
      paidAt?: string | null;
      paidBy?: InvoiceReferencePerson | string | null;
    };
  };
};

export async function getInvoiceStatsProvider(): Promise<InvoiceStats> {
  const response = await apiClient.get<InvoiceStatsResponse>(
    "/api/invoices/stats",
  );

  return response.data.data;
}

export async function getInvoicesProvider(params: InvoiceListParams = {}) {
  const response = await apiClient.get<InvoicesListResponse>("/api/invoices", {
    params: {
      page: params.page ?? 1,
      limit: Math.min(params.limit ?? 20, 100),
      ...(params.startDate ? { startDate: params.startDate } : {}),
      ...(params.endDate ? { endDate: params.endDate } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.leadId ? { leadId: params.leadId } : {}),
      ...(params.search ? { search: params.search } : {}),
    },
  });

  return response.data;
}

export async function getInvoiceDetailProvider(invoiceId: string) {
  const response = await apiClient.get<InvoiceDetailResponse>(
    `/api/invoices/${invoiceId}`,
  );

  return response.data;
}

export async function createInvoiceDraftProvider(
  leadId: string,
  payload: CreateInvoiceDraftPayload,
) {
  const response = await apiClient.post<CreateInvoiceDraftResponse>(
    `/api/leads/${leadId}/invoices`,
    payload,
  );

  return response.data;
}

export async function editInvoiceDraftProvider(
  invoiceId: string,
  payload: CreateInvoiceDraftPayload,
) {
  const response = await apiClient.put<CreateInvoiceDraftResponse>(
    `/api/invoices/${invoiceId}`,
    payload,
  );

  return response.data;
}

export type SendInvoiceResponse = {
  success: boolean;
  message: string;
};

export async function sendInvoiceProvider(invoiceId: string) {
  const response = await apiClient.post<SendInvoiceResponse>(
    `/api/invoices/${invoiceId}/send`,
  );

  return response.data;
}
