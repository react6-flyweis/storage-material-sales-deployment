import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  getEstimateByIdProvider,
  type SaveEstimatePayload,
  type ExtractShipperResponseData,
  type ShipperTabSummary,
  type ShipperPricing,
  type FullQuoteData,
} from "../estimates.api";

export function hydrateEstimateIntoStore(
  estimate: SaveEstimatePayload,
  id?: string
) {
  const finalId =
    estimate._id ||
    (estimate as { id?: string }).id ||
    id ||
    undefined;
  if (finalId) {
    estimate._id = finalId;
  }

  const isStorage =
    estimate.jobType?.toUpperCase() === "STORAGE" ||
    Boolean(estimate.storageData);

  const store = useQuotationStore.getState();

  // 1. Synchronize concrete addon
  if (estimate.concreteAddon) {
    if (estimate.concreteAddon.include !== undefined)
      store.setConcreteInclude(Boolean(estimate.concreteAddon.include));
    if (estimate.concreteAddon.costSF !== undefined)
      store.setConcreteCostSf(Number(estimate.concreteAddon.costSF));
    if (estimate.concreteAddon.marginPct !== undefined)
      store.setConcreteMarginPct(Number(estimate.concreteAddon.marginPct));
    if (
      estimate.concreteAddon.slabThickness ||
      estimate.concreteAddon.thickness
    ) {
      const thick = String(
        estimate.concreteAddon.slabThickness ||
          estimate.concreteAddon.thickness
      );
      if (thick === "4" || thick === '4"' || thick === "4”") {
        store.setConcreteSlabThickness('4"');
      } else {
        store.setConcreteSlabThickness('6"');
      }
    }
    if (estimate.concreteAddon.psi || estimate.concreteAddon.psiRating) {
      store.setConcretePsiRating(
        String(
          estimate.concreteAddon.psi || estimate.concreteAddon.psiRating
        )
      );
    }
    if (estimate.concreteAddon.sowNotes) {
      store.setConcreteNotes(String(estimate.concreteAddon.sowNotes));
    }
    if (
      estimate.concreteAddon.sowItems &&
      Array.isArray(estimate.concreteAddon.sowItems) &&
      estimate.concreteAddon.sowItems.length > 0
    ) {
      store.setConcreteInclusions(estimate.concreteAddon.sowItems);
    }
  }

  // 2. Synchronize insulation addon
  if (estimate.insulationAddon) {
    if (estimate.insulationAddon.include !== undefined)
      store.setInsulationInclude(Boolean(estimate.insulationAddon.include));
    if (
      estimate.insulationAddon.system ||
      estimate.insulationAddon.systemLabel
    ) {
      const sys = (
        estimate.insulationAddon.system ||
        estimate.insulationAddon.systemLabel ||
        ""
      ).toLowerCase();
      if (sys.includes("spray") || sys.includes("foam")) {
        store.setInsulationSystem("Spray Foam");
      } else if (sys.includes("double") || sys.includes("layer")) {
        store.setInsulationSystem("Double-layer system");
      } else {
        store.setInsulationSystem("Vinyl-backed (single layer)");
      }
    }
    if (
      estimate.insulationAddon.rRoof ||
      estimate.insulationAddon.rValueRoof
    ) {
      store.setInsulationRValueRoof(
        String(
          estimate.insulationAddon.rRoof ||
            estimate.insulationAddon.rValueRoof
        )
      );
    }
    if (
      estimate.insulationAddon.rWall ||
      estimate.insulationAddon.rValueWalls
    ) {
      store.setInsulationRValueWalls(
        String(
          estimate.insulationAddon.rWall ||
            estimate.insulationAddon.rValueWalls
        )
      );
    }
    if (
      estimate.insulationAddon.costSF !== undefined ||
      estimate.insulationAddon.cogsSF !== undefined
    ) {
      store.setInsulationCogsSf(
        Number(
          estimate.insulationAddon.costSF ??
            estimate.insulationAddon.cogsSF
        )
      );
    }
    if (estimate.insulationAddon.marginPct !== undefined) {
      store.setInsulationMarginPct(
        Number(estimate.insulationAddon.marginPct)
      );
    }
  }

  // 3. Synchronize sales tax
  const rawTax =
    (estimate.salesTax as Record<string, unknown> | undefined) ||
    ((estimate.pricingResult as Record<string, unknown> | undefined)
      ?.salesTax as Record<string, unknown> | undefined) ||
    ((estimate.fullQuoteResult as Record<string, unknown> | undefined)
      ?.salesTax as Record<string, unknown> | undefined) ||
    ((estimate as Record<string, unknown> | undefined)?.salesTax as
      | Record<string, unknown>
      | undefined);

  const taxObj =
    rawTax && typeof rawTax === "object" ? rawTax : null;

  const taxZipVal =
    taxObj?.zip ||
    taxObj?.taxZip ||
    (estimate as Record<string, unknown> | undefined)?.taxZip ||
    (estimate as Record<string, unknown> | undefined)?.zip;
  if (taxZipVal) store.setTaxZip(String(taxZipVal));

  const taxRateVal =
    taxObj?.rate ??
    taxObj?.taxRate ??
    (estimate as Record<string, unknown> | undefined)?.taxRate;
  if (
    taxRateVal !== undefined &&
    taxRateVal !== null &&
    !isNaN(Number(taxRateVal))
  ) {
    store.setTaxRate(Number(taxRateVal));
  }

  const includeTaxVal =
    taxObj?.include ??
    taxObj?.includeTax ??
    (estimate as Record<string, unknown> | undefined)?.includeTax;
  if (includeTaxVal !== undefined && includeTaxVal !== null) {
    store.setIncludeTax(Boolean(includeTaxVal));
  }

  // 4. Synchronize COGS override
  if (estimate.cogsOverride) {
    store.setCogsOverrideApplied(Boolean(estimate.cogsOverride.applied));
    if (
      estimate.cogsOverride.costDollar !== undefined &&
      estimate.cogsOverride.costDollar !== null
    ) {
      store.setCogsCostInput(String(estimate.cogsOverride.costDollar));
    }
    if (
      estimate.cogsOverride.costPctAdj !== undefined &&
      estimate.cogsOverride.costPctAdj !== null
    ) {
      store.setCogsCostAdjustPercent(
        Number(estimate.cogsOverride.costPctAdj)
      );
    }
    if (
      estimate.cogsOverride.marginPct !== undefined &&
      estimate.cogsOverride.marginPct !== null
    ) {
      store.setCogsMaterialMargin(Number(estimate.cogsOverride.marginPct));
    }
    if (
      estimate.cogsOverride.sellDollar !== undefined &&
      estimate.cogsOverride.sellDollar !== null
    ) {
      store.setCogsFixedSellPrice(String(estimate.cogsOverride.sellDollar));
    }
  } else {
    store.resetCogsSettings();
  }

  // 5. Synchronize Margin override
  if (estimate.marginOverride) {
    store.setMarginOverrideApplied(
      Boolean(estimate.marginOverride.applied)
    );
    if (
      estimate.marginOverride.laborSF !== undefined &&
      estimate.marginOverride.laborSF !== null
    ) {
      store.setMarginLaborOverride(String(estimate.marginOverride.laborSF));
    }
    if (
      estimate.marginOverride.pct !== undefined &&
      estimate.marginOverride.pct !== null
    ) {
      store.setMarginTargetMargin(String(estimate.marginOverride.pct));
    }
    if (
      estimate.marginOverride.sellFixed !== undefined &&
      estimate.marginOverride.sellFixed !== null
    ) {
      store.setMarginFixedSellOverride(
        String(estimate.marginOverride.sellFixed)
      );
    }
  } else {
    store.resetMarginSettings();
  }

  // 5b. Synchronize Multi-story & Staircase
  const ms = (estimate as Record<string, unknown>).multiStory || (estimate as Record<string, unknown>).staircase;
  if (ms && typeof ms === "object") {
    const msObj = ms as Record<string, unknown>;
    const sCount = Number(msObj.staircaseCount ?? msObj.count ?? 0);
    const sUnit = Number(msObj.staircaseUnitCost ?? msObj.unitCost ?? 35000);
    store.setIsMultiStory(sCount > 0 || Boolean((estimate as Record<string, unknown>).isMultiStory));
    store.setStaircaseCount(sCount);
    store.setStaircaseUnitPrice(sUnit > 0 ? sUnit : 35000);
  } else {
    store.setIsMultiStory(Boolean((estimate as Record<string, unknown>).isMultiStory));
    store.setStaircaseCount(0);
    store.setStaircaseUnitPrice(35000);
  }

  // 5c. Synchronize PEMB Add-ons
  const rawAddons = (estimate as Record<string, unknown>).pembAddOns;
  if (Array.isArray(rawAddons)) {
    store.setPembAddOns(rawAddons);
  } else {
    store.setPembAddOns([]);
  }

  // 5d. Synchronize red oxide confirmation
  if ((estimate as Record<string, unknown>).redOxideConfirmed !== undefined) {
    store.setIsRedOxideConfirmed(Boolean((estimate as Record<string, unknown>).redOxideConfirmed));
  }

  // 5e. Synchronize deleted row keys
  if (Array.isArray((estimate as Record<string, unknown>).deletedRowKeys)) {
    store.setDeletedRowKeys((estimate as Record<string, unknown>).deletedRowKeys as string[]);
  }

  // 5f. Install difficulty / level
  const restoredLevel =
    estimate.installLevel ||
    (estimate as Record<string, unknown>).installDifficulty ||
    (estimate as Record<string, unknown>).install;
  if (restoredLevel) {
    store.setInstallDifficulty(String(restoredLevel));
  }

  // 6. Storage or PEMB
  if (isStorage) {
    store.setJobType("Storage");
    store.setCompanyBrand(estimate.companyBrand === "SBD" ? "SBD" : "SM");
    if (estimate.scope) {
      const normScope = estimate.scope.toLowerCase();
      store.setScope(
        normScope === "supply"
          ? "Supply"
          : normScope === "install"
          ? "Install"
          : "Both"
      );
    }
    store.setStorageData(estimate.storageData || null);
    store.setStoragePricing(estimate.storagePricingResult || null);
    store.setStorageEstimateId(finalId || null);
    store.setStorageFileName(estimate.sourceFileName || "Storage_COG.xlsx");
    store.setStorageCustomerLeadName(estimate.leadCompanyName || "");
    store.setStorageCustomerAddress(
      estimate.cityStateZip || estimate.streetAddress || ""
    );
    store.setStorageCustomerEmail(estimate.customerEmail || "");
    store.setStorageJobNumber(estimate.jobNumber || "");

    if (estimate.storageData) {
      const ship =
        (estimate.storageData as Record<string, unknown>).shipping ??
        ((estimate.storageData as Record<string, unknown>).shippingDefault as Record<string, unknown>)?.freightCost;
      if (ship !== undefined && ship !== null) {
        store.setStorageShipping(Number(ship));
      }
      const drawings = (estimate.storageData as Record<string, unknown>).drawings;
      if (drawings !== undefined && drawings !== null) {
        store.setStorageDrawingsCost(Number(drawings));
      }
    }

    if (estimate.installCostPerSf) store.setInstallCost(Number(estimate.installCostPerSf));
    if (estimate.sellPerSf) store.setInstallSell(Number(estimate.sellPerSf));

    return {
      isStorage: true,
      finalId,
      estimate,
    };
  }

  // PEMB Hydration
  const pricingRes = estimate.pricingResult as
    | Record<string, unknown>
    | undefined;
  const effectiveSqFt = Number(
    estimate.squareFootage ||
      estimate.sf ||
      pricingRes?.totalSqFt ||
      pricingRes?.sf ||
      0
  );

  store.setJobType("PEMB");
  store.setCompanyBrand(estimate.companyBrand === "SM" ? "SM" : "SBD");
  if (estimate.scope) {
    const normScope = estimate.scope.toLowerCase();
    store.setScope(
      normScope === "install"
        ? "Install"
        : normScope === "both"
        ? "Both"
        : "Supply"
    );
  }

  if (estimate.roofType) store.setRoofType(estimate.roofType);
  if (
    estimate.blendPercentage !== undefined ||
    (estimate as Record<string, unknown>).blendPct !== undefined
  ) {
    store.setBlendPercentage(
      Number(
        estimate.blendPercentage ??
          (estimate as Record<string, unknown>).blendPct
      )
    );
  }

  const restoredFinish =
    estimate.steelFinish ??
    (estimate as Record<string, unknown> | undefined)?.finishType ??
    (estimate as Record<string, unknown> | undefined)?.finish;
  if (restoredFinish === "galvanized" || restoredFinish === "red-iron") {
    store.setSteelFinish(restoredFinish);
  }

  const restoredMatOverride =
    estimate.materialSellOverride ??
    estimate.matSellOverride ??
    (estimate.quoteControls as Record<string, unknown> | undefined)?.materialSellOverride ??
    (estimate.cogsOverride as Record<string, unknown> | undefined)?.materialSellOverride ??
    (pricingRes?.materialSellExFreight as number | undefined);

  if (restoredMatOverride !== undefined && restoredMatOverride !== null) {
    store.setMaterialSellOverride(String(restoredMatOverride));
  } else {
    store.setMaterialSellOverride("");
  }

  const restoredDrawings =
    estimate.pembDrawings ??
    (estimate.quoteControls as Record<string, unknown> | undefined)?.pembDrawings ??
    (estimate as Record<string, unknown> | undefined)?.engineeringDrawings;

  if (restoredDrawings !== undefined && restoredDrawings !== null) {
    store.setEngineeringDrawings(String(restoredDrawings));
  } else {
    store.setEngineeringDrawings("");
  }

  if (estimate.freightOverride !== undefined && estimate.freightOverride !== null) {
    store.setFreightOverride(String(estimate.freightOverride));
  } else {
    store.setFreightOverride("");
  }

  let effectiveInstallCost = Number(estimate.installCostPerSf);
  if (!effectiveInstallCost || isNaN(effectiveInstallCost)) {
    const totalInstCost = Number(
      (pricingRes?.instCost as number) ?? estimate.installCost ?? 0
    );
    if (totalInstCost > 0 && effectiveSqFt > 0) {
      effectiveInstallCost = Number(
        (totalInstCost / effectiveSqFt).toFixed(2)
      );
    } else {
      effectiveInstallCost = 5.5;
    }
  }

  let effectiveInstallSell = Number(estimate.sellPerSf);
  if (!effectiveInstallSell || isNaN(effectiveInstallSell)) {
    const totalInstSell = Number((pricingRes?.instSell as number) ?? 0);
    if (totalInstSell > 0 && effectiveSqFt > 0) {
      effectiveInstallSell = Number(
        (totalInstSell / effectiveSqFt).toFixed(2)
      );
    } else {
      effectiveInstallSell = 8.5;
    }
  }

  store.setInstallCost(effectiveInstallCost);
  store.setInstallSell(effectiveInstallSell);
  store.setPembEstimateId(finalId || null);
  store.setSquareFootage(effectiveSqFt);
  store.setBuildingSize(estimate.buildingSize || "");

  const formattedQuoteDate = estimate.quoteDate
    ? new Date(estimate.quoteDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const leadInfo = {
    leadId: estimate.leadId || "",
    leadName:
      estimate.leadCompanyName ||
      estimate.jobNumber ||
      estimate.cityStateZip ||
      "Saved Estimate",
    email: estimate.customerEmail || "",
    street: estimate.streetAddress || "",
    cityStateZip: estimate.cityStateZip || "",
    buildingSize: estimate.buildingSize || "",
    squareFootage: String(effectiveSqFt || ""),
    jobNumber: estimate.jobNumber || "",
    quoteDate: formattedQuoteDate,
  };

  store.setPembLeadData(leadInfo);

  const pricingObj = (estimate.pricingResult || {}) as Record<
    string,
    unknown
  >;
  if (!pricingObj.rows && estimate.breakdownRows) {
    pricingObj.rows = estimate.breakdownRows;
  }

  const resolvedParsedCategories =
    estimate.parsedCategories ||
    (estimate as Record<string, unknown>).parsed_categories ||
    (estimate.fullQuoteResult as Record<string, unknown>)?.parsedCategories ||
    (estimate.fullQuoteResult as Record<string, unknown>)?.parsed_categories ||
    (estimate.pricingResult as Record<string, unknown>)?.parsedCategories ||
    (estimate.pricingResult as Record<string, unknown>)?.parsed_categories ||
    ((estimate as Record<string, unknown>).extractedShipper as Record<string, unknown>)?.parsedCategories;

  const tabSummaryList = Array.isArray(estimate.tabSummary)
    ? (estimate.tabSummary as ShipperTabSummary[])
    : [];

  const shipperData: ExtractShipperResponseData = {
    fileName: estimate.sourceFileName || "Shipper.xlsx",
    sheetCount: tabSummaryList.length || 1,
    totalWeightLbs: Number(
      estimate.totalWeightLbs || (pricingRes?.totWt as number) || 0
    ),
    squareFootage: effectiveSqFt,
    tabSummary: tabSummaryList,
    parsedCategories:
      (resolvedParsedCategories as Record<string, unknown>) ||
      estimate.parsedCategories,
    pricing: pricingObj as ShipperPricing,
    fullQuote:
      (estimate.fullQuoteResult as FullQuoteData) ||
      (pricingObj as FullQuoteData),
  };

  store.setPembExtractedShipper(shipperData);

  if (estimate.extractedDrawingFields) {
    store.setPembExtractedDrawing({
      fileName: estimate.sourceFileName || "Drawing.pdf",
      textItemCount: 0,
      filledCount: 0,
      extracted: estimate.extractedDrawingFields,
      rawTextPreview: "",
    });
  }

  if (estimate.sourceFileName) {
    store.setPembPdfFileName(estimate.sourceFileName);
  }

  return {
    isStorage: false,
    finalId,
    effectiveSqFt,
    estimate,
    leadInfo,
    shipperData,
  };
}

export function useLoadEstimateToEditor() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadAndEdit = useCallback(
    async (estimateOrId: string | SaveEstimatePayload) => {
      let estimate: SaveEstimatePayload;
      const id =
        typeof estimateOrId === "string"
          ? estimateOrId
          : estimateOrId._id || (estimateOrId as { id?: string }).id;

      setIsLoading(true);
      if (id) setLoadingId(id);

      try {
        if (id) {
          try {
            const res = await getEstimateByIdProvider(id);
            const fetchedData = res.data || res;
            let fullEst: SaveEstimatePayload | null = null;
            if ((fetchedData as Record<string, unknown>)?.estimate) {
              fullEst = (fetchedData as Record<string, unknown>).estimate as SaveEstimatePayload;
            } else if (
              fetchedData &&
              typeof fetchedData === "object" &&
              !Array.isArray(fetchedData)
            ) {
              fullEst = fetchedData as SaveEstimatePayload;
            }

            if (fullEst) {
              estimate = {
                ...(typeof estimateOrId === "object" ? estimateOrId : {}),
                ...fullEst,
              };
            } else if (typeof estimateOrId === "object") {
              estimate = estimateOrId;
            } else {
              throw new Error("Invalid estimate response");
            }
          } catch (fetchErr) {
            console.warn(
              "Failed to fetch full estimate detail by ID, falling back to passed estimate:",
              fetchErr
            );
            if (typeof estimateOrId === "object") {
              estimate = estimateOrId;
            } else {
              throw fetchErr;
            }
          }
        } else if (typeof estimateOrId === "object") {
          estimate = estimateOrId;
        } else {
          throw new Error("No estimate ID provided to load");
        }

        const hydration = hydrateEstimateIntoStore(estimate, id);

        if (estimate.jobType?.toUpperCase() === "CUSTOM") {
          navigate(`/quotation/custom?id=${hydration.finalId || id || estimate._id}`);
          return;
        }

        if (hydration.isStorage) {
          navigate("/quotation/storage-cog", {
            state: {
              storageData: estimate.storageData,
              storagePricing: estimate.storagePricingResult,
              estimateId: hydration.finalId,
              sourceFileName: estimate.sourceFileName || "Storage_COG.xlsx",
              customerLeadName: estimate.leadCompanyName || "",
              customerAddress:
                estimate.cityStateZip || estimate.streetAddress || "",
              customerEmail: estimate.customerEmail || "",
              jobNumber: estimate.jobNumber || "",
              leadId: estimate.leadId || "",
            },
          });
          return;
        }

        navigate("/quotation/pemb", {
          state: {
            extractedShipper: hydration.shipperData,
            extractedDrawing: estimate.extractedDrawingFields
              ? {
                  fileName: estimate.sourceFileName || "Drawing.pdf",
                  textItemCount: 0,
                  filledCount: 0,
                  extracted: estimate.extractedDrawingFields,
                  rawTextPreview: "",
                }
              : undefined,
            quotationForm: hydration.leadInfo,
            estimateId: hydration.finalId,
            sqFt: String(hydration.effectiveSqFt || ""),
            buildingSize: estimate.buildingSize || "",
            pdfFileName: estimate.sourceFileName,
          },
        });
      } catch (err) {
        console.error("Failed to load estimate into editor:", err);
        throw err;
      } finally {
        setIsLoading(false);
        setLoadingId(null);
      }
    },
    [navigate]
  );

  return {
    loadAndEdit,
    isLoading,
    loadingId,
  };
}
