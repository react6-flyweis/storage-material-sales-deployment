import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { z } from "zod";
import CustomerSelector from "@/components/customers/customer-selector";
import Counter from "@/components/counter-input";
import SuccessDialog from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateLeadMutation, useLeadDetailQuery, useUpdateLeadMutation } from "@/modules/leads/leads.hooks";

const requiredNumber = (message: string) => z.number().min(0, message);

const priorityValues = ["Low", "Medium", "High"] as const;

const addNewLeadSchema = z.object({
  customerId: z.string().trim().min(1, "Customer is required"),
  projectName: z.string().trim().min(1, "Project name is required"),
  location: z.string().trim().min(1, "Location is required"),
  estimatedValue: z.string().trim(),
  priority: z.enum(priorityValues),
  roofStyle: z.enum(["gable", "arch"]),
  buildingType: z.enum(["garage"]),
  width: requiredNumber("Width is required"),
  length: requiredNumber("Length is required"),
  height: requiredNumber("Height is required"),
  doors: requiredNumber("Doors are required"),
  windows: requiredNumber("Windows are required"),
  insulation: requiredNumber("Insulation is required"),
  notes: z.string().trim(),
});

type AddNewLeadFormValues = z.infer<typeof addNewLeadSchema>;

const defaultValues: AddNewLeadFormValues = {
  customerId: "",
  projectName: "",
  location: "",
  estimatedValue: "",
  priority: "Medium",
  roofStyle: "gable",
  buildingType: "garage",
  width: 0,
  length: 0,
  height: 0,
  doors: 0,
  windows: 0,
  insulation: 0,
  notes: "",
};

