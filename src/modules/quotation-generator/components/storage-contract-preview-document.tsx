import React from "react";
import { cn } from "@/lib/utils";

export interface StorageContractPreviewDocumentProps {
  className?: string;
  id?: string;
  effectiveDate?: string;
  customerLegalName?: string;
  customerAddress?: string;
  depositPct?: string;
  totalContractValue?: string;
  scope?: string;
  contractType?: string;
  contractTitle?: string;
  companyName?: string;
  companyShortName?: string;
  governingState?: string;
  governingCounty?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export const StorageContractPreviewDocument = React.forwardRef<
  HTMLDivElement,
  StorageContractPreviewDocumentProps
>(function StorageContractPreviewDocument(props, ref) {
  const {
    className,
    id,
    effectiveDate: propEffectiveDate,
    customerLegalName: propCustomerLegalName,
    customerAddress: propCustomerAddress,
    depositPct = "forty-percent (40%)",
    totalContractValue = "$1,48,330",
    scope = "Both",
    contractType,
    contractTitle = "Fabrication & Supply Agreement",
    companyName = "Steel Investments, LLC",
    companyShortName = "Steel",
    governingState = "Delaware",
    governingCounty = "Douglas County, Nebraska",
    signatoryName = "Travis Overhue",
    signatoryTitle = "Owner",
  } = props;

  const effectiveDate =
    propEffectiveDate ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const customerLegalName = propCustomerLegalName || "[CUSTOMER]";
  const customerAddress = propCustomerAddress || "";

  const isSupply = scope.toLowerCase() === "supply";
  const isInstall = scope.toLowerCase() === "install";
  
  const formattedScope = contractType || (
    isSupply
      ? "Self-storage building supply & delivery."
      : isInstall
      ? "Self-storage building erection."
      : "Self-storage building supply, delivery & installation."
  );

  return (
    <div
      ref={ref}
      id={id || "storage-contract-preview-document"}
      className={cn(
        "border border-slate-200 rounded-xl p-6 md:p-10 bg-white space-y-5 shadow-2xs text-slate-800 text-[11px] md:text-xs leading-relaxed print-card font-serif",
        className
      )}
    >
      {/* Top Blue Accent Line */}
      <div className="border-t-[3px] border-[#1E3A8A] pt-2" />

      {/* Document Main Title Header */}
      <h1 className="text-base md:text-lg font-bold text-slate-900 text-center tracking-tight font-serif mb-6">
        {contractTitle}
      </h1>

      {/* Sub Header */}
      <div className="text-xs font-semibold text-slate-900 mb-3 font-sans">
        {contractTitle}
      </div>

      {/* Contract Clauses */}
      <div className="space-y-3.5 font-normal text-slate-800 text-[11px] md:text-xs leading-relaxed font-sans">
        <p>
          This Fabrication & Supply Agreement ("Agreement"), dated as of{" "}
          <span className="font-semibold">{effectiveDate}</span> ("Effective Date"), is entered
          into by and between {companyName} ("{companyShortName}"), and{" "}
          <span className="font-semibold">{customerLegalName}</span> ("Customer").
        </p>

        <p>
          <strong>Purchase and Sale of Goods.</strong> Subject to the terms and conditions of this
          Agreement, Customer shall purchase, and {companyShortName} shall fabricate and sell, the Goods set
          forth in Exhibit A. Upon {companyShortName}'s receipt of Customer's first deposit, Customer agrees
          to purchase all Goods under Exhibit A and further agrees that Customer may not cancel or
          request revisions to the Goods.
        </p>

        <p>
          <strong>Engineering Drawings.</strong> {companyShortName} will commence engineering drawing for the
          Goods upon Customer's payment of the first deposit.
        </p>

        <p>
          <strong>Delivery.</strong> The Goods will be delivered to{" "}
          {customerAddress ? (
            <span className="font-semibold">{customerAddress}</span>
          ) : (
            "the location specified by Customer"
          )}{" "}
          using standard methods for packaging and shipping.
        </p>

        <div>
          <p className="font-bold text-slate-900 mb-0.5">Price and Payment.</p>
          <p>
            Price. Customer shall purchase the Goods from {companyShortName} at the price set forth in Exhibit
            A. The Price may fluctuate due to variations in the cost of raw materials, labor,
            transport, or overhead expenses.
          </p>
        </div>

        <p>
          <strong>Deposit.</strong> Customer acknowledges and agrees that {companyShortName} requires an
          upfront, non-refundable deposit of {depositPct} for purposes of procuring materials, payable
          in two installments: (i) ten-percent (10%) of the Price due upon the Effective Date; and
          (ii) thirty-percent (30%) due upon engineer approval.
        </p>

        <p>
          <strong>Payment Terms.</strong> Upon completion of fabrication, {companyShortName} shall invoice
          Customer for all remaining amounts. Customer shall pay all invoiced amounts at least two (2)
          days prior to shipment.
        </p>

        <p>
          <strong>Late Payments.</strong> Customer shall pay interest on all late payments at 1.5% per
          month. Customer shall reimburse {companyShortName} for all costs incurred in collecting late
          payments, including attorneys' fees.
        </p>

        <p>
          <strong>Termination.</strong> {companyShortName} may immediately terminate this Agreement if Customer
          fails to pay any amount when due, or if Customer is in breach of any representation,
          warranty, or covenant.
        </p>

        <p>
          <strong>Limited Product Warranty.</strong> {companyShortName} warrants that the Goods shall be free
          from material defects in workmanship upon delivery. Customer shall notify {companyShortName} within
          seventy-two (72) hours of any alleged defect.
        </p>

        <p>
          <strong>Indemnification.</strong> Customer shall indemnify, defend and hold harmless{" "}
          {companyShortName} and its affiliates from any third-party claims arising from: (i) breach of this
          Agreement; (ii) negligence or willful misconduct; (iii) any bodily injury or property
          damage; or (iv) failure to comply with applicable laws.
        </p>

        <p>
          <strong>Limitation of Liability.</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW,{" "}
          {companyShortName.toUpperCase()} SHALL NOT BE LIABLE FOR CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL,
          OR PUNITIVE DAMAGES.
        </p>

        <p>
          <strong>Force Majeure.</strong> {companyShortName} shall not be liable for any failure or delay in
          fulfilling any term of this Agreement when caused by circumstances beyond its reasonable
          control.
        </p>

        <p>
          <strong>Governing Law.</strong> This Agreement shall be governed by the Laws of the State
          of {governingState}. Any disputes shall be brought in the appropriate courts located in{" "}
          {governingCounty}.
        </p>
      </div>

      {/* Exhibit A Section */}
      <div className="pt-4 space-y-1 text-slate-900 font-sans text-xs">
        <h4 className="font-bold text-slate-900 tracking-wide uppercase">EXHIBIT A – GOODS</h4>
        <p className="text-slate-800">
          Total Contract Value: <span className="font-semibold">{totalContractValue}</span>
        </p>
        <p className="text-slate-800">
          Scope: <span className="font-normal">{formattedScope}</span>
        </p>
      </div>

      {/* Signatures Section */}
      <div className="pt-6 space-y-6 font-sans text-xs">
        <h4 className="font-bold text-slate-900 tracking-wider uppercase">SIGNATURES</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Steel Signature Block */}
          <div className="space-y-6">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide">{companyName}</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-500">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
            <div className="space-y-0.5 text-slate-800 text-[11px]">
              <p>
                <span className="font-medium">Name:</span> {signatoryName}
              </p>
              <p>
                <span className="font-medium">Title:</span> {signatoryTitle}
              </p>
            </div>
          </div>

          {/* Customer Signature Block */}
          <div className="space-y-6">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide">
              {customerLegalName.startsWith("[") ? customerLegalName : `[${customerLegalName}]`}
            </h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-500">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
