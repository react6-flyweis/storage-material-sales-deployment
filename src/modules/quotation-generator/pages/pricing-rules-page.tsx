import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { ArrowLeft, Wrench, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePricingRulesQuery,
  useUpdatePricingRulesMutation,
} from "../pricing-rules.hooks";
import type {
  CustomRuleMatchType,
  CustomRuleMethod,
  PricingRulesData,
} from "../pricing-rules.api";
import { getApiErrorMessage } from "@/lib/api-error";

export interface PricingRulesFormValues {
  steelRatesPerLb: {
    primaryFrames: string;
    secondarySteel: string;
    hssBeams: string;
    angles: string;
    openingsJambs: string;
    platesClips: string;
  };
  sheetingRatesPerSf: {
    standardScrewDown: string;
    standingSeam: string;
  };
  freight: {
    ratePerLb: string;
    lbsPerTruck: string;
    accessoriesAllowancePerSf: string;
    vendorDeltaPerLb: string;
  };
  markup: {
    pembMultiplier: string;
    storageMultiplier: string;
  };
  install: {
    pembEasy: { cost: string; sell: string };
    pembMedium: { cost: string; sell: string };
    pembHard: { cost: string; sell: string };
    pembTallHard: { cost: string; sell: string };
    storageBasic: { cost: string; sell: string };
    storageTall: { cost: string; sell: string };
    storageOverhang: { cost: string; sell: string };
  };
  customTabRules: Array<{
    id?: string;
    matchType: CustomRuleMatchType;
    match: string;
    cat: string;
    method: CustomRuleMethod;
    rate: string;
    note: string;
  }>;
}

