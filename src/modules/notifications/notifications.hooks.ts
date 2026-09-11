import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNotificationsProvider,
  getUnreadCountProvider,
  markNotificationReadProvider,
  markAllNotificationsReadProvider,
  deleteNotificationProvider,
} from "./notifications.api";
import type { NotificationsQueryParams } from "./notifications.types";

export function useNotificationsQuery(
  params?: NotificationsQueryParams,
  options?: { refetchInterval?: number; enabled?: boolean }
) {
  return useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: () => getNotificationsProvider(params),
    refetchInterval: options?.refetchInterval ?? 15000,
    enabled: options?.enabled ?? true,
  });
}

export function useUnreadNotificationCountQuery(options?: {
  refetchInterval?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await getUnreadCountProvider();
      if (typeof res?.data === "number") {
        return res.data;
      }
      return res?.data?.count ?? 0;
    },
    refetchInterval: options?.refetchInterval ?? 10000,
    enabled: options?.enabled ?? true,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationReadProvider(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsReadProvider(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotificationProvider(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
