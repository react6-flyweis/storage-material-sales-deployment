import { useQuotationStore } from "@/modules/quotation/quotation.store";
import type {
  ExtractDrawingResponseData,
  ExtractShipperResponseData,
} from "../estimates.api";

export interface UseQuotationPricingParams {
  extractedShipper?: ExtractShipperResponseData;
  sqFt?: string | number;
  buildingSize?: string;
  quotationForm?: Record<string, string>;
  extractedDrawing?: ExtractDrawingResponseData;
}

export function useQuotationPricing({
  extractedShipper,
  sqFt,
  buildingSize,
  quotationForm,
  extractedDrawing,
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

  const effectiveSqFt =
    parseFloat(String(sqFt || "")) ||
    extractedShipper?.squareFootage ||
    storeSqFt ||
    0;

  const displayBuildingSize =
    (buildingSize && buildingSize.trim()) ||
    (extractedDrawing?.extracted?.width
      ? `${extractedDrawing.extracted.width}×${extractedDrawing.extracted.length}×${extractedDrawing.extracted.eave || ""}`
      : effectiveSqFt
      ? `${effectiveSqFt.toLocaleString()} SF ${jobType}`
      : `${jobType} Building`);

  const pricing = extractedShipper?.pricing;

  const matPriceVal = pricing?.matSell ?? pricing?.matCost;
  const matCostFormatted =
    matPriceVal != null ? `$${Math.round(matPriceVal).toLocaleString()}` : "-";

  const freightVal = pricing?.freight;
  const freightFormatted =
    freightVal != null ? `$${Math.round(freightVal).toLocaleString()}` : "-";

  const instSellVal = pricing?.instSell;
  const instSellFormatted =
    instSellVal != null ? `$${Math.round(instSellVal).toLocaleString()}` : "-";

  const buildingSubtotalVal =
    pricing?.totSell ??
    (matPriceVal != null || freightVal != null || instSellVal != null
      ? (matPriceVal ?? 0) + (freightVal ?? 0) + (instSellVal ?? 0)
      : undefined);
  const buildingSubtotalFormatted =
    buildingSubtotalVal != null
      ? `$${Math.round(buildingSubtotalVal).toLocaleString()}`
      : "-";

  // Concrete calculation
  const concreteTotalCost = effectiveSqFt * (concreteCostSf || 0);
  const concreteMarginDecimal = (concreteMarginPct || 0) / 100;
  const concreteSellPrice =
    concreteMarginDecimal < 1
      ? concreteTotalCost / (1 - concreteMarginDecimal)
      : concreteTotalCost;
  const concreteFormatted =
    concreteSellPrice > 0
      ? `$${Math.round(concreteSellPrice).toLocaleString()}`
      : "-";
  const slabThicknessDisplay = concreteSlabThickness || "";
  const psiRatingDisplay = concretePsiRating || "";

  // Insulation calculation
  const insulationTotalCost = effectiveSqFt * (insulationCogsSf || 0);
  const insulationMarginDecimal = (insulationMarginPct || 0) / 100;
  const insulationSellPrice =
    insulationMarginDecimal < 1
      ? insulationTotalCost / (1 - insulationMarginDecimal)
      : insulationTotalCost;
  const insulationFormatted =
    insulationSellPrice > 0
      ? `$${Math.round(insulationSellPrice).toLocaleString()}`
      : "-";
  const roofRValueDisplay = insulationRValueRoof || "";
  const wallsRValueDisplay = insulationRValueWalls || "";

  // Sales Tax calculation (tax materials + insulation, labor is not taxed)
  const taxableBase =
    (matPriceVal ?? 0) + (insulationInclude ? insulationSellPrice : 0);
  const taxRateVal = taxRate || 0;
  const salesTaxVal = Math.round(taxableBase * (taxRateVal / 100));
  const salesTaxFormatted = `$${salesTaxVal.toLocaleString()}`;

  // Grand Total calculation
  const grandTotalVal =
    (buildingSubtotalVal ?? 0) +
    (concreteInclude ? concreteSellPrice : 0) +
    (insulationInclude ? insulationSellPrice : 0) +
    (includeTax ? salesTaxVal : 0);
  const grandTotalFormatted =
    grandTotalVal > 0 ? `$${Math.round(grandTotalVal).toLocaleString()}` : "-";

  const grandSfPrice =
    effectiveSqFt > 0 && grandTotalVal > 0
      ? (grandTotalVal / effectiveSqFt).toFixed(2)
      : pricing?.sfPrice ?? "-";
  const pricePerSfFormatted =
    typeof grandSfPrice === "number" || !String(grandSfPrice).startsWith("$")
      ? `$${grandSfPrice}`
      : grandSfPrice;

  const totalWeight =
    extractedShipper?.totalWeightLbs ?? pricing?.totWt;
  const weightDisplay =
    totalWeight != null
      ? typeof totalWeight === "number"
        ? `${totalWeight.toLocaleString()} Lbs`
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
    pricing,
    matPriceVal,
    matCostFormatted,
    freightVal,
    freightFormatted,
    instSellVal,
    instSellFormatted,
    buildingSubtotalVal,
    buildingSubtotalFormatted,
    concreteCostSf,
    concreteMarginPct,
    concreteTotalCost,
    concreteSellPrice,
    concreteFormatted,
    slabThicknessDisplay,
    psiRatingDisplay,
    concreteInclude,
    concreteInclusions,
    concreteNotes,
    insulationCogsSf,
    insulationMarginPct,
    insulationTotalCost,
    insulationSellPrice,
    insulationFormatted,
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
    grandSfPrice,
    pricePerSfFormatted,
    totalWeight,
    weightDisplay,
    trucks,
    isSupply,
    isInstall,
    dynamicScopeIncluded,
    dynamicExclusions,
  };
}
