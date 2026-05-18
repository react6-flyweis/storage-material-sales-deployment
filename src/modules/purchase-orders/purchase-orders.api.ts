import { apiClient } from "@/modules/auth/auth.api";

export type PurchaseOrderItem = {
  _id: string;
  leadId?: { _id: string; projectName?: string } | null;
  customerId?: { _id: string; firstName?: string } | null;
  raisedBy?: string;
  assignedTo?: { _id: string; firstName?: string } | null;
  invoiceId?: string | null;
  quotationId?: string | null;
  poNumber?: string | null;
  status?: string | null;
  adminNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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

export async function getPurchaseOrdersProvider(page = 1, limit = 20) {
  const response = await apiClient.get<PurchaseOrdersListResponse>(
    "/api/sales/po-orders",
    { params: { page, limit } },
  );

  return response.data;
}
