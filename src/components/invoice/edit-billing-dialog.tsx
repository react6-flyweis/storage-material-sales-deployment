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
import { useUpdateInvoiceBillingMutation } from "@/modules/invoices/invoices.hooks";
import type { InvoiceDetail, InvoiceAddress, InvoiceBankDetails } from "@/modules/invoices/invoices.api";

type Props = {
  children?: React.ReactNode;
  invoice: InvoiceDetail;
};

export default function EditBillingDialog({ children, invoice }: Props) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"seller" | "recipient" | "bank">("seller");
  const updateMutation = useUpdateInvoiceBillingMutation();

  const [billingAddress, setBillingAddress] = React.useState<InvoiceAddress>(
    invoice.billingAddress || {},
  );
  const [recipientAddress, setRecipientAddress] = React.useState<InvoiceAddress>(
    invoice.recipientAddress || {},
  );
  const [bankDetails, setBankDetails] = React.useState<InvoiceBankDetails>(
    invoice.bankDetails || {},
  );

  React.useEffect(() => {
    if (open) {
      setBillingAddress(invoice.billingAddress || {});
      setRecipientAddress(invoice.recipientAddress || {});
      setBankDetails(invoice.bankDetails || {});
    }
  }, [open, invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice._id) return;

    const buildLines = (addr: InvoiceAddress) => {
      const lines: string[] = [];
      if (addr.line1?.trim()) lines.push(addr.line1.trim());
      if (addr.line2?.trim()) lines.push(addr.line2.trim());
      const csz = [
        addr.city?.trim(),
        [addr.state?.trim(), addr.postalCode?.trim()].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(", ");
      if (csz) lines.push(csz);
      if (addr.country?.trim()) lines.push(addr.country.trim());
      return lines;
    };

    try {
      await updateMutation.mutateAsync({
        invoiceId: invoice._id,
        payload: {
          billingAddress: {
            ...billingAddress,
            lines: buildLines(billingAddress),
          },
          recipientAddress: {
            ...recipientAddress,
            lines: buildLines(recipientAddress),
          },
          bankDetails,
        },
      });
      setOpen(false);
    } catch {
      // Error handling is managed by react-query / toast if available
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Edit Billing & Bank Info
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Update remittance instructions, company billing address, or recipient address without altering line items.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-2 gap-2 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("seller")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "seller"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Seller Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recipient")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "recipient"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Bill-To Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bank")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "bank"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Banking & Wire Info
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {activeTab === "seller" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Company Name</Label>
                <Input
                  value={billingAddress.companyName || ""}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                  placeholder="STEEL BUILDING DEPOT"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Street Address</Label>
                <Input
                  value={billingAddress.line1 || ""}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, line1: e.target.value }))
                  }
                  placeholder="1851 Madison Ave Suite 300"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Suite / Unit (Optional)</Label>
                <Input
                  value={billingAddress.line2 || ""}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({ ...prev, line2: e.target.value }))
                  }
                  placeholder="Suite 300"
                  className="h-9 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">City</Label>
                  <Input
                    value={billingAddress.city || ""}
                    onChange={(e) =>
                      setBillingAddress((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Council Bluffs"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">State</Label>
                  <Input
                    value={billingAddress.state || ""}
                    onChange={(e) =>
                      setBillingAddress((prev) => ({ ...prev, state: e.target.value }))
                    }
                    placeholder="IA"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Postal Code</Label>
                  <Input
                    value={billingAddress.postalCode || ""}
                    onChange={(e) =>
                      setBillingAddress((prev) => ({ ...prev, postalCode: e.target.value }))
                    }
                    placeholder="51503"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Country</Label>
                  <Input
                    value={billingAddress.country || ""}
                    onChange={(e) =>
                      setBillingAddress((prev) => ({ ...prev, country: e.target.value }))
                    }
                    placeholder="United States"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "recipient" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Customer / Business Name</Label>
                <Input
                  value={recipientAddress.companyName || ""}
                  onChange={(e) =>
                    setRecipientAddress((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                  placeholder="Client or Business Name"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Street Address</Label>
                <Input
                  value={recipientAddress.line1 || ""}
                  onChange={(e) =>
                    setRecipientAddress((prev) => ({ ...prev, line1: e.target.value }))
                  }
                  placeholder="Street address or P.O. Box"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Suite / Unit (Optional)</Label>
                <Input
                  value={recipientAddress.line2 || ""}
                  onChange={(e) =>
                    setRecipientAddress((prev) => ({ ...prev, line2: e.target.value }))
                  }
                  placeholder="Apt, Suite, Unit"
                  className="h-9 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">City</Label>
                  <Input
                    value={recipientAddress.city || ""}
                    onChange={(e) =>
                      setRecipientAddress((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="City"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">State</Label>
                  <Input
                    value={recipientAddress.state || ""}
                    onChange={(e) =>
                      setRecipientAddress((prev) => ({ ...prev, state: e.target.value }))
                    }
                    placeholder="State"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Postal Code</Label>
                  <Input
                    value={recipientAddress.postalCode || ""}
                    onChange={(e) =>
                      setRecipientAddress((prev) => ({ ...prev, postalCode: e.target.value }))
                    }
                    placeholder="ZIP / Postal Code"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Country</Label>
                  <Input
                    value={recipientAddress.country || ""}
                    onChange={(e) =>
                      setRecipientAddress((prev) => ({ ...prev, country: e.target.value }))
                    }
                    placeholder="Country"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "bank" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Bank Name</Label>
                <Input
                  value={bankDetails.bankName || ""}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  placeholder="e.g. Example Bank"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Account Name</Label>
                <Input
                  value={bankDetails.accountName || ""}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, accountName: e.target.value }))
                  }
                  placeholder="e.g. Steel Building Depot LLC"
                  className="h-9 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Account #</Label>
                  <Input
                    value={bankDetails.accountNumber || ""}
                    onChange={(e) =>
                      setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))
                    }
                    placeholder="****1234"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Routing #</Label>
                  <Input
                    value={bankDetails.routingNumber || ""}
                    onChange={(e) =>
                      setBankDetails((prev) => ({ ...prev, routingNumber: e.target.value }))
                    }
                    placeholder="021000021"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">SWIFT / BIC (Optional)</Label>
                  <Input
                    value={bankDetails.swiftCode || ""}
                    onChange={(e) =>
                      setBankDetails((prev) => ({ ...prev, swiftCode: e.target.value }))
                    }
                    placeholder="e.g. CHASUS33"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">IBAN (Optional)</Label>
                  <Input
                    value={bankDetails.iban || ""}
                    onChange={(e) =>
                      setBankDetails((prev) => ({ ...prev, iban: e.target.value }))
                    }
                    placeholder="International bank #"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-700">Memo / Payment Instructions</Label>
                <Input
                  value={bankDetails.paymentInstructions || ""}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, paymentInstructions: e.target.value }))
                  }
                  placeholder="e.g. Include invoice number in memo."
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-3 border-t border-gray-100">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-9 text-xs">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
