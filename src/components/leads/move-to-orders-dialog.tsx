import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useLeadDetailQuery,
  useMoveLeadToOrdersMutation,
} from "@/modules/leads/leads.hooks";

interface MoveToOrdersDialogProps {
  trigger: React.ReactNode;
  leadId?: string;
}

export default function MoveToOrdersDialog({
  trigger,
  leadId,
}: MoveToOrdersDialogProps) {
  const [open, setOpen] = useState(false);
  const [poNumber, setPoNumber] = useState("2145654332");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const moveLeadToOrdersMutation = useMoveLeadToOrdersMutation();
  const { data: leadResponse } = useLeadDetailQuery(leadId, open);

  const leadDetail = leadResponse?.success ? leadResponse.data : undefined;
  const latestQuotation =
    leadDetail?.quotations.find((quotation) => quotation.isLatest) ??
    leadDetail?.quotations[0];
  const latestInvoice = [...(leadDetail?.payments.invoices ?? [])].sort(
    (left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();

      return rightTime - leftTime;
    },
  )[0];

  const quotationId = latestQuotation?._id;
  const invoiceId = latestInvoice?._id;

  const handleMove = async () => {
    if (
      !leadId ||
      !quotationId ||
      !invoiceId ||
      !poNumber.trim() ||
      moveLeadToOrdersMutation.isPending
    ) {
      return;
    }

    setErrorMessage(null);

    try {
      await moveLeadToOrdersMutation.mutateAsync({
        leadId,
        poNumber: poNumber.trim(),
        invoiceId,
        quotationId,
      });

      setOpen(false);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to move lead to orders. Please try again.",
        ),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-mmd p-0 gap-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg">Move to orders</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="space-y-3">
            <Label className="text-sm">Enter PO number</Label>
            <Input
              value={poNumber}
              onChange={(e) =>
                setPoNumber((e.target as HTMLInputElement).value)
              }
              className="text-lg h-12 rounded-lg"
              placeholder="Enter PO number"
            />
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-destructive">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="p-6 border-t flex justify-end gap-4 bg-white">
          <DialogClose asChild>
            <Button
              size="lg"
              className="bg-gray-100 text-gray-700 mr-2 rounded-lg px-8 py-3"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={handleMove}
            disabled={
              moveLeadToOrdersMutation.isPending ||
              !leadId ||
              !quotationId ||
              !invoiceId ||
              !poNumber.trim()
            }
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-3"
          >
            {moveLeadToOrdersMutation.isPending ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
