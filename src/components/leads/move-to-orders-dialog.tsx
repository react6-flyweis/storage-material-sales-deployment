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
import { getApiErrorMessage } from "@/lib/api-error";
import { useMoveLeadToOrdersMutation } from "@/modules/leads/leads.hooks";

interface MoveToOrdersDialogProps {
  trigger: React.ReactNode;
  leadId?: string;
}

export default function MoveToOrdersDialog({
  trigger,
  leadId,
}: MoveToOrdersDialogProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const moveLeadToOrdersMutation = useMoveLeadToOrdersMutation();

  const handleMove = async () => {
    if (!leadId || moveLeadToOrdersMutation.isPending) {
      return;
    }

    setErrorMessage(null);

    try {
      await moveLeadToOrdersMutation.mutateAsync({
        leadId,
        poNumber: "",
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
          <p className="text-sm text-gray-600">
            Are you sure you want to move this lead to orders?
          </p>

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
              moveLeadToOrdersMutation.isPending || !leadId
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