export default function AddNewLead() {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();
  const isEditMode = Boolean(leadId);

  const [showSuccess, setShowSuccess] = useState(false);
  const createLeadMutation = useCreateLeadMutation();
  const updateLeadMutation = useUpdateLeadMutation();
  const { data: response, isLoading: isLoadingLead } = useLeadDetailQuery(leadId, isEditMode);
  const detail = response?.success ? response.data : undefined;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<AddNewLeadFormValues>({
    defaultValues,
    resolver: zodResolver(addNewLeadSchema),
  });

  useEffect(() => {
    if (isEditMode && detail) {
      const lead = detail.lead;
      reset({
        customerId: lead.customerId || "",
        projectName: lead.projectName || "",
        location: lead.location || "",
        estimatedValue: lead.quoteValue ? lead.quoteValue.toString() : "",
        priority: lead.priority || "Medium",
        roofStyle: lead.roofStyle === "Arch" ? "arch" : "gable",
        buildingType: (lead.buildingType?.toLowerCase() === "garage" ? "garage" : "garage") as "garage",
        width: lead.width || 0,
        length: lead.length || 0,
        height: lead.height || 0,
        doors: lead.numDoors || 0,
        windows: lead.numWindows || 0,
        insulation: lead.numInsulation || 0,
        notes: lead.notes || "",
      });
    }
  }, [isEditMode, detail, reset]);

  const onSubmit = async (values: AddNewLeadFormValues) => {
    const payload = {
      customerId: values.customerId,
      projectName: values.projectName,
      location: values.location,
      buildingType: "Storage",
      source: "manual",
      quoteValue: values.estimatedValue
        ? Number.parseInt(values.estimatedValue, 10)
        : 0,
      roofStyle: values.roofStyle === "arch" ? "Arch" : "Gable",
      width: values.width,
      length: values.length,
      height: values.height,
      doors: values.doors,
      windows: values.windows,
      insulation: values.insulation,
      notes: values.notes.trim() || undefined,
      leadStatus: detail?.lead.lifecycleStatus || "initial_contact",
    };

    try {
      if (isEditMode && leadId) {
        await updateLeadMutation.mutateAsync({ leadId, payload });
      } else {
        await createLeadMutation.mutateAsync(payload);
        reset(defaultValues);
      }
      setShowSuccess(true);
    } catch (error) {
      console.error(isEditMode ? "Update lead failed:" : "Create lead failed:", error);
      const errorMessage =
        getApiErrorMessage(error) ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the lead.`;
      setError("root", { message: errorMessage });
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (isEditMode && leadId) {
      navigate(`/leads/${leadId}`);
    } else {
      navigate("/leads");
    }
  };

  if (isEditMode && isLoadingLead) {
    return (
      <div className="p-6">
        <p className="text-gray-600 animate-pulse">Loading lead details...</p>
      </div>
    );
  }

  const submitting = isSubmitting || createLeadMutation.isPending || updateLeadMutation.isPending;

  return (
    <form className="p-6 w-full min-h-0" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft />
            <span>Back</span>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold">
              {isEditMode ? "Edit Lead" : "Add New Lead"}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditMode
                ? "Update the lead record details in your pipeline"
                : "Create a new lead record and assign it to your pipeline"}
            </p>
          </div>
        </div>

        <Button type="submit" className="rounded-sm" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Save Lead"}
        </Button>
      </div>

      {errors.root?.message ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      ) : null}

      <FieldGroup className="rounded-lg bg-white p-5 shadow">
        <Field className="md:w-1/2">
          <FieldLabel htmlFor="customerId">Select Customer</FieldLabel>
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => (
              <CustomerSelector
                value={field.value}
                onValueChange={(customer) => field.onChange(customer?.id || "")}
                disabled={isEditMode}
              />
            )}
          />
        </Field>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
              <Input
                id="projectName"
                type="text"
                placeholder="Enter project name"
                {...register("projectName")}
              />
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                type="text"
                placeholder="Enter location"
                {...register("location")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="estimatedValue">Estimated Value</FieldLabel>
              <Input
                id="estimatedValue"
                type="text"
                placeholder="Enter Estimated Value"
                {...register("estimatedValue")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="priority">Priority</FieldLabel>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="priority" className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low Priority</SelectItem>
                      <SelectItem value="Medium">Medium Priority</SelectItem>
                      <SelectItem value="High">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this lead"
                rows={3}
                {...register("notes")}
              />
            </Field>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Project Specification</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="width">Width (ft/m)</FieldLabel>
                <Controller
                  control={control}
                  name="width"
                  render={({ field }) => (
                    <Counter
                      id="width"
                      value={field.value}
                      onChange={(value) => field.onChange(Math.max(0, value))}
                    />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="length">Length (ft/m)</FieldLabel>
                <Controller
                  control={control}
                  name="length"
                  render={({ field }) => (
                    <Counter
                      id="length"
                      value={field.value}
                      onChange={(value) => field.onChange(Math.max(0, value))}
                    />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="height">Height (ft/m)</FieldLabel>
                <Controller
                  control={control}
                  name="height"
                  render={({ field }) => (
                    <Counter
                      id="height"
                      value={field.value}
                      onChange={(value) => field.onChange(Math.max(0, value))}
                    />
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Field>
                <FieldLabel htmlFor="roofStyle">Roof Style</FieldLabel>
                <Controller
                  control={control}
                  name="roofStyle"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="roofStyle" className="w-full">
                        <SelectValue placeholder="Select Roof Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gable">Gable</SelectItem>
                        <SelectItem value="arch">Arch</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="buildingType">Building Type</FieldLabel>
                <Controller
                  control={control}
                  name="buildingType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="buildingType" className="w-full">
                        <SelectValue placeholder="Select Building Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="garage">Garage</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="doors">Doors</FieldLabel>
                <Controller
                  control={control}
                  name="doors"
                  render={({ field }) => (
                    <Counter
                      id="doors"
                      value={field.value}
                      onChange={(value) => field.onChange(Math.max(0, value))}
                    />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="windows">Windows</FieldLabel>
                <Controller
                  control={control}
                  name="windows"
                  render={({ field }) => (
                    <Counter
                      id="windows"
                      value={field.value}
                      onChange={(value) => field.onChange(Math.max(0, value))}
                    />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="insulation">Insulation</FieldLabel>
                <Controller
                  control={control}
                  name="insulation"
                  render={({ field }) => (
                    <Counter
                      id="insulation"
                      value={field.value}
                      onChange={(value) => field.onChange(Math.max(0, value))}
                    />
                  )}
                />
              </Field>
            </div>
          </div>
        </div>
      </FieldGroup>

      <SuccessDialog
        open={showSuccess}
        onClose={handleSuccessClose}
        title={isEditMode ? "Lead Updated Successfully!" : "Lead Added Successfully!"}
      />
    </form>
  );
}
