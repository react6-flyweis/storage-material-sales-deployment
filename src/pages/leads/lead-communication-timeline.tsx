import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Loader2, Mail, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunicationTimelineQuery } from "@/modules/followups/followups.hooks";

interface CommunicationItem {
  id: string;
  leadId: string;
  clientName: string;
  projectName: string;
  message: string;
  contactPerson: string;
  createdAt: string;
  timestamp: string;
  activityType: string;
  outcome: string;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatActivityType = (value?: string | null) => {
  if (!value) return "Activity";

  return value
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const parseInputDate = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const dashParts = trimmed.split("-");

  if (dashParts.length === 3) {
    if (dashParts[0].length === 4) {
      return new Date(trimmed);
    }

    const [day, month, year] = dashParts;
    return new Date(`${year}-${month}-${day}`);
  }

  const parsedDate = new Date(trimmed);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export default function LeadCommunicationTimeline() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activityType, setActivityType] = useState("all");
  const [searchClient, setSearchClient] = useState("");

  const { data, isLoading, isError, refetch } = useCommunicationTimelineQuery(
    1,
    20,
  );

  const communicationItems = useMemo<CommunicationItem[]>(() => {
    const entries = data?.data.entries ?? [];

    return entries.map((entry) => ({
      id: entry._id,
      leadId: entry.leadId?._id ?? entry._id,
      clientName: entry.customerId?.firstName?.trim() || "Unknown client",
      projectName: entry.leadId?.projectName?.trim() || "No project name",
      message: entry.metadata?.notes?.trim() || "No notes provided.",
      contactPerson: entry.performedBy?.name?.trim() || "Unknown user",
      createdAt: entry.createdAt,
      timestamp: formatDateTime(entry.createdAt),
      activityType: entry.metadata?.activityType?.trim() || "activity",
      outcome: entry.metadata?.outcome?.trim() || "",
    }));
  }, [data]);

  const filteredCommunicationItems = useMemo(() => {
    const from = parseInputDate(dateFrom);
    const to = parseInputDate(dateTo);

    return communicationItems.filter((item) => {
      if (activityType && activityType !== "all") {
        if (item.activityType.toLowerCase() !== activityType) {
          return false;
        }
      }

      if (searchClient.trim()) {
        const needle = searchClient.trim().toLowerCase();
        const haystack = [
          item.clientName,
          item.projectName,
          item.contactPerson,
          item.message,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(needle)) return false;
      }

      const itemDate = new Date(item.createdAt);

      if (Number.isNaN(itemDate.getTime())) {
        return true;
      }

      if (from && itemDate) {
        if (itemDate < from) return false;
      }
      if (to && itemDate) {
        const endOfTo = new Date(to);
        endOfTo.setHours(23, 59, 59, 999);
        if (itemDate > endOfTo) return false;
      }

      return true;
    });
  }, [activityType, communicationItems, dateFrom, dateTo, searchClient]);

  const isInitialLoading = isLoading && communicationItems.length === 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-[#4ECDC4] text-white px-6 py-3 flex items-center gap-4">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Lead Communication Timeline</h2>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      </div>

      <div className="p-5">
        {/* Filters */}

        <div className="bg-white p-4 rounded-md grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <Input
              type="text"
              placeholder="dd-mm-yyyy"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <Input
              type="text"
              placeholder="dd-mm-yyyy"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type
            </label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <Input
              type="text"
              placeholder="Search client..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Timeline Grid - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isError ? (
            <div className="col-span-1 md:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center">
              <p className="text-sm text-red-700">
                Failed to load communication timeline.
              </p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          ) : isInitialLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={`timeline-skeleton-${index}`}
                className="py-0 rounded-md ring-0 border border-slate-100"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
                  <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredCommunicationItems.length === 0 ? (
            <div className="col-span-1 md:col-span-2 text-center text-sm text-gray-500 py-8">
              No communication items found.
            </div>
          ) : (
            filteredCommunicationItems.map((item) => (
              <Card
                key={item.id}
                className="py-0 rounded-md ring-0 border-none cursor-pointer hover:shadow-lg transition-shadow"
              // onClick={() => navigate(`/leads/${item.leadId}/timeline`)}
              >
                <CardContent className="p-4">
                  {/* Client Name */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.clientName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.projectName}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                      {formatActivityType(item.activityType)}
                    </span>
                  </div>

                  {/* Message with Icon */}
                  <div className="flex items-start gap-2 mb-3">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Contact Person and Timestamp */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{item.contactPerson}</span>
                    </div>
                    <span>{item.timestamp}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
