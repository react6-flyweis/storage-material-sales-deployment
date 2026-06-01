import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { ArrowLeft } from "lucide-react";
import BasicDetails from "@/components/leads/basic-details";

const quickActionButtons = [
  { label: "View Quotation", path: "project-quotation" },
  { label: "View Agreement", path: "contracts/1" },
  { label: "View Invoices", path: "project-invoices" },
  { label: "View Payments", path: "project-payments" },
];

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const basePath = id ? `/customers/${id}` : "/customers";
  const params = useParams<{ id?: string }>();
  const leadId = params.id;
  const { data: response, isLoading } = useLeadDetailQuery(leadId);

  const detail = response?.success ? response.data : undefined;

  if (isLoading || !detail) {
    return <ProjectDetailsSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4 bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">
            Project Details- {detail?.lead.projectName}
          </h1>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActionButtons.map((btn) => (
            <Button
              key={btn.label}
              variant="default"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px] shadow-sm"
              onClick={() => navigate(`${basePath}/${btn.path}`)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      <BasicDetails lead={detail} />
    </div>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-6 w-64 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 rounded-[6px] bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-36 w-full rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
