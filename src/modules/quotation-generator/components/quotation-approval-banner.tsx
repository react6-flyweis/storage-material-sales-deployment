import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  History,
  FileText,
  FileCheck,
  FileEdit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type {
  ApprovalStatus,
  WorkflowStatus,
  QuotationApprovalInfo,
} from "@/modules/quotations/quotations.api";
import { QuotationApprovalTimeline } from "./quotation-approval-timeline";

interface QuotationApprovalBannerProps {
  workflowStatus?: WorkflowStatus | string;
  approval?: QuotationApprovalInfo | null;
  versionNumber?: number;
  sendMethod?: "platform" | "manual" | string | null;
  sentTo?: string | null;
  sentCc?: string[] | null;
  sentMessage?: string | null;
  onViewTimeline?: () => void;
  onSubmitForApproval?: () => void;
  /** @deprecated Action buttons have been removed from this banner */
  onSendToCustomer?: () => void;
  isSubmitting?: boolean;
  isEdited?: boolean;
  onEdit?: () => void;
  className?: string;
}

export function QuotationApprovalBanner({
  workflowStatus = "draft",
  approval,
  versionNumber = 1,
  sendMethod,
  sentTo,
  sentCc,
  sentMessage,
  onViewTimeline,
  onSubmitForApproval,
  onEdit,
  isSubmitting = false,
  isEdited = false,
  className = "",
}: QuotationApprovalBannerProps) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const status: ApprovalStatus | string =
    (workflowStatus === "sent"
      ? "sent"
      : workflowStatus === "pending_approval"
      ? "pending_approval"
      : workflowStatus === "rejected"
      ? "rejected"
      : workflowStatus === "approved"
      ? "approved"
      : approval?.status) ||
    workflowStatus ||
    "not_submitted";

  const rejectionReason = approval?.rejectionReason;
  const history = approval?.history || [];
  const isStaleApproved =
    status === "approved" &&
    approval?.approvedVersionNumber !== undefined &&
    approval?.approvedVersionNumber !== null &&
    approval.approvedVersionNumber !== versionNumber;

  const canSubmit =
    Boolean(onSubmitForApproval) &&
    (status === "not_submitted" ||
      status === "draft" ||
      (status === "rejected" && isEdited) ||
      (status === "approved" && isStaleApproved));

  const submitButtonText =
    (status === "rejected" && isEdited) || isStaleApproved
      ? "Re-submit for Approval"
      : "Submit for Approval";

  const getConfig = () => {
    switch (status) {
      case "pending_approval":
        return {
          containerClass: "bg-amber-50/80 border-amber-200 text-amber-950",
          iconContainerClass: "bg-amber-100 text-amber-700",
          icon: <Clock className="w-4 h-4 animate-pulse" />,
          title: "Waiting for Admin Approval",
          badgeText: "Pending Approval",
          badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
          description: "This quotation is currently awaiting management review and approval.",
          historyBtnClass: "text-amber-900 hover:bg-amber-100/80 border-amber-300",
        };
      case "approved":
        if (isStaleApproved) {
          return {
            containerClass: "bg-orange-50/80 border-orange-200 text-orange-950",
            iconContainerClass: "bg-orange-100 text-orange-700",
            icon: <AlertTriangle className="w-4 h-4" />,
            title: `Quotation Modified (v${versionNumber})`,
            badgeText: "Re-approval Required",
            badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
            description: `Modified since last approval (v${approval?.approvedVersionNumber}). Needs re-approval before sending.`,
            historyBtnClass: "text-orange-900 hover:bg-orange-100/80 border-orange-300",
          };
        }
        return {
          containerClass: "bg-emerald-50/80 border-emerald-200 text-emerald-950",
          iconContainerClass: "bg-emerald-100 text-emerald-700",
          icon: <CheckCircle2 className="w-4 h-4" />,
          title: `Admin Approved (v${approval?.approvedVersionNumber || versionNumber})`,
          badgeText: "Approved",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
          description: "Quotation has been approved by admin and is ready to be sent to the customer.",
          historyBtnClass: "text-emerald-900 hover:bg-emerald-100/80 border-emerald-300",
        };
      case "rejected":
        if (isEdited) {
          return {
            containerClass: "bg-amber-50/80 border-amber-200 text-amber-950",
            iconContainerClass: "bg-amber-100 text-amber-700",
            icon: <AlertTriangle className="w-4 h-4" />,
            title: `Quotation Adjusted (Revision v${versionNumber + 1})`,
            badgeText: "Ready to Re-submit",
            badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
            description: "Modifications made to address admin feedback.",
            historyBtnClass: "text-amber-900 hover:bg-amber-100/80 border-amber-300",
          };
        }
        return {
          containerClass: "bg-rose-50/80 border-rose-200 text-rose-950",
          iconContainerClass: "bg-rose-100 text-rose-700",
          icon: <XCircle className="w-4 h-4" />,
          title: `Approval Rejected by Admin (v${versionNumber})`,
          badgeText: "Rejected — Edit Required",
          badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
          description: rejectionReason
            ? `Admin Note: "${rejectionReason}" — Please edit the estimate before re-submitting.`
            : "Review feedback and edit the estimate before re-submitting for approval.",
          historyBtnClass: "text-rose-900 hover:bg-rose-100/80 border-rose-300",
        };
      case "sent":
        if (sendMethod === "manual") {
          return {
            containerClass: "bg-blue-50/80 border-blue-200 text-blue-950",
            iconContainerClass: "bg-blue-100 text-blue-700",
            icon: <Send className="w-4 h-4" />,
            title: "Marked as Sent (External Email)",
            badgeText: "Marked Sent",
            badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
            description: sentMessage
              ? `External Note: "${sentMessage}"`
              : "This quotation was marked as sent externally (via Gmail, Outlook, etc.).",
            historyBtnClass: "text-blue-900 hover:bg-blue-100/80 border-blue-300",
          };
        }
        return {
          containerClass: "bg-blue-50/80 border-blue-200 text-blue-950",
          iconContainerClass: "bg-blue-100 text-blue-700",
          icon: <Send className="w-4 h-4" />,
          title: "Sent to Customer via Email",
          badgeText: "Sent via Email",
          badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
          description: sentTo
            ? `Successfully emailed to ${sentTo}${sentCc && sentCc.length > 0 ? ` (CC: ${sentCc.join(", ")})` : ""}.`
            : "This quotation has been officially sent to the customer.",
          historyBtnClass: "text-blue-900 hover:bg-blue-100/80 border-blue-300",
        };
      default:
        return {
          containerClass: "bg-slate-50 border-slate-200 text-slate-800",
          iconContainerClass: "bg-slate-100 text-slate-600",
          icon: <FileText className="w-4 h-4" />,
          title: `Quotation Draft (v${versionNumber})`,
          badgeText: "Draft",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
          description: "This quotation is currently in draft mode.",
          historyBtnClass: "text-slate-700 hover:bg-slate-100 border-slate-200",
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`no-print ${className}`}>
      <div
        className={`px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${config.containerClass}`}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${config.iconContainerClass}`}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold leading-none">
                {config.title}
              </h4>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${config.badgeClass}`}
              >
                {config.badgeText}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-1 leading-snug">
              {config.description}
            </p>
          </div>
        </div>

        {(canSubmit || (status === "rejected" && !isEdited && Boolean(onEdit)) || history.length > 0) && (
          <div className="flex items-center gap-2 shrink-0">
            {canSubmit && (
              <Button
                type="button"
                size="sm"
                onClick={onSubmitForApproval}
                disabled={isSubmitting}
                className="h-7.5 px-3 text-xs font-semibold shrink-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileCheck className="w-3.5 h-3.5" />
                )}
                {submitButtonText}
              </Button>
            )}

            {status === "rejected" && !isEdited && onEdit && (
              <Button
                type="button"
                size="sm"
                onClick={onEdit}
                className="h-7.5 px-3 text-xs font-semibold shrink-0 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Edit Estimate
              </Button>
            )}

            {history.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onViewTimeline) {
                    onViewTimeline();
                    return;
                  }
                  const el = document.getElementById("quotation-timeline-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    setShowHistoryModal(true);
                  }
                }}
                className={`h-7.5 px-2.5 text-xs font-semibold shrink-0 cursor-pointer bg-white/80 backdrop-blur-xs border ${config.historyBtnClass}`}
              >
                <History className="w-3.5 h-3.5 mr-1" />
                Timeline
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Approval Timeline / History Dialog */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Approval Timeline
            </DialogTitle>
            <DialogDescription>
              History of submission and review events for this quotation.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 max-h-96 overflow-y-auto overflow-x-hidden pr-2 min-w-0">
            <QuotationApprovalTimeline
              history={history}
              versionNumber={versionNumber}
              showEmpty={true}
              className="border-0 shadow-none p-0"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
