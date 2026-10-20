import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getCalendarApi,
  getDeliveriesApi,
  getDeliveryDetailsApi,
  downloadDeliveryPackingListApi,
  downloadDeliveryBillOfLadingApi,
  getCalendarProjectsApi,
} from "./calendar.api";
import type { CalendarQueryParams, DeliveriesQueryParams } from "./calendar.types";

export function useCalendarDeliveries(params: CalendarQueryParams) {
  return useQuery({
    queryKey: [
      "calendar-deliveries",
      params.month,
      params.year,
      params.leadId,
      params.projectId,
    ],
    queryFn: () => getCalendarApi(params),
  });
}

export function useCalendarProjectDeliveries(params?: DeliveriesQueryParams) {
  const isEnabled = Boolean(params?.projectId || params?.leadId);
  return useQuery({
    queryKey: ["calendar-project-deliveries", params?.projectId, params?.leadId],
    queryFn: () =>
      getDeliveriesApi({
        projectId: params?.projectId,
        leadId: params?.leadId,
        limit: 100,
        sortBy: "DeliveryDate",
      }),
    enabled: isEnabled,
  });
}

export function useDeliveryDetails(deliveryId?: string | null, open = true) {
  return useQuery({
    queryKey: ["delivery-details", deliveryId],
    queryFn: () => getDeliveryDetailsApi(deliveryId!),
    enabled: Boolean(open && deliveryId),
  });
}

export function useCalendarProjects(hasDelivery = false) {
  return useQuery({
    queryKey: ["calendar-projects-selector-list", hasDelivery],
    queryFn: () => getCalendarProjectsApi({ page: 1, limit: 100, hasDelivery }),
  });
}

export function useDownloadPackingListMutation(deliveryId?: string | null) {
  return useMutation({
    mutationFn: () => downloadDeliveryPackingListApi(deliveryId!),
    onSuccess: (res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PackingList_${deliveryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useDownloadBillOfLadingMutation(deliveryId?: string | null) {
  return useMutation({
    mutationFn: () => downloadDeliveryBillOfLadingApi(deliveryId!),
    onSuccess: (res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BillOfLading_${deliveryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
