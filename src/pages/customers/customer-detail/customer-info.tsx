import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpDown,
  Clock3,
  DollarSign,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/stat-card";
import ProfileCard from "@/components/profile-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/Pagination";
import {
  useSalesCustomerDetailQuery,
  useSalesCustomerProjectsQuery,
} from "@/modules/customers/customers.hooks";
import {
  formatLeadDate,
  formatLifecycleStatus,
  getLeadProgress,
} from "@/modules/leads/leads.utils";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatJoinedDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type ProjectRow = {
  id: string;
  name: string;
  building: string;
  startDate: string;
  stage: string;
  progress: string;
  status: string;
  statusClassName: string;
};

function getProjectStatusBadgeClassName(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("sent_to_admin")) {
    return "bg-slate-100 text-slate-700";
  }

  if (normalized.includes("converted_to_po")) {
    return "bg-violet-100 text-violet-700";
  }

  if (normalized.includes("payment")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized.includes("deal_closed") || normalized.includes("completed")) {
    return "bg-green-100 text-green-700";
  }

  if (normalized.includes("proposal")) {
    return "bg-purple-100 text-purple-700";
  }

  if (normalized.includes("quotation")) {
    return "bg-orange-100 text-orange-700";
  }

  if (normalized.includes("negotiation")) {
    return "bg-blue-100 text-blue-700";
  }

  if (normalized.includes("cancel")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function mapProjectToRow(project: {
  _id: string;
  projectName?: string;
  lifecycleStatus?: string;
  createdAt?: string;
}): ProjectRow {
  const lifecycleStatus = project.lifecycleStatus ?? "";
  const status = lifecycleStatus ? formatLifecycleStatus(lifecycleStatus) : "-";
  const progressStep = lifecycleStatus
    ? Math.min(getLeadProgress(lifecycleStatus), 8)
    : null;

  return {
    id: project._id,
    name: project.projectName?.trim() || "-",
    building: "-",
    startDate: formatLeadDate(project.createdAt),
    stage: status,
    progress: progressStep ? `Step ${progressStep}/8` : "-",
    status,
    statusClassName: lifecycleStatus
      ? getProjectStatusBadgeClassName(lifecycleStatus)
      : "bg-slate-100 text-slate-700",
  };
}

export default function CustomerDetailLayout() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ?? "unknown";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: customerDetailResponse,
    isLoading,
    isError,
  } = useSalesCustomerDetailQuery(id);

  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useSalesCustomerProjectsQuery(id, currentPage, rowsPerPage);

  const projectRows = useMemo(() => {
    const apiProjects = projectsResponse?.data.projects ?? [];
    return apiProjects.map(mapProjectToRow);
  }, [projectsResponse]);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return projectRows;
    }

    return projectRows.filter((row) => {
      return [
        row.name,
        row.building,
        row.startDate,
        row.stage,
        row.progress,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [projectRows, searchTerm]);

  const projectsTotal = projectsResponse?.data.total ?? 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (projectsTotal === 0) return;

    const totalPages = Math.max(1, Math.ceil(projectsTotal / rowsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, projectsTotal, rowsPerPage]);

  const customerData = customerDetailResponse?.data.customer;
  const financials = customerDetailResponse?.data.financials;

  const customerName =
    `${customerData?.firstName ?? ""} ${customerData?.lastName ?? ""}`.trim() ||
    "-";

  const phoneNumber = customerData?.phone?.number ?? "";
  const phoneCountryCode = customerData?.phone?.countryCode ?? "";
  const phone =
    phoneCountryCode && phoneNumber
      ? `${phoneCountryCode} ${phoneNumber}`
      : phoneNumber || "-";

  const joinedDate = formatJoinedDate(customerData?.createdAt);

  const customer = {
    id: customerData?.customerId ?? customerData?._id ?? id,
    customerName,
    email: customerData?.email ?? "-",
    phone,
    inquiryFor:
      customerData?.source?.trim() || customerData?.inquiryFor?.trim() || "-",
    status: customerData?.isActive ? "Active" : "Inactive",
    joined: joinedDate,
    address: "-",
  };

  const profileData = {
    name: customer.customerName,
    status: customer.status as "Active" | "Inactive",
    id: customer.id,
    joined: customer.joined,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
  };

  const statCards = [
    {
      title: "Total Paid",
      value: formatCurrency(financials?.totalPaid ?? 0),
      color: "bg-[#1D51A4]",
      icon: <DollarSign className="h-5 w-5 text-[#1D51A4]" />,
    },
    {
      title: "Pending Payment",
      value: formatCurrency(financials?.pendingPayment ?? 0),
      color: "bg-[#FD8D5B]",
      icon: <Clock3 className="h-5 w-5 text-[#FD8D5B]" />,
    },
    {
      title: "Total Invoices",
      value: String(financials?.totalInvoices ?? 0),
      color: "bg-[#EAB308]",
      icon: <FileText className="h-5 w-5 text-[#EAB308]" />,
    },
    {
      title: "Revenue Generated",
      value: formatCurrency(financials?.revenueGenerated ?? 0),
      color: "bg-[#A855F7]",
      icon: <DollarSign className="h-5 w-5 text-[#A855F7]" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg ">Customer Details</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link to={`/customers/${id}/projects/new`}>
            <Button className="w-full sm:w-auto bg-[#1F86D5] hover:bg-[#1769A7]">
              Create new Project
            </Button>
          </Link>
        </div>
      </div>

      {isError ? (
        <Card className="p-4">
          <CardContent className="px-0 py-0 text-sm text-red-600">
            Failed to load customer details. Please refresh and try again.
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Card */}
      <ProfileCard profile={profileData} isLoading={isLoading} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, color, icon }) => (
          <StatCard
            key={title}
            title={title}
            value={value}
            color={color}
            icon={icon}
            loading={isLoading}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="bg-white max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search"
          />
        </InputGroup>
        <Button type="button" variant="outline">
          <Filter className="" />
          Filter
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all projects"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Project Name
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Building
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Start Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </span>
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Stage
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </span>
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Progress
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </span>
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Status
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={`project-loading-${index}`}
                    className="border-0 animate-pulse"
                  >
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className="px-4 py-4">
                        <div className="h-4 w-full max-w-28 rounded bg-slate-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : projectsError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-red-600"
                  >
                    Failed to load projects. Please refresh and try again.
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="text-[13px] text-slate-700"
                  >
                    <TableCell className="px-3 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${project.name}`}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4 font-medium text-slate-700">
                      {project.name}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-700">
                      {project.building}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-700">
                      {project.startDate}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-700">
                      {project.stage}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-700">
                      {project.progress}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${project.statusClassName}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          navigate(`/customers/${id}/project-details`, {
                            state: { projectId: project.id },
                          })
                        }
                        aria-label={`View ${project.name}`}
                      >
                        view
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="bg-white rounded">
        <Pagination
          totalItems={
            searchTerm.trim() ? filteredProjects.length : projectsTotal
          }
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
