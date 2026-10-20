import { apiClient } from "@/modules/auth/auth.api";

export type ConstructionTimelineBadge = {
  label: string;
  tone: "success" | "info" | "danger" | "neutral" | string;
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
  timelineBadge?: ConstructionTimelineBadge;
  assignedTo?: ConstructionTaskPerson | null;
  createdBy?: ConstructionTaskPerson | null;
  leadId?: ConstructionTaskLead | string;
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
  constructionTasks: ConstructionTaskItem[];
  total: number;
  stats?: ConstructionTaskStats;
  scope?: string;
};

export type GetProjectConstructionTasksResponse = {
  success: boolean;
  message: string;
  data: GetProjectConstructionTasksData;
};

export type GetConstructionTaskDetailResponse = {
  success: boolean;
  message: string;
  data: {
    task: ConstructionTaskItem;
  };
};

export async function getProjectConstructionTasksProvider(
  leadId: string,
  params?: GetProjectConstructionTasksParams
): Promise<GetProjectConstructionTasksResponse> {
  const response = await apiClient.get<GetProjectConstructionTasksResponse>(
    `/api/sales/construction/projects/${leadId}/construction-tasks`,
    { params }
  );
  return response.data;
}

export async function getConstructionTaskDetailProvider(
  taskId: string
): Promise<GetConstructionTaskDetailResponse> {
  const response = await apiClient.get<GetConstructionTaskDetailResponse>(
    `/api/sales/construction/tasks/${taskId}`
  );
  return response.data;
}
