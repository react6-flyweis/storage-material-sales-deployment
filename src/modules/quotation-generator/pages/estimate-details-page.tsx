import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Printer,
  FileEdit,
  FileText,
  AlertCircle,
  Milestone,
  Banknote,
  FileCheck,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  downloadPdfProvider,
  type SaveEstimatePayload,
  type PreviewDocumentRequest,
} from "../estimates.api";
import { downloadCustomQuotePdfProvider } from "../custom-quotes.api";
import { downloadPdfFromBase64 } from "../utils/pdf-download";
import { useServerDocumentPreview } from "../hooks/use-server-document-preview";
import { ServerDocumentPreview } from "../components/server-document-preview";
import { useLoadEstimateToEditor } from "../hooks/use-load-estimate-to-editor";
import { useConvertEstimateToQuotationMutation } from "@/modules/quotations/quotations.hooks";
import {
  submitQuotationForApprovalProvider,
  QuotationWorkflowBadge,
  normalizeWorkflowStatus,
  convertCustomQuoteToQuotationProvider,
} from "@/modules/quotations/quotations.api";
import { useEstimateDetailQuery } from "../estimates.hooks";
import { MilestonePaymentsModal } from "../components/milestone-payments-modal";
import { RequestDepositModal } from "../components/request-deposit-modal";
import { SubmitApprovalModal } from "../components/submit-approval-modal";
import { SendQuotationModal } from "../components/send-quotation-modal";

