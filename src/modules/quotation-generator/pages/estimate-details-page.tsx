import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  Printer,
  ArrowRightCircle,
  FileEdit,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getEstimateByIdProvider,
  downloadPdfProvider,
  type SaveEstimatePayload,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "../components/server-document-preview";
import { QuotationApprovalBanner } from "../components/quotation-approval-banner";
import { SubmitApprovalModal } from "../components/submit-approval-modal";
import { SendQuotationModal } from "../components/send-quotation-modal";
import { useLoadEstimateToEditor } from "../hooks/use-load-estimate-to-editor";
import { useConvertEstimateToQuotationMutation } from "@/modules/quotations/quotations.hooks";
import type {
  WorkflowStatus,
  ApprovalStatus,
  QuotationApprovalInfo,
} from "@/modules/quotations/quotations.api";

export function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const [estimate, setEstimate] = useState<SaveEstimatePayload | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const { loadAndEdit, isLoading: isEditing } = useLoadEstimateToEditor();
  const convertMutation = useConvertEstimateToQuotationMutation();

  const fetchEstimateDetail = useCallback(async () => {
    if (!id) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await getEstimateByIdProvider(id);
      const fetchedData = res.data || res;
      if ((fetchedData as { estimate?: SaveEstimatePayload })?.estimate) {
        setEstimate(
          (fetchedData as { estimate: SaveEstimatePayload }).estimate,
        );
      } else {
        setEstimate(fetchedData as SaveEstimatePayload);
      }
    } catch (err: unknown) {
      console.error("Failed to load estimate detail:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load estimate details. Please try again.";
      setFetchError(msg);
    } finally {
      setIsFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEstimateDetail();
  }, [fetchEstimateDetail]);

  const isStorage = useMemo(() => {
    return (
      estimate?.jobType?.toUpperCase() === "STORAGE" ||
      Boolean(estimate?.storageData)
    );
  }, [estimate]);

  const customerLeadName =
    estimate?.leadCompanyName || estimate?.jobNumber || "Saved Estimate";
  const customerEmail = estimate?.customerEmail || "";
  const customerAddress =
    estimate?.cityStateZip || estimate?.streetAddress || "";
  const jobNumber = estimate?.jobNumber || "";

  const conversion = estimate?.conversion;
  const quoteNumber = conversion?.quoteNumber;

  const workflowStatus = (conversion?.workflowStatus ||
    estimate?.workflowStatus ||
    estimate?.approvalStatus ||
    "draft") as WorkflowStatus;

  const approvalInfo: QuotationApprovalInfo = useMemo(() => {
    if (estimate?.approval) {
      return estimate.approval as unknown as QuotationApprovalInfo;
    }
    return {
      status: (conversion?.approvalStatus ||
        estimate?.approvalStatus ||
        "not_submitted") as ApprovalStatus,
      rejectionReason: estimate?.rejectionReason as string | undefined,
    };
  }, [estimate, conversion]);

  const isApproved =
    approvalInfo?.status === "approved" || workflowStatus === "approved";
  const versionNumber = estimate?.versionNumber || 1;
  const isStaleApproved =
    isApproved &&
    approvalInfo?.approvedVersionNumber !== undefined &&
    approvalInfo?.approvedVersionNumber !== null &&
    approvalInfo.approvedVersionNumber !== versionNumber;

  // Server document preview request payload
  const previewPayload: PreviewDocumentRequest | null = useMemo(() => {
    if (!id || !estimate) return null;
    return {
      estimateId: id,
      jobType: isStorage ? "Storage" : "PEMB",
      sourceFileName: estimate.sourceFileName,
      customerLeadName,
      customerAddress,
      customerEmail,
      jobNumber,
      pricingResult: estimate.pricingResult,
      storageData: estimate.storageData || undefined,
      storagePricingResult: estimate.storagePricingResult || undefined,
      fullQuote: estimate.fullQuoteResult,
    };
  }, [
    id,
    estimate,
    isStorage,
    customerLeadName,
    customerAddress,
    customerEmail,
    jobNumber,
  ]);

  const {
    html: serverPreviewHtml,
    isLoading: isPreviewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useServerDocumentPreview({
    payload: previewPayload,
    enabled: Boolean(id && estimate),
    debounceMs: 100,
  });

  const handleDownloadPdf = async () => {
    if (!id) return;
    setIsDownloadingPdf(true);
    try {
      await downloadPdfProvider({
        estimateId: id,
        jobType: isStorage ? "Storage" : "PEMB",
        format: "pdf",
        customerLeadName,
        customerEmail,
        customerAddress,
        jobNumber,
        pricingResult: estimate?.pricingResult,
        storageData: estimate?.storageData || undefined,
        storagePricingResult: estimate?.storagePricingResult || undefined,
        fullQuote: estimate?.fullQuoteResult,
      });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleConvertToQuotation = async () => {
    if (!id) return;
    setIsConverting(true);
    try {
      await convertMutation.mutateAsync(id);
      await fetchEstimateDetail();
    } catch (err) {
      console.error("Failed to convert estimate to quotation:", err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleEditClick = () => {
    if (estimate) {
      loadAndEdit(estimate);
    } else if (id) {
      loadAndEdit(id);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-3 p-6">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          Loading estimate details...
        </p>
      </div>
    );
  }

  if (fetchError || !estimate) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center bg-rose-50/50 border border-rose-200 rounded-xl max-w-xl mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-950 mb-1">
            Unable to Load Estimate
          </h2>
          <p className="text-sm text-rose-700 mb-4">
            {fetchError || "The requested estimate record could not be found."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/quotation/history")}
            >
              Back to History
            </Button>
            <Button
              type="button"
              onClick={fetchEstimateDetail}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate("/quotation/history")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                {customerLeadName}
              </h1>
              {quoteNumber && (
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  Quote #{quoteNumber}
                </span>
              )}
              {isStorage && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                  Mini Storage
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Estimate ID: {id} {jobNumber ? `· Job #${jobNumber}` : ""}{" "}
              {customerAddress ? `· ${customerAddress}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Convert to Quote Button (if unconverted) */}
          {!conversion?.isConvertedToQuotation && (
            <Button
              type="button"
              onClick={handleConvertToQuotation}
              disabled={isConverting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="Convert this estimate into an official quotation"
            >
              {isConverting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightCircle className="h-4 w-4" />
              )}
              Convert to Quote
            </Button>
          )}

          {/* Send to Customer Button (if approved & not stale) */}
          {isApproved && !isStaleApproved && (
            <Button
              type="button"
              onClick={() => setShowSendModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="h-4 w-4" />
              Send to Customer
            </Button>
          )}

          {/* Edit Estimate Button */}
          <Button
            type="button"
            onClick={handleEditClick}
            disabled={isEditing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            title="Load this estimate into generator editor to modify"
          >
            {isEditing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileEdit className="h-4 w-4" />
            )}
            Edit Estimate
          </Button>

          {/* Generate & Print PDF */}
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

          {/* Refresh view */}
          {/* <Button
            type="button"
            variant="outline"
            onClick={fetchEstimateDetail}
            disabled={isFetching}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer bg-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button> */}
        </div>
      </div>

      {/* Approval Status & Workflow Banner */}
      <QuotationApprovalBanner
        workflowStatus={workflowStatus}
        approval={approvalInfo}
        versionNumber={versionNumber}
        onSubmitForApproval={() => setShowSubmitModal(true)}
      />

      {/* Server Document Preview */}
      <div ref={previewSectionRef} id="preview-section">
        <ServerDocumentPreview
          html={serverPreviewHtml}
          isLoading={isPreviewLoading}
          error={previewError}
          onRetry={refetchPreview}
          title={`Estimate Package — ${customerLeadName}`}
          minHeight={800}
        />
      </div>

      {/* Approval & Send Modals */}
      <SubmitApprovalModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        quotationId={conversion?.quotationId || id}
        estimateId={id}
        quotationTitle={`Estimate Package - ${customerLeadName}`}
        quotationNumber={quoteNumber || undefined}
        versionNumber={versionNumber}
        onSuccess={() => {
          fetchEstimateDetail();
        }}
      />

      <SendQuotationModal
        open={showSendModal}
        onOpenChange={setShowSendModal}
        quotationId={conversion?.quotationId || id}
        customerEmail={customerEmail}
        customerName={customerLeadName}
        approvalStatus={approvalInfo?.status || "approved"}
        versionNumber={versionNumber}
        approvedVersionNumber={approvalInfo?.approvedVersionNumber}
        onSuccess={() => {
          fetchEstimateDetail();
        }}
      />
    </div>
  );
}
export default EstimateDetailPage;
