import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
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
import { useCreateSalesCustomerProjectMutation } from "@/modules/customers/customers.hooks";
import BuildingTypeSelector from "@/components/building-type-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AddNewProjectFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  landmark: string;
  fullAddress: string;
  state: string;
  companyName: string;
  jobTitle: string;
  buildingType: string;
  roofStyle: string;
  width: number;
  length: number;
  height: number;
  doors: number;
  windows: number;
  insulation: number;
};

const requiredFieldMessage = "This field is required";

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
    formState: { errors, isSubmitting },
  } = useForm<AddNewProjectFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      landmark: "",
      fullAddress: "",
      state: "",
      companyName: "",
      jobTitle: "",
      buildingType: "",
      roofStyle: "",
      width: 0,
      length: 0,
      height: 0,
      doors: 0,
      windows: 0,
      insulation: 0,
    },
  });

  const handleCancel = () => {
    navigate(`/customers/${customerId}`);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate(`/customers/${customerId}`);
  };

  const onSubmit = async (values: AddNewProjectFormValues) => {
    const projectName =
      values.companyName.trim() ||
      `${values.firstName} ${values.lastName}`.trim() ||
      values.jobTitle.trim() ||
      values.city.trim();

    const location = values.city.trim() || values.fullAddress.trim();

    await createProjectMutation.mutateAsync({
      projectName,
      buildingType: values.buildingType,
      location,
      roofStyle: values.roofStyle,
      width: values.width,
      length: values.length,
    });
    setShowSuccess(true);
    reset();
  };

  const isLoading = isSubmitting || createProjectMutation.isPending;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      <div className="flex gap-2 space-y-2">
        <Button onClick={() => navigate(-1)} className="px-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Add New Project
          </h1>
          <p className="text-sm text-slate-600">
            Create a new lead record and assign it to your pipeline
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-7 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
      >
        {/* <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Personal Information (Auto-fill)
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  placeholder="Enter First Name"
                  {...register("firstName")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  placeholder="Enter Last Name"
                  {...register("lastName")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Email Address"
                  {...register("email")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  placeholder="Enter Phone Number"
                  {...register("phone")}
                />
              </Field>
            </div>
          </section> */}

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Site Location/Address
          </h2>
          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(errors.city)}>
              <FieldLabel htmlFor="city">City *</FieldLabel>
              <Input
                id="city"
                placeholder="Enter City"
                aria-invalid={Boolean(errors.city)}
                {...register("city", {
                  required: requiredFieldMessage,
                })}
              />
              {errors.city && <FieldError errors={[errors.city]} />}
            </Field>
            <Field data-invalid={Boolean(errors.landmark)}>
              <FieldLabel htmlFor="landmark">Landmark *</FieldLabel>
              <Input
                id="landmark"
                placeholder="Near this -----"
                aria-invalid={Boolean(errors.landmark)}
                {...register("landmark", {
                  required: requiredFieldMessage,
                })}
              />
              {errors.landmark && <FieldError errors={[errors.landmark]} />}
            </Field>
            <Field data-invalid={Boolean(errors.fullAddress)}>
              <FieldLabel htmlFor="fullAddress">Full Address *</FieldLabel>
              <Input
                id="fullAddress"
                placeholder="Enter Full Address"
                aria-invalid={Boolean(errors.fullAddress)}
                {...register("fullAddress", {
                  required: requiredFieldMessage,
                })}
              />
              {errors.fullAddress && (
                <FieldError errors={[errors.fullAddress]} />
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="state">State</FieldLabel>
              <Input
                id="state"
                placeholder="Enter State"
                {...register("state")}
              />
            </Field>
          </FieldGroup>
        </section>

        {/* <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Company Information (Auto-fill)
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  {...register("companyName")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="jobTitle">Job title</FieldLabel>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title"
                  {...register("jobTitle")}
                />
              </Field>
            </div>
          </section> */}

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Project Specification
          </h2>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field data-invalid={Boolean(errors.width)}>
              <FieldLabel htmlFor="width">Width (ft/m) *</FieldLabel>
              <Controller
                control={control}
                name="width"
                rules={{ required: requiredFieldMessage, min: 1 }}
                render={({ field }) => (
                  <Counter
                    id="width"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.width && <FieldError errors={[errors.width]} />}
            </Field>

            <Field data-invalid={Boolean(errors.length)}>
              <FieldLabel htmlFor="length">Length (ft/m) *</FieldLabel>
              <Controller
                control={control}
                name="length"
                rules={{ required: requiredFieldMessage, min: 1 }}
                render={({ field }) => (
                  <Counter
                    id="length"
                    // label="Length (ft/m) *"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.length && <FieldError errors={[errors.length]} />}
            </Field>

            <Field>
              <FieldLabel htmlFor="height">Height (ft/m)</FieldLabel>
              <Controller
                control={control}
                name="height"
                render={({ field }) => (
                  <Counter
                    id="height"
                    // label="Height (ft/m)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          </FieldGroup>

          <div className="grid grid-cols-1 gap-4 ">
            <Field data-invalid={Boolean(errors.buildingType)}>
              <FieldLabel htmlFor="buildingType">Building Type *</FieldLabel>
              <Controller
                control={control}
                name="buildingType"
                rules={{ required: requiredFieldMessage }}
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
              <FieldLabel htmlFor="roofStyle">Roof Style *</FieldLabel>
              <Controller
                control={control}
                name="roofStyle"
                rules={{ required: requiredFieldMessage }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="roofStyle"
                      className="w-full"
                      aria-invalid={Boolean(errors.roofStyle)}
                    >
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
            <Field>
              <FieldLabel htmlFor="doors">Doors</FieldLabel>
              <Controller
                control={control}
                name="doors"
                render={({ field }) => (
                  <Counter
                    id="doors"
                    // label="Doors"
                    value={field.value}
                    onChange={field.onChange}
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
                    // label="Windows"
                    value={field.value}
                    onChange={field.onChange}
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
                    // label="Insulation"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="min-w-28"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="min-w-28 bg-[#2864DC] hover:bg-[#1D4FB8]"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Add Project"}
          </Button>
        </div>
      </form>

      <SuccessDialog
        open={showSuccess}
        onClose={handleSuccessClose}
        title="Project Added Successfully!"
      />
    </div>
  );
}
