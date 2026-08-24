import { useState } from "react";
import { Sparkles, Check, RotateCcw, Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExtractShipperResponseData } from "../estimates.api";
import { useSowDocument } from "../hooks/use-sow-document";
import { SowPreviewDocument } from "./sow-preview-document";

interface QuoteSowTabProps {
  buildingSize?: string;
  sqFt?: string | number;
  extractedShipper?: ExtractShipperResponseData;
  onBackToBreakdown?: () => void;
  onQuotePreview?: () => void;
}

export function QuoteSowTab({
  buildingSize = "",
  sqFt = "",
  extractedShipper,
  onBackToBreakdown,
  onQuotePreview,
}: QuoteSowTabProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const sow = useSowDocument({
    extractedShipper,
    sqFt,
    buildingSize,
  });

  const handleApplyAiPrompt = () => {
    if (!aiPrompt.trim()) return;
    const newPrompt = aiPrompt.trim();
    sow.addCustomInclusion(newPrompt);
    setAiFeedback(`✨ Added "${newPrompt}" to Scope of Work inclusions!`);
    setAiPrompt("");
    setTimeout(() => setAiFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#EBF3FE] border border-[#BFDBFE] rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="text-amber-600">✏️</span>
            <span className="text-blue-900 font-extrabold">AI SOW Editor</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 h-7 px-2.5 rounded flex items-center gap-1 cursor-pointer"
          >
            {isEditing ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Done Editing
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 text-blue-600" /> Edit Manually
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-600">
          Describe a change and Claude will update the SOW instantly, or edit texts directly below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyAiPrompt();
              }
            }}
            placeholder="e.g. 'Add structural framing requirement' or 'Add extra steel column spec'"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          <Button
            type="button"
            onClick={handleApplyAiPrompt}
            className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            Apply <Sparkles className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
          </Button>
        </div>
        {aiFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{aiFeedback}</span>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Edit3 className="h-4 w-4 text-amber-700 shrink-0" />
            <span>Manual Edit Mode Active — You can edit all titles, grid info, overview, and list items.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={sow.resetToDefaults}
              className="border-amber-300 text-amber-900 bg-white hover:bg-amber-100/60 text-xs px-3 py-1.5 h-8 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-700" /> Reset to Dynamic Data
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4 py-1.5 h-8 rounded-lg font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </div>
      )}

      <SowPreviewDocument
        isEditing={isEditing}
        sow={sow}
      />
      
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToBreakdown}
          className="border-slate-300 text-slate-800 px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
        >
          ← Back to Breakdown
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
            isEditing
              ? "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              : "border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900"
          }`}
        >
          {isEditing ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-700" /> Done Editing
            </>
          ) : (
            <>✏️ Edit Manually</>
          )}
        </Button>
        <Button
          type="button"
          onClick={onQuotePreview}
          className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          Quote Preview →
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.print()}
          className="border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer bg-white"
        >
          Print SOW
        </Button>
      </div>
    </div>
  );
}
