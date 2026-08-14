import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";

export function QuoteInsulationTab() {
  // Config state
  const [insulationSystem, setInsulationSystem] = useState<
    "Vinyl-backed (single layer)" | "Double-layer system" | "Spray Foam"
  >("Vinyl-backed (single layer)");
  const [rValueRoof, setRValueRoof] = useState("R-19");
  const [rValueWalls, setRValueWalls] = useState("R-13");
  const [cogsSf, setCogsSf] = useState(1.5);
  const [targetMarginPct, setTargetMarginPct] = useState(25);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Base building footprint constant
  const areaSqFt = 68750;

  // Calculation logic
  const totalCogs = areaSqFt * cogsSf;
  const marginDecimal = targetMarginPct / 100;
  const totalSell = marginDecimal < 1 ? totalCogs / (1 - marginDecimal) : totalCogs;
  const sellSf = totalSell / areaSqFt;
  const totalProfit = totalSell - totalCogs;

  const handleApply = () => {
    setSuccessMessage("Insulation calculations and SOW inclusions applied successfully!");
    setSuccessDialogOpen(true);
  };

  const handleReset = () => {
    setInsulationSystem("Vinyl-backed (single layer)");
    setRValueRoof("R-19");
    setRValueWalls("R-13");
    setCogsSf(1.5);
    setTargetMarginPct(25);
    setAdditionalNotes("");
    setSuccessMessage("Insulation settings reset to defaults!");
    setSuccessDialogOpen(true);
  };

  const sowInclusions = [
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
      <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-2xs space-y-8">
        {/* Header Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <span>🛖</span>
            <span>Insulation — Cost, Profit & SOW</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Priced per SF of building footprint · set COGS $/SF then target margin
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Insulation System & R-Values (5 cols) */}
            <div className="md:col-span-4 space-y-5">
              {/* Insulation System Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Insulation System
                </label>
                <div className="space-y-2.5">
                  {[
                    "Vinyl-backed (single layer)",
                    "Double-layer system",
                    "Spray Foam",
                  ].map((system) => {
                    const isSelected = insulationSystem === system;
                    return (
                      <button
                        key={system}
                        type="button"
                        onClick={() =>
                          setInsulationSystem(
                            system as
                              | "Vinyl-backed (single layer)"
                              | "Double-layer system"
                              | "Spray Foam"
                          )
                        }
                        className={`w-full py-3 px-4 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? "border-purple-500 bg-purple-50/50 text-slate-900 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-purple-600 bg-purple-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span>{system}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* R-Value - Roof Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  R-Value — Roof
                </label>
                <div className="relative">
                  <select
                    value={rValueRoof}
                    onChange={(e) => setRValueRoof(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer pr-10"
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

              {/* R-Value - Walls Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  R-Value — Walls
                </label>
                <div className="relative">
                  <select
                    value={rValueWalls}
                    onChange={(e) => setRValueWalls(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer pr-10"
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

            {/* Middle Column: Sliders (4 cols) */}
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
                    value={cogsSf}
                    onChange={(e) => setCogsSf(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
                  />
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-900 min-w-16 text-center">
                    {cogsSf.toFixed(2)}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Your cost per SF of footprint
                </p>
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
                    value={targetMarginPct}
                    onChange={(e) => setTargetMarginPct(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-900 flex items-center gap-1 min-w-16 justify-between">
                    <span>{targetMarginPct}</span>
                    <span className="text-slate-400 font-normal">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Back-solves sell price from cost + margin
                </p>
              </div>
            </div>

            {/* Right Column: Live Result Card (4 cols) */}
            <div className="md:col-span-4 border border-slate-200 rounded-xl bg-slate-50/40 p-5 space-y-5 shadow-2xs">
              <span className="text-xs font-bold text-slate-800 block">
                Live Result
              </span>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {/* SYSTEM */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    SYSTEM
                  </span>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {insulationSystem.includes("Vinyl-backed") ? "Vinyl-Backed" : insulationSystem}
                  </span>
                </div>

                {/* AREA */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    AREA
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {areaSqFt.toLocaleString()} SF
                  </span>
                </div>

                {/* R-VALUES */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    R-VALUES
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    Roof {rValueRoof} / Wall {rValueWalls}
                  </span>
                </div>

                {/* COGS */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    COGS
                  </span>
                  <span className="text-xs font-extrabold text-orange-600 block">
                    ${Math.round(totalCogs).toLocaleString()} (${cogsSf.toFixed(2)}/SF)
                  </span>
                </div>

                {/* SELL */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    SELL
                  </span>
                  <span className="text-xs font-extrabold text-blue-600 block">
                    ${Math.round(totalSell).toLocaleString()} (${sellSf.toFixed(2)}/SF)
                  </span>
                </div>

                {/* PROFIT */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    PROFIT
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 block">
                    ${Math.round(totalProfit).toLocaleString()}
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
          <div className="flex flex-wrap items-center gap-3">
            {sowInclusions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50/70 border border-blue-100 rounded-full px-3 py-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Additional Notes Textarea */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-medium text-slate-400">
              Additional insulation notes for SOW
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. R-40 roof / R-30 walls in wash bay, exposed vapor barrier in storage area..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-slate-50/50 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
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
            className="border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
