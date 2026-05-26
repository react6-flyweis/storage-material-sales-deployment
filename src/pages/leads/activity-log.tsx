import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import Pagination from "@/components/Pagination";
import { ActivityDetailsDialog } from "@/components/activity-details-dialog";
import DateRangeFilter from "@/components/ui/date-range-filter";
import type { DateRange } from "react-day-picker";

interface ActivityLog {
  id: string;
  leadProjectName: string;
  leadProjectType: string;
  clientName: string;
  clientPhone: string;
  followUpDate: string;
  followUpTime: string;
  followUpType: "Phone Call" | "Email";
  followedBy: string;
  followedByDept: string;
  status: "Completed" | "Pending";
  outcome: "Positive" | "Neutral" | "Negative";
  nextFollowUpDate: string;
  nextFollowUpTime: string;
}

const initialData: ActivityLog[] = [
  {
    id: "1",
    leadProjectName: "ABC Builders inc.",
    leadProjectType: "Vendor",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 19,2025",
    followUpTime: "10:30 AM",
    followUpType: "Phone Call",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Positive",
    nextFollowUpDate: "May 19,2025",
    nextFollowUpTime: "10:30 AM",
  },
  {
    id: "2",
    leadProjectName: "Fast freight Logistics",
    leadProjectType: "Shipper",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 18,2025",
    followUpTime: "10:30 AM",
    followUpType: "Email",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Neutral",
    nextFollowUpDate: "May 19,2025",
    nextFollowUpTime: "10:30 AM",
  },
  {
    id: "3",
    leadProjectName: "United Rentals",
    leadProjectType: "Vendor",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 19,2025",
    followUpTime: "10:30 AM",
    followUpType: "Phone Call",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Positive",
    nextFollowUpDate: "May 19,2025",
    nextFollowUpTime: "10:30 AM",
  },
  {
    id: "4",
    leadProjectName: "Safety Supplies Co.",
    leadProjectType: "Vendor",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 19,2025",
    followUpTime: "10:30 AM",
    followUpType: "Email",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Neutral",
    nextFollowUpDate: "May 19,2025",
    nextFollowUpTime: "10:30 AM",
  },
  {
    id: "5",
    leadProjectName: "Sunbelt Rentals",
    leadProjectType: "Vendor",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 18,2025",
    followUpTime: "10:30 AM",
    followUpType: "Phone Call",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Positive",
    nextFollowUpDate: "May 18,2025",
    nextFollowUpTime: "10:30 AM",
  },
  {
    id: "6",
    leadProjectName: "Elite Transport LLC",
    leadProjectType: "Shipper",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 19,2025",
    followUpTime: "10:30 AM",
    followUpType: "Email",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Neutral",
    nextFollowUpDate: "May 19,2025",
    nextFollowUpTime: "10:30 AM",
  },
  {
    id: "7",
    leadProjectName: "Elite Transport LLC",
    leadProjectType: "Shipper",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 19,2025",
    followUpTime: "10:30 AM",
    followUpType: "Email",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Neutral",
    nextFollowUpDate: "May 19,2025",
    nextFollowUpTime: "10:30 AM",
  },
  {
    id: "8",
    leadProjectName: "Elite Transport LLC",
    leadProjectType: "Shipper",
    clientName: "Mr. Alan Walker",
    clientPhone: "(432)345 536",
    followUpDate: "May 18,2025",
    followUpTime: "10:30 AM",
    followUpType: "Email",
    followedBy: "John Smith",
    followedByDept: "Sales",
    status: "Completed",
    outcome: "Neutral",
    nextFollowUpDate: "May 18,2025",
    nextFollowUpTime: "10:30 AM",
  },
];

