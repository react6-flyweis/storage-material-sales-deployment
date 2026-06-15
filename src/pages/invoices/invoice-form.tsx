import { useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Calendar, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import InvoiceLineItem from "./invoice-line-item";
import AddMarkupDialog from "@/components/invoice/add-markup-dialog";
import AddDiscountDialog from "@/components/invoice/add-discount-dialog";
import AddDepositDialog from "@/components/invoice/add-deposit-dialog";
import PaymentScheduleDialog from "@/components/invoice/payment-schedule-dialog";
// import AddClientDialog from "@/components/invoice/add-client-dialog";
// import CustomerProjectSelector from "@/components/invoice/customer-project-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import steelLogo from "@/assets/steel-building-depot-logo.png";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateInvoiceMutation,
  useEditInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import { usePaymentScheduleByLeadQuery } from "@/modules/payment-schedules/payment-schedules.hooks";
import {
  getDepositFromScheduleStages,
  isDepositStageName,
  paymentScheduleToDialogValues,
} from "@/modules/payment-schedules/payment-schedules.utils";
import type {
  InvoiceDetail,
  InvoiceLineItem as ApiInvoiceLineItem,
  PaymentScheduleDocument,
} from "@/modules/invoices/invoices.api";
import SuccessDialog from "@/components/success-dialog";
import ClientSelector from "@/components/customers/client-selector";

type LineItem = Omit<ApiInvoiceLineItem, "markup" | "tax"> & {
  id: string;
  markup: string;
  tax: number;
  selectedTax?: string;
};

export interface InvoiceFormValues {
  invoiceNumber: string;
  date: string;
  daysToPay: string;
  poNumber: string;
  groupSections: boolean;
  lineItems: LineItem[];
  markupType: "%" | "$";
  markupValue: string;
  discountType: "%" | "$";
  discountValue: string;
  depositType: "%" | "$";
  depositValue: string;
  paymentScheduleType: "%" | "$";
  paymentSchedulePayments: {
    name: string;
    amount: string;
    dueDate?: string;
  }[];
  clientId: string;
  leadId: string;
  clientName: string;
  clientAvatar: string;
  taxes: { name: string; rate: string }[];
}

const defaultLineItems: InvoiceFormValues["lineItems"] = [
  {
    id: "",
    description: "",
    notes: "",
    rate: 0,
    markup: "Markup",
    quantity: 1,
    tax: 0,
    total: 0,
    selectedTax: "",
    images: [],
    items: [],
  },
];

const defaultFormValues: InvoiceFormValues = {
  invoiceNumber: "",
  date: "",
  daysToPay: "",
  poNumber: "",
  groupSections: false,
  markupType: "%",
  markupValue: "",
  discountType: "%",
  discountValue: "",
  depositType: "%",
  depositValue: "",
  paymentScheduleType: "%",
  paymentSchedulePayments: [],
  clientId: "",
  leadId: "",
  clientName: "",
  clientAvatar: "",
  taxes: [],
  lineItems: defaultLineItems,
};

function formatDateForInput(value?: string | null) {
  if (!value) return defaultFormValues.date;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
}

function getCustomerName(customer?: InvoiceDetail["customerId"]) {
  if (!customer || typeof customer !== "object") return "";

  return (
    `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
    customer.email ||
    customer.customerId ||
    ""
  );
}

function getInvoiceClientId(invoice?: InvoiceDetail | null) {
  if (!invoice?.customerId) return "";

  if (typeof invoice.customerId === "string") {
    return invoice.customerId;
  }

  return invoice.customerId._id ?? "";
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function dollarAmountToFormValue(amount?: number | null) {
  if (amount == null || amount === 0) return "";

  return String(amount);
}

function formatAdjustmentDisplay(
  value: string,
  type: "%" | "$",
  baseAmount: number,
) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const numericValue = parseNumericInput(trimmed);
  if (type === "%") {
    const amount = getAdjustmentAmount(trimmed, type, baseAmount);
    if (amount > 0) {
      return `${trimmed}% ($${formatCurrency(amount)})`;
    }
    return `${trimmed}%`;
  }

  return `$${formatCurrency(numericValue)}`;
}

function ensureDepositInSchedulePayments(
  payments: InvoiceFormValues["paymentSchedulePayments"],
  depositValue: string,
): InvoiceFormValues["paymentSchedulePayments"] {
  const trimmedDeposit = depositValue.trim();
  const nonDepositPayments = payments.filter(
    (payment) => !isDepositStageName(payment.name),
  );

  if (!trimmedDeposit) {
    return nonDepositPayments;
  }

  const existingDeposit = payments.find((payment) =>
    isDepositStageName(payment.name),
  );

  return [
    {
      name: "Deposit",
      amount: trimmedDeposit,
      dueDate: existingDeposit?.dueDate,
    },
    ...nonDepositPayments,
  ];
}

function formatPaymentScheduleDisplay(
  payments: { name: string; amount: string; dueDate?: string }[],
  type: "%" | "$",
) {
  return payments
    .filter((payment) => payment.name.trim() || payment.amount.trim())
    .map((payment) => {
      const name = payment.name.trim() || "Payment";
      const amount = payment.amount.trim();
      if (!amount) return name;

      if (type === "$") {
        return `${name} $${formatCurrency(parseNumericInput(amount))}`;
      }

      return `${name} ${amount}%`;
    });
}

function paymentScheduleToFormValues(
  schedule?: PaymentScheduleDocument | null,
): Pick<InvoiceFormValues, "paymentScheduleType" | "paymentSchedulePayments"> {
  const { type, payments } = paymentScheduleToDialogValues(schedule);
  if (!payments.length) {
    return {
      paymentScheduleType: defaultFormValues.paymentScheduleType,
      paymentSchedulePayments: defaultFormValues.paymentSchedulePayments,
    };
  }

  return {
    paymentScheduleType: type,
    paymentSchedulePayments: payments,
  };
}

function resolveDepositFormValue(invoice?: InvoiceDetail | null) {
  return dollarAmountToFormValue(invoice?.depositAmount);
}

function lineItemMarkupLabel(markup?: number | null) {
  if (markup != null && markup > 0) return "Fixed";

  return "Markup";
}

function invoiceToFormValues(
  invoice?: InvoiceDetail | null,
  paymentSchedule?: PaymentScheduleDocument | null,
): InvoiceFormValues {
  const customer =
    invoice && typeof invoice.customerId === "object"
      ? invoice.customerId
      : null;
  const markupValue = dollarAmountToFormValue(invoice?.markupTotal);
  const discountValue = dollarAmountToFormValue(invoice?.discount);
  const depositValue = resolveDepositFormValue(invoice);
  const scheduleValues = paymentScheduleToFormValues(paymentSchedule);
  const depositType = depositValue ? "$" : defaultFormValues.depositType;

  return {
    ...defaultFormValues,
    invoiceNumber: invoice?.invoiceNumber ?? defaultFormValues.invoiceNumber,
    date: formatDateForInput(invoice?.date),
    daysToPay:
      invoice?.daysToPay != null
        ? String(invoice.daysToPay)
        : defaultFormValues.daysToPay,
    poNumber: invoice?.poNumber ?? defaultFormValues.poNumber,
    clientId: getInvoiceClientId(invoice),
    leadId: invoice?.leadId ?? defaultFormValues.leadId,
    clientName: getCustomerName(customer) || defaultFormValues.clientName,
    markupType: markupValue ? "$" : defaultFormValues.markupType,
    markupValue,
    discountType: discountValue ? "$" : defaultFormValues.discountType,
    discountValue,
    depositType,
    depositValue,
    ...scheduleValues,
    paymentSchedulePayments: ensureDepositInSchedulePayments(
      scheduleValues.paymentSchedulePayments,
      depositValue,
    ),
    lineItems:
      invoice?.lineItems?.length && invoice.lineItems.length > 0
        ? invoice.lineItems.map((item, index) => ({
          id: item._id ?? item.id ?? `${invoice._id ?? "invoice"}-${index}`,
          description: item.description ?? "",
          notes: item.notes ?? "",
          rate: item.rate ?? 0,
          markup: lineItemMarkupLabel(item.markup),
          quantity: item.quantity ?? 1,
          tax: item.tax ?? 0,
          total:
            item.total ??
            (item.rate ?? 0) * (item.quantity ?? 0) + (item.tax ?? 0),
          selectedTax: "",
          images: item.images ?? item.photos ?? [],
          items: item.items ?? [],
        }))
        : defaultLineItems,
  };
}

function parseNumericInput(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getAdjustmentAmount(
  value: string,
  type: "%" | "$",
  baseAmount: number,
) {
  const numericValue = parseNumericInput(value);

  if (!numericValue) {
    return 0;
  }

  return type === "%" ? (baseAmount * numericValue) / 100 : numericValue;
}

function getScheduleAllocatedTotal(
  payments: InvoiceFormValues["paymentSchedulePayments"],
) {
  return payments
    .filter((payment) => !isDepositStageName(payment.name))
    .reduce(
      (sum, payment) => sum + parseNumericInput(payment.amount),
      0,
    );
}

type InvoiceFormProps = {
  invoice?: InvoiceDetail | null;
  paymentSchedule?: PaymentScheduleDocument | null;
};

export default function InvoiceForm({
  invoice,
  paymentSchedule,
}: InvoiceFormProps) {
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const editInvoiceMutation = useEditInvoiceMutation();
  const isEdit = Boolean(invoice && invoice._id);
  const isSummaryReadOnly =
    isEdit && Boolean(invoice?.status) && invoice?.status !== "draft";
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [paymentScheduleId, setPaymentScheduleId] = useState<string | null>(
    paymentSchedule?._id ?? invoice?.paymentScheduleId ?? null,
  );
  const lastAppliedLeadScheduleIdRef = useRef<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    setError,
  } = useForm<InvoiceFormValues>({
    defaultValues: defaultFormValues,
  });

  const formValues = useWatch({ control }) as Partial<InvoiceFormValues>;
  const leadIdForSchedule = formValues?.leadId ?? defaultFormValues.leadId;
  const leadScheduleQuery = usePaymentScheduleByLeadQuery(
    leadIdForSchedule || undefined,
    Boolean(leadIdForSchedule) && !isSummaryReadOnly,
  );

  useEffect(() => {
    reset(invoiceToFormValues(invoice, paymentSchedule));
    setPaymentScheduleId(
      paymentSchedule?._id ?? invoice?.paymentScheduleId ?? null,
    );
    lastAppliedLeadScheduleIdRef.current = invoice?.leadId ?? null;
  }, [invoice, paymentSchedule, reset]);

  useEffect(() => {
    if (!leadIdForSchedule) {
      lastAppliedLeadScheduleIdRef.current = null;
      if (!isEdit) {
        setPaymentScheduleId(null);
        setValue(
          "paymentSchedulePayments",
          ensureDepositInSchedulePayments([], getValues("depositValue")),
        );
      }
      return;
    }

    if (!leadScheduleQuery.isSuccess) {
      return;
    }

    if (lastAppliedLeadScheduleIdRef.current === leadIdForSchedule) {
      return;
    }

    lastAppliedLeadScheduleIdRef.current = leadIdForSchedule;

    const schedule = leadScheduleQuery.data?.schedule ?? null;
    const depositFromSchedule = getDepositFromScheduleStages(schedule?.stages);
    const currentDepositValue = getValues("depositValue");

    if (!schedule) {
      setPaymentScheduleId(null);
      setValue(
        "paymentSchedulePayments",
        ensureDepositInSchedulePayments([], currentDepositValue),
      );
      return;
    }

    const scheduleValues = paymentScheduleToFormValues(schedule);
    const depositValue = depositFromSchedule?.depositValue ?? currentDepositValue;

    if (depositFromSchedule) {
      setValue("depositType", depositFromSchedule.depositType);
      setValue("depositValue", depositFromSchedule.depositValue);
    }

    setPaymentScheduleId(schedule._id);
    setValue("paymentScheduleType", scheduleValues.paymentScheduleType);
    setValue(
      "paymentSchedulePayments",
      ensureDepositInSchedulePayments(
        scheduleValues.paymentSchedulePayments,
        depositValue,
      ),
    );
  }, [
    isEdit,
    leadIdForSchedule,
    leadScheduleQuery.isSuccess,
    leadScheduleQuery.data,
    setValue,
    getValues,
  ]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
    keyName: "fieldId",
  });

  const watchLineItems = (formValues.lineItems ??
    defaultFormValues.lineItems) as InvoiceFormValues["lineItems"];
  const invoiceNumber =
    formValues?.invoiceNumber ?? defaultFormValues.invoiceNumber;
  const markupType = formValues?.markupType ?? defaultFormValues.markupType;
  const markupValue = formValues?.markupValue ?? defaultFormValues.markupValue;
  const discountType =
    formValues?.discountType ?? defaultFormValues.discountType;
  const discountValue =
    formValues?.discountValue ?? defaultFormValues.discountValue;
  const depositType = formValues?.depositType ?? defaultFormValues.depositType;
  const depositValue =
    formValues?.depositValue ?? defaultFormValues.depositValue;
  const paymentScheduleType =
    formValues?.paymentScheduleType ?? defaultFormValues.paymentScheduleType;
  const paymentSchedulePayments = (formValues.paymentSchedulePayments ??
    defaultFormValues.paymentSchedulePayments) as InvoiceFormValues["paymentSchedulePayments"];
  const schedulePaymentsWithDeposit = ensureDepositInSchedulePayments(
    paymentSchedulePayments,
    depositValue,
  );
  const hasNonDepositSchedulePayments = schedulePaymentsWithDeposit.some(
    (payment) => !isDepositStageName(payment.name),
  );
  // const clientId = formValues?.clientId ?? defaultFormValues.clientId;
  const leadId = formValues?.leadId ?? defaultFormValues.leadId;
  // const clientName = formValues?.clientName ?? defaultFormValues.clientName;
  const taxes = (formValues.taxes ??
    defaultFormValues.taxes) as InvoiceFormValues["taxes"];

  // const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});

  // const toggleNotes = (id: string) => {
  //   setNotesOpen((p) => ({ ...p, [id]: !p[id] }));
  // };

  const addLineItem = () => {
    append({
      id: Date.now().toString(),
      description: "",
      notes: "",
      rate: 0,
      markup: "Markup",
      quantity: 1,
      tax: 0,
      total: 0,
      selectedTax: "",
      images: [],
      items: [],
    });
  };

  // const removeImage = (index: number, imageIndex: number) => {
  //   const items = getValues("lineItems") || [];
  //   const images = items[index]?.images || [];
  //   const newImages = images.filter((_, i) => i !== imageIndex);
  //   setValue(`lineItems.${index}.images`, newImages);
  // };

  const calculateSubtotal = () => {
    const items = watchLineItems || [];
    return items.reduce(
      (sum, item) =>
        sum + (parseFloat(String(item.total ?? item.rate ?? 0)) || 0),
      0,
    );
  };

  const calculateTax = () => {
    const items = watchLineItems || [];
    const available = taxes || [];

    return items.reduce((sum, item) => {
      const itemSubtotal =
        (parseFloat(String(item.rate || 0)) || 0) * (item.quantity || 0);
      const selectedName = item.selectedTax;
      const t = available.find((a) => a.name === selectedName);
      const rate = t ? parseFloat(t.rate || "0") : 0;
      const lineTax = parseFloat(String(item.tax ?? 0)) || 0;
      return sum + (lineTax || itemSubtotal * (rate / 100));
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const markup = getAdjustmentAmount(markupValue, markupType, subtotal);
    const discount = getAdjustmentAmount(discountValue, discountType, subtotal);

    return Math.max(0, subtotal + markup - discount);
  };

  const invoiceTotal = calculateTotal();
  const scheduleAllocatedTotal = getScheduleAllocatedTotal(
    schedulePaymentsWithDeposit,
  );

  const syncDepositToSchedule = (type: "%" | "$", value: string) => {
    setValue("depositType", type);
    setValue("depositValue", value);
    if (!hasNonDepositSchedulePayments) {
      setValue("paymentScheduleType", type);
    }
    setValue(
      "paymentSchedulePayments",
      ensureDepositInSchedulePayments(paymentSchedulePayments, value),
    );
  };

  const clearDepositFromSchedule = () => {
    setValue("depositValue", "");
    setValue(
      "paymentSchedulePayments",
      ensureDepositInSchedulePayments(paymentSchedulePayments, ""),
    );
  };

  const applyPaymentScheduleToForm = (payload: {
    scheduleId: string;
    type: "%" | "$";
    payments: InvoiceFormValues["paymentSchedulePayments"];
    depositType?: "%" | "$";
    depositValue?: string;
  }) => {
    const resolvedDepositValue = payload.depositValue ?? depositValue;

    if (payload.depositType && payload.depositValue) {
      setValue("depositType", payload.depositType);
      setValue("depositValue", payload.depositValue);
    }

    setPaymentScheduleId(payload.scheduleId);
    setValue("paymentScheduleType", payload.type);
    setValue(
      "paymentSchedulePayments",
      ensureDepositInSchedulePayments(
        payload.payments,
        resolvedDepositValue,
      ),
    );
  };

  const handlePaymentScheduleDone = (
    payload: Parameters<typeof applyPaymentScheduleToForm>[0],
  ) => {
    applyPaymentScheduleToForm(payload);
  };

  const handlePaymentScheduleLoaded = (
    payload: Parameters<typeof applyPaymentScheduleToForm>[0],
  ) => {
    applyPaymentScheduleToForm(payload);
    lastAppliedLeadScheduleIdRef.current = leadId;
  };

  const clearPaymentSchedule = () => {
    setPaymentScheduleId(null);
    setValue(
      "paymentSchedulePayments",
      ensureDepositInSchedulePayments([], depositValue),
    );
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    const isEdit = Boolean(invoice && invoice._id);

    if (!leadId) {
      setError("root", {
        type: "manual",
        message: "Client and project are required before saving the invoice.",
      });
      return;
    }

    const lineItemsSubtotal = (data.lineItems || []).reduce((sum, item) => {
      const rate = parseNumericInput(String(item.rate ?? 0));
      const quantity = parseNumericInput(String(item.quantity ?? 0));
      const tax = parseNumericInput(String(item.tax ?? 0));
      const itemTotal = parseNumericInput(
        String(item.total ?? 0),
        rate * quantity + tax,
      );

      return sum + itemTotal;
    }, 0);

    const markupTotal = getAdjustmentAmount(
      data.markupValue,
      data.markupType,
      lineItemsSubtotal,
    );
    const discount = getAdjustmentAmount(
      data.discountValue,
      data.discountType,
      lineItemsSubtotal,
    );
    const depositAmount = getAdjustmentAmount(
      data.depositValue,
      data.depositType,
      lineItemsSubtotal,
    );
    const totalAmount = Math.max(
      0,
      lineItemsSubtotal + markupTotal - discount,
    );

    const parsedDaysToPay = Number.parseInt(data.daysToPay, 10);
    const payload = {
      date: data.date || undefined,
      daysToPay: Number.isFinite(parsedDaysToPay) ? parsedDaysToPay : undefined,
      lineItems: (data.lineItems || []).map((item) => ({
        description: item.description?.trim() || "",
        notes: item.notes?.trim() || "",
        images: item.images ?? [],
        items: item.items ?? [],
        rate: parseNumericInput(String(item.rate ?? 0)),
        markup: 0,
        quantity: parseNumericInput(String(item.quantity ?? 0)),
        tax: parseNumericInput(String(item.tax ?? 0)),
        total: parseNumericInput(String(item.total ?? 0)),
      })),
      subtotal: lineItemsSubtotal,
      markupTotal,
      discount,
      depositAmount,
      totalAmount,
      ...(paymentScheduleId ? { paymentScheduleId } : {}),
    };

    try {
      if (isEdit) {
        const invoiceId = invoice!._id;
        const response = await editInvoiceMutation.mutateAsync({
          invoiceId,
          payload,
        });

        const updatedInvoice = response.data.invoice;
        if (updatedInvoice?._id) {
          setCreatedInvoiceId(updatedInvoice._id);
          setSuccessOpen(true);
        }
      } else {
        const response = await createInvoiceMutation.mutateAsync({
          leadId,
          payload,
        });

        const createdInvoice = response.data.invoice;
        if (createdInvoice?._id) {
          setCreatedInvoiceId(createdInvoice._id);
          setSuccessOpen(true);
        }
      }
    } catch (error) {
      setError("root", {
        type: "manual",
        message: getApiErrorMessage(error),
      });
    }
  };

  return (
    <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6 min-w-xs">
      <SuccessDialog
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          if (createdInvoiceId) navigate(`/invoice/${createdInvoiceId}`);
        }}
        title={isEdit ? "Invoice updated" : "Invoice created"}
        okLabel="View invoice"
      />
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEdit ? `Invoice#${invoiceNumber}` : "New Invoice"}
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={
              createInvoiceMutation.isPending || editInvoiceMutation.isPending
            }
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-6"
          >
            Save
          </Button>
        </div>
      </header>

      <div className="bg-white rounded-md p-4 sm:p-8 lg:p-10 shadow-sm mx-auto max-w-7xl">
        {/* Top Section: Client Info & Invoice Details */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
          {/* Left: Organization Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center shrink-0">
                <img src={steelLogo} alt="The Steel" className="h-10" />
              </div>
            </div>

            <div className="text-sm text-gray-500 leading-relaxed max-w-62.5">
              1851 Madison Ave Suite 300
              <br />
              Council Bluffs, IA
              <br />
              51503
              <br />
              United States
              <br />
              travis@storagematerials.com
              <br />
              www.storagematerials.com
            </div>
          </div>

          {/* Right: Invoice Meta & Client Add */}
          <div className="flex-1 max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col items-end gap-4">
              {/* <AddClientDialog
                initialSelected={clientId || null}
                onDone={(client) => {
                  if (!client) {
                    setValue("clientId", "");
                    setValue("clientName", "");
                    return;
                  }

                  setValue("clientId", client.id);
                  setValue("clientName", client.name);
                }}
              > */}
              {/* {clientName ? (
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900">
                      {clientName}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue("clientId", "");
                        setValue("clientName", "");
                      }}
                      className="text-gray-500 hover:text-red-500 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 w-fit sm:w-auto h-12 px-8 flex items-center gap-2 rounded-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    ADD CLIENT
                  </Button>
                )} */}
              {/* </AddClientDialog> */}

              {/* <CustomerProjectSelector
                customerId={clientId}
                value={leadId}
                disabled={!clientId || isSummaryReadOnly}
                onValueChange={(project) => {
                  setValue("leadId", project?._id ?? "");
                }}
              /> */}

              <ClientSelector
                placeholder="Select Project"
                value={leadId}
                onValueChange={(lead) => {
                  setValue("leadId", lead?.id ?? "");
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Invoice #
                </label>
                <Input
                  id="invoiceNumber"
                  disabled
                  {...register("invoiceNumber")}
                  className="bg-white border-gray-200 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    placeholder="dd/mm/yyyy"
                    {...register("date")}
                    min={new Date().toISOString().split("T")[0]}
                    className="bg-white border-gray-200 h-11"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Days to pay
                </label>
                <Input
                  id="daysToPay"
                  {...register("daysToPay")}
                  className="bg-white border-gray-200 h-11"
                />
              </div>
              <div className="space-y-2">
                {/* hide in create */}
                <label className="text-sm font-medium text-gray-700">
                  PO number
                </label>
                <Input
                  id="poNumber"
                  placeholder="PO number"
                  disabled
                  {...register("poNumber")}
                  className="bg-white border-gray-200 h-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50/50 py-3 px-4 rounded-lg mb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-center">Rate</div>
          {/* <div className="col-span-1 text-center">Markup</div> */}
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-1 text-center">Tax</div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Controller
              control={control}
              name="groupSections"
              render={({ field }) => (
                <div
                  onClick={() => field.onChange(!field.value)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${field.value ? "bg-blue-600" : "bg-gray-200"
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm absolute border border-gray-300 transition-transform ${field.value ? "left-5" : "left-0"
                      }`}
                  ></div>
                </div>
              )}
            />
            <span className="text-sm text-gray-500 font-medium">
              Group items into Sections
            </span>
          </div>
        </div>

        {/* Invoice Items List */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            const item = watchLineItems?.[index] || field;
            return (
              <InvoiceLineItem
                key={field.fieldId || field.id}
                field={field}
                index={index}
                item={item}
                control={control}
                register={register}
                getValues={getValues}
                setValue={setValue}
                remove={remove}
                taxes={taxes}
              />
            );
          })}
        </div>

        {/* Add Line Item Button */}
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={addLineItem}
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 h-12 border-dashed flex items-center justify-center gap-2 font-medium"
          >
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Plus className="w-3.5 h-3.5" />
            </div>
            ADD LINE ITEM
          </Button>
        </div>

        {/* Footer Summary */}
        <div className="mt-12 flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">
                $
                {calculateSubtotal().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Markup</span>

              {markupValue.trim() ? (
                <div className="flex items-center gap-3 text-right">
                  <span className="text-gray-900 font-medium">
                    {formatAdjustmentDisplay(
                      markupValue,
                      markupType,
                      calculateSubtotal(),
                    )}
                  </span>
                  {!isSummaryReadOnly && (
                    <>
                      <AddMarkupDialog
                        initialType={markupType}
                        initialValue={markupValue}
                        onDone={({ type, value }) => {
                          setValue("markupType", type);
                          setValue("markupValue", value);
                        }}
                      >
                        <button
                          type="button"
                          className="text-blue-500 text-xs font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </AddMarkupDialog>
                      <button
                        type="button"
                        onClick={() => setValue("markupValue", "")}
                        className="text-gray-500 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ) : isSummaryReadOnly ? (
                <span className="text-gray-400">—</span>
              ) : (
                <AddMarkupDialog
                  initialType={markupType}
                  initialValue={markupValue}
                  onDone={({ type, value }) => {
                    setValue("markupType", type);
                    setValue("markupValue", value);
                  }}
                >
                  <button
                    type="button"
                    className="text-blue-500 text-xs font-medium hover:underline"
                  >
                    Add
                  </button>
                </AddMarkupDialog>
              )}
            </div>
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Discount</span>

              {discountValue.trim() ? (
                <div className="flex items-center gap-3 text-right">
                  <span className="text-gray-900 font-medium">
                    {formatAdjustmentDisplay(
                      discountValue,
                      discountType,
                      calculateSubtotal(),
                    )}
                  </span>
                  {!isSummaryReadOnly && (
                    <>
                      <AddDiscountDialog
                        initialType={discountType}
                        initialValue={discountValue}
                        onDone={({ type, value }) => {
                          setValue("discountType", type);
                          setValue("discountValue", value);
                        }}
                      >
                        <button
                          type="button"
                          className="text-blue-500 text-xs font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </AddDiscountDialog>
                      <button
                        type="button"
                        onClick={() => setValue("discountValue", "")}
                        className="text-gray-500 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ) : isSummaryReadOnly ? (
                <span className="text-gray-400">—</span>
              ) : (
                <AddDiscountDialog
                  initialType={discountType}
                  initialValue={discountValue}
                  onDone={({ type, value }) => {
                    setValue("discountType", type);
                    setValue("discountValue", value);
                  }}
                >
                  <button
                    type="button"
                    className="text-blue-500 text-xs font-medium hover:underline"
                  >
                    Add
                  </button>
                </AddDiscountDialog>
              )}
            </div>
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Request a deposit</span>

              {depositValue.trim() ? (
                <div className="flex items-center gap-3 text-right">
                  <span className="text-gray-900 font-medium">
                    {formatAdjustmentDisplay(
                      depositValue,
                      depositType,
                      calculateSubtotal(),
                    )}
                  </span>
                  {!isSummaryReadOnly && (
                    <>
                      <AddDepositDialog
                        initialType={depositType}
                        initialValue={depositValue}
                        maxAmount={invoiceTotal}
                        reservedScheduleValue={
                          scheduleAllocatedTotal > 0
                            ? String(scheduleAllocatedTotal)
                            : ""
                        }
                        reservedScheduleType={paymentScheduleType}
                        onDone={({ type, value }) => syncDepositToSchedule(type, value)}
                      >
                        <button
                          type="button"
                          className="text-blue-500 text-xs font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </AddDepositDialog>
                      <button
                        type="button"
                        onClick={clearDepositFromSchedule}
                        className="text-gray-500 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ) : isSummaryReadOnly ? (
                <span className="text-gray-400">—</span>
              ) : (
                <AddDepositDialog
                  initialType={depositType}
                  initialValue={depositValue}
                  maxAmount={invoiceTotal}
                  reservedScheduleValue={
                    scheduleAllocatedTotal > 0
                      ? String(scheduleAllocatedTotal)
                      : ""
                  }
                  reservedScheduleType={paymentScheduleType}
                  onDone={({ type, value }) => syncDepositToSchedule(type, value)}
                >
                  <button
                    type="button"
                    className="text-blue-500 text-xs font-medium hover:underline"
                  >
                    Add
                  </button>
                </AddDepositDialog>
              )}
            </div>

            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Payment Schedule</span>

              {hasNonDepositSchedulePayments ? (
                <div className="flex items-center gap-3 text-right">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {formatPaymentScheduleDisplay(
                      schedulePaymentsWithDeposit,
                      paymentScheduleType,
                    ).map((label, index) => (
                      <div
                        key={`${label}-${index}`}
                        className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-900"
                      >
                        {label}
                      </div>
                    ))}

                    {!isSummaryReadOnly && (
                      <PaymentScheduleDialog
                        leadId={leadId}
                        maxAmount={invoiceTotal}
                        depositType={depositType}
                        depositValue={depositValue}
                        existingScheduleId={paymentScheduleId}
                        initialType={paymentScheduleType}
                        initialPayments={schedulePaymentsWithDeposit}
                        onScheduleLoaded={handlePaymentScheduleLoaded}
                        onDone={handlePaymentScheduleDone}
                      >
                        <button
                          type="button"
                          className="text-blue-500 text-xs font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </PaymentScheduleDialog>
                    )}
                  </div>

                  {!isSummaryReadOnly && (
                    <button
                      type="button"
                      onClick={clearPaymentSchedule}
                      className="text-gray-500 hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : depositValue.trim() ? (
                <div className="flex items-center gap-3 text-right">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {formatPaymentScheduleDisplay(
                      schedulePaymentsWithDeposit,
                      paymentScheduleType,
                    ).map((label, index) => (
                      <div
                        key={`${label}-${index}`}
                        className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-900"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  {!isSummaryReadOnly && (
                    <PaymentScheduleDialog
                      leadId={leadId}
                      maxAmount={invoiceTotal}
                      depositType={depositType}
                      depositValue={depositValue}
                      existingScheduleId={paymentScheduleId}
                      initialType={paymentScheduleType}
                      initialPayments={schedulePaymentsWithDeposit}
                      onScheduleLoaded={handlePaymentScheduleLoaded}
                      onDone={handlePaymentScheduleDone}
                    >
                      <button
                        type="button"
                        className="text-blue-500 text-xs font-medium hover:underline"
                      >
                        Add
                      </button>
                    </PaymentScheduleDialog>
                  )}
                </div>
              ) : isSummaryReadOnly ? (
                <span className="text-gray-400">—</span>
              ) : (
                <PaymentScheduleDialog
                  leadId={leadId}
                  maxAmount={invoiceTotal}
                  depositType={depositType}
                  depositValue={depositValue}
                  existingScheduleId={paymentScheduleId}
                  initialType={paymentScheduleType}
                  initialPayments={schedulePaymentsWithDeposit}
                  onScheduleLoaded={handlePaymentScheduleLoaded}
                  onDone={handlePaymentScheduleDone}
                >
                  <button
                    type="button"
                    className="text-blue-500 text-xs font-medium hover:underline"
                  >
                    Add
                  </button>
                </PaymentScheduleDialog>
              )}
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-500">Tax</span>

              <div className="flex items-center gap-3">
                <span className="text-gray-900">
                  $
                  {calculateTax().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="xl:text-lg font-bold text-gray-600">
                Total(USD)
              </span>
              <span className="xl:text-xl font-bold text-gray-800">
                $
                {calculateTotal().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
