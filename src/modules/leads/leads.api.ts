import { apiClient } from "@/modules/auth/auth.api";
import type { AuthUser } from "../auth/auth.types";
import type { LeadStatusType } from "./leads.utils";

export type ImportLeadsPayload = {
  csv: string;
};

export type LeadCustomerSummary = {
  _id: string;
  firstName: string;
  email: string;
  isOnline?: boolean;
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
  jobId: string;
  lifecycleStatus: LeadStatusType;
  quoteValue: number;
  leadScoring?: {
    score: number;
  };
  buildingType: string;
  location: string;
  nextFollowUp: LeadFollowUpSummary | null;
  isRaisedToPO?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
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

export type ScoredLeadItem = {
  leadId: string;
  jobId: string;
  projectId: string;
  customerName: string;
  projectName?: string;
  location: string;
  lifecycleStatus: string;
  lifecycleHistory?: Array<{
    stage: string;
    changedAt: string;
    changedBy: string | null;
    _id: string;
  }>;
  status: string;
  score: number;
  quoteValue: number;
  temperature: "hot" | "warm" | "cold";
  updatedAt: string;
};

export type ScoredLeadsResponse = {
  success: boolean;
  message: string;
  data: {
    leads: ScoredLeadItem[];
    total: number;
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

export type GetLeadsParams = {
  page?: number;
  limit?: number;
  search?: string;
  buildingType?: string;
  lifecycleStatus?: string;
  startDate?: string;
  endDate?: string;
};

export async function getLeadsProvider(params: GetLeadsParams) {
  const response = await apiClient.get<LeadsListResponse>("/api/sales/leads", {
    params,
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

export async function getScoredLeadsProvider(page: number, limit: number, startDate?: string, endDate?: string) {
  const params: { page: number; limit: number; startDate?: string; endDate?: string } = { page, limit };
  if (startDate) {
    params.startDate = startDate;
  }
  if (endDate) {
    params.endDate = endDate;
  }

  const response = await apiClient.get<ScoredLeadsResponse>(
    "/api/sales/leads/by-score",
    { params },
  );

  return response.data;
}

export type CreateLeadPayload = {
  customerId: string;
  projectName: string;
  buildingType: string;
  location: string;
  source: string;
  quoteValue: number;
  roofStyle: string;
  width: number;
  length: number;
  height: number;
  doors: number;
  windows: number;
  insulation: number;
  leadStatus: string;
  notes?: string;
};

export type CreateLeadResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function createLeadProvider(payload: CreateLeadPayload) {
  const response = await apiClient.post<CreateLeadResponse>(
    "/api/sales/leads",
    payload,
  );

  return response.data;
}

export type ExportLeadsParams = {
  search?: string;
  buildingType?: string;
  lifecycleStatus?: string;
  startDate?: string;
  endDate?: string;
};

export async function exportLeadsProvider(params?: ExportLeadsParams) {
  const response = await apiClient.get<string>("/api/sales/leads/export", {
    params,
    responseType: "text",
  });

  return response.data;
}

export type LeadLookupItem = {
  _id: string;
  customerId: {
    _id: string;
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: {
      number: string;
      countryCode: string;
    };
  };
  projectName: string;
  jobId: string;
  location: string;
  buildingType: string;
  lifecycleStatus: string;
  quoteValue: number;
  assignedSales?: {
    _id: string;
    name: string;
    email: string;
  };
  isRaisedToPO?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeadLookupResponse = {
  success: boolean;
  message: string;
  data: {
    leads: LeadLookupItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export async function lookupLeadsProvider(search?: string, page?: number, limit?: number) {
  const response = await apiClient.get<LeadLookupResponse>("/api/leads", {
    params: { search, page, limit },
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
  isOnline?: boolean;
  onlineAt?: string | null;
  lastSeenAt?: string | null;
};

export type LeadScoreBreakdown = {
  projectSize?: { points?: number; reason?: string };
  budgetSignals?: { points?: number; reason?: string };
  timeline?: { points?: number; reason?: string };
  decisionMaker?: { points?: number; reason?: string };
  projectClarity?: { points?: number; reason?: string };
};

export type LeadScoring = {
  score?: number;
  requirements?: string;
  lastScoredAt?: string;
  scoreBreakdown?: LeadScoreBreakdown;
};
export type LeadDetailLead = {
  _id: string;
  customerId: string;
  buildingType: string;
  location: string;
  source: string;
  assignedSales?: {
    _id: string;
    email: string;
    phone: string;
    role: string;
    assignedAt: string;
  } | null;
  quoteValue: number;
  lifecycleStatus: string;
  isQuoteReady?: boolean;
  isHandedToSales?: boolean;
  isRaisedToPO?: boolean;
  poStatus?: string | null;
  aiQuoteData?: unknown;
  aiContextSummary?: string;
  aiContextSummaryUpdatedAt?: string;
  assigningHistory?: Array<{
    employeeId: string;
    assignedAt: string;
    method?: string;
    assignedBy?: string | null;
  }>;
  projectName?: string;
  sqft?: string | number | null;
  width?: number | null;
  length?: number | null;
  height?: number | null;
  numberOfBuildings?: number;
  isTerminated?: boolean;
  terminationReason?: string;
  terminatedAt?: string | null;
  leadScoring?: LeadScoring;
  documents?: unknown[];
  createdAt: string;
  updatedAt: string;
  jobId?: string;
  isOnline?: boolean;
  onlineAt?: string | null;
  lastSeenAt?: string | null;
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
  width?: number;
  length?: number;
  height?: number;
  leftEaveHeight?: number;
  rightEaveHeight?: number;
  roofSlope?: string;
  windLoad?: string;
  snowLoad?: string;
  estimatedDelivery?: string;
  companyName?: string;
  preparedBy?: string;
  proposalDate?: string;
  validity?: string;
  frameType?: string;
  endwallType?: string;
  girtType?: string;
  purlinType?: string;
  bracingType?: string;
  roofPanel?: string;
  wallPanelType?: string;
  roofColor?: string;
  wallColor?: string;
  trimColor?: string;
  baseAngle?: string;
  shippingCost?: number;
  deliveryType?: string;
  shippingIncluded?: boolean;
  materialCost?: number;
  freightCost?: number;
  markupPercent?: number;
  doors?: Array<{
    doorCategory: string;
    doorType: string;
    size: string;
    qty: number;
    notes: string;
  }>;
  insulation?: Array<{
    insulationType: string;
    thickness: string;
    material: string;
  }>;
  // Fallbacks / flat fields for preview mapping
  insulationTypeRoof?: string;
  insulationThicknessRoof?: string;
  insulationMaterialRoof?: string;
  insulationTypeWall?: string;
  insulationThicknessWall?: string;
  insulationMaterialWall?: string;
  doorType?: string;
  doorSize?: string;
  doorQty?: string | number;
  doorNotes?: string;
  personnelDoorType?: string;
  personnelDoorSize?: string;
  personnelDoorQty?: string | number;
  personnelDoorNotes?: string;
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

export type LeadDetailActivityEntry = {
  _id: string;
  type?: string;
  action?: string;
  leadId?: string;
  customerId?: string;
  performedBy?: string | null;
  metadata?: {
    activityType?: string;
    notes?: string;
    outcome?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  __v?: number;
};

export type LeadDetailFollowUp = {
  _id: string;
  followUpDate?: string;
  notes?: string;
  priority?: string;
  status?: string;
  type?: string;
  modeOfContact?: string;
  createdAt?: string;
};

export type LeadDetailNote = {
  _id: string;
  note: string;
  addedAt: string;
  addedBy: AuthUser;
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
  sender?: string | null;
  senderType?:
  | "customer"
  | "ai"
  | "employee"
  | "sales"
  | "system"
  | string
  | null;
  senderId?: string | null;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AiScriptMessage = {
  role: string;
  content: string;
  timestamp: string;
  _id?: string;
};

export type AiScriptSession = {
  _id: string;
  salesEmployeeId?: string;
  leadId?: { _id: string; projectName?: string } | string;
  messages: AiScriptMessage[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
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
  activityLog: LeadDetailActivityEntry[];
  followUps: LeadDetailFollowUp[];
  payments: LeadDetailPayments;
  buildings: unknown[];
  budget: unknown;
  leadNotes: LeadDetailNote[];
  recentMessages: LeadDetailMessage[];
  shipments: unknown[];
};

export type ChatStatusData = {
  leadId: string;
  isChatEnded: boolean;
  chatEndedAt: string | null;
  chatEndedBy: string | null;
  isStaffChatActive: boolean;
  isHandedToSales: boolean;
  isAiActive: boolean;
  canCustomerSend: boolean;
  canStaffSend: boolean;
  isCustomerOnline: boolean;
  leadOnlineAt: string | null;
  leadLastSeenAt: string | null;
  customerOnline: {
    isOnline: boolean;
    onlineAt: string | null;
    lastSeenAt: string | null;
  };
};

export type ChatStatusResponse = {
  success: boolean;
  message: string;
  data: ChatStatusData;
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

export type CreateLeadNotePayload = {
  note: string;
};

export type CreateLeadNoteResponse = {
  success: boolean;
  message: string;
};

export async function createLeadNoteProvider(
  leadId: string,
  payload: CreateLeadNotePayload,
) {
  const response = await apiClient.post<CreateLeadNoteResponse>(
    `/api/sales/leads/${leadId}/notes`,
    payload,
  );

  return response.data;
}

export type MoveLeadToOrdersPayload = {
  poNumber: string;
};

export type MoveLeadToOrdersResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function moveLeadToOrdersProvider(
  leadId: string,
  payload: MoveLeadToOrdersPayload,
) {
  const response = await apiClient.post<MoveLeadToOrdersResponse>(
    `/api/sales/leads/${leadId}/po-order`,
    payload,
  );

  return response.data;
}

export type UpdateLeadLifecyclePayload = {
  lifecycleStatus: string;
};

export type UpdateLeadLifecycleResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function updateLeadLifecycleProvider(
  leadId: string,
  payload: UpdateLeadLifecyclePayload,
) {
  const response = await apiClient.put<UpdateLeadLifecycleResponse>(
    `/api/sales/leads/${leadId}/lifecycle`,
    payload,
  );

  return response.data;
}

export type UpdateLeadTemperaturePayload = {
  temperature: "hot" | "warm" | "cold";
};

export type UpdateLeadTemperatureResponse = {
  success: boolean;
  message: string;
  data?: {
    lead: {
      leadId: string;
      projectId: string;
      temperature: "hot" | "warm" | "cold";
      temperatureManual: boolean;
    };
  };
};

export async function updateLeadTemperatureProvider(
  leadId: string,
  payload: UpdateLeadTemperaturePayload,
) {
  const response = await apiClient.put<UpdateLeadTemperatureResponse>(
    `/api/sales/leads/${leadId}/temperature`,
    payload,
  );

  return response.data;
}

export type LeadAgreement = {
  _id: string;
  url: string;
  fileName: string;
  name: string;
  type: string;
  uploadedAt: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type LeadAgreementResponseData = {
  leadId: string;
  customerId: string;
  projectName: string;
  jobId: string;
  projectId: string;
  agreement: LeadAgreement | null;
  agreementUploadedAt: string | null;
};

export type LeadAgreementResponse = {
  success: boolean;
  message: string;
  data: LeadAgreementResponseData;
};

export async function getLeadAgreementProvider(leadId: string) {
  const response = await apiClient.get<LeadAgreementResponse>(
    `/api/sales/leads/${leadId}/agreement`,
  );

  return response.data;
}

export type UpdateLeadBuildingsPayload = {
  numberOfBuildings: number;
};

export type UpdateLeadBuildingsResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function updateLeadBuildingsProvider(
  leadId: string,
  payload: UpdateLeadBuildingsPayload,
) {
  const response = await apiClient.post<UpdateLeadBuildingsResponse>(
    `/api/sales/leads/${leadId}/buildings`,
    payload,
  );

  return response.data;
}



