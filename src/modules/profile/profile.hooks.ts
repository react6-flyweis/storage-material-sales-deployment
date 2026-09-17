import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStaffProfileProvider,
  updateStaffProfileProvider,
  changeStaffPasswordProvider,
} from "./profile.api";
import type {
  UpdateStaffProfilePayload,
  ChangePasswordPayload,
} from "./profile.types";
import { useAuthStore } from "@/modules/auth/auth.store";

export const PROFILE_QUERY_KEY = ["profile", "staff"] as const;

export function useStaffProfileQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getStaffProfileProvider,
    enabled: options?.enabled ?? true,
  });
}

export function useUpdateStaffProfileMutation() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (payload: UpdateStaffProfilePayload) =>
      updateStaffProfileProvider(payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      const updatedProfile = response?.data?.profile;
      if (updatedProfile) {
        updateUser({
          name: updatedProfile.name,
          email: updatedProfile.email,
          role: updatedProfile.role,
        });
      }
    },
  });
}

export function useChangeStaffPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      changeStaffPasswordProvider(payload),
  });
}
