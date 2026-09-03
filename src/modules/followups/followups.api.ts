import { apiClient } from "@/modules/auth/auth.api";

export type CommunicationTimelineLeadRef = {
  _id: string;
  projectName?: string;
};

export type CommunicationTimelineCustomerRef = {
  _id: string;
  firstName?: string;
};

export type CommunicationTimelineUserRef = {
  _id: string;
  name?: string;
};

export type CommunicationTimelineEntry = {
  _id: string;
  type?: string;
  action?: string;
  leadId?: CommunicationTimelineLeadRef;
  customerId?: CommunicationTimelineCustomerRef;
  performedBy?: CommunicationTimelineUserRef;
  metadata?: {
    activityType?: string;
    notes?: string;
    outcome?: string;
  };
  createdAt: string;
};

export type CommunicationTimelineResponse = {
  success: boolean;
  message: string;
  data: {
    entries: CommunicationTimelineEntry[];
    total: number;
  };
};

export type UpcomingLeadRef = {
  _id: string;
  customerId?: string;
  projectName?: string;
  jobId?: string;
  buildingType?: string;
  location?: string;
  projectId?: string;
};

export type UpcomingCustomerRef = {
  _id: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: {
    number?: string;
    countryCode?: string;
  } | string;
};

export type UpcomingFollowUpItem = {
  _id: string;
  leadId?: UpcomingLeadRef | null;
  customerId?: UpcomingCustomerRef | null;
  assignedTo?: {
    _id?: string;
    name?: string;
  } | string | null;
  createdBy?: {
    _id?: string;
    name?: string;
  } | string | null;
  followUpDate: string;
  modeOfContact?: "call" | "email" | "chat" | "sms" | "meeting" | string;
  notes?: string;
  priority?: string;
  status?: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  reminderMinutes?: number;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
  reminderSentAt?: string | null;
  source?: "manual" | "cold_lead_auto" | "chat_dropoff_auto" | "invoice_auto" | string;
  relatedInvoiceId?: string;
};

export type UpcomingFollowUpApiItem = UpcomingFollowUpItem;

export type UpcomingFollowUpsResponse = {
  success: boolean;
  message: string;
  data: {
    followups: UpcomingFollowUpItem[];
  };
};

export async function getUpcomingFollowUps(): Promise<UpcomingFollowUpsResponse> {
  try {
    const response = await apiClient.get<UpcomingFollowUpsResponse>(
      "/api/sales/followups/upcoming",
    );
    return response.data;
  } catch {
    const response = await apiClient.get<UpcomingFollowUpsResponse>(
      "/api/admin/followups/upcoming",
    );
    return response.data;
  }
}

export async function getUpcomingFollowUpsProvider(): Promise<UpcomingFollowUpsResponse> {
  return getUpcomingFollowUps();
}

export async function getCommunicationTimelineProvider(
  page: number,
  limit: number,
): Promise<CommunicationTimelineResponse> {
  const response = await apiClient.get<CommunicationTimelineResponse>(
    "/api/sales/followups/communication-timeline",
    {
      params: { page, limit },
    },
  );

  return response.data;
}

export type FollowUpStatsData = {
  total: number;
  upcoming: number;
  completed: number;
  overdue: number;
};

export type FollowUpStatsResponse = {
  success: boolean;
  message: string;
  data: FollowUpStatsData;
};

export async function getFollowUpStatsProvider() {
  const response = await apiClient.get<FollowUpStatsResponse>(
    "/api/admin/followups/stats",
  );

  return response.data;
}

