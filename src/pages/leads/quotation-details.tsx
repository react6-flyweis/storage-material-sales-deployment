import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Printer,
  FileCheck,
  Send,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Logo from "@/assets/the-steel-logo-dark.svg";
import { useQuotationQuery } from "@/modules/quotations/quotations.hooks";
import { SubmitApprovalModal } from "@/modules/quotation-generator/components/submit-approval-modal";
import { SendQuotationModal } from "@/modules/quotation-generator/components/send-quotation-modal";
import type {
  WorkflowStatus,
  QuotationItem,
} from "@/modules/quotations/quotations.api";

export default function QuotationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  // Fetch quotation details with includeEstimate=true and includeDocuments=true
  const {
    data: quotationResponse,
    isLoading,
    isError,
    refetch,
  } = useQuotationQuery(id, {
    includeEstimate: true,
    includeDocuments: true,
  });

  const quotation =
    (quotationResponse?.data as { quotation?: QuotationItem })?.quotation ||
    (quotationResponse?.data as QuotationItem);
  const estimate = quotation?.sourceEstimate || quotation?.estimate;

  const quoteNumber =
    quotation?.quoteNumber || estimate?.quoteNumber || "QUO-DRAFT";
  const workflowStatus: WorkflowStatus =
    quotation?.workflowStatus ||
    (quotation?.approval?.status as WorkflowStatus) ||
    (quotation?.approvalStatus as WorkflowStatus) ||
    "draft";
  const versionNumber =
    quotation?.versionNumber || estimate?.versionNumber || 1;

  const customerName =
    quotation?.companyName ||
    (typeof quotation?.customerId === "object"
      ? quotation?.customerId?.firstName
      : null) ||
    (typeof quotation?.leadId === "object"
      ? quotation?.leadId?.projectName
      : null) ||
    estimate?.leadCompanyName ||
    "Valued Customer";

  const customerEmail =
    (typeof quotation?.customerId === "object"
      ? quotation?.customerId?.email
      : null) ||
    (typeof quotation?.createdBy === "object"
      ? quotation?.createdBy?.email
      : null) ||
    estimate?.customerEmail ||
    "";

  const customerAddress =
    quotation?.location ||
    estimate?.cityStateZip ||
    estimate?.streetAddress ||
    "United States";

  const quoteDate =
    quotation?.proposalDate || quotation?.createdAt
      ? new Date(
          quotation.proposalDate || quotation.createdAt || "",
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : estimate?.quoteDate || new Date().toLocaleDateString();

  const finalAmount =
    Number(
      quotation?.finalPrice ??
        quotation?.basePrice ??
        estimate?.totalSell ??
        estimate?.grandTotal ??
        0,
    ) || 0;

  const squareFootage = Number(
    quotation?.totalArea ||
      quotation?.sqft ||
      estimate?.squareFootage ||
      estimate?.sf ||
      0,
  );

  const pricePerSf =
    Number(quotation?.psf) ||
    (squareFootage > 0 && finalAmount > 0
      ? Number((finalAmount / squareFootage).toFixed(2))
      : 0);

  const materialCost = Number(quotation?.materialCost) || 0;
  const freightCost = Number(quotation?.freightCost) || 0;
  const totalCogs = Number(quotation?.totalCOGS) || 0;
  const jobType = quotation?.buildingType || estimate?.jobType || "PEMB";
  const buildingSize =
    estimate?.buildingSize || `${jobType} Structure (${squareFootage} SF)`;
  const scope = estimate?.scope || "Supply";
  const rawEstimateId =
    quotation?.sourceEstimateId ||
    estimate?._id ||
    quotation?.documentMeta?.sourceEstimateId;
  const sourceEstimateId =
    typeof rawEstimateId === "object" && rawEstimateId !== null
      ? (rawEstimateId as { _id?: string })._id
      : (rawEstimateId as string | undefined);

  const approval = quotation?.approval;
  const statusReason =
    approval?.rejectionReason ||
    approval?.history?.filter((h) => Boolean(h?.note)).slice(-1)[0]?.note ||
    (workflowStatus === "rejected" ? "Needs update and resubmission" : null);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Quotation_${quoteNumber}`;
    window.print();
    document.title = originalTitle;
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-100 gap-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading quotation details...
        </p>
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className="p-8 space-y-4 max-w-2xl mx-auto text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">
          Quotation Not Found
        </h2>
        <p className="text-sm text-slate-600">
          Could not find the requested quotation. It may have been deleted or
          the ID is invalid.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Go Back
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/leads/quotation-list")}
          >
            All Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="px-4 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Quotation #{quoteNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Version v{versionNumber} · Created on {quoteDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {sourceEstimateId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(`/quotation/history/${sourceEstimateId}`);
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Source Estimate
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print
          </Button>

          {/* Workflow Action Buttons */}
          {workflowStatus === "draft" && (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowSubmitModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <FileCheck className="h-3.5 w-3.5 mr-1" />
              Submit for Approval
            </Button>
          )}

          {workflowStatus === "approved" && (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowSendModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              Send to Customer
            </Button>
          )}
        </div>
      </div>

      {/* Inline Small Status & Reason Banner */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg border text-xs no-print",
          workflowStatus === "rejected" &&
            "bg-rose-50 border-rose-200 text-rose-900",
          workflowStatus === "pending_approval" &&
            "bg-amber-50 border-amber-200 text-amber-900",
          workflowStatus === "approved" &&
            "bg-emerald-50 border-emerald-200 text-emerald-900",
          workflowStatus === "sent" &&
            "bg-blue-50 border-blue-200 text-blue-900",
          workflowStatus === "draft" &&
            "bg-slate-50 border-slate-200 text-slate-700",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          {workflowStatus === "rejected" && (
            <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {workflowStatus === "pending_approval" && (
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          {workflowStatus === "approved" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          {workflowStatus === "sent" && (
            <Send className="h-4 w-4 text-blue-600 shrink-0" />
          )}
          {workflowStatus === "draft" && (
            <FileText className="h-4 w-4 text-slate-500 shrink-0" />
          )}

          <span className="font-bold uppercase tracking-wider text-[11px]">
            {workflowStatus === "pending_approval"
              ? "Pending Approval"
              : workflowStatus === "approved"
                ? "Approved"
                : workflowStatus === "rejected"
                  ? "Rejected"
                  : workflowStatus === "sent"
                    ? "Sent to Customer"
                    : "Draft"}
          </span>

          {statusReason && (
            <>
              <span className="opacity-40 font-bold">•</span>
              <span className="text-slate-700">
                <span className="font-semibold text-slate-500">Reason:</span>{" "}
                {statusReason}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Quotation Document Card */}
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-12 relative">
        {/* Header Branding & Company Details */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-8 border-b border-slate-200">
          <div className="space-y-3">
            <img src={Logo} alt="The Steel Logo" className="w-36 h-auto" />
            <div className="text-xs text-slate-500 leading-relaxed font-normal">
              <p className="font-bold text-slate-700">
                The Steel Building Depot
              </p>
              <p>1851 Madison Ave Suite 300</p>
              <p>Council Bluffs, IA 51503, United States</p>
              <p>contact@thesteelcompany.com</p>
            </div>
          </div>

          <div className="text-right space-y-1 pt-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-wider uppercase">
              QUOTATION
            </h2>
            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-semibold text-slate-400 mr-2">
                  QUOTE NUMBER:
                </span>
                <span className="font-bold text-slate-800">#{quoteNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 mr-2">DATE:</span>
                <span className="font-bold text-slate-800">{quoteDate}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 mr-2">
                  VALID FOR:
                </span>
                <span className="font-bold text-slate-800">30 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Job Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 p-5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
              QUOTED TO
            </div>
            <div className="text-sm font-bold text-slate-900">
              {customerName}
            </div>
            {customerEmail && (
              <div className="text-xs text-slate-600 mt-0.5">
                {customerEmail}
              </div>
            )}
            <div className="text-xs text-slate-500 mt-1">{customerAddress}</div>
          </div>

          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
              PROJECT SPECIFICATIONS
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Job Type:</span>
                <span className="font-semibold">{jobType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scope:</span>
                <span className="font-semibold">{scope}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Building Size:</span>
                <span className="font-semibold">{buildingSize}</span>
              </div>
              {squareFootage > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Area:</span>
                  <span className="font-semibold">
                    {squareFootage.toLocaleString()} SF
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-10">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Qty / Size</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Main Building Package */}
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>{buildingSize} Steel Structure</div>
                    <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                      Scope: {scope} · Engineered steel building package
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">
                    {squareFootage > 0
                      ? `${squareFootage.toLocaleString()} SF`
                      : "1 Unit"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    $
                    {finalAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>

                {/* Additional notes or items */}
                {estimate?.concreteAddon?.include && (
                  <tr>
                    <td className="py-3 px-4 text-slate-700">
                      <div>
                        Concrete Slab Add-on (
                        {estimate.concreteAddon.slabThickness || '4"'},{" "}
                        {estimate.concreteAddon.psi || "3000"} PSI)
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {squareFootage} SF
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      Included in Package
                    </td>
                  </tr>
                )}

                {estimate?.insulationAddon?.include && (
                  <tr>
                    <td className="py-3 px-4 text-slate-700">
                      <div>
                        Insulation System (
                        {estimate.insulationAddon.system || "Standard"})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {squareFootage} SF
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      Included in Package
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="w-full md:w-1/2 space-y-2 text-xs text-slate-500">
            <p className="font-bold text-slate-700 uppercase tracking-wider">
              Terms & Conditions
            </p>
            <p>
              This quotation is valid for 30 calendar days from date of
              issuance. Prices reflect standard site conditions and design loads
              as specified.
            </p>
            <p>
              By approving or signing, the client accepts the specifications and
              pricing presented herein.
            </p>
          </div>

          <div className="w-full md:w-80 space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            {materialCost > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Material Cost</span>
                <span>
                  $
                  {materialCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {freightCost > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Freight Cost</span>
                <span>
                  $
                  {freightCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {totalCogs > 0 && (
              <div className="flex justify-between text-xs text-slate-600 font-medium pt-1 border-t border-slate-200">
                <span>Total COGS</span>
                <span>
                  $
                  {totalCogs.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Subtotal</span>
              <span>
                $
                {finalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {pricePerSf > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Unit Price</span>
                <span className="font-semibold text-slate-700">
                  ${pricePerSf.toFixed(2)}/SF
                </span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
              <span>Final Sell Price</span>
              <span className="text-[#2563eb]">
                $
                {finalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Line */}
        <div className="flex justify-end pt-8 border-t border-slate-200">
          <div className="w-64 text-center">
            <div className="border-b border-slate-400 mb-2 h-12" />
            <p className="text-xs text-slate-500 font-medium">
              Authorized Signature & Date
            </p>
          </div>
        </div>
      </Card>

      {/* Modals for Approval & Send */}
      <SubmitApprovalModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        quotationId={quotation._id}
        quotationTitle={`Quotation #${quoteNumber} - ${customerName}`}
        quotationNumber={quoteNumber}
        versionNumber={versionNumber}
        totalAmount={`$${finalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        onSuccess={() => {
          void refetch();
        }}
      />

      <SendQuotationModal
        open={showSendModal}
        onOpenChange={setShowSendModal}
        quotationId={quotation._id}
        customerEmail={customerEmail}
        customerName={customerName}
        approvalStatus={workflowStatus}
        versionNumber={versionNumber}
        onSuccess={() => {
          void refetch();
        }}
      />
    </div>
  );
}
