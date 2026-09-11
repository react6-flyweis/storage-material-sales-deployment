import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  useCreateFollowUpTemplateMutation,
  useUpdateFollowUpTemplateMutation,
} from "@/modules/followups/followups.hooks";
import type { FollowUpTemplateItem } from "@/modules/followups/followups.api";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: FollowUpTemplateItem | null;
  onSuccess: (savedTemplate: FollowUpTemplateItem) => void;
}

interface FormErrors {
  title?: string;
  message?: string;
  general?: string;
}

export default function FollowUpTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const { mutateAsync: createTemplate, isPending: isCreating } =
    useCreateFollowUpTemplateMutation();
  const { mutateAsync: updateTemplate, isPending: isUpdating } =
    useUpdateFollowUpTemplateMutation();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setTitle(template?.title || "");
      setMessage(template?.message || "");
      setErrors({});
    }
  }, [open, template]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle) {
      newErrors.title = "Title is required";
    }
    if (!trimmedMessage) {
      newErrors.message = "Message is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      if (template) {
        const res = await updateTemplate({
          templateId: template._id,
          payload: {
            title: trimmedTitle,
            message: trimmedMessage,
          },
        });
        toast.success("Template updated successfully");
        onOpenChange(false);
        onSuccess(res.data);
      } else {
        const res = await createTemplate({
          title: trimmedTitle,
          message: trimmedMessage,
          isActive: true,
        });
        toast.success("Template created successfully");
        onOpenChange(false);
        onSuccess(res.data);
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMsg =
        errorObj?.response?.data?.message ||
        errorObj?.response?.data?.error ||
        "Failed to save template";

      const lower = errorMsg.toLowerCase();
      if (
        lower.includes("duplicate") ||
        (lower.includes("title") && lower.includes("already exists"))
      ) {
        setErrors({ general: errorMsg });
      } else if (lower.includes("title")) {
        setErrors({ title: errorMsg });
      } else if (lower.includes("message")) {
        setErrors({ message: errorMsg });
      } else {
        setErrors({ general: errorMsg });
      }
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {template ? "Edit Template" : "Add Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errors.general && (
            <div className="text-xs bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tpl-title" className="text-xs">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tpl-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
              }}
              placeholder="e.g. Pricing Estimate"
              className={`text-xs h-9 ${
                errors.title ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-message" className="text-xs">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="tpl-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
              }}
              rows={4}
              placeholder="Enter template message..."
              className={`text-xs resize-none ${
                errors.message ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {errors.message && (
              <p className="text-[11px] text-red-500">{errors.message}</p>
            )}
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : template ? (
                "Update Template"
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
