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
import { useAuthStore } from "@/modules/auth/auth.store";
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

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  if (mins % 60 === 0) return `${mins / 60}h`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
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
  const role = useAuthStore((state) => state.role);
  const isAdmin = !role || role.toLowerCase() === "admin";

  // Form states
  const [channels, setChannels] = useState({ sms: true, email: true });
  const [timezone, setTimezone] = useState("UTC");

  const [chatDropOff, setChatDropOff] = useState({
    enabled: true,
    inactivityMinutes: 30,
    maxAttempts: 3,
    attemptIntervalsStr: "30, 180, 1440",
    requireNotQuoteReady: false,
    requireNotHandedToSales: false,
  });

  const [coldLead, setColdLead] = useState({
    enabled: true,
    maxAttempts: 4,
    intervalsDaysStr: "1, 3, 7, 14",
  });

  const [manualReminder, setManualReminder] = useState({
    defaultReminderMinutes: 30,
    sendDueNowReminder: true,
  });

  const [activeTab, setActiveTab] = useState("channels");
  const [showSuccess, setShowSuccess] = useState(false);

  // Populate state from API data
  useEffect(() => {
    if (configResponse?.data?.config && open) {
      const cfg = configResponse.data.config;
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
        setChatDropOff({
          enabled: Boolean(cfg.chatDropOff.enabled),
          inactivityMinutes: Number(cfg.chatDropOff.inactivityMinutes) || 30,
          maxAttempts: Number(cfg.chatDropOff.maxAttempts) || 3,
          attemptIntervalsStr: Array.isArray(
            cfg.chatDropOff.attemptIntervalsMinutes,
          )
            ? cfg.chatDropOff.attemptIntervalsMinutes.join(", ")
            : "30, 180, 1440",
          requireNotQuoteReady: Boolean(cfg.chatDropOff.requireNotQuoteReady),
          requireNotHandedToSales: Boolean(
            cfg.chatDropOff.requireNotHandedToSales,
          ),
        });
      }
      if (cfg.coldLead) {
        setColdLead({
          enabled: Boolean(cfg.coldLead.enabled),
          maxAttempts: Number(cfg.coldLead.maxAttempts) || 4,
          intervalsDaysStr: Array.isArray(cfg.coldLead.intervalsDays)
            ? cfg.coldLead.intervalsDays.join(", ")
            : "1, 3, 7, 14",
        });
      }
      if (cfg.manualReminder) {
        setManualReminder({
          defaultReminderMinutes:
            Number(cfg.manualReminder.defaultReminderMinutes) || 30,
          sendDueNowReminder: Boolean(cfg.manualReminder.sendDueNowReminder),
        });
      }
    }
  }, [configResponse, open]);

  // Helper parser for comma separated numbers
  const parseNumberArray = (str: string): number[] => {
    return str
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  };

  const parsedChatIntervals = parseNumberArray(chatDropOff.attemptIntervalsStr);
  const parsedColdIntervals = parseNumberArray(coldLead.intervalsDaysStr);

  const handleReset = () => {
    if (configResponse?.data?.config) {
      const cfg = configResponse.data.config;
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
        setChatDropOff({
          enabled: Boolean(cfg.chatDropOff.enabled),
          inactivityMinutes: Number(cfg.chatDropOff.inactivityMinutes) || 30,
          maxAttempts: Number(cfg.chatDropOff.maxAttempts) || 3,
          attemptIntervalsStr: Array.isArray(
            cfg.chatDropOff.attemptIntervalsMinutes,
          )
            ? cfg.chatDropOff.attemptIntervalsMinutes.join(", ")
            : "30, 180, 1440",
          requireNotQuoteReady: Boolean(cfg.chatDropOff.requireNotQuoteReady),
          requireNotHandedToSales: Boolean(
            cfg.chatDropOff.requireNotHandedToSales,
          ),
        });
      }
      if (cfg.coldLead) {
        setColdLead({
          enabled: Boolean(cfg.coldLead.enabled),
          maxAttempts: Number(cfg.coldLead.maxAttempts) || 4,
          intervalsDaysStr: Array.isArray(cfg.coldLead.intervalsDays)
            ? cfg.coldLead.intervalsDays.join(", ")
            : "1, 3, 7, 14",
        });
      }
      if (cfg.manualReminder) {
        setManualReminder({
          defaultReminderMinutes:
            Number(cfg.manualReminder.defaultReminderMinutes) || 30,
          sendDueNowReminder: Boolean(cfg.manualReminder.sendDueNowReminder),
        });
      }
    }
  };

  const handleSave = () => {
    // Validate intervals
    if (chatDropOff.enabled && parsedChatIntervals.length === 0) {
      toast.error(
        "Please enter at least one valid interval for Chat Drop-Off (in minutes).",
      );
      setActiveTab("chatDropOff");
      return;
    }
    if (coldLead.enabled && parsedColdIntervals.length === 0) {
      toast.error(
        "Please enter at least one valid interval for Cold Lead follow-ups (in days).",
      );
      setActiveTab("coldLead");
      return;
    }

    const payload = {
      channels: {
        sms: channels.sms,
        email: channels.email,
      },
      timezone: timezone.trim() || "UTC",
      chatDropOff: {
        enabled: chatDropOff.enabled,
        inactivityMinutes: Number(chatDropOff.inactivityMinutes) || 30,
        maxAttempts:
          Number(chatDropOff.maxAttempts) || parsedChatIntervals.length || 3,
        attemptIntervalsMinutes: parsedChatIntervals,
        requireNotQuoteReady: chatDropOff.requireNotQuoteReady,
        requireNotHandedToSales: chatDropOff.requireNotHandedToSales,
      },
      coldLead: {
        enabled: coldLead.enabled,
        maxAttempts:
          Number(coldLead.maxAttempts) || parsedColdIntervals.length || 4,
        intervalsDays: parsedColdIntervals,
      },
      manualReminder: {
        defaultReminderMinutes:
          Number(manualReminder.defaultReminderMinutes) || 30,
        sendDueNowReminder: manualReminder.sendDueNowReminder,
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
            Configure automated follow-up rules, intervals, and notification
            channels.
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
            {!isAdmin && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You are currently in read-only mode. Only administrators can
                  save configuration updates.
                </span>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg w-full sm:h-auto">
                <TabsTrigger
                  value="channels"
                  className="text-xs py-2 data-active:bg-white data-active:text-gray-900 data-active:shadow-xs font-medium"
                >
                  General & Channels
                </TabsTrigger>
                <TabsTrigger
                  value="chatDropOff"
                  className="text-xs py-2 data-active:bg-white data-active:text-gray-900 data-active:shadow-xs font-medium"
                >
                  Chat Drop-Off
                </TabsTrigger>
                <TabsTrigger
                  value="coldLead"
                  className="text-xs py-2 data-active:bg-white data-active:text-gray-900 data-active:shadow-xs font-medium"
                >
                  Cold Leads
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
                          setChannels((prev) => ({ ...prev, email: checked }))
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
                      <SelectTrigger className="bg-white text-xs">
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
                        min={5}
                        max={1440}
                        step={5}
                        value={manualReminder.defaultReminderMinutes}
                        onChange={(e) =>
                          setManualReminder((prev) => ({
                            ...prev,
                            defaultReminderMinutes: Number(e.target.value) || 0,
                          }))
                        }
                        className="text-xs bg-white"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-700">
                        Inactivity Trigger (Minutes)
                      </Label>
                      <Input
                        type="number"
                        min={5}
                        max={10080}
                        value={chatDropOff.inactivityMinutes}
                        onChange={(e) =>
                          setChatDropOff((prev) => ({
                            ...prev,
                            inactivityMinutes: Number(e.target.value) || 0,
                          }))
                        }
                        className="text-xs bg-white"
                        placeholder="e.g. 30"
                      />
                      <p className="text-[11px] text-gray-500">
                        Trigger first follow-up after{" "}
                        {chatDropOff.inactivityMinutes} mins (
                        {formatMinutes(chatDropOff.inactivityMinutes)})
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-700">
                        Max Follow-Up Attempts
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={chatDropOff.maxAttempts}
                        onChange={(e) =>
                          setChatDropOff((prev) => ({
                            ...prev,
                            maxAttempts: Number(e.target.value) || 0,
                          }))
                        }
                        className="text-xs bg-white"
                        placeholder="e.g. 3"
                      />
                      <p className="text-[11px] text-gray-500">
                        Maximum attempts before stopping automatic drop-off
                        pings
                      </p>
                    </div>
                  </div>

                  {/* Intervals */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-700 font-medium">
                        Attempt Intervals (Minutes, comma-separated)
                      </Label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setChatDropOff((prev) => ({
                              ...prev,
                              attemptIntervalsStr: "30, 180, 1440",
                              maxAttempts: 3,
                            }))
                          }
                          className="text-[11px] text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded cursor-pointer border border-blue-200/60 font-medium"
                        >
                          Default (30m, 3h, 24h)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChatDropOff((prev) => ({
                              ...prev,
                              attemptIntervalsStr: "20, 120, 720",
                              maxAttempts: 3,
                            }))
                          }
                          className="text-[11px] text-gray-600 hover:text-gray-800 bg-gray-100 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Fast (20m, 2h, 12h)
                        </button>
                      </div>
                    </div>
                    <Input
                      type="text"
                      value={chatDropOff.attemptIntervalsStr}
                      onChange={(e) =>
                        setChatDropOff((prev) => ({
                          ...prev,
                          attemptIntervalsStr: e.target.value,
                        }))
                      }
                      placeholder="e.g. 30, 180, 1440"
                      className="text-xs bg-white font-mono"
                    />

                    {/* Visual chips */}
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
                      {parsedChatIntervals.length === 0 && (
                        <span className="text-[11px] text-red-500">
                          Please specify at least one interval in minutes.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Additional Drop-Off Conditions */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-900">
                        Drop-Off Trigger Conditions
                      </h5>
                      <p className="text-[11px] text-gray-500">
                        Optional constraints before sending drop-off messages
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            Require Quote Not Ready
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Only send if quote is pending
                          </p>
                        </div>
                        <Switch
                          checked={chatDropOff.requireNotQuoteReady}
                          onCheckedChange={(checked) =>
                            setChatDropOff((prev) => ({
                              ...prev,
                              requireNotQuoteReady: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            Require Not Handed to Sales
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Only send if unassigned to sales
                          </p>
                        </div>
                        <Switch
                          checked={chatDropOff.requireNotHandedToSales}
                          onCheckedChange={(checked) =>
                            setChatDropOff((prev) => ({
                              ...prev,
                              requireNotHandedToSales: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 3. Cold Leads Automation Tab */}
              <TabsContent
                value="coldLead"
                className="space-y-4 pt-3 mt-0 focus-visible:ring-0"
              >
                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Cold Lead Re-engagement
                      </h4>
                      <p className="text-xs text-gray-500">
                        Automated multi-day drip reminders for dormant or cold
                        leads
                      </p>
                    </div>
                    <Switch
                      checked={coldLead.enabled}
                      onCheckedChange={(checked) =>
                        setColdLead((prev) => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-700">
                      Max Follow-Up Attempts
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={coldLead.maxAttempts}
                      onChange={(e) =>
                        setColdLead((prev) => ({
                          ...prev,
                          maxAttempts: Number(e.target.value) || 0,
                        }))
                      }
                      className="text-xs bg-white sm:max-w-xs"
                      placeholder="e.g. 4"
                    />
                    <p className="text-[11px] text-gray-500">
                      Total number of cold outreach attempts before closing
                      cadence
                    </p>
                  </div>

                  {/* Intervals */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-700 font-medium">
                        Interval Schedule (Days, comma-separated)
                      </Label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setColdLead((prev) => ({
                              ...prev,
                              intervalsDaysStr: "1, 3, 7, 14",
                              maxAttempts: 4,
                            }))
                          }
                          className="text-[11px] text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded cursor-pointer border border-blue-200/60 font-medium"
                        >
                          Standard (1, 3, 7, 14d)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setColdLead((prev) => ({
                              ...prev,
                              intervalsDaysStr: "1, 2, 5",
                              maxAttempts: 3,
                            }))
                          }
                          className="text-[11px] text-gray-600 hover:text-gray-800 bg-gray-100 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Short (1, 2, 5d)
                        </button>
                      </div>
                    </div>
                    <Input
                      type="text"
                      value={coldLead.intervalsDaysStr}
                      onChange={(e) =>
                        setColdLead((prev) => ({
                          ...prev,
                          intervalsDaysStr: e.target.value,
                        }))
                      }
                      placeholder="e.g. 1, 3, 7, 14"
                      className="text-xs bg-white font-mono"
                    />

                    {/* Visual chips */}
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
                      {parsedColdIntervals.length === 0 && (
                        <span className="text-[11px] text-red-500">
                          Please specify at least one interval in days.
                        </span>
                      )}
                    </div>
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
            className="text-gray-600 hover:text-gray-900 text-xs"
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
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isLoading || updateMutation.isPending || !isAdmin}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
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
