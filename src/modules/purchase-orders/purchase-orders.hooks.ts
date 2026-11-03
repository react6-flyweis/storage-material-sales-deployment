import { useQuery } from "@tanstack/react-query";
import { getPurchaseOrdersProvider } from "./purchase-orders.api";

export function usePurchaseOrdersQuery(page = 1, limit = 20, businessUnit?: string) {
  return useQuery({
    queryKey: ["sales", "po-orders", page, limit, businessUnit],
    queryFn: () => getPurchaseOrdersProvider(page, limit, businessUnit),
  });
}