export function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const {
    data: queriedEstimate,
    isLoading: isFetching,
    error: queryError,
    refetch: refetchEstimateDetail,
  } = useEstimateDetailQuery(id);

  // Fallback to query error message if query failed
  const fetchError = queryError
    ? (queryError as { response?: { data?: { message?: string } } })?.response
        ?.data?.message ||
      queryError.message ||
      "Failed to load estimate details. Please try again."
    : null;

  // Active estimate directly from React Query cache
  const estimate = queriedEstimate ?? null;

  const setEstimate = useCallback(
    (
      updater:
        | SaveEstimatePayload
        | null
        | ((prev: SaveEstimatePayload | null) => SaveEstimatePayload | null),
    ) => {
      queryClient.setQueryData<SaveEstimatePayload | null>(
        ["sales", "estimate-detail", id],
        (prev) => {
          const current = prev ?? null;
          return typeof updater === "function" ? updater(current) : updater;
        },
      );
    },
    [id, queryClient],
  );

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const { loadAndEdit, isLoading: isEditing } = useLoadEstimateToEditor();
  const convertMutation = useConvertEstimateToQuotationMutation();

  const isStorage = useMemo(() => {
    return (
      estimate?.jobType?.toUpperCase() === "STORAGE" ||
      Boolean(estimate?.storageData)
    );
  }, [estimate]);

  const isCustom = useMemo(() => {
    return Boolean(
      estimate?.quoteKind === "custom" ||
      (estimate as Record<string, unknown>)?.kind === "custom" ||
      estimate?.jobType?.toUpperCase() === "CUSTOM" ||
      (estimate as Record<string, unknown>)?.customQuote
    );
  }, [estimate]);

  const customerLeadName =
    estimate?.leadCompanyName || estimate?.jobNumber || "Saved Estimate";
  const customerEmail = estimate?.customerEmail || "";
  const customerAddress =
    estimate?.cityStateZip || estimate?.streetAddress || "";
  const jobNumber = estimate?.jobNumber || "";

  const conversion = estimate?.conversion;
  const quoteNumber = conversion?.quoteNumber || estimate?.quoteNumber;
  const effectiveQuotationId = conversion?.quotationId;

  const rawWorkflowStatus =
    conversion?.workflowStatus || estimate?.workflowStatus || "draft";

  const effectiveStatus = useMemo(() => {
    // If not converted to quotation yet, it is a draft
    if (!conversion?.isConvertedToQuotation && !effectiveQuotationId) {
      return "draft";
    }
    return normalizeWorkflowStatus(rawWorkflowStatus);
  }, [
    conversion?.isConvertedToQuotation,
    effectiveQuotationId,
    rawWorkflowStatus,
  ]);

  // Server document preview request payload (reflects opened/saved sections, attachments & add-ons)
  const resolvedSections = useMemo(() => {
    if (estimate?.sections && estimate.sections.length > 0) {
      return estimate.sections;
    }
    if (estimate?.drawingAttachments && estimate.drawingAttachments.length > 0) {
      return ["quote", "sow", "contract", "drawings"];
    }
    return ["quote", "sow", "contract"];
  }, [estimate?.sections, estimate?.drawingAttachments]);

  const previewPayload: PreviewDocumentRequest | null = useMemo(() => {
    if (!id || !estimate) return null;
    return {
      estimateId: id,
      quoteKind: isCustom ? "custom" : undefined,
      customQuoteId: isCustom ? id : undefined,
      companyBrand: estimate?.companyBrand,
      sections: resolvedSections,
      drawingAttachments: estimate?.drawingAttachments,
      jobType: isCustom ? "Custom" : isStorage ? "Storage" : "PEMB",
      sourceFileName: estimate?.sourceFileName,
      customerLeadName,
      customerAddress,
      customerEmail,
      jobNumber,
      pricingResult: estimate?.pricingResult,
      storageData: estimate?.storageData || undefined,
      storagePricingResult: estimate?.storagePricingResult || undefined,
      fullQuote:
        estimate?.fullQuoteResult ||
        ((estimate as Record<string, unknown>)?.fullQuote as
          | Record<string, unknown>
          | undefined),
      concreteAddon: estimate?.concreteAddon,
      insulationAddon: estimate?.insulationAddon,
      salesTax: estimate?.salesTax,
      contract: estimate?.contract,
      milestones: estimate?.milestoneSchedule || estimate?.milestones,
    };
  }, [
    id,
    estimate,
    isCustom,
    isStorage,
    resolvedSections,
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

  // Auto-refetch estimate details and document preview when tab/window becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && id) {
        void refetchEstimateDetail();
        void refetchPreview();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [id, refetchEstimateDetail, refetchPreview]);

  const handleDownloadPdf = async () => {
    if (!id) return;
    setIsDownloadingPdf(true);
    try {
      if (isCustom) {
        const pdfRes = await downloadCustomQuotePdfProvider(id, {
          company: estimate?.companyBrand,
        });
        const b64 = pdfRes.data?.fileBase64 || pdfRes.fileBase64;
        if (b64) {
          downloadPdfFromBase64(
            b64,
            pdfRes.data?.fileName ||
              pdfRes.fileName ||
              `${customerLeadName || "Custom"}_Quote.pdf`,
            pdfRes.data?.mimeType || pdfRes.mimeType || "application/pdf",
          );
          toast.success("PDF downloaded successfully");
        } else {
          toast.error("No PDF content returned by server");
        }
        return;
      }

      const res = await downloadPdfProvider(
        {
          estimateId: id,
          jobType: isCustom ? "Custom" : isStorage ? "Storage" : "PEMB",
          format: "pdf",
          customerLeadName,
          customerEmail,
          customerAddress,
          jobNumber,
          pricingResult: estimate?.pricingResult,
          storageData: estimate?.storageData || undefined,
          storagePricingResult: estimate?.storagePricingResult || undefined,
          fullQuote:
            estimate?.fullQuoteResult ||
            ((estimate as Record<string, unknown>)?.fullQuote as
              | Record<string, unknown>
              | undefined),
          sections: resolvedSections,
          drawingAttachments: estimate?.drawingAttachments,
          concreteAddon: estimate?.concreteAddon,
          insulationAddon: estimate?.insulationAddon,
          salesTax: estimate?.salesTax,
          contract: estimate?.contract,
          milestones: estimate?.milestoneSchedule || estimate?.milestones,
        },
        id,
      );

      const pdfData = res?.data || res;
      if (pdfData?.fileBase64) {
        downloadPdfFromBase64(
          pdfData.fileBase64,
          pdfData.fileName || `${customerLeadName || "Estimate"}_Quote.pdf`,
          pdfData.mimeType || "application/pdf",
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

  const updateEstimateConversion = useCallback(
    (
      prev: SaveEstimatePayload,
      updates: {
        approvalStatus:
          | "not_submitted"
          | "pending_approval"
          | "approved"
          | "rejected";
        workflowStatus:
          | "draft"
          | "pending_approval"
          | "approved"
          | "rejected"
          | "sent";
        quotationId?: string | null;
        isConvertedToQuotation?: boolean;
      },
    ): SaveEstimatePayload => {
      const currentConversion = prev.conversion;
      const isConverted =
        updates.isConvertedToQuotation ??
        Boolean(
          updates.quotationId || currentConversion?.isConvertedToQuotation,
        );

      return {
        ...prev,
        workflowStatus: updates.workflowStatus,
        approval: {
          ...prev.approval,
          status: updates.approvalStatus,
        },
        conversion: {
          isConvertedToQuotation: isConverted,
          quotationId:
            updates.quotationId !== undefined
              ? updates.quotationId
              : (currentConversion?.quotationId ?? null),
          quoteNumber: currentConversion?.quoteNumber ?? null,
          quotationStatus: currentConversion?.quotationStatus ?? null,
          approvalStatus: updates.approvalStatus,
          workflowStatus: updates.workflowStatus,
          convertedAt: currentConversion?.convertedAt ?? null,
        },
      };
    },
    [],
  );

  const handleEditClick = async () => {
    try {
      if (isCustom) {
        navigate(`/quotation/custom?id=${estimate?._id || id}`);
        return;
      }
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
              onClick={() => {
                void refetchEstimateDetail();
              }}
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
              <QuotationWorkflowBadge status={effectiveStatus} />
              {quoteNumber && (
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  Quote #{quoteNumber}
                </span>
              )}
              {isCustom ? (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                  Custom Quote
                </span>
              ) : isStorage ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                  Mini Storage
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  PEMB
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
          {/* 1. Draft / not_submitted: Send for Approval CTA */}
          {effectiveStatus === "draft" && (
            <Button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={isConverting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="Send this quotation for admin approval"
            >
              {isConverting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              Send for Approval
            </Button>
          )}

          {/* 2. Pending Approval: View Quotation (wait for admin) */}
          {effectiveStatus === "pending_approval" && (
            <Button
              type="button"
              onClick={() => {
                if (effectiveQuotationId) {
                  navigate(`/leads/quotation-details/${effectiveQuotationId}`);
                } else {
                  navigate("/leads/quotation-list");
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="Quotation is awaiting Admin approval. Click to view quotation details."
            >
              <FileText className="h-4 w-4" />
              <span>View Quotation</span>
              <span className="text-[10px] font-normal opacity-90 hidden sm:inline">
                (Wait for Admin)
              </span>
            </Button>
          )}

          {/* 3. Approved: Send to customer CTA */}
          {effectiveStatus === "approved" && (
            <>
              <Button
                type="button"
                onClick={() => setIsSendModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                title="Quotation has been approved! Send to customer."
              >
                <Send className="h-4 w-4" />
                Send to customer
              </Button>
              {effectiveQuotationId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(`/leads/quotation-details/${effectiveQuotationId}`)
                  }
                  className="px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border-slate-300"
                  title="View official quotation"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  View Quotation
                </Button>
              )}
            </>
          )}

          {/* 4. Rejected: Edit Estimate CTA */}
          {(effectiveStatus === "admin_rejected" ||
            effectiveStatus === "client_rejected") && (
            <Button
              type="button"
              onClick={handleEditClick}
              disabled={isEditing}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs ring-2 ring-rose-300"
              title={
                estimate?.approval?.rejectionReason
                  ? `Rejected: ${estimate.approval.rejectionReason}. Click to modify and re-submit.`
                  : "Quotation was rejected. Click to modify in generator editor and re-submit."
              }
            >
              {isEditing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileEdit className="h-4 w-4" />
              )}
              Edit Estimate to Revise
            </Button>
          )}

          {/* 5. Sent: View Quotation */}
          {effectiveStatus === "sent" && effectiveQuotationId && (
            <Button
              type="button"
              onClick={() =>
                navigate(`/leads/quotation-details/${effectiveQuotationId}`)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="View sent quotation"
            >
              <FileText className="h-4 w-4" />
              View Quotation
            </Button>
          )}

          {/* Request Deposit Terms */}
          {!isCustom && (
            <Button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="Request deposit and generate deposit receipt"
            >
              <Banknote className="h-4 w-4" />
              Deposit
            </Button>
          )}

          {/* Milestone Payments Schedule */}
          {!isCustom && (
            <Button
              type="button"
              onClick={() => setIsMilestoneModalOpen(true)}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="Configure milestone payment schedule for this estimate"
            >
              <Milestone className="h-4 w-4" />
              Milestones
            </Button>
          )}

          {/* Edit Estimate Button (Always available for sales unless rejected CTA shown above) */}
          {effectiveStatus !== "admin_rejected" &&
            effectiveStatus !== "client_rejected" && (
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
            )}

          {/* Generate & Print PDF */}
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || effectiveStatus !== "approved"}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              effectiveStatus !== "approved"
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
        quote={
          estimate
            ? { ...estimate, _id: id }
            : ({ _id: id } as SaveEstimatePayload)
        }
        onSuccess={(saveRes) => {
          if (
            saveRes?.quotationSync?.requiresSubmitForApproval ||
            saveRes?.quotationSync?.workflowStatus === "draft" ||
            saveRes?.quotationSync?.approvalStatus === "not_submitted"
          ) {
            setEstimate((prev) => {
              if (!prev) return prev;
              return updateEstimateConversion(prev, {
                approvalStatus: "not_submitted",
                workflowStatus: "draft",
                quotationId: saveRes.quotationSync?.quotationId,
              });
            });
            toast.info(
              "Payment schedule updated. Click 'Send for Approval' to submit for Admin review.",
            );
          }
          void queryClient.invalidateQueries({
            queryKey: ["sales", "estimate-detail", id],
          });
          void refetchEstimateDetail();
          refetchPreview();
        }}
      />

      {/* Request Deposit Modal */}
      <RequestDepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
        quote={
          estimate
            ? { ...estimate, _id: id }
            : ({ _id: id } as SaveEstimatePayload)
        }
        onSuccess={(saveRes) => {
          if (
            saveRes?.quotationSync?.requiresSubmitForApproval ||
            saveRes?.quotationSync?.workflowStatus === "draft" ||
            saveRes?.quotationSync?.approvalStatus === "not_submitted"
          ) {
            setEstimate((prev) => {
              if (!prev) return prev;
              return updateEstimateConversion(prev, {
                approvalStatus: "not_submitted",
                workflowStatus: "draft",
                quotationId: saveRes.quotationSync?.quotationId,
              });
            });
            toast.info(
              "Deposit terms updated. Click 'Send for Approval' to submit for Admin review.",
            );
          }
          void queryClient.invalidateQueries({
            queryKey: ["sales", "estimate-detail", id],
          });
          void refetchEstimateDetail();
        }}
      />

      {/* Submit for Approval Modal */}
      <SubmitApprovalModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        quotationId={effectiveQuotationId || undefined}
        estimateId={id}
        quotationTitle={`Estimate Package — ${customerLeadName}`}
        quotationNumber={quoteNumber || undefined}
        versionNumber={estimate?.versionNumber || 1}
        onSubmit={async (note) => {
          let targetQuotationId = effectiveQuotationId;
          if (!targetQuotationId && id) {
            setIsConverting(true);
            try {
              if (isCustom) {
                const customLeadId =
                  (estimate as Record<string, unknown>)?.leadId ||
                  (estimate?.customQuote as Record<string, unknown>)?.leadId;
                const convertRes = await convertCustomQuoteToQuotationProvider(
                  id,
                  customLeadId && typeof customLeadId === "string"
                    ? { leadId: customLeadId }
                    : undefined,
                );
                const resData = (
                  convertRes as {
                    data?: { quotation?: { _id?: string }; _id?: string };
                  }
                )?.data;
                targetQuotationId = resData?.quotation?._id || resData?._id;
              } else {
                const convertRes = await convertMutation.mutateAsync(id);
                const resData = (
                  convertRes as {
                    data?: { quotation?: { _id?: string }; _id?: string };
                  }
                )?.data;
                targetQuotationId = resData?.quotation?._id || resData?._id;
              }
            } finally {
              setIsConverting(false);
            }
          }
          const targetId = targetQuotationId || id || "";
          await submitQuotationForApprovalProvider(targetId, {
            note: note.trim() || undefined,
            estimateId: isCustom ? undefined : id,
          });
        }}
        onSuccess={async () => {
          setEstimate((prev) => {
            if (!prev) return prev;
            return updateEstimateConversion(prev, {
              approvalStatus: "pending_approval",
              workflowStatus: "pending_approval",
              isConvertedToQuotation: true,
            });
          });
          toast.success("Submitted for approval successfully");
          void queryClient.invalidateQueries({
            queryKey: ["sales", "estimate-detail", id],
          });
          await refetchEstimateDetail();
        }}
      />

      {/* Send Quotation Modal */}
      {effectiveQuotationId && (
        <SendQuotationModal
          open={isSendModalOpen}
          onOpenChange={setIsSendModalOpen}
          quotationId={effectiveQuotationId}
          customerEmail={customerEmail}
          customerName={customerLeadName}
          workflowStatus={rawWorkflowStatus}
          versionNumber={estimate?.versionNumber || 1}
          approvedVersionNumber={estimate?.approval?.approvedVersionNumber}
          onSuccess={async () => {
            setEstimate((prev) => {
              if (!prev) return prev;
              return updateEstimateConversion(prev, {
                approvalStatus: "approved",
                workflowStatus: "sent",
              });
            });
            void queryClient.invalidateQueries({
              queryKey: ["sales", "estimate-detail", id],
            });
            await refetchEstimateDetail();
          }}
        />
      )}
    </div>
  );
}
export default EstimateDetailPage;
