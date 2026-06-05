import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LifecycleStep = {
  id: number;
  label: string;
  value: string;
};

type UpdateStatusDialogProps = {
  open: boolean;
  currentStatus: string;
  steps: LifecycleStep[];
  onOpenChange: (open: boolean) => void;
  onSave: (status: string) => void | Promise<void>;
};

const formatLabel = (label: string) => label.replace(/\n/g, " ");

export default function UpdateStatusDialog({
  open,
  currentStatus,
  steps,
  onOpenChange,
  onSave,
}: UpdateStatusDialogProps) {
  const [draftStatus, setDraftStatus] = useState("");

  const currentStep = steps.find((step) => step.value === currentStatus);
  const currentStepId = currentStep ? currentStep.id : 0;

  const allowedManualStatuses = [
    "proposal_sent",
    "negotiation",
    "deal_closed",
    "payment_done",
    ...(currentStepId < 2 ? ["requirements_gathered"] : []),
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftStatus) return;

    await Promise.resolve(onSave(draftStatus));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Update Step Status
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status-step">Select Next Status</Label>
              <Select
                value={draftStatus}
                onValueChange={(value) => setDraftStatus(value)}
              >
                <SelectTrigger id="status-step" className="w-full">
                  <SelectValue placeholder="Select next status..." />
                </SelectTrigger>
                <SelectContent>
                  {steps.map((step) => {
                    const isAllowedManual = allowedManualStatuses.includes(step.value);
                    const isForward = step.id > currentStepId;
                    const isSelectable = isAllowedManual && isForward;
                    return (
                      <SelectItem key={step.id} value={step.value} disabled={!isSelectable}>
                        {formatLabel(step.label)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex items-center sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={!draftStatus}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
