import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import SuccessDialog from "@/components/success-dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateLeadNoteMutation,
  useUpdateLeadNoteMutation,
} from "@/modules/leads/leads.hooks";
import type { LeadDetailNote } from "@/modules/leads/leads.api";

type NoteFormValues = {
  title?: string;
  notes: string;
};

export type AddNotesFormValues = {
  title?: string;
  notes: string;
};

type NoteDialogProps = {
  leadId?: string;
  noteToEdit?: LeadDetailNote | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function AddNotesDialog({
  leadId,
  noteToEdit = null,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: NoteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (setControlledOpen ?? (() => {})) : setInternalOpen;

  const isEditing = Boolean(noteToEdit);

  const createLeadNoteMutation = useCreateLeadNoteMutation();
  const updateLeadNoteMutation = useUpdateLeadNoteMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    defaultValues: {
      notes: noteToEdit?.note ?? "",
    },
  });

  useEffect(() => {
    reset({
      notes: noteToEdit?.note ?? "",
    });
  }, [noteToEdit, reset]);

  const onSubmit = async (data: NoteFormValues) => {
    if (!leadId) {
      return;
    }

    setErrorMessage(null);

    try {
      if (isEditing && noteToEdit?._id) {
        await updateLeadNoteMutation.mutateAsync({
          leadId,
          noteId: noteToEdit._id,
          note: data.notes.trim(),
        });
      } else {
        await createLeadNoteMutation.mutateAsync({
          leadId,
          note: data.notes.trim(),
        });
      }

      setOpen(false);
      reset({ notes: "" });
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? "Unable to update note. Please try again."
            : "Unable to add note. Please try again.",
        ),
      );
    }
  };

  const submitting =
    isSubmitting ||
    createLeadNoteMutation.isPending ||
    updateLeadNoteMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {!isControlled && (
          <DialogTrigger asChild>
            {trigger ?? (
              <Button
                variant="outline"
                className="border-[#1D51A4] text-[#1D51A4] hover:bg-slate-50 rounded-[6px]"
              >
                Add Notes
              </Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Edit Note" : "Add Notes"}
              </DialogTitle>
              <div className="sr-only">
                {isEditing
                  ? "Update note content for this lead."
                  : "Add note content for this lead."}
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Optional Title - commented out as backend API only uses note content */}
              {/* <div className="space-y-2">
                <Label htmlFor="note-title">Notes Title</Label>
                <Input
                  id="note-title"
                  placeholder="Steel Investment"
                  className="h-12 rounded-[10px] border border-slate-200 bg-slate-50"
                  {...register("title")}
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="note-details">Notes</Label>
                <Textarea
                  id="note-details"
                  rows={4}
                  className="rounded-[10px] border border-slate-200 bg-slate-50 p-4"
                  placeholder={
                    isEditing
                      ? "Enter note details..."
                      : `Reliable for long-distance steel transport.\nPreferred carrier for Texas routes.\nFast response time during bidding.`
                  }
                  {...register("notes", {
                    required: "Notes are required",
                  })}
                />
                {errors.notes && (
                  <p className="text-xs text-red-500">{errors.notes.message}</p>
                )}
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
                {submitting
                  ? isEditing
                    ? "Saving..."
                    : "Adding..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={isEditing ? "Note Updated Successfully" : "Note Added Successfully"}
      />
    </>
  );
}
