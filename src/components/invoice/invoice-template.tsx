import logo from "@/assets/steel-building-depot-logo.png";
import type {
  InvoiceDocument,
  InvoiceAddress,
  PaymentScheduleDocument,
} from "@/modules/invoices/invoices.api";

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInvoiceDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatStageName(
  name: string | null | undefined,
  amount: number | null | undefined,
  amountType: string | null | undefined,
) {
  const stageName = name || "Payment";
  if (amountType === "percentage" && amount != null) {
    const pctStr = `${amount}%`;
    if (!stageName.includes("%")) {
      return `${stageName} (${pctStr})`;
    }
  }
  return stageName;
}

const DEFAULT_COMPANY_ADDRESS_LINES = [
  "1851 Madison Ave Suite 300",
  "Council Bluffs, IA 51503",
  "United States",
  "travis@storagematerials.com",
  "www.storagematerials.com",
];

function getAddressLines(address?: InvoiceAddress | null, fallbackLines?: string[]): string[] {
  if (!address) return fallbackLines ?? [];
  if (address.lines && address.lines.length > 0) {
    return address.lines;
  }
  const lines: string[] = [];
  if (address.line1) lines.push(address.line1);
  if (address.line2) lines.push(address.line2);
  const cityStateZip = [
    address.city,
    [address.state, address.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  if (cityStateZip) lines.push(cityStateZip);
  if (address.country) lines.push(address.country);

  return lines.length > 0 ? lines : (fallbackLines ?? []);
}

export type InvoiceTemplateProps = {
  invoice: Omit<InvoiceDocument, "lineItems"> & {
    lineItems?: InvoiceDocument["lineItems"];
  };
  paymentSchedule?: PaymentScheduleDocument | null;
};

export default function InvoiceTemplate({ invoice, paymentSchedule }: InvoiceTemplateProps) {
  const items =
    invoice?.lineItems?.map((item, index) => ({
      id:
        item._id ??
        item.id ??
        `${invoice?._id ?? "item"}-${index}`,
      description: item.description ?? undefined,
      notes: item.notes ?? undefined,
      rate: item.effectiveRate ?? item.rate ?? 0,
      quantity: item.quantity ?? 0,
      total: item.total ?? (item.effectiveRate ?? item.rate ?? 0) * (item.quantity ?? 0),
      images: item.images ?? item.photos ?? [],
      tax: item.taxAmount ?? 0,
      items: item.items ?? [],
    })) ?? [];

  const invoiceNumber = invoice?.invoiceNumber ?? "-";
  const date = formatInvoiceDate(invoice?.date);
  const daysToPay = invoice?.daysToPay ?? "-";
  const subtotal = invoice?.subtotal ?? 0;
  const taxAmount = invoice?.tax ?? 0;
  const discount = invoice?.discount ?? 0;
  const total = invoice?.totalAmount ?? 0;
  const deposit = invoice?.depositAmount ?? total * 0.25;
  const stages = paymentSchedule?.stages ?? [];

  const sellerAddress = invoice?.billingAddress;
  const sellerCompanyName = sellerAddress?.companyName || "STEEL BUILDING DEPOT";
  const sellerLines = getAddressLines(sellerAddress, DEFAULT_COMPANY_ADDRESS_LINES);

  const recipientAddress = invoice?.recipientAddress;
  const customerObj =
    typeof invoice?.customerId === "object" && invoice.customerId !== null
      ? invoice.customerId
      : null;
  const customerFullName = customerObj
    ? `${customerObj.firstName ?? ""} ${customerObj.lastName ?? ""}`.trim()
    : "";
  const recipientCompanyName =
    recipientAddress?.companyName || customerFullName || "Valued Customer";
  const recipientLines = getAddressLines(recipientAddress);
  const hasRecipientInfo = Boolean(
    recipientAddress?.companyName ||
      recipientLines.length > 0 ||
      customerFullName ||
      customerObj?.email,
  );

  const bank = invoice?.bankDetails;
  const hasBankInfo = Boolean(
    bank?.bankName ||
      bank?.accountNumber ||
      bank?.routingNumber ||
      bank?.accountName ||
      bank?.paymentInstructions,
  );

  return (
    <div className="bg-white rounded-lg p-6 sm:p-14 shadow-sm mx-auto max-w-8xl">
      <h1 className="text-center text-gray-300 font-bold text-md md:text-xl tracking-widest uppercase mb-12">
        Invoice
      </h1>

      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16 items-start">
        {/* Seller / Billing Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center shrink-0">
              <img
                src={logo}
                alt="Logo"
                className="h-10 max-w-56 object-contain object-left"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              {sellerCompanyName}
            </h2>
            <div className="text-xs text-gray-500 leading-relaxed mt-1">
              {sellerLines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Billed To / Recipient Address */}
        <div className="space-y-2 md:pl-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Billed To
          </span>
          {hasRecipientInfo ? (
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{recipientCompanyName}</p>
              {customerObj?.email && recipientCompanyName !== customerObj.email && (
                <p className="text-gray-500">{customerObj.email}</p>
              )}
              {recipientLines.map((line, idx) => (
                <p key={idx} className="text-gray-500">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">
              Client details on file
            </div>
          )}
        </div>

        {/* Invoice Meta */}
        <div className="min-w-50 space-y-2 md:text-right">
          <div className="flex md:justify-end justify-between gap-4 text-sm">
            <span className="text-gray-500 font-medium">Payment terms</span>
            <span className="text-gray-900">
              {daysToPay === "-" ? "-" : `${daysToPay} days`}
            </span>
          </div>
          <div className="flex md:justify-end justify-between gap-4 text-sm">
            <span className="text-gray-500 font-medium">Invoice #</span>
            <span className="text-gray-900 font-bold">{invoiceNumber}</span>
          </div>
          <div className="flex md:justify-end justify-between gap-4 text-sm">
            <span className="text-gray-500 font-medium">Date</span>
            <span className="text-gray-900">{date}</span>
          </div>
          {invoice?.dueDate && (
            <div className="flex md:justify-end justify-between gap-4 text-sm">
              <span className="text-gray-500 font-medium">Due Date</span>
              <span className="text-gray-900">
                {formatInvoiceDate(invoice.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-12">
        <div className="flex justify-between border-b border-gray-800 pb-2 mb-6">
          <span className="text-sm font-bold text-gray-700">
            Description
          </span>
          <div className="flex gap-8">
            <span className="text-sm font-bold text-gray-700 w-20 text-right">Rate</span>
            <span className="text-sm font-bold text-gray-700 w-12 text-right">Qty</span>
            <span className="text-sm font-bold text-gray-700 w-24 text-right">Total</span>
          </div>
        </div>

        <div className="space-y-8">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={index > 0 ? "border-t border-gray-100 pt-4" : ""}
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">
                  {item.description || "Item Description"}
                </span>
                <div className="flex gap-8">
                  <span className="text-sm text-gray-500 w-20 text-right">
                    ${formatCurrency(item.rate)}
                  </span>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {item.quantity}
                  </span>
                  <span className="text-sm text-gray-600 w-24 text-right">
                    $
                    {formatCurrency(
                      item.total ?? (item.rate ?? 0) * (item.quantity ?? 0),
                    )}
                  </span>
                </div>
              </div>

              {item.notes && (
                <div className="text-[10px] text-gray-400 mb-2">
                  {item.notes}
                </div>
              )}

              {item.items && item.items.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap mb-3">
                  {item.items.map((it: string, i: number) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-100 text-gray-500 rounded px-2 py-0.5 text-[10px]"
                    >
                      {it}
                    </div>
                  ))}
                </div>
              )}

              {/* Display Photos if any */}
              {item.images && item.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-3 mb-4">
                  {item.images.map((photo: string, i: number) => (
                    <div
                      key={i}
                      className="w-64 h-40 overflow-hidden rounded-sm bg-gray-100"
                    >
                      <img
                        src={
                          photo.startsWith("blob:") ||
                            photo.startsWith("http")
                            ? photo
                            : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop"
                        }
                        alt={`Item photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">
              No line items available
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-12">
        {/* Left: Banking & Wire Info */}
        {hasBankInfo ? (
          <div className="w-full max-w-md">
            <div className="pb-2 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">
                Banking & Wire Info
              </h3>
            </div>

            <div className="py-2.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Bank</span>
                <span className="font-semibold text-gray-900">
                  {bank?.bankName || "Example Bank"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account Name</span>
                <span className="font-semibold text-gray-900">
                  {bank?.accountName || "Steel Building Depot LLC"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account #</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {bank?.accountNumber || "****1234"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Routing #</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {bank?.routingNumber || "021000021"}
                </span>
              </div>
              {Boolean(bank?.swiftCode) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">SWIFT</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    {bank?.swiftCode}
                  </span>
                </div>
              )}
              {Boolean(bank?.iban) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">IBAN</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    {bank?.iban}
                  </span>
                </div>
              )}
              {Boolean(bank?.branchAddress) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Branch Address</span>
                  <span className="font-semibold text-gray-900">
                    {bank?.branchAddress}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                Memo:{" "}
                {bank?.paymentInstructions ||
                  "Include invoice number in memo."}
              </p>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Right: Totals */}
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-900 font-bold">Subtotal</span>
            <span className="text-gray-500">
              ${formatCurrency(Number(subtotal))}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-red-600">Discount</span>
              <span className="text-red-600 font-medium">
                -${formatCurrency(Number(discount))}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm border-b border-gray-100 pb-3">
            <span className="text-gray-500">Tax</span>
            <span className="text-gray-500">
              ${formatCurrency(Number(taxAmount))}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-1">
            <span className="text-gray-900 font-bold">Total</span>
            <span className="text-gray-900 font-bold">
              ${formatCurrency(Number(total))}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
            <span className="text-gray-900 font-medium">Deposit Due</span>
            <span className="text-gray-900 font-bold">
              ${formatCurrency(Number(deposit))}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Schedule Section */}
      {stages.length > 0 && (
        <div className="mt-12 pt-6 border-t border-gray-800 flex justify-end">
          <div className="w-full lg:w-3/4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Payment Schedule
            </h2>
            <div className="border-t border-b border-gray-200 divide-y divide-gray-100">
              {stages.map((stage) => {
                const label = formatStageName(
                  stage.stageName,
                  stage.amount,
                  stage.amountType,
                );
                const amount =
                  stage.amountType === "percentage"
                    ? (total * (stage.amount ?? 0)) / 100
                    : (stage.amount ?? 0);

                return (
                  <div
                    key={stage._id}
                    className="flex justify-between py-3 text-sm"
                  >
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="text-gray-900 font-bold">
                      ${formatCurrency(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        <p className="text-[10px] text-gray-500 mb-8">
          Thank you for your business? Reach out with any questions
        </p>
        <p className="text-[10px] text-gray-500 mb-16">
          By Signing this document the customer agrees to the services and
          conditions outlined in this document
        </p>

        <div className="flex justify-end">
          <div className="border-t border-gray-400 w-64 pt-2">
            <p className="text-xs text-gray-500">Client signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
