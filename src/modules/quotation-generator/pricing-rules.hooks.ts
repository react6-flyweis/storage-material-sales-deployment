import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPricingRulesProvider,
  updatePricingRulesProvider,
  type PricingRulesData,
} from "./pricing-rules.api";

export function usePricingRulesQuery() {
  return useQuery({
    queryKey: ["sales", "pricing-rules"],
    queryFn: getPricingRulesProvider,
  });
}

export function useUpdatePricingRulesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PricingRulesData) =>
      updatePricingRulesProvider(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["sales", "pricing-rules"],
      });
    },
  });
}