export default function ActivityLogPage() {
  const [data] = useState<ActivityLog[]>(initialData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [employee, setEmployee] = useState("all");
  const [department, setDepartment] = useState("all");
  const [followUpType, setFollowUpType] = useState("all");
  const [status, setStatus] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const parseDate = (value: string) => {
    const normalized = value.replace(",", ", ");
    return new Date(normalized);
  };

  const filteredData = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const inDateRange = (value: string) => {
      if (!dateRange?.from && !dateRange?.to) return true;

      const itemDate = parseDate(value);
      if (Number.isNaN(itemDate.getTime())) return false;

      if (dateRange.from && itemDate < dateRange.from) return false;
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        if (itemDate > endDate) return false;
      }

      return true;
    };

    return data.filter((row) => {
      const matchesSearch =
        !searchValue ||
        row.leadProjectName.toLowerCase().includes(searchValue) ||
        row.clientName.toLowerCase().includes(searchValue) ||
        row.leadProjectType.toLowerCase().includes(searchValue);

      const matchesEmployee =
        employee === "all" || row.followedBy.toLowerCase() === employee;
      const matchesDepartment =
        department === "all" || row.followedByDept.toLowerCase() === department;
      const matchesFollowUpType =
        followUpType === "all" ||
        row.followUpType.toLowerCase() === followUpType;
      const matchesStatus =
        status === "all" || row.status.toLowerCase() === status;
      const matchesOutcome =
        outcome === "all" || row.outcome.toLowerCase() === outcome;
      const matchesDateRange = inDateRange(row.followUpDate);

      return (
        matchesSearch &&
        matchesEmployee &&
        matchesDepartment &&
        matchesFollowUpType &&
        matchesStatus &&
        matchesOutcome &&
        matchesDateRange
      );
    });
  }, [
    search,
    data,
    employee,
    department,
    followUpType,
    status,
    outcome,
    dateRange,
  ]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const getFollowUpTypeColor = (type: ActivityLog["followUpType"]) => {
    switch (type) {
      case "Phone Call":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "Email":
        return "bg-[#2563eb] hover:bg-[#2563eb]/90 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getOutcomeColor = (outcome: ActivityLog["outcome"]) => {
    switch (outcome) {
      case "Positive":
        return "text-green-600 font-medium";
      case "Neutral":
        return "text-yellow-500 font-medium";
      case "Negative":
        return "text-red-500 font-medium";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 ">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Follow-up Activity Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track all follow-up activities and communication across leads
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Employee</label>
            <Select
              value={employee}
              onValueChange={(value) => {
                setEmployee(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employee</SelectItem>
                <SelectItem value="james cooper">James Cooper</SelectItem>
                <SelectItem value="david kim">David Kim</SelectItem>
                <SelectItem value="john mason">John Mason</SelectItem>
                <SelectItem value="michael jordan">Michael Jordan</SelectItem>
                <SelectItem value="james smith">James Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Department</label>
            <Select
              value={department}
              onValueChange={(value) => {
                setDepartment(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="plant">Plant</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Follow-up Type</label>
            <Select
              value={followUpType}
              onValueChange={(value) => {
                setFollowUpType(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone call">Phone call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Outcome</label>
            <Select
              value={outcome}
              onValueChange={(value) => {
                setOutcome(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcome</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangeFilter
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lead Follow up Activity</h3>
          <div className="w-75">
            <Input
              placeholder="Search by Lead, Client or Project"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead/Project</TableHead>
              <TableHead>Client/Contact</TableHead>
              <TableHead>Follow up Date</TableHead>
              <TableHead>Follow up Type</TableHead>
              <TableHead>Followed up by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Next Follow up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {row.leadProjectName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {row.leadProjectType}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {row.clientName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {row.clientPhone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {row.followUpDate}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {row.followUpTime}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getFollowUpTypeColor(row.followUpType)}>
                    {row.followUpType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {row.followedBy}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {row.followedByDept}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={getOutcomeColor(row.outcome)}>
                    {row.outcome}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {row.nextFollowUpDate}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {row.nextFollowUpTime}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => setIsDetailsOpen(true)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  No activity found for selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Showing</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-16 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Results</span>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ActivityDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
