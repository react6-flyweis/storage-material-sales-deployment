import axios from "axios";
import { apiClient } from "@/modules/auth/auth.api";
import type { InvoiceLineItem } from "@/modules/invoices/invoices.api";
export * from "./customer-documents.types";
import type {
  CreateCustomerDocumentPayload,
  CreateCustomerDocumentResponse,
  DeleteCustomerDocumentResponse,
  GetCustomerDocumentsResponse,
} from "./customer-documents.types";

type AdminCustomerPhone = {
  number?: string;
  countryCode?: string;
};

export type AdminCustomer = {
  _id: string;
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: AdminCustomerPhone;
  isActive?: boolean;
  source?: string;
  inquiryFor?: string;
  createdAt?: string;
  isReturning?: boolean;
};

export type GetAdminCustomersData = {
  customers: AdminCustomer[];
  total: number;
  page: number;
  limit: number;
};

export type GetAdminCustomersResponse = {
  success: boolean;
  message: string;
  data: GetAdminCustomersData;
};

export type AdminCustomerProject = {
  _id: string;
  customerId: string;
  buildingType?: string;
  businessUnit?: string | null;
  businessUnitLabel?: string;
  location?: string;
  source?: string;
  quoteValue?: number;
  lifecycleStatus?: string;
  isQuoteReady?: boolean;
  isHandedToSales?: boolean;
  isRaisedToPO?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCustomerInvoiceLineItem = InvoiceLineItem;

export type AdminCustomerInvoice = {
  _id: string;
  leadId?: string;
  customerId?: string;
  quotationId?: string;
  createdBy?: string;
  invoiceNumber?: string;
  date?: string;
  paymentScheduleId?: string;
  daysToPay?: number;
  poNumber?: string;
  lineItems?: AdminCustomerInvoiceLineItem[];
  subtotal?: number;
  markupTotal?: number;
  discount?: number;
  depositAmount?: number;
  totalAmount?: number;
  status?: string;
  sentAt?: string;
  paidBy?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type GetAdminCustomerDetailData = {
  customer: AdminCustomer;
  totalPaid: number;
  totalPending: number;
  totalInvoices: number;
  projects: AdminCustomerProject[];
  invoices: AdminCustomerInvoice[];
};

export type GetAdminCustomerDetailResponse = {
  success: boolean;
  message: string;
  data: GetAdminCustomerDetailData;
};

export async function getAdminCustomersProvider(page = 1, limit = 20) {
  const response = await apiClient.get<GetAdminCustomersResponse>(
    "/api/admin/customers",
    {
      params: { page, limit },
    },
  );

  return response.data;
}

export async function getAdminCustomerDetailProvider(customerId: string) {
  const response = await apiClient.get<GetAdminCustomerDetailResponse>(
    `/api/admin/customers/${customerId}`,
  );

  return response.data;
}

// Sales customers (public) API
export type SalesCustomerPhone = {
  number?: string;
  countryCode?: string;
};

export type SalesCustomer = {
  _id: string;
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: SalesCustomerPhone;
  isActive?: boolean;
  source?: string;
  inquiryFor?: string;
  createdAt?: string;
};

export type GetSalesCustomersData = {
  customers: SalesCustomer[];
  total: number;
  page?: number;
  limit?: number;
};

export type GetSalesCustomersResponse = {
  success: boolean;
  message: string;
  data: GetSalesCustomersData;
};

export async function getSalesCustomersProvider(page = 1, limit = 20, search?: string) {
  const response = await apiClient.get<GetSalesCustomersResponse>(
    "/api/sales/customers",
    { params: { page, limit, search } },
  );

  return response.data;
}

export type SalesCustomerFinancials = {
  totalPaid?: number;
  pendingPayment?: number;
  totalInvoices?: number;
  revenueGenerated?: number;
};

export type GetSalesCustomerDetailData = {
  customer: SalesCustomer;
  financials: SalesCustomerFinancials;
};

export type GetSalesCustomerDetailResponse = {
  success: boolean;
  message: string;
  data: GetSalesCustomerDetailData;
};

export async function getSalesCustomerDetailProvider(customerId: string) {
  const response = await apiClient.get<GetSalesCustomerDetailResponse>(
    `/api/sales/customers/${customerId}`,
  );

  return response.data;
}

export type SalesCustomerProject = {
  _id: string;
  projectId?: string;
  jobId?: string;
  projectName?: string;
  businessUnit?: string | null;
  businessUnitLabel?: string;
  numberOfBuildings?: number;
  lifecycleStatus?: string;
  quoteValue?: number;
  budget?: number | null;
  createdAt?: string;
};

export type GetSalesCustomerProjectsData = {
  projects: SalesCustomerProject[];
  total: number;
};

export type GetSalesCustomerProjectsResponse = {
  success: boolean;
  message: string;
  data: GetSalesCustomerProjectsData;
};

export async function getSalesCustomerProjectsProvider(
  customerId: string,
  page = 1,
  limit = 20,
  businessUnit?: string,
) {
  const params: { page: number; limit: number; businessUnit?: string } = {
    page,
    limit,
  };
  if (businessUnit && businessUnit !== "all") {
    params.businessUnit = businessUnit;
  }
  const response = await apiClient.get<GetSalesCustomerProjectsResponse>(
    `/api/sales/customers/${customerId}/projects`,
    { params },
  );

  return response.data;
}

export type CreateSalesCustomerProjectPayload = {
  projectName: string;
  buildingType: string;
  businessUnit?: string | null;
  location: string;
  roofStyle: string;
  quoteValue: number;
  width: number;
  length: number;
  height: number;
  doors: number;
  windows: number;
  insulation: number;
};

export type CreateSalesCustomerProjectResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function createSalesCustomerProjectProvider(
  customerId: string,
  payload: CreateSalesCustomerProjectPayload,
) {
  const response = await apiClient.post<CreateSalesCustomerProjectResponse>(
    `/api/sales/customers/${customerId}/projects`,
    payload,
  );

  return response.data;
}

export async function getCustomerDocumentsProvider(customerId: string) {
  const response = await apiClient.get<GetCustomerDocumentsResponse>(
    `/api/sales/customers/${customerId}/documents`,
  );
  return response.data;
}

export async function createCustomerDocumentProvider(
  customerId: string,
  payload: CreateCustomerDocumentPayload,
) {
  const response = await apiClient.post<CreateCustomerDocumentResponse>(
    `/api/sales/customers/${customerId}/documents`,
    payload,
  );
  return response.data;
}

export async function deleteCustomerDocumentProvider(
  customerId: string,
  docId: string,
) {
  const response = await apiClient.delete<DeleteCustomerDocumentResponse>(
    `/api/sales/customers/${customerId}/documents/${docId}`,
  );
  return response.data;
}

export async function uploadCustomerDocumentToS3(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ fileUrl: string; key: string }> {
  // Step A: Request presigned URL
  const presignResponse = await apiClient.post<{
    success: boolean;
    message: string;
    data: {
      uploadUrl: string;
      fileUrl: string;
      key: string;
    };
  }>("/api/upload/presigned-url", {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    folder: "documents",
  });

  const uploadUrl = presignResponse.data?.data?.uploadUrl;
  const fileUrl = presignResponse.data?.data?.fileUrl;
  const key = presignResponse.data?.data?.key;

  if (!uploadUrl || !fileUrl) {
    throw new Error(
      presignResponse.data?.message || "Failed to retrieve upload URL from server.",
    );
  }

  // Step B: S3 PUT without staff JWT Authorization header
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });

  return { fileUrl, key: key || "" };
}
