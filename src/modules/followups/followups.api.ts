import { apiClient } from "@/modules/auth/auth.api";

export type UpcomingFollowUpItem = {
  _id: string;
  leadId?: any;
  customerId?: any;
  assignedTo?: any;
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

type UpcomingFollowUpsResponse = {
  success: boolean;
  message: string;
  data: {
    followups: UpcomingFollowUpItem[];
  };
};

export async function getUpcomingFollowUps(): Promise<UpcomingFollowUpItem[]> {
  const response = await apiClient.get<UpcomingFollowUpsResponse>(
    "/api/sales/followups/upcoming",
  );

  return response.data.data.followups;
}
