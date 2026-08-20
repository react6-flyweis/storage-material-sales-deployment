import { Edit3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExtractShipperResponseData } from "../estimates.api";

interface QuoteBreakdownTabProps {
  onViewQuote?: () => void;
  onViewSow?: () => void;
  onQuotePreview?: () => void;
  extractedShipper?: ExtractShipperResponseData;
}

export function QuoteBreakdownTab({
  onViewQuote,
  onViewSow,
  onQuotePreview,
  extractedShipper,
}: QuoteBreakdownTabProps) {
  const pricing = extractedShipper?.pricing;

  const totalSell = pricing?.totSell != null ? `$${pricing.totSell.toLocaleString()}` : "-";
  const matCost = pricing?.matCost != null ? `$${pricing.matCost.toLocaleString()}` : "-";
  const profit = pricing?.profit != null ? `$${pricing.profit.toLocaleString()}` : "-";
  const profPct = pricing?.profPct != null ? `${pricing.profPct}% margin` : "-";
  const sfPrice = pricing?.sfPrice != null ? `$${pricing.sfPrice}` : "-";
  const sqFt = extractedShipper?.squareFootage ? extractedShipper.squareFootage.toLocaleString() : "-";
  const totalWeight = extractedShipper?.totalWeightLbs || pricing?.totWt;
  const weightDisplay = totalWeight != null ? (totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(1)}K` : `${totalWeight}`) : "-";
  const trucks = pricing?.trucks != null ? pricing.trucks : "-";
  const vendorBlendSavings = pricing?.vendorBlendSavings != null ? `$${pricing.vendorBlendSavings.toLocaleString()}` : "-";
  const blendLabel = pricing?.blendLabel || "Vendor blend";
  const fileName = extractedShipper?.fileName || "";

  const rows = pricing?.rows;

  return (
    <div className="space-y-6">
      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL SELL */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-slate-300 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            TOTAL SELL
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{totalSell}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Install Only</div>
        </div>

        {/* MATERIAL COST */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-blue-500 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            MATERIAL COST
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{matCost}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{blendLabel}</div>
        </div>

        {/* PROFIT */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            PROFIT
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{profit}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{profPct}</div>
        </div>

        {/* S/SF */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            S/SF
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{sfPrice}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{sqFt} SF</div>
        </div>

        {/* WEIGHT */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            WEIGHT
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{weightDisplay}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">lbs - {trucks} trucks</div>
        </div>

        {/* VENDOR BLEND SAVINGS */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
          <div className="h-1 bg-rose-400 absolute top-0 left-0 right-0" />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            VENDOR BLEND SAVINGS
          </span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{vendorBlendSavings}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">vs 100% Central</div>
        </div>
      </div>

      {/* Weight + Price by Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Weight + Price by Category</h3>
          <p className="text-xs text-slate-500">
            {fileName ? `${fileName} - ${sqFt} SF - ${totalWeight ? totalWeight.toLocaleString() : "-"} lbs` : "No shipper file loaded"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit Pricing Rules
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
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs bg-blue-600 text-white">
                      {r.label}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{r.wt?.toLocaleString()}</td>
                  <td className="p-3 text-slate-600">{typeof r.rate === "number" ? `$${r.rate}/lb` : r.rate}</td>
                  <td className="p-3 font-bold text-slate-900">${r.price?.toLocaleString()}</td>
                  <td className="p-3 text-slate-500">{r.notes || "-"}</td>
                </tr>
              ))
            ) : extractedShipper?.tabSummary && extractedShipper.tabSummary.length > 0 ? (
              extractedShipper.tabSummary.map((tab, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs bg-blue-600 text-white">
                      {tab.sheetName}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{tab.weightLbs?.toLocaleString()}</td>
                  <td className="p-3 text-slate-600">-</td>
                  <td className="p-3 font-bold text-slate-900">-</td>
                  <td className="p-3 text-slate-500">{tab.category}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 font-normal">
                  Upload an Xshipper (.xlsx) file to view material breakdown & pricing rules.
                </td>
              </tr>
            )}

            {/* Subtotals & Cost Rows */}
            <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
              <td className="p-3 text-slate-900 font-bold">Material total</td>
              <td className="p-3 text-slate-900 font-bold">
                {totalWeight != null ? `${totalWeight.toLocaleString()} lbs` : "-"}
              </td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-900 font-bold">{matCost}</td>
              <td className="p-3"></td>
            </tr>

            <tr>
              <td className="p-3 text-slate-700">Freight ({trucks} trucks)</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">
                {pricing?.freight != null ? `$${pricing.freight.toLocaleString()}` : "$1,236"}
              </td>
              <td className="p-3"></td>
            </tr>

            <tr>
              <td className="p-3 text-slate-700">Install cost</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">
                {pricing?.instCost != null ? `$${pricing.instCost.toLocaleString()}` : "$223,438"}
              </td>
              <td className="p-3"></td>
            </tr>

            <tr className="bg-slate-50/90 font-bold border-t border-b border-slate-200">
              <td className="p-3 text-slate-900 font-bold">Total cost</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 text-slate-900 font-bold">
                {pricing?.totCost != null ? `$${pricing.totCost.toLocaleString()}` : "$392,101"}
              </td>
              <td className="p-3"></td>
            </tr>

            <tr>
              <td className="p-3 text-slate-700">Install sell</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 font-semibold text-slate-900">
                {pricing?.instSell != null ? `$${pricing.instSell.toLocaleString()}` : "$326,563"}
              </td>
              <td className="p-3"></td>
            </tr>

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

      {/* Footer Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-4">
        <Button
          type="button"
          onClick={onViewQuote}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          View Quote
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onViewSow}
          className="border-slate-300 text-slate-800 px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
        >
          View SOW
        </Button>
        <Button
          type="button"
          onClick={onQuotePreview || onViewQuote}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          Quote Preview <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
