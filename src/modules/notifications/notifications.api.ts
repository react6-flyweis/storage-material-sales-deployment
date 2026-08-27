import { apiClient } from "@/modules/auth/auth.api";
import type {
  NotificationsQueryParams,
  NotificationsListResponse,
  UnreadCountResponse,
  NotificationActionResponse,
} from "./notifications.types";

export async function getNotificationsProvider(
  params?: NotificationsQueryParams
): Promise<NotificationsListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.type) queryParams.type = params.type;
  if (params?.priority) queryParams.priority = params.priority;
  if (params?.read !== undefined && params.read !== "") queryParams.read = params.read;

  try {
    const response = await apiClient.get<NotificationsListResponse>(
      "/api/notifications",
      { params: queryParams }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const fallbackResponse = await apiClient.get<NotificationsListResponse>(
        "/notifications",
        { params: queryParams }
      );
      return fallbackResponse.data;
    }
    throw error;
  }
}

export async function getUnreadCountProvider(): Promise<UnreadCountResponse> {
  try {
    const response = await apiClient.get<UnreadCountResponse>(
      "/api/notifications/unread-count"
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const fallbackResponse = await apiClient.get<UnreadCountResponse>(
        "/notifications/unread-count"
      );
      return fallbackResponse.data;
    }
    throw error;
  }
}

export async function markNotificationReadProvider(
  id: string
): Promise<NotificationActionResponse> {
  try {
    const response = await apiClient.put<NotificationActionResponse>(
      `/api/notifications/${id}/read`
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const fallbackResponse = await apiClient.put<NotificationActionResponse>(
        `/notifications/${id}/read`
      );
      return fallbackResponse.data;
    }
    throw error;
  }
}

export async function markAllNotificationsReadProvider(): Promise<NotificationActionResponse> {
  try {
    const response = await apiClient.put<NotificationActionResponse>(
      "/api/notifications/read-all"
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const fallbackResponse = await apiClient.put<NotificationActionResponse>(
        "/notifications/read-all"
      );
      return fallbackResponse.data;
    }
    throw error;
  }
}

export async function deleteNotificationProvider(
  id: string
): Promise<NotificationActionResponse> {
  try {
    const response = await apiClient.delete<NotificationActionResponse>(
      `/api/notifications/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const fallbackResponse = await apiClient.delete<NotificationActionResponse>(
        `/notifications/${id}`
      );
      return fallbackResponse.data;
    }
    throw error;
  }
}
