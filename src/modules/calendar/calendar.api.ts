import { apiClient } from "@/modules/auth/auth.api";
import type {
  CalendarApiResponse,
  CalendarQueryParams,
  DeliveryDetailsApiResponse,
  CalendarProjectsApiResponse,
} from "./calendar.types";
import { getLeadsProvider } from "@/modules/leads/leads.api";

export async function getCalendarApi(params: CalendarQueryParams) {
  const response = await apiClient.get<CalendarApiResponse>(
    "/api/sales/construction/projects/calendar",
    { params }
  );
  return response.data;
}

export async function getDeliveryDetailsApi(leadId: string, deliveryId: string) {
  const response = await apiClient.get<DeliveryDetailsApiResponse>(
    `/api/sales/construction/projects/${leadId}/deliveries/${deliveryId}`
  );
  return response.data;
}

export async function downloadDeliveryPackingListApi(deliveryId: string) {
  const response = await apiClient.get(
    `/api/sales/construction/deliveries/${deliveryId}/download/packing-list`,
    { responseType: "blob" }
  );
  return response;
}

export async function downloadDeliveryBillOfLadingApi(deliveryId: string) {
  const response = await apiClient.get(
    `/api/sales/construction/deliveries/${deliveryId}/download/bill-of-lading`,
    { responseType: "blob" }
  );
  return response;
}

export async function getCalendarProjectsApi(params?: {
  page?: number;
  limit?: number;
  hasDelivery?: boolean;
}): Promise<CalendarProjectsApiResponse> {
  try {
    const response = await apiClient.get<CalendarProjectsApiResponse>(
      "/api/sales/construction/projects",
      { params }
    );
    if (response?.data?.data?.projects?.length > 0) {
      return response.data;
    }
  } catch {
    // If /api/sales/construction/projects is forbidden or errors for sales role, fall back to /api/sales/leads
  }

  try {
    const leadsRes = await getLeadsProvider({
      page: params?.page || 1,
      limit: params?.limit || 100,
    });
    const leads = leadsRes?.data?.leads || [];
    return {
      success: true,
      message: "Fetched projects from leads",
      data: {
        projects: leads.map((l) => ({
          _id: l._id,
          leadId: l._id,
          projectName: l.projectName || "Unnamed Project",
          jobId: l.jobId || "",
          buildingType: l.buildingType || "",
          location: l.location || "",
          hasDelivery: true,
        })),
        total: leadsRes?.data?.total || leads.length,
      },
    };
  } catch {
    return {
      success: true,
      message: "Empty projects fallback",
      data: {
        projects: [],
        total: 0,
      },
    };
  }
}
