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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSalesCustomersQuery } from "@/modules/customers/customers.hooks";
import type { SalesCustomer } from "@/modules/customers/customers.api";

export type Client = {
  id: string;
  name: string;
  customerId?: string;
  email?: string;
  avatar?: string;
};

type Props = {
  children?: React.ReactNode;
  clients?: Client[];
  initialSelected?: string | null;
  onDone: (client: Client | null) => void;
};

function getCustomerDisplayName(customer: SalesCustomer) {
  return (
    `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
    customer.customerId
  );
}


function getCustomerAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=374151&size=80`;
}

function mapSalesCustomerToClient(customer: SalesCustomer): Client {
  const name = getCustomerDisplayName(customer);

  return {
    id: customer._id,
    customerId: customer.customerId,
    name,
    email: customer.email,
    avatar: getCustomerAvatarUrl(name),
  };
}

export default function AddClientDialog({
  children,
  clients: clientsOverride,
  initialSelected = null,
  onDone,
}: Props) {
  const { data, isLoading, isError } = useSalesCustomersQuery(1, 100);

  const apiClients = React.useMemo(
    () => (data?.data.customers ?? []).map(mapSalesCustomerToClient),
    [data],
  );

  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSelected,
  );
 const items = clientsOverride ?? apiClients;

  React.useEffect(() => {
    setSelectedId(initialSelected ?? null);
  }, [initialSelected]);

  const handleDone = () => {
    const client = items.find((c) => c.id === selectedId) ?? null;
    onDone(client);
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
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {isLoading && !clientsOverride ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Loading customers...
                </p>
              ) : isError && !clientsOverride ? (
                <p className="text-sm text-red-600 py-4 text-center">
                  Failed to load customers. Please try again.
                </p>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No customers found
                </p>
              ) : (
                items.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="client"
                      checked={selectedId === c.id}
                      onChange={() => setSelectedId(c.id)}
                      className="w-4 h-4"
                    />

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.avatar} alt={c.name} />
                      <AvatarFallback className="text-xs text-gray-600">
                        {c.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {c.name}
                      </div>
                      {(c.email ?? c.customerId) && (
                        <div className="text-xs text-gray-500 truncate">
                          {c.email ?? c.customerId}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
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
            disabled={
              !selectedId ||
              (isLoading && !clientsOverride) ||
              items.length === 0
            }
            className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
