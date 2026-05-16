import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";
import {
  escalateLeadProvider,
  getLeadDetailProvider,
  getLeadsProvider,
  importLeadsProvider,
  type ImportLeadsPayload,
} from "./leads.api";

type EscalationStatus = "pending" | "assigned" | "resolved";

type EscalationCustomer = {
  _id: string;
  customerId?: string;
  firstName?: string;
};

type EscalationEmployee = {
  _id?: string;
  name?: string;
};

type EscalationLead = {
  _id: string;
  customerId?: EscalationCustomer | string | null;
  buildingType?: string;
  location?: string;
  assignedSales?: string | EscalationEmployee | null;
  lifecycleStatus?: string;
};

type EscalationItem = {
  _id: string;
  leadId?: EscalationLead | null;
  customerId?: EscalationCustomer | null;
  raisedBy?: EscalationEmployee | null;
  note?: string;
  status?: EscalationStatus;
  resolvedAssignedTo?: EscalationEmployee | null;
  resolvedAt?: string | null;
  createdAt: string;
};

type EscalationsResponse = {
  success: boolean;
  message: string;
  data: {
    escalations: EscalationItem[];
  };
};

async function getEscalationsProvider(): Promise<EscalationsResponse> {
  const response = await apiClient.get<EscalationsResponse>(
    "/api/sales/escalations",
  );

  return response.data;
}

export function useEscalatedLeadsQuery() {
  return useQuery({
    queryKey: ["sales", "escalations"],
    queryFn: getEscalationsProvider,
    staleTime: 60 * 1000,
  });
}

export function useLeadsQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ["sales", "leads", page, limit],
    queryFn: () => getLeadsProvider(page, limit),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useLeadDetailQuery(leadId: string | undefined) {
  return useQuery({
    queryKey: ["sales", "leads", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId!),
    enabled: Boolean(leadId),
    staleTime: 30 * 1000,
  });
}

export function useImportLeadsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ImportLeadsPayload) => importLeadsProvider(payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    },
  });
}

type EscalateLeadVariables = {
  leadId: string;
  note: string;
};

export function useEscalateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, note }: EscalateLeadVariables) =>
      escalateLeadProvider(leadId, { note }),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "escalations"] });
    },
  });
}
