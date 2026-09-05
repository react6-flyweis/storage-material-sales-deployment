import { apiClient } from "@/modules/auth/auth.api";
import type { SaveEstimatePayload } from "@/modules/quotation-generator/estimates.api";

export type ApprovalStatus =
  | "not_submitted"
  | "pending_approval"
  | "approved"
  | "rejected";

export type WorkflowStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "sent";

export type QuotationApprovalHistoryItem = {
  status: ApprovalStatus | string;
  note?: string;
  by?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      }
    | null;
  at?: string | null;
};

export type QuotationApprovalInfo = {
  status: ApprovalStatus;
  submittedBy?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | string | null;
  submittedAt?: string | null;
  reviewedBy?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  approvedVersionNumber?: number | null;
  history?: QuotationApprovalHistoryItem[];
};

export type QuotationItem = {
  _id: string;
  quoteNumber?: string | null;
  versionNumber?: number;
  workflowStatus?: WorkflowStatus;
  approvalStatus?: ApprovalStatus | string | null;
  approval?: QuotationApprovalInfo;
  status?: string | null;
  proposalDate?: string | null;
  companyName?: string | null;
  location?: string | null;
  buildingType?: string | null;
  sqft?: string | number | null;
  totalArea?: number | null;
  basePrice?: number | null;
  maxPrice?: number | null;
  materialCost?: number | null;
  freightCost?: number | null;
  totalCOGS?: number | null;
  markupPercent?: number | null;
  markupValue?: number | null;
  finalPrice?: number | null;
  psf?: number | null;
  currency?: string | null;
  leadId?:
    | string
    | {
        _id: string;
        projectName?: string | null;
      }
    | null;
  customerId?:
    | string
    | {
        _id: string;
        firstName?: string | null;
        email?: string | null;
      }
    | null;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sentAt?: string | null;
  sourceEstimateId?: string | null;
  sourceEstimate?: SaveEstimatePayload | null;
  estimate?: SaveEstimatePayload | null;
  pdfLink?: string | null;
  htmlPreviewLink?: string | null;
  documents?: Array<Record<string, unknown>> | null;
  documentMeta?: {
    source?: string;
    sourceEstimateId?: string;
    hasPricingData?: boolean;
    previewEndpoint?: string;
    pdfEndpoint?: string;
    defaultSections?: string[];
  } | null;
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

export type QuotationInsulationItem = {
  insulationType: string;
  thickness: string;
  material: string;
};

export type QuotationDoorItem = {
  doorCategory: string;
  doorType: string;
  size: string;
  qty: number;
  notes: string;
};

export type CreateQuotationPayload = {
  leadId: string;
  customerId?: string;
  buildingType: string;
  roofStyle: string;
  width: number;
  length: number;
  height: number;
  currency: string;
  windLoad: string;
  snowLoad: string;
  estimatedDelivery: string;
  companyName: string;
  paymentTerms: string;
  basePrice: number;
  margin: number;
  validTill: string;
  assignedSalesperson: string;
  proposalDate: string;
  validity: string;
  preparedBy: string;
  leftEaveHeight: number;
  rightEaveHeight: number;
  roofSlope: string;
  frameType: string;
  endwallType: string;
  girtType: string;
  purlinType: string;
  bracingType: string;
  roofPanel: string;
  wallPanelType: string;
  roofColor: string;
  wallColor: string;
  trimColor: string;
  baseAngle: string;
  insulation: QuotationInsulationItem[];
  shippingCost: number;
  deliveryType: string;
  shippingIncluded: boolean;
  materialCost: number;
  freightCost: number;
  markupPercent: number;
  doors: QuotationDoorItem[];
  includedComponents: string[];
  exclusions: string[];
  clientNotes: string;
  internalNotes: string;
  priorityLevel: string;
  changeNote: string;
};

export type CreateQuotationResponse = {
  success: boolean;
  message: string;
  data?: QuotationItem | unknown;
};

export type SubmitApprovalPayload = {
  note?: string;
  estimateId?: string;
};

export type SubmitApprovalResponse = {
  success: boolean;
  message: string;
  data?: QuotationItem;
};

export type SendQuotationPayload = {
  message?: string;
  note?: string;
  emailMessage?: string;
  coverNote?: string;
  notes?: string;
  sections?: string[];
  [key: string]: unknown;
};

export type SendQuotationResponse = {
  success: boolean;
  message: string;
  data?: {
    emailProvider?: "sendgrid" | "smtp_fallback" | string;
    quotation?: QuotationItem;
    [key: string]: unknown;
  };
};

export async function getQuotationsProvider(page = 1, limit = 20) {
  const response = await apiClient.get<QuotationsListResponse>(
    "/api/sales/quotations",
    { params: { page, limit } },
  );

  return response.data;
}

export async function getQuotationByIdProvider(
  quotationId: string,
  params?: { includeEstimate?: boolean; includeDocuments?: boolean }
) {
  const response = await apiClient.get<{
    success: boolean;
    message?: string;
    data: QuotationItem | { quotation: QuotationItem };
  }>(`/api/quotations/${encodeURIComponent(quotationId)}`, {
    params: {
      includeEstimate: params?.includeEstimate ?? true,
      includeDocuments: params?.includeDocuments ?? true,
      ...params,
    },
  });

  const rawData = response.data?.data;
  const quotation =
    (rawData as { quotation?: QuotationItem })?.quotation ||
    (rawData as QuotationItem);

  return {
    ...response.data,
    data: quotation,
  };
}

export async function convertEstimateToQuotationProvider(estimateId: string) {
  const response = await apiClient.post<{
    success: boolean;
    message?: string;
    data: QuotationItem;
  }>(`/api/quotations/from-estimate/${encodeURIComponent(estimateId)}`);
  return response.data;
}

export async function createQuotationProvider(payload: CreateQuotationPayload) {
  const response = await apiClient.post<CreateQuotationResponse>(
    "/api/quotations",
    payload,
  );

  return response.data;
}

export async function updateQuotationProvider(
  quotationId: string,
  payload: Partial<CreateQuotationPayload>
) {
  const response = await apiClient.put<CreateQuotationResponse>(
    `/api/quotations/${encodeURIComponent(quotationId)}`,
    payload
  );
  return response.data;
}

export async function submitQuotationForApprovalProvider(
  quotationId: string,
  payloadOrNote?: SubmitApprovalPayload | string,
  estimateId?: string
) {
  const payload: SubmitApprovalPayload =
    typeof payloadOrNote === "string"
      ? {
          ...(payloadOrNote ? { note: payloadOrNote } : {}),
          ...(estimateId ? { estimateId } : {}),
        }
      : {
          ...(payloadOrNote?.note ? { note: payloadOrNote.note } : {}),
          ...(payloadOrNote?.estimateId || estimateId
            ? { estimateId: payloadOrNote?.estimateId || estimateId }
            : {}),
        };

  const targetId = quotationId || payload.estimateId || "";

  const response = await apiClient.post<SubmitApprovalResponse>(
    `/api/quotations/${encodeURIComponent(targetId)}/submit-approval`,
    payload
  );

  return response.data;
}

export async function sendQuotationProvider(
  quotationId: string,
  payload?: SendQuotationPayload
) {
  const response = await apiClient.post<SendQuotationResponse>(
    `/api/quotations/${encodeURIComponent(quotationId)}/send`,
    payload || {}
  );

  return response.data;
}

