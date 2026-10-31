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
import type { InvoiceAddressFormValues } from "@/pages/invoices/invoice-form";

type Props = {
  children?: React.ReactNode;
  initialValues: InvoiceAddressFormValues;
  title?: string;
  description?: string;
  onDone: (values: InvoiceAddressFormValues) => void;
};

export default function EditAddressDialog({
  children,
  initialValues,
  title = "Edit Address",
  description = "Update the address details for this invoice.",
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<InvoiceAddressFormValues>(initialValues);

  React.useEffect(() => {
    setForm(initialValues);
  }, [initialValues, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDone(form);
    setOpen(false);
  };

  const updateField = (field: keyof InvoiceAddressFormValues, val: string) => {
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

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Company Name</Label>
            <Input
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Company Name"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Street Address</Label>
            <Input
              value={form.line1}
              onChange={(e) => updateField("line1", e.target.value)}
              placeholder="1851 Madison Ave Suite 300"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Suite / Line 2 (Optional)</Label>
            <Input
              value={form.line2}
              onChange={(e) => updateField("line2", e.target.value)}
              placeholder="Suite, Unit, Floor, etc."
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">City</Label>
              <Input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Council Bluffs"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">State / Province</Label>
              <Input
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="IA"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">Postal Code</Label>
              <Input
                value={form.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                placeholder="51503"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">Country</Label>
              <Input
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="United States"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-9 text-xs">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
