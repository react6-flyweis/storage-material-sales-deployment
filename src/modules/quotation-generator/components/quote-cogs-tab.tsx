import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  previewCogsProvider,
  type ExtractShipperResponseData,
  type ComputeEstimateRequest,
} from "../estimates.api";

interface QuoteCogsTabProps {
  extractedShipper?: ExtractShipperResponseData;
  onTriggerCompute?: (overrides?: Partial<ComputeEstimateRequest>) => void;
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

  useEffect(() => {
    if (!extractedShipper?.pricing) return;
    const costVal = parseFloat(cogsCostInput) || undefined;
    const sellVal = parseFloat(cogsFixedSellPrice) || undefined;
    previewCogsProvider({
      pricingResult: extractedShipper.pricing,
      cogsOverride: {
        applied: true,
        costDollar: costVal,
        marginPct: cogsMaterialMargin,
        sellDollar: sellVal,
      },
    }).catch((err) => {
      console.error("COGS preview error:", err);
    });
  }, [cogsCostInput, cogsMaterialMargin, cogsFixedSellPrice, extractedShipper?.pricing]);

  const pricing = extractedShipper?.pricing;

  // Base shipper values
  const baseCogs =
    pricing?.matCost != null
      ? pricing.matCost
      : pricing?.totCost != null
      ? pricing.totCost
      : 168663;

  const baseSell =
    pricing?.matSell != null
      ? pricing.matSell
      : pricing?.totSell != null
      ? pricing.totSell
      : 219262;

  const baseMarginText =
    pricing?.profPct != null ? `${pricing.profPct}%` : "23.1%";

  const sfPriceText =
    pricing?.sfPrice != null
      ? `$${pricing.sfPrice}`
      : "$2.45 Cost / $3.19 Sell";

  // Calculation logic
  const adjustedCogs = parseFloat(cogsCostInput) || baseCogs;
  const costDiff = adjustedCogs - baseCogs;

  // Calculate material sell based on margin or fixed sell
  const targetMarginDecimal = cogsMaterialMargin / 100;
  const computedMaterialSell =
    targetMarginDecimal < 1
      ? adjustedCogs / (1 - targetMarginDecimal)
      : adjustedCogs;
  const materialSell =
    cogsFixedSellPrice !== ""
      ? parseFloat(cogsFixedSellPrice) || computedMaterialSell
      : computedMaterialSell;
  const totalProfit = materialSell - adjustedCogs;
  const overallMargin =
    materialSell > 0 ? (totalProfit / materialSell) * 100 : 0;

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
          costDollar: costVal,
          marginPct: cogsMaterialMargin,
          sellDollar: sellVal,
        },
      });
    }
  };

  const handleReset = () => {
    resetCogsSettings();
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
              ${baseCogs.toLocaleString()}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              COMPUTED SELL
            </span>
            <span className="text-sm md:text-base font-extrabold text-blue-600">
              ${baseSell.toLocaleString()}
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
                type="text"
                value={cogsCostInput}
                onChange={(e) => setCogsCostInput(e.target.value)}
                className="w-full border-2 border-orange-400 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
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
                  min="-50"
                  max="50"
                  value={cogsCostAdjustPercent}
                  onChange={(e) => {
                    const pct = parseFloat(e.target.value);
                    setCogsCostAdjustPercent(pct);
                    const newCost = Math.round(baseCogs * (1 + pct / 100));
                    setCogsCostInput(newCost.toString());
                  }}
                  className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <span className="text-xs font-bold text-orange-600 min-w-[2.5rem] text-right">
                  {cogsCostAdjustPercent}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Slide right = add cost, slide left = reduce cost
              </p>
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
                  max="50"
                  value={cogsMaterialMargin}
                  onChange={(e) => setCogsMaterialMargin(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="border border-slate-300 rounded-md px-3 py-1 bg-white text-xs font-bold text-slate-900 flex items-center gap-1.5 min-w-[4rem] justify-between shadow-2xs">
                  <span>{cogsMaterialMargin}</span>
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
                type="text"
                placeholder="Leave blank to use margin"
                value={cogsFixedSellPrice}
                onChange={(e) => setCogsFixedSellPrice(e.target.value)}
                className="w-full border border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LIVE RESULT CARD CONTAINER */}
      <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-6 space-y-6 shadow-2xs">
        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block">
          LIVE RESULT
        </span>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ADJUSTED COGS */}
          <div className="border-2 border-blue-500 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              ADJUSTED COGS
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              ${Math.round(adjustedCogs).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              +{costDiff >= 0 ? `$${costDiff.toLocaleString()}` : `-$${Math.abs(costDiff).toLocaleString()}`} vs shipper
            </p>
          </div>

          {/* MATERIAL SELL */}
          <div className="border-2 border-emerald-400 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              MATERIAL SELL
            </span>
            <div className="text-xl font-extrabold text-emerald-600">
              ${Math.round(materialSell).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {cogsMaterialMargin.toFixed(1)}% mat margin · ${costDiff >= 0 ? `-${Math.abs(costDiff).toLocaleString()}` : `+${Math.abs(costDiff).toLocaleString()}`}
            </p>
          </div>

          {/* TOTAL SELL */}
          <div className="border-2 border-emerald-400 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              TOTAL SELL
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              ${Math.round(materialSell).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              $3.07/SF · incl. install
            </p>
          </div>

          {/* TOTAL PROFIT */}
          <div className="border-2 border-emerald-400 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              TOTAL PROFIT
            </span>
            <div className="text-xl font-extrabold text-emerald-600">
              ${Math.round(totalProfit).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {overallMargin.toFixed(1)}% overall margin
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
