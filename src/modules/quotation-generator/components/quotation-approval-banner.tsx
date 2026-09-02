import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  History,
  FileText,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  onSubmitForApproval?: () => void;
  onSendToCustomer?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function QuotationApprovalBanner({
  workflowStatus = "draft",
  approval,
  versionNumber = 1,
  onSubmitForApproval,
  onSendToCustomer,
  isSubmitting = false,
  className = "",
}: QuotationApprovalBannerProps) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const status: ApprovalStatus | string =
    approval?.status ||
    (workflowStatus === "pending_approval"
      ? "pending_approval"
      : workflowStatus === "approved"
      ? "approved"
      : workflowStatus === "rejected"
      ? "rejected"
      : "not_submitted");

  const rejectionReason = approval?.rejectionReason;
  const history = approval?.history || [];
  const isStaleApproved =
    status === "approved" &&
    approval?.approvedVersionNumber !== undefined &&
    approval?.approvedVersionNumber !== null &&
    approval.approvedVersionNumber !== versionNumber;

  const renderBadge = () => {
    switch (status) {
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending Admin Approval
          </span>
        );
      case "approved":
        if (isStaleApproved) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
              Re-submission Required (v{versionNumber} edited)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Admin Approved (v{approval?.approvedVersionNumber || versionNumber})
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected by Admin
          </span>
        );
      case "sent":
      case workflowStatus === "sent" ? "sent" : "":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            Sent to Customer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Draft (Not Submitted)
          </span>
        );
    }
  };

  return (
    <div className={`space-y-3 no-print ${className}`}>
      {/* Pending Approval Banner */}
      {status === "pending_approval" && (
        <Card className="p-4 bg-amber-50/90 border-amber-200 text-amber-900 shadow-xs rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-950">
                  Waiting for Admin Approval
                </h4>
                {renderBadge()}
              </div>
              <p className="text-xs text-amber-800 mt-1">
                This quotation has been submitted to management for review. Send to customer will be unlocked once approved.
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryModal(true)}
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 text-xs font-semibold"
            >
              <History className="w-3.5 h-3.5 mr-1" />
              View Timeline
            </Button>
          )}
        </Card>
      )}

      {/* Approved Banner */}
      {status === "approved" && !isStaleApproved && (
        <Card className="p-4 bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-xs rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950">
                  Quotation Approved by Admin
                </h4>
                {renderBadge()}
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                This quotation has been reviewed and approved (v{versionNumber}). You can now send it directly to the customer.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {history.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
              >
                <History className="w-3.5 h-3.5 mr-1" />
                History
              </Button>
            )}
            {onSendToCustomer && (
              <Button
                type="button"
                size="sm"
                onClick={onSendToCustomer}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Send to Customer
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Stale Approved Banner */}
      {status === "approved" && isStaleApproved && (
        <Card className="p-4 bg-orange-50/90 border-orange-200 text-orange-950 shadow-xs rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-orange-950">
                  Quotation Edited Since Last Approval
                </h4>
                {renderBadge()}
              </div>
              <p className="text-xs text-orange-800 mt-1">
                The quote was modified to version v{versionNumber} after approval (v{approval?.approvedVersionNumber}). Please re-submit to Admin for approval.
              </p>
            </div>
          </div>
          {onSubmitForApproval && (
            <Button
              type="button"
              size="sm"
              onClick={onSubmitForApproval}
              disabled={isSubmitting}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Re-submit for Approval
            </Button>
          )}
        </Card>
      )}

      {/* Rejected Banner */}
      {status === "rejected" && (
        <Card className="p-4 bg-rose-50/90 border-rose-200 text-rose-950 shadow-xs rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-rose-950">
                  Quotation Approval Rejected
                </h4>
                {renderBadge()}
              </div>
              {rejectionReason && (
                <div className="mt-2 p-2.5 bg-white/80 border border-rose-200 rounded-lg text-xs font-semibold text-rose-900">
                  <span className="font-bold text-rose-950">Rejection Reason: </span>
                  {rejectionReason}
                </div>
              )}
              <p className="text-xs text-rose-800 mt-1">
                Please make the required adjustments to pricing or scope and re-submit for review.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {history.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
              >
                <History className="w-3.5 h-3.5 mr-1" />
                History
              </Button>
            )}
            {onSubmitForApproval && (
              <Button
                type="button"
                size="sm"
                onClick={onSubmitForApproval}
                disabled={isSubmitting}
              >
                Submit for Approval
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Draft Banner */}
      {(status === "not_submitted" || status === "draft") && (
        <Card className="p-4 bg-slate-50/90 border-slate-200 text-slate-900 shadow-xs rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-200/80 rounded-lg text-slate-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Quotation Draft (v{versionNumber})
                </h4>
                {renderBadge()}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Before sending this quotation to the customer, submit it to Admin for review and approval.
              </p>
            </div>
          </div>
          {onSubmitForApproval && (
            <Button
              type="button"
              size="sm"
              onClick={onSubmitForApproval}
              disabled={isSubmitting}
            >
              Submit for Approval
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </Card>
      )}

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
