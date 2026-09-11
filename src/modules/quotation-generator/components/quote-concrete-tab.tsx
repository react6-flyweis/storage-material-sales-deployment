import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import type {
  ExtractShipperResponseData,
  ComputeEstimateRequest,
} from "../estimates.api";
import {
  formatCurrency2,
  formatNumber2,
  formatPercent2,
} from "../utils/quote-formatting";

interface QuoteConcreteTabProps {
  extractedShipper?: ExtractShipperResponseData;
  sqFt?: string;
  onTriggerCompute?: (overrides?: Partial<ComputeEstimateRequest>) => void;
}

export function QuoteConcreteTab({
  extractedShipper,
  sqFt: propSqFt,
  onTriggerCompute,
}: QuoteConcreteTabProps) {
  const {
    concreteInclude,
    setConcreteInclude,
    concreteCostSf,
    setConcreteCostSf,
    concreteMarginPct,
    setConcreteMarginPct,
    concreteSlabThickness,
    setConcreteSlabThickness,
    concretePsiRating,
    setConcretePsiRating,
    concreteNotes,
    setConcreteNotes,
    concreteInclusions,
    toggleConcreteInclusion,
    resetConcreteSettings,
  } = useQuotationStore();

  // Dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fullQuote = extractedShipper?.fullQuote;

  // Base building footprint
  const areaSqFt =
    parseFloat(propSqFt || "") ||
    extractedShipper?.squareFootage ||
    0;

  // Concrete values directly from API fullQuote (no local fallback calculation)
  const totalCost = fullQuote?.concrete?.cost ?? 0;
  const totalSell =
    fullQuote?.concrete?.appliedSell ?? fullQuote?.concrete?.sell ?? 0;
  const sellCostSf = fullQuote?.concrete?.sellSF ?? 0;
  const totalProfit = fullQuote?.concrete?.profit ?? 0;

  const handleApply = () => {
    setConcreteInclude(true);
    setSuccessMessage(
      "Concrete calculations and SOW inclusions applied successfully!"
    );
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      onTriggerCompute({
        concrete: {
          include: true,
          costSF: concreteCostSf,
          marginPct: concreteMarginPct,
          slabThickness: concreteSlabThickness,
          psiRating: concretePsiRating,
          thickness: concreteSlabThickness,
          psi: concretePsiRating,
        },
      });
    }
  };

  const handleReset = () => {
    resetConcreteSettings();
    setConcreteInclude(false);
    setSuccessMessage("Concrete settings reset to defaults!");
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      onTriggerCompute({
        concrete: {
          include: false,
        },
      });
    }
  };

  const allSowInclusions = [
    "Pier excavation & placement",
    "Reinforced rebar system (tied)",
    "10mm vapor barrier",
    'Smooth finish (±1/10" tolerance)',
    "All labor, equipment & materials",
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Success Dialog */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successMessage}
      />

      {/* Main Container Card */}
      <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-2xs space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <span>🪨</span>
              <span>Concrete — Cost, Profit & SOW</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Priced per SF of building footprint · defaults to $7.25 install cost/SF
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                concreteInclude
                  ? "bg-[#2B6CB0] text-white"
                  : "border-2 border-slate-300 bg-white"
              }`}
            >
              {concreteInclude && <Check className="w-3 h-3 stroke-3" />}
            </div>
            <input
              type="checkbox"
              checked={concreteInclude}
              onChange={(e) => {
                const checked = e.target.checked;
                setConcreteInclude(checked);
                if (onTriggerCompute) {
                  onTriggerCompute({
                    concrete: {
                      include: checked,
                      costSF: concreteCostSf,
                      marginPct: concreteMarginPct,
                      thickness: concreteSlabThickness,
                      psi: concretePsiRating,
                      slabThickness: concreteSlabThickness,
                      psiRating: concretePsiRating,
                    },
                  });
                }
              }}
              className="hidden"
            />
            <span className="text-[#2B6CB0] font-bold text-xs">Include Concrete</span>
          </label>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Slab Thickness & PSI Rating */}
            <div className="md:col-span-4 space-y-4">
              {/* Slab Thickness */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Slab Thickness
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConcreteSlabThickness('4"')}
                    className={`py-2.5 px-4 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      concreteSlabThickness === '4"'
                        ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    4" Slab
                  </button>
                  <button
                    type="button"
                    onClick={() => setConcreteSlabThickness('6"')}
                    className={`py-2.5 px-4 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      concreteSlabThickness === '6"'
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    6" Slab
                  </button>
                </div>
              </div>

              {/* PSI Rating Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  PSI Rating
                </label>
                <div className="relative">
                  <select
                    value={concretePsiRating}
                    onChange={(e) => setConcretePsiRating(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer pr-10"
                  >
                    <option value="3000 PSI">3000 PSI</option>
                    <option value="3500 PSI">3500 PSI</option>
                    <option value="4000 PSI">4000 PSI</option>
                    <option value="4500 PSI">4500 PSI</option>
                    <option value="5000 PSI">5000 PSI</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Middle Column: Sliders */}
            <div className="md:col-span-4 space-y-6 pt-1">
              {/* Install Cost $/SF Slider */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Install Cost $/SF
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3.00"
                    max="15.00"
                    step="0.05"
                    value={concreteCostSf}
                    onChange={(e) => setConcreteCostSf(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
                  />
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-900 min-w-16 text-center">
                    {concreteCostSf.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Target Margin % Slider */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  Target Margin %
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={concreteMarginPct}
                    onChange={(e) => setConcreteMarginPct(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-900 min-w-12 text-center">
                    {concreteMarginPct}
                  </div>
                  <span className="text-xs text-slate-600 font-normal">%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Result Card */}
            <div className="md:col-span-4 border border-slate-200 rounded-xl bg-white p-5 space-y-4 shadow-2xs">
              <span className="text-xs font-bold text-slate-900 block">
                Live Result
              </span>

              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                {/* SLAB */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    SLAB
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {concreteSlabThickness} · {concretePsiRating}
                  </span>
                </div>

                {/* MARGIN */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    MARGIN
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {formatPercent2(concreteMarginPct)}
                  </span>
                </div>

                {/* AREA */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    AREA
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {formatNumber2(areaSqFt)} SF
                  </span>
                </div>

                {/* COST */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    COST
                  </span>
                  <span className="text-xs font-bold text-orange-600 block">
                    {formatCurrency2(totalCost)} (${concreteCostSf.toFixed(2)}/SF)
                  </span>
                </div>

                {/* SELL */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    SELL
                  </span>
                  <span className="text-xs font-bold text-blue-600 block">
                    {formatCurrency2(totalSell)} (${sellCostSf.toFixed(2)}/SF)
                  </span>
                </div>

                {/* PROFIT */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    PROFIT
                  </span>
                  <span className="text-xs font-bold text-emerald-600 block">
                    {formatCurrency2(totalProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOW Inclusions for Concrete */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-bold text-slate-800">
            SOW Inclusions for Concrete
          </label>
          <div className="flex flex-wrap items-center gap-4">
            {allSowInclusions.map((item, idx) => {
              const isSelected = concreteInclusions.includes(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleConcreteInclusion(item)}
                  className={`flex items-center gap-2 text-xs transition-all cursor-pointer select-none ${
                    isSelected
                      ? "text-[#2B6CB0] font-bold"
                      : "text-slate-500 font-medium hover:text-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected
                        ? "bg-[#2B6CB0] text-white"
                        : "border border-slate-300 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-3" /> : "+"}
                  </div>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          {/* Additional Notes Textarea */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-medium text-slate-400">
              Additional concrete notes for SOW
            </label>
            <textarea
              rows={2}
              value={concreteNotes}
              onChange={(e) => setConcreteNotes(e.target.value)}
              placeholder="e.g. Pier excavation, 10mm vapor barrier, smooth finish..."
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            onClick={handleApply}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-6 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            Apply to Quote & SOW
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="border-slate-300 text-slate-700 px-8 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer bg-white"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
