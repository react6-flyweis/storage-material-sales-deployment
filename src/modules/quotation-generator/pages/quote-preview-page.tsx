import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, FolderUp, Loader2, FileSearch, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api-error";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  downloadPdfProvider,
  saveEstimateProvider,
  getEstimateByIdProvider,
  type ExtractDrawingResponseData,
  type ExtractShipperResponseData,
  type SaveEstimatePayload,
} from "../estimates.api";
import { downloadCustomQuotePdfProvider } from "../custom-quotes.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { usePembDocumentPayload } from "../hooks/use-pemb-document-payload";
import { ServerDocumentPreview } from "../components/server-document-preview";
import { hydrateEstimateIntoStore } from "../hooks/use-load-estimate-to-editor";

export function QuotePreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);

  const navState = (location.state || {}) as {
    quotationForm?: Record<string, string>;
    extractedDrawing?: ExtractDrawingResponseData;
    extractedShipper?: ExtractShipperResponseData;
    sqFt?: string;
    buildingSize?: string;
    additionalNotes?: string;
    pdfFileName?: string;
    estimateId?: string;
    customQuoteId?: string;
    quoteKind?: string;
    jobType?: string;
    isCustom?: boolean;
    customPricing?: {
      matCost: number;
      freight: number;
      laborCost: number;
      marginPct: number;
      sell: number;
      profit: number;
      profPct: number;
      totalCost: number;
      sellOverride?: number | null;
    };
    taxRate?: number;
    includeTax?: boolean;
    taxZip?: string;
    salesTax?: {
      rate?: number;
      taxRate?: number;
      include?: boolean;
      includeTax?: boolean;
      zip?: string;
      taxZip?: string;
    };
  };

  const {
    jobType,
    companyBrand,
    scope,
    roofType,
    installCost,
    installSell,
    blendPercentage,
    installDifficulty,
    concreteInclude,
    concreteCostSf,
    concreteMarginPct,
    concreteSlabThickness,
    concretePsiRating,
    concreteNotes,
    concreteInclusions,
    insulationInclude,
    insulationSystem,
    insulationRValueRoof,
    insulationRValueWalls,
    insulationCogsSf,
    insulationMarginPct,
    taxZip,
    taxRate,
    includeTax,
    cogsOverrideApplied,
    cogsCostInput,
    cogsCostAdjustPercent,
    cogsMaterialMargin,
    cogsFixedSellPrice,
    marginOverrideApplied,
    marginLaborOverride,
    marginTargetMargin,
    marginFixedSellOverride,
    steelFinish,
    freightOverride,
    materialSellOverride,
    engineeringDrawings,
    pembEstimateId,
    setPembEstimateId,
    pembExtractedShipper,
  } = useQuotationStore();

  const [estimateId, setEstimateId] = useState<string | null>(
    navState.estimateId || pembEstimateId || null,
  );

  useEffect(() => {
    const eid = navState.estimateId || pembEstimateId;
    if (eid) {
      setEstimateId(eid);
      setPembEstimateId(eid);
      getEstimateByIdProvider(eid)
        .then((res) => {
          const estData = (res?.data?.estimate ||
            res?.estimate ||
            res?.data ||
            res) as SaveEstimatePayload | undefined;
          if (
            estData &&
            (estData._id ||
              estData.jobType ||
              estData.parsedCategories ||
              estData.storageData)
          ) {
            hydrateEstimateIntoStore(estData, eid);
          }
        })
        .catch((err) => {
          console.warn("Failed to load estimate for preview:", err);
        });
    }
  }, [navState.estimateId, pembEstimateId, setPembEstimateId]);

  useEffect(() => {
    const rawTax =
      navState.salesTax ||
      (navState.extractedShipper?.fullQuote as Record<string, unknown> | undefined)?.salesTax ||
      (navState.extractedShipper?.fullQuote as Record<string, unknown> | undefined)?.sales_tax ||
      (navState.extractedShipper?.pricing as Record<string, unknown> | undefined)?.salesTax ||
      (navState.extractedShipper?.pricing as Record<string, unknown> | undefined)?.sales_tax;

    const qStore = useQuotationStore.getState();
    const taxObj =
      rawTax && typeof rawTax === "object"
        ? (rawTax as Record<string, unknown>)
        : null;

    const zip =
      taxObj?.zip ||
      taxObj?.taxZip ||
      taxObj?.postalCode ||
      taxObj?.zipCode ||
      navState.taxZip ||
      navState.quotationForm?.cityStateZip?.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1] ||
      navState.quotationForm?.street?.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1];
    const rate =
      taxObj?.rate ??
      taxObj?.taxRate ??
      taxObj?.tax_rate ??
      navState.taxRate;
    const inc =
      taxObj?.include ??
      taxObj?.includeTax ??
      taxObj?.isTaxIncluded ??
      navState.includeTax;

    if (zip && qStore.taxZip !== String(zip)) {
      qStore.setTaxZip(String(zip));
    }
    if (
      rate !== undefined &&
      rate !== null &&
      !isNaN(Number(rate)) &&
      qStore.taxRate !== Number(rate)
    ) {
      qStore.setTaxRate(Number(rate));
    }
    if (inc !== undefined && inc !== null && qStore.includeTax !== Boolean(inc)) {
      qStore.setIncludeTax(Boolean(inc));
    }
  }, [
    navState.salesTax,
    navState.taxZip,
    navState.taxRate,
    navState.includeTax,
    navState.extractedShipper,
    navState.quotationForm,
  ]);

  const initialPdfName =
    navState.pdfFileName ||
    navState.extractedDrawing?.fileName ||
    "Steel_Building_Preliminary_Drawing_Vector.pdf";

  // File state for PDF dropzone
  const [selectedPdf, setSelectedPdf] = useState<{
    name: string;
    url?: string;
  } | null>({
    name: initialPdfName,
  });

  const {
    payload: previewPayload,
    buildPayload,
    pricingData,
    effectiveEstimateId,
    hasData,
  } = usePembDocumentPayload({
    estimateId: navState.estimateId || estimateId,
    extractedShipper: navState.extractedShipper,
    extractedDrawing: navState.extractedDrawing,
    quotationForm: navState.quotationForm,
    sqFt: navState.sqFt,
    buildingSize: navState.buildingSize,
    pdfFileName: selectedPdf?.name,
    sections: selectedPdf
      ? ["quote", "sow", "contract", "drawings"]
      : ["quote", "sow", "contract"],
    drawingAttachments: selectedPdf
      ? [{ name: selectedPdf.name, includeInQuote: true }]
      : [],
  });

  const {
    customerLeadName,
    customerAddress,
    customerEmail,
    displayBuildingSize,
    effectiveSqFt,
  } = pricingData;

  const isCustomQuote = Boolean(
    navState.isCustom ||
      navState.quoteKind === "custom" ||
      navState.jobType === "Custom" ||
      Boolean(navState.customQuoteId) ||
      jobType === "Custom"
  );
  const customQuoteId =
    navState.customQuoteId || navState.estimateId || estimateId || undefined;

  const effectivePreviewPayload = useMemo(() => {
    if (isCustomQuote) {
      return {
        ...previewPayload,
        quoteKind: "custom" as const,
        jobType: "Custom" as const,
        customQuoteId,
        companyBrand: (companyBrand || "SM") as "SM" | "SBD",
      };
    }
    return previewPayload;
  }, [isCustomQuote, previewPayload, customQuoteId, companyBrand]);

  const isEditing = Boolean(
    estimateId || pembEstimateId || navState.estimateId,
  );

  const {
    html: serverPreviewHtml,
    isLoading: isPreviewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useServerDocumentPreview({
    payload: effectivePreviewPayload,
  });

  const handleScrollToPreview = () => {
    previewSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeCustomer = (customerLeadName || "Quote").replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    document.title = `Quote_Package_${safeCustomer}`;
    window.print();
    document.title = originalTitle;
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      if (isCustomQuote && customQuoteId) {
        const brand = (companyBrand === "SBD" ? "SBD" : "SM") as "SM" | "SBD";
        const pdfData = await downloadCustomQuotePdfProvider(customQuoteId, { company: brand });
        if (pdfData?.fileBase64) {
          downloadPdfFromBase64(
            pdfData.fileBase64,
            pdfData.fileName || `Custom_Quote_${(customerLeadName || "Package").replace(/\s+/g, "_")}.pdf`,
            pdfData.mimeType || "application/pdf"
          );
          toast.success("PDF downloaded successfully");
          return;
        }
      }
      const payload = buildPayload();
      const res = await downloadPdfProvider(payload, effectiveEstimateId);
      const pdfData = res?.data || res;
      if (pdfData?.fileBase64) {
        downloadPdfFromBase64(
          pdfData.fileBase64,
          pdfData.fileName || `Quote_${(customerLeadName || "Package").replace(/\s+/g, "_")}.pdf`,
          pdfData.mimeType || "application/pdf"
        );
        toast.success("PDF downloaded successfully");
      } else {
        handlePrint();
      }
    } catch (err) {
      console.error("Failed to download PDF via API, opening print dialog:", err);
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (isCustomQuote) {
      toast.success("Custom quote saved");
      if (customQuoteId) {
        navigate(`/quotation/history/${customQuoteId}`);
      } else {
        navigate("/quotation/history");
      }
      return;
    }
    setIsSavingEstimate(true);
    try {
      const activeEstId =
        estimateId || pembEstimateId || navState.estimateId || undefined;
      const matSellOverrideVal = materialSellOverride
        ? parseFloat(materialSellOverride)
        : null;
      const pembDrawingsVal = parseFloat(engineeringDrawings) || 0;
      const cogsCostVal = parseFloat(cogsCostInput) || undefined;
      const cogsSellVal = parseFloat(cogsFixedSellPrice) || undefined;
      const marginLaborVal = parseFloat(marginLaborOverride) || undefined;
      const marginTargetVal = parseFloat(marginTargetMargin) || undefined;
      const marginSellVal = parseFloat(marginFixedSellOverride) || undefined;

      const res = await saveEstimateProvider(
        {
          _id: activeEstId,
          jobType,
          companyBrand,
          scope:
            (scope || "Both").toLowerCase() === "supply"
              ? "Supply"
              : (scope || "Both").toLowerCase() === "install"
                ? "Install"
                : "Both",
          roofType,
          leadCompanyName: customerLeadName,
          customerEmail,
          streetAddress: navState.quotationForm?.street || "",
          cityStateZip: navState.quotationForm?.cityStateZip || customerAddress,
          buildingSize: displayBuildingSize,
          squareFootage: effectiveSqFt,
          sf: effectiveSqFt,
          blendPct: blendPercentage,
          installLevel: installDifficulty || "easy",
          installCostPerSf: installCost,
          sellPerSf: installSell,
          steelFinish: steelFinish || "red-iron",
          freightOverride: parseFloat(freightOverride) || undefined,
          materialSellOverride:
            matSellOverrideVal ?? (materialSellOverride === "" ? null : undefined),
          matSellOverride:
            matSellOverrideVal ?? (materialSellOverride === "" ? null : undefined),
          pembDrawings: pembDrawingsVal,
          jobNumber:
            navState.quotationForm?.jobNumber ||
            navState.extractedDrawing?.extracted?.jobnumber ||
            "",
          sourceFileName:
            navState.pdfFileName ||
            navState.extractedShipper?.fileName ||
            pembExtractedShipper?.fileName ||
            "",
          extractedDrawingFields: navState.extractedDrawing?.extracted,
          concreteAddon: {
            include: concreteInclude,
            costSF: concreteCostSf,
            marginPct: concreteMarginPct,
            thickness: concreteSlabThickness,
            psi: concretePsiRating,
            slabThickness: concreteSlabThickness,
            psiRating: concretePsiRating,
            sowNotes: concreteNotes,
            sowItems: concreteInclusions,
          },
          insulationAddon: {
            include: insulationInclude,
            costSF: insulationCogsSf,
            cogsSF: insulationCogsSf,
            marginPct: insulationMarginPct,
            system: insulationSystem,
            rRoof: insulationRValueRoof,
            rWall: insulationRValueWalls,
            rValueRoof: insulationRValueRoof,
            rValueWalls: insulationRValueWalls,
          },
          salesTax: {
            rate: taxRate,
            taxRate,
            include: includeTax,
            includeTax,
            zip: taxZip,
            taxZip,
          },
          cogsOverride: cogsOverrideApplied
            ? {
                applied: true,
                costDollar: cogsCostVal ?? null,
                marginPct: cogsMaterialMargin,
                sellDollar: cogsSellVal ?? null,
                costPctAdj: cogsCostAdjustPercent,
              }
            : matSellOverrideVal != null
              ? undefined
              : {
                  applied: false,
                },
          marginOverride: marginOverrideApplied
            ? {
                applied: true,
                laborSF: marginLaborVal ?? null,
                pct: marginTargetVal ?? null,
                sellFixed: marginSellVal ?? null,
              }
            : {
                applied: false,
              },
          status: "draft",
        },
        activeEstId,
      );

      const data = res.data || res;
      if (res && (res as { success?: boolean }).success === false) {
        throw new Error(res.message || "Failed to save estimate to history");
      }
      const savedId = data?.estimate?._id || data?._id || activeEstId;
      toast.success("Estimate saved to history successfully");
      if (savedId) {
        setEstimateId(savedId);
        setPembEstimateId(savedId);
        navigate(`/quotation/history/${savedId}`);
        return;
      }
      navigate("/quotation/history");
    } catch (err) {
      console.error("Failed to save estimate to history:", err);
      const msg = getApiErrorMessage(
        err,
        "Failed to save estimate to history. Please try again.",
      );
      toast.error(msg);
    } finally {
      setIsSavingEstimate(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setSelectedPdf({ name: file.name, url });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedPdf({ name: file.name, url });
    }
  };

  const handleClearAll = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2  text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Quote Preview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Full assembled package — Quote · SOW · Contract · Building
              Drawings · Print or Save as PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {isDownloadingPdf ? "Generating PDF..." : "Generate & Print PDF"}
          </Button>
          <Button
            type="button"
            onClick={handleSaveToHistory}
            disabled={isSavingEstimate}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            {isSavingEstimate && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {isSavingEstimate
              ? isEditing
                ? "Updating Changes..."
                : "Saving..."
              : isEditing
                ? "Update Changes"
                : "Save to History"}
          </Button>
        </div>
      </div>

      {!hasData && !isCustomQuote && (
        <Card className="p-8 text-center bg-blue-50/50 border border-blue-200 rounded-xl mb-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <FileSearch className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Viewing Default Quote Template
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You can select a specific quote package from the Quote Preview
                Hub to inspect its custom document.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => navigate("/quotation/quote-preview")}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
            >
              Browse Quote Packages
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content Area */}
      <div className="space-y-6 w-full max-w-5xl print:max-w-none print:w-full">
        {/* Building drawings & plans Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-xl no-print">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Building drawings & plans
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag images here — they appear after the SOW in the final PDF...
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer bg-white"
              >
                Clear All
              </Button>
              <Button
                type="button"
                onClick={handleScrollToPreview}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                Preview assembled PDF ↓
              </Button>
            </div>
          </div>

          {/* PDF Dropzone Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative border-2 border-dashed border-blue-400 bg-[#E6F4EA] rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors"
          >
            <label className="cursor-pointer flex flex-col items-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-md">
                <FolderUp className="h-6 w-6" />
              </div>

              {selectedPdf ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                    <span>✓</span>
                    <span>{selectedPdf.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    PDF Only - We only read page 1 - Click to Browse
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">
                    Drop PDF drawings here or click to browse
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    PDF Only - We only read page 1
                  </p>
                </div>
              )}
            </label>
          </div>
        </Card>

        <div ref={previewSectionRef} id="preview-section">
          <ServerDocumentPreview
            html={serverPreviewHtml}
            isLoading={isPreviewLoading}
            error={previewError}
            onRetry={refetchPreview}
            title={`Quote Package — ${customerLeadName || "Full Assembled Package"}`}
            minHeight={800}
          />
        </div>
      </div>
    </div>
  );
}

export default QuotePreviewPage;
