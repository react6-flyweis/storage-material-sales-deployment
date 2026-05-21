import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  List,
  PlusIcon,
  Phone,
  Mail,
  Clock,
  Building,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUpcomingFollowUpsQuery,
  useCompleteFollowUpMutation,
} from "@/modules/followups/followups.hooks";
import SuccessDialog from "@/components/success-dialog";
import { useEffect } from "react";
import type { UpcomingFollowUpItem } from "@/modules/followups/followups.api";

type ViewMode = "schedule" | "calendar" | "list";

interface FollowUp {
  id: string;
  date: string;
  customer: string;
  type: string;
  time?: string;
  company?: string;
  status?: "overdue" | "upcoming" | "normal";
  fullDate?: string;
}

type Props = {
  onScheduleFollowUp?: (date?: string | null) => void;
};

const formatDateForInput = (day: number) => {
  const today = new Date();
  const candidate = new Date(today.getFullYear(), today.getMonth(), day);

  const year = candidate.getFullYear();
  const month = String(candidate.getMonth() + 1).padStart(2, "0");
  const date = String(candidate.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

export default function UpcomingFollowUps({ onScheduleFollowUp }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { data: response, isLoading } = useUpcomingFollowUpsQuery();
  const apiFollowUps = response?.success ? response.data.followups : [];

  const completeFollowUp = useCompleteFollowUpMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (completeFollowUp.isSuccess) {
      setShowSuccess(true);
      completeFollowUp.reset();
    }
  }, [completeFollowUp, completeFollowUp.isSuccess]);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const apiToFollowUp = (f: UpcomingFollowUpItem, index: number): FollowUp => {
    const dateObj = new Date(f.followUpDate);
    const day = String(dateObj.getDate());
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const customer = f.leadId?.projectName || "N/A";
    const type =
      f.modeOfContact === "call"
        ? "Call"
        : f.modeOfContact === "email"
          ? "Email"
          : "Meeting";
    const company = f.leadId?.jobId || f.leadId?.projectName || "";
    const status = (() => {
      if (f.status === "completed") return "normal";
      const now = new Date();
      const d = new Date(f.followUpDate);
      return d < now ? "overdue" : "upcoming";
    })();

    return {
      id: f._id || String(index),
      date: day,
      fullDate: f.followUpDate,
      customer,
      type,
      time,
      company,
      status,
    };
  };

  const mappedFollowUps = apiFollowUps.map(apiToFollowUp);

  // Sort follow-ups by date (soonest first) and prepare helpers
  const sortedFollowUps = mappedFollowUps
    .slice()
    .sort(
      (a, b) =>
        new Date(a.fullDate || a.date).getTime() -
        new Date(b.fullDate || b.date).getTime(),
    );

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const getFollowUpForDay = (day: number) =>
    sortedFollowUps.filter((f) => parseInt(f.date) === day);

  const filteredFollowUps = selectedDay
    ? sortedFollowUps.filter((f) => parseInt(f.date) === selectedDay)
    : sortedFollowUps;

  // Only show the recent 4 when not viewing a specific day
  const displayFollowUps = selectedDay
    ? filteredFollowUps
    : filteredFollowUps.slice(0, 4);

  return (
    <Card className="p-6">
      <div className="flex flex-col   justify-between mb-4 gap-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex gap-2">
            <span className="text-xl">📅</span>
            <h2 className="text-lg font-semibold">Upcoming Follow-Ups</h2>
          </div>
          <Button
            size="sm"
            className="mr-2"
            onClick={() => onScheduleFollowUp?.(null)}
          >
            <PlusIcon />
            Schedule
          </Button>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-md p-1">
          <Button
            size="sm"
            variant={viewMode === "calendar" ? "default" : "ghost"}
            onClick={() => {
              setViewMode("calendar");
              setSelectedDay(null);
            }}
            className={cn(
              "flex-1 px-3 h-8 text-xs",
              viewMode === "calendar"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-transparent text-gray-600 hover:bg-gray-200",
            )}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Calendar
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => {
              setViewMode("list");
              setSelectedDay(null);
            }}
            className={cn(
              "flex-1 px-3 h-8 text-xs",
              viewMode === "list"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-transparent text-gray-600 hover:bg-gray-200",
            )}
          >
            <List className="w-3 h-3 mr-1" />
            List
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-500 ">
        Quick view of scheduled activities
      </p>

      {isLoading && (
        <div className="p-4 text-center text-sm text-gray-500">
          Loading follow-ups...
        </div>
      )}

      {viewMode === "calendar" && (
        <div className="space-y-4">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const followUps = getFollowUpForDay(day);
              const hasFollowUp = followUps.length > 0;
              const isOverdue =
                hasFollowUp && followUps.some((f) => f.status === "overdue");

              const candidateDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                day,
              );
              const isPast = candidateDate < startOfToday;
              const isToday =
                candidateDate.getTime() === startOfToday.getTime();

              return (
                <div
                  key={day}
                  onClick={() => {
                    if (isPast) return; // disable interactions for past dates

                    if (!hasFollowUp) {
                      onScheduleFollowUp?.(formatDateForInput(day));
                      return;
                    }

                    setSelectedDay(day);
                    setViewMode("list");
                  }}
                  aria-disabled={isPast}
                  className={cn(
                    "aspect-square border rounded-md flex flex-col items-center justify-center p-1 text-sm relative",
                    // pointer cursor only when not past
                    !isPast && "cursor-pointer",
                    isToday && "bg-blue-600 text-white font-bold",
                    selectedDay === day && !isPast && "ring-2 ring-blue-400",
                    hasFollowUp && !isToday && "border-red-400",
                    !hasFollowUp && !isToday && "text-gray-700",
                    isPast && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <span className="text-xs">{day}</span>
                  {hasFollowUp && !isToday && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold",
                        isOverdue ? "text-red-500" : "text-orange-500",
                      )}
                    >
                      {day}+
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-2">
          {selectedDay && (
            <p className="text-sm text-gray-600">
              Showing follow-ups for {selectedDay}
            </p>
          )}

          {filteredFollowUps.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No follow-ups for this date
            </div>
          ) : (
            displayFollowUps.map((followUp) => {
              const isOverdue = followUp.status === "overdue";
              const isUpcoming = followUp.status === "upcoming";

              const bgClass = isOverdue
                ? "bg-rose-100 border-rose-200"
                : isUpcoming
                  ? "bg-amber-100 border-amber-200"
                  : "bg-rose-50 border-rose-100";

              const Icon = (() => {
                switch (followUp.type) {
                  case "Call":
                    return <Phone className="w-5 h-5 text-gray-700" />;
                  case "Email":
                    return <Mail className="w-5 h-5 text-gray-700" />;
                  case "Meeting":
                  default:
                    return <Calendar className="w-5 h-5 text-gray-700" />;
                }
              })();

              const formattedDate = followUp.fullDate
                ? new Date(followUp.fullDate).toLocaleDateString()
                : followUp.date;

              return (
                <div
                  key={followUp.id}
                  className={cn(
                    "w-full p-4 rounded-md flex items-center justify-between",
                    "border",
                    "hover:shadow-sm",
                    bgClass,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-white/70">{Icon}</div>
                    <div>
                      <p className="font-semibold text-sm">
                        {followUp.customer}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {followUp.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" /> {followUp.company}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-500">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => completeFollowUp.mutate(followUp.id)}
                      disabled={completeFollowUp.isPending}
                    >
                      <Check className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Follow-up marked completed"
        okLabel="Great"
      />
    </Card>
  );
}
