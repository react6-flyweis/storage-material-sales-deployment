import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";

export function QuoteConcreteTab() {
  // Config state
  const [slabThickness, setSlabThickness] = useState<'4"' | '6"'>('6"');
  const [psiRating, setPsiRating] = useState("4000 PSI");
  const [installCostSf, setInstallCostSf] = useState(7.25);
  const [targetMarginPct, setTargetMarginPct] = useState(25);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Base building footprint constant
  const areaSqFt = 68750;

  // Calculation logic
  const totalCost = areaSqFt * installCostSf;
  const marginDecimal = targetMarginPct / 100;
  const totalSell = marginDecimal < 1 ? totalCost / (1 - marginDecimal) : totalCost;
  const sellCostSf = totalSell / areaSqFt;
  const totalProfit = totalSell - totalCost;

  const handleApply = () => {
    setSuccessMessage("Concrete calculations and SOW inclusions applied successfully!");
    setSuccessDialogOpen(true);
  };

  const handleReset = () => {
    setSlabThickness('6"');
    setPsiRating("4000 PSI");
    setInstallCostSf(7.25);
    setTargetMarginPct(25);
    setAdditionalNotes("");
    setSuccessMessage("Concrete settings reset to defaults!");
    setSuccessDialogOpen(true);
  };

  const sowInclusions = [
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
      <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-2xs space-y-8">
        {/* Header Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <span>🪨</span>
            <span>Concrete — Cost, Profit & SOW</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Priced per SF of building footprint · defaults to $7.25 install cost/SF
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column - Controls & Live Result */}
            <div className="space-y-6">
              {/* Slab Thickness */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Slab Thickness
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSlabThickness('4"')}
                    className={`py-2.5 px-4 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      slabThickness === '4"'
                        ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    4" Slab
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlabThickness('6"')}
                    className={`py-2.5 px-4 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      slabThickness === '6"'
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    6" Slab
                  </button>
                </div>
              </div>

              {/* PSI Rating Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  PSI Rating
                </label>
                <div className="relative">
                  <select
                    value={psiRating}
                    onChange={(e) => setPsiRating(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer pr-10"
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

              {/* Live Result Card */}
              <div className="border border-slate-200 rounded-xl bg-slate-50/40 p-5 space-y-4 shadow-2xs">
                <span className="text-xs font-bold text-slate-800 block">
                  Live Result
                </span>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  {/* SLAB */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      SLAB
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">
                      {slabThickness} · {psiRating}
                    </span>
                  </div>

                  {/* AREA */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      AREA
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">
                      {areaSqFt.toLocaleString()} SF
                    </span>
                  </div>

                  {/* COST */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      COST
                    </span>
                    <span className="text-sm font-extrabold text-orange-600 block">
                      ${Math.round(totalCost).toLocaleString()} (${installCostSf.toFixed(2)}/SF)
                    </span>
                  </div>

                  {/* SELL */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      SELL
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 block">
                      ${Math.round(totalSell).toLocaleString()} (${sellCostSf.toFixed(2)}/SF)
                    </span>
                  </div>

                  {/* PROFIT */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      PROFIT
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600 block">
                      ${Math.round(totalProfit).toLocaleString()}
                    </span>
                  </div>

                  {/* MARGIN */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      MARGIN
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600 block">
                      {targetMarginPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sliders & Inputs */}
            <div className="space-y-6">
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
                    value={installCostSf}
                    onChange={(e) => setInstallCostSf(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
                  />
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-900 min-w-16 text-center">
                    {installCostSf.toFixed(2)}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Per SF of building footprint
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
          </div>
        </div>

        {/* SOW Inclusions for Concrete */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-bold text-slate-800">
            SOW Inclusions for Concrete
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
              Additional concrete notes for SOW
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. 6&quot; tall block wash bay wall, special drain requirements..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 resize-none"
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
