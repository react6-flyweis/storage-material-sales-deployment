import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getQuotationsProvider } from "./quotations.api";

export function useQuotationsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["sales", "quotations", page, limit],
    queryFn: () => getQuotationsProvider(page, limit),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
