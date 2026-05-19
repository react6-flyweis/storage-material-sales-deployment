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

type UpcomingLeadRef = {
  _id: string;
  customerId?: string;
  projectName?: string;
  jobId?: string;
};

type UpcomingCustomerRef = {
  _id: string;
  customerId?: string;
  firstName?: string;
  email?: string;
  phone?: {
    number?: string;
    countryCode?: string;
  };
};

export type UpcomingFollowUpItem = {
  _id: string;
  leadId?: UpcomingLeadRef;
  customerId?: UpcomingCustomerRef;
  assignedTo?: string;
  createdBy?: string;
  followUpDate: string;
  modeOfContact?: string;
  notes?: string;
  priority?: string;
  status?: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpcomingFollowUpsResponse = {
  success: boolean;
  message: string;
  data: {
    followups: UpcomingFollowUpItem[];
  };
};

export async function getUpcomingFollowUps(): Promise<UpcomingFollowUpsResponse> {
  const response = await apiClient.get<UpcomingFollowUpsResponse>(
    "/api/sales/followups/upcoming",
  );

  return response.data;
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
