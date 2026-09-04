import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Printer,
  FileCheck,
  Send,
  Loader2,
  ExternalLink,
  AlertCircle,
  FileEdit,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotationQuery } from "@/modules/quotations/quotations.hooks";
import { SubmitApprovalModal } from "@/modules/quotation-generator/components/submit-approval-modal";
import { SendQuotationModal } from "@/modules/quotation-generator/components/send-quotation-modal";
import { QuotationApprovalBanner } from "@/modules/quotation-generator/components/quotation-approval-banner";
import { ServerDocumentPreview } from "@/modules/quotation-generator/components/server-document-preview";
import { useLoadEstimateToEditor } from "@/modules/quotation-generator/hooks/use-load-estimate-to-editor";
import { apiClient } from "@/modules/auth/auth.api";
import type {
  WorkflowStatus,
  ApprovalStatus,
  QuotationApprovalInfo,
  QuotationItem,
} from "@/modules/quotations/quotations.api";

export default function QuotationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  // HTML Preview State
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const { loadAndEdit, isLoading: isEditingEstimate } =
    useLoadEstimateToEditor();

  // Fetch quotation details with includeEstimate=true and includeDocuments=true
  const {
    data: quotationResponse,
    isLoading,
    isError,
    refetch,
  } = useQuotationQuery(id, {
    includeEstimate: true,
    includeDocuments: true,
  });

  const quotation =
    (quotationResponse?.data as { quotation?: QuotationItem })?.quotation ||
    (quotationResponse?.data as QuotationItem);
  const estimate = quotation?.sourceEstimate || quotation?.estimate;

  const quoteNumber =
    quotation?.quoteNumber || estimate?.quoteNumber || "QUO-DRAFT";
  const workflowStatus: WorkflowStatus =
    quotation?.workflowStatus ||
    (quotation?.status as WorkflowStatus) ||
    (quotation?.approval?.status as WorkflowStatus) ||
    (quotation?.approvalStatus as WorkflowStatus) ||
    "draft";
  const versionNumber =
    quotation?.versionNumber || estimate?.versionNumber || 1;

  const approvalInfo: QuotationApprovalInfo = useMemo(() => {
    if (quotation?.approval) {
      return quotation.approval;
    }
    return {
      status: (quotation?.approvalStatus || "not_submitted") as ApprovalStatus,
      rejectionReason: (quotation as { rejectionReason?: string })
        ?.rejectionReason,
      approvedVersionNumber: (quotation as { approvedVersionNumber?: number })
        ?.approvedVersionNumber,
    };
  }, [quotation]);

  const isSent = workflowStatus === "sent";

  const isApproved =
    approvalInfo?.status === "approved" ||
    workflowStatus === "approved" ||
    isSent;
  const isStaleApproved =
    (approvalInfo?.status === "approved" || workflowStatus === "approved") &&
    approvalInfo?.approvedVersionNumber !== undefined &&
    approvalInfo?.approvedVersionNumber !== null &&
    approvalInfo.approvedVersionNumber !== versionNumber;

  const canSubmit =
    workflowStatus === "draft" ||
    approvalInfo?.status === "not_submitted" ||
    approvalInfo?.status === "rejected" ||
    workflowStatus === "rejected" ||
    isStaleApproved;

  const customerName =
    quotation?.companyName ||
    (typeof quotation?.customerId === "object"
      ? quotation?.customerId?.firstName
      : null) ||
    (typeof quotation?.leadId === "object"
      ? quotation?.leadId?.projectName
      : null) ||
    estimate?.leadCompanyName ||
    "Valued Customer";

  const customerEmail =
    (typeof quotation?.customerId === "object"
      ? quotation?.customerId?.email
      : null) ||
    (typeof quotation?.createdBy === "object"
      ? quotation?.createdBy?.email
      : null) ||
    estimate?.customerEmail ||
    "";

  const rawEstimateId =
    quotation?.sourceEstimateId ||
    estimate?._id ||
    quotation?.documentMeta?.sourceEstimateId;
  const sourceEstimateId =
    typeof rawEstimateId === "object" && rawEstimateId !== null
      ? (rawEstimateId as { _id?: string })._id
      : (rawEstimateId as string | undefined);

  const isStorage =
    estimate?.jobType?.toUpperCase() === "STORAGE" ||
    Boolean(estimate?.storageData) ||
    quotation?.buildingType?.toLowerCase().includes("storage");

  // Effective quotation ID
  const effectiveQuotationId = quotation?._id || id;

  // Direct routes:
  // 1) HTML Preview: GET /api/quotations/:quotationId/pdf?format=html
  const htmlPreviewUrl = effectiveQuotationId
    ? `/api/quotations/${encodeURIComponent(effectiveQuotationId)}/pdf?format=html`
    : null;

  // 2) PDF Download: GET /api/quotations/:quotationId/pdf?format=pdf (default is pdf)
  const pdfDownloadUrl = effectiveQuotationId
    ? `/api/quotations/${encodeURIComponent(effectiveQuotationId)}/pdf?format=pdf`
    : null;

  // Fetch HTML preview
  const loadHtmlPreview = useCallback(async () => {
    if (!htmlPreviewUrl) return;
    setIsPreviewLoading(true);
    setPreviewError(null);
    try {
      const response = await apiClient.get<string>(htmlPreviewUrl, {
        headers: { Accept: "text/html" },
        responseType: "text",
      });

      if (typeof response.data === "string") {
        setPreviewHtml(response.data);
      } else {
        setPreviewHtml(String(response.data || ""));
      }
    } catch (err: unknown) {
      console.error("Failed to load quotation HTML preview:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load quotation preview.";
      setPreviewError(msg);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [htmlPreviewUrl]);

  useEffect(() => {
    if (htmlPreviewUrl) {
      loadHtmlPreview();
    }
  }, [htmlPreviewUrl, loadHtmlPreview]);

  const handleDownloadPdf = async () => {
    if (!pdfDownloadUrl) return;
    setIsDownloadingPdf(true);
    try {
      const res = await apiClient.get(pdfDownloadUrl, { responseType: "blob" });
      const url = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation_${quoteNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditEstimate = () => {
    if (estimate) {
      loadAndEdit(estimate);
    } else if (sourceEstimateId) {
      loadAndEdit(sourceEstimateId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-100 gap-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading quotation details...
        </p>
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className="p-8 space-y-4 max-w-2xl mx-auto text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">
          Quotation Not Found
        </h2>
        <p className="text-sm text-slate-600">
          Could not find the requested quotation. It may have been deleted or
          the ID is invalid.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Go Back
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/leads/quotation-list")}
          >
            All Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate("/leads/quotation-list")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                {customerName}
              </h1>
              {quoteNumber && (
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  Quote #{quoteNumber}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                v{versionNumber}
              </span>
              {isStorage && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                  Mini Storage
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Send to Customer Button (if approved & not stale) */}
          {isApproved && !isStaleApproved && (
            <Button
              type="button"
              onClick={() => setShowSendModal(true)}
              disabled={isSent}
              title={
                isSent
                  ? "Quotation has already been sent to customer"
                  : undefined
              }
              className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs ${
                isSent
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              }`}
            >
              <Send className="h-4 w-4" />
              {isSent ? "Already Sent" : "Send to Customer"}
            </Button>
          )}

          {/* Submit / Re-submit for Approval Button */}
          {canSubmit && (
            <Button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileCheck className="h-4 w-4" />
              {workflowStatus === "rejected" || isStaleApproved
                ? "Re-submit for Approval"
                : "Submit for Approval"}
            </Button>
          )}

          {/* Edit Estimate Button (if backed by estimate) */}
          {sourceEstimateId && (
            <Button
              type="button"
              onClick={handleEditEstimate}
              disabled={isEditingEstimate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="Load estimate into generator editor to modify"
            >
              {isEditingEstimate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileEdit className="h-4 w-4" />
              )}
              Edit Estimate
            </Button>
          )}

          {/* Source Estimate Link Button */}
          {sourceEstimateId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigate(`/quotation/history/${sourceEstimateId}`);
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer bg-white"
            >
              <ExternalLink className="h-4 w-4" />
              Source Estimate
            </Button>
          )}

          {/* Download PDF Button */}
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            title={"Download PDF file"}
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloadingPdf ? "Downloading..." : "Download PDF"}
          </Button>

          {/* Print Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer bg-white"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Approval Status & Workflow Banner */}
      <QuotationApprovalBanner
        workflowStatus={workflowStatus}
        approval={approvalInfo}
        versionNumber={versionNumber}
        onSubmitForApproval={() => setShowSubmitModal(true)}
      />

      {/* Document HTML Preview Card */}
      <div id="quotation-preview-section">
        <ServerDocumentPreview
          html={previewHtml}
          isLoading={isPreviewLoading}
          error={previewError}
          onRetry={loadHtmlPreview}
          title={`Quotation Document — ${customerName}`}
          minHeight={850}
        />
      </div>

      {/* Modals for Approval & Send */}
      <SubmitApprovalModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        quotationId={quotation._id}
        estimateId={sourceEstimateId}
        quotationTitle={`Quotation #${quoteNumber} - ${customerName}`}
        quotationNumber={quoteNumber}
        versionNumber={versionNumber}
        totalAmount={
          quotation?.finalPrice
            ? `$${Number(quotation.finalPrice).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : undefined
        }
        onSuccess={() => {
          void refetch();
        }}
      />

      <SendQuotationModal
        open={showSendModal}
        onOpenChange={setShowSendModal}
        quotationId={quotation._id}
        customerEmail={customerEmail}
        customerName={customerName}
        approvalStatus={workflowStatus}
        versionNumber={versionNumber}
        approvedVersionNumber={approvalInfo?.approvedVersionNumber}
        onSuccess={() => {
          void refetch();
        }}
      />
    </div>
  );
}
