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
  depositPct?: string;
  totalContractValue?: string;
  contractType?: string;
  contractTitle?: string;
  companyName?: string;
  companyShortName?: string;
  companyDba?: string;
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
    depositPct = "Forty-percent (40%)",
    totalContractValue: propTotalContractValue,
    contractType,
    contractTitle,
    companyName = "Steel Investments, LLC",
    companyShortName = "Steel",
    companyDba = "Steel Investments DBA Storage Materials",
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
    "Customer";

  const customerAddress =
    propCustomerAddress ||
    pricingData.customerAddress ||
    "";

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

  return (
    <div
      ref={ref}
      id={id || "contract-preview-document"}
      className={cn(
        "border border-slate-200 rounded-xl p-6 md:p-8 bg-white space-y-6 shadow-2xs text-slate-600 text-xs leading-relaxed print-card",
        className
      )}
    >
      {/* Document Title */}
      <h2 className="text-base font-extrabold text-slate-900 text-center uppercase tracking-wide">
        {agreementTitle}
      </h2>

      {/* Contract Content */}
      <div className="space-y-4 font-normal text-slate-600 text-xs leading-relaxed">
        <p>
          This {agreementTitle} ("Agreement"), Dated As Of{" "}
          <span className="font-semibold text-slate-900">{effectiveDate}</span>{" "}
          ("Effective Date"), Is Entered Into By And Between {companyName} ("
          {companyShortName}"), And{" "}
          <span className="font-semibold text-slate-900">{customerLegalName}</span>{" "}
          ("Customer").
        </p>

        <p>
          <strong>Purchase And Sale Of Goods.</strong> Subject To The Terms And Conditions Of
          This Agreement, Customer Shall Purchase, And {companyShortName} Shall Fabricate And Sell, The Goods
          Set Forth In Exhibit A. Upon {companyShortName}'s Receipt Of Customer's First Deposit, Customer Agrees
          To Purchase All Goods Under Exhibit A And Further Agrees That Customer May Not Cancel
          Or Request Revisions To The Goods.
        </p>

        <p>
          <strong>Engineering Drawings.</strong> {companyShortName} Will Commence Engineering Drawing For The
          Goods Upon Customer's Payment Of The First Deposit.
        </p>

        <p>
          <strong>Delivery.</strong> The Goods Will Be Delivered To{" "}
          {customerAddress ? (
            <span className="font-semibold text-slate-900">{customerAddress}</span>
          ) : (
            "The Location Specified By Customer"
          )}{" "}
          Using Standard Methods For Packaging And Shipping.
        </p>

        <p>
          <strong>Price And Payment.</strong>
          <br />
          Customer Shall Purchase The Goods From {companyShortName} At The Price Set Forth In Exhibit A. The
          Price May Fluctuate Due To Variations In The Cost Of Raw Materials, Labor, Transport, Or
          Overhead Expenses.
        </p>

        <p>
          <strong>Deposit.</strong> Customer Acknowledges And Agrees That {companyShortName} Requires An
          Upfront, Non-Refundable Deposit Of{" "}
          <span className="font-semibold text-slate-900">{depositPct}</span> For Purposes Of
          Procuring Materials, Payable In Two Installments: (i) Ten-Percent (10%) Of The Price
          Due Upon The Effective Date; And (ii) Thirty-Percent (30%) Due Upon Engineer Approval.
        </p>

        <p>
          <strong>Payment Terms.</strong> Upon Completion Of Fabrication, {companyShortName} Shall Invoice
          Customer For All Remaining Amounts. Customer Shall Pay All Invoiced Amounts At Least
          Two (2) Days Prior To Shipment.
        </p>

        <p>
          <strong>Late Payments.</strong> Customer Shall Pay Interest On All Late Payments At 1.5%
          Per Month. Customer Shall Reimburse {companyShortName} For All Costs Incurred In Collecting Late
          Payments, Including Attorneys' Fees.
        </p>

        <p>
          <strong>Termination.</strong> {companyShortName} May Immediately Terminate This Agreement If Customer
          Fails To Pay Any Amount When Due, Or If Customer Is In Breach Of Any Representation,
          Warranty, Or Covenant.
        </p>

        <p>
          <strong>Limited Product Warranty.</strong> {companyShortName} Warrants That The Goods Shall Be Free
          From Material Defects In Workmanship Upon Delivery. Customer Shall Notify {companyShortName} Within
          Seventy-Two (72) Hours Of Any Alleged Defect.
        </p>

        <p>
          <strong>Indemnification.</strong> Customer Shall Indemnify, Defend And Hold Harmless{" "}
          {companyShortName} And Its Affiliates From Any Third-Party Claims Arising From: (i) Breach Of This
          Agreement; (ii) Negligence Or Willful Misconduct; (iii) Any Bodily Injury Or Property
          Damage; Or (iv) Failure To Comply With Applicable Laws.
        </p>

        <p>
          <strong>Limitation Of Liability.</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW,{" "}
          {companyShortName.toUpperCase()} SHALL NOT BE LIABLE FOR CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, OR PUNITIVE
          DAMAGES.
        </p>

        <p>
          <strong>Force Majeure.</strong> {companyShortName} Shall Not Be Liable For Any Failure Or Delay In
          Fulfilling Any Term Of This Agreement When Caused By Circumstances Beyond Its
          Reasonable Control.
        </p>

        <p>
          <strong>Governing Law.</strong> This Agreement Shall Be Governed By The Laws Of The State
          Of {governingState}. Any Disputes Shall Be Brought In The Appropriate Courts Located In{" "}
          {governingCounty}.
        </p>

        <div className="pt-2 border-t border-slate-100 space-y-1">
          <p className="font-bold text-slate-900">EXHIBIT A — GOODS</p>
          <p>
            Total Contract Value:{" "}
            <span className="font-bold text-slate-900">{totalContractValue}</span>
          </p>
        </div>
      </div>

      {/* Dual Signatures */}
      <div className="pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
        <div>
          <h5 className="font-bold text-slate-900 mb-8">{companyDba}</h5>
          <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
            <span>Authorized Signature</span>
            <span>Date</span>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-slate-900 mb-8">{customerLegalName}</h5>
          <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
            <span>Authorized Signature</span>
            <span>Date</span>
          </div>
        </div>
      </div>
    </div>
  );
});
