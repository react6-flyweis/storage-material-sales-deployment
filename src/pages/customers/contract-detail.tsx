import * as React from "react";
import {
  ArrowLeft,
  Download,
  FileSignature,
  FileText,
  Mail,
  CheckCircle2,
  Clock,
  Eye,
  Bell,
  RefreshCw,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router";
import { useLeadAgreementQuery, useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import UploadAgreementDialog from "@/components/leads/upload-agreement-dialog";
import SendDocuSignDialog, {
  type DocuSignSendPayload,
} from "@/components/leads/send-docusign-dialog";
import VoidDocuSignDialog from "@/components/leads/void-docusign-dialog";
import { toast } from "sonner";

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

interface MockEnvelope {
  id: string;
  status: "sent" | "viewed" | "completed" | "voided";
  signerName: string;
  signerEmail: string;
  sentAt: string;
  lastViewedAt?: string;
  lastRemindedAt?: string;
  voidReason?: string;
}

export default function ContractDetail() {
  const navigate = useNavigate();
  const { leadId, id } = useParams<{ leadId?: string; id?: string }>();
  const actualLeadId = leadId || id;

  const { data: response, isLoading, refetch } = useLeadAgreementQuery(actualLeadId);
  const { data: leadResponse } = useLeadDetailQuery(actualLeadId, Boolean(actualLeadId));

  const agreementData = response?.success ? response.data : undefined;
  const leadDetail = leadResponse?.success ? leadResponse.data : undefined;

  const customerName = leadDetail?.customer
    ? `${leadDetail.customer.firstName || ""} ${leadDetail.customer.lastName || ""}`.trim()
    : "";
  const customerEmail = leadDetail?.customer?.email || "";
  const projectName =
    agreementData?.projectName || leadDetail?.lead?.projectName || "Project";
  const jobId = agreementData?.jobId || leadDetail?.lead?.jobId || "—";

  // In-memory envelope state for UI
  const [envelope, setEnvelope] = React.useState<MockEnvelope | null>(null);

  // Simulated signed state toggle for UI testing when no real backend PDF is uploaded yet
  const [simulatedSigned, setSimulatedSigned] = React.useState(false);

  // Priority: Real uploaded agreement > Simulated signed demo agreement
  const agreement =
    agreementData?.agreement ||
    (simulatedSigned
      ? {
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          name: "Fabrication & Supply Agreement (Signed).pdf",
        }
      : null);

  const handleDownload = () => {
    if (agreement?.url) {
      window.open(agreement.url, "_blank");
    }
  };

  const handleSendSuccess = (payload: DocuSignSendPayload) => {
    const newEnv: MockEnvelope = {
      id: `env_${Date.now()}`,
      status: "sent",
      signerName: payload.signerName,
      signerEmail: payload.signerEmail,
      sentAt: new Date().toISOString(),
    };
    setEnvelope(newEnv);
  };

  const handleRemind = () => {
    if (!envelope) return;
    const now = new Date().toISOString();
    setEnvelope({ ...envelope, lastRemindedAt: now });
    toast.success("DocuSign reminder sent", {
      description: `Notification email re-sent to ${envelope.signerEmail}.`,
    });
  };

  const handleToggleViewed = () => {
    if (!envelope) return;
    const isCurrentlyViewed = envelope.status === "viewed";
    const nextStatus = isCurrentlyViewed ? "sent" : "viewed";
    setEnvelope({
      ...envelope,
      status: nextStatus,
      lastViewedAt: nextStatus === "viewed" ? new Date().toISOString() : undefined,
    });
    toast.info(
      nextStatus === "viewed"
        ? "Simulated: Customer opened the contract in DocuSign"
        : "Simulated: Envelope marked as unread"
    );
  };

  const handleVoidSuccess = (reason: string) => {
    setEnvelope({
      ...envelope!,
      status: "voided",
      voidReason: reason,
    });
    toast.info("Envelope cancelled", {
      description: `Reason: ${reason}`,
    });
  };

  const handleClearVoid = () => {
    setEnvelope(null);
  };

  if (isLoading) {
    return <ContractDetailSkeleton />;
  }

  const isEnvelopeActive =
    envelope && (envelope.status === "sent" || envelope.status === "viewed");

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Contextual Status Badge in Header */}
          {agreement ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Contract Signed & Attached
            </span>
          ) : isEnvelopeActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              DocuSign: {envelope.status === "viewed" ? "Opened by Customer" : "Sent (Awaiting Signature)"}
            </span>
          ) : null}
        </div>

        {agreement && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Agreement
            </Button>
            <Button className="gap-2">
              Share to client
            </Button>
            {simulatedSigned && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimulatedSigned(false)}
                className="text-xs text-slate-500"
              >
                Reset Demo
              </Button>
            )}
          </div>
        )}
      </div>

      {agreement ? (
        /* 1. SIGNED AGREEMENT VIEW: Full height PDF iframe */
        <div className="flex-1 w-full min-h-0 bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
          <iframe
            src={agreement.url}
            className="w-full flex-1 border-0"
            title="Agreement PDF"
          />
        </div>
      ) : isEnvelopeActive ? (
        /* 2. IN-FLIGHT DOCUSIGN TRACKING CARD: Active Envelope */
        <div className="space-y-6">
          <Card className="border border-dashed border-blue-200 shadow-sm bg-gradient-to-b from-blue-50/20 to-white">
            <CardContent className="p-10 text-center space-y-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mx-auto w-fit shadow-xs">
                <FileSignature className="h-10 w-10" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100/80 text-blue-800 border border-blue-200 mb-2">
                  {envelope.status === "viewed" ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      <span>Document Opened by Customer</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      <span>Envelope Emailed • Waiting for Customer</span>
                    </>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                  Awaiting Signature via DocuSign
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Fabrication & Supply Agreement sent to{" "}
                  <span className="font-semibold text-slate-800">
                    {envelope.signerName}
                  </span>{" "}
                  (<span className="text-blue-600">{envelope.signerEmail}</span>).
                </p>
                <p className="text-xs text-slate-400">
                  Project: <span className="font-medium text-slate-600">{projectName}</span> (Job ID: {jobId})
                  {envelope.lastRemindedAt && (
                    <> · Last reminded {new Date(envelope.lastRemindedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
                  )}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="max-w-md mx-auto grid grid-cols-3 gap-2 py-2">
                <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 text-center space-y-1">
                  <div className="flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">1. Sent</p>
                  <p className="text-[10px] text-slate-400">Emailed to client</p>
                </div>

                <div
                  className={`p-2.5 rounded-lg border text-center space-y-1 ${
                    envelope.status === "viewed"
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center text-blue-600">
                    {envelope.status === "viewed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">2. Viewed</p>
                  <p className="text-[10px] text-slate-400">
                    {envelope.status === "viewed" ? "Opened by client" : "Not opened yet"}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center space-y-1">
                  <div className="flex items-center justify-center text-slate-300">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">3. Signed</p>
                  <p className="text-[10px] text-slate-400">Pending</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemind}
                  className="rounded-sm border-blue-300 text-blue-700 hover:bg-blue-50 gap-1.5 shadow-xs"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>Send Reminder</span>
                </Button>

                <VoidDocuSignDialog
                  envelopeId={envelope.id}
                  onSuccess={handleVoidSuccess}
                />

                <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                {/* Always provide manual upload as fallback */}
                <UploadAgreementDialog leadId={actualLeadId} onSuccess={refetch} />

                {/* Interactive Demo Helpers (since API is not live yet) */}
                <div className="w-full flex justify-center gap-2 pt-3 border-t border-slate-100 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleViewed}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Toggle &quot;Client Opened&quot; ({envelope.status === "viewed" ? "Active" : "Inactive"})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSimulatedSigned(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    Simulate Client Signed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* 3. READY TO SEND / NOT SENT STATE: Preserves current upload card, adds Send button */
        <div className="space-y-6">
          {envelope?.status === "voided" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <Ban className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 text-xs text-amber-900">
                  <p className="font-semibold">Previous DocuSign Envelope Voided</p>
                  <p className="text-amber-800">
                    Reason: {envelope.voidReason || "Cancelled by sales agent"}. You can now send an updated envelope or upload manually.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearVoid}
                className="text-xs text-amber-700 hover:bg-amber-100"
              >
                Dismiss
              </Button>
            </div>
          )}

          <Card className="border border-dashed shadow-sm">
            <CardContent className="p-12 bg-white">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  <FileText className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">
                    Fabrication &amp; Supply Agreement
                  </h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    No signed agreement found for project{" "}
                    <span className="font-semibold text-slate-700">
                      {projectName}
                    </span>{" "}
                    (Job ID: {jobId}).
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Send the contract to the client for electronic signature via DocuSign, or upload a signed paper copy.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {/* Primary DocuSign Send Dialog */}
                  <SendDocuSignDialog
                    leadId={actualLeadId}
                    projectName={projectName}
                    defaultSignerName={customerName}
                    defaultSignerEmail={customerEmail}
                    onSuccess={handleSendSuccess}
                  />

                  <span className="text-xs font-medium text-slate-400">or</span>

                  {/* Existing Upload Agreement Dialog preserved */}
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
