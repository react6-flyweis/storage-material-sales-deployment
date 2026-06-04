import { ArrowLeft, Download, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router";
import { useLeadAgreementQuery } from "@/modules/leads/leads.hooks";
import UploadAgreementDialog from "@/components/leads/upload-agreement-dialog";

function ContractDetailSkeleton() {
  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-10 w-44 bg-slate-200 animate-pulse rounded-lg" />
      </div>
      <div className="h-96 bg-slate-100 animate-pulse rounded-lg" />
    </div>
  );
}

export default function ContractDetail() {
  const navigate = useNavigate();
  const { leadId, id } = useParams<{ leadId?: string; id?: string }>();
  const actualLeadId = leadId || id;

  const { data: response, isLoading, refetch } = useLeadAgreementQuery(actualLeadId);

  const agreementData = response?.success ? response.data : undefined;
  const agreement = agreementData?.agreement;

  const handleDownload = () => {
    if (agreement?.url) {
      window.open(agreement.url, "_blank");
    }
  };

  if (isLoading) {
    return <ContractDetailSkeleton />;
  }

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <Button
          onClick={() => navigate(-1)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {agreement && (
          <div className="flex gap-2">
            <Button variant={"secondary"} onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Agreement
            </Button>
            <Button className="gap-2">
              Share to client
            </Button>
          </div>
        )}
      </div>

      {agreement ? (
        <div className="flex-1 w-full min-h-0 bg-white rounded-lg border shadow-sm overflow-hidden">
          <iframe
            src={agreement.url}
            className="w-full h-full border-0"
            title="Agreement PDF"
          />
        </div>
      ) : (
        <div className="space-y-6">


          {/* Upload CTA Card */}
          <Card className="border border-dashed shadow-sm">
            <CardContent className="p-12 bg-white">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
                  <FileWarning className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">Upload Agreement</h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    No signed agreement found for project{" "}
                    <span className="font-semibold text-slate-700">
                      {agreementData?.projectName || "—"}
                    </span>{" "}
                    (Job ID: {agreementData?.jobId || "—"}).
                  </p>
                </div>
                <div className="pt-2">
                  <UploadAgreementDialog leadId={actualLeadId} onSuccess={refetch} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
