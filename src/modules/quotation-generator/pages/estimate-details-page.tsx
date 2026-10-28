import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  Printer,
  ArrowRightCircle,
  FileEdit,
  FileText,
  AlertCircle,
  Milestone,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getEstimateByIdProvider,
  downloadPdfProvider,
  type SaveEstimatePayload,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "../components/server-document-preview";
import { useLoadEstimateToEditor } from "../hooks/use-load-estimate-to-editor";
import { useConvertEstimateToQuotationMutation } from "@/modules/quotations/quotations.hooks";
import { MilestonePaymentsModal } from "../components/milestone-payments-modal";
import { RequestDepositModal } from "../components/request-deposit-modal";

export function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const [estimate, setEstimate] = useState<SaveEstimatePayload | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

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
  const effectiveWorkflowStatus =
    conversion?.workflowStatus ||
    estimate?.workflowStatus ||
    estimate?.approval?.status ||
    estimate?.status ||
    "draft";

  // Server document preview request payload (History requires only estimateId and sections)
  const previewPayload: PreviewDocumentRequest | null = useMemo(() => {
    if (!id) return null;
    return {
      estimateId: id,
      sections: ["quote", "sow", "contract"],
      jobType: isStorage ? "Storage" : "PEMB",
      sourceFileName: estimate?.sourceFileName,
      customerLeadName,
      customerAddress,
      customerEmail,
      jobNumber,
      pricingResult: estimate?.pricingResult,
      storageData: estimate?.storageData || undefined,
      storagePricingResult: estimate?.storagePricingResult || undefined,
      fullQuote: estimate?.fullQuoteResult,
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
    enabled: Boolean(id),
    debounceMs: 100,
  });

  const handleDownloadPdf = async () => {
    if (!id) return;
    setIsDownloadingPdf(true);
    try {
      const res = await downloadPdfProvider(
        {
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
          sections: ["quote", "sow", "contract"],
        },
        id
      );

      const pdfData = res?.data || res;
      if (pdfData?.fileBase64) {
        downloadPdfFromBase64(
          pdfData.fileBase64,
          pdfData.fileName || `${customerLeadName || "Estimate"}_Quote.pdf`,
          pdfData.mimeType || "application/pdf"
        );
        toast.success("PDF downloaded successfully");
      } else {
        toast.error("No PDF content returned by server");
      }
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      const msg = getApiErrorMessage(
        err,
        "Failed to generate PDF. Please try again.",
      );
      toast.error(msg);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleConvertToQuotation = async () => {
    if (!id) return;
    setIsConverting(true);
    try {
      const res = await convertMutation.mutateAsync(id);
      if (res && (res as { success?: boolean }).success === false) {
        throw new Error(
          (res as { message?: string }).message ||
            "Failed to convert estimate to quotation",
        );
      }
      const resData = (
        res as { data?: { quotation?: { _id?: string }; _id?: string } }
      )?.data;
      const quotationId = resData?.quotation?._id || resData?._id;
      if (quotationId) {
        toast.success("Converted to quotation successfully");
        navigate(`/leads/quotation-details/${quotationId}`);
      } else {
        await fetchEstimateDetail();
      }
    } catch (err) {
      console.error("Failed to convert estimate to quotation:", err);
      const msg = getApiErrorMessage(
        err,
        "Failed to convert estimate to quotation. Please try again.",
      );
      toast.error(msg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleEditClick = async () => {
    try {
      if (estimate) {
        await loadAndEdit(estimate);
      } else if (id) {
        await loadAndEdit(id);
      }
    } catch (err) {
      console.error("Failed to load estimate for editing:", err);
      const msg = getApiErrorMessage(
        err,
        "Failed to load estimate into editor. Please try again.",
      );
      toast.error(msg);
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
              {(() => {
                switch (effectiveWorkflowStatus) {
                  case "pending_approval":
                    return (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 shadow-2xs">
                        Pending Approval
                      </span>
                    );
                  case "approved":
                    return (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-2xs">
                        Approved
                      </span>
                    );
                  case "rejected":
                    return (
                      <span
                        className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-300 shadow-2xs"
                        title={
                          estimate?.approval?.rejectionReason ||
                          "Approval Rejected"
                        }
                      >
                        Rejected
                      </span>
                    );
                  case "sent":
                    return (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs border border-blue-300 shadow-2xs">
                        Sent
                      </span>
                    );
                  default:
                    return (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300">
                        Draft
                      </span>
                    );
                }
              })()}
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
          {/* View Quotation Button (if converted) */}
          {(conversion?.isConvertedToQuotation || conversion?.quotationId) && (
            <Button
              type="button"
              onClick={() => {
                if (conversion?.quotationId) {
                  navigate(
                    `/leads/quotation-details/${conversion.quotationId}`,
                  );
                } else {
                  navigate("/leads/quotation-list");
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="View the official quotation"
            >
              <FileText className="h-4 w-4" />
              View Quotation
            </Button>
          )}

          {/* Convert to Quote Button (if unconverted) */}
          {!conversion?.isConvertedToQuotation && !conversion?.quotationId && (
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
              Send For Approval
            </Button>
          )}

          {/* Request Deposit Terms */}
          <Button
            type="button"
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            title="Request deposit and generate deposit receipt"
          >
            <Banknote className="h-4 w-4" />
            Deposit
          </Button>

          {/* Milestone Payments Schedule */}
          <Button
            type="button"
            onClick={() => setIsMilestoneModalOpen(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            title="Configure milestone payment schedule for this estimate"
          >
            <Milestone className="h-4 w-4" />
            Milestones
          </Button>

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
            disabled={isDownloadingPdf || effectiveWorkflowStatus !== "approved"}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              effectiveWorkflowStatus !== "approved"
                ? "PDF generation is disabled until the estimate is approved."
                : "Generate and download or print PDF"
            }
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {isDownloadingPdf ? "Generating PDF..." : "Generate & Print PDF"}
          </Button>
        </div>
      </div>

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

      {/* Milestone Payments Modal */}
      <MilestonePaymentsModal
        open={isMilestoneModalOpen}
        onOpenChange={setIsMilestoneModalOpen}
        quote={estimate ? { ...estimate, _id: id } : ({ _id: id } as SaveEstimatePayload)}
        onSuccess={() => {
          fetchEstimateDetail();
          refetchPreview();
        }}
      />

      {/* Request Deposit Modal */}
      <RequestDepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
        quote={estimate ? { ...estimate, _id: id } : ({ _id: id } as SaveEstimatePayload)}
        onSuccess={() => {
          fetchEstimateDetail();
        }}
      />
    </div>
  );
}
export default EstimateDetailPage;
