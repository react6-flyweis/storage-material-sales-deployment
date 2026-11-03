import { useState, useMemo } from "react";
import axios from "axios";
import { Eye, Clock, AlertCircle, ImageIcon, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useProjectConstructionTasksQuery,
  useConstructionTaskDetailQuery,
} from "@/modules/construction/construction.hooks";
import { useLeadMediaQuery } from "@/modules/leads/leads.hooks";
import {
  type AnyConstructionTask,
  formatConstructionDate,
  getTimelineToneClass,
  getTimelineLabel,
} from "@/modules/construction/construction.utils";

export type ConstructionTask = AnyConstructionTask;

type ProjectConstructionTasksCardProps = {
  leadId?: string;
  tasks?: ConstructionTask[];
  className?: string;
  maxHeightClass?: string;
};

function getModalStatusDisplay(task?: ConstructionTask | null) {
  if (!task) return { text: "—", className: "text-slate-700" };

  const days = task.daysLateOrEarly;
  const onTime = task.onTimeStatus?.toLowerCase().trim();
  const statusStr =
    typeof task.status === "string" ? task.status.toLowerCase().trim() : "";

  // 1. If days late > 0
  if (days !== undefined && days !== null && days > 0) {
    return {
      text: `${days} Day${days > 1 ? "s" : ""} Delayed`,
      className: "text-red-600 font-semibold",
    };
  }

  // 2. Delayed or overdue
  if (onTime === "delayed" || onTime === "overdue" || statusStr === "overdue") {
    return {
      text: "Delayed",
      className: "text-red-600 font-semibold",
    };
  }

  // 3. Completed
  if (
    statusStr === "done" ||
    statusStr === "completed" ||
    Boolean(task.completedDate)
  ) {
    return {
      text: "Completed",
      className: "text-green-600 font-semibold",
    };
  }

  // 4. On time
  if (onTime === "on_time") {
    return {
      text: "On Time",
      className: "text-green-600 font-semibold",
    };
  }

  // 5. Timeline badge label
  if (task.timelineBadge?.label) {
    const tone = task.timelineBadge.tone?.toLowerCase().trim();
    const colorClass =
      tone === "danger"
        ? "text-red-600 font-semibold"
        : tone === "success"
          ? "text-green-600 font-semibold"
          : "text-[#1D51A4] font-semibold";
    return {
      text: task.timelineBadge.label,
      className: colorClass,
    };
  }

  if (statusStr === "in_progress") {
    return {
      text: "In Progress",
      className: "text-[#1D51A4] font-semibold",
    };
  }

  return {
    text: getTimelineLabel(task),
    className: "text-[#1D51A4] font-semibold",
  };
}

