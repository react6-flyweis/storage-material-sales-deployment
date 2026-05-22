import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import QuotationCard from "@/components/leads/quotation-card";
import type {
  LeadDetailQuotation,
  LeadDetailLead,
  LeadDetailCustomer,
} from "@/modules/leads/leads.api";

interface QuotationData {
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
  buildingType: string;
  width: number;
  length: number;
  height: number;
  roofStyle: string;
  windLoad: number;
  snowLoad: number;
  estimatedDelivery: string;
  basePrice: number;
  margin: string;
  currency: string;
  totalPrice: string;
  validUntil: string;
  paymentTerms: string;
  assignedSalesperson: string;
  specialNotes: string;
  internalNotes: string;
  leadSource: string;
  priorityLevel: string;
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
  roofPanelType?: string;
  wallPanelType?: string;
  roofColor?: string;
  wallColor?: string;
  trimColor?: string;
  baseAngleColor?: string;
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
  insulationTypeRoof?: string;
  insulationThicknessRoof?: string;
  insulationMaterialRoof?: string;
  insulationTypeWall?: string;
  insulationThicknessWall?: string;
  insulationMaterialWall?: string;
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
}

export default function QuotationPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const quotationData = (location.state?.quotationData as QuotationData) || {};
  const leadData = location.state?.leadData || {};

  // Map form/lead data to LeadDetailQuotation structure
  const mappedQuotation: LeadDetailQuotation = {
    _id: "preview-id",
    leadId: leadData._id || "preview-lead-id",
    buildingType: quotationData.buildingType || leadData.buildingType || "—",
    basePrice: Number(quotationData.basePrice) || 0,
    maxPrice: Number(quotationData.totalPrice) || 0,
    sqft: leadData.sqft || (quotationData.width && quotationData.length ? String(Number(quotationData.width) * Number(quotationData.length)) : undefined),
    currency: quotationData.currency || "USD",
    roofStyle: quotationData.roofStyle || "—",
    validTill: quotationData.validUntil || undefined,
    location: quotationData.location || leadData.location || "—",
    paymentTerms: quotationData.paymentTerms || "—",
    specialNote: quotationData.specialNotes || "—",
    internalNotes: quotationData.internalNotes || "—",
    priorityLevel: quotationData.priorityLevel || "—",
    status: "draft",
    createdAt: quotationData.proposalDate ? new Date(quotationData.proposalDate).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLatest: true,
    includedMaterials: quotationData.includedMaterials
      ? quotationData.includedMaterials.map((name: string) => ({ name }))
      : [
          { name: "Primary Frame Structure" },
          { name: "Secondary Framing" },
          { name: "Roof Panels" },
          { name: "Wall Panels" },
          { name: "Trim & Flashing" },
          { name: "Fasteners & Hardware" },
          { name: "Engineering Drawings" },
          { name: "Structural Calculations" },
          { name: "Foundation Anchor Bolts" },
          { name: "Gutter System" },
          { name: "Ridge Ventilation" },
          { name: "Insulation (if selected)" },
        ],
    optionalAddOns: quotationData.optionalAddons
      ? quotationData.optionalAddons.map((name: string) => {
          const prices: Record<string, number> = {
            "Walk-in Doors": 450,
            "Overhead Doors": 1200,
            "Windows": 180,
            "Skylights": 320,
            "Insulation Package": 450,
            "Color Upgrade": 450,
            "Concrete Foundation": 4500,
            "Electrical Package": 450,
            "HVAC Preparation": 450,
            "Loading Dock": 450,
            "Office Space": 450,
            "Mezzanine Level": 8900,
          };
          return {
            name,
            price: prices[name] || 0,
          };
        })
      : [
          { name: "Walk-in Doors", price: 450 },
          { name: "Overhead Doors", price: 1200 },
          { name: "Windows", price: 180 },
          { name: "Skylights", price: 320 },
          { name: "Insulation Package", price: 450 },
          { name: "Color Upgrade", price: 450 },
          { name: "Concrete Foundation", price: 4500 },
          { name: "Electrical Package", price: 450 },
        ],
    width: Number(quotationData.width) || undefined,
    length: Number(quotationData.length) || undefined,
    height: Number(quotationData.height) || undefined,
    leftEaveHeight: Number(quotationData.leftEaveHeight) || undefined,
    rightEaveHeight: Number(quotationData.rightEaveHeight) || undefined,
    roofSlope: quotationData.roofSlope || undefined,
    windLoad: quotationData.windLoad ? `${quotationData.windLoad} mph` : undefined,
    snowLoad: quotationData.snowLoad ? `${quotationData.snowLoad} psf` : undefined,
    estimatedDelivery: quotationData.estimatedDelivery || undefined,
    companyName: quotationData.company || quotationData.customerName || undefined,
    preparedBy: quotationData.preparedBy || undefined,
    proposalDate: quotationData.proposalDate || undefined,
    validity: quotationData.validity || undefined,
    frameType: quotationData.frameType || undefined,
    endwallType: quotationData.endwallType || undefined,
    girtType: quotationData.girtType || undefined,
    purlinType: quotationData.purlinType || undefined,
    bracingType: quotationData.bracingType || undefined,
    roofPanel: quotationData.roofPanelType || undefined,
    wallPanelType: quotationData.wallPanelType || undefined,
    roofColor: quotationData.roofColor || undefined,
    wallColor: quotationData.wallColor || undefined,
    trimColor: quotationData.trimColor || undefined,
    baseAngle: quotationData.baseAngleColor || undefined,
    shippingCost: Number(quotationData.shippingCost) || undefined,
    deliveryType: quotationData.deliveryType || undefined,
    shippingIncluded: quotationData.shippingIncluded === "Yes" || quotationData.shippingIncluded === "true" || false,
    materialCost: Number(quotationData.materialCostDisplay) || undefined,
    freightCost: Number(quotationData.freightCostDisplay) || undefined,
    markupPercent: Number(quotationData.markupPercentDisplay) || undefined,
    insulationTypeRoof: quotationData.insulationTypeRoof || undefined,
    insulationThicknessRoof: quotationData.insulationThicknessRoof || undefined,
    insulationMaterialRoof: quotationData.insulationMaterialRoof || undefined,
    insulationTypeWall: quotationData.insulationTypeWall || undefined,
    insulationThicknessWall: quotationData.insulationThicknessWall || undefined,
    insulationMaterialWall: quotationData.insulationMaterialWall || undefined,
    doorType: quotationData.doorType || undefined,
    doorSize: quotationData.doorSize || undefined,
    doorQty: quotationData.doorQty || undefined,
    doorNotes: quotationData.doorNotes || undefined,
    personnelDoorType: quotationData.personnelDoorType || undefined,
    personnelDoorSize: quotationData.personnelDoorSize || undefined,
    personnelDoorQty: quotationData.personnelDoorQty || undefined,
    personnelDoorNotes: quotationData.personnelDoorNotes || undefined,
    doors: [
      ...(quotationData.doorType
        ? [{
            doorCategory: "Roll Up Door",
            doorType: quotationData.doorType,
            size: quotationData.doorSize || "",
            qty: Number(quotationData.doorQty) || 0,
            notes: quotationData.doorNotes || "",
          }]
        : []),
      ...(quotationData.personnelDoorType
        ? [{
            doorCategory: "Personnel Door",
            doorType: quotationData.personnelDoorType,
            size: quotationData.personnelDoorSize || "",
            qty: Number(quotationData.personnelDoorQty) || 0,
            notes: quotationData.personnelDoorNotes || "",
          }]
        : []),
    ],
    insulation: [
      ...(quotationData.insulationTypeRoof || quotationData.insulationThicknessRoof || quotationData.insulationMaterialRoof
        ? [{
            insulationType: `Roof: ${quotationData.insulationTypeRoof || ""}`,
            thickness: quotationData.insulationThicknessRoof || "",
            material: quotationData.insulationMaterialRoof || "",
          }]
        : []),
      ...(quotationData.insulationTypeWall || quotationData.insulationThicknessWall || quotationData.insulationMaterialWall
        ? [{
            insulationType: `Wall: ${quotationData.insulationTypeWall || ""}`,
            thickness: quotationData.insulationThicknessWall || "",
            material: quotationData.insulationMaterialWall || "",
          }]
        : []),
    ],
  };

  // Map to LeadDetailLead structure
  const mappedLead: LeadDetailLead = {
    _id: leadData._id || "preview-lead-id",
    customerId: leadData.customerId || "preview-customer-id",
    buildingType: quotationData.buildingType || leadData.buildingType || "—",
    location: leadData.location || quotationData.location || "—",
    source: leadData.source || "—",
    quoteValue: Number(quotationData.totalPrice) || leadData.quoteValue || 0,
    lifecycleStatus: leadData.lifecycleStatus || "—",
    projectName: leadData.projectName || quotationData.projectName || "—",
    sqft: leadData.sqft || (quotationData.width && quotationData.length ? Number(quotationData.width) * Number(quotationData.length) : undefined),
    width: Number(quotationData.width) || leadData.width || null,
    length: Number(quotationData.length) || leadData.length || null,
    height: Number(quotationData.height) || leadData.height || null,
    createdAt: leadData.createdAt || new Date().toISOString(),
    updatedAt: leadData.updatedAt || new Date().toISOString(),
  };

  // Map to LeadDetailCustomer structure
  const mappedCustomer: LeadDetailCustomer = {
    _id: leadData.customerId || "preview-customer-id",
    customerId: leadData.customerId || "preview-customer-id",
    firstName: quotationData.customerName || leadData.customer?.firstName || "—",
    email: quotationData.email || leadData.customer?.email || "—",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="default" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">
              Quotation Preview
            </h1>
            {quotationData?.projectName && (
              <p className="text-sm text-gray-600 mt-1">
                Project: {quotationData.projectName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-white mt-4">
        <QuotationCard
          quotation={mappedQuotation}
          lead={mappedLead}
          customer={mappedCustomer}
        />
      </div>
    </div>
  );
}

