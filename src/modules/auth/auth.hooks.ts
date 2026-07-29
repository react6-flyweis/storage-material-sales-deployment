import { useMutation } from "@tanstack/react-query";
import {
  loginProvider,
  logoutProvider,
  forgotPasswordProvider,
  verifyOtpProvider,
  resetPasswordProvider,
} from "./auth.api";
import { useAuthStore } from "./auth.store";
import type {
  LoginRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
} from "./auth.types";

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

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => forgotPasswordProvider(payload),
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (payload: VerifyOtpRequest) => verifyOtpProvider(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetPasswordProvider(payload),
  });
}

