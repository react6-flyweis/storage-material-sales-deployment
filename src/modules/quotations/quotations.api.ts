import { apiClient } from "@/modules/auth/auth.api";

export type QuotationItem = {
  _id: string;
  quoteNumber?: string | null;
  versionNumber?: number;
  status?: string | null;
  finalPrice?: number | null;
  leadId?: {
    _id: string;
    projectName?: string | null;
  } | null;
  customerId?: {
    _id: string;
    firstName?: string | null;
    email?: string | null;
  } | null;
  createdAt?: string | null;
  sentAt?: string | null;
};

export type QuotationsListResponse = {
  success: boolean;
  message: string;
  data: {
    quotations: QuotationItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getQuotationsProvider(page = 1, limit = 20) {
  const response = await apiClient.get<QuotationsListResponse>(
    "/api/sales/quotations",
    { params: { page, limit } },
  );

  return response.data;
}
