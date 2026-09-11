import React from "react";
import { TotalProjectInvestmentBanner } from "./total-project-investment-banner";
import { useQuotationPricing, type UseQuotationPricingParams } from "../hooks/use-quotation-pricing";
import { cn } from "@/lib/utils";
import type {
  ExtractShipperResponseData,
  ExtractDrawingResponseData,
} from "../estimates.api";

export interface QuotePreviewDocumentProps {
  className?: string;
  id?: string;
  extractedShipper?: ExtractShipperResponseData;
  sqFt?: string | number;
  buildingSize?: string;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
}

export const QuotePreviewDocument = React.forwardRef<HTMLDivElement, QuotePreviewDocumentProps>(
  function QuotePreviewDocument(props, ref) {
    const { className, id, ...pricingParams } = props;
    const {
      jobType,
      scope,
      roofType,
      customerLeadName,
      customerAddress,
      quoteDate,
      expDate,
      effectiveSqFt,
      displayBuildingSize,
      matCostFormatted,
      freightFormatted,
      instSellFormatted,
      buildingSubtotalFormatted,
      concreteInclude,
      concreteFormatted,
      slabThicknessDisplay,
      psiRatingDisplay,
      insulationInclude,
      insulationFormatted,
      roofRValueDisplay,
      wallsRValueDisplay,
      includeTax,
      taxRateVal,
      salesTaxFormatted,
      grandTotalFormatted,
      pricePerSfFormatted,
      weightDisplay,
      trucks,
      dynamicScopeIncluded,
      dynamicExclusions,
    } = useQuotationPricing(pricingParams as UseQuotationPricingParams);

    return (
      <div
        ref={ref}
        id={id || "quote-preview-document"}
        className={cn(
          "p-6 md:p-8 bg-white border border-slate-200 shadow-2xs rounded-xl space-y-6 text-slate-800 print-card",
          className
        )}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
              <span className="bg-[#1E3A8A] text-white px-2 py-0.5 rounded text-lg">STORAGE</span>
              <span className="text-[#2563EB] tracking-wide">MATERIALS</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-medium">
              METAL AND DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              (888) 968-1222 · travis@storagematerials.com · www.storagematerials.com
            </p>
          </div>

          <div className="text-right text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">ESTIMATE</h3>
            <p className="text-slate-600 mt-1 text-[11px]">Date: {quoteDate}</p>
            <p className="text-slate-600 text-[11px]">Expiration: {expDate}</p>
            <p className="text-slate-600 text-[11px]">Business/Tax #: 99-4515145</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-50/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-slate-100">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PREPARED FOR
              </span>
              <span className="font-bold text-slate-900 text-sm">{customerLeadName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BUILDING
              </span>
              <span className="font-bold text-slate-900">{displayBuildingSize} {jobType}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ROOF SYSTEM
              </span>
              <span className="font-bold text-slate-900">
                26 GA Galvalume (R-Panel{roofType ? `, ${roofType}` : ""})
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                LOCATION
              </span>
              <span className="font-bold text-slate-900">{customerAddress}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SCOPE
              </span>
              <span className="font-bold text-slate-900">
                {jobType} {scope === "Supply" ? "Supply & Delivery Only" : scope === "Install" ? "Installation Only" : "Supply, Delivery & Installation"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL WEIGHT
              </span>
              <span className="font-bold text-slate-900">
                {weightDisplay} - {trucks} Truck{trucks > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Total Project Investment Banner */}
        <TotalProjectInvestmentBanner
          totalFormatted={grandTotalFormatted}
          subtitle={`${pricePerSfFormatted}/SF · ${effectiveSqFt ? effectiveSqFt.toLocaleString() : "0"} SF · FREIGHT INCLUDED`}
        />

        {/* Pricing Summary, Scope Included, Exclusions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs pt-2">
          {/* PRICING SUMMARY */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              PRICING SUMMARY
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                <span>Material</span>
                <span className="font-semibold text-slate-900">{matCostFormatted}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                <span>Freight ({trucks} Truck{trucks > 1 ? "s" : ""})</span>
                <span className="font-semibold text-slate-900">{freightFormatted}</span>
              </div>
              {scope.toLowerCase() !== "supply" && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>Installation</span>
                  <span className="font-semibold text-slate-900">{instSellFormatted}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-bold border-y border-slate-100 py-1.5">
                <span>Building Subtotal</span>
                <span>{buildingSubtotalFormatted}</span>
              </div>
              {concreteInclude && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>
                    Concrete ({slabThicknessDisplay} · {psiRatingDisplay} · {effectiveSqFt.toLocaleString()} SF)
                  </span>
                  <span className="font-semibold text-slate-900">{concreteFormatted}</span>
                </div>
              )}
              {insulationInclude && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>
                    Insulation ({roofRValueDisplay} roof / {wallsRValueDisplay} wall · {effectiveSqFt.toLocaleString()} SF)
                  </span>
                  <span className="font-semibold text-slate-900">{insulationFormatted}</span>
                </div>
              )}
              {includeTax && (
                <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                  <span>
                    Sales Tax ({taxRateVal}% on materials & insulation)
                  </span>
                  <span className="font-semibold text-slate-900">{salesTaxFormatted}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t-2 border-slate-900">
                <span>Total</span>
                <span className="text-[#1E3A8A]">{grandTotalFormatted}</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-4 leading-normal italic">
              Please Refer To The SOW For Detailed Scope. Sales Tax Will Be Added To The Price Of The Building Where Applicable.
            </p>
          </div>

          {/* SCOPE INCLUDED */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              SCOPE INCLUDED
            </h4>
            <ul className="space-y-1.5 text-slate-600 leading-tight">
              {dynamicScopeIncluded.map((item: { text: string; category?: string }, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* EXCLUSIONS */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 tracking-wider">
              EXCLUSIONS
            </h4>
            <ul className="space-y-1.5 text-slate-600 leading-tight">
              {dynamicExclusions.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Lines */}
        <div className="pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
          <div>
            <h5 className="font-bold text-slate-900 mb-8">Steel Investments DBA Storage Materials</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-8">Customer</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="text-center text-[10px] text-slate-400 pt-2">
          Thanks For Your Business! Reach Out With Any Questions · (888) 968-1222 · travis@storagematerials.com
        </p>
      </div>
    );
  }
);
