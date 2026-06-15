import { useEffect, useRef } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

import { useLeadsLookupQuery } from "@/modules/leads/leads.hooks";
import { formatLifecycleStatus, getStatusBadgeClassName } from "@/modules/leads/leads.utils";
import { isLeadInLifecycleRange, LeadLifecycleStatusValue } from "@/modules/leads/lifecycle-statuses";

type Client = {
  id: string;
  name: string;
  customer: string;
  customerId: string;
  lifecycleStatus?: string;
};

type Props = {
  value: string;
  onValueChange: (value: Client | null | undefined) => void;
  placeholder?: string;
  minLifecycleStatus?: LeadLifecycleStatusValue;
  maxLifecycleStatus?: LeadLifecycleStatusValue;
};

export default function ClientSelector({
  value,
  onValueChange,
  placeholder = "Search leads/projects...",
  minLifecycleStatus,
  maxLifecycleStatus = "payment_done",
}: Props) {
  const { data, isLoading } = useLeadsLookupQuery(undefined, 1, 100);
  const lastEmittedLeadIdRef = useRef<string | null>(null);

  const clients =
    data?.data.leads
      .filter((lead) =>
        isLeadInLifecycleRange(lead, minLifecycleStatus, maxLifecycleStatus)
      )
      .map((lead) => ({
        id: lead._id,
        name: lead.projectName || "Untitled Lead",
        customer:
          `${lead.customerId?.firstName ?? ""} ${lead.customerId?.lastName ?? ""}`.trim() ||
          "N/A",
        customerId: lead.customerId?._id || "",
        lifecycleStatus: lead.lifecycleStatus,
      })) || [];


  const selectedClient = clients.find((client) => client.id === value) || null;

  useEffect(() => {
    if (!selectedClient) {
      lastEmittedLeadIdRef.current = null;
      return;
    }

    if (lastEmittedLeadIdRef.current === selectedClient.id) {
      return;
    }

    lastEmittedLeadIdRef.current = selectedClient.id;
    onValueChange(selectedClient);
  }, [onValueChange, selectedClient]);

  return (
    <Combobox
      items={clients}
      itemToStringLabel={(client: Client) => client.name}
      filter={(client: Client, query: string) => {
        const q = query.toLowerCase();
        return (
          client.name.toLowerCase().includes(q) ||
          client.customer.toLowerCase().includes(q)
        );
      }}
      value={selectedClient}
      onValueChange={(val: Client | null | undefined) => {
        onValueChange(val);
      }}
    >
      <ComboboxInput placeholder={placeholder} />
      <ComboboxContent className="pointer-events-auto">
        <ComboboxEmpty>
          {isLoading ? "Loading leads/projects..." : "No leads/projects found"}
        </ComboboxEmpty>
        <ComboboxList>
          {(client: Client) => (
            <ComboboxItem key={client.id} value={client}>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{client.name}</span>
                <span className="text-sm text-gray-500">{client.customer}</span>

                {client.lifecycleStatus && (
                  <span className={`text-xs px-2 py-0.5 rounded-sm w-fit font-medium whitespace-nowrap ${getStatusBadgeClassName(client.lifecycleStatus)}`}>
                    {formatLifecycleStatus(client.lifecycleStatus)}
                  </span>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox >
  );
}