export type FollowUpAiScriptApiItem = {
  _id?: string;
  id?: string;
  script?: string;
  message?: string;
  content?: string;
  generatedScript?: string;
  followupType?: string;
  type?: string;
  channel?: string;
  tone?: string;
  customerName?: string;
  customerId?: {
    firstName?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FollowUpAiScriptsResponse = {
  success: boolean;
  message: string;
  data: {
    scripts: FollowUpAiScriptApiItem[];
    message?: string;
  };
};

export async function getFollowUpAiScriptsProvider() {
  const response = await apiClient.get<FollowUpAiScriptsResponse>(
    "/api/admin/followups/ai-script",
  );

  return response.data;
}

export type CreateFollowUpPayload = {
  leadId: string;
  customerId?: string;
  assignedTo?: string;
  followUpDate: string; // ISO string
  modeOfContact?: "sms" | "call" | "email" | "chat" | "meeting" | string;
  notes?: string;
  priority?: string;
  reminderMinutes?: number;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
};

export type CreateFollowUpRequest = CreateFollowUpPayload;

export type EditFollowUpPayload = {
  followUpDate?: string;
  notes?: string;
  priority?: string;
  modeOfContact?: "sms" | "call" | "email" | "chat" | "meeting" | string;
  reminderMinutes?: number;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
};

export type CreateFollowUpResponse = {
  success: boolean;
  message: string;
  data?: {
    followupId?: string;
    followUp?: Record<string, unknown>;
  } | UpcomingFollowUpItem | unknown;
};

export async function createFollowUpProvider(
  payload: CreateFollowUpPayload,
): Promise<CreateFollowUpResponse> {
  try {
    const response = await apiClient.post<CreateFollowUpResponse>(
      "/api/follow-up/create",
      payload,
    );
    return response.data;
  } catch {
    try {
      const response = await apiClient.post<CreateFollowUpResponse>(
        "/api/sales/followups",
        payload,
      );
      return response.data;
    } catch {
      const response = await apiClient.post<CreateFollowUpResponse>(
        "/api/admin/followups",
        payload,
      );
      return response.data;
    }
  }
}

export async function editFollowUpProvider(
  followUpId: string,
  payload: EditFollowUpPayload,
): Promise<CreateFollowUpResponse> {
  const response = await apiClient.put<CreateFollowUpResponse>(
    `/api/follow-up/edit/${followUpId}`,
    payload,
  );
  return response.data;
}

export type CompleteFollowUpResponse = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
};

export async function completeFollowUpProvider(
  followUpId: string,
): Promise<CompleteFollowUpResponse> {
  const response = await apiClient.put<CompleteFollowUpResponse>(
    `/api/sales/followups/${followUpId}/complete`,
  );

  return response.data;
}

// ---------------- Follow-Up Insights Contract (2026-09-02) ----------------

export type FollowUpKind = "manual" | "automatic";
export type FollowUpView = "summary" | "detail";
export type FollowUpStatus = "pending" | "completed" | "overdue";
export type FollowUpModeOfContact = "call" | "email" | "meeting" | "sms" | "chat";
export type LeadTemperature = "hot" | "warm" | "cold";
export type TransitionSource = "manual_override" | "ai_scoring" | "system";

export type FollowUpActivityFilters = {
  kind?: FollowUpKind | "all";
  view?: FollowUpView;
  leadId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  status?: FollowUpStatus | string;
  modeOfContact?: FollowUpModeOfContact | string;
  temperature?: LeadTemperature | string;
  search?: string;
};

export type FollowUpActivityLeadItem = {
  lead: {
    _id: string;
    jobId?: string;
    projectName?: string;
    customerName?: string;
    location?: string;
    quoteValue?: number;
    lifecycleStatus?: string;
    assignedSales?: {
      _id?: string;
      name?: string;
    } | null;
    leadScoring?: {
      temperature?: LeadTemperature | string;
      score?: number;
    };
    score?: number;
    temperature?: LeadTemperature | string;
  };
  followUpCount: number;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
  lastFollowUpAt?: string | null;
  lastFollowUpStatus?: string | null;
};

export type FollowUpActivitySummaryResponse = {
  success: boolean;
  data: {
    kind: FollowUpKind;
    view: "summary";
    filters: {
      startDate?: string | null;
      endDate?: string | null;
      status?: string | null;
      modeOfContact?: string | null;
    };
    totals: {
      leadCount: number;
      followUpCount: number;
      pendingCount: number;
      completedCount: number;
      overdueCount: number;
    };
    leads: FollowUpActivityLeadItem[];
    pagination: {
      page: number;
      limit: number;
      totalLeads: number;
    };
  };
};

export type FollowUpHistoryItem = {
  _id: string;
  followUpDate: string;
  status: "pending" | "completed";
  computedStatus: FollowUpStatus;
  modeOfContact: FollowUpModeOfContact;
  source: string;
  assignedTo?: {
    _id?: string;
    name?: string;
  } | null;
  createdBy?: {
    _id?: string;
    name?: string;
  } | null;
  reminderMinutes?: number;
  notifyCustomer?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
  notes?: string;
  createdAt: string;
  completedAt?: string | null;
};

export type FollowUpActivityDetailResponse = {
  success: boolean;
  data: {
    kind: FollowUpKind;
    view: "detail";
    lead: {
      _id: string;
      jobId?: string;
      projectName?: string;
      customerName?: string;
      lifecycleStatus?: string;
      assignedSales?: {
        _id?: string;
        name?: string;
      } | null;
      leadScoring?: {
        temperature?: LeadTemperature | string;
        score?: number;
      };
    };
    totals: {
      followUpCount: number;
      pendingCount: number;
      completedCount: number;
      overdueCount: number;
    };
    history: FollowUpHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      totalHistory: number;
    };
  };
};

