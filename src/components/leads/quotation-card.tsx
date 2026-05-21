import React from "react";
import { User, MapPin, Calendar, Briefcase } from "lucide-react";
import type {
  LeadDetailQuotation,
  LeadDetailLead,
  LeadDetailCustomer,
} from "@/modules/leads/leads.api";

interface QuotationCardProps {
  quotation?: LeadDetailQuotation;
  lead?: LeadDetailLead;
  customer?: LeadDetailCustomer;
}

import steelLogo from "@/assets/steel-building-depot-logo.png";
import slide1Img from "@/assets/images/quotation/slide-1.png";
import slide2Img from "@/assets/images/quotation/slide-2.png";

import slide3BgImg from "@/assets/images/quotation/slide-3-bg.png";
import slide3PatternImg from "@/assets/images/quotation/slide-3-pattern.png";

import slide4Img from "@/assets/images/quotation/slide-4.png";
import slide5Img from "@/assets/images/quotation/slide-5.png";
import slide6Img from "@/assets/images/quotation/slide-6.png";

import slide8Img from "@/assets/images/quotation/slide-8.png";

// icons for slide 3
import mapPinIcon from "@/assets/icons/quotation/map-pin.svg";
import notepadIcon from "@/assets/icons/quotation/notepad.svg";
import targetIcon from "@/assets/icons/quotation/target.svg";

// icons for slide 4
// fit-width,length,eave,slope,area
import fitWidthIcon from "@/assets/icons/quotation/fit-width.svg";
import lengthIcon from "@/assets/icons/quotation/length.svg";
import eaveIcon from "@/assets/icons/quotation/eave.svg";
import sloeIcon from "@/assets/icons/quotation/slope.svg";
import areaIcon from "@/assets/icons/quotation/area.svg";

// icons for slide 5
// live-load,snow-load,dead-load,wind-velocity,exposure,seismic-zone,seismic-coefficient
import liveLoadIcon from "@/assets/icons/quotation/live-load.svg";
import snowLoadIcon from "@/assets/icons/quotation/snow-load.svg";
import deadLoadIcon from "@/assets/icons/quotation/dead-load.svg";
import windVelocityIcon from "@/assets/icons/quotation/wind-velocity.svg";
import exposureIcon from "@/assets/icons/quotation/exposure.svg";
import seismicZoneIcon from "@/assets/icons/quotation/seismic-zone.svg";
import seismicCoefficientIcon from "@/assets/icons/quotation/seismic-coefficient.svg";

// Single unified data object representing all content in the project quotation
const defaultQuotationData = {
  // Slide 1 (Project Proposal) & General Info
  proposalInfo: {
    projectTitle: "—",
    preparedFor: "—",
    projectLocation: "—",
    siteLocation: "—",
    date: "—",
    validity: "—",
    preparedBy: {
      name: "STORAGE MATERIALS",
      address: "1995 G Ave, Red Oak, IA 51566",
      phone: "888-868-8680",
      email: "info@steelbuildingdepot.com",
      website: "www.steelbuildingdepot.com",
    },
  },

  // Slide 2 (Table of Contents)
  tocItems: [
    { num: "01", text: "Project Overview" },
    { num: "02", text: "Building Details" },
    { num: "03", text: "Design Loads" },
    { num: "04", text: "Building Specifications" },
    { num: "05", text: "Materials & Finishes" },
    { num: "06", text: "Pricing Summary" },
    { num: "07", text: "Doors & Options" },
    { num: "08", text: "Terms & Conditions" },
    { num: "09", text: "Color Options" },
    { num: "10", text: "Next Steps" },
  ],

  // Slide 3 (Project Overview)
  overview: {
    description: "—",
    projectName: "—",
    projectLocation: "—",
    buildingCode: "—",
  },

  // Slide 4 (Building Details)
  buildingDetails: {
    width: "—",
    length: "—",
    leftEaveHeight: "—",
    rightEaveHeight: "—",
    roofSlope: "—",
    totalArea: "—",
  },

  // Slide 5 (Design Loads)
  designLoads: {
    roofLiveLoad: "—",
    roofSnowLoad: "—",
    deadLoad: "—",
    windVelocity: "—",
    exposure: "—",
    seismicZone: "—",
    seismicCoefficientSc: "—",
    seismicCoefficientST: "—",
    seismicDesignCategory: "—",
  },

  // Slide 6 (Building Specifications)
  specifications: {
    endwallType: "—",
    roofSnowLoad: "—",
    deadLoad: "—",
    windVelocity: "—",
    exposure: "—",
    seismicZone: "—",
  },

  // Slide 7 (Building Specifications - Panels, Insulation, Gutters)
  panels: {
    roofPanelType: "—",
    roofPanelColor: "—",
    wallPanelType: "—",
    wallPanelColor: "—",
    baseAngle: "—",
  },
  insulation: {
    roofInsulation: "—",
    wallInsulation: "—",
  },
  gutters: {
    gutters: "—",
    downspouts: "—",
  },

  // Slide 8 (Materials & Finishes)
  materials: {
    eaveColor: "—",
    rakeColor: "—",
    cornerColor: "—",
    fasciaColor: "—",
    baseTrimColor: "—",
    roofPanelColor: "—",
    wallPanelColor: "—",
  },

  // Slide 9 (Pricing Summary)
  pricing: {
    metrics: {
      totalCogs: "—",
      cogsPsf: "—",
    },
    cogsTable: [] as Array<{ description: string; amount: string }>,
    pricingSummaryTable: [] as Array<{
      description: string;
      rate: string;
      psf: string;
      amount: string;
    }>,
    footerNote: "—",
  },

  // Slide 10 (Doors & Options)
  doorsTable: [] as Array<{ doorType: string; size: string; qty: string; cost: string }>,
  additionalOptions: [] as string[],

  // Slide 11 (Terms & Conditions)
  termsAndConditions: {
    paymentTerms: [] as Array<{ label: string; value: string }>,
    delivery: [
      { label: "Estimated Delivery", value: "—" },
      { label: "Lead Time", value: "—" },
      { label: "Shipment", value: "—" },
    ],
    exclusions: [
      "Foundation & Civil Work",
      "Execution & Installation",
      "Permits & Fees",
      "Sales Tax (If Applicable)",
      "Any Items not specifically mentioned in this proposal",
    ],
    validity: {
      duration: "—",
      suffix: "",
    },
  },

  // Slide 12 (Color Options)
  colorOptions: {
    standardColorsRow1: [
      { name: "Copper Metallic", color: "#855333" },
      { name: "Servival Slate", color: "#2E3033" },
      { name: "Evergreen", color: "#3D523D" },
      { name: "Gallery", color: "#75796E" },
      { name: "Hunter", color: "#1A2F25" },
    ],
    standardColorsRow2: [
      { name: "Ash Grey", color: "#B4B8B9" },
      { name: "State Grey", color: "#595F62" },
      { name: "Ivory", color: "#D4BEA9" },
      { name: "Royal Blue", color: "#254D82" },
      { name: "Black", color: "#1A1A1A" },
      { name: "Charcol", color: "#4A4D4D" },
    ],
  },
};

