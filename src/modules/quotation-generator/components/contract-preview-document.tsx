import React from "react";
import { cn } from "@/lib/utils";
import {
  useQuotationPricing,
  type UseQuotationPricingParams,
} from "../hooks/use-quotation-pricing";

export interface ContractPreviewDocumentProps extends UseQuotationPricingParams {
  className?: string;
  id?: string;
  effectiveDate?: string;
  customerLegalName?: string;
  customerAddress?: string;
  customerCityStateZip?: string;
  customerEmail?: string;
  depositPct?: string;
  totalContractValue?: string;
  contractType?: string;
  contractTitle?: string;
  companyName?: string;
  companyShortName?: string;
  companyDba?: string;
  companySignerName?: string;
  companySignerTitle?: string;
  customerSignerName?: string;
  scopeDescription?: string;
  governingState?: string;
  governingCounty?: string;
}

export const ContractPreviewDocument = React.forwardRef<
  HTMLDivElement,
  ContractPreviewDocumentProps
>(function ContractPreviewDocument(props, ref) {
  const {
    className,
    id,
    effectiveDate: propEffectiveDate,
    customerLegalName: propCustomerLegalName,
    customerAddress: propCustomerAddress,
    customerCityStateZip: propCustomerCityStateZip,
    customerEmail: propCustomerEmail,
    depositPct = "forty-percent (40%)",
    totalContractValue: propTotalContractValue,
    contractType,
    contractTitle,
    companyName = "Steel Investments, LLC",
    companyShortName = "Steel",
    companySignerName = "Travis Overhue",
    companySignerTitle = "Owner",
    customerSignerName = "TBD",
    scopeDescription: propScopeDescription,
    governingState = "Delaware",
    governingCounty = "Douglas County, Nebraska",
    ...pricingParams
  } = props;

  const pricingData = useQuotationPricing(pricingParams);

  const effectiveDate =
    propEffectiveDate ||
    pricingData.quoteDate ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const customerLegalName =
    propCustomerLegalName ||
    pricingData.customerLeadName ||
    "";

  const customerAddress =
    propCustomerAddress ||
    pricingData.customerAddress ||
    "";

  const customerCityStateZip = propCustomerCityStateZip || "";

  const customerEmail =
    propCustomerEmail ||
    pricingData.customerEmail ||
    "";

  const customerDisplayName =
    customerLegalName ||
    (customerAddress && customerCityStateZip
      ? `${customerAddress}, ${customerCityStateZip}`
      : customerAddress || customerCityStateZip) ||
    "Customer";

  const totalContractValue =
    propTotalContractValue ||
    pricingData.grandTotalFormatted ||
    "-";

  const agreementTitle =
    contractTitle ||
    (contractType
      ? contractType.toLowerCase().includes("agreement")
        ? contractType
        : `${contractType} Agreement`
      : "Fabrication & Supply Agreement");

  const scopeDescription =
    propScopeDescription ||
    "Fabrication and supply of pre-engineered metal building materials and systems.";

  return (
    <div
      ref={ref}
      id={id || "contract-preview-document"}
      className={cn(
        "border border-slate-200 rounded-xl p-6 md:p-10 bg-white space-y-5 shadow-2xs text-slate-900 text-xs leading-relaxed print-card font-serif",
        className
      )}
    >
      {/* Top Header Title with line matching image */}
      <div className="text-center pb-3 border-b border-[#1E3A8A]">
        <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight font-serif">
          {agreementTitle}
        </h1>
      </div>

      {/* Sub-header text on left */}
      <div className="text-xs font-semibold text-slate-900 font-serif">
        {agreementTitle}
      </div>

      {/* Contract Body Paragraphs */}
      <div className="space-y-4 text-slate-900 text-xs leading-relaxed font-serif">
        <p>
          This {agreementTitle} (&quot;Agreement&quot;), dated as of{" "}
          <span className="font-semibold">{effectiveDate}</span> (&quot;Effective Date&quot;), is
          entered into by and between {companyName} (&quot;{companyShortName}&quot;), and{" "}
          <span className="font-semibold">{customerDisplayName}</span> (&quot;Customer&quot;).
        </p>

        <p>
          <strong>Purchase and Sale of Goods.</strong> Subject to the terms and conditions of
          this Agreement, Customer shall purchase, and {companyShortName} shall fabricate and sell, the Goods
          set forth in Exhibit A. Upon {companyShortName}&apos;s receipt of Customer&apos;s first deposit, Customer agrees
          to purchase all Goods under Exhibit A and further agrees that Customer may not cancel
          or request revisions to the Goods.
        </p>

        <p>
          <strong>Engineering Drawings.</strong> {companyShortName} will commence engineering drawing for the
          Goods upon Customer&apos;s payment of the first deposit.
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

        <div className="space-y-1">
          <p className="font-bold text-slate-900">Price and Payment.</p>
          <p>
            <strong>Price.</strong> Customer shall purchase the Goods from {companyShortName} at the price set
            forth in Exhibit A. The Price may fluctuate due to variations in the cost of raw materials,
            labor, transport, or overhead expenses.
          </p>
        </div>

        <p>
          <strong>Deposit.</strong> Customer acknowledges and agrees that {companyShortName} requires an
          upfront, non-refundable deposit of {depositPct} for purposes of procuring materials,
          payable in two installments: (i) ten-percent (10%) of the Price due upon the Effective Date; and (ii) thirty-percent (30%) due upon engineer approval.
        </p>

        <p>
          <strong>Payment Terms.</strong> Upon completion of fabrication, {companyShortName} shall invoice
          Customer for all remaining amounts. Customer shall pay all invoiced amounts at least
          two (2) days prior to shipment.
        </p>

        <p>
          <strong>Late Payments.</strong> Customer Shall pay interest on all late payments at 1.5%
          per month. Customer shall reimburse {companyShortName} for all costs incurred in collecting late
          payments, including attorneys&apos; fees.
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
          {companyShortName.toUpperCase()} SHALL NOT BE LIABLE FOR CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, OR PUNITIVE
          DAMAGES.
        </p>

        <p>
          <strong>Force Majeure.</strong> {companyShortName} shall not be liable for any failure or delay in
          fulfilling any term of this Agreement when caused by circumstances beyond its
          reasonable control.
        </p>

        <p>
          <strong>Governing Law.</strong> This Agreement shall be governed by the Laws of the State
          of {governingState}. Any disputes shall be brought in the appropriate courts located in{" "}
          {governingCounty}.
        </p>
      </div>

      {/* EXHIBIT A — GOODS Section */}
      <div className="pt-4 space-y-1 font-serif text-xs">
        <p className="font-bold text-slate-900 uppercase">EXHIBIT A — GOODS</p>
        <p>
          Total Contract Value:{" "}
          <span className="font-semibold">{totalContractValue}</span>
        </p>
        <p>
          Scope: <span className="font-normal">{scopeDescription}</span>
        </p>
      </div>

      {/* SIGNATURES Section */}
      <div className="pt-6 space-y-6 font-serif text-xs">
        <p className="font-bold text-slate-900 uppercase tracking-wide">SIGNATURES</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-2">
          {/* Company Signatory */}
          <div className="space-y-6">
            <p className="font-bold text-slate-900 uppercase">{companyName}</p>
            <div className="border-b border-slate-900 pt-6 flex justify-between pb-1 text-[10px] text-slate-600 font-sans">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
            <div className="space-y-0.5 text-xs text-slate-800">
              <p>Name: {companySignerName}</p>
              <p>Title: {companySignerTitle}</p>
            </div>
          </div>

          {/* Customer Signatory */}
          <div className="space-y-6">
            <p className="font-bold text-slate-900 uppercase">{customerDisplayName}</p>
            <div className="border-b border-slate-900 pt-6 flex justify-between pb-1 text-[10px] text-slate-600 font-sans">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
            <div className="space-y-0.5 text-xs text-slate-800">
              <p>{customerSignerName}</p>
              <p>{customerEmail || "[E-MAIL ADDRESS]"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

