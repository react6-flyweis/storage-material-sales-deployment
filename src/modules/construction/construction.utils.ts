export type AnyConstructionTask = {
  _id?: string;
  id?: string;
  title?: string;
  status?: string | { label?: string; bgClass?: string } | null;
  timelineBadge?: { label?: string; tone?: string } | null;
  startDate?: string | null;
  estimatedEndDate?: string | null;
  estEndDate?: string | null;
  estDate?: string | null;
  dueDate?: string | null;
  completedDate?: string | null;
  completedAt?: string | null;
  onTimeStatus?: "in_progress" | "on_time" | "delayed" | "overdue" | string | null;
  onTime?: boolean | null;
  daysLateOrEarly?: number;
  priority?: string | null;
  assignedTo?: { _id?: string; name?: string; email?: string } | string | null;
  createdBy?: { _id?: string; name?: string; email?: string } | string | null;
  description?: string | null;
  attachments?: string[];
  details?: {
    description?: string;
    team?: string;
    progressPercentage?: number;
    notes?: string;
  };
};

export function formatConstructionDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getTimelineToneClass(
  tone?: string | null,
  status?: string | { label?: string; bgClass?: string } | null
): string {
  if (status && typeof status === "object" && status.bgClass) {
    return status.bgClass;
  }
  const normalizedTone = tone?.toLowerCase().trim();
  if (normalizedTone === "success") return "bg-[#16A34A]";
  if (normalizedTone === "info") return "bg-[#4379EE]";
  if (normalizedTone === "danger") return "bg-[#DC2626]";
  if (normalizedTone === "neutral") return "bg-slate-500";
  if (normalizedTone === "warning") return "bg-[#D97706]";

  // Fallback based on status string
  const normalizedStatus = typeof status === "string" ? status.toLowerCase().trim() : "";
  if (normalizedStatus === "done") return "bg-[#16A34A]";
  if (normalizedStatus === "in_progress") return "bg-[#4379EE]";
  if (normalizedStatus === "overdue" || normalizedStatus === "delayed") return "bg-[#DC2626]";
  return "bg-slate-500";
}

export function getTimelineLabel(task: AnyConstructionTask): string {
  if (task.timelineBadge?.label) return task.timelineBadge.label;
  if (task.status && typeof task.status === "object" && task.status.label) {
    return task.status.label;
  }
  if (typeof task.status === "string" && task.status) {
    if (task.status === "in_progress") return "In Progress";
    if (task.status === "done") return "Done";
    if (task.status === "todo") return "To Do";
    return task.status.replace(/_/g, " ");
  }
  return "Pending";
}

export function getPriorityBadgeClass(priority?: string | null): string {
  const norm = priority?.toLowerCase().trim();
  if (norm === "high") return "bg-red-50 text-red-700 border-red-200";
  if (norm === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  if (norm === "low") return "bg-green-50 text-green-700 border-green-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}
