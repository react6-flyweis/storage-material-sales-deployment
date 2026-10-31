import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SuccessDialog from "@/components/success-dialog";
import { useArchiveLeadMutation } from "@/modules/leads/leads.hooks";
import { getApiErrorMessage } from "@/lib/api-error";

interface ArchiveLeadDialogProps {
  trigger?: React.ReactNode;
  leadId?: string;
  leadName?: string;
  jobId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ArchiveLeadDialog({
  trigger,
  leadId,
  leadName,
  jobId,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: ArchiveLeadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const archiveLeadMutation = useArchiveLeadMutation();
  const submitting = archiveLeadMutation.isPending;

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const handleArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || submitting) {
      return;
    }

    setErrorMessage(null);

    try {
      await archiveLeadMutation.mutateAsync({
        leadId,
        reason: reason.trim() || undefined,
      });

      setOpen(false);
      setReason("");
      setShowSuccess(true);
      onSuccess?.();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to archive lead. Please try again."),
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {!isControlled && trigger && (
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        )}

        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleArchive} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Archive Lead
              </DialogTitle>
              <div className="sr-only">Archive lead content</div>
            </DialogHeader>

            <div className="space-y-4">
              {(leadName || jobId) && (
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3.5 text-sm">
                  {leadName && (
                    <p className="font-semibold text-slate-800">{leadName}</p>
                  )}
                  {jobId && (
                    <p className="text-xs text-slate-500 mt-0.5">Job ID: {jobId}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="archive-reason">Reason (Optional)</Label>
                <Textarea
                  id="archive-reason"
                  rows={4}
                  className="rounded-[10px] border border-slate-200 bg-slate-50 p-4"
                  placeholder="Lost to competitor — no follow-up"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </div>

            <DialogFooter className="flex items-center sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white"
                disabled={submitting || !leadId}
              >
                {submitting ? "Archiving..." : "Archive Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Lead Archived Successfully"
        description="The lead has been removed from active lists and moved to the archive."
      />
    </>
  );
}
