import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Edit3,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import type { ExtractShipperResponseData } from "../estimates.api";
import {
  formatCurrency2,
  formatNumber2,
  formatPercent2,
  formatSfPrice2,
  formatRate2,
} from "../utils/quote-formatting";

interface QuoteBreakdownTabProps {
  onViewQuote: () => void;
  onViewSow: () => void;
  onQuotePreview: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  extractedShipper?: ExtractShipperResponseData;
  onSelectSf?: (sf: number) => void;
  isManualSqFt?: boolean;
}

function getCategoryBadgeStyle(cat?: string, label?: string): string {
  const c = (cat || label || "").toLowerCase();

  if (c.includes("primary") || c.includes("rigid") || c.includes("endwall")) {
    return "bg-[#1E3A8A] text-white shadow-2xs border border-blue-900";
  }
  if (c.includes("secondary") || c.includes("purlin") || c.includes("girt") || c.includes("eave")) {
    return "bg-[#059669] text-white shadow-2xs border border-emerald-700";
  }
  if (c.includes("opening") || c.includes("door") || c.includes("jamb") || c.includes("header")) {
    return "bg-[#D97706] text-white shadow-2xs border border-amber-700";
  }
  if (c.includes("sheeting") || c.includes("roof") || c.includes("wall") || c.includes("panel")) {
    return "bg-[#7C3AED] text-white shadow-2xs border border-purple-700";
  }
  if (c.includes("trim") || c.includes("flashing") || c.includes("gutter") || c.includes("downspout")) {
    return "bg-[#DC2626] text-white shadow-2xs border border-red-700";
  }
  if (c.includes("hardware") || c.includes("fastener") || c.includes("bolt") || c.includes("accessories")) {
    return "bg-slate-700 text-white shadow-2xs border border-slate-800";
  }
  if (c.includes("concrete")) {
    return "bg-amber-700 text-white shadow-2xs border border-amber-800";
  }
  if (c.includes("insulation")) {
    return "bg-indigo-600 text-white shadow-2xs border border-indigo-700";
  }

  return "bg-[#2563EB] text-white shadow-2xs border border-blue-700";
}

