import { apiClient } from "@/modules/auth/auth.api";

export interface ChangeOrderPreviewRequest {
  origVal: number;
  amount?: number;
  cost?: number;
  markup?: number;
}

export interface ChangeOrderPreviewData {
  origVal: number;
  amount: number;
  cost: number;
  newTotal: number;
  profit: number;
  margin: number;
}

export interface ChangeOrderPreviewResponse {
  success: boolean;
  message?: string;
  data: ChangeOrderPreviewData;
}

export interface CreateChangeOrderRequest {
  estimateId?: string;
  parentQuoteRef?: string;
  customer: string;
  origDate?: string;
  origVal?: number;
  amount: number;
  cost: number;
  description: string;
  company?: string;
}

export interface ChangeOrderRecord {
  _id: string;
  estimateQuoteId?: string;
  estimateId?: string;
  parentQuoteRef?: string;
  coNum: number;
  customer: string;
  origDate?: string;
  origVal: number;
  amount: number;
  cost: number;
  profit: number;
  margin: number;
  newTotal: number;
  description: string;
  company?: string;
  employeeName?: string;
  employeeRole?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ChangeOrderResponse {
  success: boolean;
  message?: string;
  data: ChangeOrderRecord;
}

export interface ChangeOrdersListResponse {
  success: boolean;
  message?: string;
  data: {
    items: ChangeOrderRecord[];
    count: number;
  };
}

export interface ChangeOrderPdfResponse {
  success?: boolean;
  message?: string;
  data?: {
    fileName?: string;
    mimeType?: string;
    fileBase64?: string;
    sizeBytes?: number;
    html?: string;
  };
  fileName?: string;
  mimeType?: string;
  fileBase64?: string;
  sizeBytes?: number;
  html?: string;
}

export async function previewChangeOrderProvider(
  payload: ChangeOrderPreviewRequest
): Promise<ChangeOrderPreviewData> {
  const response = await apiClient.post<ChangeOrderPreviewResponse>(
    "/api/sales/change-orders/preview",
    payload
  );
  return response.data?.data;
}

export async function createChangeOrderProvider(
  payload: CreateChangeOrderRequest
): Promise<ChangeOrderRecord> {
  const response = await apiClient.post<ChangeOrderResponse>(
    "/api/sales/change-orders",
    payload
  );
  return response.data?.data;
}

export async function getChangeOrdersListProvider(params: {
  estimateId?: string;
  parentQuoteRef?: string;
}): Promise<ChangeOrderRecord[]> {
  const query = new URLSearchParams();
  if (params.estimateId) query.set("estimateId", params.estimateId);
  if (params.parentQuoteRef) query.set("parentQuoteRef", params.parentQuoteRef);

  const response = await apiClient.get<ChangeOrdersListResponse>(
    `/api/sales/change-orders?${query.toString()}`
  );
  const data = response.data?.data;
  return Array.isArray(data?.items) ? data.items : [];
}

export async function updateChangeOrderProvider(
  coId: string,
  payload: Partial<CreateChangeOrderRequest>
): Promise<ChangeOrderRecord> {
  const response = await apiClient.put<ChangeOrderResponse>(
    `/api/sales/change-orders/${encodeURIComponent(coId)}`,
    payload
  );
  return response.data?.data;
}

export async function deleteChangeOrderProvider(
  coId: string
): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{
    success: boolean;
    data?: { deleted: boolean };
    deleted?: boolean;
  }>(`/api/sales/change-orders/${encodeURIComponent(coId)}`);
  return { deleted: response.data?.data?.deleted ?? response.data?.deleted ?? true };
}

export async function downloadChangeOrderPdfProvider(
  coId: string,
  options?: { format?: "html" | "pdf" }
): Promise<ChangeOrderPdfResponse> {
  const response = await apiClient.post<ChangeOrderPdfResponse>(
    `/api/sales/change-orders/${encodeURIComponent(coId)}/pdf`,
    options?.format === "html" ? { format: "html" } : {}
  );
  return response.data;
}

export async function downloadInlineChangeOrderPdfProvider(payload: {
  co: Partial<ChangeOrderRecord>;
  priorCOs?: ChangeOrderRecord[];
  baseOrigVal?: number;
  format?: "html" | "pdf";
}): Promise<ChangeOrderPdfResponse> {
  const response = await apiClient.post<ChangeOrderPdfResponse>(
    "/api/sales/change-orders/pdf",
    payload
  );
  return response.data;
}

