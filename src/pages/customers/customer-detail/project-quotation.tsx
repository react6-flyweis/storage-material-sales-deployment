import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import QuotationCard, {
  QuotationCardSkeleton,
} from "@/components/leads/quotation-card";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";

export default function ProjectQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading } = useLeadDetailQuery(id);

  if (isLoading) {
    return <QuotationCardSkeleton />;
  }

  const detail = response?.success ? response.data : undefined;
  const latestQuotation =
    detail?.quotations.find((q) => q.isLatest) ?? detail?.quotations[0];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          onClick={() => navigate(-1)}
          className="px-4 font-sans"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-[#0F172A] font-sans">
          {detail?.lead.projectName || "Project"} - Quotation
        </h1>
      </div>

      {/* Slides Container Stack */}
      <QuotationCard
        quotation={latestQuotation}
        lead={detail?.lead}
        customer={detail?.customer}
      />
    </div>
  );
}
