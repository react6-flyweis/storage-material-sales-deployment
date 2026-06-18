import SuccessDialog from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AddNotesDialog,
  // type AddNotesFormValues,
} from "@/pages/customers/customer-detail/add-notes-dialog";
import UpdateStatusDialog from "@/pages/customers/customer-detail/update-status-dialog";
import {
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  // User,
  FileText,
  CircleDollarSign,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { LeadDetailData } from "@/modules/leads/leads.api";
import {
  formatLeadCurrency,
  formatLeadDate,
  formatLeadDateTime,
  formatLifecycleStatus,
  formatPhone,
  getLeadProjectName,
  // getAssignedEmployeeName,
} from "@/modules/leads/leads.utils";
import { useUpdateLeadLifecycleMutation } from "@/modules/leads/leads.hooks";
import AddBuildingDialog from "@/components/leads/add-building-dialog";
import {
  LEAD_LIFECYCLE_STEPS,
  getLeadLifecycleBadgeClassName,
  getLeadLifecycleBadgeDotClassName,
  getLeadLifecycleStepId,
  getLeadLifecycleStatusLabel,
} from "@/modules/leads/lifecycle-statuses";
import {
  buildLeadScoreBreakdown,
  getLeadScoreFillColorClass,
  getLeadScoreTag,
  getLeadScoreTextColorClass,
} from "@/modules/leads/leads.scoring";
import { Badge } from "@/components/ui/badge";

type BasicDetailsProps = {
  lead: LeadDetailData;
};

export default function BasicDetails({ lead }: BasicDetailsProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const updateLifecycleStatusMutation = useUpdateLeadLifecycleMutation();

  const leadData = lead?.lead;
  const customer = lead?.customer;
  const latestQuotation =
    lead?.quotations.find((quotation) => quotation.isLatest) ??
    lead?.quotations[0];
  const sortedFollowUps = [...(lead?.followUps ?? [])].sort((left, right) => {
    const leftTime = left.followUpDate
      ? new Date(left.followUpDate).getTime()
      : 0;
    const rightTime = right.followUpDate
      ? new Date(right.followUpDate).getTime()
      : 0;

    return leftTime - rightTime;
  });
  const nextFollowUp = sortedFollowUps[0];

  const apiScoreBreakdown = lead?.lead.leadScoring?.scoreBreakdown;
  const normalizedScore = lead?.lead.leadScoring?.score ?? 0;
  const scoreBreakdown = buildLeadScoreBreakdown(apiScoreBreakdown);

  const projectTitle = getLeadProjectName(leadData as Record<string, unknown>, customer);
  const projectReference = leadData?.jobId || "—";
  const statusLabel = leadData?.lifecycleStatus
    ? formatLifecycleStatus(leadData.lifecycleStatus)
    : "—";
  const statusClassName = getLeadLifecycleBadgeClassName(
    leadData?.lifecycleStatus,
  );
  const statusDotClassName = getLeadLifecycleBadgeDotClassName(
    leadData?.lifecycleStatus,
  );
  const buildingType = leadData?.buildingType || "—";
  const quoteValue = formatLeadCurrency(
    leadData?.quoteValue ?? 0,
    latestQuotation?.currency ?? "USD",
  );
  const createdOn = formatLeadDate(leadData?.createdAt);
  const location = leadData?.location || "—";
  const contactName = customer?.firstName?.trim() || "-";
  const contactPhone = formatPhone(customer?.phone);
  const contactEmail = customer?.email || "—";
  const contactAddress = leadData?.location || "—";
  // const assignedToName =
  //   getAssignedEmployeeName(lead?.auditLog ?? []) ||
  //   (leadData?.assignedSales ?? "Unassigned");
  // const assignmentSummary = leadData?.assignedSales
  //   ? "Sales rep assigned to this lead"
  //   : "No sales rep assigned yet";
  const signedAgreementSummary = leadData?.documents?.length
    ? `${leadData.documents.length} document${leadData.documents.length === 1 ? "" : "s"} attached`
    : "No signed agreement uploaded";
  const activeStatus =
    selectedStatus ?? leadData?.lifecycleStatus ?? "initial_contact";
  const currentStepId = getLeadLifecycleStepId(activeStatus);
  const allowedManualStatuses = [
    "proposal_sent",
    "negotiation",
    "deal_closed",
    "payment_done",
    ...(currentStepId < 2 ? ["requirements_gathered"] : []),
  ];
  const hasSelectableNextStep = LEAD_LIFECYCLE_STEPS.some(
    (step) =>
      allowedManualStatuses.includes(step.value) &&
      step.id > currentStepId
  );
  const signedAgreementDate = nextFollowUp?.followUpDate
    ? `Next follow-up: ${formatLeadDate(nextFollowUp.followUpDate)}`
    : "No follow-up scheduled";
  // const leadStartDate = formatLeadDate(leadData?.createdAt);
  const targetCompletionDate = latestQuotation?.validTill
    ? formatLeadDate(latestQuotation.validTill)
    : "—";
  // const assignedPlanner = leadData?.assignedSales ?? "—";
  const priorityLabel =
    latestQuotation?.priorityLevel ?? nextFollowUp?.priority ?? "—";
  const nextStepLabel = (() => {
    const activeStepIndex = LEAD_LIFECYCLE_STEPS.findIndex(
      (step) => step.value === activeStatus,
    );
    const nextStep = LEAD_LIFECYCLE_STEPS[activeStepIndex + 1];

    return nextStep
      ? getLeadLifecycleStatusLabel(nextStep.value)
      : "No further steps";
  })();

  const selectedStepId = useMemo(
    () => getLeadLifecycleStepId(activeStatus),
    [activeStatus],
  );
  const totalLifecycleSteps = LEAD_LIFECYCLE_STEPS.length;
  const progressWidth =
    totalLifecycleSteps > 1
      ? ((selectedStepId - 1) / (totalLifecycleSteps - 1)) * 100
      : 0;
  const currentLifecycleStep =
    LEAD_LIFECYCLE_STEPS.find((step) => step.value === activeStatus) ??
    LEAD_LIFECYCLE_STEPS[0];
  const currentLifecycleLabel = currentLifecycleStep
    ? getLeadLifecycleStatusLabel(currentLifecycleStep.value)
    : "—";
  const noOfBuildings = lead.lead.numberOfBuildings

  const handleOpenStatusDialog = () => {
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = async (status: string) => {
    if (!leadData?._id) {
      return;
    }

    await updateLifecycleStatusMutation.mutateAsync({
      leadId: leadData._id,
      lifecycleStatus: status,
    });

    setSelectedStatus(status);
    setSuccessDialogOpen(true);
  };
  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <Card className="">
        <CardHeader className="border-b  flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FC]">
              <Building2 className="h-6 w-6 text-[#1D51A4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-slate-800">
                  {projectTitle}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${statusClassName}`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusDotClassName}`}
                  ></span>
                  {statusLabel}
                </span>
              </div>
              <p className="text-[13px] text-slate-500 mt-1">
                {projectReference}
              </p>
            </div>
          </div>

          <AddBuildingDialog
            leadId={leadData?._id}
            currentNoOfBuildings={noOfBuildings}
          />
        </CardHeader>

        <CardContent className="pb-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div>
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="">Building Type</p>
                <p className="text-sm text-muted-foreground">{buildingType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="">No. of Buildings</p>
                <p className="text-sm text-muted-foreground">{noOfBuildings}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="">Quote Value</p>
                <p className="text-sm text-muted-foreground">{quoteValue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="">Created On</p>
                <p className="text-sm text-muted-foreground">{createdOn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="">Location</p>
                <p className="text-sm text-muted-foreground">{location}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Contact Information
              </h3>
              <div className="bg-[#F8FAFC] rounded-xl p-4 flex gap-4">
                <div className="flex-1 space-y-2">
                  <p className=" mb-1">{contactName}</p>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex text-[13px]">
                      <span className="text-slate-500 w-16">Phone</span>
                      <span className="font-medium text-slate-800">
                        {contactPhone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex text-[13px]">
                      <span className="text-slate-500 w-16">Email</span>
                      <a
                        href={
                          contactEmail === "—"
                            ? undefined
                            : `mailto:${contactEmail}`
                        }
                        className="font-medium text-[#1D51A4] hover:underline"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex text-sm">
                      <span className="text-slate-500 w-16">Address</span>
                      <span className="font-medium text-slate-800">
                        {contactAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Assignment
              </h3>
              <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="">
                    Assigned to:
                    <span className="text-sm text-muted-foreground">
                      {assignedToName}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assignmentSummary}
                  </p>
                </div>
              </div>
            </div> */}

            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Signed Contract/Agreement
              </h3>
              <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="">Signed contract/Agreement</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {signedAgreementSummary}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {signedAgreementDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Project Lifecycle */}
      <Card className="">
        <CardHeader>
          <CardTitle>Project Lifecycle</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative min-w-225 mb-8">
            <div className="absolute top-3.5 mx-5 bg-[#1D51A4] left-3 right-3 h-0.5  "></div>
            <div
              className="absolute top-2.75 left-3 h-0.5 bg-[#1D51A4] -z-10"
              style={{ width: `${progressWidth}%` }}
            ></div>

            <div className="flex justify-between">
              {LEAD_LIFECYCLE_STEPS.map((step) => {
                const isCompleted = step.id < selectedStepId;
                const isCurrent = step.id === selectedStepId;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center group relative w-16"
                  >
                    <div
                      className={`flex size-8 items-center justify-center rounded-full  font-semibold mb-2 z-10 transition-colors
                      ${isCompleted
                          ? "bg-[#16A34A] text-white border-2 border-white"
                          : isCurrent
                            ? "bg-[#1D51A4] text-white border-2 border-white"
                            : "bg-white border-2 border-[#E2E8F0] text-slate-400"
                        }`}
                    >
                      {step.id}
                    </div>
                    <div className="text-center font-medium">
                      <p
                        className={`text-[11px] whitespace-pre-line leading-tight ${isCurrent ? "text-[#1D51A4]" : "text-slate-600"}`}
                      >
                        {step.label}
                      </p>
                      {step.labelSub && (
                        <p className="text-[10px] text-slate-400 whitespace-pre-line mt-1">
                          {step.labelSub}
                        </p>
                      )}
                      {step.date && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {step.date}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#F8FAFC] rounded-xl p-5 mb-5 border border-slate-100 divide-x divide-slate-600">
            <div>
              <p className=" mb-1">
                Progress ({selectedStepId} of {totalLifecycleSteps})
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Current step: {currentLifecycleLabel}
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Lead Assigned</p>
                  <p className="text-sm text-muted-foreground">
                    {leadData?.assignedSales?.assignedAt
                      ? formatLeadDate(leadData.assignedSales.assignedAt)
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Payment Done</p>
                  <p className="text-sm text-muted-foreground">-</p>
                </div>
              </div>
            </div>

            <div>
              {/* <p className=" mb-0.5 font-semibold">Assigned Sales</p>
              <p className="text-sm text-muted-foreground mb-2">
                {assignedPlanner}
              </p> */}
              <p className=" mb-0.5 font-semibold">Priority</p>
              <p className="inline-flex items-center rounded-lg bg-[#FEF3C7] px-2 py-0.5 text-[13px] font-medium text-[#D97706]">
                {priorityLabel}
              </p>
            </div>

            <div>
              <p className=" mb-1 ">Next Step</p>
              <p className="text-sm text-muted-foreground">{nextStepLabel}</p>
              {nextStepLabel && (
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically sent to admin and accounts
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px]"
              onClick={handleOpenStatusDialog}
              disabled={
                updateLifecycleStatusMutation.isPending ||
                !leadData?._id ||
                !hasSelectableNextStep
              }
            >
              Update Step Status
            </Button>
            {/* <Button
              variant="outline"
              className="border-[#1D51A4] text-[#1D51A4] hover:bg-slate-50 rounded-[6px]"
            >
              Add Notes
            </Button> */}
            <AddNotesDialog leadId={leadData?._id} />
          </div>

          <UpdateStatusDialog
            key={statusDialogOpen ? `open-${activeStatus}` : "closed"}
            open={statusDialogOpen}
            currentStatus={activeStatus}
            steps={LEAD_LIFECYCLE_STEPS}
            onOpenChange={setStatusDialogOpen}
            onSave={handleSaveStatus}
          />

          <SuccessDialog
            open={successDialogOpen}
            onClose={() => setSuccessDialogOpen(false)}
            title="Status Updated Successfully"
          />
        </CardContent>
      </Card>

      {/* Grid: Status, Activity, Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 items-center">
          <div className="w-full flex justify-start mb-4">
            <h3 className="text-[16px] font-bold text-slate-800">
              Project Status
            </h3>
          </div>

          <div className="relative w-32 h-32 mb-6">
            {/* SVG Circle Progress */}
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={
                  251.2 - (251.2 * selectedStepId) / totalLifecycleSteps
                }
                className="text-[#1D51A4]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="">Step</span>
              <span className="text-[28px] font-bold text-slate-800 leading-none">
                {selectedStepId}
              </span>
              <span className="text-[11px] text-slate-500">
                of {totalLifecycleSteps}
              </span>
            </div>
          </div>

          <div className="w-full text-left space-y-4">
            <div>
              <p className="">Current step</p>
              <p className="text-[14px] font-medium text-[#1D51A4]">
                {currentLifecycleLabel}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-slate-600" />
                <p className="text-[13px] font-semibold text-slate-800">
                  Started on
                </p>
              </div>
              <p className="text-[13px] text-slate-500 ml-6">
                {formatLeadDate(leadData?.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 mb-1">
                Estimate Completion
              </p>
              <p className="text-[13px] text-slate-500">
                {targetCompletionDate}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[16px] font-bold text-slate-800 mb-6">
            Recent Activity
          </h3>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.25 top-2 bottom-2 w-px bg-slate-200"></div>

            {lead?.activityLog && lead.activityLog.length > 0 ? (
              lead.activityLog.map((entry, index) => {
                const id = entry._id ?? index;
                const title =
                  entry?.metadata?.activityType ||
                  entry.action ||
                  entry.type ||
                  "";
                const message = entry?.metadata?.notes ?? "";
                const outcome = entry?.metadata?.outcome
                  ? ` — ${entry.metadata.outcome}`
                  : "";
                const timestamp = formatLeadDateTime(entry.createdAt);

                return (
                  <div key={id} className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-[3px] border-[#8B5CF6]"></div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> {timestamp}
                    </p>
                    {message && (
                      <p className="text-[13px] text-slate-600 mt-2 whitespace-pre-line">
                        {message}
                        <span className="">{outcome}</span>
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="mx-auto h-6 w-6 text-slate-400" />
                <p className="font-medium mt-2">No recent activity</p>
                <p className="text-sm mt-1">
                  Activity will appear here when available.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 gap-0">
          <h3 className="text-[16px] font-bold text-slate-800 mb-4">Notes</h3>
          <div className="space-y-4 text-[13px] text-slate-600">
            {lead?.leadNotes?.length ? (
              <>
                {lead?.leadNotes?.map((note) => (
                  <div key={note._id} className="space-y-2">
                    <p className="whitespace-pre-line">{note.note}</p>
                    <p className="text-xs flex flex-col text-muted-foreground gap-1">
                      {note.addedBy.name}
                      <span className="">
                        {formatLeadDate(note.addedAt)}
                      </span>
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-6 text-center text-slate-500">
                <p className="font-medium text-slate-800 mb-1">No notes yet</p>
                <p className="text-sm">
                  Add notes to keep track of communications.
                </p>
                <div className="mt-3 flex justify-center">
                  {/* <AddNotesDialog onSave={handleSaveNote} /> */}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:w-3/4 gap-4">
        <div className="p-4 rounded-lg border bg-white">
          <div className="text-xs tracking-wider text-gray-500 font-semibold">
            LEAD SCORING
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span
              className={`text-4xl font-bold leading-none ${getLeadScoreTextColorClass(
                normalizedScore,
              )}`}
            >
              {normalizedScore}
            </span>
            <span className="text-gray-400 text-lg">/100</span>
          </div>
          <div className="mt-3">
            <Badge
              variant="secondary"
              className={`${getLeadScoreFillColorClass(normalizedScore)} text-white`}
            >
              {getLeadScoreTag(normalizedScore)}
            </Badge>
          </div>
        </div>

        <div className="lg:col-span-2 p-4 rounded-lg border bg-white">
          <div className="text-xs tracking-wider text-gray-500 font-semibold mb-3">
            SCORE BREAKDOWN
          </div>

          <div className="space-y-3">
            {scoreBreakdown.map((item) => {
              const itemPercent = Math.max(
                0,
                Math.min(100, (item.value / item.max) * 100),
              );
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">
                      {item.label}
                    </span>
                    <span
                      className={`font-semibold ${getLeadScoreTextColorClass(
                        item.value,
                      )}`}
                    >
                      {item.value}/{item.max}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getLeadScoreFillColorClass(
                        item.value,
                      )}`}
                      style={{ width: `${itemPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.hint}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