function extractPricingRules(raw: unknown): PricingRulesData {
  if (!raw || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;
  if (record.pricingRules && typeof record.pricingRules === "object") {
    return record.pricingRules as PricingRulesData;
  }
  if (record.data && typeof record.data === "object") {
    const dataRecord = record.data as Record<string, unknown>;
    if (dataRecord.pricingRules && typeof dataRecord.pricingRules === "object") {
      return dataRecord.pricingRules as PricingRulesData;
    }
    return record.data as PricingRulesData;
  }
  return raw as PricingRulesData;
}

function formatFormValues(rulesData: PricingRulesData): PricingRulesFormValues {
  return {
    steelRatesPerLb: {
      primaryFrames:
        rulesData.steelRatesPerLb?.primaryFrames != null
          ? String(rulesData.steelRatesPerLb.primaryFrames)
          : "",
      secondarySteel:
        rulesData.steelRatesPerLb?.secondarySteel != null
          ? String(rulesData.steelRatesPerLb.secondarySteel)
          : "",
      hssBeams:
        rulesData.steelRatesPerLb?.hssBeams != null
          ? String(rulesData.steelRatesPerLb.hssBeams)
          : "",
      angles:
        rulesData.steelRatesPerLb?.angles != null
          ? String(rulesData.steelRatesPerLb.angles)
          : "",
      openingsJambs:
        rulesData.steelRatesPerLb?.openingsJambs != null
          ? String(rulesData.steelRatesPerLb.openingsJambs)
          : "",
      platesClips:
        rulesData.steelRatesPerLb?.platesClips != null
          ? String(rulesData.steelRatesPerLb.platesClips)
          : "",
    },
    sheetingRatesPerSf: {
      standardScrewDown:
        rulesData.sheetingRatesPerSf?.standardScrewDown != null
          ? String(rulesData.sheetingRatesPerSf.standardScrewDown)
          : "",
      standingSeam:
        rulesData.sheetingRatesPerSf?.standingSeam != null
          ? String(rulesData.sheetingRatesPerSf.standingSeam)
          : "",
    },
    freight: {
      ratePerLb:
        rulesData.freight?.ratePerLb != null
          ? String(rulesData.freight.ratePerLb)
          : "",
      lbsPerTruck:
        rulesData.freight?.lbsPerTruck != null
          ? String(rulesData.freight.lbsPerTruck)
          : "",
      accessoriesAllowancePerSf:
        rulesData.freight?.accessoriesAllowancePerSf != null
          ? String(rulesData.freight.accessoriesAllowancePerSf)
          : "",
      vendorDeltaPerLb:
        rulesData.freight?.vendorDeltaPerLb != null
          ? String(rulesData.freight.vendorDeltaPerLb)
          : "",
    },
    markup: {
      pembMultiplier:
        rulesData.markup?.pembMultiplier != null
          ? String(rulesData.markup.pembMultiplier)
          : "",
      storageMultiplier:
        rulesData.markup?.storageMultiplier != null
          ? String(rulesData.markup.storageMultiplier)
          : "",
    },
    install: {
      pembEasy: {
        cost:
          rulesData.install?.pembEasy?.cost != null
            ? String(rulesData.install.pembEasy.cost)
            : "",
        sell:
          rulesData.install?.pembEasy?.sell != null
            ? String(rulesData.install.pembEasy.sell)
            : "",
      },
      pembMedium: {
        cost:
          rulesData.install?.pembMedium?.cost != null
            ? String(rulesData.install.pembMedium.cost)
            : "",
        sell:
          rulesData.install?.pembMedium?.sell != null
            ? String(rulesData.install.pembMedium.sell)
            : "",
      },
      pembHard: {
        cost:
          rulesData.install?.pembHard?.cost != null
            ? String(rulesData.install.pembHard.cost)
            : "",
        sell:
          rulesData.install?.pembHard?.sell != null
            ? String(rulesData.install.pembHard.sell)
            : "",
      },
      pembTallHard: {
        cost:
          rulesData.install?.pembTallHard?.cost != null
            ? String(rulesData.install.pembTallHard.cost)
            : "",
        sell:
          rulesData.install?.pembTallHard?.sell != null
            ? String(rulesData.install.pembTallHard.sell)
            : "",
      },
      storageBasic: {
        cost:
          rulesData.install?.storageBasic?.cost != null
            ? String(rulesData.install.storageBasic.cost)
            : "",
        sell:
          rulesData.install?.storageBasic?.sell != null
            ? String(rulesData.install.storageBasic.sell)
            : "",
      },
      storageTall: {
        cost:
          rulesData.install?.storageTall?.cost != null
            ? String(rulesData.install.storageTall.cost)
            : "",
        sell:
          rulesData.install?.storageTall?.sell != null
            ? String(rulesData.install.storageTall.sell)
            : "",
      },
      storageOverhang: {
        cost:
          rulesData.install?.storageOverhang?.cost != null
            ? String(rulesData.install.storageOverhang.cost)
            : "",
        sell:
          rulesData.install?.storageOverhang?.sell != null
            ? String(rulesData.install.storageOverhang.sell)
            : "",
      },
    },
    customTabRules: (rulesData.customTabRules || []).map((rule) => ({
      id: rule.id,
      matchType: rule.matchType || "part_number",
      match: rule.match || "",
      cat: rule.cat || "trim",
      method: rule.method || "per_lf",
      rate: rule.rate != null ? String(rule.rate) : "",
      note: rule.note || "",
    })),
  };
}

export function PricingRulesPage() {
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { data: pricingData } = usePricingRulesQuery();
  const updateMutation = useUpdatePricingRulesMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<PricingRulesFormValues>({
    defaultValues: {
      steelRatesPerLb: {
        primaryFrames: "",
        secondarySteel: "",
        hssBeams: "",
        angles: "",
        openingsJambs: "",
        platesClips: "",
      },
      sheetingRatesPerSf: {
        standardScrewDown: "",
        standingSeam: "",
      },
      freight: {
        ratePerLb: "",
        lbsPerTruck: "",
        accessoriesAllowancePerSf: "",
        vendorDeltaPerLb: "",
      },
      markup: {
        pembMultiplier: "",
        storageMultiplier: "",
      },
      install: {
        pembEasy: { cost: "", sell: "" },
        pembMedium: { cost: "", sell: "" },
        pembHard: { cost: "", sell: "" },
        pembTallHard: { cost: "", sell: "" },
        storageBasic: { cost: "", sell: "" },
        storageTall: { cost: "", sell: "" },
        storageOverhang: { cost: "", sell: "" },
      },
      customTabRules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customTabRules",
  });

  // Populate form state dynamically whenever API data changes
  useEffect(() => {
    if (!pricingData) return;
    const rulesData = extractPricingRules(pricingData);
    reset(formatFormValues(rulesData));
  }, [pricingData, reset]);

  const handleReset = () => {
    if (pricingData) {
      const rulesData = extractPricingRules(pricingData);
      reset(formatFormValues(rulesData));
    } else {
      reset(formatFormValues({}));
    }
  };

  const isSubmittingState = isSubmitting || updateMutation.isPending;

  const onSubmit = async (formData: PricingRulesFormValues) => {
    clearErrors("root");
    try {
      const payload: PricingRulesData = {
        steelRatesPerLb: {
          primaryFrames: parseFloat(formData.steelRatesPerLb.primaryFrames) || 0,
          secondarySteel: parseFloat(formData.steelRatesPerLb.secondarySteel) || 0,
          hssBeams: parseFloat(formData.steelRatesPerLb.hssBeams) || 0,
          angles: parseFloat(formData.steelRatesPerLb.angles) || 0,
          openingsJambs: parseFloat(formData.steelRatesPerLb.openingsJambs) || 0,
          platesClips: parseFloat(formData.steelRatesPerLb.platesClips) || 0,
        },
        sheetingRatesPerSf: {
          standardScrewDown:
            parseFloat(formData.sheetingRatesPerSf.standardScrewDown) || 0,
          standingSeam:
            parseFloat(formData.sheetingRatesPerSf.standingSeam) || 0,
        },
        freight: {
          ratePerLb: parseFloat(formData.freight.ratePerLb) || 0,
          lbsPerTruck: parseFloat(formData.freight.lbsPerTruck) || 0,
          accessoriesAllowancePerSf:
            parseFloat(formData.freight.accessoriesAllowancePerSf) || 0,
          vendorDeltaPerLb: parseFloat(formData.freight.vendorDeltaPerLb) || 0,
        },
        markup: {
          pembMultiplier: parseFloat(formData.markup.pembMultiplier) || 0,
          storageMultiplier: parseFloat(formData.markup.storageMultiplier) || 0,
        },
        install: {
          pembEasy: {
            cost: parseFloat(formData.install.pembEasy.cost) || 0,
            sell: parseFloat(formData.install.pembEasy.sell) || 0,
          },
          pembMedium: {
            cost: parseFloat(formData.install.pembMedium.cost) || 0,
            sell: parseFloat(formData.install.pembMedium.sell) || 0,
          },
          pembHard: {
            cost: parseFloat(formData.install.pembHard.cost) || 0,
            sell: parseFloat(formData.install.pembHard.sell) || 0,
          },
          pembTallHard: {
            cost: parseFloat(formData.install.pembTallHard.cost) || 0,
            sell: parseFloat(formData.install.pembTallHard.sell) || 0,
          },
          storageBasic: {
            cost: parseFloat(formData.install.storageBasic.cost) || 0,
            sell: parseFloat(formData.install.storageBasic.sell) || 0,
          },
          storageTall: {
            cost: parseFloat(formData.install.storageTall.cost) || 0,
            sell: parseFloat(formData.install.storageTall.sell) || 0,
          },
          storageOverhang: {
            cost: parseFloat(formData.install.storageOverhang.cost) || 0,
            sell: parseFloat(formData.install.storageOverhang.sell) || 0,
          },
        },
        customTabRules: formData.customTabRules.map((r) => ({
          ...(r.id ? { id: r.id } : {}),
          matchType: r.matchType,
          match: r.match,
          cat: r.cat,
          method: r.method,
          rate: parseFloat(r.rate) || 0,
          note: r.note,
        })),
      };

      await updateMutation.mutateAsync(payload);
      setShowSuccessDialog(true);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error,
        "Failed to save pricing rules. Please check your inputs or network connection.");
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-5"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-[#1b72e8] text-[#1b72e8] hover:bg-blue-50 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Pricing Rules
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Your numbers — edit and save
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmittingState}
          className="bg-[#1b4ed8] hover:bg-[#1e40af] text-white px-6 font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
        >
          {isSubmittingState ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Rules"
          )}
        </Button>
      </div>

      {/* Root Form Error Banner */}
      {errors.root?.message && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-xs font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
          <button
            type="button"
            onClick={() => clearErrors("root")}
            className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Section 1: Steel ($/lb) */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold text-slate-800">
            Steel ($/lb)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* PRIMARY FRAMES */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between h-28">
              <div>
                <div className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
                  PRIMARY FRAMES
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  Rigid frames, rafters, columns
                </div>
              </div>
              <div className="flex justify-end">
                <Input
                  type="text"
                  {...register("steelRatesPerLb.primaryFrames")}
                  className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* SECONDARY STEEL */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between h-28">
              <div>
                <div className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
                  SECONDARY STEEL
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  Purlins, girts, eave struts
                </div>
              </div>
              <div className="flex justify-end">
                <Input
                  type="text"
                  {...register("steelRatesPerLb.secondarySteel")}
                  className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* HSS BEAMS */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between h-28">
              <div>
                <div className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
                  HSS BEAMS
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  HSS structural beams
                </div>
              </div>
              <div className="flex justify-end">
                <Input
                  type="text"
                  {...register("steelRatesPerLb.hssBeams")}
                  className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* ANGLES */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between h-28">
              <div>
                <div className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
                  ANGLES
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  Small angles, L sections
                </div>
              </div>
              <div className="flex justify-end">
                <Input
                  type="text"
                  {...register("steelRatesPerLb.angles")}
                  className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* OPENINGS / JAMBS */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between h-28">
              <div>
                <div className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
                  OPENINGS / JAMBS
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  Door jambs, headers
                </div>
              </div>
              <div className="flex justify-end">
                <Input
                  type="text"
                  {...register("steelRatesPerLb.openingsJambs")}
                  className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* PLATES / CLIPS */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between h-28">
              <div>
                <div className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
                  PLATES / CLIPS
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  Connection plates, clips
                </div>
              </div>
              <div className="flex justify-end">
                <Input
                  type="text"
                  {...register("steelRatesPerLb.platesClips")}
                  className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Sheeting & Envelope ($/SF) */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold text-slate-800">
            Sheeting & Envelope ($/SF)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STANDARD SCREW-DOWN */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black text-slate-600 tracking-wider uppercase">
                  STANDARD SCREW-DOWN
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">
                  R-panel, PBR
                </div>
              </div>
              <Input
                type="text"
                {...register("sheetingRatesPerSf.standardScrewDown")}
                className="w-20 h-9 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>

            {/* STANDING SEAM */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black text-slate-600 tracking-wider uppercase">
                  STANDING SEAM
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">
                  SS roof system
                </div>
              </div>
              <Input
                type="text"
                {...register("sheetingRatesPerSf.standingSeam")}
                className="w-20 h-9 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Freight & Buckets */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold text-slate-800">
            Freight & Buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FREIGHT */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-600 tracking-wider uppercase">
                FREIGHT
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    $/lb (incl. fuel)
                  </span>
                  <Input
                    type="text"
                    {...register("freight.ratePerLb")}
                    className="w-20 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Lbs per truck
                  </span>
                  <Input
                    type="text"
                    {...register("freight.lbsPerTruck")}
                    className="w-20 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ACCESSORIES ALLOWANCE */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black text-slate-600 tracking-wider uppercase">
                  ACCESSORIES ALLOWANCE
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">
                  $/SF fallback
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Input
                  type="text"
                  {...register("freight.accessoriesAllowancePerSf")}
                  className="w-20 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* VENDOR DELTA (QUICKEN) */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black text-slate-600 tracking-wider uppercase">
                  VENDOR DELTA (QUICKEN)
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">
                  $/lb savings vs Central
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Input
                  type="text"
                  {...register("freight.vendorDeltaPerLb")}
                  className="w-20 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Install — Cost / Sell ($/SF) */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold text-slate-800">
            Install — Cost / Sell ($/SF)
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* PEMB Easy */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-700 tracking-wide">
                PEMB Easy
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cost</span>
                  <Input
                    type="text"
                    {...register("install.pembEasy.cost")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    {...register("install.pembEasy.sell")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PEMB Medium */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-700 tracking-wide">
                PEMB Medium
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cost</span>
                  <Input
                    type="text"
                    {...register("install.pembMedium.cost")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    {...register("install.pembMedium.sell")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PEMB Hard */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-700 tracking-wide">
                PEMB Hard
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cost</span>
                  <Input
                    type="text"
                    {...register("install.pembHard.cost")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    {...register("install.pembHard.sell")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PEMB Tall/Hard */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-700 tracking-wide">
                PEMB Tall/Hard
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cost</span>
                  <Input
                    type="text"
                    {...register("install.pembTallHard.cost")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    {...register("install.pembTallHard.sell")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Storage Basic */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-700 tracking-wide">
                Storage Basic
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cost</span>
                  <Input
                    type="text"
                    {...register("install.storageBasic.cost")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    {...register("install.storageBasic.sell")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Storage Tall */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-700 tracking-wide">
                Storage Tall
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cost</span>
                  <Input
                    type="text"
                    {...register("install.storageTall.cost")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    {...register("install.storageTall.sell")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Storage Overhang */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black text-slate-700 tracking-wide">
                Storage Overhang
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Cost</span>
                  <Input
                    type="text"
                    {...register("install.storageOverhang.cost")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    {...register("install.storageOverhang.sell")}
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Markup */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold text-slate-800">
            Markup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PEMB material markup */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black text-slate-700 tracking-wide">
                  PEMB material markup
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">
                  Multiplier (1.30 = 30%)
                </div>
              </div>
              <Input
                type="text"
                {...register("markup.pembMultiplier")}
                className="w-20 h-9 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>

            {/* Storage material markup */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black text-slate-700 tracking-wide">
                  Storage material markup
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">
                  Multiplier (1.18 = 18%)
                </div>
              </div>
              <Input
                type="text"
                {...register("markup.storageMultiplier")}
                className="w-20 h-9 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Custom Tab Matcher Rules */}
      <Card>
        <CardHeader className="border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-xl font-bold text-slate-900">
                Custom Tab Matcher Rules
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 font-medium mt-1">
              If a shipper tab name contains this text &rarr; assign to that category at this price. Runs before built-in rules.
            </CardDescription>
          </div>

          <CardAction>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  matchType: "part_number",
                  match: "",
                  cat: "trim",
                  method: "per_lf",
                  rate: "",
                  note: "",
                })
              }
              className="border-slate-400 text-slate-800 font-semibold px-4 hover:bg-slate-50 self-start sm:self-auto bg-white cursor-pointer"
            >
              + Add Rule
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Table of Rules */}
          {fields.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <div className="mx-auto w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Wrench className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No custom tab rules defined</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Click &quot;+ Add Rule&quot; to configure custom matching rules for shipper tabs, part numbers, or descriptions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#e9ecef]/80 text-[11px] font-bold text-slate-700 tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">Match against</th>
                    <th className="py-2.5 px-3">Value to match</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Pricing</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3">Label in breakdown</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((ruleField, index) => (
                    <tr key={ruleField.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <Controller
                          control={control}
                          name={`customTabRules.${index}.matchType`}
                          render={({ field }) => (
                            <Select
                              value={
                                field.value === "part_number"
                                  ? "Part #"
                                  : field.value === "tab_name"
                                    ? "Tab name"
                                    : field.value === "description"
                                      ? "Description"
                                      : field.value
                              }
                              onValueChange={(val) => {
                                const mappedVal =
                                  val === "Part #"
                                    ? "part_number"
                                    : val === "Tab name"
                                      ? "tab_name"
                                      : val === "Description"
                                        ? "description"
                                        : val;
                                field.onChange(mappedVal);
                              }}
                            >
                              <SelectTrigger className="w-32 bg-[#eaeff5] border-none text-xs font-medium h-9 rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Part #">Part #</SelectItem>
                                <SelectItem value="Tab name">Tab name</SelectItem>
                                <SelectItem value="Description">Description</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <Input
                          type="text"
                          placeholder="e.g. DK6 or jamb trim"
                          {...register(`customTabRules.${index}.match`)}
                          className="w-48 bg-slate-50 border border-slate-200 text-xs placeholder:text-slate-400 h-9 rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <Controller
                          control={control}
                          name={`customTabRules.${index}.cat`}
                          render={({ field }) => (
                            <Select
                              value={
                                field.value === "trim"
                                  ? "Trim"
                                  : field.value
                              }
                              onValueChange={(val) => {
                                field.onChange(val.toLowerCase());
                              }}
                            >
                              <SelectTrigger className="w-32 bg-[#eaeff5] border-none text-xs font-medium h-9 rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Trim">Trim</SelectItem>
                                <SelectItem value="primary">primary</SelectItem>
                                <SelectItem value="secondary">secondary</SelectItem>
                                <SelectItem value="sheeting">sheeting</SelectItem>
                                <SelectItem value="misc">misc</SelectItem>
                                <SelectItem value="accessories">accessories</SelectItem>
                                <SelectItem value="fasteners">fasteners</SelectItem>
                                <SelectItem value="angle">angle</SelectItem>
                                <SelectItem value="plate">plate</SelectItem>
                                <SelectItem value="opening">opening</SelectItem>
                                <SelectItem value="hss">hss</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <Controller
                          control={control}
                          name={`customTabRules.${index}.method`}
                          render={({ field }) => (
                            <Select
                              value={
                                field.value === "per_lb"
                                  ? "$/lb"
                                  : field.value === "per_lf"
                                    ? "$/lin ft"
                                    : field.value === "per_sf"
                                      ? "$/SF"
                                      : field.value === "flat_each"
                                        ? "flat $/each"
                                        : field.value === "flat_total"
                                          ? "flat $ total"
                                          : field.value
                              }
                              onValueChange={(val) => {
                                const mappedMethod =
                                  val === "$/lb"
                                    ? "per_lb"
                                    : val === "$/lin ft"
                                      ? "per_lf"
                                      : val === "$/SF"
                                        ? "per_sf"
                                        : val === "flat $/each"
                                          ? "flat_each"
                                          : val === "flat $ total"
                                            ? "flat_total"
                                            : val;
                                field.onChange(mappedMethod);
                              }}
                            >
                              <SelectTrigger className="w-32 bg-[#eaeff5] border-none text-xs font-medium h-9 rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="$/lb">$/lb</SelectItem>
                                <SelectItem value="$/lin ft">$/lin ft</SelectItem>
                                <SelectItem value="$/SF">$/SF</SelectItem>
                                <SelectItem value="flat $/each">flat $/each</SelectItem>
                                <SelectItem value="flat $ total">flat $ total</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-slate-500">$</span>
                          <Input
                            type="text"
                            {...register(`customTabRules.${index}.rate`)}
                            className="w-16 h-9 text-center text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Input
                          type="text"
                          placeholder="Label in breakdown"
                          {...register(`customTabRules.${index}.note`)}
                          className="w-44 bg-[#eaeff5] border-none text-xs placeholder:text-slate-400 h-9 rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          aria-label="Delete rule"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {/* Categories & Pricing methods helper text */}
          <div className="space-y-1 pt-1 text-xs text-slate-700">
            <div>
              <span className="font-bold">Categories:</span>{" "}
              <span className="text-slate-500 font-medium">
                primary · secondary · sheeting · trim · misc · accessories · fasteners · angle · plate · opening · hss
              </span>
            </div>
            <div>
              <span className="font-bold">Pricing methods:</span>{" "}
              <span className="text-slate-500 font-medium">
                per_lb (uses weight &times; rate) · per_sf (uses SF &times; rate) · flat (fixed dollar amount added regardless of quantity)
              </span>
            </div>
          </div>

          {/* Save & Reset Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmittingState}
              className="bg-[#1d5bd8] hover:bg-[#1546af] text-white px-5 font-semibold text-xs h-9 rounded-md shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isSubmittingState ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Custom Rules"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmittingState}
              className="border-slate-400 text-slate-800 font-medium text-xs h-9 px-5 hover:bg-slate-50 bg-white cursor-pointer"
            >
              Reset
            </Button>
          </div>

          {/* Light Blue Help / Legend Box */}
          <div className="bg-[#e6f4fe] border border-[#b8e1fe] rounded-2xl p-4 text-xs space-y-2 text-[#0c4a6e]">
            <div>
              <span className="font-bold">Match types:</span>{" "}
              <span className="text-slate-600">
                Tab name = whole tab (e.g. &quot;Trim&quot;) · Part # = matches col 4 PART field (e.g. &quot;DK6&quot;) · Description = matches col 3 DESCRIPTION (e.g. &quot;jamb trim&quot;)
              </span>
            </div>
            <div>
              <span className="font-bold">Pricing:</span>{" "}
              <span className="text-slate-600">
                $/lin ft = QTY &times; LENGTH from shipper rows · $/lb = weight &times; rate · $/SF = total SF &times; rate · flat $/each = QTY &times; rate · flat $ total = fixed amount
              </span>
            </div>
            <div>
              <span className="font-bold">Examples:</span>{" "}
              <span className="text-slate-600">
                Part # &quot;DK6&quot; &rarr; trim · $/lin ft · $1.25 | Description &quot;jamb trim&quot; &rarr; trim · $/lin ft · $0.90 | Tab name &quot;gutters&quot; &rarr; trim · $/SF · $0.45
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Pricing Rules Saved Successfully!"
      />
    </form>
  );
}

export default PricingRulesPage;
