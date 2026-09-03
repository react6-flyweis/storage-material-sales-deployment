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
  formatPercent2,
} from "../utils/quote-formatting";

interface QuoteInsulationTabProps {
  extractedShipper?: ExtractShipperResponseData;
  sqFt?: string;
  onTriggerCompute?: (overrides?: Partial<ComputeEstimateRequest>) => void;
}

export function QuoteInsulationTab({
  extractedShipper,
  onTriggerCompute,
}: QuoteInsulationTabProps) {
  const {
    insulationInclude,
    setInsulationInclude,
    insulationSystem,
    setInsulationSystem,
    insulationRValueRoof,
    setInsulationRValueRoof,
    insulationRValueWalls,
    setInsulationRValueWalls,
    insulationCogsSf,
    setInsulationCogsSf,
    insulationMarginPct,
    setInsulationMarginPct,
    insulationNotes,
    setInsulationNotes,
    insulationInclusions,
    toggleInsulationInclusion,
    resetInsulationSettings,
  } = useQuotationStore();

  // Dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fullQuote = extractedShipper?.fullQuote;

  // Insulation values directly from API fullQuote (no local fallback calculation)
  const totalCogs = fullQuote?.insulation?.cost ?? 0;
  const totalSell =
    fullQuote?.insulation?.appliedSell ?? fullQuote?.insulation?.sell ?? 0;
  const sellSf = fullQuote?.insulation?.sellSF ?? 0;
  const totalProfit = fullQuote?.insulation?.profit ?? 0;

  const handleApply = () => {
    setInsulationInclude(true);
    setSuccessMessage(
      "Insulation calculations and SOW inclusions applied successfully!"
    );
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      onTriggerCompute({
        insulation: {
          include: true,
          system: insulationSystem,
          rValueRoof: insulationRValueRoof,
          rValueWalls: insulationRValueWalls,
          rRoof: insulationRValueRoof,
          rWall: insulationRValueWalls,
          costSF: insulationCogsSf,
          cogsSF: insulationCogsSf,
          marginPct: insulationMarginPct,
        },
      });
    }
  };

  const handleReset = () => {
    resetInsulationSettings();
    setInsulationInclude(false);
    setSuccessMessage("Insulation settings reset to defaults!");
    setSuccessDialogOpen(true);
    if (onTriggerCompute) {
      onTriggerCompute({
        insulation: {
          include: false,
        },
      });
    }
  };

  const allSowInclusions = [
    "Roof insulation",
    "Wall insulation",
    "Vapor retarder / facing",
    "All labor & installation",
    "Seam tape & fasteners",
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
              <span>🛖</span>
              <span>Insulation — Cost, Profit & SOW</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Priced per total SF · set COGS $/SF then target margin
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                insulationInclude
                  ? "bg-[#2B6CB0] text-white"
                  : "border-2 border-slate-300 bg-white"
              }`}
            >
              {insulationInclude && <Check className="w-3 h-3 stroke-3" />}
            </div>
            <input
              type="checkbox"
              checked={insulationInclude}
              onChange={(e) => {
                const checked = e.target.checked;
                setInsulationInclude(checked);
                if (onTriggerCompute) {
                  onTriggerCompute({
                    insulation: {
                      include: checked,
                      system: insulationSystem,
                      rRoof: insulationRValueRoof,
                      rWall: insulationRValueWalls,
                      rValueRoof: insulationRValueRoof,
                      rValueWalls: insulationRValueWalls,
                      costSF: insulationCogsSf,
                      cogsSF: insulationCogsSf,
                      marginPct: insulationMarginPct,
                    },
                  });
                }
              }}
              className="hidden"
            />
            <span className="text-[#2B6CB0] font-bold text-xs">Include Insulation</span>
          </label>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: System & R-Values */}
            <div className="md:col-span-4 space-y-4">
              {/* Insulation System Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Insulation System
                </label>
                <div className="relative">
                  <select
                    value={insulationSystem}
                    onChange={(e) =>
                      setInsulationSystem(
                        e.target.value as
                          | "Vinyl-backed (single layer)"
                          | "Double-layer system"
                          | "Spray Foam"
                      )
                    }
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer pr-10"
                  >
                    <option value="Vinyl-backed (single layer)">
                      Vinyl-backed (single layer)
                    </option>
                    <option value="Double-layer system">
                      Double-layer system
                    </option>
                    <option value="Spray Foam">Spray Foam</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Roof R-Value Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Roof R-Value
                </label>
                <div className="relative">
                  <select
                    value={insulationRValueRoof}
                    onChange={(e) => setInsulationRValueRoof(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer pr-10"
                  >
                    <option value="R-10">R-10</option>
                    <option value="R-13">R-13</option>
                    <option value="R-19">R-19</option>
                    <option value="R-25">R-25</option>
                    <option value="R-30">R-30</option>
                    <option value="R-38">R-38</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Walls R-Value Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Walls R-Value
                </label>
                <div className="relative">
                  <select
                    value={insulationRValueWalls}
                    onChange={(e) => setInsulationRValueWalls(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer pr-10"
                  >
                    <option value="R-10">R-10</option>
                    <option value="R-13">R-13</option>
                    <option value="R-19">R-19</option>
                    <option value="R-25">R-25</option>
                    <option value="R-30">R-30</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Middle Column: Sliders */}
            <div className="md:col-span-4 space-y-6 pt-1">
              {/* COGS $/SF (Material + Labor) Slider */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  COGS $/SF (Material + Labor)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.50"
                    max="10.00"
                    step="0.05"
                    value={insulationCogsSf}
                    onChange={(e) =>
                      setInsulationCogsSf(parseFloat(e.target.value))
                    }
                    className="flex-1 accent-amber-500 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
                  />
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-900 min-w-16 text-center">
                    {insulationCogsSf.toFixed(2)}
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
                    value={insulationMarginPct}
                    onChange={(e) =>
                      setInsulationMarginPct(parseFloat(e.target.value))
                    }
                    className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-900 min-w-12 text-center">
                    {insulationMarginPct}
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
                {/* SYSTEM */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    SYSTEM
                  </span>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {insulationSystem.includes("Vinyl-backed")
                      ? "Vinyl-Backed"
                      : insulationSystem.includes("Double-layer")
                      ? "Double-Layer"
                      : insulationSystem}
                  </span>
                </div>

                {/* MARGIN */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    MARGIN
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {formatPercent2(insulationMarginPct)}
                  </span>
                </div>

                {/* R-VALUES */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    R-VALUES
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    Roof {insulationRValueRoof} / Wall {insulationRValueWalls}
                  </span>
                </div>

                {/* COGS */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    COGS
                  </span>
                  <span className="text-xs font-bold text-orange-600 block">
                    {formatCurrency2(totalCogs)} (${insulationCogsSf.toFixed(2)}/SF)
                  </span>
                </div>

                {/* SELL */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    SELL
                  </span>
                  <span className="text-xs font-bold text-blue-600 block">
                    {formatCurrency2(totalSell)} (${sellSf.toFixed(2)}/SF)
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

        {/* SOW Inclusions for Insulation */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-bold text-slate-800">
            SOW Inclusions for Insulation
          </label>
          <div className="flex flex-wrap items-center gap-4">
            {allSowInclusions.map((item, idx) => {
              const isSelected = insulationInclusions.includes(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleInsulationInclusion(item)}
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
              Additional insulation notes for SOW
            </label>
            <textarea
              rows={2}
              value={insulationNotes}
              onChange={(e) => setInsulationNotes(e.target.value)}
              placeholder="e.g. R-40 roof / R-30 walls in wash bay, exposed vapor barrier in storage area..."
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-slate-50/50 resize-none"
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
