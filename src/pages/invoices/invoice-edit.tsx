import { useParams } from "react-router";
import InvoiceForm from "./invoice-form";
import { useInvoiceDetailQuery } from "@/modules/invoices/invoices.hooks";

export default function InvoiceEditPage() {
  const params = useParams();
  const invoiceId = params.id;
  const {
    data: invoiceDetailResponse,
    isLoading,
    isError,
  } = useInvoiceDetailQuery(invoiceId);

  const invoice = invoiceDetailResponse?.data.invoice;

  if (!invoiceId) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Open an invoice from the list to edit it.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10">
        <div className=" rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Invoice details could not be loaded.
        </div>
      </div>
    );
  }

  return <InvoiceForm invoice={invoice} />;
}
