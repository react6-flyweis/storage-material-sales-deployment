import { apiClient } from "@/modules/auth/auth.api";
import { useAuthStore } from "@/modules/auth/auth.store";
import type {
  UserProfile,
  GetProfileApiResponse,
  UpdateProfileRequest,
  UpdateProfileApiResponse,
  ChangePasswordRequest,
  ChangePasswordApiResponse,
  UpdateNotificationSettingsRequest,
  UpdateNotificationSettingsApiResponse,
  NotificationSettings,
} from "./profile.types";

/**
 * Fetch current user profile (includes notificationSettings)
 * GET /api/profile
 */
export async function getStaffProfileProvider(): Promise<GetProfileApiResponse> {
  const response = await apiClient.get<GetProfileApiResponse | UserProfile>(
    "/api/profile"
  );
  const raw = response.data as any;
  if (raw && raw.data && raw.data.profile) {
    return raw as GetProfileApiResponse;
  }
  const profile = (raw?.profile || raw?.data || raw) as UserProfile;
  return {
    success: true,
    message: "Success",
    data: {
      profile,
      user: profile,
    },
  };
}

export async function getProfileApi(): Promise<UserProfile> {
  const res = await getStaffProfileProvider();
  return res.data.profile;
}

/**
 * Update current user profile
 * PUT /api/profile
 * Send only fields to change (at least one): name, email, phone, mobile, avatar
 */
export async function updateProfileApi(
  payload: UpdateProfileRequest
): Promise<UserProfile> {
  const cleanPayload: Record<string, string> = {};
  if (payload.name !== undefined) cleanPayload.name = payload.name;
  if (payload.email !== undefined) cleanPayload.email = payload.email;
  if (payload.phone !== undefined) cleanPayload.phone = payload.phone;
  if (payload.mobile !== undefined) cleanPayload.mobile = payload.mobile;
  if (payload.avatar !== undefined) cleanPayload.avatar = payload.avatar;
  if (payload.location !== undefined) cleanPayload.location = payload.location;

  const response = await apiClient.put<UpdateProfileApiResponse | UserProfile>(
    "/api/profile",
    cleanPayload
  );
  const raw = response.data as any;
  const profile = (raw?.data?.profile || raw?.profile || raw?.data || raw) as UserProfile;

  if (profile) {
    useAuthStore.getState().updateUser({
      name: profile.name,
      email: profile.email,
      role: profile.role,
    });
  }

  return profile;
}

export async function updateStaffProfileProvider(
  payload: UpdateProfileRequest
): Promise<UpdateProfileApiResponse> {
  const profile = await updateProfileApi(payload);
  return {
    success: true,
    message: "Profile updated",
    data: {
      profile,
      user: profile,
    },
  };
}

/**
 * Change current user password
 * PUT /api/profile/password
 * Body: { currentPassword, newPassword }
 */
export async function changePasswordApi(
  payload: ChangePasswordRequest
): Promise<ChangePasswordApiResponse> {
  try {
    const response = await apiClient.put<ChangePasswordApiResponse>(
      "/api/profile/password",
      payload
    );
    return response.data;
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) {
      const fallbackResponse = await apiClient.put<ChangePasswordApiResponse>(
        "/api/auth/change-password",
        payload
      );
      return fallbackResponse.data;
    }
    throw err;
  }
}

export const changeStaffPasswordProvider = changePasswordApi;

/**
 * Update notification toggles
 * PUT /api/profile/notification-settings
 * Allowed keys: twoFactorAuth, emailNotification, smsNotification,
 * dashboardNotifications, weeklyEmailReports, systemAlerts, loginAlertsViaMail
 */
export async function updateNotificationSettingsApi(
  payload: UpdateNotificationSettingsRequest
): Promise<NotificationSettings> {
  const response = await apiClient.put<
    UpdateNotificationSettingsApiResponse | NotificationSettings
  >("/api/profile/notification-settings", payload);

  const raw = response.data as any;
  const notificationSettings = (raw?.data?.notificationSettings ||
    raw?.notificationSettings ||
    raw?.data ||
    raw) as NotificationSettings;

  return notificationSettings;
}
