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

interface QuotationApprovalBannerProps {
  workflowStatus?: WorkflowStatus | string;
  approval?: QuotationApprovalInfo | null;
  versionNumber?: number;
  /** @deprecated Action buttons have been removed from this banner */
  onSubmitForApproval?: () => void;
  /** @deprecated Action buttons have been removed from this banner */
  onSendToCustomer?: () => void;
  /** @deprecated Action buttons have been removed from this banner */
  isSubmitting?: boolean;
  isEdited?: boolean;
  /** @deprecated Action buttons have been removed from this banner */
  onEdit?: () => void;
  className?: string;
}

export function QuotationApprovalBanner({
  workflowStatus = "draft",
  approval,
  versionNumber = 1,
  onSubmitForApproval,
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
      status === "rejected" ||
      (status === "approved" && isStaleApproved));

  const submitButtonText =
    status === "rejected" || isStaleApproved
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
          title: "Approval Rejected by Admin",
          badgeText: "Rejected",
          badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
          description: rejectionReason
            ? `Admin Note: "${rejectionReason}"`
            : "Review feedback and make required adjustments before re-submitting.",
          historyBtnClass: "text-rose-900 hover:bg-rose-100/80 border-rose-300",
        };
      case "sent":
        return {
          containerClass: "bg-blue-50/80 border-blue-200 text-blue-950",
          iconContainerClass: "bg-blue-100 text-blue-700",
          icon: <Send className="w-4 h-4" />,
          title: "Sent to Customer",
          badgeText: "Sent",
          badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
          description: "This quotation has been officially sent to the customer.",
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

        {(canSubmit || history.length > 0) && (
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

            {history.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
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

          <div className="space-y-4 py-2 max-h-[350px] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No approval events recorded yet.
              </p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4">
                {history.map((item, idx) => {
                  const byName =
                    typeof item.by === "object" && item.by !== null
                      ? `${item.by.firstName || ""} ${item.by.lastName || ""}`.trim() ||
                        item.by.email
                      : String(item.by || "User");

                  const dateStr = item.at
                    ? new Date(item.at).toLocaleString()
                    : "—";

                  return (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800 capitalize">
                          {item.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-400">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        By: <span className="font-medium text-slate-700">{byName}</span>
                      </p>
                      {item.note && (
                        <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-2 rounded border border-slate-200">
                          {item.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
