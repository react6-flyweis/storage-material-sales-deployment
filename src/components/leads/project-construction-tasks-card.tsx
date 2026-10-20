import { useState, useMemo } from "react";
import axios from "axios";
import {
  Eye,
  Calendar,
  Users,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useProjectConstructionTasksQuery,
  useConstructionTaskDetailQuery,
} from "@/modules/construction/construction.hooks";
import {
  type AnyConstructionTask,
  formatConstructionDate,
  getTimelineToneClass,
  getTimelineLabel,
  getPriorityBadgeClass,
} from "@/modules/construction/construction.utils";

export type ConstructionTask = AnyConstructionTask;

type ProjectConstructionTasksCardProps = {
  leadId?: string;
  tasks?: ConstructionTask[];
  className?: string;
  maxHeightClass?: string;
};

export default function ProjectConstructionTasksCard({
  leadId,
  tasks: propTasks,
  className = "",
  maxHeightClass = "max-h-[540px]",
}: ProjectConstructionTasksCardProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskFallback, setSelectedTaskFallback] = useState<ConstructionTask | null>(null);

  // Load from backend when leadId is provided and no static tasks passed
  const shouldFetch = Boolean(leadId) && !propTasks;
  const { data: queryResponse, isLoading, isError, error } = useProjectConstructionTasksQuery(
    leadId,
    undefined,
    shouldFetch
  );

  const { data: taskDetailResponse, isLoading: isLoadingDetail } = useConstructionTaskDetailQuery(
    selectedTaskId ?? undefined,
    Boolean(selectedTaskId)
  );

  const rawTasks: ConstructionTask[] = useMemo(() => {
    if (propTasks) return propTasks;
    if (queryResponse?.data?.constructionTasks) {
      return queryResponse.data.constructionTasks;
    }
    return [];
  }, [propTasks, queryResponse]);

  // Client sort by startDate ascending (as per spec)
  const sortedTasks = useMemo(() => {
    return [...rawTasks].sort((a, b) => {
      const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return timeA - timeB;
    });
  }, [rawTasks]);

  const stats = queryResponse?.data?.stats;

  const handleOpenTask = (task: ConstructionTask) => {
    const taskId = task._id || task.id;
    setSelectedTaskFallback(task);
    if (taskId) {
      setSelectedTaskId(taskId);
    }
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
    setSelectedTaskFallback(null);
  };

  const activeTask: ConstructionTask | null | undefined =
    taskDetailResponse?.data?.task ?? selectedTaskFallback;

  // 1. Loading state
  if (shouldFetch && isLoading) {
    return <ProjectConstructionTasksSkeleton className={className} />;
  }

  // 2. Error handling (404 and 403 access rules)
  if (shouldFetch && isError) {
    const isAxios = axios.isAxiosError(error);
    const status = isAxios ? error.response?.status : null;

    if (status === 404) {
      return (
        <div className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
              Project Construction Task
            </h2>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600">
            <Clock className="h-5 w-5 text-slate-400 shrink-0" />
            <p className="text-sm font-medium">
              Construction tasks available after project is released to plant.
            </p>
          </div>
        </div>
      );
    }

    if (status === 403) {
      return (
        <div className={`rounded-2xl border border-amber-200/90 bg-amber-50/30 p-5 md:p-6 shadow-xs ${className}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
              Project Construction Task
            </h2>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm font-medium">
              Lead is not assigned to this sales user.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
            Project Construction Task
          </h2>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm">
            Failed to load construction tasks. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // 3. Empty state
  if (sortedTasks.length === 0) {
    return (
      <div className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
            Project Construction Task
          </h2>
        </div>
        <div className="text-center py-8 text-slate-400 text-sm">
          No construction tasks found for this project.
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
              Project Construction Task
            </h2>
            {stats && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Total: {stats.total}
                </span>
                {stats.inProgress > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                    In Progress: {stats.inProgress}
                  </span>
                )}
                {stats.done > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">
                    Done: {stats.done}
                  </span>
                )}
                {stats.overdue > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-100">
                    Overdue: {stats.overdue}
                  </span>
                )}
              </div>
            )}
          </div>

          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
            {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <div className={`overflow-y-auto thin-scrollbar pr-1.5 -mr-1.5 ${maxHeightClass}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedTasks.map((task) => {
              const taskId = task._id || task.id || task.title;
              const toneClass = getTimelineToneClass(
                task.timelineBadge?.tone,
                task.status
              );
              const statusLabel = getTimelineLabel(task);
              const estDateVal =
                task.estimatedEndDate || task.estEndDate || task.dueDate || task.estDate;

              return (
                <div
                  key={taskId}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-200"
                >
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0F172A] leading-snug min-h-10.5">
                      {task.title}
                    </h3>

                    <div className="space-y-1 text-[13px] text-slate-500 my-4">
                      <p>
                        <span className="text-slate-500">Start: </span>
                        <span className="text-slate-600 font-medium">
                          {formatConstructionDate(task.startDate)}
                        </span>
                      </p>
                      {estDateVal && (
                        <p>
                          <span className="text-slate-500">Est End: </span>
                          <span className="text-slate-600 font-medium">
                            {formatConstructionDate(estDateVal)}
                          </span>
                        </p>
                      )}
                      {task.completedDate && (
                        <p>
                          <span className="text-slate-500">Completed: </span>
                          <span className="text-slate-600 font-medium">
                            {formatConstructionDate(task.completedDate)}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold text-white ${toneClass}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleOpenTask(task)}
                      className="inline-flex items-center justify-center h-8 w-10 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      title={`View details for ${task.title}`}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View task details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Details Dialog */}
      <Dialog
        open={Boolean(selectedTaskId || selectedTaskFallback)}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCloseModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 pr-6">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {activeTask?.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Construction task milestone details and current status
                </DialogDescription>
              </div>
              {isLoadingDetail && (
                <Loader2 className="h-4 w-4 text-slate-400 animate-spin shrink-0 mt-1" />
              )}
            </div>
          </DialogHeader>

          {activeTask && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold text-white ${getTimelineToneClass(
                    activeTask.timelineBadge?.tone,
                    activeTask.status
                  )}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                  {getTimelineLabel(activeTask)}
                </span>

                {activeTask.priority && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium border capitalize ${getPriorityBadgeClass(
                      activeTask.priority
                    )}`}
                  >
                    Priority: {activeTask.priority}
                  </span>
                )}
              </div>

              {activeTask.details?.progressPercentage !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Progress</span>
                    <span className="text-slate-800 font-semibold">
                      {activeTask.details.progressPercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        activeTask.details.progressPercentage === 100
                          ? "bg-green-600"
                          : getTimelineToneClass(
                              activeTask.timelineBadge?.tone,
                              activeTask.status
                            )
                      }`}
                      style={{ width: `${activeTask.details.progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500">Start Date:</span>
                  <span className="font-semibold text-slate-800">
                    {formatConstructionDate(activeTask.startDate)}
                  </span>
                </div>
                {(activeTask.estimatedEndDate ||
                  activeTask.estEndDate ||
                  activeTask.dueDate ||
                  activeTask.estDate) && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">Estimated End:</span>
                    <span className="font-semibold text-slate-800">
                      {formatConstructionDate(
                        activeTask.estimatedEndDate ||
                          activeTask.estEndDate ||
                          activeTask.dueDate ||
                          activeTask.estDate
                      )}
                    </span>
                  </div>
                )}
                {activeTask.completedDate && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="text-slate-500">Completed On:</span>
                    <span className="font-semibold text-slate-800">
                      {formatConstructionDate(activeTask.completedDate)}
                    </span>
                  </div>
                )}
              </div>

              {(activeTask.assignedTo || activeTask.details?.team) && (
                <div className="flex items-start gap-2 text-xs">
                  <Users className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500">Assigned To: </span>
                    <span className="font-medium text-slate-800">
                      {activeTask.assignedTo?.name ||
                        activeTask.assignedTo?.email ||
                        activeTask.details?.team}
                    </span>
                  </div>
                </div>
              )}

              {activeTask.createdBy && (
                <div className="flex items-start gap-2 text-xs">
                  <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500">Created By: </span>
                    <span className="font-medium text-slate-800">
                      {activeTask.createdBy.name || activeTask.createdBy.email}
                    </span>
                  </div>
                </div>
              )}

              {(activeTask.description || activeTask.details?.description) && (
                <div className="flex items-start gap-2 text-xs">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block mb-0.5">Description:</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {activeTask.description || activeTask.details?.description}
                    </p>
                  </div>
                </div>
              )}

              {activeTask.details?.notes && (
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-3 text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5">Site Notes:</span>
                  <p className="leading-relaxed">{activeTask.details.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProjectConstructionTasksSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-52 rounded bg-slate-200 animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/90 bg-white p-4.5 flex flex-col justify-between shadow-xs animate-pulse"
          >
            <div>
              <div className="h-5 w-3/4 rounded bg-slate-200 mb-2" />
              <div className="h-4 w-1/2 rounded bg-slate-200 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                <div className="h-3.5 w-1/2 rounded bg-slate-100" />
              </div>
              <div className="h-6 w-24 rounded bg-slate-200" />
            </div>
            <div className="pt-4">
              <div className="h-8 w-10 rounded-lg bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