export function QuoteBreakdownTab({
  onViewQuote,
  onViewSow,
  onQuotePreview,
  onSaveDraft,
  isSavingDraft,
  extractedShipper,
  onSelectSf,
  isManualSqFt,
}: QuoteBreakdownTabProps) {
  const { scope } = useQuotationStore();
  const [isSfBannerDismissed, setIsSfBannerDismissed] = useState(false);

  const fullQuote = extractedShipper?.fullQuote;
  const pricing = extractedShipper?.pricing || fullQuote?.pricing;

  const totalSell = formatCurrency2(pricing?.totSell ?? fullQuote?.buildingSubtotal);
  const matCost = formatCurrency2(pricing?.matCost);
  const profit = formatCurrency2(pricing?.profit ?? fullQuote?.totalProfit);
  const profPct =
    pricing?.profPct != null
      ? `${formatPercent2(pricing.profPct)} margin`
      : fullQuote?.grandMargin != null
        ? `${formatPercent2(fullQuote.grandMargin)} margin`
        : "-";
  const sfPrice = formatSfPrice2(pricing?.sfPrice ?? fullQuote?.pricePerSf);
  const effectiveSqFt = pricing?.sf || extractedShipper?.squareFootage;
  const sqFt = effectiveSqFt ? formatNumber2(effectiveSqFt) : "-";
  const totalWeight = pricing?.totWt ?? extractedShipper?.totalWeightLbs;
  const weightDisplay = totalWeight != null ? `${formatNumber2(totalWeight)} lbs` : "-";
  const trucks = pricing?.trucks != null ? pricing.trucks : "-";
  const vendorBlendSavings = formatCurrency2(pricing?.vendorBlendSavings);
  const blendLabel = pricing?.blendLabel || "50% Quicken blend";
  const fileName = extractedShipper?.fileName || "";

  // Square Footage metadata from backend
  const sfMeta = extractedShipper?.squareFootageMeta;
  const weightSf = Number(sfMeta?.fromWeight || sfMeta?.selected || 0);
  const coverSf = Number(sfMeta?.coverDerivedSqft || 0);
  const hasSfMismatch =
    !isManualSqFt &&
    !isSfBannerDismissed &&
    weightSf > 0 &&
    coverSf > 0 &&
    weightSf !== coverSf;
  const diffPct =
    hasSfMismatch
      ? (Math.abs(weightSf - coverSf) / Math.max(weightSf, coverSf)) * 100
      : 0;

  let sfSubtitle = `${sqFt} SF`;
  if (sfMeta?.source === "weight_formula") {
    sfSubtitle += ` (from weight: ${formatNumber2(sfMeta.fromWeight ?? totalWeight ?? 0)} / 9)`;
  } else if (sfMeta?.source === "manual" || isManualSqFt) {
    sfSubtitle += " (manual override)";
  }
  if (sfMeta?.coverDerivedSqft) {
    sfSubtitle += ` · cover sheet SF: ${formatNumber2(sfMeta.coverDerivedSqft)}`;
  }

  const rows = pricing?.rows;

  const scopeLabel =
    scope?.toLowerCase() === "supply"
      ? "Supply Only"
      : scope?.toLowerCase() === "install"
        ? "Install Only"
        : "Supply & Install";

  return (
    <div className="space-y-6">
      {/* SF Mismatch Choice Banner at top of breakdown */}
      {hasSfMismatch && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-slate-800">
              <span className="font-bold text-amber-900">SF Mismatch Detected:</span>{" "}
              Weight formula gives <strong className="text-slate-900">{formatNumber2(weightSf)} SF</strong> while cover sheet gives <strong className="text-slate-900">{formatNumber2(coverSf)} SF</strong> ({diffPct.toFixed(1)}% difference). Choose which SF to use for pricing.
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => onSelectSf?.(weightSf)}
              className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white text-xs px-3 py-1.5 h-auto font-semibold cursor-pointer"
            >
              Use Weight SF
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onSelectSf?.(coverSf)}
              className="border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs px-3 py-1.5 h-auto font-semibold cursor-pointer"
            >
              Use Cover SF
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsSfBannerDismissed(true)}
              className="text-slate-600 hover:text-slate-900 text-xs px-2.5 py-1.5 h-auto cursor-pointer"
            >
              Keep Current
            </Button>
          </div>
        </div>
      )}

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL SELL */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-slate-300 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            TOTAL SELL
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{totalSell}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{scopeLabel}</div>
        </div>

        {/* MATERIAL COST */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-slate-300 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            MATERIAL COST
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{matCost}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{blendLabel}</div>
        </div>

        {/* PROFIT & MARGIN */}
        <div className="bg-[#E6F4EA] border border-emerald-300 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase block">
            PROFIT & MARGIN
          </span>
          <div className="text-lg font-extrabold text-emerald-700 mt-1">{profit}</div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">{profPct}</div>
        </div>

        {/* $/SF PRICE */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-slate-300 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            $/SF PRICE
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{sfPrice}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{sqFt} SF</div>
        </div>

        {/* SHIPPER WEIGHT */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-slate-300 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            SHIPPER WEIGHT
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{weightDisplay}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{trucks} Trucks</div>
        </div>

        {/* VENDOR SAVINGS */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-blue-500 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-blue-800 uppercase block">
            VENDOR SAVINGS
          </span>
          <div className="text-lg font-extrabold text-blue-700 mt-1">{vendorBlendSavings}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5 truncate">{fileName || "Shipper"}</div>
        </div>
      </div>

      {/* Weight + Price by Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Weight + Price by Category</h3>
          <p className="text-xs text-slate-500">
            {fileName ? `${fileName} · ${sfSubtitle} · ${weightDisplay}` : "No shipper file loaded"}
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Link to="/quotation/pricing-rules">
            <Edit3 className="h-3.5 w-3.5" />
            Edit Pricing Rules
          </Link>
        </Button>
      </div>

      {/* Category Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="p-3">CATEGORY</th>
              <th className="p-3">WEIGHT (LBS)</th>
              <th className="p-3">RATE</th>
              <th className="p-3">PRICE</th>
              <th className="p-3">NOTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
            {rows && rows.length > 0 ? (
              rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${getCategoryBadgeStyle(r.cat, r.label)}`}>
                      {r.label}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    {r.wt != null ? formatNumber2(r.wt) : "-"}
                  </td>
                  <td className="p-3 text-slate-600">
                    {formatRate2(r.rate)}
                  </td>
                  <td className="p-3 font-bold text-slate-900">
                    {r.price != null ? formatCurrency2(r.price) : "-"}
                  </td>
                  <td className="p-3 text-slate-500">{r.notes || "-"}</td>
                </tr>
              ))
            ) : extractedShipper?.tabSummary && extractedShipper.tabSummary.length > 0 ? (
              extractedShipper.tabSummary.map((tab, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${getCategoryBadgeStyle(tab.category, tab.sheetName)}`}>
                      {tab.sheetName}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    {tab.weightLbs != null ? formatNumber2(tab.weightLbs) : "-"}
                  </td>
                  <td className="p-3 text-slate-600">-</td>
                  <td className="p-3 font-bold text-slate-900">-</td>
                  <td className="p-3 text-slate-500">{tab.category || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 font-normal">
                  Upload an Xshipper (.xlsx) file to view material breakdown & pricing rules.
                </td>
              </tr>
            )}

            {/* Category subtotal (before blend) Row */}
            <tr className="hover:bg-slate-50/60 transition-colors border-t border-slate-200">
              <td className="p-3 text-slate-700">Category subtotal (before blend)</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">
                {pricing?.rowSubtotalBeforeBlend != null
                  ? formatCurrency2(pricing.rowSubtotalBeforeBlend)
                  : "-"}
              </td>
              <td className="p-3 text-slate-500">Sum of visible category prices</td>
            </tr>

            {/* Vendor Blend Adjustment Row */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="p-3 text-slate-700">Vendor blend adjustment</td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-700">{pricing?.blendLabel || blendLabel}</td>
              <td className="p-3 font-semibold text-slate-900">
                {pricing?.vendorBlendAdjustment != null
                  ? formatCurrency2(pricing.vendorBlendAdjustment)
                  : "-"}
              </td>
              <td className="p-3 text-slate-500">Quicken/Central blended cost delta</td>
            </tr>

            {/* Material total (after blend) Row */}
            <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
              <td className="p-3 text-slate-900 font-bold">Material total (after blend)</td>
              <td className="p-3 text-slate-900 font-bold">
                {totalWeight != null ? `${formatNumber2(totalWeight)} lbs` : "-"}
              </td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-900 font-bold">{matCost}</td>
              <td className="p-3 text-xs font-normal text-slate-500">
                {pricing?.rowSubtotalBeforeBlend != null && pricing?.vendorBlendAdjustment != null
                  ? `Before blend ${formatCurrency2(pricing.rowSubtotalBeforeBlend)} ${
                      pricing.vendorBlendAdjustment < 0
                        ? `- ${formatCurrency2(Math.abs(pricing.vendorBlendAdjustment))}`
                        : `+ ${formatCurrency2(pricing.vendorBlendAdjustment)}`
                    }`
                  : ""}
              </td>
            </tr>

            <tr>
              <td className="p-3 text-slate-700">Freight ({trucks} trucks)</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">
                {formatCurrency2(pricing?.freight, "$0.00")}
              </td>
              <td className="p-3"></td>
            </tr>

            {scope?.toLowerCase() !== "supply" && (
              <>
                <tr>
                  <td className="p-3 text-slate-700">Install cost</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3 font-semibold text-slate-900">
                    {formatCurrency2(pricing?.instCost, "$0.00")}
                  </td>
                  <td className="p-3"></td>
                </tr>

                <tr className="bg-slate-50/90 font-bold border-t border-b border-slate-200">
                  <td className="p-3 text-slate-900 font-bold">Total cost</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3 text-slate-900 font-bold">
                    {formatCurrency2(pricing?.totCost)}
                  </td>
                  <td className="p-3"></td>
                </tr>

                <tr>
                  <td className="p-3 text-slate-700">Install sell</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3 font-semibold text-slate-900">
                    {formatCurrency2(pricing?.instSell, "$0.00")}
                  </td>
                  <td className="p-3"></td>
                </tr>
              </>
            )}

            {/* Final SELL PRICE Row */}
            <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
              <td className="p-3 text-slate-900 font-extrabold text-sm uppercase">SELL PRICE</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-900 font-extrabold text-sm">{totalSell}</td>
              <td className="p-3 text-slate-900 font-bold text-xs">{sfPrice}/SF</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            onClick={onViewQuote}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            View Quote
          </Button>

          <Button
            type="button"
            onClick={onViewSow}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-white flex items-center gap-1.5"
          >
            View SOW
          </Button>

          <Button
            type="button"
            onClick={onQuotePreview}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
          >
            Quote Preview
          </Button>
        </div>

        {onSaveDraft && (
          <Button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-2"
          >
            {isSavingDraft && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSavingDraft ? "Saving..." : "Save to History"}
          </Button>
        )}
      </div>
    </div>
  );
}