export default function ProjectConstructionTasksCard({
  leadId,
  tasks: propTasks,
  className = "",
  maxHeightClass = "max-h-[540px]",
}: ProjectConstructionTasksCardProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskFallback, setSelectedTaskFallback] =
    useState<ConstructionTask | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Load from backend when leadId is provided and no static tasks passed
  const shouldFetch = Boolean(leadId) && !propTasks;
  const {
    data: queryResponse,
    isLoading,
    isError,
    error,
  } = useProjectConstructionTasksQuery(leadId, undefined, shouldFetch);

  const { data: taskDetailResponse } = useConstructionTaskDetailQuery(
    selectedTaskId ?? undefined,
    Boolean(selectedTaskId),
  );

  // Load project media as fallback photos for task detail modal
  const { data: mediaResponse } = useLeadMediaQuery(leadId || "");
  const projectPhotos = useMemo(() => {
    return (mediaResponse?.data?.photos ?? [])
      .map((p) => p.url)
      .filter(Boolean);
  }, [mediaResponse]);

  const rawTasks: ConstructionTask[] = useMemo(() => {
    if (propTasks) return propTasks;
    const data = queryResponse?.data;
    if (!data) return [];
    if (Array.isArray(data.timelineTasks)) return data.timelineTasks;
    if (Array.isArray(data.constructionTasks)) return data.constructionTasks;
    if (Array.isArray(data.tasks)) return data.tasks;
    return [];
  }, [propTasks, queryResponse]);

  // Client sort by startDate ascending
  const sortedTasks = useMemo(() => {
    return [...rawTasks].sort((a, b) => {
      const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return timeA - timeB;
    });
  }, [rawTasks]);

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

  const statusDisplay = getModalStatusDisplay(activeTask);

  const displayPhotos: string[] = useMemo(() => {
    const taskAttachments = (activeTask?.attachments ?? []).filter(
      (item): item is string => typeof item === "string" && Boolean(item),
    );
    if (taskAttachments.length > 0) {
      return taskAttachments;
    }
    return projectPhotos;
  }, [activeTask, projectPhotos]);

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
        <div
          className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
              Project Construction Tasks
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
        <div
          className={`rounded-2xl border border-amber-200/90 bg-amber-50/30 p-5 md:p-6 shadow-xs ${className}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
              Project Construction Tasks
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
      <div
        className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
            Project Construction Tasks
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
      <div
        className={`rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
            Project Construction Tasks
          </h2>
        </div>
        <div className="text-center py-8 text-slate-500 text-sm space-y-1">
          <p className="font-medium text-slate-700">
            No construction tasks scheduled yet
          </p>
          <p className="text-xs text-slate-400">
            Tasks will appear here once created and scheduled by the
            construction team.
          </p>
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
          <h2 className="text-[17px] font-bold text-[#0B192C] tracking-tight">
            Project Construction Tasks
          </h2>

          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
            {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <div
          className={`overflow-y-auto thin-scrollbar pr-1.5 -mr-1.5 ${maxHeightClass}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedTasks.map((task) => {
              const taskId = task._id || task.id || task.title;
              const toneClass = getTimelineToneClass(
                task.timelineBadge?.tone,
                task.status,
              );
              const statusLabel = getTimelineLabel(task);
              const estDateVal =
                task.estimatedEndDate ||
                task.estEndDate ||
                task.dueDate ||
                task.estDate;

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

      {/* Task Details Dialog (Exact UI as per user design) */}
      <Dialog
        open={Boolean(selectedTaskId || selectedTaskFallback)}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCloseModal();
        }}
      >
        <DialogContent className="sm:max-w-2xl p-5 md:p-6 rounded-2xl bg-white shadow-xl space-y-4">
          <DialogHeader className="p-0 space-y-0">
            <DialogTitle className="text-xl md:text-[22px] font-bold text-[#0B192C] tracking-tight">
              {activeTask?.title}
            </DialogTitle>
          </DialogHeader>

          {activeTask && (
            <div className="space-y-4 pt-0.5">
              {/* Top 4-Column Metric Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#EEF4FB] rounded-xl p-3 md:p-3.5">
                {/* 1. Start Date */}
                <div className="md:border-r border-slate-200/90 md:pr-3 space-y-0.5">
                  <p className="text-xs text-slate-500 font-normal">
                    Start Date
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-[#1D51A4]">
                    {formatConstructionDate(activeTask.startDate)}
                  </p>
                </div>

                {/* 2. Est Date */}
                <div className="md:border-r border-slate-200/90 md:px-3 space-y-0.5">
                  <p className="text-xs text-slate-500 font-normal">Est Date</p>
                  <p className="text-xs md:text-sm font-semibold text-[#1D51A4]">
                    {formatConstructionDate(
                      activeTask.estimatedEndDate ||
                        activeTask.estEndDate ||
                        activeTask.dueDate ||
                        activeTask.estDate,
                    )}
                  </p>
                </div>

                {/* 3. Completed Date */}
                <div className="md:border-r border-slate-200/90 md:px-3 space-y-0.5">
                  <p className="text-xs text-slate-500 font-normal">
                    Completed Date
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-[#1D51A4]">
                    {activeTask.completedDate
                      ? formatConstructionDate(activeTask.completedDate)
                      : "-"}
                  </p>
                </div>

                {/* 4. Status */}
                <div className="md:pl-3 space-y-0.5">
                  <p className="text-xs text-slate-500 font-normal">Status</p>
                  <p
                    className={`text-xs md:text-sm ${statusDisplay.className}`}
                  >
                    {statusDisplay.text}
                  </p>
                </div>
              </div>

              {/* Work Description Box */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 md:p-4 min-h-[90px] md:min-h-[100px]">
                <p className="text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeTask.description ||
                    activeTask.details?.description ||
                    "Work Description"}
                </p>
              </div>

              {/* Photos Section */}
              <div className="space-y-2 pt-0.5">
                <h4 className="text-sm font-semibold text-slate-900">Photos</h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  {displayPhotos.slice(0, 4).map((photoUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewPhotoUrl(photoUrl)}
                      className="block h-16 w-24 md:h-18 md:w-28 rounded-lg overflow-hidden border border-slate-200 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                      title="Click to preview image"
                    >
                      <img
                        src={photoUrl}
                        alt={`Photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-3 rounded-lg border border-[#1D51A4] text-[#1D51A4] hover:bg-blue-50 font-medium text-xs md:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    onClick={() => {
                      if (displayPhotos.length > 0) {
                        setPreviewPhotoUrl(displayPhotos[0]);
                      }
                    }}
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-[#1D51A4]" />
                    View All Media
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Lightbox */}
      <Dialog
        open={Boolean(previewPhotoUrl)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreviewPhotoUrl(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl p-4 bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-800">
              Photo Preview
            </DialogTitle>
          </DialogHeader>
          {previewPhotoUrl && (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-[70vh] flex items-center justify-center bg-slate-950">
                <img
                  src={previewPhotoUrl}
                  alt="Construction photo"
                  className="max-h-[68vh] w-auto object-contain"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => window.open(previewPhotoUrl, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProjectConstructionTasksSkeleton({
  className = "",
}: {
  className?: string;
}) {
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
