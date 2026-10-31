import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEstimateByIdProvider,
  getEstimatesListProvider,
  getHistorySummaryProvider,
  deleteEstimateProvider,
  type SaveEstimatePayload,
  type GetEstimatesParams,
  type EstimatesListResponse,
  type HistorySummaryResponse,
  type CompanyBrand,
} from "./estimates.api";
import {
  getCustomQuoteByIdProvider,
  type CustomQuoteRecord,
} from "./custom-quotes.api";

function toConversionWorkflowStatus(
  status?: string | null,
): "draft" | "pending_approval" | "approved" | "rejected" | "sent" | null {
  if (!status) return "draft";
  const s = status.toLowerCase();
  if (s === "approved") return "approved";
  if (s === "pending_approval" || s === "pending") return "pending_approval";
  if (s === "rejected" || s.includes("rejected")) return "rejected";
  if (s === "sent") return "sent";
  return "draft";
}

/**
 * Normalizes an estimate or custom quote record into a unified SaveEstimatePayload.
 */
export async function fetchEstimateOrCustomQuote(
  id: string,
): Promise<SaveEstimatePayload> {
  try {
    const res = await getEstimateByIdProvider(id);
    const fetchedData = res.data || res;
    let est: SaveEstimatePayload;
    if ((fetchedData as { estimate?: SaveEstimatePayload })?.estimate) {
      est = (fetchedData as { estimate: SaveEstimatePayload }).estimate;
    } else {
      est = fetchedData as SaveEstimatePayload;
    }

    const isCustomEstimate = Boolean(
      est.quoteKind === "custom" ||
      (est as Record<string, unknown>)?.kind === "custom" ||
      est.jobType?.toUpperCase() === "CUSTOM" ||
      (est as Record<string, unknown>)?.customQuote,
    );

    if (isCustomEstimate) {
      try {
        const customQuote = await getCustomQuoteByIdProvider(id);
        if (customQuote?._id) {
          return {
            ...est,
            _id: customQuote._id,
            id: customQuote._id,
            quoteKind: "custom",
            jobType: "Custom",
            leadId: customQuote.leadId || est.leadId,
            leadCompanyName: customQuote.customer || est.leadCompanyName,
            cityStateZip: customQuote.location || est.cityStateZip,
            buildingSize: customQuote.size || est.buildingSize,
            grandTotal: customQuote.sell ?? est.grandTotal,
            totalSell: customQuote.sell ?? est.totalSell,
            profit: customQuote.profit ?? est.profit,
            marginPercent: customQuote.profPct ?? est.marginPercent,
            companyBrand: (customQuote.company === "SBD" ? "SBD" : "SM") as CompanyBrand,
            workflowStatus: customQuote.workflowStatus || est.workflowStatus || "draft",
            conversion: customQuote.quotationId
              ? {
                  isConvertedToQuotation: true,
                  quotationId: customQuote.quotationId,
                  quoteNumber: customQuote.quoteNumber || est.conversion?.quoteNumber || null,
                  workflowStatus: toConversionWorkflowStatus(customQuote.workflowStatus),
                  quotationStatus: est.conversion?.quotationStatus ?? null,
                  approvalStatus: est.conversion?.approvalStatus ?? "not_submitted",
                  convertedAt: est.conversion?.convertedAt ?? null,
                }
              : est.conversion,
            customQuote,
          };
        }
      } catch {
        // Fall back to original estimate
      }
    }

    return est;
  } catch (err) {
    // If standard estimate fetch fails, check if ID belongs to custom quote
    try {
      const customQuote = await getCustomQuoteByIdProvider(id);
      if (customQuote?._id) {
        return {
          _id: customQuote._id,
          id: customQuote._id,
          quoteKind: "custom",
          jobType: "Custom",
          leadId: customQuote.leadId,
          leadCompanyName: customQuote.customer,
          cityStateZip: customQuote.location,
          buildingSize: customQuote.size,
          grandTotal: customQuote.sell,
          totalSell: customQuote.sell,
          profit: customQuote.profit,
          marginPercent: customQuote.profPct,
          scope: (customQuote.scope as any) || "Both",
          companyBrand: (customQuote.company === "SBD" ? "SBD" : "SM") as CompanyBrand,
          workflowStatus: customQuote.workflowStatus || "draft",
          conversion: customQuote.quotationId
            ? {
                isConvertedToQuotation: true,
                quotationId: customQuote.quotationId,
                quoteNumber: customQuote.quoteNumber || null,
                workflowStatus: toConversionWorkflowStatus(customQuote.workflowStatus),
                quotationStatus: null,
                approvalStatus: "not_submitted",
                convertedAt: null,
              }
            : undefined,
          customQuote,
        };
      }
    } catch {
      // Re-throw original error
    }
    throw err;
  }
}

/**
 * Hook to fetch estimate details (with automatic custom-quote resolution and refetch on focus).
 */
export function useEstimateDetailQuery(id?: string, options?: { enabled?: boolean }) {
  return useQuery<SaveEstimatePayload>({
    queryKey: ["sales", "estimate-detail", id],
    queryFn: () => {
      if (!id) throw new Error("Estimate ID is required");
      return fetchEstimateOrCustomQuote(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

/**
 * Hook to fetch the estimates list with pagination and search.
 */
export function useEstimatesListQuery(
  params?: number | GetEstimatesParams,
  options?: { enabled?: boolean },
) {
  return useQuery<EstimatesListResponse>({
    queryKey: ["sales", "estimates", params],
    queryFn: () => getEstimatesListProvider(params),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch quotation history library summary.
 */
export function useHistorySummaryQuery(options?: { enabled?: boolean }) {
  return useQuery<HistorySummaryResponse>({
    queryKey: ["sales", "estimates", "summary"],
    queryFn: getHistorySummaryProvider,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch custom quote record by ID.
 */
export function useCustomQuoteDetailQuery(
  id?: string,
  options?: { enabled?: boolean },
) {
  return useQuery<CustomQuoteRecord | null>({
    queryKey: ["sales", "custom-quote", id],
    queryFn: () => {
      if (!id) return null;
      return getCustomQuoteByIdProvider(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

/**
 * Mutation hook to delete an estimate.
 */
export function useDeleteEstimateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEstimateProvider(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sales", "estimates"] });
    },
  });
}

