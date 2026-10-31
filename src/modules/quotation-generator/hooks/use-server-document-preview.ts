import { useState, useEffect, useCallback, useRef } from "react";
import {
  previewDocumentProvider,
  type PreviewDocumentRequest,
  type PreviewDocumentResponseData,
} from "../estimates.api";
import { getCustomQuoteDocumentPreviewProvider } from "../custom-quotes.api";

export interface UseServerDocumentPreviewOptions {
  payload: PreviewDocumentRequest | null;
  enabled?: boolean;
  debounceMs?: number;
}

export interface UseServerDocumentPreviewResult {
  assembledHtml: string | null;
  quoteHtml: string | null;
  sowHtml: string | null;
  contractHtml: string | null;
  html: string | null; // Defaults to assembledHtml, or whichever section html is available
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  data: PreviewDocumentResponseData | null;
}

export function useServerDocumentPreview({
  payload,
  enabled = true,
  debounceMs = 300,
}: UseServerDocumentPreviewOptions): UseServerDocumentPreviewResult {
  const [data, setData] = useState<PreviewDocumentResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const payloadJson = payload ? JSON.stringify(payload) : null;
  const lastFetchedJsonRef = useRef<string | null>(null);

  const fetchPreview = useCallback(async (forcedPayload?: PreviewDocumentRequest) => {
    const activePayload = forcedPayload || payloadRef.current;
    if (!enabled || !activePayload) {
      return;
    }

    const isCustom = Boolean(
      activePayload.quoteKind === "custom" ||
      activePayload.jobType?.toUpperCase() === "CUSTOM" ||
      activePayload.customQuoteId
    );
    const targetCustomId = activePayload.customQuoteId || activePayload.estimateId;

    if (isCustom && targetCustomId) {
      const currentReqId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const customRes = await getCustomQuoteDocumentPreviewProvider(
          targetCustomId,
          activePayload.companyBrand
        );
        if (currentReqId !== requestIdRef.current) return;
        if (customRes?.html) {
          lastFetchedJsonRef.current = JSON.stringify(activePayload);
          setData({
            assembledHtml: customRes.html,
            quoteHtml: customRes.html,
            sowHtml: null,
            contractHtml: null,
          });
        } else {
          setError("No HTML content returned for custom quote preview.");
          setData(null);
        }
      } catch (err: unknown) {
        if (currentReqId !== requestIdRef.current) return;
        const errMsg =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              "Failed to load custom quote preview from server.";
        setError(errMsg);
      } finally {
        if (currentReqId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
      return;
    }

    // Must have either estimateId, pricingResult, storagePricingResult, or fullQuote
    const hasPricingContext = Boolean(
      activePayload.estimateId ||
      activePayload.pricingResult ||
      activePayload.storagePricingResult ||
      activePayload.storagePricing ||
      activePayload.fullQuote
    );

    if (!hasPricingContext) {
      setData(null);
      setError("Please compute pricing or select an estimate to load the document preview.");
      setIsLoading(false);
      return;
    }

    const currentReqId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await previewDocumentProvider(activePayload);

      // Check if this request is still the freshest
      if (currentReqId !== requestIdRef.current) return;

      const resData = res.data || res;
      const assembled = resData?.assembledHtml || res?.assembledHtml || null;
      const quote = resData?.quoteHtml || res?.quoteHtml || null;
      const sow = resData?.sowHtml || res?.sowHtml || null;
      const contract = resData?.contractHtml || res?.contractHtml || null;

      if (!res.success && res.message && !assembled && !quote && !sow && !contract) {
        setError(res.message);
        setData(null);
      } else {
        lastFetchedJsonRef.current = JSON.stringify(activePayload);
        setData({
          assembledHtml: assembled,
          quoteHtml: quote,
          sowHtml: sow,
          contractHtml: contract,
        });
      }
    } catch (err: unknown) {
      if (currentReqId !== requestIdRef.current) return;
      const errMsg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to load preview from server. Please check pricing data and try again.";
      setError(errMsg);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !payloadJson) {
      return;
    }

    // Avoid refetching identical payload
    if (payloadJson === lastFetchedJsonRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      fetchPreview();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [payloadJson, enabled, debounceMs, fetchPreview]);

  const handleRefetch = useCallback(async () => {
    lastFetchedJsonRef.current = null;
    await fetchPreview();
  }, [fetchPreview]);

  const assembledHtml = data?.assembledHtml || null;
  const quoteHtml = data?.quoteHtml || null;
  const sowHtml = data?.sowHtml || null;
  const contractHtml = data?.contractHtml || null;

  // The primary HTML is assembledHtml (which includes stylesheet).
  // If assembledHtml is absent, fallback to the available section fragment.
  const html = assembledHtml || quoteHtml || sowHtml || contractHtml;

  return {
    assembledHtml,
    quoteHtml,
    sowHtml,
    contractHtml,
    html,
    isLoading,
    error,
    refetch: handleRefetch,
    data,
  };
}
