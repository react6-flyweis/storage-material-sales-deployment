import { apiClient } from "@/modules/auth/auth.api";

export interface CustomQuotePreviewRequest {
  matCost: number;
  freight: number;
  laborCost: number;
  marginPct?: number;
  sellOverride?: number | null;
}

export interface CustomQuotePreviewData {
  matCost: number;
  freight: number;
  laborCost: number;
  marginPct: number;
  sellOverride: number | null;
  totalCost: number;
  sell: number;
  profit: number;
  profPct: number;
}

export interface CustomQuotePreviewResponse {
  success: boolean;
  message?: string;
  data: CustomQuotePreviewData;
}

export interface CreateCustomQuoteRequest {
  customer: string;
  location?: string;
  size?: string;
  scope?: string;
  company?: "SM" | "SBD" | string;
  expDays?: number;
  matCost: number;
  freight: number;
  laborCost: number;
  marginPct?: number;
  sellOverride?: number | null;
  inclusions?: string[];
  exclusions?: string[];
  sow?: {
    overview?: string;
    delivery?: string;
    terms?: string;
    [key: string]: unknown;
  };
  additional?: string;
}

export interface CustomQuoteRecord {
  _id: string;
  customer: string;
  location?: string;
  size?: string;
  scope?: string;
  company?: "SM" | "SBD" | string;
  expDays?: number;
  matCost: number;
  freight: number;
  laborCost: number;
  marginPct: number;
  sellOverride?: number | null;
  totalCost: number;
  sell: number;
  profit: number;
  profPct: number;
  inclusions?: string[];
  exclusions?: string[];
  sow?: Record<string, unknown>;
  additional?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CustomQuoteResponse {
  success: boolean;
  message?: string;
  data: CustomQuoteRecord;
}

export interface CustomQuotesListResponse {
  success: boolean;
  message?: string;
  data: {
    items: CustomQuoteRecord[];
    count: number;
  };
}

export interface CustomQuotePdfResponse {
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

export async function previewCustomQuoteProvider(
  payload: CustomQuotePreviewRequest
): Promise<CustomQuotePreviewData> {
  const response = await apiClient.post<CustomQuotePreviewResponse>(
    "/api/sales/custom-quotes/preview",
    payload
  );
  return response.data?.data;
}

export async function createCustomQuoteProvider(
  payload: CreateCustomQuoteRequest
): Promise<CustomQuoteRecord> {
  const response = await apiClient.post<CustomQuoteResponse>(
    "/api/sales/custom-quotes",
    payload
  );
  return response.data?.data;
}

export async function getCustomQuotesListProvider(): Promise<CustomQuoteRecord[]> {
  const response = await apiClient.get<CustomQuotesListResponse>(
    "/api/sales/custom-quotes"
  );
  const data = response.data?.data;
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getCustomQuoteByIdProvider(
  id: string
): Promise<CustomQuoteRecord> {
  const response = await apiClient.get<CustomQuoteResponse>(
    `/api/sales/custom-quotes/${encodeURIComponent(id)}`
  );
  return response.data?.data;
}

export async function updateCustomQuoteProvider(
  id: string,
  payload: Partial<CreateCustomQuoteRequest>
): Promise<CustomQuoteRecord> {
  const response = await apiClient.put<CustomQuoteResponse>(
    `/api/sales/custom-quotes/${encodeURIComponent(id)}`,
    payload
  );
  return response.data?.data;
}

export async function deleteCustomQuoteProvider(
  id: string
): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{
    success: boolean;
    data?: { deleted: boolean };
    deleted?: boolean;
  }>(`/api/sales/custom-quotes/${encodeURIComponent(id)}`);
  return { deleted: response.data?.data?.deleted ?? response.data?.deleted ?? true };
}

export async function downloadCustomQuotePdfProvider(
  id: string,
  options?: { format?: "html" | "pdf"; company?: "SM" | "SBD" | string }
): Promise<CustomQuotePdfResponse> {
  const payload: Record<string, unknown> = {};
  if (options?.format === "html") payload.format = "html";
  if (options?.company) payload.company = options.company;
  const response = await apiClient.post<CustomQuotePdfResponse>(
    `/api/sales/custom-quotes/${encodeURIComponent(id)}/pdf`,
    payload
  );
  return response.data;
}

export async function downloadInlineCustomQuotePdfProvider(
  payload: CreateCustomQuoteRequest & { format?: "html" | "pdf" }
): Promise<CustomQuotePdfResponse> {
  const response = await apiClient.post<CustomQuotePdfResponse>(
    "/api/sales/custom-quotes/pdf",
    payload
  );
  return response.data;
}

