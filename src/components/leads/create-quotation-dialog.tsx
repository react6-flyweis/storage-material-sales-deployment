import { useState } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface CreateQuotationDialogProps {
  trigger: React.ReactNode;
  leadData?: {
    name: string;
    id: string;
  };
  mode?: "create" | "edit";
}

export default function CreateQuotationDialog({
  trigger,
  leadData,
  mode = "create",
}: CreateQuotationDialogProps) {
  const [open, setOpen] = useState(false);
  const [sendMethod, setSendMethod] = useState<
    "email" | "whatsapp" | "website"
  >("email");

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
    <Dialog open={open} onOpenChange={setOpen}>
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
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-8">
          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Project Details</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-xs">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectName"
                  defaultValue="ABC Construction"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quoteNumber" className="text-xs">
                  Quote Number (AUTO GENERATED){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quoteNumber"
                  defaultValue="QUO-98765432"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposalDate" className="text-xs">
                  Proposal Date
                </Label>
                <Input
                  id="proposalDate"
                  type="date"
                  defaultValue="2026-04-12"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="validity" className="text-xs">
                  Validity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="validity"
                  defaultValue="2 weeks"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparedBy" className="text-xs">
                  Prepared By (salesperson name + company){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="preparedBy"
                  defaultValue="Suresh Kapoor - Steel Material"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Customer Information, Building Requirements, and Pricing in 3 columns */}
          <div className="grid grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Customer Information</h3>

              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-xs">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  defaultValue="James Lee"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john@doe.com"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">
                  Phone
                </Label>
                <Input
                  id="phone"
                  defaultValue="James Lee"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  defaultValue="Dallas, TX"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-xs">
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Company name (optional)"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Building Requirements */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Building Requirements</h3>

              <div className="space-y-2">
                <Label htmlFor="buildingType" className="text-xs">
                  Building Type <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue="workshop">
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
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-xs">
                    Width (ft) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    defaultValue="30"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length" className="text-xs">
                    Length (ft) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    defaultValue="40"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs">
                    Height (ft) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    defaultValue="12"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roofStyle" className="text-xs">
                  Roof Style <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue="gable">
                  <SelectTrigger id="roofStyle" className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gable">Gable Roof</SelectItem>
                    <SelectItem value="gambrel">Gambrel Roof</SelectItem>
                    <SelectItem value="hip">Hip Roof</SelectItem>
                    <SelectItem value="flat">Flat Roof</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="windLoad" className="text-xs">
                    Wind Load (mph)
                  </Label>
                  <Input
                    id="windLoad"
                    type="number"
                    defaultValue="120"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snowLoad" className="text-xs">
                    Snow Load (psf)
                  </Label>
                  <Input
                    id="snowLoad"
                    type="number"
                    defaultValue="20"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery" className="text-xs">
                  Estimated Delivery
                </Label>
                <Input
                  id="estimatedDelivery"
                  defaultValue="4-6 weeks"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Pricing & Materials */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Pricing & Materials</h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="text-xs">
                    Base Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    defaultValue="24500"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margin" className="text-xs">
                    Margin <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="margin"
                    defaultValue="20%"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs">
                    Currency
                  </Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency" className="w-full h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalPrice" className="text-xs">
                    Total <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="totalPrice"
                    defaultValue="29,400"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil" className="text-xs">
                  Quotation Valid Until
                </Label>
                <Input
                  id="validUntil"
                  type="date"
                  placeholder="dd-mm-yyyy"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-xs">
                  Payment Terms
                </Label>
                <Select defaultValue="50-50">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedSalesperson" className="text-xs">
                  Assigned Salesperson
                </Label>
                <Select defaultValue="ai">
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
              </div>
            </div>
          </div>

          {/* Detailed Building Specs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Detailed Building Specs</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs">
                  Left Eave Height <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="24 ft" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Right Eave Height <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="24 ft" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label className="text-xs">
                  Frame Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Clear Span" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Endwall Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Post & Beam" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Girt Type</Label>
                <Input defaultValue="Bypass" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs">
                  Purlin Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Z Purlin" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label className="text-xs">Roof Color</Label>
                <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-black" />
                  <div className="w-5 h-5 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-slate-600" />
                  <div className="w-5 h-5 rounded-full bg-red-600" />
                  <div className="w-5 h-5 rounded-full bg-orange-500" />
                </div>
              </div>

              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label className="text-xs">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Roof" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Thickness <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="6 inch" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Material</Label>
                <Input
                  defaultValue="VR (Vinyl Reinforced)"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Wall" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Thickness <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4 inch" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label className="text-xs">
                  Shipping Cost <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4,50,000" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Delivery Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Delivered" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Included</Label>
                <Input defaultValue="Yes" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* COGS + Pricing Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">COGS + Pricing Breakdown</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs">
                  Material Cost <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="80,00,000" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Freight Cost <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4,50,000" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Total COGS</Label>
                <Input defaultValue="84,50,000" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs">
                  Markup % <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="18%" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Markup Value <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="15,21,000" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Final Price</Label>
                <Input defaultValue="99,71,000" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* PSF Calculation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">PSF Calculation</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs">
                  Total Area <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="20,000 sq ft" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Final Price <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="99,71,000" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">PSF</Label>
                <Input defaultValue="498.55 / sq ft" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Door & Openings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Door & Openings</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Rolling Door" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Size <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="10' x 12'" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Qty <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="4" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Notes <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Trac-Rite Model" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Personnel Door <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="Rolling Door" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Size <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="3' x 7'" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  Qty <span className="text-red-500">*</span>
                </Label>
                <Input defaultValue="2" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="specialNotes" className="text-sm font-semibold">
              Client Notes (Visible in Proposal)
            </Label>
            <Textarea
              id="specialNotes"
              placeholder="Delivery within 6-8 weeks after order confirmation.&#10;Prices subject to steel market fluctuation."
              className="min-h-24 text-sm resize-none"
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="internalNotes" className="text-sm text-gray-500">
              Internal Notes (Hidden)
            </Label>
            <Textarea
              id="internalNotes"
              placeholder="Client is price sensitive - keep markup under 20%&#10;Possible negotiation expected"
              className="min-h-24 text-sm resize-none"
            />
          </div>

          {/* Lead Source and Priority Level */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="leadSource" className="text-xs">
                Lead source
              </Label>
              <Select defaultValue="high-value">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="priorityLevel" className="text-xs">
                Priority Level
              </Label>
              <Select defaultValue="low">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignLead" className="text-xs">
                Assign Lead
              </Label>
              <Select>
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
            </div>
          </div>

          {/* Quote Versioning */}
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-sm">Quote Versioning</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <ul className="list-disc pl-5 space-y-2">
                <li>Version: Rev 1</li>
                <li>Version: Rev 2</li>
              </ul>
              <ul className="list-disc pl-5 space-y-2">
                <li>Date: 20 Apr 2026</li>
                <li>Date: 24 Apr 2026</li>
              </ul>
              <ul className="list-disc pl-5 space-y-2">
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
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t flex items-center justify-between  bg-white">
          <div className="flex gap-2">
            <Button
              size="lg"
              className="w-40 border-0 bg-slate-100 hover:bg-slate-200 text-black"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              size="lg"
              className="bg-slate-600 hover:bg-slate-700 text-white w-40"
            >
              Save as Draft
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white w-44"
            >
              Preview Quotation
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
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
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
