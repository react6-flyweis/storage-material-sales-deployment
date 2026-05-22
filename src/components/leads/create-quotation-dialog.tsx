import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateQuotationForm from "@/components/leads/create-quotation-form";
import type { LeadListItem } from "@/modules/leads/leads.api";

interface CreateQuotationDialogProps {
  trigger: React.ReactNode;
  leadData?: LeadListItem;
  mode?: "create" | "edit";
}

export default function CreateQuotationDialog({
  trigger,
  leadData,
  mode = "create",
}: CreateQuotationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <CreateQuotationForm leadData={leadData} mode={mode} />
      </DialogContent>
    </Dialog>
  );
}
