import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useSubmitQuotationForApprovalMutation } from "@/modules/quotations/quotations.hooks";

interface SubmitApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId?: string;
  quotationTitle?: string;
  quotationNumber?: string;
  versionNumber?: number;
  totalAmount?: string;
  onSubmit?: (note: string) => Promise<void>;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function SubmitApprovalModal({
  open,
  onOpenChange,
  quotationId,
  quotationTitle = "Quotation Package",
  quotationNumber,
  versionNumber = 1,
  totalAmount,
  onSubmit,
  onSuccess,
  isLoading = false,
}: SubmitApprovalModalProps) {
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const submitMutation = useSubmitQuotationForApprovalMutation();
  const isSubmitting = isLoading || submitMutation.isPending;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrorMessage(null);
      setNote("");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (onSubmit) {
        await onSubmit(note);
      } else if (quotationId) {
        await submitMutation.mutateAsync({ quotationId, note });
      }
      handleOpenChange(false);
      setShowSuccessDialog(true);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to submit quotation for approval:", error);
      const msg =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to submit quotation for approval. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Submit for Admin Approval
              </DialogTitle>
              <DialogDescription>
                Once submitted, management will be notified to review and approve this quotation.
              </DialogDescription>
            </DialogHeader>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            {/* Quotation Summary */}
            <div className="rounded-lg border bg-slate-50/70 p-4 text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Quotation</span>
                <span className="font-semibold text-slate-800">{quotationTitle}</span>
              </div>
              {quotationNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Quote Number</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {quotationNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Version</span>
                <span className="font-semibold text-slate-800">v{versionNumber}</span>
              </div>
              {totalAmount && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Total Price</span>
                  <span className="font-bold text-slate-900">{totalAmount}</span>
                </div>
              )}
            </div>

            {/* Optional Note */}
            <div className="space-y-2">
              <Label htmlFor="approval-note">
                Note for Admin Review <span className="font-normal text-slate-500">(Optional)</span>
              </Label>
              <Textarea
                id="approval-note"
                placeholder="e.g., Special discount applied as per client discussion. Please review margin."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-24"
              />
            </div>

            <DialogFooter className="flex items-center sm:justify-between pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Global Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Submitted for Approval Successfully!"
        okLabel="Ok"
      />
    </>
  );
}



