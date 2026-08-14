import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";

export function QuoteCogsTab() {
  // Step 1 states
  const [costInput, setCostInput] = useState("525000");
  const [costAdjustPercent, setCostAdjustPercent] = useState(0);

  // Step 2 states
  const [materialMargin, setMaterialMargin] = useState(20);
  const [fixedSellPrice, setFixedSellPrice] = useState("");

  // Dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Base shipper values
  const baseCogs = 168663;

  // Calculation logic
  const adjustedCogs = parseFloat(costInput) || baseCogs;
  const costDiff = adjustedCogs - baseCogs;

  // Calculate material sell based on margin or fixed sell
  const targetMarginDecimal = materialMargin / 100;
  const computedMaterialSell = targetMarginDecimal < 1 ? adjustedCogs / (1 - targetMarginDecimal) : adjustedCogs;
  const materialSell = fixedSellPrice !== "" ? (parseFloat(fixedSellPrice) || computedMaterialSell) : computedMaterialSell;
  const totalProfit = materialSell - adjustedCogs;
  const overallMargin = materialSell > 0 ? (totalProfit / materialSell) * 100 : 0;

  const handleApply = () => {
    setSuccessMessage("COGS & Target Margin applied to Quote & SOW successfully!");
    setSuccessDialogOpen(true);
  };

  const handleReset = () => {
    setCostInput(baseCogs.toString());
    setCostAdjustPercent(0);
    setMaterialMargin(20);
    setFixedSellPrice("");
    setSuccessMessage("Values reset to default shipper numbers!");
    setSuccessDialogOpen(true);
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
              $168,663
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              COMPUTED SELL
            </span>
            <span className="text-sm md:text-base font-extrabold text-blue-600">
              $219,262
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              COMPUTED MARGIN
            </span>
            <span className="text-sm md:text-base font-extrabold text-emerald-500">
              23.1%
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              $/SF
            </span>
            <span className="text-sm md:text-base font-extrabold text-slate-900">
              $2.45 Cost / $3.19 Sell
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
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
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
                  value={costAdjustPercent}
                  onChange={(e) => {
                    const pct = parseFloat(e.target.value);
                    setCostAdjustPercent(pct);
                    const newCost = Math.round(baseCogs * (1 + pct / 100));
                    setCostInput(newCost.toString());
                  }}
                  className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <span className="text-xs font-bold text-orange-600 min-w-[2.5rem] text-right">
                  {costAdjustPercent}%
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
                  value={materialMargin}
                  onChange={(e) => setMaterialMargin(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="border border-slate-300 rounded-md px-3 py-1 bg-white text-xs font-bold text-slate-900 flex items-center gap-1.5 min-w-[4rem] justify-between shadow-2xs">
                  <span>{materialMargin}</span>
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
                value={fixedSellPrice}
                onChange={(e) => setFixedSellPrice(e.target.value)}
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
              {materialMargin.toFixed(1)}% mat margin · ${costDiff >= 0 ? `-${Math.abs(costDiff).toLocaleString()}` : `+${Math.abs(costDiff).toLocaleString()}`}
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
