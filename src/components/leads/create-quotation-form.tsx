import { useState, useEffect } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ColorSelector, {
  DEFAULT_COLORS,
  ROOF_COLORS,
} from "@/components/color-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQuotationMutation } from "@/modules/quotations/quotations.hooks";
import { useAuthStore } from "@/modules/auth/auth.store";
import SuccessDialog from "@/components/success-dialog";
import type { LeadListItem } from "@/modules/leads/leads.api";

const requiredText = (message: string) => z.string().trim().min(1, message);

const optionalText = z.string().trim().optional();

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => !value || /^\S+@\S+\.\S+$/.test(value), {
    message: "Please enter a valid email",
  });

const toOptionalNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const requiredNumber = (message: string) =>
  z.preprocess(toOptionalNumber, z.number().min(1, message));

const optionalNumber = z.preprocess(toOptionalNumber, z.number().optional());

const createQuotationSchema = z.object({
  projectName: requiredText("Project name is required"),
  quoteNumber: optionalText,
  proposalDate: optionalText,
  validity: optionalText,
  preparedBy: optionalText,
  customerName: requiredText("Customer name is required"),
  email: optionalEmail,
  phone: optionalText,
  location: requiredText("Location is required"),
  company: optionalText,
  buildingType: z.enum(["workshop", "garage", "commercial", "agricultural"]),
  width: requiredNumber("Width is required"),
  length: requiredNumber("Length is required"),
  height: requiredNumber("Height is required"),
  roofStyle: z.enum(["gable", "gambrel", "hip", "flat"]),
  windLoad: optionalNumber,
  snowLoad: optionalNumber,
  roofPanelType: requiredText("Roof panel type is required"),
  wallPanelType: requiredText("Wall panel type is required"),
  roofColor: optionalText,
  wallColor: requiredText("Wall color is required"),
  trimColor: requiredText("Trim color is required"),
  baseAngleColor: requiredText("Base angle color is required"),
  estimatedDelivery: optionalText,
  basePrice: requiredNumber("Base price is required"),
  margin: requiredText("Margin is required"),
  currency: z.enum(["usd", "eur", "gbp"]),
  totalPrice: requiredText("Total is required"),
  validUntil: optionalText,
  paymentTerms: z.enum(["50-50", "30-70", "full"]),
  specialNotes: optionalText,
  internalNotes: optionalText,
  leadSource: z.enum(["high-value", "website", "referral", "social"]),
  priorityLevel: z.enum(["low", "medium", "high", "urgent"]),
  assignLead: optionalText,
  leftEaveHeight: requiredText("Left eave height is required"),
  rightEaveHeight: requiredText("Right eave height is required"),
  roofSlope: optionalText,
  totalArea: requiredText("Total area is required"),
  frameType: requiredText("Frame type is required"),
  endwallType: requiredText("Endwall type is required"),
  girtType: optionalText,
  purlinType: requiredText("Purlin type is required"),
  bracingType: requiredText("Bracing type is required"),
  insulationTypeRoof: requiredText("Roof insulation type is required"),
  insulationThicknessRoof: requiredText(
    "Roof insulation thickness is required",
  ),
  insulationMaterialRoof: optionalText,
  insulationTypeWall: requiredText("Wall insulation type is required"),
  insulationThicknessWall: requiredText(
    "Wall insulation thickness is required",
  ),
  insulationMaterialWall: optionalText,
  shippingCost: requiredText("Shipping cost is required"),
  deliveryType: requiredText("Delivery type is required"),
  shippingIncluded: optionalText,
  materialCostDisplay: requiredText("Material cost is required"),
  freightCostDisplay: requiredText("Freight cost is required"),
  totalCOGS: optionalText,
  markupPercentDisplay: requiredText("Markup percentage is required"),
  markupValueDisplay: requiredText("Markup value is required"),
  finalPriceDisplay: optionalText,
  psf: optionalText,
  doorType: requiredText("Door type is required"),
  doorSize: requiredText("Door size is required"),
  doorQty: requiredText("Door quantity is required"),
  doorNotes: requiredText("Door notes are required"),
  personnelDoorType: requiredText("Personnel door type is required"),
  personnelDoorSize: requiredText("Personnel door size is required"),
  personnelDoorQty: requiredText("Personnel door quantity is required"),
  personnelDoorNotes: requiredText("Personnel door notes are required"),
  includedMaterials: z.array(z.string()).optional(),
  optionalAddons: z.array(z.string()).optional(),
});

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
  roofPanelType?: string;
  wallPanelType?: string;
  roofColor?: string;
  wallColor?: string;
  trimColor?: string;
  baseAngleColor?: string;
  estimatedDelivery: string;
  basePrice: number;
  margin: string;
  currency: "usd" | "eur" | "gbp";
  totalPrice: string;
  validUntil: string;
  paymentTerms: "50-50" | "30-70" | "full";
  specialNotes: string;
  internalNotes: string;
  leadSource: "high-value" | "website" | "referral" | "social";
  priorityLevel: "low" | "medium" | "high" | "urgent";
  assignLead: string;
  leftEaveHeight?: string;
  rightEaveHeight?: string;
  roofSlope?: string;
  totalArea?: string;
  frameType?: string;
  endwallType?: string;
  girtType?: string;
  purlinType?: string;
  bracingType?: string;
  insulationTypeRoof?: string;
  insulationThicknessRoof?: string;
  insulationMaterialRoof?: string;
  insulationTypeWall?: string;
  insulationThicknessWall?: string;
  insulationMaterialWall?: string;
  shippingCost?: string;
  deliveryType?: string;
  shippingIncluded?: string;
  materialCostDisplay?: string;
  freightCostDisplay?: string;
  totalCOGS?: string;
  markupPercentDisplay?: string;
  markupValueDisplay?: string;
  finalPriceDisplay?: string;
  psf?: string;
  doorType?: string;
  doorSize?: string;
  doorQty?: string;
  doorNotes?: string;
  personnelDoorType?: string;
  personnelDoorSize?: string;
  personnelDoorQty?: string;
  personnelDoorNotes?: string;
  includedMaterials?: string[];
  optionalAddons?: string[];
};

