import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SuccessDialog from "@/components/success-dialog";
import { useEscalateLeadMutation } from "@/modules/leads/leads.hooks";
import { getApiErrorMessage } from "@/lib/api-error";

interface EscalateLeadDialogProps {
  trigger?: React.ReactNode;
  leadId?: string;
  leadName?: string;
}

export default function EscalateLeadDialog({
  trigger,
  leadId,
}: EscalateLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const escalateLeadMutation = useEscalateLeadMutation();

  const handleEscalate = async () => {
    if (!leadId || !note.trim() || escalateLeadMutation.isPending) {
      return;
    }

    setErrorMessage(null);

    try {
      await escalateLeadMutation.mutateAsync({
        leadId,
        note: note.trim(),
      });

      setOpen(false);
      setNote("");
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to escalate lead. Please try again."),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}

      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg">Escalate Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="escalation-note">Note</Label>
            <Textarea
              id="escalation-note"
              placeholder="while creating escalation just a small note is required."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-37.5 resize-none"
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="flex gap-3 justify-end p-4 pt-0">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={escalateLeadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleEscalate}
            disabled={
              escalateLeadMutation.isPending || !note.trim() || !leadId
            }
          >
            {escalateLeadMutation.isPending ? "Escalating..." : "Escalate"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Escalated Successfully"
      />
    </Dialog>
  );
}
