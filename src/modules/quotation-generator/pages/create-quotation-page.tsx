import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createQuotationSchema = z.object({
  leadId: z.string().min(1, "Lead selection is required"),
  leadName: z.string().min(1, "Lead / Company Name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  street: z.string().optional(),
  cityStateZip: z.string().optional(),
  buildingSize: z.string().optional(),
  squareFootage: z.string().optional(),
  jobNumber: z.string().optional(),
  quoteDate: z.string().optional(),
});

type CreateQuotationFormValues = z.infer<typeof createQuotationSchema>;

interface LeadOption {
  id: string;
  name: string;
  email: string;
  street: string;
  cityStateZip: string;
  buildingSize: string;
  squareFootage: string;
  jobNumber: string;
}

const mockLeads: LeadOption[] = [
  {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    street: "1234 Main Street",
    cityStateZip: "Pune, 412101",
    buildingSize: "200x250x36",
    squareFootage: "50000",
    jobNumber: "8098",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "janesmith@gmail.com",
    street: "5678 Market Street",
    cityStateZip: "Mumbai, 400001",
    buildingSize: "150x200x30",
    squareFootage: "30000",
    jobNumber: "8099",
  },
];

export default function CreateQuotationPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateQuotationFormValues>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      leadId: "1",
      leadName: mockLeads[0].name,
      email: mockLeads[0].email,
      street: mockLeads[0].street,
      cityStateZip: mockLeads[0].cityStateZip,
      buildingSize: mockLeads[0].buildingSize,
      squareFootage: mockLeads[0].squareFootage,
      jobNumber: mockLeads[0].jobNumber,
      quoteDate: "July 31, 2026",
    },
  });

  const handleLeadChange = (leadId: string) => {
    setValue("leadId", leadId);
    const lead = mockLeads.find((l) => l.id === leadId);
    if (lead) {
      setValue("leadName", lead.name);
      setValue("email", lead.email);
      setValue("street", lead.street);
      setValue("cityStateZip", lead.cityStateZip);
      setValue("buildingSize", lead.buildingSize);
      setValue("squareFootage", lead.squareFootage);
      setValue("jobNumber", lead.jobNumber);
    }
  };

  const onSubmit = (data: CreateQuotationFormValues) => {
    console.log("Quotation Form Data:", data);
    navigate("/quotation/upload-drawing");
  };

  return (
    <div className="p-5">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="button"
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-primary text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          Create New Quotation
        </h1>
      </div>

      {/* Main Form Wrapping Whole Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="">
          {/* Card Header: Select Lead Section */}
          <CardHeader className="border-b">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Select Lead
              </label>
              <Controller
                name="leadId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      handleLeadChange(val);
                    }}
                  >
                    <SelectTrigger className="w-full max-w-md bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg">
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLeads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leadId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.leadId.message}
                </p>
              )}
            </div>
          </CardHeader>

          {/* Card Content: Customer & Project Info Form */}
          <CardContent className="p-6">
            {/* Customer & Project Information Header */}
            <div className="flex items-start gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  Customer & Project Information{" "}
                  <span className="text-blue-600 font-normal text-sm">
                    (Auto-Fill after Lead Selection)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in customer details — auto-populates Quote, SOW & Contract
                </p>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Lead / Company Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Lead / Company Name
                </label>
                <Input
                  {...register("leadName")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
                {errors.leadName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.leadName.message}
                  </p>
                )}
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Customer Email
                </label>
                <Input
                  {...register("email")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Street Address
                </label>
                <Input
                  {...register("street")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
              </div>

              {/* City, State ZIP */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  City, State ZIP
                </label>
                <Input
                  {...register("cityStateZip")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
              </div>

              {/* Building Size */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Building Size
                </label>
                <Input
                  {...register("buildingSize")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
              </div>

              {/* Square Footage */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Square Footage
                </label>
                <Input
                  {...register("squareFootage")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
              </div>

              {/* Job Number (optional) */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Job Number (optional)
                </label>
                <Input
                  {...register("jobNumber")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
              </div>

              {/* Quote Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Quote Date
                </label>
                <Input
                  {...register("quoteDate")}
                  className="bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg"
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-center mt-10">
              <Button
                type="submit"
                className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-12 py-2.5 rounded text-sm font-medium cursor-pointer"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
