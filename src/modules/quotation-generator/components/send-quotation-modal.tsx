import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import type { ApprovalStatus } from "@/modules/quotations/quotations.api";
import { useSendQuotationMutation } from "@/modules/quotations/quotations.hooks";

interface SendQuotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId?: string;
  customerEmail?: string;
  customerName?: string;
  approvalStatus?: ApprovalStatus | string;
  versionNumber?: number;
  approvedVersionNumber?: number | null;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function SendQuotationModal({
  open,
  onOpenChange,
  quotationId,
  customerEmail = "",
  customerName = "Valued Customer",
  approvalStatus = "approved",
  versionNumber = 1,
  approvedVersionNumber,
  onSuccess,
  isLoading = false,
}: SendQuotationModalProps) {
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const sendMutation = useSendQuotationMutation();
  const isSending = isLoading || sendMutation.isPending;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrorMessage(null);
      setNotes("");
    }
    onOpenChange(newOpen);
  };

  const isApproved = approvalStatus === "approved";
  const isStale =
    isApproved &&
    approvedVersionNumber !== undefined &&
    approvedVersionNumber !== null &&
    approvedVersionNumber !== versionNumber;

  const canSend = isApproved && !isStale && Boolean(quotationId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationId) return;
    setErrorMessage(null);
    try {
      await sendMutation.mutateAsync({
        quotationId,
        payload: {
          message: notes,
          note: notes,
          emailMessage: notes,
          coverNote: notes,
        },
      });
      handleOpenChange(false);
      setShowSuccessDialog(true);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to send quotation:", error);
      const msg =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to send quotation package. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSend} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Send Quotation to Customer
              </DialogTitle>
              <DialogDescription>
                Deliver the assembled quotation package directly to the customer's email address.
              </DialogDescription>
            </DialogHeader>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            {!canSend && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <span className="font-semibold">Admin Approval Required: </span>
                {!isApproved
                  ? "This quotation must be approved by Admin before sending."
                  : "Quotation was edited after approval. Please re-submit for approval."}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-email">Recipient Email Address</Label>
                <Input
                  id="customer-email"
                  type="email"
                  readOnly
                  tabIndex={-1}
                  placeholder="customer@company.com"
                  value={customerEmail}
                  className="bg-muted text-muted-foreground cursor-default focus-visible:ring-0 focus-visible:border-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="send-notes">
                  Message / Cover Note <span className="font-normal text-slate-500">(Optional)</span>
                </Label>
                <Textarea
                  id="send-notes"
                  placeholder={`Dear ${customerName},\n\nPlease find attached our complete quotation package for your review.`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center sm:justify-between pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={!canSend || isSending}
              >
                {isSending ? "Sending..." : "Send Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Global Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Quotation Sent Successfully!"
        okLabel="Ok"
      />
    </>
  );
}


