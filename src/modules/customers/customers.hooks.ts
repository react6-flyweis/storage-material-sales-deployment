import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAdminCustomerDetailProvider,
  getAdminCustomersProvider,
  getSalesCustomerDetailProvider,
  getSalesCustomerProjectsProvider,
  getSalesCustomersProvider,
} from "./customers.api";

export function useCustomersQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["customers", "admin-list", page, limit],
    queryFn: () => getAdminCustomersProvider(page, limit),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCustomerDetailQuery(customerId: string) {
  return useQuery({
    queryKey: ["customers", "admin-detail", customerId],
    queryFn: () => getAdminCustomerDetailProvider(customerId),
    staleTime: 60 * 1000,
    enabled: Boolean(customerId),
  });
}

export function useSalesCustomersQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["customers", "list", page, limit],
    queryFn: () => getSalesCustomersProvider(page, limit),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useSalesCustomerDetailQuery(customerId: string) {
  return useQuery({
    queryKey: ["customers", "sales-detail", customerId],
    queryFn: () => getSalesCustomerDetailProvider(customerId),
    staleTime: 60 * 1000,
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
    staleTime: 60 * 1000,
    enabled: Boolean(customerId) && customerId !== "unknown",
    placeholderData: keepPreviousData,
  });
}
