import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/modules/auth/auth.api";
import {
  createLeadNoteProvider,
  updateLeadNoteProvider,
  deleteLeadNoteProvider,
  escalateLeadProvider,
  getLeadDetailProvider,
  getScoredLeadsProvider,
  getLeadScoringProvider,
  type GetLeadScoringFilters,
  getLeadsProvider,
  importLeadsProvider,
  createLeadProvider,
  moveLeadToOrdersProvider,
  updateLeadTemperatureProvider,
  updateLeadLifecycleProvider,
  lookupLeadsProvider,
  getLeadAgreementProvider,
  updateLeadBuildingsProvider,
  updateLeadProvider,
  getArchivedLeadsProvider,
  archiveLeadProvider,
  unarchiveLeadProvider,
  type ImportLeadsPayload,
  type GetLeadsParams,
  type GetArchivedLeadsParams,
  type UpdateLeadBuildingsPayload,
  type UpdateLeadPayload,
} from "./leads.api";

type EscalationStatus = "pending" | "assigned" | "resolved";

type EscalatedLeadResponse = {
  _id: string;
  projectName?: string;
  businessUnit?: string | null;
  businessUnitLabel?: string;
  lifecycleStatus?: string;
  quoteValue?: number;
  customerId: {
    _id: string;
    firstName: string;
    email: string;
  };
  escalation: {
    _id: string;
    note: string;
    status: EscalationStatus;
    createdAt: string;
  };
  jobId: string;
  projectId: string;
};

type EscalationsResponse = {
  success: boolean;
  message: string;
  data: {
    leads: EscalatedLeadResponse[];
    total: number;
  };
};

async function getEscalationsProvider(): Promise<EscalationsResponse> {
  const response = await apiClient.get<EscalationsResponse>(
    "/api/sales/leads/escalated",
    {
      params: { status: "pending", page: 1, limit: 100 },
    },
  );

  return response.data;
}

export function useEscalatedLeadsQuery() {
  return useQuery({
    queryKey: ["sales", "escalations"],
    queryFn: getEscalationsProvider,
  });
}

export function useLeadsQuery(params: GetLeadsParams) {
  return useQuery({
    queryKey: ["sales", "leads", params],
    queryFn: () => getLeadsProvider(params),
  });
}

export function useLeadsLookupQuery(search?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["leads", "lookup", search, page, limit],
    queryFn: () => lookupLeadsProvider(search, page, limit),
  });
}

export function useLeadDetailQuery(leadId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["sales", "leads", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId!),
    enabled: Boolean(leadId) && enabled,
  });
}

export function useScoredLeadsQuery(page: number, limit: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["sales", "leads", "scored", page, limit, startDate, endDate],
    queryFn: () => getScoredLeadsProvider(page, limit, startDate, endDate),
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
      void queryClient.invalidateQueries({
        queryKey: ["sales", "escalations"],
      });
    },
  });
}

type CreateLeadNoteVariables = {
  leadId: string;
  note: string;
};

export function useCreateLeadNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, note }: CreateLeadNoteVariables) =>
      createLeadNoteProvider(leadId, { note }),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
    },
  });
}

type UpdateLeadNoteVariables = {
  leadId: string;
  noteId: string;
  note: string;
};

export function useUpdateLeadNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, noteId, note }: UpdateLeadNoteVariables) =>
      updateLeadNoteProvider(leadId, noteId, { note }),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
    },
  });
}

type DeleteLeadNoteVariables = {
  leadId: string;
  noteId: string;
};

export function useDeleteLeadNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, noteId }: DeleteLeadNoteVariables) =>
      deleteLeadNoteProvider(leadId, noteId),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
    },
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createLeadProvider>[0]) =>
      createLeadProvider(payload),
    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    },
  });
}

type MoveLeadToOrdersVariables = {
  leadId: string;
  poNumber: string;
};

export function useMoveLeadToOrdersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, poNumber }: MoveLeadToOrdersVariables) =>
      moveLeadToOrdersProvider(leadId, {
        poNumber,
      }),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
    },
  });
}

type UpdateLeadLifecycleVariables = {
  leadId: string;
  lifecycleStatus: string;
};

export function useUpdateLeadLifecycleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, lifecycleStatus }: UpdateLeadLifecycleVariables) =>
      updateLeadLifecycleProvider(leadId, { lifecycleStatus }),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
    },
  });
}

export function useLeadScoringQuery(
  page = 1,
  limit = 20,
  filters?: GetLeadScoringFilters
) {
  return useQuery({
    queryKey: ["leads", "scoring", page, limit, filters],
    queryFn: () => getLeadScoringProvider(page, limit, filters),
    staleTime: 60 * 1000,
  });
}

type UpdateLeadTemperatureVariables = {
  leadId: string;
  temperature: "hot" | "warm" | "cold" | string;
};

export function useUpdateLeadTemperatureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, temperature }: UpdateLeadTemperatureVariables) =>
      updateLeadTemperatureProvider(leadId, {
        temperature: temperature.toLowerCase() as "hot" | "warm" | "cold",
      }),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "scoring"] });
      void queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["followups"] });
      void queryClient.invalidateQueries({ queryKey: ["followups", "activity"] });
      if (variables?.leadId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "leads", "detail", variables.leadId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["leads", "detail", variables.leadId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["lead", "detail", variables.leadId],
        });
      }
    },
  });
}

export function useLeadAgreementQuery(leadId: string | undefined) {
  return useQuery({
    queryKey: ["sales", "leads", "agreement", leadId],
    queryFn: () => getLeadAgreementProvider(leadId!),
    enabled: Boolean(leadId),
  });
}

type UpdateLeadBuildingsVariables = {
  leadId: string;
  payload: UpdateLeadBuildingsPayload;
};

export function useUpdateLeadBuildingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, payload }: UpdateLeadBuildingsVariables) =>
      updateLeadBuildingsProvider(leadId, payload),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
    },
  });
}

type UpdateLeadVariables = {
  leadId: string;
  payload: UpdateLeadPayload;
};

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, payload }: UpdateLeadVariables) =>
      updateLeadProvider(leadId, payload),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "detail", variables.leadId],
      });
    },
  });
}

export function useArchivedLeadsQuery(
  params: GetArchivedLeadsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["sales", "leads", "archived", params],
    queryFn: () => getArchivedLeadsProvider(params),
    enabled: options?.enabled ?? true,
  });
}

export function useArchiveLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, reason }: { leadId: string; reason?: string }) =>
      archiveLeadProvider(leadId, { reason }),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "archived"],
      });
      if (variables?.leadId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "leads", "detail", variables.leadId],
        });
      }
    },
  });
}

export function useUnarchiveLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId }: { leadId: string }) =>
      unarchiveLeadProvider(leadId),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      void queryClient.invalidateQueries({
        queryKey: ["sales", "leads", "archived"],
      });
      if (variables?.leadId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "leads", "detail", variables.leadId],
        });
      }
    },
  });
}
