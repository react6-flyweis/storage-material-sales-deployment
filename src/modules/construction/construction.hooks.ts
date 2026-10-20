import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  getProjectConstructionTasksProvider,
  getConstructionTaskDetailProvider,
  type GetProjectConstructionTasksParams,
} from "./construction.api";

export function useProjectConstructionTasksQuery(
  leadId?: string,
  params?: GetProjectConstructionTasksParams,
  enabled = true
) {
  return useQuery({
    queryKey: ["sales", "construction", "projects", leadId, "tasks", params],
    queryFn: () => getProjectConstructionTasksProvider(leadId!, params),
    enabled: Boolean(leadId) && enabled,
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 403)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useConstructionTaskDetailQuery(
  taskId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["sales", "construction", "tasks", taskId],
    queryFn: () => getConstructionTaskDetailProvider(taskId!),
    enabled: Boolean(taskId) && enabled,
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 403)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
