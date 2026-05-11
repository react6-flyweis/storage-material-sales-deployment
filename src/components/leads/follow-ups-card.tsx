import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  PlusIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type FollowUp = {
  id: number;
  name: string;
  note: string;
  timeAgo: string;
  icon: "camera" | "mail" | "phone" | "doc";
};

type Meeting = {
  id: number;
  time: string;
  title: string;
  company?: string;
  duration?: string;
  action: "call" | "email";
};

const followUps: FollowUp[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    note: "Discussed pricing options and implementation timeline",
    timeAgo: "2 hours ago",
    icon: "camera",
  },
  {
    id: 2,
    name: "Michael Chen",
    note: "Sent product demo video and case studies",
    timeAgo: "4 hours ago",
    icon: "mail",
  },
  {
    id: 3,
    name: "Emily Davis",
    note: "30-min discovery call completed - high interest level",
    timeAgo: "6 hours ago",
    icon: "phone",
  },
  {
    id: 4,
    name: "Robert Wilson",
    note: "Lead requested technical specifications document",
    timeAgo: "1 day ago",
    icon: "doc",
  },
];

const meetings: Meeting[] = [
  {
    id: 1,
    time: "09:00",
    title: "Follow up with Alice Johnson",
    company: "Tech Solutions Inc",
    duration: "30 min",
    action: "call",
  },
  {
    id: 2,
    time: "14:30",
    title: "Send Proposal to marketing Pro",
    company: "Marketing Pro",
    duration: "15 min",
    action: "email",
  },
];

export default function FollowUpsCard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-md">
          <CardHeader className="flex items-start justify-between border-b">
            <div>
              <CardTitle className="text-lg font-semibold">Follow Up</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Recent activities
              </CardDescription>
            </div>

            <Button className="">
              <PlusIcon />
              Add Follow Up
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {followUps.map((f) => (
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
                  <div className="font-medium text-sm text-gray-900">
                    {f.name}
                  </div>
                  <div className="text-xs text-gray-500">{f.note}</div>
                </div>
                <div className="text-xs text-gray-400">{f.timeAgo}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">Meetings</CardTitle>
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
                  <div className="text-sm text-gray-400 mt-1">{m.duration}</div>
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
            <div className="relative">
              <input
                placeholder="Search by Lead, Client or Project"
                className="h-9 w-80 rounded-md border px-3 text-sm placeholder-gray-400"
              />
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
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium">May 19,2025</div>
                      <div className="text-xs text-gray-400 mt-1">10:30 AM</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                        Email
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="text-sm">John Smith</div>
                      <div className="text-xs text-gray-400">Sales</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                        Completed
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span className="text-sm text-amber-500">Neutral</span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="text-sm">May 19,2025</div>
                      <div className="text-xs text-gray-400 mt-1">10:30 AM</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <Button variant="outline" className="h-8 px-3">
                        {" "}
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
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
              <div className="text-sm text-gray-600">Results</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-md border px-3 py-1 text-sm text-gray-600">
                <ChevronLeft className="inline-block" />
              </button>
              <nav aria-label="Pagination" className="flex items-center gap-2">
                <button className="h-8 w-8 rounded-md border bg-white text-sm">
                  1
                </button>
                <button className="h-8 w-8 rounded-md border text-sm">2</button>
                <button className="h-8 w-8 rounded-md border text-sm">3</button>
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
  );
}
