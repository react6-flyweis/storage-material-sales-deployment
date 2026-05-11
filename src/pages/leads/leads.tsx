import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import {
  UserPlus,
  Download,
  MessageSquare,
  Eye,
  UserCheck,
  FileText,
  Redo,
  TrendingUp,
  Search,
  Pen,
  AlertCircle,
} from "lucide-react";
import ImportLeadsDialog from "@/components/leads/import-leads-dialog";
import CreateQuotationDialog from "@/components/leads/create-quotation-dialog";
import EscalateLeadDialog from "@/components/leads/escalate-lead-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/stat-card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import ChatDialog from "@/components/leads/chat-dialog";
import MoveToOrdersDialog from "@/components/leads/move-to-orders-dialog";
import SuccessDialog from "@/components/success-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import { getDashboardMetrics, type DashboardMetrics } from "@/lib/metrics";

// Mock data - replace with actual API calls
const initialLeads = [
  {
    id: "ID-2025-1047",
    name: "PROJECT 1",
    workshop: "Workshop",
    category: "Texas",
    assignedTo: null,
    assignedToName: "",
    assignmentStatus: "Assign",
    progress: 3,
    progressStep: "Step 4/7",
    status: "Proposal sent",
    statusColor: "purple",
    quoteValue: "$12,500",
    chatCount: 2,
    nextFollowUp: "25-01-2025",
  },
  {
    id: "ID-2025-1048",
    name: "PROJECT 2",
    workshop: "Workshop",
    category: "Texas",
    assignedTo: "Sarah Lee",
    assignedToName: "Sarah Lee",
    assignmentStatus: "1 person assigned",
    progress: 3,
    progressStep: "Step 4/7",
    status: "Quotation Sent",
    statusColor: "orange",
    quoteValue: "$12,500",
    chatCount: 4,
    nextFollowUp: "25-01-2025",
  },
  {
    id: "ID-2025-1049",
    name: "PROJECT 3",
    workshop: "Workshop",
    category: "Texas",
    assignedTo: "Sarah Lee",
    assignedToName: "Sarah Lee",
    assignmentStatus: "1 person assigned",
    progress: 3,
    progressStep: "Step 4/7",
    status: "Proposal sent",
    statusColor: "purple",
    quoteValue: "$12,500",
    chatCount: 2,
    nextFollowUp: "25-01-2025",
  },
  {
    id: "ID-2025-1050",
    name: "PROJECT 4",
    workshop: "Workshop",
    category: "Texas",
    assignedTo: "Sarah Lee",
    assignedToName: "Sarah Lee",
    assignmentStatus: "1 person assigned",
    progress: 3,
    progressStep: "Step 4/7",
    status: "Proposal sent",
    statusColor: "purple",
    quoteValue: "$12,500",
    chatCount: 2,
    nextFollowUp: "25-01-2025",
  },
];