export async function getFollowUpActivitySummaryProvider(
  filters: FollowUpActivityFilters = {}
) {
  const params: Record<string, string | number> = {
    view: "summary",
    page: filters.page || 1,
    limit: filters.limit || 20,
  };

  if (filters.kind && filters.kind !== "all") {
    params.kind = filters.kind;
  }

  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.modeOfContact) params.modeOfContact = filters.modeOfContact;
  if (filters.temperature && filters.temperature !== "all") params.temperature = filters.temperature;
  if (filters.search) params.search = filters.search;

  const response = await apiClient.get<FollowUpActivitySummaryResponse>(
    "/api/followups/activity",
    { params }
  );

  return response.data;
}

export async function getFollowUpActivityDetailProvider(
  leadId: string,
  kind: FollowUpKind = "manual",
  page = 1,
  limit = 20
) {
  const params = {
    view: "detail",
    kind,
    leadId,
    page,
    limit,
  };

  const response = await apiClient.get<FollowUpActivityDetailResponse>(
    "/api/followups/activity",
    { params }
  );

  return response.data;
}

export type TemperatureTransitionCounts = {
  hot_to_warm: number;
  hot_to_cold: number;
  warm_to_hot: number;
  warm_to_cold: number;
  cold_to_hot: number;
  cold_to_warm: number;
};

export type TemperatureTransitionSummaryResponse = {
  success: boolean;
  data: {
    filters: {
      startDate?: string;
      endDate?: string;
    };
    transitions: TemperatureTransitionCounts;
    totals: {
      totalTransitions: number;
      leadTouchedCount: number;
    };
    bySource: {
      manual_override: number;
      ai_scoring: number;
      system: number;
    };
  };
};

export async function getTemperatureTransitionSummaryProvider(
  startDate?: string,
  endDate?: string
) {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<TemperatureTransitionSummaryResponse>(
    "/api/followups/temperature-transition-summary",
    { params }
  );

  return response.data;
}

export type TemperatureTransitionRowItem = {
  _id: string;
  leadId: string;
  customerId?: string;
  fromTemperature: LeadTemperature;
  toTemperature: LeadTemperature;
  source: TransitionSource | string;
  changedBy?: {
    _id?: string;
    name?: string;
  } | null;
  changedAt: string;
  metadata?: {
    scoreBefore?: number;
    scoreAfter?: number;
    reason?: string;
  };
};

export type TemperatureTransitionsListResponse = {
  success: boolean;
  data: {
    rows: TemperatureTransitionRowItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
};

export type TemperatureTransitionsQueryParams = {
  from?: LeadTemperature;
  to?: LeadTemperature;
  source?: TransitionSource;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export async function getTemperatureTransitionsListProvider(
  params: TemperatureTransitionsQueryParams = {}
) {
  const response = await apiClient.get<TemperatureTransitionsListResponse>(
    "/api/followups/temperature-transitions",
    { params }
  );

  return response.data;
}
