import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import type { ZoomMeetingOutcomePayload } from "../zoom.types";

interface ZoomOutcomeModalProps {
  open: boolean;
  meetingId: string;
  leadId?: string;
  meetingTitle: string;
  clientName?: string;
  durationMinutes: number;
  initialNotes: string;
  isSaving: boolean;
  onSaveOutcome: (outcome: ZoomMeetingOutcomePayload) => void;
  onDiscard: () => void;
}

export const ZoomOutcomeModal: React.FC<ZoomOutcomeModalProps> = ({
  open,
  meetingId,
  leadId,
  meetingTitle,
  clientName,
  durationMinutes,
  initialNotes,
  isSaving,
  onSaveOutcome,
  onDiscard,
}) => {
  const [outcome, setOutcome] = useState<ZoomMeetingOutcomePayload["outcome"]>(
    "Follow-up Required",
  );
  const [notes, setNotes] = useState(initialNotes);
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOutcome({
      meetingId,
      leadId,
      status: "completed",
      outcome,
      notes,
      actualDurationMinutes: durationMinutes,
      nextFollowUpDate: nextFollowUpDate || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onDiscard()}>
      <DialogContent className="sm:max-w-md bg-white text-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Meeting Finished
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-gray-950">
            Log Meeting Outcome & Notes
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {meetingTitle} • with {clientName || "Client"} (Duration: {durationMinutes} min)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Meeting Outcome */}
          <div className="space-y-1.5">
            <Label htmlFor="call-outcome" className="text-xs font-medium text-gray-700">
              Meeting Outcome <span className="text-red-500">*</span>
            </Label>
            <Select
              value={outcome}
              onValueChange={(val) => setOutcome(val as ZoomMeetingOutcomePayload["outcome"])}
            >
              <SelectTrigger id="call-outcome" className="text-xs h-9">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proposal Accepted">Proposal Accepted</SelectItem>
                <SelectItem value="Follow-up Required">Follow-up Required</SelectItem>
                <SelectItem value="Needs Revised Quote">Needs Revised Quote</SelectItem>
                <SelectItem value="Deal Won">Deal Won</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Next Follow-up (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="next-followup" className="text-xs font-medium text-gray-700">
              Schedule Next Follow-up Date (Optional)
            </Label>
            <div className="relative">
              <Input
                id="next-followup"
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                min={new Date().toLocaleDateString("en-CA")}
                className="text-xs h-9 bg-white text-gray-900 border-gray-300"
              />
            </div>
          </div>

          {/* Final Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="final-notes" className="text-xs font-medium text-gray-700">
              Meeting Notes & Key Takeaways
            </Label>
            <Textarea
              id="final-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary of what was agreed upon..."
              rows={4}
              className="text-xs resize-none bg-white text-gray-900 border-gray-300"
            />
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Skip & Close
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isSaving ? "Saving..." : "Save Outcome to CRM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