// Layout mapping configs for rendering slides in structured tables/grids
const buildingDetailConfigs = [
  { key: "width", label: "Width", icon: fitWidthIcon },
  { key: "length", label: "Length", icon: lengthIcon },
  { key: "leftEaveHeight", label: "Left Eave Height", icon: eaveIcon },
  {
    key: "rightEaveHeight",
    label: "Right Eave Height",
    icon: eaveIcon,
    flip: true,
  },
  { key: "roofSlope", label: "Roof Slope", icon: sloeIcon },
  { key: "totalArea", label: "Total Area", icon: areaIcon },
];

const designLoadConfigs = [
  { key: "roofLiveLoad", label: "Roof Live Load", icon: liveLoadIcon },
  { key: "roofSnowLoad", label: "Roof Snow Load", icon: snowLoadIcon },
  { key: "deadLoad", label: "Dead Load", icon: deadLoadIcon },
  { key: "windVelocity", label: "Wind Velocity", icon: windVelocityIcon },
  { key: "exposure", label: "Exposure", icon: exposureIcon },
  { key: "seismicZone", label: "Seismic Zone", icon: seismicZoneIcon },
  {
    key: "seismicCoefficientSc",
    label: "Seismic Coefficient (Sc)",
    icon: seismicCoefficientIcon,
  },
  {
    key: "seismicCoefficientST",
    label: "Seismic Coefficient (ST)",
    icon: seismicCoefficientIcon,
  },
  {
    key: "seismicDesignCategory",
    label: "Seismic Design Category",
    icon: seismicCoefficientIcon,
  },
];

const specConfigs = [
  { key: "endwallType", label: "Endwall Type" },
  { key: "roofSnowLoad", label: "Roof Snow Load" },
  { key: "deadLoad", label: "Dead Load" },
  { key: "windVelocity", label: "Wind Velocity" },
  { key: "exposure", label: "Exposure" },
  { key: "seismicZone", label: "Seismic Zone" },
];

const panelConfigs = [
  { key: "roofPanelType", label: "Roof Panel Type" },
  { key: "roofPanelColor", label: "Roof Panel Color" },
  { key: "wallPanelType", label: "Wall Panel Type" },
  { key: "wallPanelColor", label: "Wall Panel Color" },
  { key: "baseAngle", label: "Base Angle" },
];

const insulationConfigs = [
  { key: "roofInsulation", label: "Roof Insulation" },
  { key: "wallInsulation", label: "Wall Insulation" },
];

const gutterConfigs = [
  { key: "gutters", label: "Gutters" },
  { key: "downspouts", label: "Downspouts" },
];

const materialConfigs = [
  { key: "eaveColor", label: "Eave Color", icon: liveLoadIcon },
  { key: "rakeColor", label: "Rake Color", icon: snowLoadIcon },
  { key: "cornerColor", label: "Corner Color", icon: deadLoadIcon },
  { key: "fasciaColor", label: "Fascia Color", icon: windVelocityIcon },
  { key: "baseTrimColor", label: "Base Trim Color", icon: exposureIcon },
  { key: "roofPanelColor", label: "Roof Panel Color", icon: seismicZoneIcon },
  {
    key: "wallPanelColor",
    label: "Wall Panel Color",
    icon: seismicCoefficientIcon,
  },
];

