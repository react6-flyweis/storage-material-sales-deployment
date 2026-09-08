import { useState } from "react";
import { Mail, CheckSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import type {
  ApprovalStatus,
  WorkflowStatus,
} from "@/modules/invoices/invoices.api";
import {
  useSendInvoiceMutation,
  useMarkInvoiceSentMutation,
} from "@/modules/invoices/invoices.hooks";

interface SendInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string;
  customerEmail?: string | null;
  customerName?: string | null;
  approvalStatus?: ApprovalStatus | string | null;
  workflowStatus?: WorkflowStatus | string | null;
  status?: string | null;
  revision?: number | null;
  approvedRevision?: number | null;
  onSuccess?: () => void;
  isLoading?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SendInvoiceDialogContent({
  onOpenChange,
  invoiceId,
  customerEmail = "",
  customerName = "Valued Customer",
  approvalStatus = "approved",
  workflowStatus,
  status,
  revision,
  approvedRevision,
  onSuccess,
  isLoading = false,
  onShowSuccess,
}: Omit<SendInvoiceModalProps, "open"> & {
  onShowSuccess: (msg: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"platform" | "manual">("platform");
  const [toEmail, setToEmail] = useState(customerEmail || "");
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [notes, setNotes] = useState(
    `Dear ${customerName},\n\nPlease find attached the invoice for your review. Please let us know if you have any questions or require any assistance.\n\nThank you for your business!`
  );
  const [manualNote, setManualNote] = useState("");
  const [manualSentAt, setManualSentAt] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendMutation = useSendInvoiceMutation();
  const markSentMutation = useMarkInvoiceSentMutation();

  const isSending = isLoading || sendMutation.isPending || markSentMutation.isPending;

  const effectiveStatus = (status || workflowStatus || "").toLowerCase();
  const isSent = effectiveStatus === "sent";
  const isPaid = effectiveStatus === "paid";
  const isCancelled = effectiveStatus === "cancelled";

  const isApproved = approvalStatus === "approved" || isSent;
  const isRevisionMismatch = Boolean(
    isApproved &&
    approvedRevision !== undefined &&
    approvedRevision !== null &&
    revision !== undefined &&
    revision !== null &&
    approvedRevision !== revision
  );

  const canSend = isApproved && !isRevisionMismatch && !isPaid && !isCancelled && Boolean(invoiceId);
  const canMarkSent = isApproved && !isRevisionMismatch && !isSent && !isPaid && !isCancelled && Boolean(invoiceId);

  const handleSendPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) return;
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
        invoiceId,
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
        isSent ? "Invoice Resent Successfully!" : "Invoice Sent Successfully!"
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to send invoice:", error);
      const msg =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to send invoice email. Please check SMTP configuration.";
      setErrorMessage(msg);
    }
  };

  const handleMarkSent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) return;
    setErrorMessage(null);

    if (isSent) {
      setErrorMessage("Invoice has already been marked as sent.");
      return;
    }

    try {
      await markSentMutation.mutateAsync({
        invoiceId,
        payload: {
          note: manualNote.trim() || undefined,
          message: manualNote.trim() || undefined,
          sentAt: manualSentAt ? new Date(manualSentAt).toISOString() : undefined,
        },
      });
      onShowSuccess("Invoice Marked as Sent!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to mark invoice as sent:", error);
      const msg =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to mark invoice as sent.";
      setErrorMessage(msg);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          {isSent ? "Resend or Mark Invoice" : "Send Invoice"}
        </DialogTitle>
        <DialogDescription>
          Deliver invoice directly to customer via email, or mark it sent if already emailed outside the app.
        </DialogDescription>
      </DialogHeader>

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
          This invoice must be approved by Admin before sending.
        </div>
      )}

      {isRevisionMismatch && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-semibold">Revision Outdated: </span>
          Invoice was edited after approval. Please re-submit for approval before sending.
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
            title={isSent ? "Invoice has already been marked as sent" : undefined}
          >
            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
            Mark as Sent {isSent ? "(Done)" : ""}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Platform Send Form */}
        <TabsContent value="platform" className="space-y-4 pt-1">
          <form id="invoice-send-form" onSubmit={handleSendPlatform} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-to-email" className="text-xs font-semibold text-slate-700">
                To Recipient <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invoice-to-email"
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
              <Label htmlFor="invoice-send-notes" className="text-xs font-semibold text-slate-700">
                Cover Note / Message <span className="font-normal text-slate-500">(Optional)</span>
              </Label>
              <Textarea
                id="invoice-send-notes"
                placeholder="Enter an optional cover message..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSending}
                className="min-h-24 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                The invoice PDF is automatically generated and attached by the system.
              </p>
            </div>
          </form>
        </TabsContent>

        {/* TAB 2: Mark as Sent Form */}
        <TabsContent value="manual" className="space-y-4 pt-1">
          <form id="invoice-mark-sent-form" onSubmit={handleMarkSent} className="space-y-4">
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">Sent externally via Gmail, Outlook, etc.?</span>
              <p className="mt-1 text-blue-800">
                Marking this invoice as sent updates the status to <strong>sent</strong> and records your audit note without requiring platform SMTP delivery.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invoice-manual-notes" className="text-xs font-semibold text-slate-700">
                Notes / Reference <span className="font-normal text-slate-500">(Optional)</span>
              </Label>
              <Textarea
                id="invoice-manual-notes"
                placeholder="e.g. Sent from Gmail on 7 Sep, invoice copy attached."
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                disabled={isSending}
                className="min-h-20 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Stored on the document record and audit history.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invoice-manual-sent-at" className="text-xs font-semibold text-slate-700">
                Date & Time Sent <span className="font-normal text-slate-500">(Optional)</span>
              </Label>
              <Input
                id="invoice-manual-sent-at"
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

      <DialogFooter className="flex flex-row items-center justify-between pt-2 sm:justify-between border-t border-slate-100 mt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSending}>
            Cancel
          </Button>
        </DialogClose>

        {activeTab === "platform" ? (
          <Button
            type="submit"
            form="invoice-send-form"
            disabled={!canSend || isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSending
              ? "Sending..."
              : isSent
              ? "Resend Invoice"
              : "Send Invoice"}
          </Button>
        ) : (
          <Button
            type="submit"
            form="invoice-mark-sent-form"
            disabled={!canMarkSent || isSending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSending ? "Marking as Sent..." : "Mark as Sent"}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export function SendInvoiceModal({
  open,
  onOpenChange,
  ...props
}: SendInvoiceModalProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Invoice Sent Successfully!");

  const handleShowSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          {open && (
            <SendInvoiceDialogContent
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
