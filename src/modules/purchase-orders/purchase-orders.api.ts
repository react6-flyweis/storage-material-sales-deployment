import { apiClient } from "@/modules/auth/auth.api";

export type PurchaseOrderItem = {
  _id: string;
  leadId?: {
    _id: string;
    projectName?: string;
    jobId?: string;
    quoteValue?: number;
    businessUnit?: string | null;
    businessUnitLabel?: string;
  } | null;
  businessUnit?: string | null;
  businessUnitLabel?: string;
  customerId?: { _id: string; firstName?: string; lastName?: string } | null;
  raisedBy?: string;
  assignedTo?: { _id: string; firstName?: string } | null;
  invoiceId?: string | null;
  quotationId?: string | null;
  poNumber?: string | null;
  status?: string | null;
  adminNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  quoteValue?: number;
};

export type PurchaseOrdersListResponse = {
  success: boolean;
  message: string;
  data: {
    orders: PurchaseOrderItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function getPurchaseOrdersProvider(page = 1, limit = 20, businessUnit?: string) {
  const params: { page: number; limit: number; businessUnit?: string } = { page, limit };
  if (businessUnit && businessUnit !== "all") {
    params.businessUnit = businessUnit;
  }
  const response = await apiClient.get<PurchaseOrdersListResponse>(
    "/api/sales/po-orders",
    { params },
  );

  return response.data;
}
