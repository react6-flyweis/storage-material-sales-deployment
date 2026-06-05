import { cn } from "@/lib/utils";
import { Phone, Mail, Calendar } from "lucide-react";
import { useDashboardTodayTasksQuery } from "@/lib/metrics";

type Priority = "low" | "medium" | "high";

const formatTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

const getIcon = (mode?: string): "phone" | "mail" | "calendar" => {
  if (!mode) return "phone";
  const m = mode.toLowerCase();
  if (m.includes("email") || m.includes("mail")) return "mail";
  if (m.includes("call") || m.includes("phone")) return "phone";
  if (m.includes("meet") || m.includes("calendar")) return "calendar";
  return "phone";
};

export default function TodaysTask() {
  const { data, isPending } = useDashboardTodayTasksQuery();
  const tasks = data?.followUpsToday ?? [];

  const iconFor = (type: "phone" | "mail" | "calendar") => {
    switch (type) {
      case "phone":
        return <Phone className="w-5 h-5 text-blue-600" />;
      case "mail":
        return <Mail className="w-5 h-5 text-green-600" />;
      case "calendar":
        return <Calendar className="w-5 h-5 text-purple-600" />;
    }
  };

  const pillMap: Record<Priority, string> = {
    high: "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-700",
  };

  if (isPending) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-2xl font-semibold text-gray-900">Today's Task</h3>
        <div className="mt-6 space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-start gap-4 animate-pulse">
              <div className="p-3 rounded-lg bg-gray-100 w-11 h-11" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex gap-3 mt-1">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded-full w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-2xl font-semibold text-gray-900">Today's Task</h3>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-900">No follow-ups for today</p>
          <p className="text-xs text-gray-500 mt-1">You're all caught up with your daily schedule.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-2xl font-semibold text-gray-900">Today's Task</h3>

      <div className="mt-6 space-y-6">
        {tasks.map((task) => {
          const iconType = getIcon(task.modeOfContact);
          const title = `Follow up - ${task.leadId?.projectName || "Lead"}`;
          const subtitle = task.customerId?.firstName;
          const time = formatTime(task.followUpDate);

          return (
            <div key={task._id} className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  iconType === "phone"
                    ? "bg-blue-50"
                    : iconType === "mail"
                      ? "bg-green-50"
                      : "bg-purple-50"
                }`}
              >
                {iconFor(iconType)}
              </div>

              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {title}
                </div>
                {subtitle ? (
                  <div className="text-sm text-gray-500">{subtitle}</div>
                ) : null}
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <div className="text-gray-500">{time}</div>
                  <div
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      pillMap[task.priority] || pillMap.medium,
                    )}
                  >
                    {task.priority} Priority
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
