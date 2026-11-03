import { apiClient } from "@/modules/auth/auth.api";

export type ConstructionTimelineBadge = {
  label: string;
  tone: "success" | "info" | "danger" | "neutral" | "warning" | string;
};

export type ConstructionTaskPerson = {
  _id: string;
  name?: string;
  email?: string;
};

export type ConstructionTaskLead = {
  _id: string;
  projectName?: string;
  jobId?: string;
};

export type ConstructionTaskItem = {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | string;
  priority?: "low" | "medium" | "high" | string;
  dueDate?: string;
  completedAt?: string | null;
  startDate?: string | null;
  estimatedEndDate?: string | null;
  estEndDate?: string | null;
  estDate?: string | null;
  completedDate?: string | null;
  onTimeStatus?: "in_progress" | "on_time" | "delayed" | "overdue" | string | null;
  onTime?: boolean | null;
  daysLateOrEarly?: number;
  timelineBadge?: ConstructionTimelineBadge;
  assignedTo?: ConstructionTaskPerson | string | null;
  createdBy?: ConstructionTaskPerson | string | null;
  leadId?: ConstructionTaskLead | string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
  details?: {
    description?: string;
    team?: string;
    progressPercentage?: number;
    notes?: string;
  };
};

export type ConstructionProjectSummary = {
  leadId: string;
  projectName: string;
  jobId: string;
};

export type ConstructionTaskStats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
};

export type GetProjectConstructionTasksParams = {
  status?: "todo" | "in_progress" | "done" | string;
  priority?: "low" | "medium" | "high" | string;
  assignedTo?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type GetProjectConstructionTasksData = {
  project?: ConstructionProjectSummary;
  constructionTasks?: ConstructionTaskItem[];
  timelineTasks?: ConstructionTaskItem[];
  tasks?: ConstructionTaskItem[];
  total: number;
  stats?: ConstructionTaskStats;
  dataSource?: string;
  scope?: string;
};

export type GetProjectConstructionTasksResponse = {
  success: boolean;
  message?: string;
  data: GetProjectConstructionTasksData;
};

export type GetConstructionTaskDetailResponse = {
  success: boolean;
  message?: string;
  data: {
    task: ConstructionTaskItem;
  };
};

export async function getProjectConstructionTasksProvider(
  leadId: string,
  params?: GetProjectConstructionTasksParams
): Promise<GetProjectConstructionTasksResponse> {
  // 1. Try recommended GET /api/construction/projects/{leadId}/timeline-tasks
  try {
    const response = await apiClient.get<GetProjectConstructionTasksResponse>(
      `/api/construction/projects/${leadId}/timeline-tasks`,
      { params }
    );
    if (response?.data && response.data.success !== false) {
      // Normalize task list in data so consumers always find constructionTasks
      const tasks =
        response.data.data?.timelineTasks ||
        response.data.data?.constructionTasks ||
        response.data.data?.tasks ||
        [];
      return {
        ...response.data,
        data: {
          ...response.data.data,
          constructionTasks: tasks,
          timelineTasks: tasks,
        },
      };
    }
  } catch {
    // If not found (404) or forbidden (403), fallback to sales read-only mirror
  }

  // 2. Fallback to Sales read-only mirror: GET /api/sales/construction/projects/:leadId/construction-tasks
  const response = await apiClient.get<GetProjectConstructionTasksResponse>(
    `/api/sales/construction/projects/${leadId}/construction-tasks`,
    { params }
  );

  const tasks =
    response.data.data?.timelineTasks ||
    response.data.data?.constructionTasks ||
    response.data.data?.tasks ||
    [];

  return {
    ...response.data,
    data: {
      ...response.data.data,
      constructionTasks: tasks,
      timelineTasks: tasks,
    },
  };
}

export async function getConstructionTaskDetailProvider(
  taskId: string
): Promise<GetConstructionTaskDetailResponse> {
  try {
    const response = await apiClient.get<GetConstructionTaskDetailResponse>(
      `/api/construction/tasks/${taskId}`
    );
    return response.data;
  } catch {
    const response = await apiClient.get<GetConstructionTaskDetailResponse>(
      `/api/sales/construction/tasks/${taskId}`
    );
    return response.data;
  }
}
