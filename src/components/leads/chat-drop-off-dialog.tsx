import { useState } from "react";
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
import {
  Send,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { useSendChatDropOffMutation } from "@/modules/automation/automation.hooks";
import {
  useFollowUpTemplatesQuery,
  useDeleteFollowUpTemplateMutation,
} from "@/modules/followups/followups.hooks";
import type { FollowUpTemplateItem } from "@/modules/followups/followups.api";
import FollowUpTemplateDialog from "@/components/leads/followup-template-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  customerName?: string;
  onSuccess?: () => void;
};

export default function ChatDropOffDialog({
  open,
  onOpenChange,
  leadId,
  onSuccess,
}: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Template modal state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FollowUpTemplateItem | null>(null);

  // Queries and mutations
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useFollowUpTemplatesQuery({ isActive: true, limit: 100 }, open);
  const { mutateAsync: deleteTemplate, isPending: isDeleting } =
    useDeleteFollowUpTemplateMutation();
  const { mutateAsync: sendDropOff, isPending: isSending } =
    useSendChatDropOffMutation();

  const templates = templatesData?.data?.templates || [];

  // Active template & message synchronization
  const activeTemplate =
    templates.find((t) => t._id === selectedTemplateId) || templates[0];
  const selectedId = activeTemplate?._id || "";
  const message =
    customMessage !== null ? customMessage : activeTemplate?.message || "";

  const handleSelectTemplate = (tpl: FollowUpTemplateItem) => {
    setSelectedTemplateId(tpl._id);
    setCustomMessage(tpl.message);
    setErrorMessage(null);
  };

  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (
    e: React.MouseEvent,
    tpl: FollowUpTemplateItem
  ) => {
    e.stopPropagation();
    setEditingTemplate(tpl);
    setTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (
    e: React.MouseEvent,
    tpl: FollowUpTemplateItem
  ) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete template "${tpl.title}"?`)) {
      return;
    }

    try {
      await deleteTemplate(tpl._id);
      toast.success("Template deleted successfully");
      if (selectedTemplateId === tpl._id) {
        setSelectedTemplateId(null);
        setCustomMessage(null);
      }
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const handleTemplateSaved = (savedTemplate: FollowUpTemplateItem) => {
    setSelectedTemplateId(savedTemplate._id);
    setCustomMessage(savedTemplate.message);
  };

  const handleSend = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setErrorMessage("Please enter a message");
      return;
    }

    if (!leadId) {
      setErrorMessage("Lead ID is missing");
      return;
    }

    try {
      await sendDropOff({ leadId, message: trimmedMessage });
      setSuccessMessage("Follow-up sent successfully!");
      onSuccess?.();
      setTimeout(() => {
        setSuccessMessage(null);
        onOpenChange(false);
      }, 1000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        errorObj?.response?.data?.message || "Failed to send follow-up message"
      );
    }
  };

  const handleDialogClose = (val: boolean) => {
    if (!val) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setCustomMessage(null);
      setSelectedTemplateId(null);
    }
    onOpenChange(val);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg w-full p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="border-b px-5 py-4 shrink-0">
            <DialogTitle className="text-base font-semibold">
              Send Follow-Up
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-4 w-full min-w-0 overflow-hidden">
            {errorMessage ? (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-md border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {successMessage ? (
              <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            ) : null}

            {/* Quick Templates horizontal carousel */}
            <div className="w-full min-w-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-500">Quick Templates</Label>
                {isLoadingTemplates && (
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 w-full min-w-0 max-w-full items-stretch">
                {templates.map((tpl) => {
                  const isSelected = selectedId === tpl._id;
                  return (
                    <div
                      key={tpl._id}
                      onClick={() => handleSelectTemplate(tpl)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectTemplate(tpl);
                        }
                      }}
                      className={cn(
                        "group relative w-52 shrink-0 text-left p-2.5 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between",
                        isSelected
                          ? "border-blue-600 bg-blue-50/40"
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                      )}
                    >
                      <div className="min-w-0 pr-12">
                        <p
                          className={cn(
                            "text-xs font-semibold mb-1 truncate",
                            isSelected ? "text-blue-700" : "text-gray-800"
                          )}
                        >
                          {tpl.title}
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {tpl.message}
                        </p>
                      </div>

                      {/* Action buttons (Edit / Delete) */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-inherit rounded">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-white/80"
                          title="Edit template"
                          onClick={(e) => handleOpenEditTemplate(e, tpl)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting}
                          className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-white/80"
                          title="Delete template"
                          onClick={(e) => handleDeleteTemplate(e, tpl)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Add Template Card */}
                <button
                  type="button"
                  onClick={handleOpenAddTemplate}
                  className="w-44 min-h-[76px] shrink-0 flex flex-col items-center justify-center p-2.5 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-400 text-gray-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 mb-1 text-gray-500" />
                  <span className="text-xs font-medium">Add Template</span>
                </button>
              </div>
            </div>

            {/* Message input */}
            <div className="space-y-1.5 w-full min-w-0">
              <Label className="text-xs">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  setErrorMessage(null);
                }}
                rows={4}
                placeholder="Type your message..."
                className="text-xs resize-none w-full"
              />
            </div>
          </div>

          <DialogFooter className="border-t px-5 py-3 flex gap-2 justify-end bg-gray-50/50 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDialogClose(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSend}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Send Follow-Up
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FollowUpTemplateDialog
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        template={editingTemplate}
        onSuccess={handleTemplateSaved}
      />
    </>
  );
}
