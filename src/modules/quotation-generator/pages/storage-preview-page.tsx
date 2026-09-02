import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, FolderUp, Loader2, RefreshCw, Printer, Send, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  downloadPdfProvider,
  saveEstimateProvider,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { useQuotationStore } from "@/modules/quotation-generator/quotation.store";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "../components/server-document-preview";
import { QuotationApprovalBanner } from "../components/quotation-approval-banner";
import { SubmitApprovalModal } from "../components/submit-approval-modal";
import { SendQuotationModal } from "../components/send-quotation-modal";
import type { QuotationApprovalInfo, WorkflowStatus } from "@/modules/quotations/quotations.api";
import type { StorageData, StoragePricing } from "../components/storage-preview-document";


function fmt(n?: number | string | null): string {
  const num = Number(n) || 0;
  return "$" + Math.round(num).toLocaleString();
}

export function StoragePreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const {
    scope: storeScope,
    concreteInclude: storeConcreteInclude,
    insulationInclude: storeInsulationInclude,
    includeTax: storeIncludeTax,
    taxRate: storeTaxRate,
    storageData: storeStorageData,
    storagePricing: storeStoragePricing,
    storageEstimateId: storeStorageEstimateId,
    storageCustomerLeadName: storeCustomerLeadName,
    storageCustomerAddress: storeCustomerAddress,
    storageCustomerEmail: storeCustomerEmail,
    storageJobNumber: storeJobNumber,
    storageDrawings,
    setStorageDrawings,
  } = useQuotationStore();

  const navState = (location.state || {}) as {
    storageData?: StorageData;
    storagePricing?: StoragePricing;
    estimateId?: string;
    sourceFileName?: string;
    customerLeadName?: string;
    customerAddress?: string;
    customerEmail?: string;
    jobNumber?: string;
    scope?: "Supply" | "Install" | "Both" | string;
    concreteInclude?: boolean;
    insulationInclude?: boolean;
    includeTax?: boolean;
    taxRate?: number;
    drawingAttachments?: Array<{ name?: string; fileBase64?: string; data?: string; includeInQuote?: boolean }>;
    drawings?: Array<{ name?: string; fileBase64?: string; data?: string; includeInQuote?: boolean }>;
    workflowStatus?: WorkflowStatus;
    approval?: QuotationApprovalInfo;
    versionNumber?: number;
  };


  useEffect(() => {
    const navDrawings = navState.drawingAttachments || navState.drawings;
    if (navDrawings?.length && (!storageDrawings || storageDrawings.length === 0)) {
      setStorageDrawings(
        navDrawings.map((d) => ({
          name: d.name || "Drawing",
          data: d.fileBase64 || d.data || "",
          includeInPackage: d.includeInQuote !== false,
        }))
      );
    }
  }, [navState.drawingAttachments, navState.drawings, storageDrawings, setStorageDrawings]);

  const storageData =
    (storeStorageData as StorageData | null) || navState.storageData;
  const storagePricing =
    (storeStoragePricing as StoragePricing | null) || navState.storagePricing;
  const [estimateId, setEstimateId] = useState<string | null>(
    storeStorageEstimateId || navState.estimateId || null
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

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const customerLeadName =
    storeCustomerLeadName ||
    navState.customerLeadName ||
    storageData?.project?.customer ||
    "Valued Customer";
  const customerAddress =
    storeCustomerAddress ||
    navState.customerAddress ||
    storageData?.project?.location ||
    "Project Location";
  const customerEmail =
    storeCustomerEmail || navState.customerEmail || "";
  const jobNumber =
    storeJobNumber ||
    navState.jobNumber ||
    storageData?.project?.jobNumber ||
    "8098";
  const scope = storeScope || navState.scope || "Both";
  const concreteInclude =
    storeConcreteInclude ?? navState.concreteInclude ?? false;
  const insulationInclude =
    storeInsulationInclude ?? navState.insulationInclude ?? false;
  const includeTax = storeIncludeTax ?? navState.includeTax ?? true;
  const taxRate = storeTaxRate ?? navState.taxRate ?? 0;

  const quoteDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const grandTotal = Number(
    storagePricing?.grandTotal ?? storagePricing?.totSell ?? storagePricing?.totalSell ?? 0
  );
  const totalSellFormatted = fmt(grandTotal);



  const isApproved = approvalInfo?.status === "approved" || workflowStatus === "approved";
  const isStaleApproved =
    isApproved &&
    approvalInfo?.approvedVersionNumber !== undefined &&
    approvalInfo?.approvedVersionNumber !== null &&
    approvalInfo.approvedVersionNumber !== versionNumber;
  const canSend = isApproved && !isStaleApproved;

  const handleScrollToPreview = () => {
    previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  const handlePrint = () => {
    const originalTitle = document.title;
    const safeCustomer = (customerLeadName || "Storage_Quote").replace(/[^a-zA-Z0-9_-]/g, "_");
    document.title = `Storage_Quote_${safeCustomer}`;
    window.print();
    document.title = originalTitle;
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const activeDrawings = storageDrawings.filter((d) => d.includeInPackage !== false);
      const drawingAttachments = activeDrawings.map((d) => ({
        name: d.name,
        fileBase64: d.data?.includes(",") ? d.data.split(",")[1] : d.data,
        includeInQuote: true,
      }));

      const payload = {
        jobType: "Storage",
        estimateId: estimateId || undefined,
        scope:
          (scope || "Both").toLowerCase() === "supply"
            ? "Supply"
            : (scope || "Both").toLowerCase() === "install"
            ? "Install"
            : "Both",
        leadCompanyName: customerLeadName || "Customer",
        customerEmail,
        streetAddress: customerAddress,
        cityStateZip: customerAddress,
        jobNumber: jobNumber || "8098",
        buildingSize:
          storageData?.buildings?.map((b) => `${b.width}x${b.length}`).join(", ") ||
          "Storage Complex",
        squareFootage:
          Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
          storageData?.buildings?.reduce(
            (acc, b) =>
              acc +
              (Number(b.sqft || b.squareFootage) ||
                Number(b.width || 0) * Number(b.length || 0)),
            0
          ) ||
          0,
        sf:
          Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
          storageData?.buildings?.reduce(
            (acc, b) =>
              acc +
              (Number(b.sqft || b.squareFootage) ||
                Number(b.width || 0) * Number(b.length || 0)),
            0
          ) ||
          0,
        pricingResult: storagePricing as Record<string, unknown>,
        storagePricingResult: storagePricing as Record<string, unknown>,
        storagePricing: storagePricing as Record<string, unknown>,
        storageData: storageData as Record<string, unknown>,
        concreteAddon: {
          include: navState.concreteInclude,
        },
        insulationAddon: {
          include: navState.insulationInclude,
        },
        salesTax: {
          include: navState.includeTax,
          rate: navState.taxRate,
        },
        drawingAttachments,
        sections: drawingAttachments.length > 0
          ? ["quote", "sow", "contract", "drawings"]
          : ["quote", "sow", "contract"],
        format: "pdf",
      };

      const res = await downloadPdfProvider(payload, estimateId || undefined);
      const pdfData = res.data || res;

      const fileName =
        pdfData?.fileName ||
        `Storage_Quote_${(customerLeadName || "Customer").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

      // 1. Check for base64 string
      const base64 =
        typeof pdfData === "string"
          ? pdfData
          : pdfData?.fileBase64 ||
            (pdfData as { base64?: string })?.base64 ||
            (pdfData as { pdfBase64?: string })?.pdfBase64;

      if (base64) {
        const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: pdfData?.mimeType || "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }

      // 2. Check for URL redirect
      const downloadUrl =
        (pdfData as { url?: string; downloadUrl?: string })?.url ||
        (pdfData as { url?: string; downloadUrl?: string })?.downloadUrl;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
        return;
      }

      // 3. Fallback to print dialog if stream was empty
      console.warn("Backend did not return base64 PDF stream, falling back to print dialog.");
      handlePrint();
    } catch (err) {
      console.error("Failed to generate PDF via server API:", err);
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveToHistory = async () => {
    setIsSavingEstimate(true);
    try {
      const activeDrawings = storageDrawings.filter((d) => d.includeInPackage !== false);
      const res = await saveEstimateProvider(
        {
          _id: estimateId || undefined,
          jobType: "Storage",
          scope: (scope || "Both").toLowerCase() === "supply" ? "Supply" : (scope || "Both").toLowerCase() === "install" ? "Install" : "Both",
          leadCompanyName: customerLeadName,
          customerEmail,
          streetAddress: customerAddress,
          cityStateZip: customerAddress,
          jobNumber,
          sourceFileName: navState.sourceFileName || "Storage_COG.xlsx",
          storageData: storageData as Record<string, unknown>,
          storagePricingResult: storagePricing as Record<string, unknown>,
          drawingAttachments: activeDrawings.map((d) => ({
            name: d.name,
            fileBase64: d.data,
            includeInQuote: true,
          })),
          status: "draft",
        },
        estimateId || undefined
      );

      const data = res.data || res;
      const savedId = data?.estimate?._id || data?._id;
      if (savedId) {
        setEstimateId(savedId);
      }
      navigate("/quotation/history");
    } catch (err) {
      console.error("Failed to save storage estimate:", err);
      navigate("/quotation/history");
    } finally {
      setIsSavingEstimate(false);
    }
  };

  const activeDrawings = useMemo(
    () => (storageDrawings || []).filter((d) => d.includeInPackage !== false),
    [storageDrawings]
  );

  const previewPayload: PreviewDocumentRequest = useMemo(
    () => ({
      jobType: "Storage",
      estimateId: estimateId || undefined,
      scope:
        (scope || "Both").toLowerCase() === "supply"
          ? "Supply"
          : (scope || "Both").toLowerCase() === "install"
          ? "Install"
          : "Both",
      leadCompanyName: customerLeadName || "Customer",
      customerEmail,
      streetAddress: customerAddress,
      cityStateZip: customerAddress,
      jobNumber: jobNumber || "8098",
      buildingSize:
        storageData?.buildings?.map((b) => `${b.width}x${b.length}`).join(", ") ||
        "Storage Complex",
      squareFootage:
        Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
        storageData?.buildings?.reduce(
          (acc, b) =>
            acc +
            (Number(b.sqft || b.squareFootage) ||
              Number(b.width || 0) * Number(b.length || 0)),
          0
        ) ||
        0,
      sf:
        Number(storagePricing?.totalSqFt || storagePricing?.squareFootage) ||
        storageData?.buildings?.reduce(
          (acc, b) =>
            acc +
            (Number(b.sqft || b.squareFootage) ||
              Number(b.width || 0) * Number(b.length || 0)),
          0
        ) ||
        0,
      pricingResult: storagePricing as Record<string, unknown>,
      storagePricingResult: storagePricing as Record<string, unknown>,
      storagePricing: storagePricing as Record<string, unknown>,
      storageData: storageData as Record<string, unknown>,
      concreteAddon: {
        include: concreteInclude,
      },
      insulationAddon: {
        include: insulationInclude,
      },
      salesTax: {
        include: includeTax,
        rate: taxRate,
      },
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
      drawingAttachments: activeDrawings.map((d) => ({
        name: d.name,
        fileBase64: d.data?.includes(",") ? d.data.split(",")[1] : d.data,
        includeInQuote: true,
      })),
      sections:
        activeDrawings.length > 0
          ? ["quote", "sow", "contract", "drawings"]
          : ["quote", "sow", "contract"],
    }),
    [
      estimateId,
      scope,
      customerLeadName,
      customerEmail,
      customerAddress,
      jobNumber,
      storageData,
      storagePricing,
      concreteInclude,
      insulationInclude,
      includeTax,
      taxRate,
      quoteDate,
      totalSellFormatted,
      activeDrawings,
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

  const handleRefreshPreview = async () => {
    setIsRefreshing(true);
    try {
      await refetchPreview();
    } catch (err) {
      console.warn("Refresh preview notice:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setStorageDrawings([
          ...storageDrawings,
          {
            name: file.name,
            data: (ev.target?.result as string) || "",
            includeInPackage: true,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setStorageDrawings([
          ...storageDrawings,
          {
            name: file.name,
            data: (ev.target?.result as string) || "",
            includeInPackage: true,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearAll = () => {
    setStorageDrawings([]);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Storage Quote Preview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Mini Storage Assembled Package — Quote · SOW · Contract · Layout Plans
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
            variant="outline"
            onClick={handleRefreshPreview}
            disabled={isRefreshing || isPreviewLoading}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer bg-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing || isPreviewLoading ? "animate-spin" : ""}`} />
            Refresh
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
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
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

      {/* Main Content Area */}
      <div className="space-y-6 w-full max-w-5xl print:max-w-none print:w-full">
        {/* Building drawings & plans Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-xl no-print">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Building drawings & layout plans
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload layout plans or elevations — they will be included in the server preview & final PDF.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer bg-white"
              >
                Clear All ({storageDrawings.length})
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

          {/* PDF / Image Dropzone Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative border-2 border-dashed border-blue-400 bg-[#E6F4EA] rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors"
          >
            <label className="cursor-pointer flex flex-col items-center">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-md">
                <FolderUp className="h-6 w-6" />
              </div>

              {storageDrawings.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                    <span>✓</span>
                    <span>{storageDrawings.length} drawing(s) attached</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Click to browse or drop more drawings (PDF or Images)
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">
                    Drop drawings or layout plans here or click to browse
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Unit mix layouts, anchor bolt plans, elevations (PDF or Images)
                  </p>
                </div>
              )}
            </label>
          </div>
        </Card>

        {/* Server Assembled Storage Preview Document */}
        <div ref={previewSectionRef} id="preview-section">
          <ServerDocumentPreview
            html={serverPreviewHtml}
            isLoading={isPreviewLoading}
            error={previewError}
            onRetry={refetchPreview}
            title={`Storage Package — ${customerLeadName || "Full Assembled Package"}`}
            minHeight={800}
          />
        </div>

      </div>

      {/* Approval & Send Modals */}
      <SubmitApprovalModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        quotationId={estimateId || undefined}
        quotationTitle={`Storage Package - ${customerLeadName}`}
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

export default StoragePreviewPage;