export default function QuotationCard({ quotation, lead, customer }: QuotationCardProps) {
  // Let's resolve formatted values
  const dateStr = quotation?.createdAt
    ? new Date(quotation.createdAt).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : "—";

  const validityStr = quotation?.validTill
    ? `${Math.max(1, Math.ceil((new Date(quotation.validTill).getTime() - new Date(quotation.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} Days`
    : "—";

  const widthVal = lead?.width ? `${lead.width} ft` : "—";
  const lengthVal = lead?.length ? `${lead.length} ft` : "—";
  const eaveHeightVal = lead?.height ? `${lead.height} ft` : "—";

  // Let's construct quotationData dynamically
  const quotationData = {
    ...defaultQuotationData,
    proposalInfo: {
      ...defaultQuotationData.proposalInfo,
      projectTitle: lead?.projectName || "—",
      preparedFor: customer?.firstName || "—",
      projectLocation: lead?.location || quotation?.location || "—",
      siteLocation: lead?.location || quotation?.location || "—",
      date: dateStr,
      validity: validityStr,
    },
    overview: {
      ...defaultQuotationData.overview,
      projectName: lead?.projectName || "—",
      projectLocation: lead?.location || quotation?.location || "—",
      buildingCode: quotation?.buildingType || "—",
      description: quotation?.specialNote || quotation?.internalNotes || "—",
    },
    buildingDetails: {
      ...defaultQuotationData.buildingDetails,
      width: widthVal,
      length: lengthVal,
      leftEaveHeight: eaveHeightVal,
      rightEaveHeight: eaveHeightVal,
      roofSlope: quotation?.roofStyle || "—",
      totalArea: lead?.sqft ? `${lead.sqft} SQ ft` : "—",
    },
    pricing: {
      ...defaultQuotationData.pricing,
      metrics: {
        totalCogs: quotation?.basePrice
          ? `$ ${quotation.basePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "—",
        cogsPsf: quotation?.basePrice && lead?.sqft
          ? `$ ${(quotation.basePrice / Number(lead.sqft)).toFixed(2)}`
          : "—",
      },
      cogsTable: quotation?.includedMaterials?.length
        ? quotation.includedMaterials.map((mat) => ({
            description: mat.name,
            amount: mat.quantity ? `${mat.quantity} units` : "Included",
          }))
        : [],
      pricingSummaryTable: [
        {
          description: "Total COGS",
          rate: "-",
          psf: quotation?.basePrice && lead?.sqft
            ? `$ ${(quotation.basePrice / Number(lead.sqft)).toFixed(2)}`
            : "—",
          amount: quotation?.basePrice
            ? `$${quotation.basePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "—",
        },
        {
          description: "Markup",
          rate: quotation?.basePrice && quotation?.maxPrice
            ? `${Math.round(((quotation.maxPrice - quotation.basePrice) / quotation.basePrice) * 100)}%`
            : "—",
          psf: quotation?.basePrice && quotation?.maxPrice && lead?.sqft
            ? `$ ${((quotation.maxPrice - quotation.basePrice) / Number(lead.sqft)).toFixed(2)}`
            : "—",
          amount: quotation?.basePrice && quotation?.maxPrice
            ? `$${(quotation.maxPrice - quotation.basePrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "—",
        },
        {
          description: "Final Price (Including Markup)",
          rate: "",
          psf: quotation?.maxPrice && lead?.sqft
            ? `$ ${(quotation.maxPrice / Number(lead.sqft)).toFixed(2)}`
            : "—",
          amount: quotation?.maxPrice
            ? `$${quotation.maxPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "—",
        },
      ],
      footerNote: quotation?.validTill
        ? `All prices are in ${quotation.currency || "USD"} and Valid till ${new Date(quotation.validTill).toLocaleDateString()}.`
        : "—",
    },
    additionalOptions: quotation?.optionalAddOns?.length
      ? quotation.optionalAddOns.map((addon) =>
          addon.price ? `${addon.name} ($${addon.price})` : addon.name
        )
      : [],
    termsAndConditions: {
      ...defaultQuotationData.termsAndConditions,
      paymentTerms: quotation?.paymentTerms
        ? [
            { label: "Payment Terms", value: quotation.paymentTerms },
            { label: "Currency", value: quotation.currency || "USD" },
          ]
        : [],
      validity: {
        duration: validityStr,
        suffix: quotation?.validTill ? "from the date above" : "",
      },
    },
  };

  const cogsTableData = quotationData.pricing.cogsTable.length > 0
    ? quotationData.pricing.cogsTable
    : [{ description: "—", amount: "—" }];

  const doorsTableData = quotationData.doorsTable.length > 0
    ? quotationData.doorsTable
    : [{ doorType: "—", size: "—", qty: "—", cost: "—" }];

  const paymentTermsData = quotationData.termsAndConditions.paymentTerms.length > 0
    ? quotationData.termsAndConditions.paymentTerms
    : [
        { label: "Payment Terms", value: "—" },
        { label: "Currency", value: "—" },
      ];

  const details = [
    {
      key: "preparedFor",
      icon: User,
      label: "Prepared For:",
      value: quotationData.proposalInfo.preparedFor,
    },
    {
      key: "projectLocation",
      icon: MapPin,
      label: "Project Location:",
      value: quotationData.proposalInfo.projectLocation,
    },
    {
      key: "siteLocation",
      icon: MapPin,
      label: "Site Location:",
      value: quotationData.proposalInfo.siteLocation,
    },
    {
      key: "date",
      icon: Calendar,
      label: "Date:",
      value: quotationData.proposalInfo.date,
    },
    {
      key: "validity",
      icon: Briefcase,
      label: "Proposal Validity:",
      value: quotationData.proposalInfo.validity,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center font-lato bg-white">
      {/* Slide 1: Project Proposal */}
      <div className="w-full aspect-4/3 relative">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Logo (logo.57fddbf7 1) */}
        <img
          src={steelLogo}
          alt="Steel Building Depot Logo"
          className="absolute left-[6%] top-[6%] w-[38%] max-w-70 object-contain z-10"
        />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[20%] w-[38%] h-[68%] flex flex-col justify-between z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              PROJECT
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato">
              PROPOSAL
            </div>
          </div>

          {/* Subheadline Group */}
          <div className="flex flex-col gap-1.5 md:gap-2">
            {/* CONTRACTOR BAY FACILITY */}
            <div className="text-sm md:text-base lg:text-lg font-bold text-[#04296B] uppercase leading-tight font-lato">
              {quotationData.proposalInfo.projectTitle}
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Details List (mapped) */}
          <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 max-w-xs">
            {details.map((d) => {
              const Icon = d.icon;
              const labelClass = "text-xs text-slate-500 font-bold uppercase ";
              const valueClass = "uppercase mt-1 font-medium";
              return (
                <div key={d.key} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#04296B] shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm font-extrabold text-black font-lato leading-tight">
                    <div className={labelClass}>{d.label}</div>
                    <div className={valueClass}>{d.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page Number (01) - nested in bottom-left inside margin */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            01
          </span>
        </div>

        {/* RIGHT SLANTED SECTIONS */}

        {/* Vector 5 (Grey divider wedge) */}
        <div
          className="absolute inset-0 bg-[rgba(217,217,217,0.87)] z-10"
          style={{
            clipPath:
              "polygon(58.6% 1.6%, 64.7% 1.6%, 35.4% 98.4%, 29.3% 98.4%)",
          }}
        />

        {/* Vector 4 (Building background image + dark overlay) */}
        <div
          className="absolute inset-0 bg-cover bg-center z-10"
          style={{
            backgroundImage: `url(${slide1Img})`,
            clipPath:
              "polygon(64.7% 1.6%, 98.4% 1.6%, 98.4% 98.4%, 35.4% 98.4%)",
          }}
        >
          {/* 20% Black overlay */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Vector 2 (Lighter/Slate Blue slant accent) */}
        <div
          className="absolute inset-0 bg-[#1A3D75] z-20"
          style={{
            clipPath:
              "polygon(62.8% 71.1%, 67.2% 71.1%, 58.9% 98.4%, 54.5% 98.4%)",
          }}
        />

        {/* Vector 1 (Primary Blue slanted polygon) */}
        <div
          className="absolute inset-0 bg-[#04296B] z-20"
          style={{
            clipPath:
              "polygon(67.2% 71.1%, 98.4% 71.1%, 98.4% 98.4%, 58.9% 98.4%)",
          }}
        />

        {/* Frame 7 (Text inside the primary blue polygon overlay) */}
        <div className="absolute right-[4%] bottom-[4%] w-[26%] flex flex-col gap-2 md:gap-3 text-white font-lato z-30">
          {/* Prepared By */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] md:text-xs opacity-75 font-bold uppercase tracking-wider leading-none">
              Prepared By:
            </span>
            <span className="text-xs md:text-sm lg:text-base font-black tracking-[0.02em] leading-tight">
              {quotationData.proposalInfo.preparedBy.name}
            </span>
          </div>

          {/* Contact details */}
          <div className="text-[10px] md:text-xs lg:text-sm font-semibold leading-normal text-white/85 flex flex-col gap-1">
            <div>{quotationData.proposalInfo.preparedBy.address}</div>
            <div>
              Phone:{" "}
              <a
                href={`tel:${quotationData.proposalInfo.preparedBy.phone}`}
                className="underline hover:text-white transition-colors"
              >
                {quotationData.proposalInfo.preparedBy.phone}
              </a>
            </div>
            <div>
              Email:{" "}
              <a
                href={`mailto:${quotationData.proposalInfo.preparedBy.email}`}
                className="underline hover:text-white transition-colors"
              >
                {quotationData.proposalInfo.preparedBy.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 2: Table of Contents */}
      <div className="w-full aspect-[4/3] relative">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] w-[42%] h-[84%] flex flex-col z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1 md:gap-1.5">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato tracking-wider leading-none">
              TABLE OF
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato tracking-normal">
              CONTENTS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-1 md:mt-2">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Table of Contents List */}
          <div className="flex-1 flex flex-col justify-between mt-6 md:mt-8">
            {quotationData.tocItems.map((item) => (
              <div key={item.num} className="flex items-center gap-3">
                {/* Number Box */}
                <div className="bg-[#04296B] w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                  <span className="text-[10px] md:text-sm font-black text-white font-lato leading-none">
                    {item.num}
                  </span>
                </div>
                {/* Item Text */}
                <span className="text-xs md:text-sm lg:text-base font-bold text-slate-800 font-lato leading-none">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Image (Steel Building Frame) */}
        <img
          src={slide2Img}
          alt="Steel Building Frame"
          className="absolute right-[1.5%] top-[5%] w-[52%] h-[90%] object-contain object-bottom-right z-10"
        />

        {/* Sparkle/Star Icon in Bottom-Right Corner of the Building Concrete Slab */}
        <div className="absolute right-[4%] bottom-[6%] z-20 pointer-events-none">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-slate-300 opacity-90"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
          </svg>
        </div>

        {/* Page Number (02) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            02
          </span>
        </div>
      </div>

      {/* Slide 3: Project Overview */}
      <div className="w-full aspect-[4/3] relative">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] w-[45%] h-[84%] flex flex-col justify-between z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              PROJECT
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              OVERVIEW
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Description Text */}
          <p className="text-xs md:text-sm lg:text-base text-slate-800 font-medium font-lato leading-relaxed mt-4 max-w-lg">
            {quotationData.overview.description}
          </p>

          {/* Details List */}
          <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 mt-6">
            {/* Project Name */}
            <div className="flex items-center gap-4">
              <img
                src={targetIcon}
                alt="Project Name Icon"
                className="w-8 h-8 md:w-10 md:h-10 shrink-0"
              />
              <div className="font-lato">
                <div className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider leading-none">
                  Project Name
                </div>
                <div className="text-xs md:text-sm lg:text-base font-medium text-black uppercase mt-1">
                  {quotationData.overview.projectName}
                </div>
              </div>
            </div>

            {/* Project Location */}
            <div className="flex items-center gap-4">
              <img
                src={mapPinIcon}
                alt="Project Location Icon"
                className="w-8 h-8 md:w-10 md:h-10 shrink-0"
              />
              <div className="font-lato">
                <div className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider leading-none">
                  Project Location
                </div>
                <div className="text-xs md:text-sm lg:text-base font-medium text-black uppercase mt-1 leading-tight whitespace-pre-line">
                  {quotationData.overview.projectLocation}
                </div>
              </div>
            </div>

            {/* Building Code */}
            <div className="flex items-center gap-4">
              <img
                src={notepadIcon}
                alt="Building Code Icon"
                className="w-8 h-8 md:w-10 md:h-10 shrink-0"
              />
              <div className="font-lato">
                <div className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider leading-none">
                  Building Code
                </div>
                <div className="text-xs md:text-sm lg:text-base font-medium text-black uppercase mt-1">
                  {quotationData.overview.buildingCode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Decorative Slanted Shape (Pattern) */}
        <img
          src={slide3PatternImg}
          alt="Slanted background pattern"
          className="absolute right-0 top-0 w-[25%] top-[5%] right-[1.5%] h-auto object-contain z-10"
        />

        {/* Right Side Image (Contractor Bay Facility Building) */}
        <img
          src={slide3BgImg}
          alt="Contractor Bay Facility Building"
          className="absolute right-[1.5%] bottom-[1.5%] w-[49%] h-[60%] object-cover object-bottom z-20"
        />

        {/* Page Number (03) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            03
          </span>
        </div>
      </div>

      {/* Slide 4: Building Details */}
      <div className="w-full aspect-[4/3] relative bg-white">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] w-[42%] h-[84%] flex flex-col z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              BUILDING
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              DETAILS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Building Specs Card */}
          <div className="border border-slate-350 rounded-xl overflow-hidden bg-white w-full mt-6 md:mt-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            {buildingDetailConfigs.map((config, index) => (
              <div
                key={config.key}
                className={`flex items-center justify-between py-2 md:py-3 lg:py-3.5 px-4 ${
                  index < buildingDetailConfigs.length - 1
                    ? "border-b border-slate-200"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={config.icon}
                    alt={`${config.label} Icon`}
                    className={`w-5 h-5 md:w-6 md:h-6 shrink-0 ${config.flip ? "transform scale-x-[-1]" : ""}`}
                  />
                  <span className="text-xs md:text-sm font-bold text-[#0F172A] font-lato">
                    {config.label}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-bold text-[#0F172A] font-lato">
                  {
                    quotationData.buildingDetails[
                      config.key as keyof typeof quotationData.buildingDetails
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Building 3D Diagram */}
        <img
          src={slide4Img}
          alt="Building 3D Model Details"
          className="absolute right-[4%] top-[10%] w-[48%] h-[80%] object-contain z-10"
        />

        {/* Page Number (04) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            04
          </span>
        </div>
      </div>

      {/* Slide 5: Design Loads */}
      <div className="w-full aspect-[4/3] relative bg-white">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] w-[42%] h-[84%] flex flex-col z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              DESIGN
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              LOADS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Design Loads Specs Card */}
          <div className="border border-slate-350 rounded-xl overflow-hidden bg-white w-full mt-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            {designLoadConfigs.map((config, index) => (
              <div
                key={config.key}
                className={`flex items-center justify-between py-1.5 md:py-2 lg:py-2.5 px-4 ${
                  index < designLoadConfigs.length - 1
                    ? "border-b border-slate-200"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={config.icon}
                    alt={`${config.label} Icon`}
                    className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                  />
                  <span className="text-xs md:text-sm font-bold text-[#0F172A] font-lato">
                    {config.label}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-bold text-[#0F172A] font-lato">
                  {
                    quotationData.designLoads[
                      config.key as keyof typeof quotationData.designLoads
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Shield/Security Illustration with Dashed Circle */}
        <div className="absolute right-[4%] top-[10%] w-[50%] h-[80%] flex items-center justify-center z-10">
          <div className="relative w-[70%] aspect-square max-w-[340px] flex items-center justify-center">
            {/* Dashed Circle */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#04296B]/40 pointer-events-none" />

            {/* Shield Image */}
            <img
              src={slide5Img}
              alt="Design Loads Shield Security Diagram"
              className="w-[70%] h-[70%] object-contain z-20"
            />
          </div>
        </div>

        {/* Page Number (05) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            05
          </span>
        </div>
      </div>

      {/* Slide 6: Building Specifications */}
      <div className="w-full aspect-[4/3] relative bg-white">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] w-[42%] h-[84%] flex flex-col z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              BUILDING
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              SPECIFICATIONS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Building Specifications Grid */}
          <div className="grid grid-cols-[1.2fr_1.8fr] gap-y-4 md:gap-y-6 lg:gap-y-8 mt-8 md:mt-12 w-full font-lato text-xs md:text-sm lg:text-base">
            {specConfigs.map((config) => (
              <React.Fragment key={config.key}>
                <div className="font-extrabold text-slate-700">
                  {config.label}
                </div>
                <div className="font-black text-[#04296B] leading-tight whitespace-pre-line pr-4">
                  {
                    quotationData.specifications[
                      config.key as keyof typeof quotationData.specifications
                    ]
                  }
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Side Steel Building Framework Image */}
        <img
          src={slide6Img}
          alt="Steel Building Framework Structure"
          className="absolute right-[1.5%] bottom-[1.5%] w-[52%] h-[82%] object-contain object-right-bottom z-10"
        />

        {/* Page Number (06) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            06
          </span>
        </div>
      </div>

      {/* Slide 7: Building Specifications (Panels, Insulation, Gutters) */}
      <div className="w-full aspect-[4/3] relative bg-white">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] right-[6.5%] bottom-[8%] flex flex-col justify-between z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              BUILDING
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              SPECIFICATIONS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Spec Cards Container (Two columns) */}
          <div className="grid grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start mt-6 md:mt-8 flex-1">
            {/* Left Column: Panels Card */}
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] w-full">
              <div className="bg-[#04296B] px-4 py-2.5 md:py-3.5 text-white font-lato font-bold text-xs md:text-sm tracking-wider uppercase">
                Panels
              </div>
              <div className="flex flex-col">
                {panelConfigs.map((config, idx) => (
                  <div
                    key={config.key}
                    className={`flex items-center justify-between py-2 md:py-3 px-4 text-xs md:text-sm font-lato ${
                      idx < panelConfigs.length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >
                    <span className="font-bold text-slate-700">
                      {config.label}
                    </span>
                    <span className="font-extrabold text-[#04296B]">
                      {
                        quotationData.panels[
                          config.key as keyof typeof quotationData.panels
                        ]
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Insulation & Gutters/Downspout */}
            <div className="flex flex-col gap-6 md:gap-8 w-full">
              {/* Insulation Card */}
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] w-full">
                <div className="bg-[#04296B] px-4 py-2.5 md:py-3.5 text-white font-lato font-bold text-xs md:text-sm tracking-wider uppercase">
                  Insulation
                </div>
                <div className="flex flex-col">
                  {insulationConfigs.map((config, idx) => (
                    <div
                      key={config.key}
                      className={`flex items-center justify-between py-2 md:py-3 px-4 text-xs md:text-sm font-lato ${
                        idx < insulationConfigs.length - 1
                          ? "border-b border-slate-200"
                          : ""
                      }`}
                    >
                      <span className="font-bold text-slate-700">
                        {config.label}
                      </span>
                      <span className="font-extrabold text-[#04296B]">
                        {
                          quotationData.insulation[
                            config.key as keyof typeof quotationData.insulation
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gutters & Downspout Card */}
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] w-full">
                <div className="bg-[#04296B] px-4 py-2.5 md:py-3.5 text-white font-lato font-bold text-xs md:text-sm tracking-wider uppercase">
                  Gutters & Downspout
                </div>
                <div className="flex flex-col">
                  {gutterConfigs.map((config, idx) => (
                    <div
                      key={config.key}
                      className={`flex items-center justify-between py-2 md:py-3 px-4 text-xs md:text-sm font-lato ${
                        idx < gutterConfigs.length - 1
                          ? "border-b border-slate-200"
                          : ""
                      }`}
                    >
                      <span className="font-bold text-slate-700">
                        {config.label}
                      </span>
                      <span className="font-extrabold text-[#04296B]">
                        {
                          quotationData.gutters[
                            config.key as keyof typeof quotationData.gutters
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Number (07) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            07
          </span>
        </div>
      </div>

      {/* Slide 8: Materials & Finishes */}
      <div className="w-full aspect-[4/3] relative bg-white overflow-hidden">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] w-[42%] h-[84%] flex flex-col z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              MATERIALS &
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              FINISHES
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Materials Specs Card */}
          <div className="border border-slate-350 rounded-xl overflow-hidden bg-white w-full mt-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            {materialConfigs.map((config, idx) => (
              <div
                key={config.key}
                className={`flex items-center justify-between py-2 md:py-2.5 lg:py-3 px-4 ${
                  idx < materialConfigs.length - 1
                    ? "border-b border-slate-200"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={config.icon}
                    alt={`${config.label} Icon`}
                    className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                  />
                  <span className="text-xs md:text-sm font-bold text-[#0F172A] font-lato">
                    {config.label}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-bold text-[#0F172A] font-lato">
                  {
                    quotationData.materials[
                      config.key as keyof typeof quotationData.materials
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Corrugated Panel Stack Image */}
        <img
          src={slide8Img}
          alt="Materials and Finishes Corrugated Panel Stack"
          className="absolute right-[1.5%] bottom-[1.5%] w-[54%] h-[82%] object-contain object-right-bottom z-10"
        />

        {/* Page Number (08) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            08
          </span>
        </div>
      </div>

      {/* Slide 9: Pricing Summary */}
      <div className="w-full aspect-[4/3] relative bg-white overflow-hidden">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Main Slide Layout Container */}
        <div className="absolute left-[6.5%] top-[8%] right-[6.5%] bottom-[8%] flex flex-col justify-between z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              PRICING
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              SUMMARY
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Top row: Cost of goods table (left) + Total COGS Badge (right) */}
          <div className="flex gap-6 md:gap-8 items-start mt-4 md:mt-6">
            {/* Left Part: COST OF GOODS table */}
            <div className="flex-1 flex flex-col gap-1.5 md:gap-2">
              <span className="text-[10px] md:text-xs font-bold text-[#04296B] uppercase tracking-wider">
                Cost of Goods
              </span>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1fr] bg-[#DBE2EE]/70 border-b border-slate-300 text-[10px] md:text-xs font-lato font-bold text-slate-800 uppercase px-4 py-2">
                  <div>Description</div>
                  <div>Amount (USD)</div>
                </div>
                {cogsTableData.map((row, idx) => (
                  <div
                    key={row.description}
                    className={`grid grid-cols-[1.5fr_1fr] text-[11px] md:text-xs lg:text-sm font-lato px-4 py-2 ${
                      idx === 2
                        ? "bg-[#DBE2EE]/40 font-extrabold text-[#04296B]"
                        : "border-b border-slate-200 font-bold text-slate-700"
                    }`}
                  >
                    <div>{row.description}</div>
                    <div>{row.amount}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Part: KPI Badge Card */}
            <div className="w-[42%] bg-[#04296B] text-white rounded-2xl p-4 md:p-5 lg:p-6 flex items-center gap-4 md:gap-6 shadow-md shrink-0 self-stretch justify-center">
              {/* Dollar Circle Icon */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                <span className="text-xl md:text-2xl font-black font-lato text-white leading-none">
                  $
                </span>
              </div>
              {/* KPI Metrics */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-white/80 leading-none">
                  Total COGS
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-black mt-1 font-lato leading-tight">
                  {quotationData.pricing.metrics.totalCogs}
                </div>
                {/* Divider Line */}
                <div className="w-full border-t border-white/30 my-2 md:my-2.5" />
                <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-white/80 leading-none">
                  COGS PSF
                </div>
                <div className="text-base md:text-lg lg:text-xl font-bold mt-1 font-lato leading-tight">
                  {quotationData.pricing.metrics.cogsPsf}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Pricing Summary Title + Table */}
          <div className="flex flex-col gap-1.5 md:gap-2 mt-4 md:mt-6">
            <span className="text-[10px] md:text-xs font-bold text-[#04296B] uppercase tracking-wider">
              Pricing Summary
            </span>
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] w-full">
              {/* Table Header */}
              <div className="grid grid-cols-[1.8fr_1fr_1fr_1.4fr] bg-[#DBE2EE]/70 border-b border-slate-300 text-[10px] md:text-xs font-lato font-bold text-slate-800 uppercase px-4 py-2.5 divide-x divide-slate-300/60">
                <div className="pr-2">Description</div>
                <div className="px-2">Rate</div>
                <div className="px-2">Psf</div>
                <div className="pl-2">Amount (USD)</div>
              </div>
              {quotationData.pricing.pricingSummaryTable.map((row, idx) => (
                <div
                  key={row.description}
                  className={`grid grid-cols-[1.8fr_1fr_1fr_1.4fr] text-[11px] md:text-xs lg:text-sm font-lato px-4 py-2.5 divide-x ${
                    idx === 2
                      ? "bg-[#DBE2EE]/40 font-extrabold text-[#04296B] divide-slate-300/40"
                      : "border-b border-slate-200 font-bold text-slate-700 divide-slate-200"
                  }`}
                >
                  <div className="pr-2">{row.description}</div>
                  <div className="px-2">{row.rate}</div>
                  <div className="px-2">{row.psf}</div>
                  <div className="pl-2">{row.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note/caption */}
          <p className="text-[10px] md:text-xs font-semibold text-slate-700 mt-3 font-lato">
            {quotationData.pricing.footerNote}
          </p>
        </div>

        {/* Page Number (09) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            09
          </span>
        </div>
      </div>

      {/* Slide 10: Doors & Additional Options */}
      <div className="w-full aspect-[4/3] relative bg-white overflow-hidden">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Main Slide Layout Container */}
        <div className="absolute left-[6.5%] top-[8%] right-[6.5%] bottom-[8%] flex flex-col justify-between z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              DOORS &
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              ADDITIONAL OPTIONS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Layout content of the slide */}
          <div className="flex gap-6 md:gap-8 items-start mt-6 md:mt-8 flex-1">
            {/* Left Column: DOORS (OPTIONAL) table */}
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-[10px] md:text-xs font-bold text-[#04296B] uppercase tracking-wider font-lato">
                Doors (Optional)
              </span>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr] bg-[#DBE2EE]/70 border-b border-slate-300 text-[10px] md:text-xs font-lato font-bold text-slate-800 uppercase px-4 py-2">
                  <div>Door Type</div>
                  <div>Size</div>
                  <div>Qty</div>
                  <div>Cost</div>
                </div>
                {doorsTableData.map((row, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr] text-[11px] md:text-xs lg:text-sm font-lato font-bold text-slate-700 px-4 py-1.5 md:py-2 ${
                      idx < doorsTableData.length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >
                    <div>{row.doorType}</div>
                    <div>{row.size}</div>
                    <div>{row.qty}</div>
                    <div>{row.cost}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: ADDITIONAL OPTIONS side card */}
            <div className="w-[38%] border border-slate-300 rounded-2xl p-4 md:p-5 lg:p-6 bg-white flex flex-col shrink-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] self-stretch justify-between">
              <div>
                <h3 className="text-xs md:text-sm font-black text-[#04296B] uppercase font-lato tracking-wider leading-none">
                  Additional Options
                </h3>
                <div className="w-full border-t border-slate-200/80 my-3" />
              </div>

              <div className="flex-1 flex flex-col justify-between font-lato py-1">
                {quotationData.additionalOptions.length > 0 ? (
                  quotationData.additionalOptions.map((option) => (
                    <div key={option} className="flex items-center gap-3">
                      {/* Window Quadrants SVG Icon */}
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-slate-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="12" y1="3" x2="12" y2="21" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                      </svg>
                      <span className="text-xs md:text-sm font-bold text-slate-800 leading-none">
                        {option}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs md:text-sm text-slate-400 italic font-bold">
                    No additional options selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Number (10) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            10
          </span>
        </div>
      </div>

      {/* Slide 11: Terms & Conditions */}
      <div className="w-full aspect-[4/3] relative bg-white overflow-hidden">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Main Slide Layout Container */}
        <div className="absolute left-[6.5%] top-[8%] right-[6.5%] bottom-[8%] flex flex-col justify-between z-10">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              TERMS &
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              CONDITIONS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Layout content: 2x2 grid of cards */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8 flex-1">
            {/* Card 1: PAYMENT TERMS */}
            <div className="border border-slate-350 rounded-2xl p-4 md:p-5 lg:p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center gap-3">
                  {/* BadgeDollarSign SVG */}
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-[#04296B] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <path d="M16 8h-4a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H10" />
                  </svg>
                  <h3 className="text-xs md:text-sm font-black text-[#04296B] uppercase font-lato tracking-wider leading-none">
                    Payment Terms
                  </h3>
                </div>
                <div className="w-full border-t border-slate-200/80 my-2.5 md:my-3" />
              </div>

              <div className="flex-1 flex flex-col justify-between font-lato text-xs md:text-sm py-1.5 md:py-2">
                {paymentTermsData.map((term) => (
                  <div
                    key={term.label}
                    className="flex justify-between items-center text-slate-800 font-bold"
                  >
                    <span>{term.label}</span>
                    <span className="font-extrabold text-slate-500">
                      {term.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: DELIVERY */}
            <div className="border border-slate-350 rounded-2xl p-4 md:p-5 lg:p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center gap-3">
                  {/* Truck SVG */}
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-[#04296B] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <h3 className="text-xs md:text-sm font-black text-[#04296B] uppercase font-lato tracking-wider leading-none">
                    Delivery
                  </h3>
                </div>
                <div className="w-full border-t border-slate-200/80 my-2.5 md:my-3" />
              </div>

              <div className="flex-1 flex flex-col justify-between font-lato text-xs md:text-sm py-1.5 md:py-2">
                {quotationData.termsAndConditions.delivery.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center text-slate-800 font-bold"
                  >
                    <span>{item.label}</span>
                    <span className="font-extrabold text-slate-500">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: EXCLUSIONS */}
            <div className="border border-slate-350 rounded-2xl p-4 md:p-5 lg:p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center gap-3">
                  {/* Exclusions Icon (BadgeDollarSign / List Icon) */}
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-[#04296B] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <path d="M16 8h-4a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H10" />
                  </svg>
                  <h3 className="text-xs md:text-sm font-black text-[#04296B] uppercase font-lato tracking-wider leading-none">
                    Exclusions
                  </h3>
                </div>
                <div className="w-full border-t border-slate-200/80 my-2.5 md:my-3" />
              </div>

              <ul className="flex-1 flex flex-col justify-between font-lato text-xs md:text-sm py-1 text-slate-800 font-bold list-disc pl-4 space-y-1.5 leading-tight">
                {quotationData.termsAndConditions.exclusions.map(
                  (exclusion) => (
                    <li key={exclusion}>{exclusion}</li>
                  ),
                )}
              </ul>
            </div>

            {/* Card 4: VALIDITY */}
            <div className="border border-slate-350 rounded-2xl p-4 md:p-5 lg:p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center gap-3">
                  {/* Validity Icon */}
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-[#04296B] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <path d="M16 8h-4a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H10" />
                  </svg>
                  <h3 className="text-xs md:text-sm font-black text-[#04296B] uppercase font-lato tracking-wider leading-none">
                    Validity
                  </h3>
                </div>
                <div className="w-full border-t border-slate-200/80 my-2.5 md:my-3" />
              </div>

              <div className="flex-1 flex flex-col justify-center font-lato text-xs md:text-sm text-slate-800 font-bold py-2 gap-2">
                <p>This proposal is valid for</p>
                <p className="text-[#04296B] font-extrabold text-sm md:text-base">
                  {quotationData.termsAndConditions.validity.duration}{" "}
                  <span className="text-slate-800 font-bold text-xs md:text-sm">
                    {quotationData.termsAndConditions.validity.suffix}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Number (11) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            11
          </span>
        </div>
      </div>

      {/* Slide 12: Color Options */}
      <div className="w-full aspect-[4/3] relative bg-white overflow-hidden">
        {/* Inner Border (Rectangle 1) - inset by 1.5% */}
        <div className="absolute inset-[1.5%] border border-[rgba(105,105,105,0.3)] pointer-events-none z-30" />

        {/* Left Side Content Container */}
        <div className="absolute left-[6.5%] top-[8%] w-[58%] h-[84%] flex flex-col justify-between z-20">
          {/* Title Group */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-lg lg:text-xl font-bold text-slate-800 font-lato leading-none">
              COLOR
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#04296B] uppercase font-lato mt-1">
              OPTIONS
            </div>
            {/* Accent bars */}
            <div className="relative w-24 md:w-32 h-1 bg-[#D9D9D9] rounded-sm mt-3">
              <div className="absolute left-0 top-0 h-full w-[40%] bg-[#04296B] rounded-sm z-10" />
            </div>
          </div>

          {/* Standard Colors Section */}
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            <span className="text-[10px] md:text-xs font-bold text-[#04296B] uppercase tracking-wider font-lato">
              Standard Colors
            </span>

            {/* Swatches Row 1 */}
            <div className="flex gap-4 items-start w-full">
              {quotationData.colorOptions.standardColorsRow1.map((swatch) => (
                <div
                  key={swatch.name}
                  className="flex flex-col items-center w-[16%] shrink-0"
                >
                  <div
                    className="w-full aspect-[1.5/1] rounded border border-slate-300 shadow-sm shrink-0"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <span className="text-[8px] md:text-[10px] font-bold text-slate-800 leading-tight mt-1.5 text-center font-lato">
                    {swatch.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Swatches Row 2 */}
            <div className="flex gap-3 items-start w-full mt-1.5">
              {quotationData.colorOptions.standardColorsRow2.map((swatch) => (
                <div
                  key={swatch.name}
                  className="flex flex-col items-center w-[13.5%] shrink-0"
                >
                  <div
                    className="w-full aspect-[1.5/1] rounded border border-slate-300 shadow-sm shrink-0"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <span className="text-[8px] md:text-[10px] font-bold text-slate-800 leading-tight mt-1.5 text-center font-lato">
                    {swatch.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal Line Divider */}
          <div className="w-full border-t border-slate-200/80 my-3 md:my-4" />

          {/* Bottom Row Content */}
          <div className="flex gap-5 md:gap-6 items-center justify-between">
            {/* Left: Thank You Badge */}
            <div className="w-[50%] border border-slate-300 rounded-2xl py-5 px-4 md:py-6 md:px-5 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex flex-col justify-center items-center shrink-0">
              <div className="text-sm md:text-base lg:text-lg font-black text-[#04296B] font-lato leading-none text-center">
                THANK YOU FOR
              </div>
              <div className="text-sm md:text-base lg:text-lg font-black text-[#04296B] font-lato leading-none text-center mt-1.5">
                THE OPPORTUNITY!
              </div>
            </div>

            {/* Right: Contact Details List */}
            <div className="flex-1 flex flex-col gap-2.5 font-lato text-xs md:text-sm text-slate-800 font-bold justify-center py-1">
              {/* Phone */}
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-[#04296B] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a
                  href={`tel:${quotationData.proposalInfo.preparedBy.phone}`}
                  className="text-slate-800 hover:text-[#04296B] transition-colors leading-none"
                >
                  {quotationData.proposalInfo.preparedBy.phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-[#04296B] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <a
                  href={`mailto:${quotationData.proposalInfo.preparedBy.email}`}
                  className="text-slate-800 hover:text-[#04296B] transition-colors leading-none underline decoration-slate-300 hover:decoration-[#04296B]"
                >
                  {quotationData.proposalInfo.preparedBy.email}
                </a>
              </div>

              {/* Link */}
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-[#04296B] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <a
                  href={`https://${quotationData.proposalInfo.preparedBy.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 hover:text-[#04296B] transition-colors leading-none underline decoration-slate-300 hover:decoration-[#04296B]"
                >
                  {quotationData.proposalInfo.preparedBy.website}
                </a>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-[#04296B] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="leading-tight">
                  {quotationData.proposalInfo.preparedBy.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Slanted Building Facade Image */}
        <div
          className="absolute inset-y-0 right-0 w-[42%] bg-cover bg-center z-10"
          style={{
            backgroundImage: `url(${slide1Img})`,
            clipPath: "polygon(44% 0%, 100% 0%, 100% 100%, 78% 100%)",
          }}
        >
          {/* 10% Black overlay */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Page Number (12) - nested in bottom-left */}
        <div className="absolute left-[1.5%] bottom-[1.5%] px-4 py-2 md:px-5 md:py-3 bg-[#04296B] flex items-center justify-center z-40">
          <span className="text-xs md:text-sm lg:text-base font-bold text-white font-lato leading-none">
            12
          </span>
        </div>
      </div>
    </div>
  );
}
