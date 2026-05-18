import { apiClient } from "@/modules/auth/auth.api";

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
