import { useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Printer, FolderUp, Loader2, FileSearch, Send, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import {
  downloadPdfProvider,
  saveEstimateProvider,
  type ExtractDrawingResponseData,
  type ExtractShipperResponseData,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { useQuotationPricing } from "../hooks/use-quotation-pricing";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "../components/server-document-preview";
import { QuotationApprovalBanner } from "../components/quotation-approval-banner";
import { SubmitApprovalModal } from "../components/submit-approval-modal";
import { SendQuotationModal } from "../components/send-quotation-modal";
import type { QuotationApprovalInfo, WorkflowStatus } from "@/modules/quotations/quotations.api";

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
    workflowStatus?: WorkflowStatus;
    approval?: QuotationApprovalInfo;
    versionNumber?: number;
  };

  const [estimateId, setEstimateId] = useState<string | null>(
    navState.estimateId || null
  );

  // Approval & Workflow State
  const [workflowStatus] = useState<WorkflowStatus | string>(
    navState.workflowStatus || navState.approval?.status || "draft"
  );
  const [approvalInfo] = useState<QuotationApprovalInfo | null>(
    navState.approval || { status: "not_submitted" }
  );
  const [versionNumber] = useState<number>(
    navState.versionNumber || 1
  );

  // Modals state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isSubmittingApproval] = useState(false);

  const {
    jobType,
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
  } = useQuotationStore();

  const pricingData = useQuotationPricing({
    extractedShipper: navState.extractedShipper,
    sqFt: navState.sqFt,
    buildingSize: navState.buildingSize,
    quotationForm: navState.quotationForm,
    extractedDrawing: navState.extractedDrawing,
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



  const isApproved = approvalInfo?.status === "approved" || workflowStatus === "approved";
  const isStaleApproved =
    isApproved &&
    approvalInfo?.approvedVersionNumber !== undefined &&
    approvalInfo?.approvedVersionNumber !== null &&
    approvalInfo.approvedVersionNumber !== versionNumber;
  const canSend = isApproved && !isStaleApproved;

  // Server document preview payload
  const previewPayload: PreviewDocumentRequest = useMemo(
    () => ({
      estimateId: estimateId || undefined,
      jobType: "PEMB",
      leadCompanyName: customerLeadName,
      customerEmail,
      streetAddress: customerAddress,
      cityStateZip: customerAddress,
      buildingSize: displayBuildingSize,
      squareFootage: effectiveSqFt,
      jobNumber:
        navState.quotationForm?.jobNumber ||
        navState.extractedDrawing?.extracted?.jobnumber ||
        "",
      pricingResult: navState.extractedShipper?.pricing,
      fullQuote:
        navState.extractedShipper?.fullQuote ||
        (navState.extractedShipper?.pricing as Record<string, unknown> | undefined),
      extractedDrawingFields: navState.extractedDrawing?.extracted,
      contract: {
        customer: customerLeadName,
        address: customerAddress,
        city: customerAddress,
        email: customerEmail,
        date: quoteDate,
        deposit: "forty-percent (40%)",
        type:
          scope?.toLowerCase() === "both"
            ? "both"
            : scope?.toLowerCase() === "install"
            ? "install"
            : "supply",
        value: totalSellFormatted,
      },
      drawingAttachments: selectedPdf
        ? [{ name: selectedPdf.name, includeInQuote: true }]
        : [],
      sections: selectedPdf
        ? ["quote", "sow", "contract", "drawings"]
        : ["quote", "sow", "contract"],
    }),
    [
      estimateId,
      customerLeadName,
      customerEmail,
      customerAddress,
      displayBuildingSize,
      effectiveSqFt,
      navState.quotationForm?.jobNumber,
      navState.extractedDrawing?.extracted,
      navState.extractedShipper?.pricing,
      navState.extractedShipper?.fullQuote,
      quoteDate,
      scope,
      totalSellFormatted,
      selectedPdf,
    ]
  );

  const {
    html: serverPreviewHtml,
    isLoading: isPreviewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useServerDocumentPreview({
    payload: previewPayload,
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
      const payload: PreviewDocumentRequest = {
        estimateId: estimateId || undefined,
        jobType: "PEMB",
        leadCompanyName: customerLeadName,
        customerEmail,
        streetAddress: customerAddress,
        cityStateZip: customerAddress,
        buildingSize: displayBuildingSize,
        squareFootage: effectiveSqFt,
        jobNumber:
          navState.quotationForm?.jobNumber ||
          navState.extractedDrawing?.extracted?.jobnumber ||
          "",
        pricingResult: navState.extractedShipper?.pricing,
        fullQuote:
          navState.extractedShipper?.fullQuote ||
          (navState.extractedShipper?.pricing as
            | Record<string, unknown>
            | undefined),
        contract: {
          customer: customerLeadName,
          address: customerAddress,
          city: customerAddress,
          email: customerEmail,
          date: quoteDate,
          deposit: "forty-percent (40%)",
          type:
            scope?.toLowerCase() === "both"
              ? "both"
              : scope?.toLowerCase() === "install"
              ? "install"
              : "supply",
          value: totalSellFormatted,
        },
        extractedDrawingFields: navState.extractedDrawing?.extracted,
        drawingAttachments: selectedPdf
          ? [{ name: selectedPdf.name, includeInQuote: true }]
          : [],
        sections: selectedPdf
          ? ["quote", "sow", "contract", "drawings"]
          : ["quote", "sow", "contract"],
      };
      const res = await downloadPdfProvider(payload, estimateId || undefined);
      const pdfData = res.data || res;
      if (pdfData?.fileBase64) {
        const a = document.createElement("a");
        a.href = `data:${pdfData.mimeType || "application/pdf"};base64,${pdfData.fileBase64}`;
        a.download =
          pdfData.fileName ||
          `Quote_${(customerLeadName || "Package").replace(/\s+/g, "_")}.pdf`;
        a.click();
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
    setIsSavingEstimate(true);
    try {
      const cogsCostVal = parseFloat(cogsCostInput) || undefined;
      const cogsSellVal = parseFloat(cogsFixedSellPrice) || undefined;
      const marginLaborVal = parseFloat(marginLaborOverride) || undefined;
      const marginTargetVal = parseFloat(marginTargetMargin) || undefined;
      const marginSellVal = parseFloat(marginFixedSellOverride) || undefined;

      const res = await saveEstimateProvider(
        {
          _id: estimateId || undefined,
          jobType,
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
          cityStateZip:
            navState.quotationForm?.cityStateZip || customerAddress,
          buildingSize: displayBuildingSize,
          squareFootage: effectiveSqFt,
          sf: effectiveSqFt,
          blendPct: blendPercentage,
          installLevel: installDifficulty || "easy",
          installCostPerSf: installCost,
          sellPerSf: installSell,
          jobNumber:
            navState.quotationForm?.jobNumber ||
            navState.extractedDrawing?.extracted?.jobnumber ||
            "",
          sourceFileName:
            navState.pdfFileName ||
            navState.extractedShipper?.fileName ||
            "",
          parsedCategories: navState.extractedShipper?.parsedCategories,
          tabSummary: navState.extractedShipper?.tabSummary,
          breakdownRows: navState.extractedShipper?.pricing?.rows,
          pricingResult: navState.extractedShipper?.pricing,
          fullQuoteResult:
            navState.extractedShipper?.fullQuote ||
            (navState.extractedShipper?.pricing as
              | Record<string, unknown>
              | undefined),
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
            include: includeTax,
            zip: taxZip,
          },
          cogsOverride: cogsOverrideApplied
            ? {
                applied: true,
                costDollar: cogsCostVal ?? null,
                marginPct: cogsMaterialMargin,
                sellDollar: cogsSellVal ?? null,
                costPctAdj: cogsCostAdjustPercent,
              }
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
        estimateId || undefined
      );

      const data = res.data || res;
      const savedId = data?.estimate?._id || data?._id;
      if (savedId) {
        setEstimateId(savedId);
      }
      navigate("/quotation/quote-preview");
    } catch (err) {
      console.error("Failed to save estimate to history:", err);
      navigate("/quotation/quote-preview");
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

  const hasData = Boolean(
    navState.extractedShipper ||
    navState.quotationForm ||
    navState.extractedDrawing ||
    navState.sqFt ||
    navState.buildingSize
  );

  return (
    <div className="space-y-6 p-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back 
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Quote Preview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Full assembled package — Quote · SOW · Contract · Building Drawings · Print or Save as PDF
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Submit for Approval Button (when draft/rejected/stale) */}
          {(!isApproved || isStaleApproved) && (
            <Button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileCheck className="h-4 w-4" />
              Submit for Approval
            </Button>
          )}

          {/* Send to Customer Button (enabled when approved) */}
          <Button
            type="button"
            onClick={() => setShowSendModal(true)}
            disabled={!canSend}
            title={
              !canSend
                ? "Quotation must be approved by Admin before sending to customer"
                : "Send quotation package to customer"
            }
            className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs ${
              canSend
                ? "bg-[#16A34A] hover:bg-[#15803D] text-white"
                : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
            }`}
          >
            <Send className="h-4 w-4" />
            Send to Customer
          </Button>

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
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            {isSavingEstimate && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSavingEstimate ? "Saving..." : "Save to History"}
          </Button>
        </div>
      </div>

      {/* Approval Status & Workflow Banner */}
      <QuotationApprovalBanner
        workflowStatus={workflowStatus}
        approval={approvalInfo}
        versionNumber={versionNumber}
        onSubmitForApproval={() => setShowSubmitModal(true)}
        onSendToCustomer={() => setShowSendModal(true)}
        isSubmitting={isSubmittingApproval}
      />

      {!hasData && (
        <Card className="p-8 text-center bg-blue-50/50 border border-blue-200 rounded-xl mb-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <FileSearch className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Viewing Default Quote Template
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You can select a specific quote package from the Quote Preview Hub to inspect its custom document.
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

      {/* Approval & Send Modals */}
      <SubmitApprovalModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        quotationId={estimateId || undefined}
        quotationTitle={`Quote Package - ${customerLeadName}`}
        versionNumber={versionNumber}
        totalAmount={totalSellFormatted}
      />

      <SendQuotationModal
        open={showSendModal}
        onOpenChange={setShowSendModal}
        quotationId={estimateId || undefined}
        customerEmail={customerEmail}
        customerName={customerLeadName}
        approvalStatus={approvalInfo?.status || workflowStatus}
        versionNumber={versionNumber}
        approvedVersionNumber={approvalInfo?.approvedVersionNumber}
      />
    </div>
  );
}

export default QuotePreviewPage;
