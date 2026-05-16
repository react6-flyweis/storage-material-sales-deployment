import { apiClient } from "@/modules/auth/auth.api";

export type ImportLeadsPayload = {
  csv: string;
};

export type LeadCustomerSummary = {
  _id: string;
  firstName: string;
  email: string;
};

export type LeadFollowUpSummary = {
  _id: string;
  followUpDate: string;
  notes?: string;
  priority?: string;
};

export type LeadListItem = {
  _id: string;
  projectName: string;
  customerId: LeadCustomerSummary;
  lifecycleStatus: string;
  quoteValue: number;
  leadScoring?: {
    score: number;
  };
  buildingType: string;
  location: string;
  nextFollowUp: LeadFollowUpSummary | null;
};

export type LeadsListResponse = {
  success: boolean;
  message: string;
  data: {
    leads: LeadListItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export type ImportLeadsResponse = {
  success: boolean;
  message: string;
  data: {
    created: number;
    skipped: number;
    errors: unknown[];
  };
};

export async function getLeadsProvider(page: number, limit: number) {
  const response = await apiClient.get<LeadsListResponse>("/api/sales/leads", {
    params: { page, limit },
  });

  return response.data;
}

export async function importLeadsProvider(payload: ImportLeadsPayload) {
  const response = await apiClient.post<ImportLeadsResponse>(
    "/api/sales/leads/import",
    payload,
  );

  return response.data;
}

export async function exportLeadsProvider(page: number, limit: number) {
  const response = await apiClient.get<string>("/api/sales/leads/export", {
    params: { page, limit },
    responseType: "text",
  });

  return response.data;
}

export type LeadDetailCustomer = {
  _id: string;
  customerId: string;
  firstName: string;
  email: string;
  phone?: {
    number: string;
    countryCode: string;
  };
};

export type LeadDetailLead = {
  _id: string;
  customerId: string;
  buildingType: string;
  location: string;
  source: string;
  assignedSales?: string | null;
  quoteValue: number;
  lifecycleStatus: string;
  isQuoteReady?: boolean;
  isHandedToSales?: boolean;
  isRaisedToPO?: boolean;
  poStatus?: string | null;
  aiContextSummary?: string;
  leadScoring?: {
    score: number;
    requirements?: string;
  };
  documents?: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type LeadDetailQuotation = {
  _id: string;
  leadId: string;
  buildingType: string;
  basePrice: number;
  maxPrice: number;
  sqft?: string;
  currency: string;
  roofStyle?: string;
  validTill?: string;
  location?: string;
  paymentTerms?: string;
  specialNote?: string;
  internalNotes?: string;
  priorityLevel?: string;
  status: string;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isLatest: boolean;
  includedMaterials?: Array<{
    name: string;
    description?: string;
    quantity?: number;
  }>;
  optionalAddOns?: Array<{
    name: string;
    description?: string;
    price?: number;
  }>;
};

export type LeadDetailAuditEntry = {
  _id: string;
  type: string;
  action: string;
  leadId: string;
  customerId: string;
  performedBy?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type LeadDetailFollowUp = {
  _id: string;
  followUpDate?: string;
  notes?: string;
  priority?: string;
  status?: string;
  type?: string;
  createdAt?: string;
};

export type LeadDetailInvoice = {
  _id: string;
  invoiceNumber: string;
  date?: string;
  totalAmount: number;
  status: string;
  sentAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
};

export type LeadDetailPayments = {
  invoices: LeadDetailInvoice[];
  totalPaid: number;
  totalPending: number;
  totalInvoices: number;
};

export type LeadDetailMessage = {
  _id?: string;
  text?: string;
  content?: string;
  sender?: string;
  createdAt?: string;
};

export type LeadDetailData = {
  lead: LeadDetailLead;
  customer: LeadDetailCustomer;
  rfq?: {
    aiQuoteData?: unknown;
    aiContextSummary?: string;
  };
  quotations: LeadDetailQuotation[];
  auditLog: LeadDetailAuditEntry[];
  activityLog: unknown[];
  followUps: LeadDetailFollowUp[];
  payments: LeadDetailPayments;
  buildings: unknown[];
  budget: unknown;
  recentMessages: LeadDetailMessage[];
  shipments: unknown[];
};

export type LeadDetailResponse = {
  success: boolean;
  message: string;
  data: LeadDetailData;
};

export async function getLeadDetailProvider(leadId: string) {
  const response = await apiClient.get<LeadDetailResponse>(
    `/api/sales/leads/${leadId}/detail`,
  );

  return response.data;
}

export type EscalateLeadPayload = {
  note: string;
};

export type EscalateLeadResponse = {
  success: boolean;
  message: string;
};

export async function escalateLeadProvider(
  leadId: string,
  payload: EscalateLeadPayload,
) {
  const response = await apiClient.post<EscalateLeadResponse>(
    `/api/sales/leads/${leadId}/escalate`,
    payload,
  );

  return response.data;
}
