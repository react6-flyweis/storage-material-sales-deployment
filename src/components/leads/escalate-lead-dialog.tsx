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

interface EscalateLeadDialogProps {
  trigger?: React.ReactNode;
  leadId?: string;
  leadName?: string;
}

export default function EscalateLeadDialog({
  trigger,
  //   leadId,
  //   leadName,
}: EscalateLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEscalate = async () => {
    try {
      setIsLoading(true);
      // Placeholder for actual API call
      await new Promise((res) => setTimeout(res, 600));
      setOpen(false);
      setNote("");
      setShowSuccess(true);
    } finally {
      setIsLoading(false);
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
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 justify-end p-4 pt-0">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleEscalate}
            disabled={isLoading || !note.trim()}
          >
            {isLoading ? "Escalating..." : "Escalate"}
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
