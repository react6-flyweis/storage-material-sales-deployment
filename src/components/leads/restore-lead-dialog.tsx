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
import SuccessDialog from "@/components/success-dialog";
import { useUnarchiveLeadMutation } from "@/modules/leads/leads.hooks";
import { getApiErrorMessage } from "@/lib/api-error";

interface RestoreLeadDialogProps {
  trigger?: React.ReactNode;
  leadId?: string;
  leadName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function RestoreLeadDialog({
  trigger,
  leadId,
  leadName,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: RestoreLeadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unarchiveLeadMutation = useUnarchiveLeadMutation();
  const submitting = unarchiveLeadMutation.isPending;

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || submitting) {
      return;
    }

    setErrorMessage(null);

    try {
      await unarchiveLeadMutation.mutateAsync({
        leadId,
      });

      setOpen(false);
      setShowSuccess(true);
      onSuccess?.();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to restore lead. Please try again."),
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
          <form onSubmit={handleRestore} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Restore Lead
              </DialogTitle>
              <div className="sr-only">Restore lead to active pipeline</div>
            </DialogHeader>

            <div className="space-y-4">
              {leadName && (
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3.5 text-sm">
                  <p className="font-semibold text-slate-800">{leadName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This lead will be moved back to the active pipeline.
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Are you sure you want to restore this lead back to active leads lists?
              </p>

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
                {submitting ? "Restoring..." : "Restore Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Lead Restored Successfully"
        description="The lead has been restored and returned to active lists."
      />
    </>
  );
}
