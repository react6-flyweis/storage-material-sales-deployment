import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TotalProjectInvestmentBanner } from "./total-project-investment-banner";
import {
  useSowDocument,
  type UseSowDocumentParams,
  type UseSowDocumentReturn,
} from "../hooks/use-sow-document";
import { cn } from "@/lib/utils";

export interface SowPreviewDocumentProps extends UseSowDocumentParams {
  className?: string;
  isEditing?: boolean;
  sow?: UseSowDocumentReturn;
}

export const SowPreviewDocument = React.forwardRef<HTMLDivElement, SowPreviewDocumentProps>(
  function SowPreviewDocument(props, ref) {
    const {
      className,
      isEditing = false,
      sow: externalSow,
      ...sowParams
    } = props;

    const internalSow = useSowDocument(sowParams);
    const sow = externalSow || internalSow;

    const { state, pricingData, isSupply, isInstall, handleItemChange, handleAddItem, handleRemoveItem, setFieldValue } = sow;
    const {
      customerLeadName,
      customerAddress,
      projectName,
      quoteDate,
      displayBuildingSize,
      scope,
      concreteInclude,
      insulationInclude,
      grandTotalFormatted,
      pricePerSfFormatted,
    } = pricingData;

    return (
      <div
        ref={ref}
        className={cn(
          "border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-2xs space-y-6 text-slate-800",
          className
        )}
      >
        {/* Document Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
              <span className="bg-[#1E3A8A] text-white px-2 py-0.5 rounded text-lg">STORAGE</span>
              <span className="text-[#2563EB] tracking-wide">MATERIALS</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-medium">
              METAL AND DOORS · 1851 Madison Ave Suite 300, Council Bluffs, IA 51503
            </p>
            <p className="text-[10px] text-slate-600 font-medium">(888) 968-1222</p>
          </div>
          <div className="text-right text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              STATEMENT OF WORK
            </h3>
            <p className="text-slate-600 mt-1 text-[11px]">
              Date: {quoteDate}
            </p>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center py-2 border-b border-slate-200 space-y-1">
          {isEditing ? (
            <div className="space-y-1 text-left">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Document Title
              </label>
              <input
                type="text"
                value={state.documentTitle}
                onChange={(e) => setFieldValue("documentTitle", e.target.value)}
                className="w-full text-center text-base font-extrabold text-slate-900 border border-amber-300 rounded-md px-3 py-1.5 bg-amber-50/30 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          ) : (
            <h2 className="text-base font-extrabold text-slate-900">{state.documentTitle}</h2>
          )}
        </div>

        {/* Project & Customer Info Grid */}
        <div className="bg-slate-50/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-slate-100">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PROJECT NAME
              </span>
              <span className="font-bold text-slate-900 text-sm">{projectName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                LOCATION
              </span>
              <span className="font-bold text-slate-900">{customerAddress}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BUILDING SIZE & SQ FT
              </span>
              <span className="font-bold text-slate-900">{displayBuildingSize}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CUSTOMER
              </span>
              <span className="font-bold text-slate-900 text-sm">{customerLeadName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PREPARED BY & SCOPE
              </span>
              <span className="font-bold text-slate-900">
                Storage Materials ({scope.toUpperCase()})
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DATE
              </span>
              <span className="font-bold text-slate-900">{quoteDate}</span>
            </div>
          </div>
        </div>

        {/* Scope Sections */}
        <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* 1. PROJECT OVERVIEW */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              1. PROJECT OVERVIEW
            </h4>
            {isEditing ? (
              <textarea
                value={state.projectOverviewText}
                onChange={(e) => setFieldValue("projectOverviewText", e.target.value)}
                rows={3}
                className="w-full border border-amber-300 rounded-lg p-2.5 text-xs text-slate-800 bg-amber-50/30 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <p>{state.projectOverviewText}</p>
            )}
            <div className="space-y-1.5 pt-1 font-medium">
              <p className="font-semibold text-slate-900">Building Summary:</p>
              {isEditing ? (
                <div className="space-y-2 pl-1">
                  {state.buildingSummaryItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange("buildingSummaryItems", idx, e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveItem("buildingSummaryItems", idx)}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddItem("buildingSummaryItems", "New Summary Item")}
                    className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-7 px-2.5 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                  >
                    <Plus className="h-3 w-3" /> Add Summary Line
                  </Button>
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                  {state.buildingSummaryItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 2. SCOPE OF WORK & SPECIFICATIONS */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              2. DETAILED SCOPE OF WORK & SPECIFICATIONS
            </h4>

            {isSupply && (
              <>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">2.1 Primary Structural System</p>
                  {isEditing ? (
                    <div className="space-y-1.5 pl-2">
                      {state.primaryStructuralItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange("primaryStructuralItems", idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem("primaryStructuralItems", idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem("primaryStructuralItems", "New Component")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Component
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      {state.primaryStructuralItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900">2.2 Secondary Framing</p>
                  {isEditing ? (
                    <div className="space-y-1.5 pl-2">
                      {state.secondaryFramingItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange("secondaryFramingItems", idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem("secondaryFramingItems", idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem("secondaryFramingItems", "New Secondary Member")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Member
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      {state.secondaryFramingItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900">2.3 Roof System</p>
                  {isEditing ? (
                    <div className="space-y-1.5 pl-2">
                      {state.roofSystemItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange("roofSystemItems", idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem("roofSystemItems", idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem("roofSystemItems", "New Roof Component")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Component
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      {state.roofSystemItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900">2.4 Wall System</p>
                  {isEditing ? (
                    <div className="space-y-1.5 pl-2">
                      {state.wallSystemItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange("wallSystemItems", idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem("wallSystemItems", idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem("wallSystemItems", "New Wall Component")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Component
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      {state.wallSystemItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900">2.5 Trim, Flashing & Accessories</p>
                  {isEditing ? (
                    <div className="space-y-1.5 pl-2">
                      {state.trimAccessoriesItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange("trimAccessoriesItems", idx, e.target.value)}
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveItem("trimAccessoriesItems", idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddItem("trimAccessoriesItems", "New Trim Component")}
                        className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <Plus className="h-3 w-3" /> Add Component
                      </Button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                      {state.trimAccessoriesItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {isInstall && (
              <div className="space-y-1">
                <p className="font-bold text-slate-900">2.6 Labor, Equipment & Erection</p>
                {isEditing ? (
                  <div className="space-y-1.5 pl-2">
                    {state.laborEquipmentItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange("laborEquipmentItems", idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem("laborEquipmentItems", idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem("laborEquipmentItems", "New Erection Scope")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Scope
                    </Button>
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                    {state.laborEquipmentItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="space-y-1">
              <p className="font-bold text-slate-900">2.7 Delivery & Shipping</p>
              {isEditing ? (
                <div className="space-y-1.5 pl-2">
                  {state.deliveryItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange("deliveryItems", idx, e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveItem("deliveryItems", idx)}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddItem("deliveryItems", "New Delivery Item")}
                    className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                  {state.deliveryItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {concreteInclude && (
              <div className="space-y-1">
                <p className="font-bold text-blue-900">2.8 Concrete Scope</p>
                {isEditing ? (
                  <div className="space-y-1.5 pl-2">
                    {state.editableConcreteInclusions.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange("editableConcreteInclusions", idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem("editableConcreteInclusions", idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem("editableConcreteInclusions", "New Concrete Item")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                    <input
                      type="text"
                      placeholder="Concrete Notes"
                      value={state.editableConcreteNotes}
                      onChange={(e) => setFieldValue("editableConcreteNotes", e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-slate-600 pl-2">
                    {state.editableConcreteInclusions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {state.editableConcreteNotes && <li>Note: {state.editableConcreteNotes}</li>}
                  </ul>
                )}
              </div>
            )}

            {insulationInclude && (
              <div className="space-y-1">
                <p className="font-bold text-indigo-900">2.9 Insulation Scope</p>
                {isEditing ? (
                  <div className="space-y-1.5 pl-2">
                    {state.editableInsulationInclusions.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange("editableInsulationInclusions", idx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem("editableInsulationInclusions", idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem("editableInsulationInclusions", "New Insulation Item")}
                      className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                    <input
                      type="text"
                      placeholder="Insulation Note"
                      value={state.editableInsulationNotes}
                      onChange={(e) => setFieldValue("editableInsulationNotes", e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-slate-600 pl-2">
                    {state.editableInsulationInclusions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {state.editableInsulationNotes && <li>Note: {state.editableInsulationNotes}</li>}
                  </ul>
                )}
              </div>
            )}

            {(state.customInclusions.length > 0 || isEditing) && (
              <div>
                <p className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <span>2.10 Custom Inclusions / Requirements</span>
                </p>
                {isEditing ? (
                  <div className="space-y-1.5 pt-1 pl-2">
                    {state.customInclusions.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange("customInclusions", idx, e.target.value)}
                          className="flex-1 border border-blue-300 rounded px-2 py-1 text-xs text-slate-800 bg-blue-50/20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveItem("customInclusions", idx)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddItem("customInclusions", "Custom SOW Requirement")}
                      className="border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus className="h-3 w-3" /> Add Inclusion
                    </Button>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-blue-900 font-medium pl-2">
                    {state.customInclusions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 3. EXCLUSIONS */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              3. EXCLUSIONS (BY OTHERS)
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {state.exclusionsItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange("exclusionsItems", idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem("exclusionsItems", idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem("exclusionsItems", "New Exclusion Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Exclusion Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                {state.exclusionsItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 4. CUSTOMER RESPONSIBILITIES */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              4. CUSTOMER RESPONSIBILITIES
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {state.customerResponsibilitiesItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange("customerResponsibilitiesItems", idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem("customerResponsibilitiesItems", idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem("customerResponsibilitiesItems", "New Customer Obligation")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Obligation
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                {state.customerResponsibilitiesItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 5. DELIVERY & LEAD TIME */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              5. DELIVERY & LEAD TIME
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {state.deliveryLeadTimeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange("deliveryLeadTimeItems", idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem("deliveryLeadTimeItems", idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem("deliveryLeadTimeItems", "New Delivery Schedule")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Schedule Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                {state.deliveryLeadTimeItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 6. TERMS & CONDITIONS */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              6. TERMS & CONDITIONS
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {state.termsConditionsItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange("termsConditionsItems", idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem("termsConditionsItems", idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem("termsConditionsItems", "New Term Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Term Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {state.termsConditionsItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 7. WARRANTY */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              7. WARRANTY
            </h4>
            {isEditing ? (
              <div className="space-y-1.5 pl-1">
                {state.warrantyItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange("warrantyItems", idx, e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem("warrantyItems", idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem("warrantyItems", "New Warranty Item")}
                  className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] h-6 px-2 rounded font-medium flex items-center gap-1 cursor-pointer bg-white"
                >
                  <Plus className="h-3 w-3" /> Add Warranty Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {state.warrantyItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 8. ADDITIONAL NOTES */}
          {(state.customNotes || isEditing) && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-extrabold text-[#1E3A8A] text-xs uppercase tracking-wider">
                8. ADDITIONAL SPECIAL INSTRUCTIONS & NOTES
              </h4>
              {isEditing ? (
                <textarea
                  value={state.customNotes}
                  onChange={(e) => setFieldValue("customNotes", e.target.value)}
                  placeholder="Enter any additional custom notes, special terms, or jobsite instructions..."
                  rows={3}
                  className="w-full border border-blue-300 rounded-lg p-2.5 text-xs text-slate-800 bg-blue-50/20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 italic">
                  {state.customNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Investment Banner */}
        <TotalProjectInvestmentBanner
          totalFormatted={grandTotalFormatted}
          subtitle={`${pricePerSfFormatted} · ${displayBuildingSize} · ${scope}`}
        />

        {/* Signature Lines */}
        <div className="pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs">
          <div>
            <h5 className="font-bold text-slate-900 mb-8">Steel Investments DBA Storage Materials</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-8">Customer</h5>
            <div className="border-b border-slate-400 flex justify-between pb-1 text-[10px] text-slate-400 font-medium">
              <span>Authorized Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
