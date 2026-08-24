import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, User, Loader2 } from "lucide-react";
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
import { useLeadsLookupQuery, useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { getLeadProjectName } from "@/modules/leads/leads.utils";

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

export default function CreateQuotationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialLeadId =
    searchParams.get("lead") ||
    searchParams.get("leadId") ||
    (location.state as { leadId?: string })?.leadId ||
    "";

  // Fetch leads lookup list
  const { data: leadsLookupData, isLoading: isLeadsLoading } = useLeadsLookupQuery(undefined, 1, 100);
  const leads = useMemo(() => leadsLookupData?.data.leads || [], [leadsLookupData]);

  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId);
  const activeLeadId = selectedLeadId || leads[0]?._id || "";

  // Fetch detailed info for selected lead
  const { data: leadDetailData, isLoading: isDetailLoading } = useLeadDetailQuery(
    activeLeadId,
    Boolean(activeLeadId)
  );

  const formattedToday = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateQuotationFormValues>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      leadId: initialLeadId,
      leadName: "",
      email: "",
      street: "",
      cityStateZip: "",
      buildingSize: "",
      squareFootage: "",
      jobNumber: "",
      quoteDate: formattedToday,
    },
  });

  // Update form fields when lead detail or lead lookup item changes
  useEffect(() => {
    if (!activeLeadId) return;

    setValue("leadId", activeLeadId);
    const lookupItem = leads.find((l) => l._id === activeLeadId);

    if (leadDetailData?.data) {
      const { lead, customer } = leadDetailData.data;
      const name =
        getLeadProjectName(
          {
            projectName: lead?.projectName,
            buildingType: lead?.buildingType,
            location: lead?.location,
          },
          customer
            ? { firstName: customer.firstName }
            : null
        ) ||
        customer?.firstName ||
        lookupItem?.projectName ||
        "";

      const email = customer?.email || lookupItem?.customerId?.email || "";
      const street = lead?.location || lookupItem?.location || "";

      let bSize = lead?.buildingType || lookupItem?.buildingType || "";
      if (lead?.width && lead?.length && lead?.height) {
        bSize = `${lead.width}x${lead.length}x${lead.height}`;
      }

      let sqftStr = "";
      if (lead?.sqft) {
        sqftStr = String(lead.sqft);
      } else if (lead?.width && lead?.length) {
        sqftStr = String(lead.width * lead.length);
      }

      const jobId = lead?.jobId || lookupItem?.jobId || "";

      setValue("leadName", name);
      setValue("email", email);
      setValue("street", street);
      setValue("buildingSize", bSize);
      setValue("squareFootage", sqftStr);
      setValue("jobNumber", jobId);
    } else if (lookupItem) {
      const name =
        getLeadProjectName(lookupItem, lookupItem.customerId) ||
        `${lookupItem.customerId?.firstName || ""} ${lookupItem.customerId?.lastName || ""}`.trim() ||
        lookupItem.projectName;

      setValue("leadName", name);
      setValue("email", lookupItem.customerId?.email || "");
      setValue("street", lookupItem.location || "");
      setValue("buildingSize", lookupItem.buildingType || "");
      setValue("jobNumber", lookupItem.jobId || "");
    }
  }, [activeLeadId, leadDetailData, leads, setValue]);

  const handleLeadChange = (leadId: string) => {
    setValue("leadId", leadId);
    setSelectedLeadId(leadId);
  };

  const onSubmit = (data: CreateQuotationFormValues) => {
    console.log("Quotation Form Data:", data);
    navigate("/quotation/upload-drawing", { state: { quotationForm: data } });
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
                    value={field.value || selectedLeadId}
                    onValueChange={(val) => {
                      field.onChange(val);
                      handleLeadChange(val);
                    }}
                    disabled={isLeadsLoading}
                  >
                    <SelectTrigger className="w-full max-w-md bg-[#F8FAFC] border-slate-200 text-slate-900 text-sm h-11 rounded-lg">
                      <SelectValue
                        placeholder={
                          isLeadsLoading ? "Loading leads..." : "Select lead"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => {
                        const label = getLeadProjectName(
                          lead,
                          lead.customerId
                        );
                        return (
                          <SelectItem key={lead._id} value={lead._id}>
                            {label} (
                            {lead.customerId?.firstName
                              ? `${lead.customerId.firstName} ${lead.customerId.lastName ?? ""
                                }`.trim()
                              : "N/A"}
                            )
                          </SelectItem>
                        );
                      })}
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
                  {isDetailLoading ? (
                    <span className="text-blue-600 font-normal text-sm flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching details...
                    </span>
                  ) : (
                    <span className="text-blue-600 font-normal text-sm">
                      (Auto-Fill after Lead Selection)
                    </span>
                  )}
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

