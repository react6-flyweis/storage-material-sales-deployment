import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import { useFollowUpActivityDetailQuery } from "@/modules/followups/followups.hooks";
import type {
  FollowUpKind,
  FollowUpModeOfContact,
} from "@/modules/followups/followups.api";
import Pagination from "@/components/Pagination";
import StatCard from "@/components/ui/stat-card";

interface LeadFollowUpDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  leadName?: string;
  kind?: FollowUpKind;
}

export default function LeadFollowUpDetailDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  kind = "automatic",
}: LeadFollowUpDetailDialogProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading } = useFollowUpActivityDetailQuery(
    leadId || "",
    kind,
    page,
    limit,
    open && Boolean(leadId)
  );

  const detailData = response?.data;
  const lead = detailData?.lead;
  const totals = detailData?.totals;
  const history = detailData?.history || [];
  const totalHistory = detailData?.pagination?.totalHistory || history.length;

  const getContactIcon = (mode?: FollowUpModeOfContact | string) => {
    switch (mode) {
      case "call":
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      case "meeting":
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      case "sms":
      case "chat":
        return <MessageSquare className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-medium">
            Overdue
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2 py-0.5 text-xs font-medium">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 text-xs font-medium">
            Pending
          </Badge>
        );
    }
  };

  const formatSource = (source?: string) => {
    if (!source) return "Manual";
    switch (source) {
      case "warm_lead_auto":
        return "Warm Auto";
      case "cold_lead_auto":
        return "Cold Auto";
      case "chat_dropoff_auto":
        return "Chat Dropoff";
      case "invoice_auto":
        return "Invoice Auto";
      case "manual":
        return "Manual";
      default:
        return source.replace(/_/g, " ");
    }
  };

  const getTemperatureBadge = (temp?: string) => {
    switch (temp?.toLowerCase()) {
      case "hot":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium px-2.5 py-0.5">
            Hot
          </Badge>
        );
      case "warm":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-2.5 py-0.5">
            Warm
          </Badge>
        );
      case "cold":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium px-2.5 py-0.5">
            Cold
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header matching other dialogs in the app */}
        <DialogHeader className="border-b px-6 py-4.5 bg-white flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Follow-up Activity Details
              </DialogTitle>
              {lead?.leadScoring?.temperature &&
                getTemperatureBadge(lead.leadScoring.temperature)}
            </div>
            <DialogDescription className="text-xs text-gray-500">
              {lead?.projectName || leadName || "Lead Activity"}
              {lead?.jobId && ` • Job ID: ${lead.jobId}`}
              {lead?.customerName && ` • Customer: ${lead.customerName}`}
              {lead?.assignedSales?.name && ` • Sales Rep: ${lead.assignedSales.name}`}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa]">
          {/* Top Metrics Cards using standard StatCard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Follow-ups"
              value={String(totals?.followUpCount ?? 0)}
              color="bg-blue-600"
              icon={<CalendarIcon className="w-5 h-5 text-blue-600" />}
              loading={isLoading}
            />
            <StatCard
              title="Pending"
              value={String(totals?.pendingCount ?? 0)}
              color="bg-yellow-500"
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              loading={isLoading}
            />
            <StatCard
              title="Completed"
              value={String(totals?.completedCount ?? 0)}
              color="bg-green-600"
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              loading={isLoading}
            />
            <StatCard
              title="Overdue"
              value={String(totals?.overdueCount ?? 0)}
              color="bg-red-600"
              icon={<AlertCircle className="w-5 h-5 text-red-600" />}
              loading={isLoading}
            />
          </div>

          {/* Activity Log Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4.5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Activity Timeline History
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chronological record of communications and reminders
                </p>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {totalHistory} total {totalHistory === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#f8fafc]">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Follow-up Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Contact Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Source
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Assigned / Performed By
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 uppercase text-[11px] h-10 px-4">
                      Notes / Outcome
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-xs text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span>Loading activity records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-xs text-gray-500">
                        No follow-up activity found for this lead.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50/70 text-xs">
                        <TableCell className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {item.followUpDate
                              ? dayjs(item.followUpDate).format("MMM DD, YYYY")
                              : "-"}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {item.followUpDate
                              ? dayjs(item.followUpDate).format("h:mm A")
                              : ""}
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-medium text-gray-800 capitalize">
                            <span className="p-1 bg-gray-100 rounded">
                              {getContactIcon(item.modeOfContact)}
                            </span>
                            <span>{item.modeOfContact || "Contact"}</span>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal capitalize bg-slate-100 text-slate-700"
                          >
                            {formatSource(item.source)}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-700">
                          <div>
                            {item.assignedTo?.name ||
                              item.createdBy?.name ||
                              "Unassigned"}
                          </div>
                          {item.completedAt && (
                            <div className="text-[10px] text-emerald-600 mt-0.5">
                              Done {dayjs(item.completedAt).format("MMM DD, h:mm A")}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          {getStatusBadge(item.computedStatus || item.status)}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-600 max-w-sm">
                          {item.notes ? (
                            <span className="line-clamp-2">{item.notes}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalHistory > limit && (
              <div className="p-3 border-t border-gray-100 bg-white">
                <Pagination
                  currentPage={page}
                  totalItems={totalHistory}
                  rowsPerPage={limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-white flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
