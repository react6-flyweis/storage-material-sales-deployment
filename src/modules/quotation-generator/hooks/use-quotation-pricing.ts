import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import type {
  ExtractDrawingResponseData,
  ExtractShipperResponseData,
  FullQuoteData,
} from "../estimates.api";
import {
  formatCurrency2,
  formatNumber2,
  formatPercent2,
  formatSfPrice2,
} from "../utils/quote-formatting";

export interface UseQuotationPricingParams {
  extractedShipper?: ExtractShipperResponseData;
  sqFt?: string | number;
  buildingSize?: string;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
  fullQuote?: FullQuoteData | null;
}

export function useQuotationPricing({
  extractedShipper,
  sqFt,
  buildingSize,
  quotationForm,
  extractedDrawing,
  fullQuote: propFullQuote,
}: UseQuotationPricingParams = {}) {
  const {
    jobType,
    scope,
    roofType,
    squareFootage: storeSqFt,
    includeTax,
    taxRate,
    concreteInclude,
    concreteCostSf,
    concreteMarginPct,
    concreteSlabThickness,
    concretePsiRating,
    concreteNotes,
    concreteInclusions,
    insulationInclude,
    insulationCogsSf,
    insulationMarginPct,
    insulationSystem,
    insulationRValueRoof,
    insulationRValueWalls,
    insulationNotes,
    insulationInclusions,
  } = useQuotationStore();

  const customerLeadName =
    quotationForm?.leadName ||
    extractedDrawing?.extracted?.customer ||
    extractedShipper?.coverSheet?.labelMap?.customer ||
    "Customer";

  const customerAddress =
    quotationForm?.cityStateZip ||
    quotationForm?.street ||
    extractedShipper?.coverSheet?.labelMap?.project ||
    "Council Bluffs, IA 51503";

  const customerEmail = quotationForm?.email || "customer@gmail.com";
  const projectName =
    quotationForm?.projectName ||
    extractedDrawing?.extracted?.project ||
    "Customer Project";
  const quoteDate =
    quotationForm?.quoteDate ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  const expDate = "30 Days from Issue";

  const fullQuote = propFullQuote || extractedShipper?.fullQuote;
  const pricing = extractedShipper?.pricing || fullQuote?.pricing;

  const effectiveSqFt =
    pricing?.sf ||
    parseFloat(String(sqFt || "")) ||
    extractedShipper?.squareFootage ||
    storeSqFt ||
    0;

  const displayBuildingSize =
    (buildingSize && buildingSize.trim()) ||
    (extractedDrawing?.extracted?.width
      ? `${extractedDrawing.extracted.width}×${extractedDrawing.extracted.length}×${extractedDrawing.extracted.eave || ""}`
      : effectiveSqFt
      ? `${formatNumber2(effectiveSqFt)} SF ${jobType}`
      : `${jobType} Building`);

  const matPriceVal = pricing?.matSell ?? pricing?.matCost;
  const matCostFormatted = formatCurrency2(matPriceVal);

  const freightVal = pricing?.freight;
  const freightFormatted = formatCurrency2(freightVal, "$0.00");

  const instCostVal = pricing?.instCost;
  const instCostFormatted = formatCurrency2(instCostVal, "$0.00");

  const instSellVal = pricing?.instSell;
  const instSellFormatted = formatCurrency2(instSellVal, "$0.00");

  const totCostVal = pricing?.totCost;
  const totCostFormatted = formatCurrency2(totCostVal);

  const totSellVal = pricing?.totSell;
  const totSellFormatted = formatCurrency2(totSellVal);

  const buildingSubtotalVal =
    fullQuote?.buildingSubtotal ??
    pricing?.totSell;
  const buildingSubtotalFormatted = formatCurrency2(buildingSubtotalVal);

  // Concrete from API fullQuote (no local fallback calculation)
  const concreteTotalCost = fullQuote?.concrete?.cost ?? 0;
  const concreteSellPrice =
    fullQuote?.concrete?.appliedSell ??
    fullQuote?.concrete?.sell ??
    0;
  const concreteProfit = fullQuote?.concrete?.profit ?? 0;
  const concreteFormatted =
    concreteSellPrice > 0 ? formatCurrency2(concreteSellPrice) : "-";
  const concreteCostFormatted =
    concreteTotalCost > 0 ? formatCurrency2(concreteTotalCost) : "-";
  const concreteProfitFormatted =
    concreteProfit > 0 ? formatCurrency2(concreteProfit) : "-";
  const slabThicknessDisplay =
    fullQuote?.concrete?.thickness != null
      ? String(fullQuote.concrete.thickness)
      : concreteSlabThickness || "";
  const psiRatingDisplay =
    fullQuote?.concrete?.psi != null
      ? String(fullQuote.concrete.psi)
      : concretePsiRating || "";

  // Insulation from API fullQuote (no local fallback calculation)
  const insulationTotalCost = fullQuote?.insulation?.cost ?? 0;
  const insulationSellPrice =
    fullQuote?.insulation?.appliedSell ??
    fullQuote?.insulation?.sell ??
    0;
  const insulationProfit = fullQuote?.insulation?.profit ?? 0;
  const insulationFormatted =
    insulationSellPrice > 0 ? formatCurrency2(insulationSellPrice) : "-";
  const insulationCostFormatted =
    insulationTotalCost > 0 ? formatCurrency2(insulationTotalCost) : "-";
  const insulationProfitFormatted =
    insulationProfit > 0 ? formatCurrency2(insulationProfit) : "-";
  const roofRValueDisplay =
    fullQuote?.insulation?.rRoof || insulationRValueRoof || "";
  const wallsRValueDisplay =
    fullQuote?.insulation?.rWall || insulationRValueWalls || "";

  // Sales Tax from API fullQuote (no local fallback calculation)
  const taxableBase = fullQuote?.salesTax?.taxableBase;
  const taxRateVal = fullQuote?.salesTax?.rate ?? taxRate ?? 0;
  const salesTaxVal = fullQuote?.salesTax?.amount ?? 0;
  const salesTaxFormatted = formatCurrency2(salesTaxVal, "$0.00");

  // Grand Total from API fullQuote (no local fallback calculation)
  const grandTotalVal = fullQuote?.grandTotal ?? buildingSubtotalVal ?? pricing?.totSell;
  const grandTotalFormatted =
    grandTotalVal != null && grandTotalVal > 0 ? formatCurrency2(grandTotalVal) : "-";

  // Total Profit from API fullQuote (no local fallback calculation)
  const totalProfitVal = fullQuote?.totalProfit ?? pricing?.profit;
  const totalProfitFormatted =
    totalProfitVal != null ? formatCurrency2(totalProfitVal) : "-";

  // Grand Margin from API fullQuote (no local fallback calculation)
  const grandMarginVal = fullQuote?.grandMargin ?? pricing?.profPct;
  const grandMarginFormatted =
    grandMarginVal != null ? formatPercent2(grandMarginVal) : "-";

  // Price Per SF from API fullQuote (no local fallback calculation)
  const rawPricePerSf = fullQuote?.pricePerSf ?? pricing?.sfPrice;
  const pricePerSfFormatted =
    rawPricePerSf != null ? formatSfPrice2(rawPricePerSf) : "-";

  const buildingSfPrice = pricing?.sfPrice;
  const buildingSfPriceFormatted =
    buildingSfPrice != null ? formatSfPrice2(buildingSfPrice) : "-";

  const totalWeight = pricing?.totWt ?? extractedShipper?.totalWeightLbs;
  const weightDisplay =
    totalWeight != null
      ? typeof totalWeight === "number"
        ? `${formatNumber2(totalWeight)} Lbs`
        : `${totalWeight}`
      : "-";
  const trucks = pricing?.trucks ?? 1;

  // Compute dynamic Scope Included and Exclusions for Quote
  const isSupply =
    scope.toLowerCase() === "supply" || scope.toLowerCase() === "both";
  const isInstall =
    scope.toLowerCase() === "install" || scope.toLowerCase() === "both";

  const dynamicScopeIncluded: Array<{ text: string; category?: string }> = [];
  const dynamicExclusions: string[] = [];

  // 1. Structural & Supply Framing
  if (isSupply) {
    dynamicScopeIncluded.push({
      text:
        jobType.toLowerCase() === "storage"
          ? "Full Storage Structural System"
          : "Full PEMB Rigid Frame Structural System",
    });
  }
  // 2. Installation & Equipment
  if (isInstall) {
    dynamicScopeIncluded.push({
      text: "Labor & Installation",
    });
    dynamicScopeIncluded.push({
      text: "Equipment & Supervision",
    });
  }

  // 3. Concrete Inclusions
  if (concreteInclude && concreteInclusions && concreteInclusions.length > 0) {
    concreteInclusions.forEach((item) => {
      dynamicScopeIncluded.push({
        text: `${item}`,
        category: "concrete",
      });
    });
  }

  // 4. Insulation Inclusions
  if (insulationInclude && insulationInclusions && insulationInclusions.length > 0) {
    insulationInclusions.forEach((item) => {
      dynamicScopeIncluded.push({
        text: `${item}`,
        category: "insulation",
      });
    });
  }

  // 5. Standard Unincluded Items
  if (!isInstall) {
    dynamicExclusions.push("Building Erection & Labor (Supply Only Contract)");
  }
  if (!isSupply) {
    dynamicExclusions.push("Building Materials & Freight (Installation Only Contract)");
  }
  if (!concreteInclude) {
    dynamicExclusions.push("Concrete Foundation, Slab, And Anchor Bolts");
  }
  if (!insulationInclude) {
    dynamicExclusions.push("Insulation System");
  }
  dynamicExclusions.push("Doors (Overhead, Roll-Up, Man Doors - Unless Noted)");
  dynamicExclusions.push("Electrical, Plumbing, HVAC");
  dynamicExclusions.push("Fire Suppression");
  dynamicExclusions.push("Permits, Impact Fees & Engineering");
  if (!includeTax) {
    dynamicExclusions.push("Sales Tax (Unless Applicable / Invoiced Separately)");
  }

  return {
    jobType,
    scope,
    roofType,
    customerLeadName,
    customerAddress,
    customerEmail,
    projectName,
    quoteDate,
    expDate,
    effectiveSqFt,
    displayBuildingSize,
    fullQuote,
    pricing,
    matPriceVal,
    matCostFormatted,
    freightVal,
    freightFormatted,
    instCostVal,
    instCostFormatted,
    instSellVal,
    instSellFormatted,
    totCostVal,
    totCostFormatted,
    totSellVal,
    totSellFormatted,
    buildingSubtotalVal,
    buildingSubtotalFormatted,
    concreteCostSf,
    concreteMarginPct,
    concreteTotalCost,
    concreteSellPrice,
    concreteProfit,
    concreteFormatted,
    concreteCostFormatted,
    concreteProfitFormatted,
    slabThicknessDisplay,
    psiRatingDisplay,
    concreteInclude,
    concreteInclusions,
    concreteNotes,
    insulationCogsSf,
    insulationMarginPct,
    insulationTotalCost,
    insulationSellPrice,
    insulationProfit,
    insulationFormatted,
    insulationCostFormatted,
    insulationProfitFormatted,
    roofRValueDisplay,
    wallsRValueDisplay,
    insulationInclude,
    insulationInclusions,
    insulationNotes,
    insulationSystem,
    taxableBase,
    taxRateVal,
    salesTaxVal,
    salesTaxFormatted,
    includeTax,
    grandTotalVal,
    grandTotalFormatted,
    totalProfitVal,
    totalProfitFormatted,
    grandMarginVal,
    grandMarginFormatted,
    rawPricePerSf,
    pricePerSfFormatted,
    buildingSfPrice,
    buildingSfPriceFormatted,
    totalWeight,
    weightDisplay,
    trucks,
    isSupply,
    isInstall,
    dynamicScopeIncluded,
    dynamicExclusions,
  };
}
