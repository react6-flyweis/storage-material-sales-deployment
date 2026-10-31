import { useCallback, useEffect, useRef, useState } from "react";
import {
  keepPreviousData,
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
  importLeadsFileProvider,
  getLeadImportJobStatusProvider,
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
  getLeadMediaProvider,
  type GetLeadMediaParams,
  type ImportLeadsPayload,
  type ImportLeadsFileOptions,
  type LeadImportJobData,
  type ImportLeadsSyncData,
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
    placeholderData: keepPreviousData,
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

const IMPORT_JOB_STORAGE_KEY = "sales_lead_import_job_id";

export type UseLeadImportState = {
  isUploading: boolean;
  isPolling: boolean;
  jobId: string | null;
  jobData: LeadImportJobData | null;
  syncData: ImportLeadsSyncData | null;
  status: "idle" | "uploading" | "polling" | "completed" | "failed";
  error: string | null;
};

export function useLeadImport() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(IMPORT_JOB_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [jobData, setJobData] = useState<LeadImportJobData | null>(null);
  const [syncData, setSyncData] = useState<ImportLeadsSyncData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePollingRef = useRef<boolean>(false);

  const clearSessionJob = useCallback(() => {
    try {
      sessionStorage.removeItem(IMPORT_JOB_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const saveSessionJob = useCallback((id: string) => {
    try {
      sessionStorage.setItem(IMPORT_JOB_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const refreshLeadsData = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    void queryClient.invalidateQueries({ queryKey: ["sales", "leads", "stats"] });
    void queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
  }, [queryClient]);

  const pollJob = useCallback(
    async (targetJobId: string) => {
      activePollingRef.current = true;
      while (activePollingRef.current) {
        try {
          const res = await getLeadImportJobStatusProvider(targetJobId);
          if (res.success && res.data) {
            const data = res.data;
            setJobData(data);

            if (data.status === "completed") {
              clearSessionJob();
              activePollingRef.current = false;
              refreshLeadsData();
              return data;
            }

            if (data.status === "failed") {
              clearSessionJob();
              activePollingRef.current = false;
              setError(data.errorMessage || "Lead import job failed.");
              return data;
            }
          }
        } catch (err: unknown) {
          // If 404 or auth error, clear saved jobId
          const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
          if (axiosErr.response?.status === 404) {
            clearSessionJob();
            setJobId(null);
            activePollingRef.current = false;
            setError("Previous import job not found or has expired.");
            return null;
          }
        }

        if (!activePollingRef.current) break;
        await new Promise((r) => setTimeout(r, 2500));
      }
      return null;
    },
    [clearSessionJob, refreshLeadsData]
  );

  // Resume polling on mount if a jobId was stored in sessionStorage
  useEffect(() => {
    if (jobId && !activePollingRef.current) {
      void pollJob(jobId);
    }

    return () => {
      activePollingRef.current = false;
    };
  }, [jobId, pollJob]);

  const startImport = useCallback(
    async (file: File, options?: ImportLeadsFileOptions) => {
      setError(null);
      setSyncData(null);
      setJobData(null);
      setIsUploading(true);

      try {
        const response = await importLeadsFileProvider(file, options);
        setIsUploading(false);

        if (!response.success) {
          throw new Error(response.message || "Failed to start import");
        }

        const data = response.data;

        // Async job (202 or inProgress 200)
        if (data.async && data.jobId) {
          setJobId(data.jobId);
          saveSessionJob(data.jobId);
          setJobData(data);

          if (data.status === "completed") {
            clearSessionJob();
            refreshLeadsData();
            return { mode: "async" as const, data };
          }

          void pollJob(data.jobId);
          return { mode: "async" as const, data };
        }

        // Sync finished (200, row count <= 50)
        setSyncData(data);
        refreshLeadsData();
        return { mode: "sync" as const, data };
      } catch (err: unknown) {
        setIsUploading(false);
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = axiosErr.response?.data?.message || axiosErr.message || "Failed to import leads.";
        setError(msg);
        throw err;
      }
    },
    [clearSessionJob, pollJob, refreshLeadsData, saveSessionJob]
  );

  const resetImport = useCallback(() => {
    activePollingRef.current = false;
    clearSessionJob();
    setJobId(null);
    setJobData(null);
    setSyncData(null);
    setError(null);
    setIsUploading(false);
  }, [clearSessionJob]);

  let status: "idle" | "uploading" | "polling" | "completed" | "failed" = "idle";
  if (isUploading) {
    status = "uploading";
  } else if (jobData) {
    if (jobData.status === "completed") status = "completed";
    else if (jobData.status === "failed") status = "failed";
    else status = "polling";
  } else if (syncData) {
    status = "completed";
  } else if (error) {
    status = "failed";
  }

  return {
    startImport,
    resetImport,
    status,
    isUploading,
    isPolling: status === "polling",
    jobId,
    jobData,
    syncData,
    error,
  };
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

export function useLeadMediaQuery(
  leadId?: string,
  params?: GetLeadMediaParams,
) {
  return useQuery({
    queryKey: ["sales", "leads", leadId, "media", params],
    queryFn: () => {
      if (!leadId) {
        throw new Error("Lead ID is required");
      }
      return getLeadMediaProvider(leadId, params);
    },
    enabled: Boolean(leadId),
  });
}