export default function LeadsPage() {
  const [period, setPeriod] = useState<Period>("quarter");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboardMetrics(period)
      .then((m) => {
        if (mounted) setMetrics(m);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [period]);
  const [buildingType, setBuildingType] = useState("all");
  const [projectValue, setProjectValue] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [leads] = useState(initialLeads);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Filter leads based on all criteria
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(query) ||
          lead.id.toLowerCase().includes(query) ||
          lead.workshop.toLowerCase().includes(query) ||
          lead.category.toLowerCase().includes(query) ||
          (lead.assignedToName &&
            lead.assignedToName.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Building type filter
      if (buildingType !== "all") {
        const typeMatch = lead.workshop
          .toLowerCase()
          .includes(buildingType.toLowerCase());
        if (!typeMatch) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const statusMatch = lead.status
          .toLowerCase()
          .includes(statusFilter.toLowerCase());
        if (!statusMatch) return false;
      }

      return true;
    });
  }, [leads, searchQuery, buildingType, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, id]);
    } else {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    }
  };

  const getProgressDots = (progress: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < progress ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-100 text-purple-700",
      orange: "bg-orange-100 text-orange-700",
      green: "bg-green-100 text-green-700",
      blue: "bg-blue-100 text-blue-700",
    };
    return colors[color] || "bg-gray-100 text-gray-700";
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      // Placeholder for actual export logic (API call / file generation)
      await new Promise((res) => setTimeout(res, 600));
      setShowExportSuccess(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <FilterTabs onPeriodChange={setPeriod} initialPeriod={period} />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900">Assigned Leads</h1>
          <p className="text-gray-500 mt-1">
            Manage your assigned leads and track their progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Leads in Pipeline"
            value={loading ? "..." : metrics ? metrics.totalLeads : "-"}
            color="bg-blue-600"
            icon={<UserPlus className="h-5 w-5 text-blue-600" />}
          />
          <StatCard
            title="Leads Closed"
            value={loading ? "..." : metrics ? metrics.leadsClosed : "-"}
            color="bg-green-500"
            icon={<UserCheck className="h-5 w-5 text-green-500" />}
          />
          <StatCard
            title="Follow-ups Pending"
            value={loading ? "..." : metrics ? metrics.followUpsPending : "-"}
            color="bg-yellow-500"
            icon={<FileText className="h-5 w-5 text-yellow-500" />}
          />
          <StatCard
            title="AI Escalations"
            value={loading ? "..." : metrics ? metrics.aiEscalations : "-"}
            color="bg-orange-400"
            icon={<TrendingUp className="h-5 w-5 text-orange-400" />}
          />
        </div>

        {/* Action Buttons and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <Link to="/leads/add" className="inline-block">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </Link>

            <ImportLeadsDialog />
            <Button
              variant="outline"
              className="bg-white"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Select value={buildingType} onValueChange={setBuildingType}>
            <SelectTrigger className="w-full sm:w-40 bg-white">
              <SelectValue placeholder="Building types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="garages">Garages</SelectItem>
              <SelectItem value="workshops">Workshops</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="sales-storage">Sales Storage</SelectItem>
              <SelectItem value="arch-buildings">Arch Buildings</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectValue} onValueChange={setProjectValue}>
            <SelectTrigger className="w-full sm:w-40 bg-white">
              <SelectValue placeholder="Project value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="small">
                Small projects (&lt;$50,000)
              </SelectItem>
              <SelectItem value="medium">
                Medium ($50,000 - $200,000)
              </SelectItem>
              <SelectItem value="large">Large (&gt;$200,000)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="proposal">Proposal sent</SelectItem>
              <SelectItem value="quotation">Quotation Sent</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedLeads.length === filteredLeads.length &&
                        filteredLeads.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROJECT NAME
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROGRESS
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROJECT VALUE
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NEXT FOLLOW UP
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CHAT
                  </TableHead>
                  <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell className="">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) =>
                            handleSelectLead(lead.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </TableCell>

                      <TableCell className="">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 uppercase">
                            {lead.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {lead.id.replace(/^ID-/, "Q-")}
                          </span>
                          <span className="text-sm text-gray-500">
                            {lead.workshop} · {lead.category}
                          </span>
                          {lead.assignedTo && (
                            <span className="text-sm text-gray-700 mt-1">
                              Assigned to {lead.assignedToName}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="">
                        <div className="flex flex-col gap-1">
                          {getProgressDots(lead.progress)}
                          <a className="text-sm text-blue-600" href="#">
                            {lead.progressStep}
                          </a>
                        </div>
                      </TableCell>

                      <TableCell className="">
                        <Badge
                          className={`${getStatusBadgeColor(
                            lead.statusColor,
                          )} rounded-full px-4 py-1 text-sm`}
                          variant="secondary"
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="">
                        <span className="font-medium text-gray-900">
                          {lead.quoteValue}
                        </span>
                      </TableCell>

                      <TableCell className=" text-sm text-gray-600">
                        {lead.nextFollowUp}
                      </TableCell>

                      <TableCell className="">
                        <ChatDialog
                          lead={lead}
                          trigger={
                            <button className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-sm">Chat</span>
                              {lead.chatCount > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                                  {lead.chatCount}
                                </span>
                              )}
                            </button>
                          }
                        />
                      </TableCell>

                      <TableCell className="">
                        <div className="flex items-center gap-1">
                          <Link to={`/leads/${lead.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className=" text-purple-600 stroke-2" />
                            </Button>
                          </Link>

                          <CreateQuotationDialog
                            leadData={{ name: lead.name, id: lead.id }}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Pen className=" text-green-600" />
                              </Button>
                            }
                          />

                          <Button variant="ghost" size="icon">
                            <FileText className=" text-red-800" />
                          </Button>

                          <MoveToOrdersDialog
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Redo className=" text-red-500" />
                              </Button>
                            }
                          />

                          <EscalateLeadDialog
                            leadId={lead.id}
                            leadName={lead.name}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <AlertCircle className=" text-gray-500" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No leads found</p>
                        <p className="text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <SuccessDialog
        open={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="Export completed"
        okLabel="Great"
      />
    </>
  );
}
