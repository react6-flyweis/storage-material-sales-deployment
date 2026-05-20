import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

import { useLeadsQuery } from "@/modules/leads/leads.hooks";

type Client = {
  id: string;
  name: string;
  customer: string;
  customerId: string;
};

type Props = {
  value: string;
  onValueChange: (value: Client | null | undefined) => void;
  placeholder?: string;
};

export default function ClientSelector({
  value,
  onValueChange,
  placeholder = "Search clients...",
}: Props) {
  const { data, isLoading } = useLeadsQuery(1, 100);

  const clients =
    data?.data.leads.map((lead) => ({
      id: lead._id,
      name: lead.projectName || "N/A",
      customer: lead.customerId?.firstName || "N/A",
      customerId: lead.customerId?._id || "",
    })) || [];

  return (
    <Combobox
      items={clients}
      itemToStringValue={(client: Client) => client.name}
      value={clients.find((c) => c.id === value) || null}
      onValueChange={(val: Client | null | undefined) => {
        onValueChange(val);
      }}
    >
      <ComboboxInput placeholder={placeholder} />
      <ComboboxContent className="pointer-events-auto">
        <ComboboxEmpty>
          {isLoading ? "Loading clients..." : "No client found"}
        </ComboboxEmpty>
        <ComboboxList>
          {(client: Client) => (
            <ComboboxItem key={client.id} value={client}>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{client.name}</span>
                <span className="text-sm text-gray-500">{client.customer}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
