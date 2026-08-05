import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation/quotation.store";

export function QuoteMarginTab() {
  const {
    installCost,
    setInstallCost,
    installSell,
    setInstallSell,
  } = useQuotationStore();

  // Local state for Sales Tax and Overrides
  const [zipCode, setZipCode] = useState("");
  const [taxPercent, setTaxPercent] = useState("0");
  const [includeTax, setIncludeTax] = useState(true);

  // Overrides state
  const [laborOverride, setLaborOverride] = useState("");
  const [targetMargin, setTargetMargin] = useState("");
  const [fixedSellOverride, setFixedSellOverride] = useState("");

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleApply = () => {
    setSuccessMessage("Margin overrides applied to Quote & SOW successfully!");
    setSuccessDialogOpen(true);
  };

  const handleReset = () => {
    setLaborOverride("");
    setTargetMargin("");
    setFixedSellOverride("");
    setSuccessMessage("Overrides have been reset to default values!");
    setSuccessDialogOpen(true);
  };

  // Erection calculations
  const totalSellVal = 584375;
  const totalProfitVal = 206250;
  const marginPercentVal = 35.3;

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
              Blended material markup
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
            <div className="text-3xl md:text-4xl font-extrabold">$326,563</div>

            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>💰</span>
              <span>$-65,538 profit · -20.1% margin</span>
            </div>

            <div className="text-[11px] text-blue-100 space-y-1 pt-1 font-medium leading-relaxed">
              <p>Mat $-65,538 · Install $206,250</p>
              <p>Mat: $199,023 · Install: $584,375 · $4.75/SF</p>
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
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="sm:col-span-5 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  className="sm:col-span-4 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer h-9"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search
                </Button>
                <div className="sm:col-span-3 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 flex items-center justify-between bg-slate-50/50">
                  <input
                    type="text"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-800"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIncludeTax(!includeTax)}
                className={`w-4 h-4 rounded flex items-center justify-center border text-white transition-colors cursor-pointer ${
                  includeTax ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
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
                value={laborOverride || 0}
                onChange={(e) => setLaborOverride(e.target.value)}
                className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-600">
                Auto
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
                value={targetMargin || 0}
                onChange={(e) => setTargetMargin(e.target.value)}
                className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-600">
                Auto
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
              value={fixedSellOverride}
              onChange={(e) => setFixedSellOverride(e.target.value)}
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
            <div className="text-xl font-extrabold text-slate-900">$219,262</div>
            <p className="text-xs text-slate-500 font-medium">$3.19/SF</p>
          </div>

          {/* TOTAL COST */}
          <div className="border border-blue-500 rounded-xl p-4 bg-slate-50/50 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              TOTAL COST
            </span>
            <div className="text-xl font-extrabold text-slate-900">$168,663</div>
            <p className="text-xs text-slate-500 font-medium">Mat + freight + labor</p>
          </div>

          {/* PROFIT */}
          <div className="border border-emerald-500 rounded-xl p-4 bg-slate-50/50 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              PROFIT
            </span>
            <div className="text-xl font-extrabold text-slate-900">$50,599</div>
            <p className="text-xs text-slate-500 font-medium">23.1% margin</p>
          </div>

          {/* ORIGINAL SELL */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              ORIGINAL SELL
            </span>
            <div className="text-xl font-extrabold text-slate-900">$219,262</div>
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
