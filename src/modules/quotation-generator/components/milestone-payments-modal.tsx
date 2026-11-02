import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Printer,
  X,
  Plus,
  Loader2,
  Check,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  type SaveEstimatePayload,
  type MilestoneRowPayload,
  type SaveEstimateMilestonesResponseData,
  type MilestonesPreviewData,
  previewMilestonesProvider,
  saveEstimateMilestonesProvider,
  downloadMilestonesPdfProvider,
} from "../estimates.api";
import {
  useEstimateMilestonesQuery,
  useSaveEstimateMilestonesMutation,
} from "../estimates.hooks";
import { downloadPdfFromBase64 } from "../utils/pdf-download";

interface MilestoneItem {
  id: string;
  name: string;
  type: "%" | "$";
  value: number;
}

interface MilestonePaymentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: SaveEstimatePayload | null;
  onSuccess?: (res?: SaveEstimateMilestonesResponseData) => void;
}

function MilestoneModalSkeleton() {
  return (
    <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-white">
      {/* Customer & Location Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="h-3 w-16 bg-slate-200 animate-pulse rounded-xs" />
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded-md" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-16 bg-slate-200 animate-pulse rounded-xs" />
          <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-md" />
        </div>
      </div>

      {/* TOTAL CONTRACT VALUE Banner Card Skeleton */}
      <div className="bg-[#faf5ff] border border-purple-200/80 rounded-xl p-4 flex items-center justify-between animate-pulse">
        <div className="h-3.5 w-36 bg-purple-200 rounded-md" />
        <div className="h-8 w-32 bg-purple-200 rounded-md" />
      </div>

      {/* Rows Skeleton (3 items) */}
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-xl p-2.5 flex items-center gap-2.5 bg-slate-50/50 animate-pulse"
          >
            <div className="h-9 bg-slate-200 rounded-md flex-1" />
            <div className="h-9 w-20 bg-slate-200 rounded-md shrink-0" />
            <div className="h-5 w-24 bg-slate-200 rounded-md shrink-0" />
            <div className="h-5 w-5 bg-slate-200 rounded-md shrink-0" />
          </div>
        ))}
      </div>

      {/* Action buttons placeholder */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 border border-dashed border-slate-200 rounded-xl bg-slate-50 animate-pulse" />
        <div className="h-10 border border-dashed border-slate-200 rounded-xl bg-slate-50 animate-pulse" />
      </div>

      {/* Progress Box Skeleton */}
      <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 bg-slate-50/80 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
          <div className="h-4 w-24 bg-slate-200 rounded-md" />
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full" />
        <div className="flex items-center justify-between pt-0.5">
          <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
          <div className="h-4 w-20 bg-slate-200 rounded-md" />
        </div>
      </div>

      {/* Notes Skeleton */}
      <div className="space-y-1.5">
        <div className="h-3 w-24 bg-slate-200 animate-pulse rounded-xs" />
        <div className="h-14 bg-slate-100 border border-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function MilestonePaymentsContent({
  quote,
  onOpenChange,
  onSuccess,
}: {
  quote: SaveEstimatePayload | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (res?: SaveEstimateMilestonesResponseData) => void;
}) {
  const initialCustomer =
    quote?.leadCompanyName ||
    quote?.extractedDrawingFields?.customer ||
    quote?.jobNumber ||
    "Estimate Customer";

  const initialLocation =
    quote?.cityStateZip || quote?.streetAddress || "Location N/A";

  const pricingRes = (quote?.pricingResult || quote?.storagePricingResult) as
    | Record<string, unknown>
    | undefined;
  const fullQuote = quote?.fullQuoteResult as
    | Record<string, unknown>
    | undefined;
  const storageRes = quote?.storagePricingResult as
    | Record<string, unknown>
    | undefined;
  const rawTotal =
    Number(
      quote?.grandTotal ??
        fullQuote?.grandTotal ??
        storageRes?.grandTotal ??
        pricingRes?.grandTotal ??
        quote?.totalSell ??
        pricingRes?.totSell,
    ) || 0;

  const initialTerms = quote?.depositTerms as
    | Record<string, unknown>
    | undefined;
  const initialDepositType: "%" | "$" =
    initialTerms?.flat != null && Number(initialTerms.flat) > 0 ? "$" : "%";
  const initialDepositVal: number =
    initialTerms?.flat != null && Number(initialTerms.flat) > 0
      ? Number(initialTerms.flat)
      : initialTerms?.pct != null && Number(initialTerms.pct) > 0
        ? Number(initialTerms.pct)
        : 30;

  const [customer] = useState(initialCustomer);
  const [location] = useState(initialLocation);
  const [totalContractValue, setTotalContractValue] =
    useState<number>(rawTotal);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      id: "1",
      name: "Deposit",
      type: initialDepositType,
      value: initialDepositVal,
    },
  ]);
  const [notes, setNotes] = useState(quote?.milestoneNote || "");
  const [isPrinting, setIsPrinting] = useState(false);
  const [previewData, setPreviewData] = useState<MilestonesPreviewData | null>(
    null,
  );
  const [serverFullyScheduled, setServerFullyScheduled] = useState<
    boolean | null
  >(null);

  // React Query: Fetch estimate milestone preview/history on open
  const { data: initialPreview, isLoading: isLoadingInitial } =
    useEstimateMilestonesQuery(quote?._id);
  const saveMutation = useSaveEstimateMilestonesMutation();
  const isSaving = saveMutation.isPending;

  // Sync total contract value when raw total changes (e.g. tax toggle on quote)
  useEffect(() => {
    if (rawTotal > 0 && !quote?._id) {
      setTotalContractValue(rawTotal);
    }
  }, [rawTotal, quote?._id]);

  // Hydrate modal state when React Query preview loads
  useEffect(() => {
    if (!initialPreview) {
      const existingSchedule = quote?.milestoneSchedule || quote?.milestones;
      if (Array.isArray(existingSchedule) && existingSchedule.length > 0) {
        setMilestones(
          existingSchedule.map((row, idx) => {
            const isPct =
              row.type === "pct" || row.type === "percent" || row.pct != null;
            return {
              id: String(idx + 1),
              name: row.label || `Milestone #${idx + 1}`,
              type: isPct ? "%" : "$",
              value: isPct ? Number(row.pct ?? 0) : Number(row.amount ?? 0),
            };
          }),
        );
      }
      return;
    }

    if (typeof initialPreview.grand === "number" && initialPreview.grand > 0) {
      setTotalContractValue(initialPreview.grand);
    }

    setPreviewData(initialPreview);

    const backendRows =
      initialPreview.rows ||
      initialPreview.milestones ||
      initialPreview.milestoneSchedule;
    if (Array.isArray(backendRows) && backendRows.length > 0) {
      setMilestones(
        backendRows.map((row, idx) => {
          const isPct =
            row.type === "pct" || row.type === "percent" || row.pct != null;
          return {
            id: String(idx + 1),
            name: row.label || `Milestone #${idx + 1}`,
            type: isPct ? "%" : "$",
            value: isPct ? Number(row.pct ?? 0) : Number(row.amount ?? 0),
          };
        }),
      );
    } else if (
      Array.isArray(quote?.milestoneSchedule) &&
      quote.milestoneSchedule.length > 0
    ) {
      setMilestones(
        quote.milestoneSchedule.map((row, idx) => {
          const isPct =
            row.type === "pct" || row.type === "percent" || row.pct != null;
          return {
            id: String(idx + 1),
            name: row.label || `Milestone #${idx + 1}`,
            type: isPct ? "%" : "$",
            value: isPct ? Number(row.pct ?? 0) : Number(row.amount ?? 0),
          };
        }),
      );
    }

    if (initialPreview.milestoneNote) {
      setNotes(initialPreview.milestoneNote);
    } else if (quote?.milestoneNote) {
      setNotes(quote.milestoneNote);
    }

    if (typeof initialPreview.fullyScheduled === "boolean") {
      setServerFullyScheduled(initialPreview.fullyScheduled);
    }
  }, [
    initialPreview,
    quote?.milestoneSchedule,
    quote?.milestones,
    quote?.milestoneNote,
  ]);

  // Client-side mirror calculation (matching depositMilestoneEngine.js to absorb penny drift)
  const clientMirror = useMemo(() => {
    const rawItems = milestones.map((m) => {
      const val = Number(m.value) || 0;
      const amount =
        m.type === "%"
          ? Math.round((totalContractValue * val) / 100)
          : Math.round(val);
      return { ...m, amount };
    });

    const sumAmounts = rawItems.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = totalContractValue - sumAmounts;
    let isAdjusted = false;

    // Mirror depositMilestoneEngine.js: absorb up to +/- $1 penny drift on last row
    if (remaining !== 0 && Math.abs(remaining) <= 1 && rawItems.length > 0) {
      const lastIdx = rawItems.length - 1;
      rawItems[lastIdx] = {
        ...rawItems[lastIdx],
        amount: Math.max(0, rawItems[lastIdx].amount + remaining),
      };
      isAdjusted = true;
    }

    const totalScheduled = rawItems.reduce((acc, curr) => acc + curr.amount, 0);
    const unscheduledBalance = totalContractValue - totalScheduled;
    const percentScheduled =
      totalContractValue > 0 ? (totalScheduled / totalContractValue) * 100 : 0;

    return {
      items: rawItems,
      totalScheduled,
      unscheduledBalance,
      percentScheduled,
      isAdjusted,
    };
  }, [milestones, totalContractValue]);

  // Use server preview amounts when available and row count matches, otherwise client mirror
  const displayItems = useMemo(() => {
    const serverRows =
      previewData?.rows ||
      previewData?.milestones ||
      previewData?.milestoneSchedule;
    if (
      Array.isArray(serverRows) &&
      serverRows.length === milestones.length &&
      !isLoadingInitial
    ) {
      return milestones.map((m, idx) => {
        const sRow = serverRows[idx];
        const serverAmount =
          sRow?.amount != null && !isNaN(Number(sRow.amount))
            ? Number(sRow.amount)
            : (clientMirror.items[idx]?.amount ?? 0);
        return {
          ...m,
          amount: serverAmount,
        };
      });
    }
    return clientMirror.items;
  }, [milestones, previewData, clientMirror, isLoadingInitial]);

  const hasMatchingPreview =
    Boolean(previewData) &&
    ((Array.isArray(previewData?.rows) &&
      previewData.rows.length === milestones.length) ||
      (Array.isArray(previewData?.milestones) &&
        previewData.milestones.length === milestones.length) ||
      (Array.isArray(previewData?.milestoneSchedule) &&
        previewData.milestoneSchedule.length === milestones.length));

  const totalScheduled =
    hasMatchingPreview && typeof previewData?.scheduled === "number"
      ? previewData.scheduled
      : clientMirror.totalScheduled;

  const unscheduledBalance =
    hasMatchingPreview && typeof previewData?.remaining === "number"
      ? previewData.remaining
      : clientMirror.unscheduledBalance;

  const percentScheduled =
    hasMatchingPreview && typeof previewData?.pct === "number"
      ? previewData.pct
      : clientMirror.percentScheduled;

  // Percentage & Scheduled Validations (replaces strict browser-only sum)
  const sumOfPctRows = milestones.reduce(
    (sum, m) => sum + (m.type === "%" ? Number(m.value) || 0 : 0),
    0,
  );

  const isServerFullyScheduled =
    hasMatchingPreview && previewData?.fullyScheduled === true;

  const isWithinTolerance =
    Math.abs(unscheduledBalance) <= 1 &&
    Math.abs(totalScheduled - totalContractValue) <= 1;

  const isPercentOver100 = sumOfPctRows > 100.01;

  const isFullyScheduled =
    !isPercentOver100 &&
    (isServerFullyScheduled ||
      serverFullyScheduled ||
      (isWithinTolerance && sumOfPctRows <= 100.01));

  const isOverScheduled =
    totalContractValue > 0 &&
    !isFullyScheduled &&
    (isPercentOver100 ||
      Math.abs(unscheduledBalance) > 1 ||
      totalScheduled > totalContractValue + 1);

  const isOverPercentage =
    !isFullyScheduled && (percentScheduled > 100.01 || isPercentOver100);
  const overScheduledAmount = Math.max(0, totalScheduled - totalContractValue);
  const overScheduledPct = Math.max(0, percentScheduled - 100);

  const hasEmptyNames = milestones.some((m) => !m.name.trim());
  const hasZeroOrNegativeValues = milestones.some((m) => Number(m.value) <= 0);
  const hasOver100PctRow = milestones.some(
    (m) => m.type === "%" && Number(m.value) > 100,
  );
  const hasValidationErrors =
    isOverScheduled ||
    isOverPercentage ||
    hasEmptyNames ||
    hasZeroOrNegativeValues ||
    hasOver100PctRow;

  // Debounced server preview sync for live validation (~300ms)
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isLoadingInitial || totalContractValue <= 0 || milestones.length === 0)
      return;

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }

    previewTimerRef.current = setTimeout(async () => {
      try {
        const rowsPayload: MilestoneRowPayload[] = milestones.map((m) => ({
          label: m.name,
          type: m.type === "%" ? "pct" : "fixed",
          pct: m.type === "%" ? Number(m.value) : undefined,
          amount: m.type === "$" ? Number(m.value) : undefined,
        }));

        const res = await previewMilestonesProvider({
          estimateId: quote?._id,
          grand: totalContractValue,
          rows: rowsPayload,
        });

        if (res) {
          setPreviewData(res);
          if (
            typeof res.grand === "number" &&
            res.grand > 0 &&
            res.grand !== totalContractValue
          ) {
            setTotalContractValue(res.grand);
          }
          if (typeof res.fullyScheduled === "boolean") {
            setServerFullyScheduled(res.fullyScheduled);
          }
        }
      } catch {
        // Silent catch for background live preview validation
      }
    }, 300);

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [milestones, totalContractValue, isLoadingInitial, quote?._id]);

  const handleAddPercentMilestone = () => {
    const nextId = String(Date.now());
    const remainingPct = Math.max(
      0,
      100 -
        milestones.reduce(
          (acc, m) =>
            acc +
            (m.type === "%"
              ? m.value
              : totalContractValue > 0
                ? (m.value / totalContractValue) * 100
                : 0),
          0,
        ),
    );
    const suggestedPct = Math.min(
      remainingPct > 0 ? Math.round(remainingPct) : 20,
      100,
    );
    setMilestones((prev) => [
      ...prev,
      {
        id: nextId,
        name:
          prev.length === 1
            ? "Delivery"
            : prev.length === 2
              ? "Final Completion"
              : `Milestone #${prev.length + 1}`,
        type: "%",
        value: suggestedPct,
      },
    ]);
  };

  const handleAddDollarMilestone = () => {
    const nextId = String(Date.now());
    const remaining = Math.max(0, totalContractValue - totalScheduled);
    setMilestones((prev) => [
      ...prev,
      {
        id: nextId,
        name: `Milestone #${prev.length + 1}`,
        type: "$",
        value: remaining > 0 ? remaining : 10000,
      },
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) {
      toast.error("At least one milestone is required");
      return;
    }
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateName = (id: string, name: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m)),
    );
  };

  const handleUpdateValue = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, value: num } : m)),
    );
  };

  const serializePayloadRows = useCallback((): MilestoneRowPayload[] => {
    return milestones.map((m) => ({
      label: m.name,
      type: m.type === "%" ? "pct" : "fixed",
      pct: m.type === "%" ? Number(m.value) : undefined,
      amount: m.type === "$" ? Number(m.value) : undefined,
    }));
  }, [milestones]);

  const openClientPrintPopup = useCallback(
    (htmlContent?: string) => {
      const printWindow = window.open("", "_blank", "width=850,height=900");
      if (!printWindow) {
        toast.error("Please allow popups to print Payment Schedule");
        return;
      }

      if (htmlContent) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        return;
      }

      const rowsHtml = displayItems
        .map(
          (item, idx) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">#${idx + 1} - ${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.type === "%" ? `${item.value}%` : "Flat $"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #7c3aed;">$${item.amount.toLocaleString()}</td>
        </tr>
      `,
        )
        .join("");

      const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Milestone Payment Schedule - ${customer}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #7c3aed; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .field-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            .total-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .total-label { font-size: 13px; font-weight: 800; color: #7c3aed; text-transform: uppercase; }
            .total-val { font-size: 28px; font-weight: 800; color: #7c3aed; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; padding: 10px; background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1; }
            .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .sum-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
            .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; }
            .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .sign-line { border-top: 1px solid #475569; padding-top: 8px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">MILESTONE PAYMENT SCHEDULE</h1>
            <div class="subtitle">${customer} · ${location}</div>
          </div>
          <div class="grid">
            <div>
              <div class="field-label">Customer</div>
              <div class="field-value">${customer}</div>
            </div>
            <div>
              <div class="field-label">Location</div>
              <div class="field-value">${location}</div>
            </div>
          </div>

          <div class="total-box">
            <div class="total-label">Total Contract Value</div>
            <div class="total-val">$${totalContractValue.toLocaleString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Milestone Stage</th>
                <th style="text-align: center;">Rate / Type</th>
                <th style="text-align: right;">Scheduled Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="sum-row">
              <span style="font-weight: 600; color: #475569;">Total Scheduled:</span>
              <span style="font-weight: 800; color: #0f172a;">$${totalScheduled.toLocaleString()}</span>
            </div>
            <div class="sum-row">
              <span style="font-weight: 600; color: #475569;">Unscheduled Balance:</span>
              <span style="font-weight: 800; color: #ea580c;">$${unscheduledBalance.toLocaleString()}</span>
            </div>
          </div>

          <div class="field-label" style="margin-bottom: 6px;">Notes (Optional)</div>
          <div class="notes-box">${notes || "All payments via wire transfer to storage materials account."}</div>

          <div class="signatures">
            <div>
              <div class="sign-line">Customer Acceptance & Date</div>
            </div>
            <div>
              <div class="sign-line">Authorized Contractor Signature & Date</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

      printWindow.document.write(printHtml);
      printWindow.document.close();
    },
    [
      displayItems,
      customer,
      location,
      notes,
      totalContractValue,
      totalScheduled,
      unscheduledBalance,
    ],
  );

  // Validation helper (tolerant of absorbed penny drift; blocks only true over-allocation)
  const validateMilestones = useCallback((): boolean => {
    if (totalContractValue <= 0) {
      toast.error("Total contract value must be greater than zero");
      return false;
    }
    if (hasEmptyNames) {
      toast.error("Please provide a name for all milestone stages");
      return false;
    }
    if (hasZeroOrNegativeValues) {
      toast.error(
        "All milestone amounts and percentages must be greater than zero",
      );
      return false;
    }
    if (hasOver100PctRow) {
      toast.error("Individual milestone percentage cannot exceed 100%");
      return false;
    }
    if (isPercentOver100) {
      toast.error(
        `Total milestone percentage (${sumOfPctRows.toFixed(1)}%) cannot exceed 100% of the contract value`,
      );
      return false;
    }
    if (!isFullyScheduled && (isOverScheduled || isOverPercentage)) {
      toast.error(
        `Total scheduled payments (${percentScheduled.toFixed(1)}%) exceed 100% of the contract value by $${overScheduledAmount.toLocaleString()}`,
      );
      return false;
    }
    return true;
  }, [
    totalContractValue,
    hasEmptyNames,
    hasZeroOrNegativeValues,
    hasOver100PctRow,
    isPercentOver100,
    sumOfPctRows,
    isFullyScheduled,
    isOverScheduled,
    isOverPercentage,
    percentScheduled,
    overScheduledAmount,
  ]);

  // Save Schedule Handler: PUT /api/sales/estimates/:estimateId/milestones (via React Query mutation)
  const handleSaveSchedule = async () => {
    if (!validateMilestones()) return;
    const rowsPayload = serializePayloadRows();

    try {
      let saveRes: SaveEstimateMilestonesResponseData | undefined;
      if (quote?._id) {
        saveRes = await saveMutation.mutateAsync({
          estimateId: quote._id,
          payload: {
            rows: rowsPayload,
            note: notes,
            grand: totalContractValue > 0 ? totalContractValue : undefined,
          },
        });
        toast.success("Milestone payment schedule saved successfully");
      } else {
        toast.success("Milestones configured");
      }
      onSuccess?.(saveRes);
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving milestones:", err);
      toast.error("Failed to save milestone schedule. Please try again.");
    }
  };

  // Standalone Pretty Schedule (Print / PDF): POST /api/sales/estimates/documents/milestones/pdf
  const handlePrintSchedule = async () => {
    if (!validateMilestones()) return;

    setIsPrinting(true);
    const rowsPayload = serializePayloadRows();

    try {
      // Auto-save to estimate when ID is present
      if (quote?._id) {
        await saveEstimateMilestonesProvider(quote._id, {
          rows: rowsPayload,
          note: notes,
          grand: totalContractValue > 0 ? totalContractValue : undefined,
        }).catch((err) =>
          console.warn("Background auto-save failed before print:", err),
        );
      }

      // Request standalone schedule from backend with format: "html"
      const res = await downloadMilestonesPdfProvider({
        estimateId: quote?._id,
        format: "html",
        grand: totalContractValue,
        rows: rowsPayload,
        note: notes,
      }).catch(() => null);

      const html = res?.data?.html || res?.html;
      const b64 = res?.data?.fileBase64 || res?.fileBase64;

      if (html) {
        openClientPrintPopup(html);
        toast.success("Standalone payment schedule generated");
      } else if (b64) {
        downloadPdfFromBase64(
          b64,
          res?.data?.fileName ||
            res?.fileName ||
            `Milestone-Schedule-${customer}.pdf`,
        );
        toast.success("Payment Schedule PDF downloaded successfully");
      } else {
        openClientPrintPopup();
        toast.success("Payment schedule printed");
      }

      onSuccess?.();
    } catch (err) {
      console.error("Error printing milestone schedule:", err);
      openClientPrintPopup();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      {/* Purple Header */}
      <div className="bg-[#7c3aed] text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏁</span>
          <DialogTitle className="text-base font-bold text-white tracking-wide">
            Milestone Payments
          </DialogTitle>
          {isLoadingInitial && (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-200 ml-1" />
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Form Body or Skeleton Loading */}
      {isLoadingInitial ? (
        <MilestoneModalSkeleton />
      ) : (
        <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-white">
          {/* Customer & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                CUSTOMER
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {customer}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                LOCATION
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {location}
              </div>
            </div>
          </div>

          {/* TOTAL CONTRACT VALUE Banner Card */}
          <div className="bg-[#faf5ff] border border-purple-200/80 rounded-xl p-4 flex items-center justify-between">
            <div className="text-xs font-black text-[#7c3aed] uppercase tracking-wider">
              TOTAL CONTRACT VALUE
            </div>
            <div className="text-3xl font-black text-[#7c3aed]">
              ${totalContractValue.toLocaleString()}
            </div>
          </div>

          {/* Validation Warning Alert */}
          {(isOverScheduled || isOverPercentage) && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-rose-900">
                  Total Exceeds Contract Value
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700">
                  Scheduled payments ({percentScheduled.toFixed(1)}% / $
                  {totalScheduled.toLocaleString()}) exceed the total contract
                  value by{" "}
                  <span className="font-bold text-rose-900">
                    ${overScheduledAmount.toLocaleString()}
                  </span>{" "}
                  ({overScheduledPct.toFixed(1)}%). Please reduce milestone
                  amounts.
                </p>
              </div>
            </div>
          )}

          {/* Milestones dynamic list */}
          <div className="space-y-2.5">
            {displayItems.map((item) => {
              const isRowEmpty = !item.name.trim();
              const isRowZeroOrNegative = Number(item.value) <= 0;
              const isRowOver100Pct =
                item.type === "%" && Number(item.value) > 100;
              const hasRowError =
                isRowEmpty || isRowZeroOrNegative || isRowOver100Pct;

              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-2.5 flex items-center gap-2.5 bg-white shadow-2xs transition-colors ${
                    hasRowError
                      ? "border-rose-300 bg-rose-50/10"
                      : "border-slate-200"
                  }`}
                >
                  <Input
                    value={item.name}
                    onChange={(e) => handleUpdateName(item.id, e.target.value)}
                    placeholder="Milestone name"
                    className={`h-9 text-sm font-medium flex-1 ${
                      isRowEmpty
                        ? "border-rose-400 focus-visible:ring-rose-400 bg-rose-50/20"
                        : "border-slate-300"
                    }`}
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Input
                      type="number"
                      value={item.value || ""}
                      onChange={(e) =>
                        handleUpdateValue(item.id, e.target.value)
                      }
                      className={`h-9 text-sm font-medium w-16 text-center ${
                        isRowZeroOrNegative || isRowOver100Pct
                          ? "border-rose-400 focus-visible:ring-rose-400 text-rose-600 font-bold bg-rose-50/20"
                          : "border-slate-300"
                      }`}
                    />
                    <span className="text-sm font-bold text-slate-600">
                      {item.type}
                    </span>
                  </div>

                  <div
                    className={`text-sm font-bold min-w-24 text-right shrink-0 ${
                      hasRowError ? "text-rose-600" : "text-slate-900"
                    }`}
                  >
                    ${item.amount.toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(item.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    title="Remove milestone"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Optional UX: adjustment info note */}
          {clientMirror.isAdjusted && isFullyScheduled && (
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 px-1 py-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>
                Adjusted by $1 on final milestone to match exact contract total
              </span>
            </div>
          )}

          {/* Action buttons: + Add % Milestone / + Add $ Milestone */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPercentMilestone}
              className="border-dashed border-[#a855f7] text-[#7c3aed] bg-[#faf5ff] hover:bg-[#f3e8ff] h-10 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />+ Add % Milestone
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddDollarMilestone}
              className="border-dashed border-[#22c55e] text-[#16a34a] bg-[#f0fdf4] hover:bg-[#dcfce7] h-10 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />+ Add $ Milestone
            </Button>
          </div>

          {/* TOTAL SCHEDULED & UNSCHEDULED Progress Box */}
          <div
            className={`border rounded-xl p-3.5 space-y-2 transition-colors ${
              isOverScheduled || isOverPercentage
                ? "bg-rose-50/40 border-rose-200"
                : "bg-[#f8fafc] border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 uppercase tracking-wide">
                TOTAL SCHEDULED
              </span>
              <div className="flex items-center gap-2">
                {isFullyScheduled && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" /> 100% Scheduled
                  </span>
                )}
                {isOverScheduled && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" />{" "}
                    {percentScheduled.toFixed(1)}% (Over)
                  </span>
                )}
                <span
                  className={`text-sm font-bold ${
                    isOverScheduled ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  ${totalScheduled.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFullyScheduled
                    ? "bg-emerald-600"
                    : isOverScheduled || isOverPercentage
                      ? "bg-rose-600"
                      : "bg-[#7c3aed]"
                }`}
                style={{ width: `${Math.min(100, percentScheduled)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-0.5">
              <span className="text-slate-600">
                {isOverScheduled
                  ? "Over-scheduled Balance"
                  : "Unscheduled Balance"}
              </span>
              <span
                className={`text-sm font-bold ${
                  isFullyScheduled
                    ? "text-emerald-600"
                    : isOverScheduled
                      ? "text-rose-600"
                      : "text-[#ea580c]"
                }`}
              >
                {isOverScheduled
                  ? `+$${overScheduledAmount.toLocaleString()} (+${overScheduledPct.toFixed(1)}%)`
                  : isFullyScheduled
                    ? `$0 (0.0%)`
                    : `$${Math.max(0, unscheduledBalance).toLocaleString()} (${Math.max(0, 100 - percentScheduled).toFixed(1)}%)`}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Notes (Optional)
            </Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. all payments via wire transfer to storage materials account"
              className="text-sm resize-none border-slate-300"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isLoadingInitial || isPrinting || isSaving}
          onClick={handlePrintSchedule}
          title={
            hasValidationErrors
              ? "Please resolve schedule validation errors"
              : undefined
          }
          className="border border-purple-300 text-[#7c3aed] bg-purple-50/50 hover:bg-purple-100 cursor-pointer font-semibold flex items-center gap-1.5 text-xs h-9 px-3"
        >
          {isPrinting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Printer className="h-3.5 w-3.5" />
          )}
          <span>{isPrinting ? "Printing..." : "Print / PDF"}</span>
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            type="button"
            variant="ghost"
            disabled={isLoadingInitial || isSaving || isPrinting}
            onClick={() => onOpenChange(false)}
            className="text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer font-medium text-xs h-9 px-3"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isLoadingInitial || isSaving || isPrinting}
            onClick={handleSaveSchedule}
            title={
              hasValidationErrors
                ? "Please resolve schedule validation errors"
                : undefined
            }
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white cursor-pointer font-semibold flex items-center gap-1.5 text-xs h-9 px-3.5 shadow-2xs"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save & Create Schedule"}</span>
          </Button>
        </div>
      </div>
    </>
  );
}

export function MilestonePaymentsModal({
  open,
  onOpenChange,
  quote,
  onSuccess,
}: MilestonePaymentsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] sm:max-w-md p-0 gap-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl flex flex-col"
      >
        {open && (
          <MilestonePaymentsContent
            key={quote?._id || "milestone-payments"}
            quote={quote}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
