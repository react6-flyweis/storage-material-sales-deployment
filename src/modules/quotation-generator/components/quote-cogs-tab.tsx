import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  previewCogsProvider,
  type ExtractShipperResponseData,
  type ComputeEstimateRequest,
} from "../estimates.api";
import {
  formatCurrency2,
  formatPercent2,
  formatSfPrice2,
} from "../utils/quote-formatting";

interface QuoteCogsTabProps {
  extractedShipper?: ExtractShipperResponseData;
  onTriggerCompute?: (overrides?: Partial<ComputeEstimateRequest>) => void;
}

interface CogsPreviewFromShipper {
  cost?: number;
  sell?: number;
  margin?: number;
  sf?: number;
  [key: string]: unknown;
}

interface CogsPreviewAdjusted {
  cost?: number;
  sell?: number;
  matMargin?: number;
  grandSell?: number;
  grandCost?: number;
  profit?: number;
  totalMargin?: number;
  sfPrice?: string | number;
  costDiff?: number;
  sellDiff?: number;
  [key: string]: unknown;
}

export function QuoteCogsTab({
  extractedShipper,
  onTriggerCompute,
}: QuoteCogsTabProps) {
  const {
    cogsCostInput,
    setCogsCostInput,
    cogsCostAdjustPercent,
    setCogsCostAdjustPercent,
    cogsMaterialMargin,
    setCogsMaterialMargin,
    cogsFixedSellPrice,
    setCogsFixedSellPrice,
    setCogsOverrideApplied,
    resetCogsSettings,
  } = useQuotationStore();

  // Dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fullQuote = extractedShipper?.fullQuote;
  const pricing = extractedShipper?.pricing || fullQuote?.pricing;

  // API Preview state
  const apiFromShipper = fullQuote?.cogsPreview?.fromShipper;
  const apiAdjusted = fullQuote?.cogsPreview?.adjusted;

  const [fromShipperData, setFromShipperData] = useState<CogsPreviewFromShipper | null>(null);
  const [previewData, setPreviewData] = useState<CogsPreviewAdjusted | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  const activeFromShipper = fromShipperData || apiFromShipper || null;
  const activePreview = previewData || apiAdjusted || null;

  useEffect(() => {
    if (!pricing) return;
    const hasInput = Boolean(
      cogsCostInput ||
      cogsFixedSellPrice ||
      cogsCostAdjustPercent !== 0 ||
      cogsMaterialMargin !== 0
    );

    if (!hasInput) {
      return;
    }

    let isMounted = true;
    const costVal = parseFloat(cogsCostInput) || undefined;
    const sellVal = parseFloat(cogsFixedSellPrice) || undefined;

    const fetchPreview = async () => {
      setIsFetchingPreview(true);
      try {
        const res = await previewCogsProvider({
          pricingResult: pricing,
          cogsOverride: {
            applied: false,
            costDollar: costVal ?? null,
            marginPct: cogsMaterialMargin,
            sellDollar: sellVal ?? null,
            costPctAdj: cogsCostAdjustPercent,
          },
        });
        if (!isMounted) return;
        const preview = res.data?.preview || res.preview;
        if (preview?.fromShipper) {
          setFromShipperData(preview.fromShipper);
        }
        if (preview?.adjusted) {
          setPreviewData(preview.adjusted);
        } else {
          const adjusted =
            (res.data as Record<string, unknown>)?.adjusted ||
            (res.data as Record<string, unknown>)?.preview ||
            res.data ||
            res;
          if (adjusted && typeof adjusted === "object") {
            setPreviewData(adjusted as CogsPreviewAdjusted);
          }
        }
      } catch (err) {
        console.error("COGS preview API error:", err);
      } finally {
        if (isMounted) {
          setIsFetchingPreview(false);
        }
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [cogsCostInput, cogsCostAdjustPercent, cogsMaterialMargin, cogsFixedSellPrice, pricing]);

  // Base shipper values from API
  const baseCogs =
    activeFromShipper?.cost != null
      ? activeFromShipper.cost
      : pricing?.totCost ?? 0;

  const baseSell =
    activeFromShipper?.sell != null
      ? activeFromShipper.sell
      : pricing?.totSell ?? 0;

  const baseMarginText =
    activeFromShipper?.margin != null
      ? formatPercent2(activeFromShipper.margin)
      : pricing?.profPct != null
      ? formatPercent2(pricing.profPct)
      : "-";

  const sfPriceText =
    activePreview?.sfPrice != null
      ? `${formatSfPrice2(activePreview.sfPrice)}/SF`
      : pricing?.sfPrice != null
      ? `${formatSfPrice2(pricing.sfPrice)}/SF`
      : "-";

  // Display values driven by API preview or pricing (no local fallback calculation)
  const displayCogs =
    activePreview?.cost != null
      ? activePreview.cost
      : baseCogs;

  const costDiff =
    activePreview?.costDiff != null
      ? activePreview.costDiff
      : 0;

  const displayMatSell =
    activePreview?.sell != null
      ? activePreview.sell
      : (pricing?.matSell ?? baseSell);

  const displayTotalSell =
    activePreview?.grandSell != null
      ? activePreview.grandSell
      : activePreview?.sell != null
      ? activePreview.sell
      : (pricing?.totSell ?? displayMatSell);

  const displayProfit =
    activePreview?.profit != null
      ? activePreview.profit
      : (pricing?.profit ?? 0);

  const matMarginPct =
    activePreview?.matMargin != null
      ? Number(activePreview.matMargin).toFixed(2)
      : Number(cogsMaterialMargin).toFixed(2);

  const overallMarginPct =
    activePreview?.totalMargin != null
      ? Number(activePreview.totalMargin).toFixed(2)
      : activePreview?.matMargin != null
      ? Number(activePreview.matMargin).toFixed(2)
      : pricing?.profPct != null
      ? Number(pricing.profPct).toFixed(2)
      : "0.00";

  const rawDisplaySfPrice =
    activePreview?.sfPrice != null
      ? activePreview.sfPrice
      : pricing?.sfPrice ?? "-";
  const displaySfPrice = formatSfPrice2(rawDisplaySfPrice);

  const handleApply = () => {
    setCogsOverrideApplied(true);
    setSuccessMessage(
      "COGS & Target Margin applied to Quote & SOW successfully!"
    );
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      const costVal = parseFloat(cogsCostInput) || undefined;
      const sellVal = parseFloat(cogsFixedSellPrice) || undefined;
      onTriggerCompute({
        cogsOverride: {
          applied: true,
          costDollar: costVal ?? null,
          marginPct: cogsMaterialMargin,
          sellDollar: sellVal ?? null,
          costPctAdj: cogsCostAdjustPercent,
        },
      });
    }
  };

  const handleReset = () => {
    resetCogsSettings();
    setPreviewData(null);
    setSuccessMessage("Values reset to default shipper numbers!");
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      onTriggerCompute({
        cogsOverride: {
          applied: false,
        },
      });
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Success Dialog */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successMessage}
      />

      {/* Header Banner Section */}
      <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-2xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <span>🏗️</span>
            <span>COGS — Building Cost & Sell Adjustment</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Starts from your computed shipper numbers — adjust cost up/down for special specs, then set your target margin
          </p>
        </div>

        {/* FROM SHIPPER BAR */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-wrap items-center gap-8 md:gap-14">
          <div className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
            FROM SHIPPER:
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              COGS
            </span>
            <span className="text-sm md:text-base font-extrabold text-slate-900">
              {baseCogs > 0 ? formatCurrency2(baseCogs) : "-"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              COMPUTED SELL
            </span>
            <span className="text-sm md:text-base font-extrabold text-blue-600">
              {baseSell > 0 ? formatCurrency2(baseSell) : "-"}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              COMPUTED MARGIN
            </span>
            <span className="text-sm md:text-base font-extrabold text-emerald-500">
              {baseMarginText}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              $/SF
            </span>
            <span className="text-sm md:text-base font-extrabold text-slate-900">
              {sfPriceText}
            </span>
          </div>
        </div>

        {/* STEP 1 AND STEP 2 GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Step 1 — Adjust Building COGS ($) */}
          <div className="space-y-5">
            <div className="border-b-2 border-orange-400 pb-1.5">
              <h3 className="text-xs font-bold text-slate-900">
                Step 1 — Adjust Building COGS ($)
              </h3>
            </div>

            {/* New Cost Total Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-500">
                New Cost Total ($)
              </label>
              <input
                type="number"
                step="500"
                min="0"
                placeholder={baseCogs > 0 ? `e.g. ${baseCogs.toFixed(2)}` : "New Cost Total ($)"}
                value={cogsCostInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setCogsCostInput(val);
                  const num = parseFloat(val);
                  if (!isNaN(num) && baseCogs > 0) {
                    const pct = ((num - baseCogs) / baseCogs) * 100;
                    setCogsCostAdjustPercent(parseFloat(pct.toFixed(2)));
                  }
                }}
                className="w-full border-2 border-orange-400 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
            </div>

            {/* Percent Adjustment Slider */}
            <div className="space-y-2">
              <div className="text-[10px] font-medium text-slate-400">
                — or adjust by % —
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="0.5"
                  value={cogsCostAdjustPercent}
                  onChange={(e) => {
                    const pct = parseFloat(e.target.value);
                    setCogsCostAdjustPercent(pct);
                    if (baseCogs > 0) {
                      const newCost = (baseCogs * (1 + pct / 100)).toFixed(2);
                      setCogsCostInput(newCost);
                    }
                  }}
                  className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <span className="text-xs font-bold text-orange-600 min-w-12 text-right">
                  {cogsCostAdjustPercent >= 0 ? `+${cogsCostAdjustPercent.toFixed(1)}%` : `${cogsCostAdjustPercent.toFixed(1)}%`}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Slide right = add cost, slide left = reduce cost
              </p>

              {baseCogs > 0 && cogsCostInput && (
                <div className="bg-[#FFF8ED] border border-[#FCD34D] rounded-md px-3 py-2 text-xs font-medium text-[#92400E]">
                  {formatCurrency2(baseCogs)} → {formatCurrency2(displayCogs)} ({costDiff >= 0 ? `+${formatCurrency2(costDiff)}` : `-${formatCurrency2(Math.abs(costDiff))}`})
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Set Target Margin */}
          <div className="space-y-5">
            <div className="border-b-2 border-blue-500 pb-1.5">
              <h3 className="text-xs font-bold text-slate-900">
                Step 2 — Set Target Margin
              </h3>
            </div>

            {/* Material Margin % Slider */}
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-slate-500">
                Material Margin %
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="0.5"
                  value={cogsMaterialMargin}
                  onChange={(e) => {
                    const m = parseFloat(e.target.value);
                    setCogsMaterialMargin(m);
                    setCogsFixedSellPrice("");
                  }}
                  className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="border border-slate-300 rounded-md px-3 py-1 bg-white text-xs font-bold text-slate-900 flex items-center gap-1.5 min-w-16 justify-between shadow-2xs">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={cogsMaterialMargin}
                    onChange={(e) => {
                      const m = parseFloat(e.target.value) || 0;
                      setCogsMaterialMargin(m);
                      setCogsFixedSellPrice("");
                    }}
                    className="w-10 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-400 font-normal">%</span>
                </div>
              </div>
            </div>

            {/* Fixed Sell Price Input */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-medium text-slate-400">
                — or type a fixed sell price ($) —
              </div>
              <input
                type="number"
                step="500"
                min="0"
                placeholder="Leave blank to use margin"
                value={cogsFixedSellPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setCogsFixedSellPrice(val);
                  const sellNum = parseFloat(val);
                  const costBase = parseFloat(cogsCostInput) || baseCogs;
                  if (!isNaN(sellNum) && sellNum > 0 && costBase > 0) {
                    const impliedMargin = Math.min(60, Math.max(0, ((sellNum - costBase) / sellNum) * 100));
                    setCogsMaterialMargin(parseFloat(impliedMargin.toFixed(2)));
                  }
                }}
                className="w-full border border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LIVE RESULT CARD CONTAINER */}
      <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-6 space-y-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block">
            LIVE RESULT (API)
          </span>
          {isFetchingPreview && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Calculating via API...</span>
            </div>
          )}
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ADJUSTED COGS */}
          <div className="border-2 border-blue-500 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              ADJUSTED COGS
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              {formatCurrency2(displayCogs)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {costDiff >= 0 ? `+${formatCurrency2(costDiff)}` : `-${formatCurrency2(Math.abs(costDiff))}`} vs shipper
            </p>
          </div>

          {/* MATERIAL SELL */}
          <div className="border-2 border-emerald-400 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              MATERIAL SELL
            </span>
            <div className="text-xl font-extrabold text-emerald-600">
              {formatCurrency2(displayMatSell)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {matMarginPct}% mat margin · {costDiff >= 0 ? `-${formatCurrency2(Math.abs(costDiff))}` : `+${formatCurrency2(Math.abs(costDiff))}`}
            </p>
          </div>

          {/* TOTAL SELL */}
          <div className="border-2 border-emerald-400 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              TOTAL SELL
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              {formatCurrency2(displayTotalSell)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {displaySfPrice}/SF · incl. install
            </p>
          </div>

          {/* TOTAL PROFIT */}
          <div className="border-2 border-emerald-400 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              TOTAL PROFIT
            </span>
            <div className="text-xl font-extrabold text-emerald-600">
              {formatCurrency2(displayProfit)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {overallMarginPct}% overall margin
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="button"
            onClick={handleApply}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Apply to Quote & SOW
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
          >
            Reset to Shipper Numbers
          </Button>
        </div>
      </div>
    </div>
  );
}
