import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { X, Plus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
// } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQuotationMutation } from "@/modules/quotations/quotations.hooks";

interface CreateQuotationDialogProps {
  trigger: React.ReactNode;
  leadData?: {
    name: string;
    id: string;
    customerId?: string;
  };
  mode?: "create" | "edit";
}

type CreateQuotationFormValues = {
  projectName: string;
  quoteNumber: string;
  proposalDate: string;
  validity: string;
  preparedBy: string;
  customerName: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  buildingType: "workshop" | "garage" | "commercial" | "agricultural";
  width: number;
  length: number;
  height: number;
  roofStyle: "gable" | "gambrel" | "hip" | "flat";
  windLoad: number;
  snowLoad: number;
  estimatedDelivery: string;
  basePrice: number;
  margin: string;
  currency: "usd" | "eur" | "gbp";
  totalPrice: string;
  validUntil: string;
  paymentTerms: "50-50" | "30-70" | "full";
  assignedSalesperson: "ai" | "sarah" | "john";
  specialNotes: string;
  internalNotes: string;
  leadSource: "high-value" | "website" | "referral" | "social";
  priorityLevel: "low" | "medium" | "high" | "urgent";
  assignLead: string;
};

const defaultInsuranceItems = [
  { insulationType: "roof", thickness: "R-19", material: "Fiberglass" },
  { insulationType: "wall", thickness: "R-13", material: "Fiberglass" },
];

const includedComponentDefaults = [
  "Anchor bolts",
  "Erection drawings",
  "Stamped engineering",
];

const exclusionDefaults = ["Foundation", "Site prep", "Permits"];

const toIsoDate = (value: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : "";

const toNumber = (value: string, fallback = 0) => {
  const parsedValue = Number(value.replace(/[^0-9.-]+/g, ""));

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const toCurrencyCode = (value: CreateQuotationFormValues["currency"]) =>
  value.toUpperCase();

const toCapitalizedText = (value: string) =>
  value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const getPaymentTermsLabel = (
  value: CreateQuotationFormValues["paymentTerms"],
) => {
  switch (value) {
    case "30-70":
      return "30% upfront, 70% on delivery";
    case "full":
      return "Full payment upfront";
    case "50-50":
    default:
      return "50% upfront, 50% on delivery";
  }
};

export default function CreateQuotationDialog({
  trigger,
  leadData,
  mode = "create",
}: CreateQuotationDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sendMethod] = useState<"email" | "whatsapp" | "website">("email");
  const createQuotationMutation = useCreateQuotationMutation();

  const defaultFormValues = useMemo<CreateQuotationFormValues>(
    () =>
      mode === "create"
        ? {
            projectName: "",
            quoteNumber: "",
            proposalDate: "",
            validity: "",
            preparedBy: "",
            customerName: "",
            email: "",
            phone: "",
            location: "",
            company: "",
            buildingType: "workshop",
            width: 0,
            length: 0,
            height: 0,
            roofStyle: "gable",
            windLoad: 0,
            snowLoad: 0,
            estimatedDelivery: "",
            basePrice: 0,
            margin: "",
            currency: "usd",
            totalPrice: "",
            validUntil: "",
            paymentTerms: "50-50",
            assignedSalesperson: "ai",
            specialNotes: "",
            internalNotes: "",
            leadSource: "website",
            priorityLevel: "low",
            assignLead: "",
          }
        : {
            projectName: "ABC Construction",
            quoteNumber: "QUO-98765432",
            proposalDate: "2026-04-12",
            validity: "2 weeks",
            preparedBy: "Suresh Kapoor - Steel Material",
            customerName: "James Lee",
            email: "john@doe.com",
            phone: "James Lee",
            location: "Dallas, TX",
            company: "",
            buildingType: "workshop",
            width: 30,
            length: 40,
            height: 12,
            roofStyle: "gable",
            windLoad: 120,
            snowLoad: 20,
            estimatedDelivery: "4-6 weeks",
            basePrice: 24500,
            margin: "20%",
            currency: "usd",
            totalPrice: "29,400",
            validUntil: "",
            paymentTerms: "50-50",
            assignedSalesperson: "ai",
            specialNotes: "",
            internalNotes: "",
            leadSource: "high-value",
            priorityLevel: "low",
            assignLead: "",
          },
    [mode],
  );

  const { register, control, handleSubmit, reset, formState, getValues } =
    useForm<CreateQuotationFormValues>({
      defaultValues: defaultFormValues,
    });

  const { errors, isDirty, touchedFields } = formState;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      const hasTouched =
        !!isDirty || Object.keys(touchedFields || {}).length > 0;
      if (hasTouched) {
        return;
      }
    }

    setOpen(next);
  };

  useEffect(() => {
    if (open) {
      reset(defaultFormValues);
    }
  }, [defaultFormValues, open, reset]);

  const onSubmit = async (values: CreateQuotationFormValues) => {
    const payload = {
      leadId: leadData?.id ?? "",
      customerId: leadData?.customerId ?? "",
      buildingType: toCapitalizedText(values.buildingType),
      roofStyle: toCapitalizedText(values.roofStyle),
      width: values.width,
      length: values.length,
      height: values.height,
      currency: toCurrencyCode(values.currency),
      windLoad: `${values.windLoad} mph`,
      snowLoad: `${values.snowLoad} psf`,
      estimatedDelivery: values.estimatedDelivery,
      companyName:
        values.company || values.customerName || leadData?.name || "",
      paymentTerms: getPaymentTermsLabel(values.paymentTerms),
      basePrice: values.basePrice,
      margin: toNumber(values.margin),
      validTill: toIsoDate(values.validUntil),
      assignedSalesperson: values.assignedSalesperson,
      proposalDate: toIsoDate(values.proposalDate),
      validity: values.validity,
      preparedBy: values.preparedBy,
      leftEaveHeight: 24,
      rightEaveHeight: 24,
      roofSlope: "1:12",
      frameType: "Clear Span",
      endwallType: "Post & Beam",
      girtType: "Bypass",
      purlinType: "Z Purlin",
      bracingType: "Cross Bracing",
      roofPanel: "PBR 26 Gauge",
      wallPanelType: "PBR 26 Gauge",
      roofColor: "Galvalume",
      wallColor: "Polar White",
      trimColor: "Brite Red",
      baseAngle: "3x3x1/4",
      insulation: defaultInsuranceItems,
      shippingCost: 8000,
      deliveryType: "FOB Destination",
      shippingIncluded: true,
      materialCost: 180000,
      freightCost: 8000,
      markupPercent: 20,
      doors: [
        {
          doorCategory: "rolling",
          doorType: "Manual Chain",
          size: "12x14",
          qty: 2,
          notes: "Insulated",
        },
        {
          doorCategory: "personnel",
          doorType: "Steel",
          size: "3x7",
          qty: 1,
          notes: "",
        },
      ],
      includedComponents: includedComponentDefaults,
      exclusions: exclusionDefaults,
      clientNotes: values.specialNotes,
      internalNotes: values.internalNotes,
      priorityLevel: values.priorityLevel,
      changeNote: mode === "edit" ? "Updated proposal" : "Initial proposal",
    };
    console.log(leadData, payload);
    await createQuotationMutation.mutateAsync(payload);
    setOpen(false);
    reset(defaultFormValues);
  };

  const includedMaterials = [
    "Primary Frame Structure",
    "Secondary Framing",
    "Roof Panels",
    "Wall Panels",
    "Trim & Flashing",
    "Fasteners & Hardware",
    "Engineering Drawings",
    "Structural Calculations",
    "Foundation Anchor Bolts",
    "Gutter System",
    "Ridge Ventilation",
    "Insulation (if selected)",
  ];

  const optionalAddons = [
    { name: "Walk-in Doors", price: "+$450 each" },
    { name: "Overhead Doors", price: "+$1,200 each" },
    { name: "Windows", price: "+$180 each" },
    { name: "Skylights", price: "+$320 each" },
    { name: "Insulation Package", price: "+$450" },
    { name: "Color Upgrade", price: "+$450" },
    { name: "Concrete Foundation", price: "+$4500" },
    { name: "Electrical Package", price: "+$450" },
    { name: "HVAC Preparation", price: "+$450" },
    { name: "Loading Dock", price: "+$450" },
    { name: "Office Space", price: "+$450" },
    { name: "Mezzanine Level", price: "+$8,900" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {mode === "edit" ? "Edit" : "Create Manual"} Quotation-
              {leadData?.name || "John Doe"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              type="button"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form className="px-6 py-4 space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Project Details</h3>
            <div className="grid grid-cols-3 gap-6">
              <Field className="">
                <FieldLabel htmlFor="projectName" className="text-xs">
                  Project Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="projectName"
                  {...register("projectName", {
                    required: "Project name is required",
                  })}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.projectName]} />
              </Field>
              <Field className="">
                <FieldLabel htmlFor="quoteNumber" className="text-xs">
                  Quote Number (AUTO GENERATED){" "}
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="quoteNumber"
                  {...register("quoteNumber", {
                    required: "Quote number is required",
                  })}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.quoteNumber]} />
              </Field>
              <Field className="">
                <FieldLabel htmlFor="proposalDate" className="text-xs">
                  Proposal Date
                </FieldLabel>
                <Input
                  id="proposalDate"
                  type="date"
                  {...register("proposalDate")}
                  className="h-9 text-sm"
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Field className="">
                <FieldLabel htmlFor="validity" className="text-xs">
                  Validity <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="validity"
                  {...register("validity", {
                    required: "Validity is required",
                  })}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.validity]} />
              </Field>
              <Field className="">
                <FieldLabel htmlFor="preparedBy" className="text-xs">
                  Prepared By (salesperson name + company){" "}
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="preparedBy"
                  {...register("preparedBy", {
                    required: "Prepared by is required",
                  })}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.preparedBy]} />
              </Field>
            </div>
          </div>

          {/* Customer Information, Building Requirements, and Pricing in 3 columns */}
          <div className="grid grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Customer Information</h3>

              <Field className="">
                <FieldLabel htmlFor="customerName" className="text-xs">
                  Customer Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="customerName"
                  {...register("customerName", {
                    required: "Customer name is required",
                  })}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.customerName]} />
              </Field>

              <Field className="">
                <FieldLabel htmlFor="email" className="text-xs">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Please enter a valid email",
                    },
                  })}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field className="">
                <FieldLabel htmlFor="phone" className="text-xs">
                  Phone
                </FieldLabel>
                <Input
                  id="phone"
                  {...register("phone")}
                  className="h-9 text-sm"
                />
              </Field>

              <Field className="">
                <FieldLabel htmlFor="location" className="text-xs">
                  Location <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="location"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.location]} />
              </Field>

              <Field className="">
                <FieldLabel htmlFor="company" className="text-xs">
                  Company
                </FieldLabel>
                <Input
                  id="company"
                  {...register("company")}
                  placeholder="Company name (optional)"
                  className="h-9 text-sm"
                />
              </Field>
            </div>

            {/* Building Requirements */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Building Requirements</h3>

              <Field className="">
                <FieldLabel htmlFor="buildingType" className="text-xs">
                  Building Type <span className="text-red-500">*</span>
                </FieldLabel>
                <Controller
                  name="buildingType"
                  control={control}
                  rules={{ required: "Building type is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="buildingType"
                        className="w-full h-9 text-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="garage">Garage</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="agricultural">
                          Agricultural
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.buildingType]} />
              </Field>

              <div className="grid grid-cols-3 gap-2">
                <Field className="">
                  <FieldLabel htmlFor="width" className="text-xs">
                    Width (ft) <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="width"
                    type="number"
                    {...register("width", {
                      required: "Width is required",
                      valueAsNumber: true,
                    })}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.width]} />
                </Field>
                <Field className="">
                  <FieldLabel htmlFor="length" className="text-xs">
                    Length (ft) <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="length"
                    type="number"
                    {...register("length", {
                      required: "Length is required",
                      valueAsNumber: true,
                    })}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.length]} />
                </Field>
                <Field className="">
                  <FieldLabel htmlFor="height" className="text-xs">
                    Height (ft) <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="height"
                    type="number"
                    {...register("height", {
                      required: "Height is required",
                      valueAsNumber: true,
                    })}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.height]} />
                </Field>
              </div>

              <Field className="">
                <FieldLabel htmlFor="roofStyle" className="text-xs">
                  Roof Style <span className="text-red-500">*</span>
                </FieldLabel>
                <Controller
                  name="roofStyle"
                  control={control}
                  rules={{ required: "Roof style is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="roofStyle"
                        className="w-full h-9 text-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gable">Gable Roof</SelectItem>
                        <SelectItem value="gambrel">Gambrel Roof</SelectItem>
                        <SelectItem value="hip">Hip Roof</SelectItem>
                        <SelectItem value="flat">Flat Roof</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.roofStyle]} />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field className="">
                  <FieldLabel htmlFor="windLoad" className="text-xs">
                    Wind Load (mph)
                  </FieldLabel>
                  <Input
                    id="windLoad"
                    type="number"
                    {...register("windLoad", { valueAsNumber: true })}
                    className="h-9 text-sm"
                  />
                </Field>
                <Field className="">
                  <FieldLabel htmlFor="snowLoad" className="text-xs">
                    Snow Load (psf)
                  </FieldLabel>
                  <Input
                    id="snowLoad"
                    type="number"
                    {...register("snowLoad", { valueAsNumber: true })}
                    className="h-9 text-sm"
                  />
                </Field>
              </div>

              <Field className="">
                <FieldLabel htmlFor="estimatedDelivery" className="text-xs">
                  Estimated Delivery
                </FieldLabel>
                <Input
                  id="estimatedDelivery"
                  {...register("estimatedDelivery")}
                  className="h-9 text-sm"
                />
              </Field>
            </div>

            {/* Pricing & Materials */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Pricing & Materials</h3>

              <div className="grid grid-cols-2 gap-2">
                <Field className="">
                  <FieldLabel htmlFor="basePrice" className="text-xs">
                    Base Price ($) <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="basePrice"
                    type="number"
                    {...register("basePrice", {
                      required: "Base price is required",
                      valueAsNumber: true,
                    })}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.basePrice]} />
                </Field>
                <Field className="">
                  <FieldLabel htmlFor="margin" className="text-xs">
                    Margin <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="margin"
                    {...register("margin", {
                      required: "Margin is required",
                    })}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.margin]} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field className="">
                  <FieldLabel htmlFor="currency" className="text-xs">
                    Currency
                  </FieldLabel>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="currency"
                          className="w-full h-9 text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field className="">
                  <FieldLabel htmlFor="totalPrice" className="text-xs">
                    Total <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="totalPrice"
                    {...register("totalPrice", {
                      required: "Total is required",
                    })}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.totalPrice]} />
                </Field>
              </div>

              <Field className="">
                <FieldLabel htmlFor="validUntil" className="text-xs">
                  Quotation Valid Until
                </FieldLabel>
                <Input
                  id="validUntil"
                  type="date"
                  {...register("validUntil")}
                  placeholder="dd-mm-yyyy"
                  className="h-9 text-sm"
                />
              </Field>

              <Field className="">
                <FieldLabel htmlFor="paymentTerms" className="text-xs">
                  Payment Terms
                </FieldLabel>
                <Controller
                  name="paymentTerms"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="paymentTerms"
                        className="w-full h-9 text-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50-50">
                          50% Down, 50% on Delivery
                        </SelectItem>
                        <SelectItem value="30-70">
                          30% Down, 70% on Delivery
                        </SelectItem>
                        <SelectItem value="full">
                          Full Payment Upfront
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field className="">
                <FieldLabel htmlFor="assignedSalesperson" className="text-xs">
                  Assigned Salesperson
                </FieldLabel>
                <Controller
                  name="assignedSalesperson"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="assignedSalesperson"
                        className="w-full h-9 text-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">AI Assistant</SelectItem>
                        <SelectItem value="sarah">Sarah Lee</SelectItem>
                        <SelectItem value="john">John Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
          </div>

          {/* Detailed Building Specs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Detailed Building Specs</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Left Eave Height <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="24 ft" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Right Eave Height <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="24 ft" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">Roof Slope</Label>
                <Select defaultValue="1_12">
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_12">1:12</SelectItem>
                    <SelectItem value="2_12">2:12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Total Area (AUTO CALCULATED){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="20,000 sq ft" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Structure & Engineering Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">
              Structure & Engineering Details
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Frame Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Clear Span" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Endwall Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Post & Beam" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">Girt Type</Label>
                <Input defaultValue="Bypass" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Purlin Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Z Purlin" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Bracing Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Cross Bracing" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Material Specifications */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Material Specifications</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Roof Panel Type <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-400" />
                  <div className="w-5 h-5 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-red-600" />
                  <div className="w-5 h-5 rounded-full bg-green-600" />
                  <div className="w-5 h-5 rounded-full bg-orange-500" />
                </div>
              </div>
              <div className="">
                <Label className="text-xs">
                  Wall Panel Type <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-400" />
                  <div className="w-5 h-5 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-red-600" />
                  <div className="w-5 h-5 rounded-full bg-green-600" />
                  <div className="w-5 h-5 rounded-full bg-orange-500" />
                </div>
              </div>
              <div className="">
                <Label className="text-xs">Roof Color</Label>
                <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-black" />
                  <div className="w-5 h-5 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-slate-600" />
                  <div className="w-5 h-5 rounded-full bg-red-600" />
                  <div className="w-5 h-5 rounded-full bg-orange-500" />
                </div>
              </div>

              <div className="">
                <Label className="text-xs">
                  Wall Color <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-400" />
                  <div className="w-5 h-5 rounded-full bg-green-600" />
                  <div className="w-5 h-5 rounded-full bg-red-600" />
                  <div className="w-5 h-5 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-orange-500" />
                </div>
              </div>
              <div className="">
                <Label className="text-xs">
                  Trim Color <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-400" />
                  <div className="w-5 h-5 rounded-full bg-green-600" />
                  <div className="w-5 h-5 rounded-full bg-red-600" />
                  <div className="w-5 h-5 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-orange-500" />
                </div>
              </div>
              <div className="">
                <Label className="text-xs">
                  Base Angle <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-black" />
                  <div className="w-5 h-5 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-slate-600" />
                  <div className="w-5 h-5 rounded-full bg-red-600" />
                  <div className="w-5 h-5 rounded-full bg-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Insulation Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Insulation Details</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Roof" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Thickness <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="6 inch" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">Material</Label>
                <Input
                  defaultValue="VR (Vinyl Reinforced)"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Wall" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Thickness <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4 inch" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">Material</Label>
                <Input
                  defaultValue="WMP (White Metalized Poly)"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Freight / Shipping */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Freight / Shipping</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Shipping Cost <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4,50,000" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Delivery Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Delivered" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">Included</Label>
                <Input defaultValue="Yes" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* COGS + Pricing Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">COGS + Pricing Breakdown</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Material Cost <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="80,00,000" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Freight Cost <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4,50,000" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">Total COGS</Label>
                <Input defaultValue="84,50,000" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Markup % <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="18%" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Markup Value <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="15,21,000" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">Final Price</Label>
                <Input defaultValue="99,71,000" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* PSF Calculation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">PSF Calculation</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <Label className="text-xs">
                  Total Area <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="20,000 sq ft" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Final Price <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="99,71,000" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">PSF</Label>
                <Input defaultValue="498.55 / sq ft" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Door & Openings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Door & Openings</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="">
                <Label className="text-xs">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Rolling Door" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Size <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="10' x 12'" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Qty <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Notes <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Trac-Rite Model" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="">
                <Label className="text-xs">
                  Personnel Door <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Rolling Door" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Size <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="3' x 7'" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Qty <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="2" className="h-9 text-sm" />
              </div>
              <div className="">
                <Label className="text-xs">
                  Notes <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Steel Exit Door" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Included Materials & Components */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              Included Materials & Components
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {includedMaterials.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 border p-2 rounded-md"
                >
                  <input
                    type="checkbox"
                    id={`material-${index}`}
                    className="rounded border-gray-300 h-4 w-4"
                  />
                  <label
                    htmlFor={`material-${index}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {material}
                  </label>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-black h-8 px-2 border-0 shadow-none hover:bg-transparent justify-start"
            >
              <Plus className="h-4 w-4 mr-1 border rounded" />
              Add
            </Button>
          </div>

          {/* Optional Add-ons & Upgrades */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              Optional Add-ons & Upgrades
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {optionalAddons.map((addon, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between space-x-2 pr-2 border p-2 rounded-md"
                >
                  <div className="flex items-center space-x-2 ">
                    <input
                      type="checkbox"
                      id={`addon-${index}`}
                      className="rounded border-gray-300 h-4 w-4"
                    />
                    <label
                      htmlFor={`addon-${index}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {addon.name}
                    </label>
                  </div>
                  <span className="text-xs text-purple-600 whitespace-nowrap">
                    {addon.price}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-black h-8 px-2 border-0 shadow-none hover:bg-transparent justify-start"
            >
              <Plus className="h-4 w-4 mr-1 border rounded" />
              Add
            </Button>
          </div>

          {/* Client Notes (Visible in Proposal) */}
          <Field className="">
            <FieldLabel
              htmlFor="specialNotes"
              className="text-sm font-semibold"
            >
              Client Notes (Visible in Proposal)
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="specialNotes"
                {...register("specialNotes")}
                placeholder="Delivery within 6-8 weeks after order confirmation.&#10;Prices subject to steel market fluctuation."
                className="min-h-24 text-sm resize-none"
              />
            </FieldContent>
          </Field>

          {/* Internal Notes */}
          <Field className="">
            <FieldLabel
              htmlFor="internalNotes"
              className="text-sm text-gray-500"
            >
              Internal Notes (Hidden)
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="internalNotes"
                {...register("internalNotes")}
                placeholder="Client is price sensitive - keep markup under 20%&#10;Possible negotiation expected"
                className="min-h-24 text-sm resize-none"
              />
            </FieldContent>
          </Field>

          {/* Lead Source and Priority Level */}
          <div className="grid grid-cols-3 gap-6">
            <Field className="">
              <FieldLabel htmlFor="leadSource" className="text-xs">
                Lead source
              </FieldLabel>
              <Controller
                name="leadSource"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="leadSource" className="w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-value">
                        High- value prospect, intrested in additional features
                      </SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field className="">
              <FieldLabel htmlFor="priorityLevel" className="text-xs">
                Priority Level
              </FieldLabel>
              <Controller
                name="priorityLevel"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="priorityLevel"
                      className="w-full text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field className="">
              <FieldLabel htmlFor="assignLead" className="text-xs">
                Assign Lead
              </FieldLabel>
              <Controller
                name="assignLead"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="assignLead"
                      className="w-full text-sm text-muted-foreground"
                    >
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Member 1</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          {/* Quote Versioning */}
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-sm">Quote Versioning</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <ul className="list-disc pl-5 ">
                <li>Version: Rev 1</li>
                <li>Version: Rev 2</li>
              </ul>
              <ul className="list-disc pl-5 ">
                <li>Date: 20 Apr 2026</li>
                <li>Date: 24 Apr 2026</li>
              </ul>
              <ul className="list-disc pl-5 ">
                <li>Changes: Initial quote</li>
                <li>Added insulation + doors</li>
              </ul>
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-sm">Exclusions</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Foundation work not included</li>
              <li>Erection / installation not included</li>
              <li>Electrical & plumbing excluded</li>
              <li>Government approvals excluded</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t flex items-center justify-between  bg-white">
            <div className="flex gap-2">
              <Button
                size="lg"
                className="w-40 border-0 bg-slate-100 hover:bg-slate-200 text-black"
                variant="outline"
                type="button"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                size="lg"
                className="bg-slate-600 hover:bg-slate-700 text-white w-40"
                type="button"
                disabled={createQuotationMutation.isPending}
              >
                Save as Draft
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-44"
                type="button"
                disabled={createQuotationMutation.isPending}
                onClick={() => {
                  const formData = getValues();
                  navigate("/leads/quotation-preview", {
                    state: { quotationData: formData, leadData },
                  });
                }}
              >
                Preview Quotation
              </Button>
              <Button
                size="lg"
                className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
                type="submit"
                disabled={createQuotationMutation.isPending}
              >
                {`Generate & Send via ${
                  sendMethod === "email"
                    ? "email"
                    : sendMethod === "whatsapp"
                      ? "WhatsApp"
                      : "Website"
                }`}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
                    type="submit"
                    disabled={createQuotationMutation.isPending}
                  >
                    {`Generate & Send via ${
                      sendMethod === "email"
                        ? "email"
                        : sendMethod === "whatsapp"
                          ? "WhatsApp"
                          : "Website"
                    }`}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuRadioGroup
                    value={sendMethod}
                    onValueChange={(v) =>
                      setSendMethod(v as "email" | "whatsapp" | "website")
                    }
                  >
                    <DropdownMenuRadioItem value="email">
                      Email
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="whatsapp">
                      WhatsApp
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="website">
                      Website
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
