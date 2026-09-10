import { useState } from "react";
import { Mail, CheckSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import SuccessDialog from "@/components/success-dialog";
import { CcEmailInput } from "@/components/common/cc-email-input";
import type { ApprovalStatus } from "@/modules/quotations/quotations.api";
import {
  useSendQuotationMutation,
  useMarkQuotationSentMutation,
} from "@/modules/quotations/quotations.hooks";

interface SendQuotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId?: string;
  customerEmail?: string | null;
  customerName?: string | null;
  approvalStatus?: ApprovalStatus | string | null;
  workflowStatus?: string | null;
  status?: string | null;
  versionNumber?: number;
  approvedVersionNumber?: number | null;
  onSuccess?: () => void;
  isLoading?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SendQuotationDialogContent({
  onOpenChange,
  quotationId,
  customerEmail = "",
  customerName = "Valued Customer",
  approvalStatus = "approved",
  workflowStatus,
  status,
  versionNumber = 1,
  approvedVersionNumber,
  onSuccess,
  isLoading = false,
  onShowSuccess,
}: Omit<SendQuotationModalProps, "open"> & {
  onShowSuccess: (msg: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"platform" | "manual">("platform");
  const [toEmail, setToEmail] = useState(customerEmail || "");
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [notes, setNotes] = useState(
    `Dear ${customerName},\n\nPlease find attached our complete quotation package for your review. Please let us know if you have any questions or need modifications.`
  );
  const [manualNote, setManualNote] = useState("");
  const [manualSentAt, setManualSentAt] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendMutation = useSendQuotationMutation();
  const markSentMutation = useMarkQuotationSentMutation();

  const isSending = isLoading || sendMutation.isPending || markSentMutation.isPending;

  const effectiveStatus = (status || workflowStatus || "").toLowerCase();
  const isSent = effectiveStatus === "sent";

  const isApproved = approvalStatus === "approved" || isSent;
  const isStale =
    isApproved &&
    approvedVersionNumber !== undefined &&
    approvedVersionNumber !== null &&
    approvedVersionNumber !== versionNumber;

  const canSend = isApproved && !isStale && Boolean(quotationId);
  const canMarkSent = isApproved && !isStale && !isSent && Boolean(quotationId);

  const handleSendPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationId) return;
    setErrorMessage(null);

    const trimmedTo = toEmail.trim();
    if (!trimmedTo) {
      setErrorMessage("Recipient email (To) is required.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedTo)) {
      setErrorMessage("Please enter a valid recipient email address.");
      return;
    }

    try {
      await sendMutation.mutateAsync({
        quotationId,
        payload: {
          toEmail: trimmedTo,
          to: trimmedTo,
          cc: ccEmails,
          ccEmails: ccEmails,
          message: notes.trim(),
          note: notes.trim(),
          emailMessage: notes.trim(),
          coverNote: notes.trim(),
        },
      });
      onShowSuccess(
        isSent ? "Quotation Resent Successfully!" : "Quotation Sent Successfully!"
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to send quotation:", error);
      const msg = getApiErrorMessage(
        error,
        "Failed to send quotation package. Please check email configuration.",
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleMarkSent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationId) return;
    setErrorMessage(null);

    if (isSent) {
      setErrorMessage("Quotation has already been marked as sent.");
      return;
    }

    try {
      await markSentMutation.mutateAsync({
        quotationId,
        payload: {
          note: manualNote.trim() || undefined,
          message: manualNote.trim() || undefined,
          sentAt: manualSentAt ? new Date(manualSentAt).toISOString() : undefined,
        },
      });
      onShowSuccess("Quotation Marked as Sent!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to mark quotation as sent:", error);
      const msg = getApiErrorMessage(
        error,
        "Failed to mark quotation as sent.",
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="p-6 pb-2 shrink-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            {isSent ? "Resend or Mark Quotation" : "Send Quotation"}
          </DialogTitle>
          <DialogDescription>
            Deliver quotation directly to customer via email, or mark it sent if already emailed outside the app.
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="p-6 pt-2 space-y-4 flex-1 min-h-0 overflow-y-auto">
        {/* Error Message */}
        {errorMessage && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isApproved && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-semibold">Admin Approval Required: </span>
          This quotation must be approved by Admin before sending.
        </div>
      )}

      {isStale && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-semibold">Revision Outdated: </span>
          Quotation was edited after approval. Please re-submit for approval before sending.
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as "platform" | "manual");
          setErrorMessage(null);
        }}
        className="w-full space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platform" className="text-xs sm:text-sm">
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            {isSent ? "Resend via Email" : "Email via App"}
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            disabled={isSent || !canSend}
            className="text-xs sm:text-sm disabled:opacity-50"
            title={isSent ? "Quotation has already been marked as sent" : undefined}
          >
            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
            Mark as Sent {isSent ? "(Done)" : ""}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Platform Send Form */}
        <TabsContent value="platform" className="space-y-4 pt-1">
          <form id="quotation-send-form" onSubmit={handleSendPlatform} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="customer-to-email" className="text-xs font-semibold text-slate-700">
                To Recipient <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer-to-email"
                type="email"
                placeholder="customer@example.com"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                disabled={isSending}
                className="text-sm"
                required
              />
              <p className="text-[11px] text-slate-500">
                Defaults to customer email. You may edit this if sending to an alternate contact.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                CC Recipients <span className="font-normal text-slate-500">(Optional, max 10)</span>
              </Label>
              <CcEmailInput
                value={ccEmails}
                onChange={setCcEmails}
                toEmail={toEmail}
                disabled={isSending}
                max={10}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="send-notes" className="text-xs font-semibold text-slate-700">
                Cover Note / Message <span className="font-normal text-slate-500">(Optional)</span>
              </Label>
              <Textarea
                id="send-notes"
                placeholder="Enter an optional cover message..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSending}
                className="min-h-24 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                The quotation PDF package is automatically generated and attached by the system.
              </p>
            </div>
          </form>
        </TabsContent>

        {/* TAB 2: Mark as Sent Form */}
        <TabsContent value="manual" className="space-y-4 pt-1">
          <form id="quotation-mark-sent-form" onSubmit={handleMarkSent} className="space-y-4">
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">Sent externally via Gmail, Outlook, etc.?</span>
              <p className="mt-1 text-blue-800">
                Marking this quotation as sent updates the document status to <strong>sent</strong> and advances the lead lifecycle to <strong>proposal_sent</strong> without requiring platform SMTP delivery.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manual-notes" className="text-xs font-semibold text-slate-700">
                Notes / Reference <span className="font-normal text-slate-500">(Optional)</span>
              </Label>
              <Textarea
                id="manual-notes"
                placeholder="e.g. Sent from Gmail by John on 7 Sep, customer confirmed receipt."
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                disabled={isSending}
                className="min-h-20 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Stored on the document record and audit trail.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manual-sent-at" className="text-xs font-semibold text-slate-700">
                Date & Time Sent <span className="font-normal text-slate-500">(Optional)</span>
              </Label>
              <Input
                id="manual-sent-at"
                type="datetime-local"
                value={manualSentAt}
                onChange={(e) => setManualSentAt(e.target.value)}
                disabled={isSending}
                className="text-sm max-w-xs"
              />
              <p className="text-[11px] text-slate-500">
                Defaults to current time if left as is.
              </p>
            </div>
          </form>
        </TabsContent>
      </Tabs>
      </div>

      <div className="p-6 pt-2 shrink-0">
        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between border-t border-slate-100 pt-2 m-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSending}>
              Cancel
            </Button>
          </DialogClose>

          {activeTab === "platform" ? (
            <Button
              type="submit"
              form="quotation-send-form"
              disabled={!canSend || isSending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSending
                ? "Sending..."
                : isSent
                ? "Resend Email"
                : "Send Quotation"}
            </Button>
          ) : (
            <Button
              type="submit"
              form="quotation-mark-sent-form"
              disabled={!canMarkSent || isSending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSending ? "Marking as Sent..." : "Mark as Sent"}
            </Button>
          )}
        </DialogFooter>
      </div>
    </>
  );
}

export function SendQuotationModal({
  open,
  onOpenChange,
  ...props
}: SendQuotationModalProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Quotation Sent Successfully!");

  const handleShowSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg w-full max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          {open && (
            <SendQuotationDialogContent
              {...props}
              onOpenChange={onOpenChange}
              onShowSuccess={handleShowSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Global Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage}
        okLabel="Ok"
      />
    </>
  );
}
