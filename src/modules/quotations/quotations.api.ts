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
  data?: unknown;
};

export async function getQuotationsProvider(page = 1, limit = 20) {
  const response = await apiClient.get<QuotationsListResponse>(
    "/api/sales/quotations",
    { params: { page, limit } },
  );

  return response.data;
}

export async function createQuotationProvider(payload: CreateQuotationPayload) {
  const response = await apiClient.post<CreateQuotationResponse>(
    "/api/quotations",
    payload,
  );

  return response.data;
}
