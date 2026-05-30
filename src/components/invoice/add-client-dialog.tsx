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
import ClientSelector from "@/components/customers/client-selector";

type Client = { id: string; name: string; avatar?: string };

type Props = {
  children?: React.ReactNode;
  initialSelected?: string | null;
  onDone: (client: Client | null) => void;
};

export default function AddClientDialog({
  children,
  initialSelected = null,
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSelected,
  );
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null,
  );

  React.useEffect(() => {
    setSelectedId(initialSelected ?? null);
  }, [initialSelected]);

  const handleDone = () => {
    onDone(selectedClient);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md p-0">
        <div className="p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Add Client
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select a client
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <ClientSelector
              value={selectedId || ""}
              onValueChange={(val) => {
                if (!val) {
                  setSelectedId(null);
                  setSelectedClient(null);
                  return;
                }

                setSelectedId(val.id);
                setSelectedClient({ id: val.id, name: val.name });
              }}
              placeholder="Search clients..."
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="lg"
              className="rounded-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={handleDone}
            className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
