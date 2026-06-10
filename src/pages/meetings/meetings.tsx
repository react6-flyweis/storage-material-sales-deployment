import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Calendar, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
// import { getApiErrorMessage } from "@/lib/api-error";
import { useMeetingsQuery } from "@/modules/meetings/meetings.hooks";
import type { Meeting as ApiMeeting } from "@/modules/meetings/meetings.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Meeting {
  id: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  type: "Online" | "In-person";
  status: "Scheduled" | "Cancelled" | "Completed";
  rawMeeting?: ApiMeeting;
}

function getMeetingUserDisplayName(
  user: ApiMeeting["assignedTo"] | ApiMeeting["createdBy"],
): string {
  if (!user) {
    return "";
  }

  if (typeof user === "string") {
    return user;
  }

  return user.name || user.firstName || user.email || "";
}

function mapApiMeetingToUI(apiMeeting: ApiMeeting): Meeting {
  const dateObject = new Date(apiMeeting.meetingTime);
  const hasValidDate = !Number.isNaN(dateObject.getTime());

  const status = apiMeeting.status?.toLowerCase();
  let formattedStatus: Meeting["status"] = "Scheduled";
  if (status === "completed") {
    formattedStatus = "Completed";
  } else if (status === "cancelled") {
    formattedStatus = "Cancelled";
  }

  return {
    id: apiMeeting._id,
    title: apiMeeting.title || "Untitled meeting",
    organizer:
      getMeetingUserDisplayName(apiMeeting.leadId) ||
      "Unassigned",
    date: hasValidDate
      ? dateObject.toLocaleDateString("en-CA")
      : apiMeeting.meetingTime,
    time: hasValidDate
      ? dateObject.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "",
    type: apiMeeting.mode === "online" ? "Online" : "In-person",
    status: formattedStatus,
    rawMeeting: apiMeeting,
  };
}

export default function Meetings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    data: meetingsResponse,
    isLoading,
    // error,
    // refetch,
  } = useMeetingsQuery();

  const meetings = useMemo(() => {
    const responseData = meetingsResponse?.data;
    if (!responseData) {
      return [];
    }

    const apiMeetings = Array.isArray(responseData.meetings)
      ? responseData.meetings
      : responseData.meeting
        ? [responseData.meeting]
        : [];

    return apiMeetings.map(mapApiMeetingToUI).sort((a, b) => {
      const aDateTime = `${a.date} ${a.time}`;
      const bDateTime = `${b.date} ${b.time}`;
      return aDateTime.localeCompare(bDateTime);
    });
  }, [meetingsResponse]);

  const filteredMeetings = meetings.filter((meeting) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      meeting.title.toLowerCase().includes(q) ||
      meeting.organizer.toLowerCase().includes(q) ||
      meeting.date.toLowerCase().includes(q) ||
      meeting.time.toLowerCase().includes(q) ||
      meeting.type.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" ||
      meeting.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Meeting["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "Cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Meetings</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-5 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row flex-1 gap-4 w-full">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700 mt-3 sm:mt-0 w-full sm:w-auto"
          onClick={() => navigate("/meetings/schedule")}
        >
          Schedule meeting
        </Button>
      </div>

      {/* {isError ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {getApiErrorMessage(error, "Unable to load meetings.")}
          </p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : null} */}

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={`meeting-skeleton-${index}`}
              className="p-4 gap-2 bg-[#F9FAFB] shadow border-0 ring-0"
            >
              <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-8 w-full rounded bg-gray-200 animate-pulse mt-2" />
            </Card>
          ))
          : filteredMeetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="p-4 gap-2  bg-[#F9FAFB] shadow border-0 ring-0"
            >
              {/* Header with title and status */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {meeting.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {meeting.organizer}
                  </p>
                </div>
                <Badge className={getStatusColor(meeting.status)}>
                  {meeting.status}
                </Badge>
              </div>

              {/* Meeting Details */}
              <div className="flex items-center gap-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{meeting.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Video className="h-4 w-4" />
                  <span>{meeting.type}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                {meeting.status !== "Completed" && (
                  <Button
                    size="sm"
                    className="w-full sm:flex-1 bg-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    onClick={() =>
                      navigate(`/meetings/reschedule/${meeting.id}`, {
                        state: { meeting },
                      })
                    }
                  >
                    Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  className="w-full sm:flex-1 bg-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                  onClick={() =>
                    navigate(`/meetings/reschedule/${meeting.id}`, {
                      state: { meeting },
                    })
                  }
                >
                  Reschedule meeting
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {/* Empty State */}
      {/* {!isLoading && !isError && filteredMeetings.length === 0 && ( */}
      {!isLoading && filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No meetings found</p>
        </div>
      )}
    </div>
  );
}
