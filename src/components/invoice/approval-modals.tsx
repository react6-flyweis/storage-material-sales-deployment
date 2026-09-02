import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileCheck,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
import { useSubmitInvoiceForApprovalMutation } from "@/modules/invoices/invoices.hooks";
import type {
  ApprovalHistoryItem,
  ApprovalStatus,
  WorkflowStatus,
} from "@/modules/invoices/invoices.api";
import { getApiErrorMessage } from "@/lib/api-error";

// Internal helper for status styling
function getStatusConfig(
  workflowStatus?: string | null,
  approvalStatus?: string | null,
  invoiceStatus?: string | null,
) {
  const effective = (
    workflowStatus ||
    approvalStatus ||
    invoiceStatus ||
    "draft"
  ).toLowerCase();

  switch (effective) {
    case "pending_approval":
      return {
        label: "Pending Approval",
        bg: "bg-amber-500",
        pillClass: "bg-amber-500 text-white",
        lightClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      };
    case "approved":
      return {
        label: "Approved",
        bg: "bg-emerald-600",
        pillClass: "bg-emerald-600 text-white",
        lightClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        label: "Rejected",
        bg: "bg-rose-600",
        pillClass: "bg-rose-600 text-white",
        lightClass: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
      };
    case "sent":
      return {
        label: "Sent",
        bg: "bg-blue-600",
        pillClass: "bg-blue-600 text-white",
        lightClass: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Send,
      };
    case "paid":
      return {
        label: "Paid",
        bg: "bg-green-600",
        pillClass: "bg-green-600 text-white",
        lightClass: "bg-green-50 text-green-700 border-green-200",
        icon: FileCheck,
      };
    case "overdue":
      return {
        label: "Overdue",
        bg: "bg-red-600",
        pillClass: "bg-red-600 text-white",
        lightClass: "bg-red-50 text-red-700 border-red-200",
        icon: AlertCircle,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        bg: "bg-zinc-600",
        pillClass: "bg-zinc-600 text-white",
        lightClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
        icon: XCircle,
      };
    case "not_submitted":
      return {
        label: "Not Submitted",
        bg: "bg-slate-600",
        pillClass: "bg-slate-600 text-white",
        lightClass: "bg-slate-100 text-slate-700 border-slate-200",
        icon: FileText,
      };
    case "draft":
    default:
      return {
        label: "Draft",
        bg: "bg-slate-600",
        pillClass: "bg-slate-600 text-white",
        lightClass: "bg-slate-100 text-slate-700 border-slate-200",
        icon: FileText,
      };
  }
}

export function WorkflowStatusBadge({
  workflowStatus,
  approvalStatus,
  invoiceStatus,
  className = "",
  variant = "pill",
}: {
  workflowStatus?: WorkflowStatus | string | null;
  approvalStatus?: ApprovalStatus | string | null;
  invoiceStatus?: string | null;
  className?: string;
  variant?: "pill" | "light";
}) {
  const config = getStatusConfig(workflowStatus, approvalStatus, invoiceStatus);

  if (variant === "light") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.lightClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.bg}`} />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs ${config.pillClass} ${className}`}
    >
      <span className="w-2 h-2 bg-white rounded-full" />
      {config.label}
    </span>
  );
}

// --- Submit for Approval Dialog (Sales) ---

export function SubmitApprovalDialog({
  invoiceId,
  open,
  onOpenChange,
  onSuccess,
}: {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submitMutation = useSubmitInvoiceForApprovalMutation();

  const handleSubmit = async () => {
    setError(null);
    try {
      const response = await submitMutation.mutateAsync({
        invoiceId,
        payload: note.trim() ? { note: note.trim() } : undefined,
      });

      if (!response.success) {
        setError(response.message || "Failed to submit for approval.");
        return;
      }

      setNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Submit Invoice for Approval
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                This invoice will be sent to the Admin queue for review before it can be emailed to the customer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="submit-note" className="text-xs font-medium text-gray-700">
              Note for Admin (optional)
            </Label>
            <Textarea
              id="submit-note"
              placeholder="e.g., Please review this invoice."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit for Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Approval Timeline ---

function formatTimelineDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActorName(by?: ApprovalHistoryItem["by"]) {
  if (!by) return "User";
  if (typeof by === "string") return by;
  return by.name || by.email || by.role || "User";
}

export function ApprovalHistoryTimeline({
  history,
}: {
  history?: ApprovalHistoryItem[] | null;
}) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          Approval History & Audit Trail
        </h4>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {history.map((event, index) => {
          const config = getStatusConfig(event.status);
          const Icon = config.icon;

          return (
            <div key={index} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${config.bg} text-white`}
              >
                <Icon className="w-3 h-3" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {getActorName(event.by)}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {formatTimelineDate(event.at)}
                  </span>
                </div>

                {event.note && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-md p-2 border border-gray-100 mt-1">
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

