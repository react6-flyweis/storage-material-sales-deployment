import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Calendar, Plus, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import InvoiceLineItem from "./invoice-line-item";
import AddMarkupDialog from "@/components/invoice/add-markup-dialog";
import AddDiscountDialog from "@/components/invoice/add-discount-dialog";
import AddDepositDialog from "@/components/invoice/add-deposit-dialog";
import PaymentScheduleDialog from "@/components/invoice/payment-schedule-dialog";
import AddClientDialog from "@/components/invoice/add-client-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import steelLogo from "@/assets/steel-building-depot-logo.png";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateInvoiceMutation,
  useEditInvoiceMutation,
} from "@/modules/invoices/invoices.hooks";
import type {
  InvoiceDetail,
  InvoiceLineItem as ApiInvoiceLineItem,
} from "@/modules/invoices/invoices.api";
import SuccessDialog from "@/components/success-dialog";

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
  paymentSchedulePayments: { name: string; amount: string }[];
  clientId: string;
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
    quantity: 0,
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
  clientName: "",
  clientAvatar: "",
  taxes: [{ name: "Argyle", rate: "8.25" }],
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

function invoiceToFormValues(
  invoice?: InvoiceDetail | null,
): InvoiceFormValues {
  const customer =
    invoice && typeof invoice.customerId === "object"
      ? invoice.customerId
      : null;

  return {
    ...defaultFormValues,
    invoiceNumber: invoice?.invoiceNumber ?? defaultFormValues.invoiceNumber,
    date: formatDateForInput(invoice?.date),
    daysToPay:
      invoice?.daysToPay != null
        ? String(invoice.daysToPay)
        : defaultFormValues.daysToPay,
    poNumber: invoice?.poNumber ?? defaultFormValues.poNumber,
    clientId: invoice?.leadId ?? defaultFormValues.clientId,
    clientName: getCustomerName(customer) || defaultFormValues.clientName,
    lineItems:
      invoice?.lineItems?.length && invoice.lineItems.length > 0
        ? invoice.lineItems.map((item, index) => ({
            id: item._id ?? item.id ?? `${invoice._id ?? "invoice"}-${index}`,
            description: item.description ?? "",
            notes: item.notes ?? "",
            rate: item.rate ?? 0,
            markup: "Markup",
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

type InvoiceFormProps = {
  invoice?: InvoiceDetail | null;
};

export default function InvoiceForm({ invoice }: InvoiceFormProps) {
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const editInvoiceMutation = useEditInvoiceMutation();
  const isEdit = Boolean(invoice && invoice._id);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
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

  useEffect(() => {
    reset(invoiceToFormValues(invoice));
  }, [invoice, reset]);

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
  const clientId = formValues?.clientId ?? defaultFormValues.clientId;
  const clientName = formValues?.clientName ?? defaultFormValues.clientName;

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

  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const onSubmit = async (data: InvoiceFormValues) => {
    const isEdit = Boolean(invoice && invoice._id);

    if (!clientId) {
      console.error("Project is required before creating an invoice draft.");
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
      lineItemsSubtotal + markupTotal - discount - depositAmount,
    );

    const payload = {
      date: data.date || undefined,
      daysToPay: (() => {
        const parsedDaysToPay = Number.parseInt(data.daysToPay, 10);

        return Number.isFinite(parsedDaysToPay) ? parsedDaysToPay : undefined;
      })(),
      lineItems: (data.lineItems || []).map((item) => ({
        description: item.description?.trim() || undefined,
        notes: item.notes?.trim() || undefined,
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
          leadId: clientId,
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
          Invoice#{invoiceNumber}
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            Cancel
          </Button>
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
            <div className="flex justify-end">
              <AddClientDialog
                initialSelected={clientId || null}
                onDone={(client) => {
                  if (!client) {
                    setValue("clientId", "");
                    setValue("clientName", "");
                    setValue("clientAvatar", "");
                    return;
                  }

                  setValue("clientId", client.id);
                  setValue("clientName", client.name);
                  setValue("clientAvatar", client.avatar || "");
                }}
              >
                {clientName ? (
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
                        setValue("clientAvatar", "");
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
                )}
              </AddClientDialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Invoice #
                </label>
                <Input
                  id="invoiceNumber"
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
                    {...register("date")}
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
                <label className="text-sm font-medium text-gray-700">
                  PO number
                </label>
                <Input
                  id="poNumber"
                  placeholder="PO number"
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
          <div className="col-span-1 text-center">Markup</div>
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
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                    field.value ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm absolute border border-gray-300 transition-transform ${
                      field.value ? "left-5" : "left-0"
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
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Markup</span>

              {markupValue ? (
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {markupValue}
                    {markupType}
                  </span>
                  <AddMarkupDialog
                    initialType={markupType}
                    initialValue={markupValue}
                    onDone={({ type, value }) => {
                      setValue("markupType", type);
                      setValue("markupValue", value);
                    }}
                  >
                    <button className="text-blue-500 text-xs font-medium hover:underline">
                      Edit
                    </button>
                  </AddMarkupDialog>
                  <button
                    onClick={() => setValue("markupValue", "")}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <AddMarkupDialog
                  initialType={markupType}
                  initialValue={markupValue}
                  onDone={({ type, value }) => {
                    setValue("markupType", type);
                    setValue("markupValue", value);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
                    Add
                  </button>
                </AddMarkupDialog>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>

              {discountValue ? (
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {discountValue}
                    {discountType}
                  </span>
                  <AddDiscountDialog
                    initialType={discountType}
                    initialValue={discountValue}
                    onDone={({ type, value }) => {
                      setValue("discountType", type);
                      setValue("discountValue", value);
                    }}
                  >
                    <button className="text-blue-500 text-xs font-medium hover:underline">
                      Edit
                    </button>
                  </AddDiscountDialog>
                  <button
                    onClick={() => setValue("discountValue", "")}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <AddDiscountDialog
                  initialType={discountType}
                  initialValue={discountValue}
                  onDone={({ type, value }) => {
                    setValue("discountType", type);
                    setValue("discountValue", value);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
                    Add
                  </button>
                </AddDiscountDialog>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Request a deposit</span>

              {depositValue ? (
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {depositValue}
                    {depositType}
                  </span>
                  <AddDepositDialog
                    initialType={depositType}
                    initialValue={depositValue}
                    onDone={({ type, value }) => {
                      setValue("depositType", type);
                      setValue("depositValue", value);
                    }}
                  >
                    <button className="text-blue-500 text-xs font-medium hover:underline">
                      Edit
                    </button>
                  </AddDepositDialog>
                  <button
                    onClick={() => setValue("depositValue", "")}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <AddDepositDialog
                  initialType={depositType}
                  initialValue={depositValue}
                  onDone={({ type, value }) => {
                    setValue("depositType", type);
                    setValue("depositValue", value);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
                    Add
                  </button>
                </AddDepositDialog>
              )}
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Schedule</span>

              {((paymentSchedulePayments || [])?.length || 0) > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(paymentSchedulePayments || []).map(
                      (
                        p: {
                          name: string;
                          amount: string;
                        },
                        i: number,
                      ) => (
                        <div
                          key={i}
                          className="bg-gray-100 px-3 py-1 rounded text-sm"
                        >
                          {p.name} {p.amount}
                        </div>
                      ),
                    )}

                    <PaymentScheduleDialog
                      initialType={paymentScheduleType}
                      initialPayments={paymentSchedulePayments}
                      onDone={({ type, payments }) => {
                        setValue("paymentScheduleType", type);
                        setValue("paymentSchedulePayments", payments);
                      }}
                    >
                      <button className="text-blue-500 text-xs font-medium hover:underline">
                        Edit
                      </button>
                    </PaymentScheduleDialog>
                  </div>

                  <button
                    onClick={() => setValue("paymentSchedulePayments", [])}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <PaymentScheduleDialog
                  initialType={paymentScheduleType}
                  initialPayments={paymentSchedulePayments}
                  onDone={({ type, payments }) => {
                    setValue("paymentScheduleType", type);
                    setValue("paymentSchedulePayments", payments);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
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
