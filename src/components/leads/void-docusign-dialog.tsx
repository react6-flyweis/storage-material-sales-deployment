import * as React from "react";
import { AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoidDocuSignDialogProps {
  envelopeId?: string;
  onSuccess?: (reason: string) => void;
  trigger?: React.ReactNode;
}

export default function VoidDocuSignDialog({
  envelopeId,
  onSuccess,
  trigger,
}: VoidDocuSignDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reasonCategory, setReasonCategory] = React.useState("scope_change");
  const [customReason, setCustomReason] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);

      const resolvedReason =
        reasonCategory === "scope_change"
          ? "Customer requested scope or specification changes"
          : reasonCategory === "pricing"
          ? "Pricing or payment milestones revised"
          : reasonCategory === "wrong_recipient"
          ? "Sent to incorrect contact or email"
          : customReason.trim() || "Voided by sales agent";

      toast.success("DocuSign envelope voided successfully", {
        description: "The customer can no longer view or sign this version. You may now revise and re-send.",
      });

      if (onSuccess) {
        onSuccess(resolvedReason);
      }
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="rounded-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm gap-1.5"
          >
            <Ban className="h-3.5 w-3.5" />
            <span>Void Contract</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-lg font-semibold text-slate-800">
                Void Contract Envelope
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              This will cancel the active DocuSign signing session{envelopeId ? ` (${envelopeId})` : ""}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">What happens next?</p>
            <p className="text-amber-800">
              The customer will receive a notification that the signing link was cancelled.
              You will be able to edit quote terms and send a fresh agreement.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="void-reason" className="text-xs font-medium text-slate-700">
                Reason for Voiding <span className="text-red-500">*</span>
              </Label>
              <Select value={reasonCategory} onValueChange={setReasonCategory}>
                <SelectTrigger id="void-reason" className="h-9 text-sm w-full">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scope_change">Customer requested scope / building changes</SelectItem>
                  <SelectItem value="pricing">Pricing or payment milestones revised</SelectItem>
                  <SelectItem value="wrong_recipient">Sent to incorrect contact or email</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="void-notes" className="text-xs font-medium text-slate-700">
                Internal Note / Description (Optional)
              </Label>
              <Textarea
                id="void-notes"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Briefly state why this envelope is being voided..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Keep Active
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Voiding..." : "Confirm Void"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
