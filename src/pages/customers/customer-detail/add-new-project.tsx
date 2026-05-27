import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import SuccessDialog from "@/components/success-dialog";
import Counter from "@/components/counter-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateSalesCustomerProjectMutation } from "@/modules/customers/customers.hooks";
import BuildingTypeSelector from "@/components/building-type-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const requiredNumber = (message: string) => z.number().min(0, message);

const priorityValues = ["Low", "Medium", "High"] as const;

const addNewProjectSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required"),
  location: z.string().trim().min(1, "Location is required"),
  buildingType: z.string().trim().min(1, "Building type is required"),
  roofStyle: z.string().trim().min(1, "Roof style is required"),
  estimatedValue: z.string().trim().optional(),
  priority: z.enum(priorityValues),
  width: requiredNumber("Width is required"),
  length: requiredNumber("Length is required"),
  height: requiredNumber("Height is required"),
  doors: requiredNumber("Doors are required"),
  windows: requiredNumber("Windows are required"),
  insulation: requiredNumber("Insulation is required"),
});

type AddNewProjectFormValues = z.infer<typeof addNewProjectSchema>;

const defaultValues: AddNewProjectFormValues = {
  projectName: "",
  location: "",
  buildingType: "",
  roofStyle: "",
  estimatedValue: "",
  priority: "Medium",
  width: 0,
  length: 0,
  height: 0,
  doors: 0,
  windows: 0,
  insulation: 0,
};

export default function AddNewProjectPage() {
  const navigate = useNavigate();
  const params = useParams();
  const customerId = params.id ?? "unknown";
  const [showSuccess, setShowSuccess] = useState(false);
  const createProjectMutation =
    useCreateSalesCustomerProjectMutation(customerId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddNewProjectFormValues>({
    defaultValues,
    resolver: zodResolver(addNewProjectSchema),
  });

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate(`/customers/${customerId}`);
  };

  const onSubmit = async (values: AddNewProjectFormValues) => {
    try {
      await createProjectMutation.mutateAsync({
        projectName: values.projectName,
        buildingType: values.buildingType,
        location: values.location,
        roofStyle: values.roofStyle,
        width: values.width,
        length: values.length,
        estimatedValue: values.estimatedValue
          ? Number.parseInt(values.estimatedValue, 10)
          : undefined,
        priority: values.priority,
      });
      setShowSuccess(true);
      reset(defaultValues);
    } catch (error) {
      const errorMessage =
        getApiErrorMessage(error) ||
        "An error occurred while creating the project.";
      setError("root", { message: errorMessage });
    }
  };

  const isLoading = isSubmitting || createProjectMutation.isPending;

  return (
    <form className="p-6 w-full min-h-0" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft />
            <span>Back</span>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold">Add New Project</h1>
            <p className="text-sm text-gray-600">
              Create a new project record for this customer
            </p>
          </div>
        </div>

        <Button type="submit" className="rounded-sm" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Project"}
        </Button>
      </div>

      {errors.root?.message ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      ) : null}

      <FieldGroup className="rounded-lg bg-white p-5 shadow">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Project Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              className="md:col-span-2"
              data-invalid={Boolean(errors.projectName)}
            >
              <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
              <Input
                id="projectName"
                type="text"
                placeholder="Enter project name"
                aria-invalid={Boolean(errors.projectName)}
                {...register("projectName")}
              />
              {errors.projectName && (
                <FieldError errors={[errors.projectName]} />
              )}
            </Field>

            <Field
              className="md:col-span-2"
              data-invalid={Boolean(errors.location)}
            >
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                type="text"
                placeholder="Enter location"
                aria-invalid={Boolean(errors.location)}
                {...register("location")}
              />
              {errors.location && <FieldError errors={[errors.location]} />}
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
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Project Specification</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field data-invalid={Boolean(errors.width)}>
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
                {errors.width && <FieldError errors={[errors.width]} />}
              </Field>
              <Field data-invalid={Boolean(errors.length)}>
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
                {errors.length && <FieldError errors={[errors.length]} />}
              </Field>
              <Field data-invalid={Boolean(errors.height)}>
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
                {errors.height && <FieldError errors={[errors.height]} />}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Field data-invalid={Boolean(errors.buildingType)}>
                <FieldLabel htmlFor="buildingType">Building Type</FieldLabel>
                <Controller
                  control={control}
                  name="buildingType"
                  render={({ field }) => (
                    <BuildingTypeSelector
                      id="buildingType"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-2"
                    />
                  )}
                />
                {errors.buildingType && (
                  <FieldError errors={[errors.buildingType]} />
                )}
              </Field>

              <Field data-invalid={Boolean(errors.roofStyle)}>
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
                        <SelectItem value="Gable">Gable Roof</SelectItem>
                        <SelectItem value="Flat">Flat Roof</SelectItem>
                        <SelectItem value="Shed">Shed Roof</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.roofStyle && <FieldError errors={[errors.roofStyle]} />}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field data-invalid={Boolean(errors.doors)}>
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
                {errors.doors && <FieldError errors={[errors.doors]} />}
              </Field>
              <Field data-invalid={Boolean(errors.windows)}>
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
                {errors.windows && <FieldError errors={[errors.windows]} />}
              </Field>
              <Field data-invalid={Boolean(errors.insulation)}>
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
                {errors.insulation && (
                  <FieldError errors={[errors.insulation]} />
                )}
              </Field>
            </div>
          </div>
        </div>
      </FieldGroup>

      <SuccessDialog
        open={showSuccess}
        onClose={handleSuccessClose}
        title="Project Added Successfully!"
      />
    </form>
  );
}
