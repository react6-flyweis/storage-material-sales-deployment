import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  useSalesCustomersQuery,
  useCreateBasicCustomerMutation,
} from "@/modules/customers/customers.hooks";
import AddNewCustomerModal, {
  type NewCustomerFormData,
} from "./add-new-customer-modal";

export type Customer = {
  id: string;
  customerId: string;
  name: string;
  email?: string;
  phone?: {
    countryCode?: string;
    number?: string;
  };
};

type Props = {
  value: string;
  onValueChange: (value: Customer | null | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  onAddNewCustomer?: (customer: Customer) => void;
};

export default function CustomerSelector({
  value,
  onValueChange,
  placeholder = "Search customers...",
  disabled,
  onAddNewCustomer,
}: Props) {
  const { data, isLoading } = useSalesCustomersQuery(1, 100);
  const createCustomerMutation = useCreateBasicCustomerMutation();
  const lastEmittedCustomerIdRef = useRef<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdCustomers, setCreatedCustomers] = useState<Customer[]>([]);

  const apiCustomers: Customer[] =
    data?.data.customers.map((customer) => ({
      id: customer._id,
      customerId: customer.customerId,
      name:
        `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
        customer.customerId,
      email: customer.email,
      phone: customer.phone,
    })) || [];

  const customers = [...createdCustomers, ...apiCustomers];

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

  const handleAddNewCustomerSubmit = async (formData: NewCustomerFormData) => {
    const parsedCountryCode =
      formData.countryCode.match(/^\+\d+/)?.[0] || "+1";

    const response = await createCustomerMutation.mutateAsync({
      firstName: formData.name,
      email: formData.email,
      phone: formData.phoneNumber,
      countryCode: parsedCountryCode,
    });

    if (response?.success && response?.data?.customer) {
      const created = response.data.customer;
      const newCustomer: Customer = {
        id: created._id,
        customerId: created.customerId,
        name:
          created.customerName ||
          `${created.firstName ?? ""} ${created.lastName ?? ""}`.trim() ||
          formData.name,
        email: created.email,
        phone: created.phone,
      };

      setCreatedCustomers((prev) => [newCustomer, ...prev]);
      lastEmittedCustomerIdRef.current = newCustomer.id;
      onValueChange(newCustomer);
      onAddNewCustomer?.(newCustomer);
    } else {
      throw new Error(response?.message || "Failed to create customer");
    }
  };

  return (
    <>
      <Combobox
        items={customers}
        itemToStringLabel={(customer: Customer) => customer.name}
        value={selectedCustomer}
        onValueChange={(val: Customer | null | undefined) => {
          onValueChange(val);
        }}
      >
        <ComboboxInput placeholder={placeholder} disabled={disabled} />
        <ComboboxContent className="pointer-events-auto">
          {/* First option: Add New Customer */}
          <div className="p-1 border-b border-gray-100">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => {
                setIsModalOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer text-left"
            >
              <Plus className="size-4 shrink-0 text-blue-600" />
              <span>Add New Customer</span>
            </button>
          </div>

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

      <AddNewCustomerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddNewCustomerSubmit}
        isPending={createCustomerMutation.isPending}
      />
    </>
  );
}
