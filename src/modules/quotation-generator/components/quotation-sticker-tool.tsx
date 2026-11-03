import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Search,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import { taxLookupProvider, type Scope } from "../estimates.api";
import { formatCurrency2 } from "../utils/quote-formatting";

const roofOptions = [
  { value: "screw-down", label: "Screw Down (SD)" },
  { value: "standing-seam", label: "Standing Seam (SS)" },
];

interface ToolbarHoverSectionProps {
  label: string;
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "center" | "end";
  contentClassName?: string;
}

function ToolbarHoverSection({
  label,
  trigger,
  children,
  align = "start",
  contentClassName = "w-auto p-3",
}: ToolbarHoverSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col gap-1 shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-[10px] font-bold tracking-wider text-slate-800 uppercase select-none leading-none">
        {label}
      </span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="cursor-pointer"
          >
            {trigger}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          side="bottom"
          sideOffset={8}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`bg-white rounded-lg shadow-lg border border-slate-200 text-slate-900 ${contentClassName}`}
        >
          {children(close)}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function QuotationStickerTool() {
  const {
    jobType,
    setJobType,
    scope,
    setScope,
    roofType,
    setRoofType,
    steelFinish,
    setSteelFinish,
    installCost,
    setInstallCost,
    installSell,
    setInstallSell,
    blendPercentage,
    setBlendPercentage,
    freightOverride,
    setFreightOverride,
    engineeringDrawings,
    setEngineeringDrawings,
    taxZip,
    setTaxZip,
    taxRate,
    setTaxRate,
    includeTax,
    setIncludeTax,
    isTaxLoading,
    setIsTaxLoading,
    pembExtractedShipper,
  } = useQuotationStore();

  const [taxMessage, setTaxMessage] = useState("");

  const laborProfit = installSell - installCost;
  const laborMarginPct =
    installSell > 0 ? (laborProfit / installSell) * 100 : 0;

  // Exact dynamic savings calculation from extracted shipper pricing
  const fullQuote = pembExtractedShipper?.fullQuote;
  const pricing = pembExtractedShipper?.pricing || fullQuote?.pricing;
  const exactSavings =
    pricing?.vendorBlendSavingsExact ?? pricing?.vendorBlendSavings;
  const savingsDisplay =
    exactSavings != null
      ? formatCurrency2(exactSavings)
      : formatCurrency2((blendPercentage / 100) * 950);

  const handleTaxLookup = async () => {
    if (!taxZip || taxZip.trim().length === 0) return;
    setIsTaxLoading(true);
    setTaxMessage("");
    try {
      const res = await taxLookupProvider(taxZip);
      if (res?.success && res.data && typeof res.data === "object" && typeof res.data.rate === "number") {
        setTaxRate(res.data.rate);
        setTaxMessage(res.data.message || res.data.label || `${res.data.rate}%`);
      }
    } catch {
      // quiet fail
    } finally {
      setIsTaxLoading(false);
    }
  };

  const handleReset = () => {
    setJobType("PEMB");
    setScope("Install");
    setRoofType("screw-down");
    setSteelFinish("red-iron");
    setInstallCost(5.5);
    setInstallSell(8.5);
    setBlendPercentage(50);
    setFreightOverride("");
    setEngineeringDrawings("");
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-x-3 text-sm flex-nowrap overflow-x-auto thin-scrollbar px-4 py-2 ">
        {/* LEFT / CENTER SECTIONS: ALL FIT ON THE SAME LINE */}
        <div className="flex items-center gap-x-2 sm:gap-x-3 flex-nowrap shrink-0">
          {/* 1. JOB TYPE SECTION */}
          <ToolbarHoverSection
            label="JOB TYPE"
            trigger={
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60 items-center hover:bg-slate-200/50 transition-colors">
                <span className="px-3 py-1 rounded-md font-semibold text-xs bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
                  <span>{jobType}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                </span>
              </div>
            }
          >
            {(close) => (
              <div className="space-y-2 p-1 min-w-50">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Select Job Type
                </div>
                <div className="inline-flex w-full rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setJobType("PEMB");
                      close();
                    }}
                    className={`flex-1 px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                      jobType === "PEMB"
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
                      close();
                    }}
                    className={`flex-1 px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                      jobType === "Storage"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    Storage
                  </button>
                </div>
              </div>
            )}
          </ToolbarHoverSection>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 self-center hidden sm:block" />

          {/* 2. SCOPE SECTION */}
          <ToolbarHoverSection
            label="SCOPE"
            trigger={
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60 items-center hover:bg-slate-200/50 transition-colors">
                <span className="px-3 py-1 rounded-md font-semibold text-xs bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
                  <span>{scope}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                </span>
              </div>
            }
          >
            {(close) => (
              <div className="space-y-2 p-1 min-w-60">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Select Scope
                </div>
                <div className="inline-flex w-full rounded-lg p-0.5 bg-slate-100 border border-slate-200/60">
                  {(["Supply", "Install", "Both"] as Scope[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setScope(s);
                        close();
                      }}
                      className={`flex-1 px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                        scope === s
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ToolbarHoverSection>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 self-center hidden sm:block" />

          {/* 3. STEEL FINISH SECTION */}
          <ToolbarHoverSection
            label="STEEL FINISH"
            trigger={
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60 items-center hover:bg-slate-200/50 transition-colors">
                <span className="px-3 py-1 rounded-md font-semibold text-xs bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
                  {steelFinish === "red-iron" ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-white/80 shrink-0" />
                      <span>Red Iron</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-100 ring-1 ring-slate-400 shrink-0" />
                      <span>Galvanized</span>
                    </>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                </span>
              </div>
            }
          >
            {(close) => (
              <div className="space-y-2.5 p-1 min-w-62.5">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Select Steel Finish
                </div>
                <div className="inline-flex w-full rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSteelFinish("red-iron");
                      close();
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                      steelFinish === "red-iron"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-1 ring-white/60 shrink-0" />
                    <span>Red Iron</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSteelFinish("galvanized");
                      close();
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                      steelFinish === "galvanized"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 ring-1 ring-slate-400 shrink-0" />
                    <span>Galvanized</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Secondary: $1.069/lb (
                  {steelFinish === "red-iron" ? "Red Iron" : "Galvanized"})
                </div>
              </div>
            )}
          </ToolbarHoverSection>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 self-center hidden md:block" />

          {/* 4. ROOF TYPE SECTION */}
          <ToolbarHoverSection
            label="ROOF TYPE"
            trigger={
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60 items-center hover:bg-slate-200/50 transition-colors">
                <span className="px-3 py-1 rounded-md font-semibold text-xs bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
                  <span>
                    {roofOptions.find((opt) => opt.value === roofType)?.label ||
                      roofType}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                </span>
              </div>
            }
          >
            {(close) => (
              <div className="space-y-2 p-1 min-w-52.5">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Select Roof Type
                </div>
                <div className="space-y-1">
                  {roofOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setRoofType(opt.value);
                        close();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer ${
                        roofType === opt.value
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {roofType === opt.value && (
                        <Check className="h-3.5 w-3.5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ToolbarHoverSection>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 self-center hidden lg:block" />

          {/* 5. SHIPPING & DRAWINGS SECTION (NO ICON) */}
          <ToolbarHoverSection
            label="SHIPPING & DRAWINGS"
            contentClassName="w-72 p-3.5"
            trigger={
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100/80 border border-slate-200/60 items-center hover:bg-slate-200/50 transition-colors">
                <span className="px-3 py-1 rounded-md font-semibold text-xs bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
                  <span>
                    {freightOverride ? `$${freightOverride}` : "Auto"} · {engineeringDrawings ? `$${engineeringDrawings}` : "Auto"}
                    {includeTax ? ` · ${taxRate}%` : ""}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                </span>
              </div>
            }
          >
            {() => (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  <span className="tracking-wide uppercase font-extrabold text-slate-900">
                    SHIPPING & DRAWINGS
                  </span>
                </div>

                {/* 1. Freight Override */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Freight Override $ (Blank=Auto)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-slate-400 font-bold text-xs">
                      $
                    </span>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={freightOverride}
                      onChange={(e) => setFreightOverride(e.target.value)}
                      className="w-full pl-6 pr-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 2. Engineering Drawings */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Engineering Drawings $
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-slate-400 font-bold text-xs">
                      $
                    </span>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={engineeringDrawings}
                      onChange={(e) => setEngineeringDrawings(e.target.value)}
                      className="w-full pl-6 pr-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 3. Sales Tax % */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Sales Tax % (Materials Only)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="ZIP"
                      maxLength={5}
                      value={taxZip}
                      onChange={(e) => setTaxZip(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTaxLookup()}
                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 placeholder:text-slate-400 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleTaxLookup}
                      disabled={isTaxLoading}
                      className="px-2 py-1 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded-md text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors shrink-0"
                      title="Lookup Tax Rate"
                    >
                      {isTaxLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Search className="h-3 w-3" />
                      )}
                    </button>
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) =>
                          setTaxRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pr-5 pl-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                      />
                      <span className="absolute right-1.5 text-slate-500 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                  {taxMessage && (
                    <p className="text-[10px] text-blue-600 font-medium pt-0.5">
                      {taxMessage}
                    </p>
                  )}
                </div>

                {/* 4. Include Tax Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setIncludeTax(!includeTax)}
                      className={`w-4 h-4 rounded flex items-center justify-center border text-white transition-colors cursor-pointer ${
                        includeTax
                          ? "bg-blue-600 border-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {includeTax && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span className="text-xs font-semibold text-slate-800">
                      Include Tax On Quote
                    </span>
                  </label>
                </div>
              </div>
            )}
          </ToolbarHoverSection>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 self-center hidden lg:block" />

          {/* 6. ADJUSTMENTS SECTION */}
          <ToolbarHoverSection
            label="ADJUSTMENTS"
            contentClassName="w-80 p-4"
            trigger={
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-2xs cursor-pointer transition-colors">
                <div className="relative w-16 h-2.5 bg-slate-700 rounded-full flex items-center px-0.5 overflow-hidden">
                  <div
                    className="absolute h-3.5 w-3.5 bg-amber-500 rounded-full border-2 border-amber-400 shadow-sm -translate-x-1/2"
                    style={{
                      left: `${Math.min(Math.max(blendPercentage, 5), 95)}%`,
                    }}
                  />
                  <div
                    className="h-full bg-amber-500 rounded-l-full"
                    style={{ width: `${blendPercentage}%` }}
                  />
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </div>
            }
          >
            {(close) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-900">
                      Adjustments
                    </h3>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-md transition-colors cursor-pointer"
                      title="Reset Adjustments to defaults"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    <ChevronUp className="h-4 w-4 text-slate-700" />
                  </button>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* 1. INSTALL COST $/SF */}
                  <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wide text-slate-800 uppercase block">
                      INSTALL COST $/SF
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.05"
                        value={installCost}
                        onChange={(e) =>
                          setInstallCost(parseFloat(e.target.value))
                        }
                        className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-amber-600 shrink-0">
                        ${installCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 2. INSTALL SELL $/SF */}
                  <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wide text-slate-800 uppercase block">
                      INSTALL SELL $/SF
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="0.05"
                        value={installSell}
                        onChange={(e) =>
                          setInstallSell(parseFloat(e.target.value))
                        }
                        className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-emerald-600 shrink-0">
                        ${installSell.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 3. LABOR MARGIN BOX */}
                  <div className="p-2.5 rounded-lg bg-[#0F3C70] text-white space-y-0.5">
                    <div className="text-[11px] font-semibold text-slate-200">
                      Labor Margin
                    </div>
                    <div
                      className={`text-xs font-bold ${laborProfit < 0 ? "text-red-400" : "text-emerald-400"}`}
                    >
                      ${laborProfit.toFixed(2)}/SF profit ·{" "}
                      {laborMarginPct.toFixed(1)}% margin
                    </div>
                  </div>

                  {/* 4. VENDOR BLEND */}
                  <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wide text-slate-800 uppercase block">
                      Vendor Blend
                    </span>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                      <span>Central</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={blendPercentage}
                        onChange={(e) =>
                          setBlendPercentage(parseInt(e.target.value))
                        }
                        className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span>Quicken</span>
                    </div>
                    <div className="text-center space-y-0.5 pt-0.5">
                      <div className="text-xs font-semibold text-purple-600">
                        {blendPercentage}% blend
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {savingsDisplay} saved vs Central
                      </div>
                    </div>
                  </div>

                  {/* 5. RESET ACTION */}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>
            )}
          </ToolbarHoverSection>
        </div>

        {/* RIGHT SECTION: LABOR MARGIN READOUT & RESET */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase leading-none">
              Labor Margin
            </span>
            <span
              className={`text-xs font-bold leading-tight tabular-nums mt-1 ${laborProfit < 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              ${laborProfit.toFixed(2)}/SF · {laborMarginPct.toFixed(1)}%
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Reset All Adjustments"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
