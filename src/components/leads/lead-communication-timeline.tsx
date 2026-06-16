import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  // CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  FileText,
  Mail,
  Phone,
  type LucideIcon,
  // ArrowRight,
} from "lucide-react";
import { useCommunicationTimelineQuery } from "@/modules/followups/followups.hooks";
// import { Link } from "react-router";
import { getLeadProjectName } from "@/modules/leads/leads.utils";

type TimelineItem = {
  id: number;
  name: string;
  customer: string;
  note: string;
  time: string;
  type: "note" | "email" | "call" | "doc";
  bg: string;
  icon: LucideIcon;
};

export default function LeadCommunicationTimeline() {
  const { data, isLoading, isError, refetch } = useCommunicationTimelineQuery(
    1,
    4,
  );

  const items: TimelineItem[] = (data?.data.entries ?? []).map((e, i) => {
    const activity = (e.metadata?.activityType || "note").toLowerCase();

    const icon =
      activity === "email"
        ? Mail
        : activity === "call"
          ? Phone
          : activity === "doc"
            ? FileText
            : MessageCircle;

    const bg =
      activity === "email"
        ? "bg-sky-50 text-sky-600"
        : activity === "call"
          ? "bg-emerald-50 text-emerald-600"
          : activity === "doc"
            ? "bg-gray-50 text-gray-600"
            : "bg-purple-50 text-purple-600";

    const name = getLeadProjectName(e.leadId as Record<string, unknown>, e.customerId as Record<string, unknown>);
    const customer = e.customerId?.firstName
    const note = e.metadata?.notes?.trim() || "No notes provided";
    const time = new Date(e.createdAt).toLocaleString();

    return {
      id: i,
      name,
      customer,
      note,
      time,
      type: activity as TimelineItem["type"],
      icon,
      bg,
    } as TimelineItem;
  });

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b">
        <div>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent activities</CardDescription>
        </div>

        {/* <div className="flex items-center space-x-2" data-slot="card-action">
          <Link to="/leads/follow-up/communication-timeline">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              + Add Note
            </Button>
          </Link>
          <Link to="/leads/follow-up/communication-timeline">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Log Call
            </Button>
          </Link>
        </div> */}
      </CardHeader>

      <CardContent className="space-y-3">
        {isError ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-red-700">Failed to load timeline.</p>
            <div className="mt-3">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : isLoading && items.length === 0 ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="flex items-start justify-between bg-muted rounded-md p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />

                <div className="flex-1">
                  <div className="h-4 w-40 rounded bg-slate-100 animate-pulse mb-2" />
                  <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
                <div className="text-xs mt-1">
                  <div className="h-3 w-12 rounded bg-slate-100 animate-pulse mt-2" />
                </div>
              </div>
            </div>
          ))
        ) : (
          items.slice(0, 3).map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.id}
                className="flex items-start justify-between bg-muted rounded-md p-4"
              >
                <div className="flex items-start space-x-3">
                  <Avatar className={`h-9 w-9 ${it.bg}`}>
                    <AvatarFallback className="text-sm">
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium text-foreground">{it.name}</div>
                    <div className="font-medium text-foreground">{it.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {it.note}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="text-right">{it.time}</div>
                  <div className="text-xs mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700`}
                    >
                      {it.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* <CardFooter className="justify-center">
        <Link to="/leads/follow-up/communication-timeline">
          <Button variant="link">
            View Full Timeline
            <ArrowRight />
          </Button>
        </Link>
      </CardFooter> */}
    </Card>
  );
}