const exclusionDefaults: string[] = [];

const toIsoDate = (value?: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : "";

const toNumber = (value?: string, fallback = 0) => {
  const raw = value ?? "";
  const parsedValue = Number(raw.replace(/[^0-9.-]+/g, ""));

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const toCurrencyCode = (value: CreateQuotationFormValues["currency"]) =>
  value.toUpperCase();

const toCapitalizedText = (value: string) =>
  value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const mapBuildingType = (
  value?: string,
): CreateQuotationFormValues["buildingType"] => {
  if (!value) return "workshop";
  const v = value.toLowerCase();
  if (v.includes("work")) return "workshop";
  if (v.includes("garage")) return "garage";
  if (v.includes("commercial")) return "commercial";
  if (v.includes("agri") || v.includes("agricultural")) return "agricultural";
  return "workshop";
};

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

export default function CreateQuotationForm({
  leadData,
  mode = "create",
  initialValues,
}: {
  leadData?: LeadListItem;
  mode?: "create" | "edit";
  initialValues?: Partial<CreateQuotationFormValues>;
}) {
  const navigate = useNavigate();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [sendMethod] = useState<"email" | "whatsapp" | "website">("email");
  const createQuotationMutation = useCreateQuotationMutation();
  const currentUser = useAuthStore((state) => state.user);

  const {
    register,
    control,
    handleSubmit,
    formState,
    getValues,
    setValue,
    trigger,
  } = useForm<CreateQuotationFormValues>({
    resolver: zodResolver(
      createQuotationSchema,
    ) as Resolver<CreateQuotationFormValues>,
    defaultValues: {
      projectName: initialValues?.projectName ?? leadData?.projectName,
      quoteNumber: initialValues?.quoteNumber ?? "",
      proposalDate: initialValues?.proposalDate ?? "",
      validity: initialValues?.validity ?? "",
      preparedBy: initialValues?.preparedBy ?? "",
      customerName:
        initialValues?.customerName ?? leadData?.customerId?.firstName ?? "",
      email: initialValues?.email ?? leadData?.customerId?.email ?? "",
      phone: initialValues?.phone ?? "",
      location: initialValues?.location ?? leadData?.location ?? "",
      company: initialValues?.company ?? "",
      buildingType:
        initialValues?.buildingType ?? mapBuildingType(leadData?.buildingType),
      width: initialValues?.width ?? 0,
      length: initialValues?.length ?? 0,
      height: initialValues?.height ?? 0,
      roofStyle: initialValues?.roofStyle ?? "gable",
      windLoad: initialValues?.windLoad ?? 0,
      snowLoad: initialValues?.snowLoad ?? 0,
      roofPanelType: initialValues?.roofPanelType ?? "",
      wallPanelType: initialValues?.wallPanelType ?? "",
      roofColor: initialValues?.roofColor ?? "",
      wallColor: initialValues?.wallColor ?? "",
      trimColor: initialValues?.trimColor ?? "",
      baseAngleColor: initialValues?.baseAngleColor ?? "",
      estimatedDelivery: initialValues?.estimatedDelivery ?? "",
      basePrice: initialValues?.basePrice ?? 0,
      margin: initialValues?.margin ?? "",
      currency: initialValues?.currency ?? "usd",
      totalPrice: initialValues?.totalPrice ?? "",
      validUntil: initialValues?.validUntil ?? "",
      paymentTerms: initialValues?.paymentTerms ?? "50-50",
      specialNotes: initialValues?.specialNotes ?? "",
      internalNotes: initialValues?.internalNotes ?? "",
      leadSource: initialValues?.leadSource ?? "website",
      priorityLevel: initialValues?.priorityLevel ?? "medium",
      assignLead: initialValues?.assignLead ?? "",
      leftEaveHeight: initialValues?.leftEaveHeight ?? "",
      rightEaveHeight: initialValues?.rightEaveHeight ?? "",
      roofSlope: initialValues?.roofSlope ?? "",
      totalArea: initialValues?.totalArea ?? "",
      frameType: initialValues?.frameType ?? "",
      endwallType: initialValues?.endwallType ?? "",
      girtType: initialValues?.girtType ?? "",
      purlinType: initialValues?.purlinType ?? "",
      bracingType: initialValues?.bracingType ?? "",
      insulationTypeRoof: initialValues?.insulationTypeRoof ?? "",
      insulationThicknessRoof: initialValues?.insulationThicknessRoof ?? "",
      insulationMaterialRoof: initialValues?.insulationMaterialRoof ?? "",
      insulationTypeWall: initialValues?.insulationTypeWall ?? "",
      insulationThicknessWall: initialValues?.insulationThicknessWall ?? "",
      insulationMaterialWall: initialValues?.insulationMaterialWall ?? "",
      shippingCost: initialValues?.shippingCost ?? "",
      deliveryType: initialValues?.deliveryType ?? "",
      shippingIncluded: initialValues?.shippingIncluded ?? "",
      materialCostDisplay: initialValues?.materialCostDisplay ?? "",
      freightCostDisplay: initialValues?.freightCostDisplay ?? "",
      totalCOGS: initialValues?.totalCOGS ?? "",
      markupPercentDisplay: initialValues?.markupPercentDisplay ?? "",
      markupValueDisplay: initialValues?.markupValueDisplay ?? "",
      finalPriceDisplay: initialValues?.finalPriceDisplay ?? "",
      psf: initialValues?.psf ?? "",
      doorType: initialValues?.doorType ?? "",
      doorSize: initialValues?.doorSize ?? "",
      doorQty: initialValues?.doorQty ?? "",
      doorNotes: initialValues?.doorNotes ?? "",
      personnelDoorType: initialValues?.personnelDoorType ?? "",
      personnelDoorSize: initialValues?.personnelDoorSize ?? "",
      personnelDoorQty: initialValues?.personnelDoorQty ?? "",
      personnelDoorNotes: initialValues?.personnelDoorNotes ?? "",
      includedMaterials: initialValues?.includedMaterials ?? [
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
      ],
      optionalAddons: initialValues?.optionalAddons ?? [],
    },
  });

  const { errors } = formState;

  // Auto-calculate totalArea from width and length (watch fields directly
  // to avoid triggering a loop when we `setValue` for totalArea)
  const watchedWidth = useWatch({ name: "width", control });
  const watchedLength = useWatch({ name: "length", control });

  useEffect(() => {
    const w = Number(watchedWidth ?? 0);
    const l = Number(watchedLength ?? 0);
    const area = w > 0 && l > 0 ? (w * l).toFixed(2) : "";
    console.log("Auto-calculating total area:", { width: w, length: l, area });
    setValue("totalArea", area ? String(area) : "");
  }, [watchedWidth, watchedLength, setValue]);

  // useEffect(() => {
  //   reset(defaultFormValues);
  // }, [defaultFormValues, reset]);

  const onSubmit = async (values: CreateQuotationFormValues) => {
    const formatRoofSlope = (s?: string) => {
      if (!s) return "1:12";
      return s.includes("_") ? s.replace("_", ":") : s;
    };
    const payload = {
      leadId: leadData?._id ?? "",
      customerId: leadData?.customerId?._id ?? "",
      buildingType: toCapitalizedText(values.buildingType),
      roofStyle: toCapitalizedText(values.roofStyle),
      width: Number(values.width),
      length: Number(values.length),
      height: Number(values.height),
      currency: toCurrencyCode(values.currency),
      windLoad: values.windLoad ? `${values.windLoad} mph` : "",
      snowLoad: values.snowLoad ? `${values.snowLoad} psf` : "",
      estimatedDelivery: values.estimatedDelivery ?? "",
      companyName:
        values.company ||
        values.customerName ||
        leadData?.customerId?.firstName ||
        leadData?.projectName ||
        "",
      paymentTerms: getPaymentTermsLabel(values.paymentTerms),
      basePrice: Number(values.basePrice),
      margin: toNumber(values.margin),
      validTill: toIsoDate(values.validUntil ?? ""),
      assignedSalesperson: currentUser?._id || "",
      proposalDate: toIsoDate(values.proposalDate ?? ""),
      validity: values.validity,
      preparedBy: values.preparedBy,
      leftEaveHeight: toNumber(String(values.leftEaveHeight ?? "")),
      rightEaveHeight: toNumber(String(values.rightEaveHeight ?? "")),
      roofPanelType: values.roofPanelType || "",
      wallPanelType: values.wallPanelType || "",
      roofColor: values.roofColor || "",
      wallColor: values.wallColor || "",
      trimColor: values.trimColor || "",
      baseAngleColor: values.baseAngleColor || "",
      roofSlope: formatRoofSlope(values.roofSlope),
      frameType: values.frameType || "",
      endwallType: values.endwallType || "",
      girtType: values.girtType || "",
      purlinType: values.purlinType || "",
      bracingType: values.bracingType || "",
      roofPanel: values.roofPanelType || "",
      baseAngle: values.baseAngleColor || "",
      insulation: [
        ...(values.insulationTypeRoof ||
        values.insulationThicknessRoof ||
        values.insulationMaterialRoof
          ? [
              {
                insulationType: `Roof: ${values.insulationTypeRoof || ""}`,
                thickness: values.insulationThicknessRoof || "",
                material: values.insulationMaterialRoof || "",
              },
            ]
          : []),
        ...(values.insulationTypeWall ||
        values.insulationThicknessWall ||
        values.insulationMaterialWall
          ? [
              {
                insulationType: `Wall: ${values.insulationTypeWall || ""}`,
                thickness: values.insulationThicknessWall || "",
                material: values.insulationMaterialWall || "",
              },
            ]
          : []),
      ],
      shippingCost: toNumber(String(values.shippingCost ?? "")),
      deliveryType: values.deliveryType || "",
      shippingIncluded:
        values.shippingIncluded === "Yes" ||
        values.shippingIncluded === "true" ||
        false,
      materialCost: toNumber(String(values.materialCostDisplay ?? "")),
      freightCost: toNumber(String(values.freightCostDisplay ?? "")),
      markupPercent: toNumber(String(values.markupPercentDisplay ?? "")),
      doors: [
        ...(values.doorType
          ? [
              {
                doorCategory: "Roll Up Door",
                doorType: values.doorType,
                size: values.doorSize || "",
                qty: toNumber(values.doorQty),
                notes: values.doorNotes || "",
              },
            ]
          : []),
        ...(values.personnelDoorType
          ? [
              {
                doorCategory: "Personnel Door",
                doorType: values.personnelDoorType,
                size: values.personnelDoorSize || "",
                qty: toNumber(values.personnelDoorQty),
                notes: values.personnelDoorNotes || "",
              },
            ]
          : []),
      ],
      includedComponents: values.includedMaterials || [],
      exclusions: exclusionDefaults,
      clientNotes: values.specialNotes,
      internalNotes: values.internalNotes,
      priorityLevel: values.priorityLevel,
      changeNote: mode === "edit" ? "Updated proposal" : "Initial proposal",
    };
    await createQuotationMutation.mutateAsync(payload);
    // reset(defaultFormValues);
    setSuccessDialogOpen(true);
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
    <div className="sm:max-w-4xl w-full bg-white rounded-lg shadow p-0 overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {mode === "edit" ? "Edit" : "Create Manual"} Quotation -
            {leadData?.projectName || "Untitled Lead"}
          </div>
        </div>
      </div>

      <form className="px-6 py-4 space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Project Details</h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.projectName)}>
              <FieldLabel htmlFor="projectName" className="text-xs">
                Project Name <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="projectName"
                  {...register("projectName")}
                  aria-invalid={Boolean(errors.projectName)}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.projectName]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.quoteNumber)}>
              <FieldLabel htmlFor="quoteNumber" className="text-xs">
                Quote Number (AUTO GENERATED){" "}
                <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  disabled
                  id="quoteNumber"
                  {...register("quoteNumber")}
                  aria-invalid={Boolean(errors.quoteNumber)}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.quoteNumber]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="proposalDate" className="text-xs">
                Proposal Date
              </FieldLabel>
              <FieldContent>
                <Input
                  id="proposalDate"
                  type="date"
                  {...register("proposalDate")}
                  className="h-9 text-sm"
                />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* Customer Information, Building Requirements, and Pricing in 3 columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Customer Information */}
          <FieldGroup className="">
            <h3 className="font-semibold text-sm">Customer Information</h3>

            <Field data-invalid={Boolean(errors.customerName)}>
              <FieldLabel htmlFor="customerName" className="text-xs">
                Customer Name <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  aria-invalid={Boolean(errors.customerName)}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.customerName]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email" className="text-xs">
                Email
              </FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="phone" className="text-xs">
                Phone
              </FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  {...register("phone")}
                  className="h-9 text-sm"
                />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location" className="text-xs">
                Location <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="location"
                  {...register("location")}
                  aria-invalid={Boolean(errors.location)}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.location]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="company" className="text-xs">
                Company
              </FieldLabel>
              <FieldContent>
                <Input
                  id="company"
                  {...register("company")}
                  placeholder="Company name (optional)"
                  className="h-9 text-sm"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          {/* Building Requirements */}
          <FieldGroup className="">
            <h3 className="font-semibold text-sm">Building Requirements</h3>

            <Field>
              <FieldLabel htmlFor="buildingType" className="text-xs">
                Building Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="buildingType"
                  control={control}
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
              </FieldContent>
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field data-invalid={Boolean(errors.width)}>
                <FieldLabel htmlFor="width" className="text-xs">
                  Width (ft) <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="width"
                    type="number"
                    {...register("width", { valueAsNumber: true })}
                    min={1}
                    aria-invalid={Boolean(errors.width)}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.width]} />
                </FieldContent>
              </Field>
              <Field data-invalid={Boolean(errors.length)}>
                <FieldLabel htmlFor="length" className="text-xs">
                  Length (ft) <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="length"
                    type="number"
                    {...register("length", { valueAsNumber: true })}
                    min={1}
                    aria-invalid={Boolean(errors.length)}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.length]} />
                </FieldContent>
              </Field>
              <Field data-invalid={Boolean(errors.height)}>
                <FieldLabel htmlFor="height" className="text-xs">
                  Height (ft) <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="height"
                    type="number"
                    {...register("height", { valueAsNumber: true })}
                    min={1}
                    aria-invalid={Boolean(errors.height)}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[errors.height]} />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="roofStyle" className="text-xs">
                Roof Style <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="roofStyle"
                  control={control}
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
              </FieldContent>
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

            <Field>
              <FieldLabel htmlFor="estimatedDelivery" className="text-xs">
                Estimated Delivery
              </FieldLabel>
              <FieldContent>
                <Input
                  id="estimatedDelivery"
                  {...register("estimatedDelivery")}
                  className="h-9 text-sm"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          {/* Pricing & Materials */}
          <FieldGroup className="">
            <h3 className="font-semibold text-sm">Pricing & Materials</h3>

            <div className="grid grid-cols-2 gap-2">
              <Field className="">
                <FieldLabel htmlFor="basePrice" className="text-xs">
                  Base Price ($) <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="basePrice"
                  type="number"
                  {...register("basePrice", { valueAsNumber: true })}
                  min={1}
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
                  {...register("margin")}
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  {...register("totalPrice")}
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
                min={new Date().toISOString().split("T")[0]}
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
                      <SelectItem value="full">Full Payment Upfront</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* Detailed Building Specs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Detailed Building Specs</h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.leftEaveHeight)}>
              <FieldLabel htmlFor="leftEaveHeight" className="text-xs">
                Left Eave Height <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="leftEaveHeight"
                  {...register("leftEaveHeight")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.leftEaveHeight]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.rightEaveHeight)}>
              <FieldLabel htmlFor="rightEaveHeight" className="text-xs">
                Right Eave Height <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="rightEaveHeight"
                  {...register("rightEaveHeight")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.rightEaveHeight]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="roofSlope" className="text-xs">
                Roof Slope
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="roofSlope"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_12">1:12</SelectItem>
                        <SelectItem value="2_12">2:12</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.roofSlope]} />
              </FieldContent>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.totalArea)}>
              <FieldLabel htmlFor="totalArea" className="text-xs">
                Total Area (AUTO CALCULATED){" "}
                <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="totalArea"
                  {...register("totalArea")}
                  type="number"
                  readOnly
                  aria-readonly
                  className="h-9 text-sm bg-gray-50"
                />
                <FieldError errors={[errors.totalArea]} />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* Structure & Engineering Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">
            Structure & Engineering Details
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.frameType)}>
              <FieldLabel htmlFor="frameType" className="text-xs">
                Frame Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="frameType"
                  {...register("frameType")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.frameType]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.endwallType)}>
              <FieldLabel htmlFor="endwallType" className="text-xs">
                Endwall Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="endwallType"
                  {...register("endwallType")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.endwallType]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="girtType" className="text-xs">
                Girt Type
              </FieldLabel>
              <FieldContent>
                <Input
                  id="girtType"
                  {...register("girtType")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.girtType]} />
              </FieldContent>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.purlinType)}>
              <FieldLabel htmlFor="purlinType" className="text-xs">
                Purlin Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="purlinType"
                  {...register("purlinType")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.purlinType]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.bracingType)}>
              <FieldLabel htmlFor="bracingType" className="text-xs">
                Bracing Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="bracingType"
                  {...register("bracingType")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.bracingType]} />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* Material Specifications */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Material Specifications</h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.roofPanelType)}>
              <FieldLabel className="text-xs" htmlFor="roofPanelType">
                Roof Panel Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="roofPanelType"
                  control={control}
                  render={({ field }) => (
                    <ColorSelector
                      colors={DEFAULT_COLORS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError errors={[errors.roofPanelType]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.wallPanelType)}>
              <FieldLabel className="text-xs" htmlFor="wallPanelType">
                Wall Panel Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="wallPanelType"
                  control={control}
                  render={({ field }) => (
                    <ColorSelector
                      colors={DEFAULT_COLORS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError errors={[errors.wallPanelType]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="roofColor">
                Roof Color
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="roofColor"
                  control={control}
                  render={({ field }) => (
                    <ColorSelector
                      colors={ROOF_COLORS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError errors={[errors.roofColor]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.wallColor)}>
              <FieldLabel className="text-xs" htmlFor="wallColor">
                Wall Color <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="wallColor"
                  control={control}
                  render={({ field }) => (
                    <ColorSelector
                      colors={DEFAULT_COLORS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError errors={[errors.wallColor]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.trimColor)}>
              <FieldLabel className="text-xs" htmlFor="trimColor">
                Trim Color <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="trimColor"
                  control={control}
                  render={({ field }) => (
                    <ColorSelector
                      colors={DEFAULT_COLORS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError errors={[errors.trimColor]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.baseAngleColor)}>
              <FieldLabel className="text-xs" htmlFor="baseAngleColor">
                Base Angle <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Controller
                  name="baseAngleColor"
                  control={control}
                  render={({ field }) => (
                    <ColorSelector
                      colors={ROOF_COLORS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError errors={[errors.baseAngleColor]} />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* Insulation Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Insulation Details</h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.insulationTypeRoof)}>
              <FieldLabel className="text-xs" htmlFor="insulationTypeRoof">
                Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="insulationTypeRoof"
                  {...register("insulationTypeRoof")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.insulationTypeRoof]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.insulationThicknessRoof)}>
              <FieldLabel className="text-xs" htmlFor="insulationThicknessRoof">
                Thickness <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="insulationThicknessRoof"
                  {...register("insulationThicknessRoof")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.insulationThicknessRoof]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="insulationMaterialRoof">
                Material
              </FieldLabel>
              <FieldContent>
                <Input
                  id="insulationMaterialRoof"
                  {...register("insulationMaterialRoof")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.insulationMaterialRoof]} />
              </FieldContent>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.insulationTypeWall)}>
              <FieldLabel className="text-xs" htmlFor="insulationTypeWall">
                Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="insulationTypeWall"
                  {...register("insulationTypeWall")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.insulationTypeWall]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.insulationThicknessWall)}>
              <FieldLabel className="text-xs" htmlFor="insulationThicknessWall">
                Thickness <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="insulationThicknessWall"
                  {...register("insulationThicknessWall")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.insulationThicknessWall]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="insulationMaterialWall">
                Material
              </FieldLabel>
              <FieldContent>
                <Input
                  id="insulationMaterialWall"
                  {...register("insulationMaterialWall")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.insulationMaterialWall]} />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* Freight / Shipping */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Freight / Shipping</h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.shippingCost)}>
              <FieldLabel className="text-xs" htmlFor="shippingCost">
                Shipping Cost <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="shippingCost"
                  {...register("shippingCost")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.shippingCost]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.deliveryType)}>
              <FieldLabel className="text-xs" htmlFor="deliveryType">
                Delivery Type <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="deliveryType"
                  {...register("deliveryType")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.deliveryType]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="shippingIncluded">
                Included
              </FieldLabel>
              <FieldContent>
                <Input
                  id="shippingIncluded"
                  {...register("shippingIncluded")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.shippingIncluded]} />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* COGS + Pricing Breakdown */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">COGS + Pricing Breakdown</h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.materialCostDisplay)}>
              <FieldLabel className="text-xs" htmlFor="materialCostDisplay">
                Material Cost <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="materialCostDisplay"
                  {...register("materialCostDisplay")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.materialCostDisplay]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.freightCostDisplay)}>
              <FieldLabel className="text-xs" htmlFor="freightCostDisplay">
                Freight Cost <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="freightCostDisplay"
                  {...register("freightCostDisplay")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.freightCostDisplay]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="totalCOGS">
                Total COGS
              </FieldLabel>
              <FieldContent>
                <Input
                  id="totalCOGS"
                  {...register("totalCOGS")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.totalCOGS]} />
              </FieldContent>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.markupPercentDisplay)}>
              <FieldLabel className="text-xs" htmlFor="markupPercentDisplay">
                Markup % <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="markupPercentDisplay"
                  {...register("markupPercentDisplay")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.markupPercentDisplay]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.markupValueDisplay)}>
              <FieldLabel className="text-xs" htmlFor="markupValueDisplay">
                Markup Value <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="markupValueDisplay"
                  {...register("markupValueDisplay")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.markupValueDisplay]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="finalPriceDisplay">
                Final Price
              </FieldLabel>
              <FieldContent>
                <Input
                  id="finalPriceDisplay"
                  {...register("finalPriceDisplay")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.finalPriceDisplay]} />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* PSF Calculation */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">PSF Calculation</h3>
          <div className="grid grid-cols-3 gap-6">
            <Field data-invalid={Boolean(errors.totalArea)}>
              <FieldLabel className="text-xs" htmlFor="totalArea">
                Total Area <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="totalArea"
                  {...register("totalArea")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.totalArea]} />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.finalPriceDisplay)}>
              <FieldLabel className="text-xs" htmlFor="finalPriceDisplay">
                Final Price <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="finalPriceDisplay"
                  {...register("finalPriceDisplay")}
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.finalPriceDisplay]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="psf">
                PSF
              </FieldLabel>
              <FieldContent>
                <Input
                  id="psf"
                  {...register("psf")}
                  type="number"
                  className="h-9 text-sm"
                />
                <FieldError errors={[errors.psf]} />
              </FieldContent>
            </Field>
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
              <Input {...register("doorType")} className="h-9 text-sm" />
            </div>
            <div className="">
              <Label className="text-xs">
                Size <span className="text-red-500">*</span>
              </Label>
              <Input {...register("doorSize")} className="h-9 text-sm" />
            </div>
            <div className="">
              <Label className="text-xs">
                Qty <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("doorQty")}
                type="number"
                className="h-9 text-sm"
              />
            </div>
            <div className="">
              <Label className="text-xs">
                Notes <span className="text-red-500">*</span>
              </Label>
              <Input {...register("doorNotes")} className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="">
              <Label className="text-xs">
                Personnel Door <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("personnelDoorType")}
                className="h-9 text-sm"
              />
            </div>
            <div className="">
              <Label className="text-xs">
                Size <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("personnelDoorSize")}
                className="h-9 text-sm"
              />
            </div>
            <div className="">
              <Label className="text-xs">
                Qty <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("personnelDoorQty")}
                type="number"
                className="h-9 text-sm"
              />
            </div>
            <div className="">
              <Label className="text-xs">
                Notes <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("personnelDoorNotes")}
                className="h-9 text-sm"
              />
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
                  value={material}
                  {...register("includedMaterials")}
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
          <h3 className="font-semibold text-sm">Optional Add-ons & Upgrades</h3>
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
                    value={addon.name}
                    {...register("optionalAddons")}
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
          <FieldLabel htmlFor="specialNotes" className="text-sm font-semibold">
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
          <FieldLabel htmlFor="internalNotes" className="text-sm text-gray-500">
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
        <FieldGroup className="grid grid-cols-3 gap-6">
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
                  <SelectTrigger id="priorityLevel" className="w-full text-sm">
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
        </FieldGroup>

        {/* Quote Versioning */}
        <FieldGroup className="pt-4">
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
        </FieldGroup>

        {/* Exclusions */}
        <FieldGroup className="space-y-4 pt-4">
          <h3 className="font-semibold text-sm">Exclusions</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Foundation work not included</li>
            <li>Erection / installation not included</li>
            <li>Electrical & plumbing excluded</li>
            <li>Government approvals excluded</li>
          </ul>
        </FieldGroup>

        <div className="px-6 py-4 border-t flex items-center justify-between  bg-white">
          <div className="flex gap-2">
            <Button
              size="lg"
              className="w-40 border-0 bg-slate-100 hover:bg-slate-200 text-black"
              variant="outline"
              type="button"
              // onClick={() => reset(defaultFormValues)}
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
              onClick={async () => {
                const valid = await trigger();
                if (!valid) return;
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
              {`Generate & Send via ${sendMethod === "email" ? "email" : sendMethod === "whatsapp" ? "WhatsApp" : "Website"}`}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title="Quote sent on mail successfully"
        okLabel="OK"
      />
    </div>
  );
}
