import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoiceBankDetailsFormValues } from "@/pages/invoices/invoice-form";

type Props = {
  children?: React.ReactNode;
  initialValues: InvoiceBankDetailsFormValues;
  title?: string;
  description?: string;
  onDone: (values: InvoiceBankDetailsFormValues) => void;
};

export default function EditBankInfoDialog({
  children,
  initialValues,
  title = "Edit Banking & Wire Info",
  description = "Update the bank transfer and wire remittance instructions for this invoice.",
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<InvoiceBankDetailsFormValues>(initialValues);

  React.useEffect(() => {
    setForm(initialValues);
  }, [initialValues, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDone(form);
    setOpen(false);
  };

  const updateField = (field: keyof InvoiceBankDetailsFormValues, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Bank Name</Label>
            <Input
              value={form.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
              placeholder="e.g. Example Bank"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Account Name</Label>
            <Input
              value={form.accountName}
              onChange={(e) => updateField("accountName", e.target.value)}
              placeholder="e.g. Steel Building Depot LLC"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">Account #</Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => updateField("accountNumber", e.target.value)}
                placeholder="****1234"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">Routing #</Label>
              <Input
                value={form.routingNumber}
                onChange={(e) => updateField("routingNumber", e.target.value)}
                placeholder="021000021"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">SWIFT / BIC (Optional)</Label>
              <Input
                value={form.swiftCode}
                onChange={(e) => updateField("swiftCode", e.target.value)}
                placeholder="e.g. CHASUS33"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">IBAN (Optional)</Label>
              <Input
                value={form.iban}
                onChange={(e) => updateField("iban", e.target.value)}
                placeholder="International bank #"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Memo / Payment Instructions</Label>
            <Input
              value={form.paymentInstructions}
              onChange={(e) => updateField("paymentInstructions", e.target.value)}
              placeholder="e.g. Include invoice number in memo."
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-9 text-xs">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              Save Bank Info
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
