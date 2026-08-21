import { useState, useEffect } from "react";
import { Search, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation/quotation.store";
import {
  taxLookupProvider,
  previewMarginProvider,
  type ExtractShipperResponseData,
  type ComputeEstimateRequest,
} from "../estimates.api";

interface QuoteMarginTabProps {
  extractedShipper?: ExtractShipperResponseData;
  onTriggerCompute?: (overrides?: Partial<ComputeEstimateRequest>) => void;
}

export function QuoteMarginTab({
  extractedShipper,
  onTriggerCompute,
}: QuoteMarginTabProps) {
  const {
    installCost,
    setInstallCost,
    installSell,
    setInstallSell,
    taxZip,
    setTaxZip,
    taxRate,
    setTaxRate,
    includeTax,
    setIncludeTax,
    isTaxLoading,
    setIsTaxLoading,
    marginLaborOverride,
    setMarginLaborOverride,
    marginTargetMargin,
    setMarginTargetMargin,
    marginFixedSellOverride,
    setMarginFixedSellOverride,
    setMarginOverrideApplied,
    resetMarginSettings,
  } = useQuotationStore();

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [taxMessage, setTaxMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!extractedShipper?.pricing) return;
    const laborVal = parseFloat(marginLaborOverride) || undefined;
    const targetVal = parseFloat(marginTargetMargin) || undefined;
    const sellVal = parseFloat(marginFixedSellOverride) || undefined;
    previewMarginProvider({
      pricingResult: extractedShipper.pricing,
      marginOverride: {
        applied: true,
        laborSF: laborVal,
        pct: targetVal,
        sellFixed: sellVal,
      },
    }).catch((err) => {
      console.error("Margin preview error:", err);
    });
  }, [marginLaborOverride, marginTargetMargin, marginFixedSellOverride, extractedShipper?.pricing]);

  // Perform tax lookup when user enters ZIP and blurs or clicks Search
  const handleTaxLookup = async () => {
    const zip = (taxZip || "").trim();
    if (!zip) return;

    setIsTaxLoading(true);
    setTaxMessage(null);
    try {
      const res = await taxLookupProvider(zip);
      let foundRate: number | undefined;

      if (typeof res === "number") {
        foundRate = res;
      } else if (res && typeof res.rate === "number") {
        foundRate = res.rate;
      } else if (res && res.data) {
        if (typeof res.data === "number") {
          foundRate = res.data;
        } else if (typeof res.data.rate === "number") {
          foundRate = res.data.rate;
        } else if (typeof res.data.taxRate === "number") {
          foundRate = res.data.taxRate;
        }
      }

      if (foundRate !== undefined && !isNaN(foundRate)) {
        setTaxRate(foundRate);
        setIncludeTax(true);
        setTaxMessage(`Tax rate for ZIP ${zip}: ${foundRate}%`);
        if (onTriggerCompute) {
          onTriggerCompute({
            salesTax: {
              rate: foundRate,
              include: true,
              zip,
            },
          });
        }
      } else {
        setTaxMessage(`Tax rate updated to ${taxRate}% for ZIP ${zip}`);
        if (onTriggerCompute) {
          onTriggerCompute({
            salesTax: {
              rate: taxRate,
              include: true,
              zip,
            },
          });
        }
      }
    } catch (err) {
      console.error("Failed to lookup tax rate for ZIP:", err);
      setTaxMessage("Could not fetch tax rate, please enter manually.");
    } finally {
      setIsTaxLoading(false);
    }
  };

  const handleApply = () => {
    setMarginOverrideApplied(true);
    setSuccessMessage("Margin overrides applied to Quote & SOW successfully!");
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      const laborVal = parseFloat(marginLaborOverride) || undefined;
      const targetVal = parseFloat(marginTargetMargin) || undefined;
      const sellVal = parseFloat(marginFixedSellOverride) || undefined;
      onTriggerCompute({
        marginOverride: {
          applied: true,
          laborSF: laborVal,
          pct: targetVal,
          sellFixed: sellVal,
        },
      });
    }
  };

  const handleReset = () => {
    resetMarginSettings();
    setSuccessMessage("Overrides have been reset to default values!");
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      onTriggerCompute({
        marginOverride: {
          applied: false,
        },
      });
    }
  };

  const pricing = extractedShipper?.pricing;

  // Erection calculations
  const totalSellVal = pricing?.instSell != null ? pricing.instSell : 584375;
  const totalCostVal = pricing?.instCost != null ? pricing.instCost : 0;
  const totalProfitVal = totalSellVal - totalCostVal;
  const marginPercentVal =
    totalSellVal > 0
      ? ((totalProfitVal / totalSellVal) * 100).toFixed(1)
      : "35.3";

  const totalProjectSell =
    pricing?.totSell != null
      ? `$${pricing.totSell.toLocaleString()}`
      : "$326,563";
  const totalProjectProfit =
    pricing?.profit != null ? `$${pricing.profit.toLocaleString()}` : "$-65,538";
  const totalProjectMargin =
    pricing?.profPct != null ? `${pricing.profPct}%` : "-20.1%";
  const matSellText =
    pricing?.matSell != null
      ? `$${pricing.matSell.toLocaleString()}`
      : "$199,023";
  const instSellText =
    pricing?.instSell != null
      ? `$${pricing.instSell.toLocaleString()}`
      : "$584,375";
  const sfPriceText =
    pricing?.sfPrice != null ? `$${pricing.sfPrice}/SF` : "$4.75/SF";
  const matProfitText =
    pricing?.matCost != null && pricing?.matSell != null
      ? `$${(pricing.matSell - pricing.matCost).toLocaleString()}`
      : "$-65,538";

  const adjustedSellText =
    pricing?.totSell != null
      ? `$${pricing.totSell.toLocaleString()}`
      : "$219,262";
  const totalCostText =
    pricing?.totCost != null
      ? `$${pricing.totCost.toLocaleString()}`
      : "$168,663";
  const profitText =
    pricing?.profit != null
      ? `$${pricing.profit.toLocaleString()}`
      : "$50,599";
  const profitMarginText =
    pricing?.profPct != null ? `${pricing.profPct}% margin` : "23.1% margin";

  return (
    <div className="space-y-8">
      {/* Success Dialog */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successMessage}
      />

      {/* Pricing Controls Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span>💰</span>
            <span>Pricing Controls</span>
          </div>
          <span className="text-slate-400 font-medium">
            Live view — sliders sync with sidebar
          </span>
        </div>

        {/* 2x2 Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Material Markup */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>📦</span>
              <span>Material Markup</span>
            </div>
            <div className="h-1 bg-[#1E3A8A] w-6 rounded-full" />
            <p className="text-xs text-slate-400 font-medium">
              Blended material markup ({pricing?.blendLabel || "50% Vendor blend"})
            </p>
          </div>

          {/* Card 2: Erection / Labor */}
          <div className="border border-emerald-300 rounded-xl p-5 bg-emerald-50/30 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <span>🏗️</span>
              <span>Erection / Labor</span>
            </div>

            {/* COST $/SF Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                <span>COST $/SF (your actual labor cost)</span>
                <span className="text-amber-600 font-extrabold text-xs">
                  ${installCost.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="1.00"
                max="10.00"
                step="0.05"
                value={installCost}
                onChange={(e) => setInstallCost(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* SELL $/SF Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                <span>SELL $/SF (what you charge customer)</span>
                <span className="text-emerald-600 font-extrabold text-xs">
                  ${installSell.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="1.00"
                max="10.00"
                step="0.05"
                value={installSell}
                onChange={(e) => setInstallSell(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <p className="text-[11px] text-emerald-700 font-semibold pt-1">
              ${totalSellVal.toLocaleString()} sell · ${totalProfitVal.toLocaleString()} profit · {marginPercentVal}% margin
            </p>
          </div>

          {/* Card 3: Total Project Card (Navy Blue) */}
          <div className="bg-[#1E3A8A] text-white rounded-xl p-6 space-y-3 shadow-xs">
            <span className="text-xs font-semibold text-blue-200">
              Total Project
            </span>
            <div className="text-3xl md:text-4xl font-extrabold">{totalProjectSell}</div>

            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>💰</span>
              <span>{totalProjectProfit} profit · {totalProjectMargin} margin</span>
            </div>

            <div className="text-[11px] text-blue-100 space-y-1 pt-1 font-medium leading-relaxed">
              <p>Mat {matProfitText} · Install ${totalProfitVal.toLocaleString()}</p>
              <p>Mat: {matSellText} · Install: {instSellText} · {sfPriceText}</p>
            </div>
          </div>

          {/* Card 4: Sales Tax Card */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>🏦</span>
              <span>Sales Tax</span>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase">
                ZIP Code Lookup
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="ZIP"
                  value={taxZip}
                  onChange={(e) => setTaxZip(e.target.value)}
                  onBlur={handleTaxLookup}
                  className="sm:col-span-5 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  onClick={handleTaxLookup}
                  disabled={isTaxLoading}
                  className="sm:col-span-4 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer h-9"
                >
                  {isTaxLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                  {isTaxLoading ? "Loading..." : "Search"}
                </Button>
                <div className="sm:col-span-3 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 flex items-center justify-between bg-slate-50/50">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-800"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
              {taxMessage && (
                <p className="text-[10px] text-blue-600 font-medium pt-0.5">
                  {taxMessage}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIncludeTax(!includeTax)}
                className={`w-4 h-4 rounded flex items-center justify-center border text-white transition-colors cursor-pointer ${includeTax ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                  }`}
              >
                {includeTax && <Check className="h-3 w-3" />}
              </button>
              <span className="text-xs text-slate-800 font-semibold">
                Include tax on quote
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Applied to materials & insulation only (not labor)
            </p>
          </div>
        </div>
      </div>

      {/* Margin & Profit Adjuster Section */}
      <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Margin & Profit Adjuster
          </h3>
          <span className="text-[11px] text-slate-400">
            Override the computed price — adjust labor rate and target margin independently
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Labor Rate Override ($/SF) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Labor Rate Override ($/SF)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={marginLaborOverride || 0}
                onChange={(e) => setMarginLaborOverride(e.target.value)}
                className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-600">
                {marginLaborOverride ? `$${marginLaborOverride}` : "Auto"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Leave blank to use sidebar slider value
            </p>
          </div>

          {/* Target Margin % */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Target Margin %
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={marginTargetMargin || 0}
                onChange={(e) => setMarginTargetMargin(e.target.value)}
                className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-600">
                {marginTargetMargin ? `${marginTargetMargin}%` : "Auto"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Forces final sell price to hit this margin
            </p>
          </div>

          {/* Fixed Sell Price Override ($) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Fixed Sell Price Override ($)
            </label>
            <input
              type="text"
              placeholder="Leave Blank"
              value={marginFixedSellOverride}
              onChange={(e) => setMarginFixedSellOverride(e.target.value)}
              className="w-full bg-slate-100/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[10px] text-slate-400">
              Type a hard dollar amount to lock sell price
            </p>
          </div>
        </div>
      </div>

      {/* ADJUSTED PROFIT SUMMARY */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
          ADJUSTED PROFIT SUMMARY
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ADJUSTED SELL */}
          <div className="border-2 border-emerald-500 rounded-xl p-4 bg-slate-50/50 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              ADJUSTED SELL
            </span>
            <div className="text-xl font-extrabold text-slate-900">{adjustedSellText}</div>
            <p className="text-xs text-slate-500 font-medium">{sfPriceText}</p>
          </div>

          {/* TOTAL COST */}
          <div className="border border-blue-500 rounded-xl p-4 bg-slate-50/50 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              TOTAL COST
            </span>
            <div className="text-xl font-extrabold text-slate-900">{totalCostText}</div>
            <p className="text-xs text-slate-500 font-medium">Mat + freight + labor</p>
          </div>

          {/* PROFIT */}
          <div className="border border-emerald-500 rounded-xl p-4 bg-slate-50/50 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              PROFIT
            </span>
            <div className="text-xl font-extrabold text-slate-900">{profitText}</div>
            <p className="text-xs text-slate-500 font-medium">{profitMarginText}</p>
          </div>

          {/* ORIGINAL SELL */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              ORIGINAL SELL
            </span>
            <div className="text-xl font-extrabold text-slate-900">{adjustedSellText}</div>
            <p className="text-xs text-slate-500 font-medium">Before override</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            onClick={handleApply}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
          >
            Apply to Quote & SOW
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
          >
            Reset Overrides
          </Button>
        </div>
      </div>
    </div>
  );
}
