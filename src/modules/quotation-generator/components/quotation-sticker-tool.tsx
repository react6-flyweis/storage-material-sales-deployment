import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";

const roofOptions = [
  { value: "screw-down", label: "Screw Down (SD)" },
  { value: "standing-seam", label: "Standing Seam (SS)" },
];

export function QuotationStickerTool() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    jobType,
    setJobType,
    scope,
    setScope,
    roofType,
    setRoofType,
    installCost,
    setInstallCost,
    installSell,
    setInstallSell,
    blendPercentage,
    setBlendPercentage,
  } = useQuotationStore();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const laborProfit = installSell - installCost;
  const laborMarginPct = installSell > 0 ? (laborProfit / installSell) * 100 : 0;

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow px-4 py-3 mb-6 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-4 gap-x-6 text-sm">
        {/* JOB TYPE SECTION */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase">
              JOB TYPE
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setJobType("PEMB");
                  if (location.pathname.includes("/quotation/storage")) {
                    navigate("/quotation/extracted-drawing");
                  }
                }}
                className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-all cursor-pointer ${jobType === "PEMB"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                PEMB
              </button>
              <button
                type="button"
                onClick={() => {
                  setJobType("Storage");
                  if (!location.pathname.includes("/quotation/storage")) {
                    navigate("/quotation/storage");
                  }
                }}
                className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-all cursor-pointer ${jobType === "Storage"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                Storage
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-slate-200 self-end mb-1 hidden sm:block" />

          {/* SCOPE SECTION */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase">
              SCOPE
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setScope("Supply")}
                className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-all cursor-pointer ${scope === "Supply"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                Supply
              </button>
              <button
                type="button"
                onClick={() => setScope("Install")}
                className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-all cursor-pointer ${scope === "Install"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setScope("Both")}
                className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-all cursor-pointer ${scope === "Both"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-slate-200 self-end mb-1 hidden md:block" />

          {/* ROOF TYPE SECTION */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase">
              ROOF TYPE
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-800 text-sm shadow-2xs min-w-50 cursor-pointer"
                >
                  <span>
                    {roofOptions.find((opt) => opt.value === roofType)?.label || roofType}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-50">
                {roofOptions.map((opt) => (
                  <DropdownMenuItem key={opt.value} onClick={() => setRoofType(opt.value)}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-slate-200 self-end mb-1 hidden lg:block" />
          {/* RIGHT SECTION: ADJUSTMENTS & MARGIN */}
          <div className="flex items-center gap-5">
            {/* Adjustments Section with Popover */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="flex flex-col items-center gap-2 p-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-2xs cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 text-slate-800 font-medium text-sm pr-1">
                    <span>Adjustments</span>
                    {isPopoverOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-700" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>

                  {/* Mini Slider Graphic */}
                  <div className="relative w-28 h-3 bg-slate-700 rounded-full flex items-center px-0.5 ml-1 overflow-hidden">
                    <div
                      className="absolute h-4 w-4 bg-amber-500 rounded-full border-2 border-amber-400 shadow-md -translate-x-1/2"
                      style={{ left: `${Math.min(Math.max(blendPercentage, 5), 95)}%` }}
                    />
                    <div
                      className="h-full bg-amber-500 rounded-l-full"
                      style={{ width: `${blendPercentage}%` }}
                    />
                  </div>
                </div>
              </PopoverTrigger>

              {/* FLOATING POPOVER CONTENT */}
              <PopoverContent
                align="start"
                side="bottom"
                sideOffset={8}
                className="w-[320px] p-4 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-900"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-semibold text-base text-slate-900">Adjustments</h3>
                  <button
                    type="button"
                    onClick={() => setIsPopoverOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    <ChevronUp className="h-5 w-5 text-slate-800" />
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {/* 1. INSTALL COST $/SF */}
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-2">
                    <span className="text-xs font-bold tracking-wide text-slate-900 uppercase block">
                      INSTALL COST $/SF
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="3"
                        max="10"
                        step="0.05"
                        value={installCost}
                        onChange={(e) => setInstallCost(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-amber-600 shrink-0">
                        ${installCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 2. INSTALL SELL $/SF */}
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-2">
                    <span className="text-xs font-bold tracking-wide text-slate-900 uppercase block">
                      INSTALL SELL $/SF
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="7.5"
                        max="15"
                        step="0.05"
                        value={installSell}
                        onChange={(e) => setInstallSell(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-emerald-600 shrink-0">
                        ${installSell.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 3. LABOR MARGIN BOX */}
                  <div className="p-3 rounded-lg bg-[#0F3C70] text-white space-y-0.5">
                    <div className="text-xs font-semibold text-slate-200">Labor Margin</div>
                    <div className={`text-xs font-bold ${laborProfit < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      ${laborProfit.toFixed(2)}/SF profit · {laborMarginPct.toFixed(1)}% margin
                    </div>
                  </div>

                  {/* 4. INSTALL COST $/SF (Central / Quicken Blend) */}
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-2">
                    <span className="text-xs font-bold tracking-wide text-slate-900 uppercase block">
                      Vendor Blend
                    </span>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                      <span>Central</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={blendPercentage}
                        onChange={(e) => setBlendPercentage(parseInt(e.target.value))}
                        className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span>Quicken</span>
                    </div>
                    <div className="text-center space-y-0.5 pt-0.5">
                      <div className="text-xs font-semibold text-purple-400">
                        {blendPercentage}% blend
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        $475 saved vs Central
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Labor Margin Info */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                Labor Margin
              </span>
              <span className={`text-xs font-semibold leading-tight mt-0.5 ${laborProfit < 0 ? "text-red-600" : "text-emerald-600"}`}>
                ${laborProfit.toFixed(2)}/SF profit · {laborMarginPct.toFixed(1)}% margin
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

