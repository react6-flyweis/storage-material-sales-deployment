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
  getCustomerDocumentsProvider,
  createCustomerDocumentProvider,
  deleteCustomerDocumentProvider,
  createBasicCustomerProvider,
  updateSalesCustomerProvider,
  type UpdateSalesCustomerRequest,
  type CreateCustomerDocumentPayload,
  type CreateSalesCustomerProjectPayload,
  type CreateBasicCustomerRequest,
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
  businessUnit?: string,
) {
  return useQuery({
    queryKey: ["customers", "sales-projects", customerId, page, limit, businessUnit],
    queryFn: () => getSalesCustomerProjectsProvider(customerId, page, limit, businessUnit),
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

export function useCustomerDocumentsQuery(customerId: string) {
  return useQuery({
    queryKey: ["customers", "documents", customerId],
    queryFn: () => getCustomerDocumentsProvider(customerId),
    enabled: Boolean(customerId) && customerId !== "unknown",
  });
}

export function useCreateCustomerDocumentMutation(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerDocumentPayload) =>
      createCustomerDocumentProvider(customerId, payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["customers", "documents", customerId],
      });
    },
  });
}

export function useDeleteCustomerDocumentMutation(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) =>
      deleteCustomerDocumentProvider(customerId, docId),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["customers", "documents", customerId],
      });
    },
  });
}

export function useCreateBasicCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBasicCustomerRequest) =>
      createBasicCustomerProvider(payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}



export function useUpdateSalesCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      payload,
    }: {
      customerId: string;
      payload: UpdateSalesCustomerRequest;
    }) => updateSalesCustomerProvider(customerId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    },
  });
}
