import { useState, useEffect, useCallback, useRef } from "react";
import {
  previewDocumentProvider,
  type PreviewDocumentRequest,
  type PreviewDocumentResponseData,
} from "../estimates.api";

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
  const payloadJson = payload ? JSON.stringify(payload) : null;

  const fetchPreview = useCallback(async () => {
    if (!enabled || !payload) {
      return;
    }

    // Must have either estimateId, pricingResult, storagePricingResult, or fullQuote
    const hasPricingContext = Boolean(
      payload.estimateId ||
      payload.pricingResult ||
      payload.storagePricingResult ||
      payload.storagePricing ||
      payload.fullQuote
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
      const res = await previewDocumentProvider(payload);

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
  }, [enabled, payload]);

  useEffect(() => {
    if (!enabled || !payloadJson) {
      return;
    }

    const timer = setTimeout(() => {
      fetchPreview();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [payloadJson, enabled, debounceMs, fetchPreview]);

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
    refetch: fetchPreview,
    data,
  };
}
