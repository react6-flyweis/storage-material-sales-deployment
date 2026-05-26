import { useEffect, useRef } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { useSalesCustomersQuery } from "@/modules/customers/customers.hooks";

type Customer = {
  id: string;
  customerId: string;
  name: string;
  email?: string;
};

type Props = {
  value: string;
  onValueChange: (value: Customer | null | undefined) => void;
  placeholder?: string;
};

export default function CustomerSelector({
  value,
  onValueChange,
  placeholder = "Search customers...",
}: Props) {
  const { data, isLoading } = useSalesCustomersQuery(1, 100);
  const lastEmittedCustomerIdRef = useRef<string | null>(null);

  const customers =
    data?.data.customers.map((customer) => ({
      id: customer._id,
      customerId: customer.customerId,
      name:
        `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
        customer.customerId,
      email: customer.email,
    })) || [];

  const selectedCustomer =
    customers.find((customer) => customer.id === value) || null;

  useEffect(() => {
    if (!selectedCustomer) {
      lastEmittedCustomerIdRef.current = null;
      return;
    }

    if (lastEmittedCustomerIdRef.current === selectedCustomer.id) {
      return;
    }

    lastEmittedCustomerIdRef.current = selectedCustomer.id;
    onValueChange(selectedCustomer);
  }, [onValueChange, selectedCustomer]);

  return (
    <Combobox
      items={customers}
      itemToStringLabel={(customer: Customer) => customer.name}
      value={selectedCustomer}
      onValueChange={(val: Customer | null | undefined) => {
        onValueChange(val);
      }}
    >
      <ComboboxInput placeholder={placeholder} />
      <ComboboxContent className="pointer-events-auto">
        <ComboboxEmpty>
          {isLoading ? "Loading customers..." : "No customer found"}
        </ComboboxEmpty>
        <ComboboxList>
          {(customer: Customer) => (
            <ComboboxItem key={customer.id} value={customer}>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {customer.name}
                </span>
                <span className="text-sm text-gray-500">
                  {customer.email ?? customer.customerId}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
