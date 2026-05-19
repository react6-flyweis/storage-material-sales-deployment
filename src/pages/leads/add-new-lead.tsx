import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import SuccessDialog from "@/components/success-dialog";
import Counter from "@/components/counter-input";
import { Button } from "@/components/ui/button";
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
import { useCreateLeadMutation } from "@/modules/leads/leads.hooks";

export default function AddNewLead() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const createLeadMutation = useCreateLeadMutation();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    jobTitle: "",
    leadSource: "",
    leadStatus: "New",
    estimatedValue: "",
    priority: "Medium",
    notes: "",
    width: 0,
    length: 0,
    height: 0,
    roofStyle: "",
    buildingType: "",
    doors: 0,
    windows: 0,
    insulation: 0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      emailAddress: formData.email,
      phoneNumber: formData.phone,
      companyName: formData.companyName,
      projectType: formData.buildingType || undefined,
      roofStyle: formData.roofStyle || undefined,
      width: formData.width || undefined,
      length: formData.length || undefined,
      height: formData.height || undefined,
      estimatedValue: formData.estimatedValue
        ? parseInt(String(formData.estimatedValue))
        : undefined,
      leadStatus: formData.leadStatus,
      notes: formData.notes,
    };

    setSubmitting(true);
    createLeadMutation.mutate(payload, {
      onSuccess: () => {
        setShowSuccess(true);
        setSubmitting(false);
      },
      onError: (err) => {
        console.error("Create lead failed:", err);
        setSubmitting(false);
      },
    });
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/leads");
  };

  return (
    <div className="p-6 w-full min-h-0">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Add New Lead</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new lead record and assign it to your pipeline
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-5 rounded-lg shadow bg-white"
      >
        {/* Personal Information */}
        <div className="">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Company Information - commented out */}
        {false && (
          <div className="">
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">
                  Job title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Enter job title"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Lead Details */}
        <div className="">
          <h2 className="text-lg font-semibold mb-4">Lead Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadSource">
                Lead Source <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.leadSource}
                onValueChange={(value) =>
                  handleSelectChange("leadSource", value)
                }
                required
              >
                <SelectTrigger id="leadSource" className="w-full">
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="email-campaign">Email Campaign</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="cold-call">Cold Call</SelectItem>
                  <SelectItem value="trade-show">Trade Show</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="google-ads">Google Ads</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadStatus">Lead Status</Label>
              <Select
                value={formData.leadStatus}
                onValueChange={(value) =>
                  handleSelectChange("leadStatus", value)
                }
              >
                <SelectTrigger id="leadStatus" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value</Label>
              <Input
                id="estimatedValue"
                name="estimatedValue"
                type="text"
                placeholder="Enter Estimated Value"
                value={formData.estimatedValue}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="High">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes about this lead"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Project Specification */}
        <div className="">
          <h2 className="text-lg font-semibold mb-4">Project Specification</h2>
          <div className="space-y-4">
            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Counter
                  id="width"
                  label="Width (ft/m)"
                  value={formData.width}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, width: Math.max(0, v) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Counter
                  id="length"
                  label="Length (ft/m)"
                  value={formData.length}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, length: Math.max(0, v) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Counter
                  id="height"
                  label="Height (ft/m)"
                  value={formData.height}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, height: Math.max(0, v) }))
                  }
                />
              </div>
            </div>

            {/* Roof Style and Building Type */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roofStyle">Roof Style</Label>
                <Select
                  value={formData.roofStyle}
                  onValueChange={(value) =>
                    handleSelectChange("roofStyle", value)
                  }
                >
                  <SelectTrigger id="roofStyle" className="w-full">
                    <SelectValue placeholder="Select Roof Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gable">Gable</SelectItem>
                    <SelectItem value="arch">Arch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingType">Building Type</Label>
                <Select
                  value={formData.buildingType}
                  onValueChange={(value) =>
                    handleSelectChange("buildingType", value)
                  }
                >
                  <SelectTrigger id="buildingType" className="w-full">
                    <SelectValue placeholder="Select Building Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="garage">Garage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Counter
                  id="doors"
                  label="Doors"
                  value={formData.doors}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, doors: Math.max(0, v) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Counter
                  id="windows"
                  label="Windows"
                  value={formData.windows}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      windows: Math.max(0, v),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Counter
                  id="insulation"
                  label="Insulation"
                  value={formData.insulation}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      insulation: Math.max(0, v),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Lead"}
          </Button>
        </div>
      </form>
      <SuccessDialog
        open={showSuccess}
        onClose={handleSuccessClose}
        title="Lead Added Successfully!"
      />
    </div>
  );
}
