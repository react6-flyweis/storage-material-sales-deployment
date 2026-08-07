import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface CustomRule {
  id: string;
  matchAgainst: string;
  valueToMatch: string;
  category: string;
  pricing: string;
  rate: string;
  labelInBreakdown: string;
}

export function PricingRulesPage() {
  const navigate = useNavigate();

  const [rules, setRules] = useState<CustomRule[]>([
    {
      id: "1",
      matchAgainst: "Part #",
      valueToMatch: "",
      category: "Trim",
      pricing: "$/lb",
      rate: "0.85",
      labelInBreakdown: "",
    },
    {
      id: "2",
      matchAgainst: "Part #",
      valueToMatch: "",
      category: "Trim",
      pricing: "$/lb",
      rate: "0.85",
      labelInBreakdown: "",
    },
    {
      id: "3",
      matchAgainst: "Part #",
      valueToMatch: "",
      category: "Trim",
      pricing: "$/lb",
      rate: "0.85",
      labelInBreakdown: "",
    },
  ]);

  // Steel ($/lb)
  const [steelPrices, setSteelPrices] = useState({
    primaryFrames: "1.71",
    secondarySteel: "0.88",
    hssBeams: "0.88",
    angles: "1.04",
    openingsJambs: "1.2",
    platesClips: "1.2",
  });

  // Sheeting & Envelope ($/SF)
  const [sheetingPrices, setSheetingPrices] = useState({
    standardScrewDown: "1.71",
    standingSeam: "1.04",
  });

  // Freight & Buckets
  const [freightPrices, setFreightPrices] = useState({
    freightCost: "1.71",
    lbsPerTruck: "40000",
    accessoriesAllowance: "0.1",
    vendorDelta: "0.1",
  });

  // Install - Cost / Sell ($/SF)
  const [installPrices, setInstallPrices] = useState({
    pembEasy: { cost: "5.5", sell: "8.5" },
    pembMedium: { cost: "5.5", sell: "8.5" },
    pembHard: { cost: "5.5", sell: "8.5" },
    pembTallHard: { cost: "5.5", sell: "8.5" },
    storageBasic: { cost: "5.5", sell: "8.5" },
    storageTall: { cost: "5.5", sell: "8.5" },
    storageOverhang: { cost: "5.5", sell: "8.5" },
  });

  const handleSave = () => {
    // Save pricing rules logic
    console.log("Saving pricing rules", {
      steelPrices,
      sheetingPrices,
      freightPrices,
      installPrices,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
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
          type="button"
          onClick={handleSave}
          className="bg-[#1b4ed8] hover:bg-[#1e40af] text-white px-6 font-semibold shadow-xs"
        >
          Save Rules
        </Button>
      </div>

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
                  value={steelPrices.primaryFrames}
                  onChange={(e) =>
                    setSteelPrices({ ...steelPrices, primaryFrames: e.target.value })
                  }
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
                  value={steelPrices.secondarySteel}
                  onChange={(e) =>
                    setSteelPrices({ ...steelPrices, secondarySteel: e.target.value })
                  }
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
                  value={steelPrices.hssBeams}
                  onChange={(e) =>
                    setSteelPrices({ ...steelPrices, hssBeams: e.target.value })
                  }
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
                  value={steelPrices.angles}
                  onChange={(e) =>
                    setSteelPrices({ ...steelPrices, angles: e.target.value })
                  }
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
                  value={steelPrices.openingsJambs}
                  onChange={(e) =>
                    setSteelPrices({ ...steelPrices, openingsJambs: e.target.value })
                  }
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
                  value={steelPrices.platesClips}
                  onChange={(e) =>
                    setSteelPrices({ ...steelPrices, platesClips: e.target.value })
                  }
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
                value={sheetingPrices.standardScrewDown}
                onChange={(e) =>
                  setSheetingPrices({
                    ...sheetingPrices,
                    standardScrewDown: e.target.value,
                  })
                }
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
                value={sheetingPrices.standingSeam}
                onChange={(e) =>
                  setSheetingPrices({
                    ...sheetingPrices,
                    standingSeam: e.target.value,
                  })
                }
                className="w-20 h-9 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Freight & Buckets */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold text-slate-800">Freight & Buckets</CardTitle>
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
                    value={freightPrices.freightCost}
                    onChange={(e) =>
                      setFreightPrices({
                        ...freightPrices,
                        freightCost: e.target.value,
                      })
                    }
                    className="w-20 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Lbs per truck
                  </span>
                  <Input
                    type="text"
                    value={freightPrices.lbsPerTruck}
                    onChange={(e) =>
                      setFreightPrices({
                        ...freightPrices,
                        lbsPerTruck: e.target.value,
                      })
                    }
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
                  value={freightPrices.accessoriesAllowance}
                  onChange={(e) =>
                    setFreightPrices({
                      ...freightPrices,
                      accessoriesAllowance: e.target.value,
                    })
                  }
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
                  value={freightPrices.vendorDelta}
                  onChange={(e) =>
                    setFreightPrices({
                      ...freightPrices,
                      vendorDelta: e.target.value,
                    })
                  }
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
                    value={installPrices.pembEasy.cost}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembEasy: { ...installPrices.pembEasy, cost: e.target.value },
                      })
                    }
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    value={installPrices.pembEasy.sell}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembEasy: { ...installPrices.pembEasy, sell: e.target.value },
                      })
                    }
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
                    value={installPrices.pembMedium.cost}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembMedium: { ...installPrices.pembMedium, cost: e.target.value },
                      })
                    }
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    value={installPrices.pembMedium.sell}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembMedium: { ...installPrices.pembMedium, sell: e.target.value },
                      })
                    }
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
                    value={installPrices.pembHard.cost}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembHard: { ...installPrices.pembHard, cost: e.target.value },
                      })
                    }
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    value={installPrices.pembHard.sell}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembHard: { ...installPrices.pembHard, sell: e.target.value },
                      })
                    }
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
                    value={installPrices.pembTallHard.cost}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembTallHard: { ...installPrices.pembTallHard, cost: e.target.value },
                      })
                    }
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    value={installPrices.pembTallHard.sell}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        pembTallHard: { ...installPrices.pembTallHard, sell: e.target.value },
                      })
                    }
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
                    value={installPrices.storageBasic.cost}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        storageBasic: { ...installPrices.storageBasic, cost: e.target.value },
                      })
                    }
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    value={installPrices.storageBasic.sell}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        storageBasic: { ...installPrices.storageBasic, sell: e.target.value },
                      })
                    }
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
                    value={installPrices.storageTall.cost}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        storageTall: { ...installPrices.storageTall, cost: e.target.value },
                      })
                    }
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    value={installPrices.storageTall.sell}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        storageTall: { ...installPrices.storageTall, sell: e.target.value },
                      })
                    }
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
                    value={installPrices.storageOverhang.cost}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        storageOverhang: { ...installPrices.storageOverhang, cost: e.target.value },
                      })
                    }
                    className="w-16 h-8 text-right text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sell</span>
                  <Input
                    type="text"
                    value={installPrices.storageOverhang.sell}
                    onChange={(e) =>
                      setInstallPrices({
                        ...installPrices,
                        storageOverhang: { ...installPrices.storageOverhang, sell: e.target.value },
                      })
                    }
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
          <CardTitle className="text-lg font-bold text-slate-800">Markup</CardTitle>
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
                defaultValue="1.71"
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
                defaultValue="1.04"
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
                setRules([
                  ...rules,
                  {
                    id: String(Date.now()),
                    matchAgainst: "Part #",
                    valueToMatch: "",
                    category: "Trim",
                    pricing: "$/lb",
                    rate: "0.85",
                    labelInBreakdown: "",
                  },
                ])
              }
              className="border-slate-400 text-slate-800 font-semibold px-4 hover:bg-slate-50 self-start sm:self-auto bg-white cursor-pointer"
            >
              + Add Rule
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Table of Rules */}
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
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <Select
                        value={rule.matchAgainst}
                        onValueChange={(val) =>
                          setRules(
                            rules.map((r) =>
                              r.id === rule.id ? { ...r, matchAgainst: val } : r
                            )
                          )
                        }
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
                    </td>
                    <td className="py-3 px-3">
                      <Input
                        type="text"
                        placeholder="e.g. DK6 or jamb trim"
                        value={rule.valueToMatch}
                        onChange={(e) =>
                          setRules(
                            rules.map((r) =>
                              r.id === rule.id
                                ? { ...r, valueToMatch: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-48 bg-slate-50 border border-slate-200 text-xs placeholder:text-slate-400 h-9 rounded-lg"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <Select
                        value={rule.category}
                        onValueChange={(val) =>
                          setRules(
                            rules.map((r) =>
                              r.id === rule.id ? { ...r, category: val } : r
                            )
                          )
                        }
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
                    </td>
                    <td className="py-3 px-3">
                      <Select
                        value={rule.pricing}
                        onValueChange={(val) =>
                          setRules(
                            rules.map((r) =>
                              r.id === rule.id ? { ...r, pricing: val } : r
                            )
                          )
                        }
                      >
                        <SelectTrigger className="w-28 bg-[#eaeff5] border-none text-xs font-medium h-9 rounded-lg">
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
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-500">$</span>
                        <Input
                          type="text"
                          value={rule.rate}
                          onChange={(e) =>
                            setRules(
                              rules.map((r) =>
                                r.id === rule.id ? { ...r, rate: e.target.value } : r
                              )
                            )
                          }
                          className="w-16 h-9 text-center text-xs font-semibold bg-[#eaeff5] border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Input
                        type="text"
                        placeholder="Label in breakdown"
                        value={rule.labelInBreakdown}
                        onChange={(e) =>
                          setRules(
                            rules.map((r) =>
                              r.id === rule.id
                                ? { ...r, labelInBreakdown: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-44 bg-[#eaeff5] border-none text-xs placeholder:text-slate-400 h-9 rounded-lg"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setRules(rules.filter((r) => r.id !== rule.id))
                        }
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
              type="button"
              className="bg-[#1d5bd8] hover:bg-[#1546af] text-white px-5 font-semibold text-xs h-9 rounded-md shadow-xs cursor-pointer"
            >
              Save Custom Rules
            </Button>
            <Button
              type="button"
              variant="outline"
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
    </div>
  );
}

export default PricingRulesPage;
