import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileDropzoneCard, type FileItem } from "@/components/ui/file-dropzone-card";
import { QuoteBreakdownTab } from "./quote-breakdown-tab";
import { QuoteDetailTab } from "./quote-detail-tab";
import { QuoteSowTab } from "./quote-sow-tab";
import { QuoteMarginTab } from "./quote-margin-tab";
import { QuoteCogsTab } from "./quote-cogs-tab";
import { QuoteConcreteTab } from "./quote-concrete-tab";
import { QuoteInsulationTab } from "./quote-insulation-tab";
import { QuoteContractTab } from "./quote-contract-tab";

const tabs = [
  { id: "breakdown", label: "Breakdown" },
  { id: "quote", label: "Quote" },
  { id: "sow", label: "Statement of Work" },
  { id: "margin", label: "Margin" },
  { id: "cogs", label: "COGS" },
  { id: "concrete", label: "Concrete" },
  { id: "insulation", label: "Insulation" },
  { id: "contract", label: "Contract" },
];

export function QuoteBreakdownPricingSection() {
  const [activeTab, setActiveTab] = useState("breakdown");
  const [file, setFile] = useState<FileItem | null>({
    name: "#6959 Paris, TN expansion (Shipper).xlsx",
    size: "450KB",
  });
  const [isParsing, setIsParsing] = useState(false);

  // Page-specific local state
  const [sqFt, setSqFt] = useState("68750");
  const [buildingSize, setBuildingSize] = useState("125X550X36.42");
  const [additionalNotes, setAdditionalNotes] = useState("");

  return (
    <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-xs rounded-xl space-y-6">
      {/* File Specs Upload Dropzone with Parsing State */}
      <FileDropzoneCard
        dropText="Drop your Xshipper file here"
        subDropText="Or click to browse .xlsx files"
        extraInfoText="All tabs read automatically — Columns & Rafters, Purlins, Sheeting, etc."
        accept=".xlsx, .xls"
        fileIcon="xlsx"
        selectedFile={file}
        onFileSelect={(selected) => {
          setFile(selected);
          if (selected) {
            setIsParsing(true);
            const timer = setTimeout(() => {
              setIsParsing(false);
            }, 1200);
            return () => clearTimeout(timer);
          } else {
            setIsParsing(false);
          }
        }}
      />

      {isParsing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-xs text-blue-700 flex items-center justify-center gap-2 animate-pulse">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Parsing Excel sheets and extracting material breakdown pricing...</span>
        </div>
      )}

      {/* Tabs Navigation using Shadcn UI Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="border-b border-slate-200 overflow-x-auto pb-1">
          <TabsList variant="line" className="h-auto p-0 gap-6 min-w-max">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="m-0 outline-none">
          <QuoteBreakdownTab onViewQuote={() => setActiveTab("quote")} />
        </TabsContent>

        {/* Quote Tab */}
        <TabsContent value="quote" className="m-0 outline-none">
          <QuoteDetailTab
            sqFt={sqFt}
            setSqFt={setSqFt}
            buildingSize={buildingSize}
            setBuildingSize={setBuildingSize}
            additionalNotes={additionalNotes}
            setAdditionalNotes={setAdditionalNotes}
          />
        </TabsContent>

        {/* Statement of Work Tab */}
        <TabsContent value="sow" className="m-0 outline-none">
          <QuoteSowTab
            buildingSize={buildingSize}
            onBackToBreakdown={() => setActiveTab("breakdown")}
            onQuotePreview={() => setActiveTab("quote")}
          />
        </TabsContent>

        {/* Margin Tab */}
        <TabsContent value="margin" className="m-0 outline-none">
          <QuoteMarginTab />
        </TabsContent>

        {/* COGS Tab */}
        <TabsContent value="cogs" className="m-0 outline-none">
          <QuoteCogsTab />
        </TabsContent>

        {/* Concrete Tab */}
        <TabsContent value="concrete" className="m-0 outline-none">
          <QuoteConcreteTab />
        </TabsContent>

        {/* Insulation Tab */}
        <TabsContent value="insulation" className="m-0 outline-none">
          <QuoteInsulationTab />
        </TabsContent>

        {/* Contract Tab */}
        <TabsContent value="contract" className="m-0 outline-none">
          <QuoteContractTab
            onBackToBreakdown={() => setActiveTab("breakdown")}
            onQuotePreview={() => setActiveTab("quote")}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
