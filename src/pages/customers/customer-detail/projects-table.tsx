import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Pagination from "@/components/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useSalesCustomerProjectsQuery } from "@/modules/customers/customers.hooks";
import {
  formatLeadDate,
  formatLifecycleStatus,
  getLeadProgress,
  getLeadProjectName,
  type LeadStatusType,
} from "@/modules/leads/leads.utils";
import { ArrowUpDown, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { getLeadLifecycleBadgeClassName } from "@/modules/leads/lifecycle-statuses";

export type ProjectRow = {
  id: string;
  name: string;
  building: string;
  startDate: string;
  stage: string;
  progress: string;
  status: string;
  statusClassName: string;
};

type Props = {
  customerId: string;
  customerFirstName?: string;
};


function mapProjectToRow(
  project: {
    _id: string;
    projectName?: string;
    lifecycleStatus?: string;
    numberOfBuildings?: number;
    createdAt?: string;
    location?: string;
    buildingType?: string;
  },
  customerFirstName?: string
): ProjectRow {
  const lifecycleStatus = (project.lifecycleStatus ?? "initial_contact") as LeadStatusType
  const status = lifecycleStatus ? formatLifecycleStatus(lifecycleStatus) : "-";
  const progressStep = lifecycleStatus
    ? Math.min(getLeadProgress(lifecycleStatus), 8)
    : null;

  return {
    id: project._id,
    name: getLeadProjectName(project, { firstName: customerFirstName }),
    building:
      typeof project.numberOfBuildings === "number"
        ? `${project.numberOfBuildings} building${project.numberOfBuildings === 1 ? "" : "s"
        }`
        : "-",
    startDate: formatLeadDate(project.createdAt),
    stage: status,
    progress: progressStep ? `Step ${progressStep}/8` : "-",
    status,
    statusClassName: lifecycleStatus
      ? getLeadLifecycleBadgeClassName(lifecycleStatus)
      : "bg-slate-100 text-slate-700",
  };
}

export default function ProjectsTable({ customerId, customerFirstName }: Props) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: projectsResponse,
    isLoading,
    isError,
  } = useSalesCustomerProjectsQuery(customerId);

  const projectRows = useMemo(() => {
    const apiProjects = projectsResponse?.data.projects ?? [];
    return apiProjects.map((p) => mapProjectToRow(p, customerFirstName));
  }, [projectsResponse, customerFirstName]);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / rowsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const visibleProjects = filteredProjects.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="bg-white max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
          />
        </InputGroup>
        {/* <Button type="button" variant="outline">
          <Filter className="h-4 w-4" />
          Filter
        </Button> */}
        {searchTerm !== "" && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
          >
            Clear Filter
          </Button>
        )}
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
              {isLoading ? (
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
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-red-600"
                  >
                    Failed to load projects. Please refresh and try again.
                  </TableCell>
                </TableRow>
              ) : visibleProjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                visibleProjects.map((project) => (
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
                          navigate(`/customers/projects/${project.id}`, {
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
          totalItems={filteredProjects.length}
          currentPage={safeCurrentPage}
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
