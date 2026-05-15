import { useMutation } from "@tanstack/react-query";
import { loginProvider, logoutProvider } from "./auth.api";
import { useAuthStore } from "./auth.store";
import type { LoginRequest } from "./auth.types";

export function useLoginMutation() {
  const setLoginData = useAuthStore((state) => state.setLoginData);

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginProvider(payload),
    onSuccess: (response) => {
      if (response.success) {
        setLoginData(response.data);
      }
    },
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => logoutProvider(),
    onSuccess: () => {
      logout();
    },
  });
}
