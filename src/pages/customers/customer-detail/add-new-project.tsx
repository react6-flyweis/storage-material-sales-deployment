import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import SuccessDialog from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Counter from "@/components/counter-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddNewProjectPage() {
  const navigate = useNavigate();
  const params = useParams();
  const customerId = params.id ?? "unknown";
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
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
    width: 0,
    length: 0,
    height: 0,
    roofStyle: "",
    buildingType: "",
    doors: 0,
    windows: 0,
    insulation: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Numeric fields are handled by the reusable `Counter` component below.

  const handleCancel = () => {
    navigate(`/customers/${customerId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate(`/customers/${customerId}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      <div className="space-y-2 flex gap-2">
        <Button onClick={() => navigate(-1)} className="px-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="">
          <h1 className="text-3xl font-semibold text-slate-900">
            Add New Project
          </h1>
          <p className="text-sm text-slate-600">
            Create a new lead record and assign it to your pipeline
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-7"
      >
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Personal Information (Auto-fill)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email Address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Site Location/Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark *</Label>
              <Input
                id="landmark"
                name="landmark"
                placeholder="Near this -----"
                value={formData.landmark}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullAddress">Full Address *</Label>
              <Input
                id="fullAddress"
                name="fullAddress"
                placeholder="Enter Full Address"
                value={formData.fullAddress}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State*</Label>
              <Input
                id="state"
                name="state"
                placeholder="Enter State"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Company Information (Auto-fill)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title *</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="Enter job title"
                value={formData.jobTitle}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Project Specification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Counter
                id="width"
                label="Width (ft/m)"
                value={formData.width}
                onChange={(v) => setFormData((prev) => ({ ...prev, width: v }))}
              />
            </div>
            <div className="space-y-2">
              <Counter
                id="length"
                label="Length (ft/m)"
                value={formData.length}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, length: v }))
                }
              />
            </div>
            <div className="space-y-2">
              <Counter
                id="height"
                label="Height (ft/m)"
                value={formData.height}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, height: v }))
                }
              />
            </div>
          </div>

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
                  <SelectItem value="gable">Gable Roof</SelectItem>
                  <SelectItem value="flat">Flat Roof</SelectItem>
                  <SelectItem value="shed">Shed Roof</SelectItem>
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
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="industrial">Industrial Shed</SelectItem>
                  <SelectItem value="commercial">Commercial Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Counter
                id="doors"
                label="Doors"
                value={formData.doors}
                onChange={(v) => setFormData((prev) => ({ ...prev, doors: v }))}
              />
            </div>
            <div className="space-y-2">
              <Counter
                id="windows"
                label="Windows"
                value={formData.windows}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, windows: v }))
                }
              />
            </div>
            <div className="space-y-2">
              <Counter
                id="insulation"
                label="Insulation"
                value={formData.insulation}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, insulation: v }))
                }
              />
            </div>
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
          >
            Add Project
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
