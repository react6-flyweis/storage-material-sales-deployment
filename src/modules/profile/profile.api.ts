import { apiClient } from "@/modules/auth/auth.api";
import type {
  StaffProfileResponse,
  UpdateStaffProfilePayload,
  UpdateStaffProfileResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
} from "./profile.types";

export async function getStaffProfileProvider(): Promise<StaffProfileResponse> {
  const response = await apiClient.get<StaffProfileResponse>("/api/profile");
  return response.data;
}

export async function updateStaffProfileProvider(
  payload: UpdateStaffProfilePayload
): Promise<UpdateStaffProfileResponse> {
  const response = await apiClient.put<UpdateStaffProfileResponse>(
    "/api/profile",
    payload
  );
  return response.data;
}

export async function changeStaffPasswordProvider(
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> {
  const response = await apiClient.put<ChangePasswordResponse>(
    "/api/profile/password",
    payload
  );
  return response.data;
}
