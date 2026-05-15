import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, LoginResponse } from "./auth.types";

const AUTH_STORAGE_KEY = "steel-admin-auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  setLoginData: (payload: LoginResponse["data"]) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      user: null,
      isHydrated: false,
      setLoginData: (payload) => {
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          role: payload.role,
          user: payload.user,
        });
      },
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      logout: () => {
        set({ accessToken: null, refreshToken: null, role: null, user: null });
      },
      setHydrated: (value) => {
        set({ isHydrated: value });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

export function getRefreshToken() {
  return useAuthStore.getState().refreshToken;
}
