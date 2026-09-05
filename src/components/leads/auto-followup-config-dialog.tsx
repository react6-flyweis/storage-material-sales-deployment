import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAutomationConfigQuery,
  useUpdateAutomationConfigMutation,
} from "@/modules/automation/automation.hooks";
import {
  type WarmPreset,
  type ColdPreset,
  type ChatPreset,
  type FollowupAutomationConfigPayload,
  type FollowUpAutomationConfig,
} from "@/modules/automation/automation.api";
import {
  Loader2,
  Save,
  RotateCcw,
  AlertCircle,
  Smartphone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import SuccessDialog from "@/components/success-dialog";

interface AutoFollowUpConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (Eastern Time)" },
  { value: "America/Chicago", label: "America/Chicago (Central Time)" },
  { value: "America/Denver", label: "America/Denver (Mountain Time)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific Time)" },
  { value: "America/Phoenix", label: "America/Phoenix (MST - No DST)" },
  { value: "America/Toronto", label: "America/Toronto (Eastern Time)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
];

const CHAT_PRESETS: Record<
  Exclude<ChatPreset, "custom">,
  { label: string; desc: string; intervals: number[]; maxAttempts: number }
> = {
  default: {
    label: "Default",
    desc: "30m, 3h, 24h",
    intervals: [30, 180, 1440],
    maxAttempts: 3,
  },
  twice_day: {
    label: "Twice a Day",
    desc: "6h, 12h",
    intervals: [360, 720],
    maxAttempts: 2,
  },
  daily: {
    label: "Daily",
    desc: "24h, 48h, 72h",
    intervals: [1440, 2880, 4320],
    maxAttempts: 3,
  },
};

const WARM_PRESETS: Record<
  Exclude<WarmPreset, "custom">,
  { label: string; desc: string; intervals: number[]; maxAttempts: number }
> = {
  twice_week: {
    label: "Twice a Week",
    desc: "+3, +7, +10, +14d",
    intervals: [3, 7, 10, 14],
    maxAttempts: 4,
  },
  weekly: {
    label: "Weekly",
    desc: "7, 14, 21, 28d",
    intervals: [7, 14, 21, 28],
    maxAttempts: 4,
  },
  d7_15_30: {
    label: "Day 7, 15, 30",
    desc: "7, 15, 30d",
    intervals: [7, 15, 30],
    maxAttempts: 3,
  },
};

const COLD_PRESETS: Record<
  Exclude<ColdPreset, "custom">,
  { label: string; desc: string; intervals: number[]; maxAttempts: number }
> = {
  d7_15_30: {
    label: "Day 7, 15, 30",
    desc: "7, 15, 30d",
    intervals: [7, 15, 30],
    maxAttempts: 3,
  },
  every_15: {
    label: "Every 15 Days",
    desc: "15, 30, 45, 60d",
    intervals: [15, 30, 45, 60],
    maxAttempts: 4,
  },
  monthly: {
    label: "Monthly",
    desc: "30, 60, 90d",
    intervals: [30, 60, 90],
    maxAttempts: 3,
  },
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  if (mins % 60 === 0) return `${mins / 60}h`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
}

function parseNumberArray(str: string): number[] {
  return str
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((n) => !isNaN(n) && n > 0);
}

function limitIntervalsInput(val: string, maxAttempts: number): string {
  let sanitized = val.replace(/[^0-9,\s]/g, "");
  if (maxAttempts <= 0) return sanitized;
  const parts = sanitized.split(",");
  if (parts.length > maxAttempts) {
    sanitized = parts.slice(0, maxAttempts).join(",");
  }
  return sanitized;
}

function matchArray(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

function detectChatPreset(intervals: number[]): ChatPreset {
  for (const [key, item] of Object.entries(CHAT_PRESETS)) {
    if (matchArray(intervals, item.intervals)) return key as ChatPreset;
  }
  return "custom";
}

function detectWarmPreset(intervals: number[]): WarmPreset {
  for (const [key, item] of Object.entries(WARM_PRESETS)) {
    if (matchArray(intervals, item.intervals)) return key as WarmPreset;
  }
  return "custom";
}

function detectColdPreset(intervals: number[]): ColdPreset {
  for (const [key, item] of Object.entries(COLD_PRESETS)) {
    if (matchArray(intervals, item.intervals)) return key as ColdPreset;
  }
  return "custom";
}

export default function AutoFollowUpConfigDialog({
  open,
  onOpenChange,
}: AutoFollowUpConfigDialogProps) {
  const {
    data: configResponse,
    isLoading,
    isError,
    refetch,
  } = useAutomationConfigQuery();
  const updateMutation = useUpdateAutomationConfigMutation();

  // Form states
  const [channels, setChannels] = useState({ sms: true, email: true });
  const [timezone, setTimezone] = useState("UTC");

  const [chatDropOff, setChatDropOff] = useState({
    enabled: true,
    inactivityMinutes: 30,
    maxAttempts: 3,
    preset: "default" as ChatPreset,
    attemptIntervalsStr: "30, 180, 1440",
  });

  const [warmLead, setWarmLead] = useState({
    preset: "twice_week" as WarmPreset,
    maxAttempts: 4,
    intervalsDaysStr: "3, 7, 10, 14",
  });

  const [coldLead, setColdLead] = useState({
    enabled: true,
    preset: "d7_15_30" as ColdPreset,
    maxAttempts: 4,
    intervalsDaysStr: "7, 15, 30",
  });

  const [manualReminder, setManualReminder] = useState({
    defaultReminderMinutes: 30,
    sendDueNowReminder: true,
  });

  const [activeTab, setActiveTab] = useState("channels");
  const [showSuccess, setShowSuccess] = useState(false);

  // Synchronize state from API
  const syncFromConfig = (cfg?: FollowUpAutomationConfig | null) => {
    if (!cfg) return;

    if (cfg.channels) {
      setChannels({
        sms: Boolean(cfg.channels.sms),
        email: Boolean(cfg.channels.email),
      });
    }

    if (cfg.timezone) {
      setTimezone(cfg.timezone);
    }

    if (cfg.chatDropOff) {
      const intervals = Array.isArray(cfg.chatDropOff.attemptIntervalsMinutes)
        ? cfg.chatDropOff.attemptIntervalsMinutes
        : [30, 180, 1440];
      setChatDropOff({
        enabled: Boolean(cfg.chatDropOff.enabled),
        inactivityMinutes:
          typeof cfg.chatDropOff.inactivityMinutes === "number"
            ? cfg.chatDropOff.inactivityMinutes
            : 30,
        maxAttempts: Number(cfg.chatDropOff.maxAttempts) || 3,
        preset: detectChatPreset(intervals),
        attemptIntervalsStr: intervals.join(", "),
      });
    }

    if (cfg.leadFrequency?.warm) {
      const intervals = Array.isArray(cfg.leadFrequency.warm.intervalsDays)
        ? cfg.leadFrequency.warm.intervalsDays
        : [3, 7, 10, 14];
      setWarmLead({
        preset:
          (cfg.leadFrequency.warm.preset as WarmPreset) ||
          detectWarmPreset(intervals),
        maxAttempts: Number(cfg.leadFrequency.warm.maxAttempts) || 4,
        intervalsDaysStr: intervals.join(", "),
      });
    } else {
      setWarmLead({
        preset: "twice_week",
        maxAttempts: 4,
        intervalsDaysStr: "3, 7, 10, 14",
      });
    }

    const coldIntervals = Array.isArray(cfg.coldLead?.intervalsDays)
      ? cfg.coldLead.intervalsDays
      : Array.isArray(cfg.leadFrequency?.cold?.intervalsDays)
        ? cfg.leadFrequency.cold.intervalsDays
        : [7, 15, 30];
    const coldPreset =
      (cfg.leadFrequency?.cold?.preset as ColdPreset) ||
      detectColdPreset(coldIntervals);
    setColdLead({
      enabled:
        cfg.coldLead?.enabled !== undefined
          ? Boolean(cfg.coldLead.enabled)
          : true,
      preset: coldPreset,
      maxAttempts:
        Number(cfg.coldLead?.maxAttempts) ||
        Number(cfg.leadFrequency?.cold?.maxAttempts) ||
        4,
      intervalsDaysStr: coldIntervals.join(", "),
    });

    if (cfg.manualReminder) {
      setManualReminder({
        defaultReminderMinutes:
          typeof cfg.manualReminder.defaultReminderMinutes === "number"
            ? cfg.manualReminder.defaultReminderMinutes
            : 30,
        sendDueNowReminder: Boolean(cfg.manualReminder.sendDueNowReminder),
      });
    }
  };

  useEffect(() => {
    if (configResponse?.data?.config && open) {
      queueMicrotask(() => {
        syncFromConfig(configResponse.data.config);
      });
    }
  }, [configResponse, open]);

  const parsedChatIntervals = parseNumberArray(chatDropOff.attemptIntervalsStr);
  const parsedWarmIntervals = parseNumberArray(warmLead.intervalsDaysStr);
  const parsedColdIntervals = parseNumberArray(coldLead.intervalsDaysStr);

  const handleApplyChatPreset = (presetKey: ChatPreset) => {
    if (presetKey === "custom") {
      setChatDropOff((prev) => ({ ...prev, preset: "custom" }));
      return;
    }
    const target = CHAT_PRESETS[presetKey];
    if (target) {
      setChatDropOff((prev) => ({
        ...prev,
        preset: presetKey,
        attemptIntervalsStr: target.intervals.join(", "),
        maxAttempts: target.maxAttempts,
      }));
    }
  };

  const handleApplyWarmPreset = (presetKey: WarmPreset) => {
    if (presetKey === "custom") {
      setWarmLead((prev) => ({ ...prev, preset: "custom" }));
      return;
    }
    const target = WARM_PRESETS[presetKey];
    if (target) {
      setWarmLead({
        preset: presetKey,
        intervalsDaysStr: target.intervals.join(", "),
        maxAttempts: target.maxAttempts,
      });
    }
  };

  const handleApplyColdPreset = (presetKey: ColdPreset) => {
    if (presetKey === "custom") {
      setColdLead((prev) => ({ ...prev, preset: "custom" }));
      return;
    }
    const target = COLD_PRESETS[presetKey];
    if (target) {
      setColdLead((prev) => ({
        ...prev,
        preset: presetKey,
        intervalsDaysStr: target.intervals.join(", "),
        maxAttempts: target.maxAttempts,
      }));
    }
  };

  const handleReset = () => {
    if (configResponse?.data?.config) {
      syncFromConfig(configResponse.data.config);
      toast.info("Reset configuration to active server settings.");
    }
  };

  // Live validation calculations
  const chatIntervalsCountError =
    chatDropOff.enabled &&
    chatDropOff.preset === "custom" &&
    parsedChatIntervals.length !== chatDropOff.maxAttempts
      ? `Number of intervals (${parsedChatIntervals.length}) must equal Max Attempts (${chatDropOff.maxAttempts}). Max ${chatDropOff.maxAttempts - 1} ${chatDropOff.maxAttempts - 1 === 1 ? "comma" : "commas"} allowed.`
      : null;

  const chatEmptyIntervalsError =
    chatDropOff.enabled && parsedChatIntervals.length === 0
      ? "Please enter at least one valid interval in minutes."
      : null;

  const chatTabHasError = Boolean(chatIntervalsCountError || chatEmptyIntervalsError);

  const warmIntervalsCountError =
    warmLead.preset === "custom" &&
    parsedWarmIntervals.length !== warmLead.maxAttempts
      ? `Number of intervals (${parsedWarmIntervals.length}) must equal Max Attempts (${warmLead.maxAttempts}). Max ${warmLead.maxAttempts - 1} ${warmLead.maxAttempts - 1 === 1 ? "comma" : "commas"} allowed.`
      : null;

  const warmEmptyIntervalsError =
    parsedWarmIntervals.length === 0
      ? "Please enter at least one valid interval in days."
      : null;

  const coldIntervalsCountError =
    coldLead.enabled &&
    coldLead.preset === "custom" &&
    parsedColdIntervals.length !== coldLead.maxAttempts
      ? `Number of intervals (${parsedColdIntervals.length}) must equal Max Attempts (${coldLead.maxAttempts}). Max ${coldLead.maxAttempts - 1} ${coldLead.maxAttempts - 1 === 1 ? "comma" : "commas"} allowed.`
      : null;

  const coldEmptyIntervalsError =
    coldLead.enabled && parsedColdIntervals.length === 0
      ? "Please enter at least one valid interval in days."
      : null;

  const leadTabHasError = Boolean(
    warmIntervalsCountError ||
      warmEmptyIntervalsError ||
      coldIntervalsCountError ||
      coldEmptyIntervalsError
  );

  const handleSave = () => {
    // Check validation errors directly on form
    if (chatTabHasError) {
      setActiveTab("chatDropOff");
      return;
    }
    if (leadTabHasError) {
      setActiveTab("leadFrequency");
      return;
    }

    // Sort intervals in ascending order as required by contract
    const sortedChatIntervals = [...parsedChatIntervals].sort((a, b) => a - b);
    const sortedWarmIntervals = [...parsedWarmIntervals].sort((a, b) => a - b);
    const sortedColdIntervals = [...parsedColdIntervals].sort((a, b) => a - b);

    const payload: FollowupAutomationConfigPayload = {
      channels: {
        sms: channels.sms,
        email: channels.email,
      },
      timezone: timezone.trim() || "UTC",
      chatDropOff: {
        enabled: chatDropOff.enabled,
        inactivityMinutes: Math.max(
          0,
          Number(chatDropOff.inactivityMinutes) || 0,
        ),
        maxAttempts: Math.max(
          1,
          Number(chatDropOff.maxAttempts) || sortedChatIntervals.length || 3,
        ),
        attemptIntervalsMinutes: sortedChatIntervals,
      },
      coldLead: {
        enabled: coldLead.enabled,
        maxAttempts: Math.max(
          1,
          Number(coldLead.maxAttempts) || sortedColdIntervals.length || 4,
        ),
        intervalsDays: sortedColdIntervals,
      },
      manualReminder: {
        defaultReminderMinutes: Math.max(
          0,
          Number(manualReminder.defaultReminderMinutes) || 0,
        ),
        sendDueNowReminder: manualReminder.sendDueNowReminder,
      },
      leadFrequency: {
        warm: {
          preset: warmLead.preset,
          maxAttempts: Math.max(
            1,
            Number(warmLead.maxAttempts) || sortedWarmIntervals.length || 4,
          ),
          intervalsDays: sortedWarmIntervals,
        },
        cold: {
          preset: coldLead.preset,
          maxAttempts: Math.max(
            1,
            Number(coldLead.maxAttempts) || sortedColdIntervals.length || 4,
          ),
          intervalsDays: sortedColdIntervals,
        },
      },
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setShowSuccess(true);
      },
      onError: (err: unknown) => {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj?.response?.data?.message || "Failed to update configuration",
        );
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="border-b px-6 py-4.5">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Auto Follow-up Configuration
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-0.5">
              Configure automated follow-up rules, interval cadences, and
              notification channels.
            </DialogDescription>
          </DialogHeader>

          {/* Loading state */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">
                Loading automation configuration...
              </p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Failed to load configuration
              </h3>
              <p className="text-xs text-gray-500">
                Unable to retrieve automation settings from the server.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg w-full sm:h-auto">
                  <TabsTrigger
                    value="channels"
                    className="text-xs py-2 data-active:bg-white data-active:text-gray-900 data-active:shadow-xs font-medium cursor-pointer"
                  >
                    General & Channels
                  </TabsTrigger>
                  <TabsTrigger
                    value="chatDropOff"
                    className="text-xs py-2 data-active:bg-white data-active:text-gray-900 data-active:shadow-xs font-medium cursor-pointer relative"
                  >
                    <span>Chat Drop-Off</span>
                    {chatTabHasError && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leadFrequency"
                    className="text-xs py-2 data-active:bg-white data-active:text-gray-900 data-active:shadow-xs font-medium cursor-pointer relative"
                  >
                    <span>Lead Cadence</span>
                    {leadTabHasError && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* 1. General & Channels Tab */}
                <TabsContent
                  value="channels"
                  className="space-y-4 pt-3 mt-0 focus-visible:ring-0"
                >
                  {/* Notification Channels */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                    <div className="pb-2 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Communication Channels
                      </h4>
                      <p className="text-xs text-gray-500">
                        Enable or disable automated delivery methods
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              SMS Notifications
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Send text messages
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={channels.sms}
                          onCheckedChange={(checked) =>
                            setChannels((prev) => ({ ...prev, sms: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              Email Notifications
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Send email updates
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={channels.email}
                          onCheckedChange={(checked) =>
                            setChannels((prev) => ({
                              ...prev,
                              email: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timezone Configuration */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Automation Timezone
                      </h4>
                      <p className="text-xs text-gray-500">
                        Timezone used for scheduling intervals and sweep runs
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="w-full bg-white text-xs">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_TIMEZONES.map((tz) => (
                            <SelectItem
                              key={tz.value}
                              value={tz.value}
                              className="text-xs"
                            >
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="custom-tz"
                          className="text-xs text-gray-500 whitespace-nowrap"
                        >
                          Or enter code:
                        </Label>
                        <Input
                          id="custom-tz"
                          type="text"
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          placeholder="e.g. UTC, America/Chicago"
                          className="text-xs bg-white h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Manual Reminder Defaults */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                    <div className="pb-2 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Manual Task Reminders
                      </h4>
                      <p className="text-xs text-gray-500">
                        Default settings for manual follow-up reminders
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-700">
                          Advance Reminder (Minutes)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={1440}
                          step={5}
                          value={
                            manualReminder.defaultReminderMinutes === 0
                              ? ""
                              : manualReminder.defaultReminderMinutes
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setManualReminder((prev) => ({
                              ...prev,
                              defaultReminderMinutes:
                                val === "" ? 0 : Math.max(0, Number(val) || 0),
                            }));
                          }}
                          className="text-xs bg-white"
                          placeholder="0"
                        />
                        <p className="text-[11px] text-gray-500">
                          Default alert sent{" "}
                          {manualReminder.defaultReminderMinutes} minutes before
                          due time
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            Send &quot;Due Now&quot; Alert
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Notify right at deadline
                          </p>
                        </div>
                        <Switch
                          checked={manualReminder.sendDueNowReminder}
                          onCheckedChange={(checked) =>
                            setManualReminder((prev) => ({
                              ...prev,
                              sendDueNowReminder: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. Chat Drop-Off Automation Tab */}
                <TabsContent
                  value="chatDropOff"
                  className="space-y-4 pt-3 mt-0 focus-visible:ring-0"
                >
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Chat Drop-Off Follow-Up
                        </h4>
                        <p className="text-xs text-gray-500">
                          Automatically re-engage users who abandoned active chats
                        </p>
                      </div>
                      <Switch
                        checked={chatDropOff.enabled}
                        onCheckedChange={(checked) =>
                          setChatDropOff((prev) => ({
                            ...prev,
                            enabled: checked,
                          }))
                        }
                      />
                    </div>

                    <div
                      className={`space-y-4 transition-opacity ${
                        !chatDropOff.enabled
                          ? "opacity-40 pointer-events-none"
                          : ""
                      }`}
                    >
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-700">
                          Inactivity Trigger (Minutes)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={10080}
                          value={
                            chatDropOff.inactivityMinutes === 0
                              ? ""
                              : chatDropOff.inactivityMinutes
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setChatDropOff((prev) => ({
                              ...prev,
                              inactivityMinutes:
                                val === "" ? 0 : Math.max(0, Number(val) || 0),
                            }));
                          }}
                          className="text-xs bg-white sm:max-w-xs"
                          placeholder="e.g. 30"
                        />
                        <p className="text-[11px] text-gray-500">
                          Trigger first follow-up after{" "}
                          {chatDropOff.inactivityMinutes} mins (
                          {formatMinutes(chatDropOff.inactivityMinutes)})
                        </p>
                      </div>

                      {/* Presets & Intervals */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-700 font-medium">
                            Attempt Intervals
                          </Label>
                          <div className="flex gap-1.5">
                            {(
                              Object.keys(CHAT_PRESETS) as Array<
                                Exclude<ChatPreset, "custom">
                              >
                            ).map((key) => {
                              const item = CHAT_PRESETS[key];
                              const isSelected = chatDropOff.preset === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleApplyChatPreset(key)}
                                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                                    isSelected
                                      ? "text-blue-600 bg-blue-50 border border-blue-200/60 font-medium"
                                      : "text-gray-600 hover:text-gray-800 bg-gray-100"
                                  }`}
                                >
                                  {item.label} ({item.desc})
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => handleApplyChatPreset("custom")}
                              className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                                chatDropOff.preset === "custom"
                                  ? "text-blue-600 bg-blue-50 border border-blue-200/60 font-medium"
                                  : "text-gray-600 hover:text-gray-800 bg-gray-100"
                              }`}
                            >
                              Custom
                            </button>
                          </div>
                        </div>

                        {chatDropOff.preset === "custom" ? (
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-gray-700">
                                  Max Follow-Up Attempts
                                </Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={6}
                                  value={
                                    chatDropOff.maxAttempts === 0
                                      ? ""
                                      : chatDropOff.maxAttempts
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newMax =
                                      val === "" ? 1 : Math.max(1, Number(val) || 1);
                                    setChatDropOff((prev) => ({
                                      ...prev,
                                      maxAttempts: newMax,
                                      attemptIntervalsStr: limitIntervalsInput(
                                        prev.attemptIntervalsStr,
                                        newMax,
                                      ),
                                    }));
                                  }}
                                  className="text-xs bg-white"
                                  placeholder="e.g. 3"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs text-gray-700">
                                  Intervals (Minutes, comma-separated)
                                </Label>
                                <Input
                                  type="text"
                                  value={chatDropOff.attemptIntervalsStr}
                                  onChange={(e) => {
                                    const val = limitIntervalsInput(
                                      e.target.value,
                                      chatDropOff.maxAttempts,
                                    );
                                    const nums = parseNumberArray(val);
                                    setChatDropOff((prev) => ({
                                      ...prev,
                                      attemptIntervalsStr: val,
                                      preset: detectChatPreset(nums),
                                    }));
                                  }}
                                  placeholder="e.g. 30, 180, 1440"
                                  className={`text-xs bg-white font-mono ${
                                    chatTabHasError
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                />
                              </div>
                            </div>

                            {chatIntervalsCountError && (
                              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {chatIntervalsCountError}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {parsedChatIntervals.map((mins, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-normal px-2.5 py-0.5"
                                >
                                  Attempt #{idx + 1}: {formatMinutes(mins)} ({mins}m)
                                </Badge>
                              ))}
                              {chatEmptyIntervalsError && (
                                <span className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {chatEmptyIntervalsError}
                              </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1 space-y-1.5">
                            <div className="flex flex-wrap gap-1.5">
                              {parsedChatIntervals.map((mins, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-normal px-2.5 py-0.5"
                                >
                                  Attempt #{idx + 1}: {formatMinutes(mins)} ({mins}m)
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 3. Lead Cadence (Warm & Cold) Tab */}
                <TabsContent
                  value="leadFrequency"
                  className="space-y-4 pt-3 mt-0 focus-visible:ring-0"
                >
                  {/* Card 1: Warm Leads */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                    <div className="pb-3 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Warm Leads
                      </h4>
                      <p className="text-xs text-gray-500">
                        Follow-up schedule for warm leads
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-700 font-medium">
                          Interval Schedule
                        </Label>
                        <div className="flex gap-1.5">
                          {(
                            Object.keys(WARM_PRESETS) as Array<
                              Exclude<WarmPreset, "custom">
                            >
                          ).map((key) => {
                            const item = WARM_PRESETS[key];
                            const isSelected = warmLead.preset === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleApplyWarmPreset(key)}
                                className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                                  isSelected
                                    ? "text-blue-600 bg-blue-50 border border-blue-200/60 font-medium"
                                    : "text-gray-600 hover:text-gray-800 bg-gray-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handleApplyWarmPreset("custom")}
                            className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                              warmLead.preset === "custom"
                                ? "text-blue-600 bg-blue-50 border border-blue-200/60 font-medium"
                                : "text-gray-600 hover:text-gray-800 bg-gray-100"
                            }`}
                          >
                            Custom
                          </button>
                        </div>
                      </div>

                      {warmLead.preset === "custom" ? (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-700">
                                Max Follow-Up Attempts
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                max={6}
                                value={
                                  warmLead.maxAttempts === 0
                                    ? ""
                                    : warmLead.maxAttempts
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newMax =
                                    val === "" ? 1 : Math.max(1, Number(val) || 1);
                                  setWarmLead((prev) => ({
                                    ...prev,
                                    maxAttempts: newMax,
                                    intervalsDaysStr: limitIntervalsInput(
                                      prev.intervalsDaysStr,
                                      newMax,
                                    ),
                                  }));
                                }}
                                className="text-xs bg-white"
                                placeholder="e.g. 4"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-700">
                                Interval Schedule (Days, comma-separated)
                              </Label>
                              <Input
                                type="text"
                                value={warmLead.intervalsDaysStr}
                                onChange={(e) => {
                                  const val = limitIntervalsInput(
                                    e.target.value,
                                    warmLead.maxAttempts,
                                  );
                                  const nums = parseNumberArray(val);
                                  setWarmLead((prev) => ({
                                    ...prev,
                                    intervalsDaysStr: val,
                                    preset: detectWarmPreset(nums),
                                  }));
                                }}
                                placeholder="e.g. 3, 7, 10, 14"
                                className={`text-xs bg-white font-mono ${
                                  warmIntervalsCountError || warmEmptyIntervalsError
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>

                          {warmIntervalsCountError && (
                            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {warmIntervalsCountError}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {parsedWarmIntervals.map((days, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-normal px-2.5 py-0.5"
                              >
                                Attempt #{idx + 1}: Day {days}
                              </Badge>
                            ))}
                            {warmEmptyIntervalsError && (
                              <span className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {warmEmptyIntervalsError}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 space-y-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {parsedWarmIntervals.map((days, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-normal px-2.5 py-0.5"
                              >
                                Attempt #{idx + 1}: Day {days}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Cold Leads */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Cold Leads
                        </h4>
                        <p className="text-xs text-gray-500">
                          Automated drip reminders for cold leads
                        </p>
                      </div>
                      <Switch
                        checked={coldLead.enabled}
                        onCheckedChange={(checked) =>
                          setColdLead((prev) => ({
                            ...prev,
                            enabled: checked,
                          }))
                        }
                      />
                    </div>

                    <div
                      className={`space-y-2 transition-opacity ${
                        !coldLead.enabled
                          ? "opacity-40 pointer-events-none"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-700 font-medium">
                          Interval Schedule
                        </Label>
                        <div className="flex gap-1.5">
                          {(
                            Object.keys(COLD_PRESETS) as Array<
                              Exclude<ColdPreset, "custom">
                            >
                          ).map((key) => {
                            const item = COLD_PRESETS[key];
                            const isSelected = coldLead.preset === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleApplyColdPreset(key)}
                                className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                                  isSelected
                                    ? "text-blue-600 bg-blue-50 border border-blue-200/60 font-medium"
                                    : "text-gray-600 hover:text-gray-800 bg-gray-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handleApplyColdPreset("custom")}
                            className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                              coldLead.preset === "custom"
                                ? "text-blue-600 bg-blue-50 border border-blue-200/60 font-medium"
                                : "text-gray-600 hover:text-gray-800 bg-gray-100"
                            }`}
                          >
                            Custom
                          </button>
                        </div>
                      </div>

                      {coldLead.preset === "custom" ? (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-700">
                                Max Follow-Up Attempts
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                max={6}
                                value={
                                  coldLead.maxAttempts === 0
                                    ? ""
                                    : coldLead.maxAttempts
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newMax =
                                    val === "" ? 1 : Math.max(1, Number(val) || 1);
                                  setColdLead((prev) => ({
                                    ...prev,
                                    maxAttempts: newMax,
                                    intervalsDaysStr: limitIntervalsInput(
                                      prev.intervalsDaysStr,
                                      newMax,
                                    ),
                                  }));
                                }}
                                className="text-xs bg-white"
                                placeholder="e.g. 4"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-700">
                                Interval Schedule (Days, comma-separated)
                              </Label>
                              <Input
                                type="text"
                                value={coldLead.intervalsDaysStr}
                                onChange={(e) => {
                                  const val = limitIntervalsInput(
                                    e.target.value,
                                    coldLead.maxAttempts,
                                  );
                                  const nums = parseNumberArray(val);
                                  setColdLead((prev) => ({
                                    ...prev,
                                    intervalsDaysStr: val,
                                    preset: detectColdPreset(nums),
                                  }));
                                }}
                                placeholder="e.g. 7, 15, 30"
                                className={`text-xs bg-white font-mono ${
                                  coldIntervalsCountError || coldEmptyIntervalsError
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>

                          {coldIntervalsCountError && (
                            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {coldIntervalsCountError}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {parsedColdIntervals.map((days, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-normal px-2.5 py-0.5"
                              >
                                Attempt #{idx + 1}: Day {days}
                              </Badge>
                            ))}
                            {coldEmptyIntervalsError && (
                              <span className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {coldEmptyIntervalsError}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 space-y-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {parsedColdIntervals.map((days, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-normal px-2.5 py-0.5"
                              >
                                Attempt #{idx + 1}: Day {days}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="border-t px-6 py-4 flex items-center justify-between bg-gray-50/50 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isLoading || updateMutation.isPending}
              className="text-gray-600 hover:text-gray-900 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset to Current
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={
                  isLoading ||
                  updateMutation.isPending ||
                  chatTabHasError ||
                  leadTabHasError
                }
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Configuration Saved Successfully!"
      />
    </>
  );
}
