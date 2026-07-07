import { apiClient } from "@/modules/auth/auth.api";

export interface PageVisitPayload {
  panel: string;
  page: string;
}

export interface PageVisitResponse {
  success: boolean;
  message?: string;
  data?: {
    lastActiveAt: string;
    panel: string;
    page: string;
  };
}

export async function logPageVisit(page: string): Promise<PageVisitResponse> {
  const response = await apiClient.post<PageVisitResponse>(
    "/api/activity/page-visit",
    {
      panel: "sales",
      page,
    }
  );
  return response.data;
}
