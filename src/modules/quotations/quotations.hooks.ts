import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createQuotationProvider,
  getQuotationsProvider,
  type CreateQuotationPayload,
} from "./quotations.api";

export function useQuotationsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["sales", "quotations", page, limit],
    queryFn: () => getQuotationsProvider(page, limit),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuotationPayload) =>
      createQuotationProvider(payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
    },
  });
}
