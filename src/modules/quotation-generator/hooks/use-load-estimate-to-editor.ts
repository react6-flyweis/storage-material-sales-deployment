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

        const finalId =
          estimate._id ||
          (estimate as { id?: string }).id ||
          id ||
          (typeof estimateOrId !== "string"
            ? estimateOrId._id || (estimateOrId as { id?: string }).id
            : undefined);
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
        if (estimate.salesTax) {
          if (estimate.salesTax.zip) store.setTaxZip(estimate.salesTax.zip);
          if (estimate.salesTax.rate !== undefined)
            store.setTaxRate(Number(estimate.salesTax.rate));
          if (estimate.salesTax.include !== undefined)
            store.setIncludeTax(Boolean(estimate.salesTax.include));
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

        // 6. Navigate Storage or PEMB
        if (isStorage) {
          store.setJobType("Storage");
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

          navigate("/quotation/storage-cog", {
            state: {
              storageData: estimate.storageData,
              storagePricing: estimate.storagePricingResult,
              estimateId: finalId,
              sourceFileName: estimate.sourceFileName || "Storage_COG.xlsx",
              customerLeadName: estimate.leadCompanyName || "",
              customerAddress:
                estimate.cityStateZip || estimate.streetAddress || "",
              customerEmail: estimate.customerEmail || "",
              jobNumber: estimate.jobNumber || "",
            },
          });
          return;
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
        if (estimate.blendPercentage !== undefined) {
          store.setBlendPercentage(Number(estimate.blendPercentage));
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

        const shipperData: ExtractShipperResponseData = {
          fileName: estimate.sourceFileName || "Shipper.xlsx",
          sheetCount: estimate.tabSummary?.length || 1,
          totalWeightLbs: Number(
            estimate.totalWeightLbs || (pricingRes?.totWt as number) || 0
          ),
          squareFootage: effectiveSqFt,
          tabSummary: (estimate.tabSummary || []) as ShipperTabSummary[],
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

        navigate("/quotation/pemb", {
          state: {
            extractedShipper: shipperData,
            extractedDrawing: estimate.extractedDrawingFields
              ? {
                  fileName: estimate.sourceFileName || "Drawing.pdf",
                  textItemCount: 0,
                  filledCount: 0,
                  extracted: estimate.extractedDrawingFields,
                  rawTextPreview: "",
                }
              : undefined,
            quotationForm: leadInfo,
            estimateId: finalId,
            sqFt: String(effectiveSqFt || ""),
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
