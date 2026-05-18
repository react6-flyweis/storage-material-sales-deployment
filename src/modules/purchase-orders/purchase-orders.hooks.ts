import { useQuery } from "@tanstack/react-query";
import { getPurchaseOrdersProvider } from "./purchase-orders.api";

export function usePurchaseOrdersQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["sales", "po-orders", page, limit],
    queryFn: () => getPurchaseOrdersProvider(page, limit),
    staleTime: 60 * 1000,
  });
}
