import axios from "axios";

type ApiErrorData = {
  message?: string;
  error?: string;
  msg?: string;
  errors?: { msg?: string; path?: string }[];
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError<ApiErrorData | string>(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }
    if (data && typeof data === "object") {
      const firstFieldError = Array.isArray(data.errors)
        ? data.errors.find((e) => e?.msg)?.msg
        : undefined;
      if (data.message === "Validation failed" && firstFieldError) {
        return firstFieldError;
      }
      const message = data.message || data.error || data.msg;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
