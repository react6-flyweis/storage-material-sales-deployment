import { useMemo, useCallback, useRef } from "react";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import { useQuotationPricing } from "./use-quotation-pricing";
import type {
  ExtractDrawingResponseData,
  ExtractShipperResponseData,
  PreviewContractPayload,
  PreviewDocumentRequest,
} from "../estimates.api";

export interface UsePembDocumentPayloadParams {
  estimateId?: string | null;
  extractedShipper?: ExtractShipperResponseData | null;
  extractedDrawing?: ExtractDrawingResponseData | null;
  quotationForm?: Record<string, string> | null;
  sqFt?: string | number | null;
  buildingSize?: string | null;
  pdfFileName?: string | null;
  sections?: string[];
  drawingAttachments?: Array<{
    name?: string;
    fileBase64?: string;
    data?: string;
    includeInQuote?: boolean;
    [key: string]: unknown;
  }>;
  contractOverrides?: Partial<PreviewContractPayload>;
  recompute?: boolean;
}

export function usePembDocumentPayload({
  estimateId: propEstimateId,
  extractedShipper: propShipper,
  extractedDrawing: propDrawing,
  quotationForm,
  sqFt,
  buildingSize,
  pdfFileName,
  sections,
  drawingAttachments,
  contractOverrides,
  recompute = false,
}: UsePembDocumentPayloadParams = {}) {
  const store = useQuotationStore();

  const effectiveEstimateId =
    propEstimateId || store.pembEstimateId || undefined;
  const effectiveShipper =
    propShipper || store.pembExtractedShipper || undefined;
  const effectiveDrawing =
    propDrawing || store.pembExtractedDrawing || undefined;

  const pricingData = useQuotationPricing({
    extractedShipper: effectiveShipper,
    sqFt: sqFt ?? undefined,
    buildingSize: buildingSize ?? undefined,
    quotationForm: quotationForm ?? undefined,
    extractedDrawing: effectiveDrawing,
  });

  const {
    customerLeadName,
    customerAddress,
    customerEmail,
    quoteDate,
    displayBuildingSize,
    effectiveSqFt,
    grandTotalFormatted: totalSellFormatted,
  } = pricingData;

  const sectionsKey = (sections || []).join(",");
  const resolvedDrawingAttachments = useMemo(() => {
    if (drawingAttachments) return drawingAttachments;
    if (pdfFileName) return [{ name: pdfFileName, includeInQuote: true }];
    return [];
  }, [drawingAttachments, pdfFileName]);

  const resolvedSections = useMemo(() => {
    if (sections) return sections;
    return resolvedDrawingAttachments.length > 0
      ? ["quote", "sow", "contract", "drawings"]
      : ["quote", "sow", "contract"];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsKey, resolvedDrawingAttachments.length]);

  const buildPayload = useCallback(
    (overrides?: Partial<PreviewDocumentRequest>): PreviewDocumentRequest => {
      const activeEstimateId = overrides?.estimateId ?? effectiveEstimateId;
      const currentSections = overrides?.sections ?? resolvedSections;
      const currentAttachments =
        overrides?.drawingAttachments ?? resolvedDrawingAttachments;

      const grandTotalNum =
        overrides?.grandTotal ??
        ((effectiveShipper?.fullQuote?.grandTotal ??
          effectiveShipper?.pricing?.totSell) as number | undefined);

      const contractType =
        (contractOverrides?.type as string | undefined) ||
        (overrides?.contract?.type as string | undefined) ||
        ((store.scope || "Both").toLowerCase() === "both"
          ? "both"
          : (store.scope || "Both").toLowerCase() === "install"
            ? "install"
            : "supply");

      const rawContractOverrides = {
        ...(contractOverrides || {}),
        ...(overrides?.contract || {}),
      };
      const cleanContractOverrides: Partial<PreviewContractPayload> = {};
      for (const [k, v] of Object.entries(rawContractOverrides)) {
        if (v !== undefined && v !== null && v !== "") {
          (cleanContractOverrides as Record<string, unknown>)[k] = v;
        }
      }

      const contractPayload: PreviewContractPayload = {
        customer: customerLeadName,
        address: customerAddress,
        city: customerAddress,
        email: customerEmail,
        date: quoteDate,
        deposit: "forty-percent (40%)",
        type: contractType,
        value: totalSellFormatted,
        ...cleanContractOverrides,
      };

      return {
        estimateId: activeEstimateId,
        companyBrand: store.companyBrand,
        grandTotal: grandTotalNum,
        jobType: "PEMB",
        scope:
          (store.scope || "Both").toLowerCase() === "supply"
            ? "Supply"
            : (store.scope || "Both").toLowerCase() === "install"
              ? "Install"
              : "Both",
        roofType: store.roofType,
        leadCompanyName: customerLeadName,
        customerEmail,
        streetAddress: customerAddress,
        cityStateZip: customerAddress,
        buildingSize: displayBuildingSize,
        squareFootage: effectiveSqFt,
        jobNumber:
          quotationForm?.jobNumber ||
          effectiveDrawing?.extracted?.jobnumber ||
          "",
        installLevel: store.installDifficulty || "easy",
        installCostPerSf: store.installCost,
        sellPerSf: store.installSell,
        blendPct: store.blendPercentage,
        steelFinish: store.steelFinish || "red-iron",
        freightOverride: parseFloat(store.freightOverride) || undefined,
        materialSellOverride:
          parseFloat(store.materialSellOverride) || undefined,
        matSellOverride: parseFloat(store.materialSellOverride) || undefined,
        pembDrawings: parseFloat(store.engineeringDrawings) || 0,
        parsedCategories: activeEstimateId
          ? undefined
          : effectiveShipper?.parsedCategories,
        pricingResult: activeEstimateId
          ? undefined
          : effectiveShipper?.pricing,
        fullQuote: activeEstimateId
          ? undefined
          : (effectiveShipper?.fullQuote ||
            (effectiveShipper?.pricing as Record<string, unknown> | undefined)),
        extractedDrawingFields: effectiveDrawing?.extracted,
        concreteAddon: {
          include: store.concreteInclude,
          costSF: store.concreteCostSf,
          marginPct: store.concreteMarginPct,
          thickness: store.concreteSlabThickness,
          psi: store.concretePsiRating,
          slabThickness: store.concreteSlabThickness,
          psiRating: store.concretePsiRating,
          sowNotes: store.concreteNotes,
          sowItems: store.concreteInclusions,
        },
        insulationAddon: {
          include: store.insulationInclude,
          costSF: store.insulationCogsSf,
          marginPct: store.insulationMarginPct,
          system: store.insulationSystem,
          rRoof: store.insulationRValueRoof,
          rWalls: store.insulationRValueWalls,
          rValueRoof: store.insulationRValueRoof,
          rValueWalls: store.insulationRValueWalls,
          sowNotes: store.insulationNotes,
          sowItems: store.insulationInclusions,
        },
        salesTax: {
          include: store.includeTax,
          includeTax: store.includeTax,
          rate: store.taxRate,
          taxRate: store.taxRate,
          zip: store.taxZip,
          taxZip: store.taxZip,
        },
        taxRate: store.taxRate,
        includeTax: store.includeTax,
        taxZip: store.taxZip,
        zip: store.taxZip,
        cogsOverride: store.cogsOverrideApplied
          ? {
              applied: true,
              costDollar: parseFloat(store.cogsCostInput) || null,
              marginPct: store.cogsMaterialMargin,
              sellDollar: parseFloat(store.cogsFixedSellPrice) || null,
              costPctAdj: store.cogsCostAdjustPercent,
            }
          : undefined,
        marginOverride: store.marginOverrideApplied
          ? {
              applied: true,
              laborSF: parseFloat(store.marginLaborOverride) || null,
              pct: parseFloat(store.marginTargetMargin) || null,
              sellFixed: parseFloat(store.marginFixedSellOverride) || null,
            }
          : undefined,
        contract: contractPayload,
        drawingAttachments: currentAttachments,
        sections: currentSections,
        staircase: {
          count: store.isMultiStory ? store.staircaseCount : 0,
          unitCost: store.staircaseUnitPrice || 35000,
          stories: 2,
        },
        multiStory: {
          stories: 2,
          staircaseCount: store.isMultiStory ? store.staircaseCount : 0,
          staircaseUnitCost: store.staircaseUnitPrice || 35000,
        },
        pembAddOns: (store.pembAddOns || []).map((addon) => ({
          item: addon.item,
          cost: Number(addon.cost) || 0,
          markupPct: Number(addon.markupPct) || 0,
          inQuote: Boolean(addon.inQuote),
          inSow: Boolean(addon.inSow),
        })),
        redOxideConfirmed: store.isRedOxideConfirmed,
        ...(recompute ? { recompute: true } : {}),
        ...overrides,
      };
    },
    [
      effectiveEstimateId,
      effectiveShipper,
      effectiveDrawing,
      resolvedSections,
      resolvedDrawingAttachments,
      customerLeadName,
      customerAddress,
      customerEmail,
      quoteDate,
      displayBuildingSize,
      effectiveSqFt,
      totalSellFormatted,
      quotationForm,
      contractOverrides,
      recompute,
      store,
    ],
  );

  const rawPayload = buildPayload();
  const rawPayloadJson = JSON.stringify(rawPayload);
  const stablePayloadRef = useRef<PreviewDocumentRequest>(rawPayload);
  const stablePayloadJsonRef = useRef<string>(rawPayloadJson);

  if (rawPayloadJson !== stablePayloadJsonRef.current) {
    stablePayloadJsonRef.current = rawPayloadJson;
    stablePayloadRef.current = rawPayload;
  }

  const payload = stablePayloadRef.current;

  const hasData = Boolean(
    effectiveShipper ||
      effectiveDrawing ||
      quotationForm ||
      sqFt ||
      buildingSize,
  );

  return {
    payload,
    buildPayload,
    pricingData,
    customerLeadName,
    customerAddress,
    customerEmail,
    effectiveEstimateId,
    effectiveShipper,
    effectiveDrawing,
    hasData,
  };
}

