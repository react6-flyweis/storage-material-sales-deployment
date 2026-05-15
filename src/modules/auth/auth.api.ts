import axios from "axios";
import { getAccessToken, getRefreshToken, useAuthStore } from "./auth.store";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
} from "./auth.types";

const FALLBACK_BASE_URL = "https://mr-storage-backend.vercel.app";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? FALLBACK_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? FALLBACK_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshPayload: RefreshTokenRequest = { refreshToken };
      const refreshResponse = await refreshClient.post<RefreshTokenResponse>(
        "/api/auth/refresh",
        refreshPayload,
      );

      const nextAccessToken = refreshResponse.data.data.accessToken;
      useAuthStore.getState().setAccessToken(nextAccessToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      };

      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  },
);

export async function loginProvider(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>(
    "/api/auth/login",
    payload,
  );

  return response.data;
}

export async function logoutProvider() {
  const response = await apiClient.post<LogoutResponse>("/api/auth/logout");

  return response.data;
}
