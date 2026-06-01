import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCreateLeadNoteMutation } from "@/modules/leads/leads.hooks";

type AddNotesFormValues = {
  title: string;
  notes: string;
};

export type { AddNotesFormValues };

export function AddNotesDialog({
  leadId,
}: {
  leadId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createLeadNoteMutation = useCreateLeadNoteMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddNotesFormValues>({
    defaultValues: {
      title: "",
      notes: "",
    },
  });

  const onSubmit = async (data: AddNotesFormValues) => {
    if (!leadId) {
      return;
    }

    setErrorMessage(null);

    try {
      await createLeadNoteMutation.mutateAsync({
        leadId,
        note: data.notes.trim(),
      });

      setOpen(false);
      reset();
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to add note. Please try again."),
      );
    }
  };

  const submitting = isSubmitting || createLeadNoteMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-[#1D51A4] text-[#1D51A4] hover:bg-slate-50 rounded-[6px]"
          >
            Add Notes
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader className="">
              <DialogTitle className="text-xl font-semibold">
                Add Notes
              </DialogTitle>
              <div className="sr-only">
                Add an optional title and note content for this lead.
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="note-title">
                  Notes Title{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </Label>
                <Input
                  id="note-title"
                  className="h-12 rounded-[10px] border border-slate-200 bg-slate-50"
                  placeholder="Steel Investment"
                  {...register("title")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-details">Notes</Label>
                <Textarea
                  id="note-details"
                  className="rounded-[10px] border border-slate-200 bg-slate-50 p-4"
                  placeholder={`Reliable for long-distance steel transport.\nPreferred carrier for Texas routes.\nFast response time during bidding.`}
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
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="lg"
                disabled={submitting || !leadId}
              >
                {submitting ? "Adding..." : "Add Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Note Added Successfully"
      />
    </>
  );
}
