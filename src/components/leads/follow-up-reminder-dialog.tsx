import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, ArrowRight } from "lucide-react";

interface FollowUpReminderDialogProps {
  open: boolean;
  onClose: () => void;
  reminderData: {
    _id: string;
    type: string;
    followUpId: string;
    leadId: string;
    followUpDate: string;
    modeOfContact: string;
    message: string;
  } | null;
  onViewDetails: () => void;
}

export default function FollowUpReminderDialog({
  open,
  onClose,
  reminderData,
  onViewDetails,
}: FollowUpReminderDialogProps) {
  if (!reminderData) return null;

  console.log(reminderData)

  const contactMode = reminderData.modeOfContact
    ? ` (${reminderData.modeOfContact.charAt(0).toUpperCase() + reminderData.modeOfContact.slice(1)})`
    : "";
  const title = `Follow-up Reminder${contactMode}`;
  const message = reminderData.message || "You have a scheduled follow-up task now.";

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-full max-w-md rounded-2xl p-6 text-left shadow-xl border border-slate-100">
        <DialogHeader className="flex flex-row items-center gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Bell className="h-6 w-6 " />
          </div>
          <div>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Follow-up Reminder
            </DialogTitle>
            <p className="text-sm text-slate-500">
              It is time for your scheduled follow-up
            </p>
          </div>
        </DialogHeader>

        {/* Reminder Details */}
        <div className="mb-5 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-xl border border-amber-100/50">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Scheduled Task
          </div>
          <h4 className="text-lg font-bold text-slate-900 leading-snug">
            {title}
          </h4>
          <p className="text-sm text-slate-600 mt-2 font-normal leading-relaxed">
            {message}
          </p>
          {reminderData.followUpDate && (
            <p className="text-xs text-slate-400 mt-2">
              Scheduled for: {new Date(reminderData.followUpDate).toLocaleString()}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-100 pt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-28">
              Dismiss
            </Button>
          </DialogClose>
          {reminderData.leadId && (
            <Button onClick={onViewDetails} className="w-full sm:w-36 bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5">
              View Lead <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
