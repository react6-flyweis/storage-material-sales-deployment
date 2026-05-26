import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ClientSelector from "@/components/customers/client-selector";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useCreateFollowUpMutation } from "@/modules/followups/followups.hooks";

const followUpSchema = z.object({
  leadId: z.string().min(1, "Client name is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  type: z.enum(["call", "email", "meeting"]),
  date: z.string().min(1, "Follow-up date is required"),
  time: z.string().min(1, "Follow-up time is required"),
  notes: z.string().max(500).optional(),
  priority: z.enum(["low", "medium", "high"]),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string | null;
  leadId?: string | null;
  onSuccess?: () => void;
};

const defaultFormValues = {
  leadId: "",
  customerId: "",
  type: "call" as const,
  date: "",
  time: "",
  notes: "",
  priority: "medium" as const,
};

export default function AddFollowUpDialog({
  open,
  onOpenChange,
  initialDate,
  leadId,
  onSuccess,
}: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const shouldHideLeadSelector = Boolean(leadId);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      ...defaultFormValues,
      date: initialDate ?? "",
      leadId: leadId ?? "",
    },
  });

  const notes = useWatch({ control, name: "notes" });

  const createFollowUp = useCreateFollowUpMutation();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      ...defaultFormValues,
      date: initialDate ?? "",
      leadId: leadId ?? "",
    });
  }, [initialDate, leadId, open, reset]);

  useEffect(() => {
    if (leadId) {
      setValue("leadId", leadId);
    }
  }, [leadId, setValue]);

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty) {
      // Prevent closing if form has been touched
      return;
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: FollowUpFormData) => {
    const followUpDate = new Date(`${data.date}T${data.time}`).toISOString();

    // Prevent scheduling follow-ups in the past
    if (new Date(followUpDate) < new Date()) {
      setError("date", {
        message: "Follow-up date/time must be in the future.",
      });
      return;
    }

    const payload = {
      leadId: data.leadId,
      customerId: data.customerId,
      followUpDate,
      modeOfContact: data.type,
      notes: data.notes,
      priority: data.priority,
    };

    try {
      createFollowUp.mutateAsync(payload);
      onOpenChange(false);
      reset(defaultFormValues);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to create follow-up:", err);
      setError("root", {
        message: "Failed to create follow-up. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="text-lg">Add Follow-up</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 space-y-4">
            {errors.root && (
              <div className="mb-2">
                <FieldError>
                  {errors.root.message as unknown as string}
                </FieldError>
              </div>
            )}
            <div className={shouldHideLeadSelector ? "hidden" : ""}>
              <Field>
                <FieldLabel>Select Lead</FieldLabel>
                <FieldContent>
                  <Controller
                    control={control}
                    name="leadId"
                    render={({ field }) => (
                      <ClientSelector
                        value={field.value}
                        onValueChange={(client) => {
                          field.onChange(client?.id || "");
                          setValue("customerId", client?.customerId || "");
                        }}
                      />
                    )}
                  />
                  {errors.leadId && (
                    <FieldError>{errors.leadId.message}</FieldError>
                  )}
                  {errors.customerId && (
                    <FieldError>
                      {errors.customerId.message as unknown as string}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel>Mode of Contact *</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Mode of Contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <FieldError>{errors.type.message}</FieldError>}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Follow-up Date *</FieldLabel>
              <FieldContent>
                <Input type="date" {...register("date")} min={today} />
                {errors.date && <FieldError>{errors.date.message}</FieldError>}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Follow-up Time *</FieldLabel>
              <FieldContent>
                <Input type="time" {...register("time")} />
                {errors.time && <FieldError>{errors.time.message}</FieldError>}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Priority</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <FieldError>{errors.priority.message}</FieldError>
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Notes</FieldLabel>
              <FieldContent>
                <Textarea
                  {...register("notes")}
                  rows={4}
                  maxLength={500}
                  placeholder="Add any additional notes or context..."
                />
                <div className="text-sm text-gray-500 mt-1">
                  {notes?.length}/500 characters
                </div>
                {errors.notes && (
                  <FieldError>{errors.notes.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          </div>

          <DialogFooter className="p-4 flex-row">
            <Button
              type="button"
              size="lg"
              className="bg-gray-300 text-gray-700 mr-2 w-40"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="lg"
              className="w-40 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Follow up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onSuccess?.();
        }}
        title="Follow-up Added Successfully!"
      />
    </Dialog>
  );
}
