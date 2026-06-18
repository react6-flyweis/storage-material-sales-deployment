import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createSalesCustomerProjectProvider,
  getAdminCustomerDetailProvider,
  getAdminCustomersProvider,
  getSalesCustomerDetailProvider,
  getSalesCustomerProjectsProvider,
  getSalesCustomersProvider,
  type CreateSalesCustomerProjectPayload,
} from "./customers.api";

export function useCustomersQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["customers", "admin-list", page, limit],
    queryFn: () => getAdminCustomersProvider(page, limit),
  });
}

export function useCustomerDetailQuery(customerId: string) {
  return useQuery({
    queryKey: ["customers", "admin-detail", customerId],
    queryFn: () => getAdminCustomerDetailProvider(customerId),
    enabled: Boolean(customerId),
  });
}

export function useSalesCustomersQuery(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ["customers", "list", page, limit, search],
    queryFn: () => getSalesCustomersProvider(page, limit, search),
  });
}

export function useSalesCustomerDetailQuery(customerId: string) {
  return useQuery({
    queryKey: ["customers", "sales-detail", customerId],
    queryFn: () => getSalesCustomerDetailProvider(customerId),
    enabled: Boolean(customerId) && customerId !== "unknown",
  });
}

export function useSalesCustomerProjectsQuery(
  customerId: string,
  page = 1,
  limit = 20,
) {
  return useQuery({
    queryKey: ["customers", "sales-projects", customerId, page, limit],
    queryFn: () => getSalesCustomerProjectsProvider(customerId, page, limit),
    enabled: Boolean(customerId) && customerId !== "unknown",
  });
}

export function useCreateSalesCustomerProjectMutation(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalesCustomerProjectPayload) =>
      createSalesCustomerProjectProvider(customerId, payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["customers", "sales-projects", customerId],
      });
    },
  });
}
