import axios from "axios";

type ApiErrorData = {
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError<ApiErrorData>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
