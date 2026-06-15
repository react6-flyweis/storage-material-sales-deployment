import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  LeadDetailAuditEntry,
  LeadDetailFollowUp,
} from "@/modules/leads/leads.api";
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  PlusIcon,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useCompleteFollowUpMutation } from "@/modules/followups/followups.hooks";
import SuccessDialog from "@/components/success-dialog";
import { useParams, Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import AddFollowUpDialog from "@/components/follow-up/add-follow-up-dialog";
import {
  formatAuditAction,
  getAuditPerformedBy,
  getAuditTypeLabel,
  splitLeadDateTime,
} from "@/modules/leads/leads.utils";

type FollowUp = {
  id: string | number;
  name: string;
  note: string;
  timeAgo: string;
  icon: "camera" | "mail" | "phone" | "doc";
  followUpDate?: string;
  status?: string;
  modeOfContact?: string;
};

type Meeting = {
  id: string | number;
  time: string;
  title: string;
  company?: string;
  duration: string;
  action: "call" | "email";
};

function mapLeadFollowUpsToDisplay(items?: LeadDetailFollowUp[]): FollowUp[] {
  if (!items || items.length === 0) return [];

  const formatFollowUpDate = (value?: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  return items.map((f) => {
    const contactMode = f.modeOfContact || f.type || "email";
    let icon: "phone" | "mail" | "camera" | "doc" = "mail";
    if (contactMode === "call") icon = "phone";
    else if (contactMode === "email") icon = "mail";
    else if (contactMode === "meeting") icon = "camera";

    return {
      id: f._id,
      name: contactMode.charAt(0).toUpperCase() + contactMode.slice(1),
      note: f.notes ?? "",
      timeAgo: formatFollowUpDate(f.followUpDate ?? f.createdAt ?? ""),
      icon,
      followUpDate: f.followUpDate,
      status: f.status,
      modeOfContact: contactMode,
    };
  });
}

const meetings: Meeting[] = [];

const getTypeBadgeClassName = (type: string) => {
  switch (type.toLowerCase()) {
    case "quotation":
      return "bg-orange-500";
    case "invoice":
      return "bg-purple-600";
    case "escalation":
      return "bg-red-600";
    default:
      return "bg-blue-600";
  }
};

type Props = {
  auditLog?: LeadDetailAuditEntry[];
  followUps?: LeadDetailFollowUp[];
};

export default function FollowUpsCard({
  auditLog = [],
  followUps: followUpsProp = [],
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [initialDate] = useState<string | null>(null);
  const { leadId } = useParams<{ leadId?: string }>();
  const queryClient = useQueryClient();

  const completeFollowUp = useCompleteFollowUpMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (completeFollowUp.isSuccess) {
      setShowSuccess(true);
      if (leadId) {
        void queryClient.invalidateQueries({
          queryKey: ["sales", "leads", "detail", leadId],
        });
      }
      completeFollowUp.reset();
    }
  }, [completeFollowUp, completeFollowUp.isSuccess, leadId, queryClient]);

  const activityEntries = useMemo(() => {
    const entries = [...auditLog].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (!normalizedSearch) return entries;

    return entries.filter((entry) => {
      const haystack = [
        formatAuditAction(entry.action, entry.metadata),
        getAuditTypeLabel(entry.type),
        getAuditPerformedBy(entry),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [auditLog, searchQuery]);

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-md">
            <CardHeader className="flex items-start justify-between border-b">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Follow Up
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Recent activities
                </CardDescription>
              </div>

              <Button className="" onClick={() => setAddDialogOpen(true)}>
                <PlusIcon />
                Add Follow Up
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {(() => {
                const displayedFollowUps =
                  mapLeadFollowUpsToDisplay(followUpsProp);

                if (displayedFollowUps.length === 0) {
                  return (
                    <div className="px-4 py-6 text-sm text-gray-500">
                      No follow-ups recorded.
                    </div>
                  );
                }

                return displayedFollowUps.map((f) => {
                  const isOverdue =
                    f.status !== "completed" &&
                    f.followUpDate &&
                    new Date(f.followUpDate) < new Date();

                  return (
                    <div
                      key={f.id}
                      className="flex items-center gap-4 bg-gray-100 p-4 rounded-md"
                    >
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-sm text-gray-700">
                        {f.icon === "camera" && <Calendar className="h-4 w-4" />}
                        {f.icon === "mail" && <Mail className="h-4 w-4" />}
                        {f.icon === "phone" && <Phone className="h-4 w-4" />}
                        {f.icon === "doc" && <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                          {f.name}
                          {f.status === "completed" && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-normal">
                              Completed
                            </span>
                          )}
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-normal">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{f.note}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400">{f.timeAgo}</div>
                        {isOverdue && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => completeFollowUp.mutate(String(f.id))}
                            disabled={completeFollowUp.isPending}
                            title="Mark as Done"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardHeader className="flex items-start justify-between border-b">
              <div>
                <CardTitle className="text-lg font-semibold">Meetings</CardTitle>
                {/* <CardDescription className="text-sm text-gray-500">
                  Scheduled meetings
                </CardDescription> */}
              </div>

              <Link to="/meetings/schedule">
                <Button className="">
                  <PlusIcon />
                  Schedule Meeting
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-lg p-4 border-l-5  flex items-start justify-between",
                    { "bg-rose-50  border-rose-600": m.action === "call" },
                    { "bg-yellow-50  border-yellow-600": m.action === "email" },
                  )}
                >
                  <div>
                    <div className="text-xs text-gray-500">{m.time}</div>
                    <div className="font-semibold mt-1">{m.title}</div>
                    {m.company && (
                      <div className="text-sm text-gray-500">{m.company}</div>
                    )}
                    <div className="text-sm text-gray-400 mt-1">
                      {m.duration}
                    </div>
                  </div>
                  <div>
                    {m.action === "call" ? (
                      <Button
                        variant="ghost"
                        className="bg-green-50 text-green-700"
                      >
                        <Phone className="h-4 w-4 mr-2" /> Call
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="bg-blue-50 text-blue-700"
                      >
                        <Mail className="h-4 w-4 mr-2" /> Email
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        {/* table */}
        <Card className="rounded-md">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Lead Follow up Activity Log
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Search and review follow up activity
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex items-center gap-2">
                <input
                  placeholder="Search by Lead, Client or Project"
                  className="h-9 w-80 rounded-md border px-3 text-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery !== "" && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 h-9"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
              <Button variant="ghost">Export</Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left">
                <thead className="bg-gray-100 text-sm text-gray-700">
                  <tr>
                    <th className="px-6 py-4">Follow up Date</th>
                    <th className="px-6 py-4">Follow up Type</th>
                    <th className="px-6 py-4">Followed up by</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Outcome</th>
                    <th className="px-6 py-4">Next Follow up</th>
                    {/* <th className="px-6 py-4">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {activityEntries.length > 0 ? (
                    activityEntries.map((entry) => {
                      const { date, time } = splitLeadDateTime(entry.createdAt);
                      const performedBy = getAuditPerformedBy(entry);

                      return (
                        <tr key={entry._id} className="border-b">
                          <td className="px-6 py-4 align-top">
                            <div className="text-sm font-medium">{date}</div>
                            {time && (
                              <div className="text-xs text-gray-400 mt-1">
                                {time}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 align-top">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white capitalize",
                                getTypeBadgeClassName(entry.type),
                              )}
                            >
                              {getAuditTypeLabel(entry.type)}
                            </span>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="text-sm">{performedBy}</div>
                            <div className="text-xs text-gray-400">Sales</div>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <span className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                              Completed
                            </span>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <span className="text-sm text-amber-500">
                              {formatAuditAction(entry.action, entry.metadata)}
                            </span>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="text-sm">—</div>
                          </td>

                          {/* <td className="px-6 py-4 align-top">
                            <Button variant="outline" className="h-8 px-3">
                              View
                            </Button>
                          </td> */}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        No activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">Showing</div>
                <select className="h-8 rounded-md border px-2 text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <div className="text-sm text-gray-600">
                  {activityEntries.length} Results
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-md border px-3 py-1 text-sm text-gray-600">
                  <ChevronLeft className="inline-block" />
                </button>
                <nav
                  aria-label="Pagination"
                  className="flex items-center gap-2"
                >
                  <button className="h-8 w-8 rounded-md border bg-white text-sm">
                    1
                  </button>
                  <button className="h-8 w-8 rounded-md border text-sm">
                    2
                  </button>
                  <button className="h-8 w-8 rounded-md border text-sm">
                    3
                  </button>
                  <span className="px-2 text-sm">...</span>
                  <button className="h-8 w-8 rounded-md border text-sm">
                    15
                  </button>
                </nav>
                <button className="rounded-md border px-3 py-1 text-sm text-gray-600">
                  <ChevronRight className="inline-block" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AddFollowUpDialog
        open={addDialogOpen}
        onOpenChange={(o) => setAddDialogOpen(o)}
        initialDate={initialDate}
        leadId={leadId ?? null}
        onSuccess={() => {
          if (leadId) {
            void queryClient.invalidateQueries({
              queryKey: ["sales", "leads", "detail", leadId],
            });
          }
        }}
      />
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Follow-up marked completed"
        okLabel="Great"
      />
    </>
  );
}
