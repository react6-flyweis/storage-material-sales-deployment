import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams, useLocation } from "react-router";
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
import { ArrowLeft, Video } from "lucide-react";
import ClientSelector from "@/components/customers/client-selector";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
} from "@/modules/meetings/meetings.hooks";
import SuccessDialog from "@/components/success-dialog";
import MeetingLinkActions from "@/components/meetings/meeting-link-actions";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  Meeting,
  UpdateMeetingPayload,
} from "@/modules/meetings/meetings.api";
import {
  getMeetingMinimums,
  getPastMeetingError,
  hasZoomLink,
  isOnlineMeeting,
  isValidUrl,
  normalizeUrl,
  toMeetingTimeIso,
} from "@/modules/meetings/meetings.utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const meetingSchema = z
  .object({
    client: z.string().min(1, "Please select a client"),
    title: z.string().min(1, "Please select a meeting title"),
    date: z.string().min(1, "Meeting date is required"),
    time: z.string().min(1, "Meeting time is required"),
    duration: z
      .string()
      .min(1, "Duration is required")
      .regex(/^[0-9]+$/, "Duration must be a number of minutes")
      .refine((v) => Number(v) >= 1, "Duration must be at least 1 minute"),
    reminderMinutes: z.string().optional(),
    mode: z.enum(["online", "in-person"]),
    /** Online only: skip Zoom auto-create and use a pasted link. */
    useOwnLink: z.boolean(),
    link: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Zoom accepts 15–1440 minutes.
    const duration = Number(data.duration);
    if (
      data.mode === "online" &&
      !data.useOwnLink &&
      Number.isFinite(duration) &&
      (duration < 15 || duration > 1440)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Zoom meetings must be between 15 and 1440 minutes",
        path: ["duration"],
      });
    }

    const link = data.link?.trim() ?? "";
    const linkRequired = data.mode === "online" && data.useOwnLink;

    if (linkRequired && !link) {
      ctx.addIssue({
        code: "custom",
        message: "Paste your meeting link, or untick \"Use my own link\"",
        path: ["link"],
      });
    } else if (link && !isValidUrl(link)) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid meeting URL (e.g., https://zoom.us/j/...)",
        path: ["link"],
      });
    }
  });

type MeetingFormData = z.infer<typeof meetingSchema>;

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditMode = !!id;
  const passedMeeting = location.state?.meeting;
  const rawMeeting: Meeting | undefined = passedMeeting?.rawMeeting;
  /** Stored link on the meeting being edited, if any. */
  const existingLink = rawMeeting?.meetingLink?.trim() ?? "";
  const existingIsZoom = rawMeeting ? hasZoomLink(rawMeeting) : false;

  const [selectedClient, setSelectedClient] = useState(() => {
    if (isEditMode && passedMeeting?.rawMeeting) {
      const raw = passedMeeting.rawMeeting;
      return typeof raw.leadId === "string"
        ? raw.leadId
        : raw.leadId?._id || "";
    }
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("lead") || "";
  });
  const [successOpen, setSuccessOpen] = useState(false);
  const [customerId, setCustomerId] = useState(() => {
    if (isEditMode && passedMeeting?.rawMeeting) {
      const raw = passedMeeting.rawMeeting;
      if (raw.customerId) {
        return typeof raw.customerId === "string"
          ? raw.customerId
          : raw.customerId._id || "";
      }
    }
    return "";
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMeeting, setSavedMeeting] = useState<Meeting | null>(null);

  const createMeetingMutation = useCreateMeetingMutation();
  const updateMeetingMutation = useUpdateMeetingMutation();

  const defaultValues = useMemo(() => {
    if (isEditMode && passedMeeting?.rawMeeting) {
      const raw = passedMeeting.rawMeeting;
      let dateStr = "";
      let timeStr = "";
      const dateObject = new Date(raw.meetingTime);
      if (!Number.isNaN(dateObject.getTime())) {
        dateStr = dateObject.toLocaleDateString("en-CA");
        const hours = String(dateObject.getHours()).padStart(2, "0");
        const minutes = String(dateObject.getMinutes()).padStart(2, "0");
        timeStr = `${hours}:${minutes}`;
      }

      const leadIdStr =
        typeof raw.leadId === "string" ? raw.leadId : raw.leadId?._id || "";

      return {
        mode: (isOnlineMeeting(raw.mode) ? "online" : "in-person") as
          | "online"
          | "in-person",
        // A stored link that Zoom didn't create is a manual link.
        useOwnLink: Boolean(raw.meetingLink?.trim()) && !hasZoomLink(raw),
        title: raw.title || "",
        date: dateStr,
        time: timeStr,
        duration: String(raw.duration || ""),
        reminderMinutes: raw.reminderMinutes
          ? String(raw.reminderMinutes)
          : "30",
        link: hasZoomLink(raw) ? "" : raw.meetingLink || "",
        notes: raw.notes || "",
        client: leadIdStr,
      };
    }
    const queryParams = new URLSearchParams(location.search);
    const leadIdParam = queryParams.get("lead") || "";
    return {
      mode: "online" as const,
      useOwnLink: false,
      title: "",
      date: "",
      time: "",
      duration: "30",
      reminderMinutes: "30",
      link: "",
      notes: "",
      client: leadIdParam,
    };
  }, [isEditMode, passedMeeting, location.search]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    reset,
    control,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    mode: "onChange",
    defaultValues,
  });

  const mode = useWatch({
    control,
    name: "mode",
    defaultValue: "online",
  });
  const useOwnLink = useWatch({
    control,
    name: "useOwnLink",
    defaultValue: false,
  });

  const selectedDate = useWatch({ control, name: "date" });
  const { minDate, minTime } = getMeetingMinimums(selectedDate);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: MeetingFormData) => {
    setErrorMessage(null);

    // Block past slots. A meeting that has already passed can still have its
    // other fields edited, so on edit only check when the date/time changed.
    const timeChanged =
      !isEditMode ||
      data.date !== defaultValues.date ||
      data.time !== defaultValues.time;
    const pastError = timeChanged
      ? getPastMeetingError(data.date, data.time)
      : undefined;
    if (pastError) {
      setError(pastError.field, { type: "custom", message: pastError.message });
      return;
    }

    const meetingTime = toMeetingTimeIso(data.date, data.time);
    const duration = Number.parseInt(data.duration, 10);
    const reminderMinutes = data.reminderMinutes
      ? Number(data.reminderMinutes)
      : undefined;
    const notes = data.notes?.trim() || undefined;

    // Online + Zoom (default): no meetingLink — the backend creates the Zoom
    // meeting. Online + own link, or in person with an optional link: send it.
    const typedLink = normalizeUrl(data.link ?? "");
    const meetingLink =
      data.mode === "online"
        ? data.useOwnLink
          ? typedLink
          : undefined
        : typedLink || undefined;

    try {
      let response;
      if (isEditMode && id) {
        // Send only the fields that changed so the Zoom join link stays stable.
        const initial = defaultValues;
        const payload: UpdateMeetingPayload = {};
        if (data.client !== initial.client) payload.leadId = data.client;
        if (customerId && data.client !== initial.client) {
          payload.customerId = customerId;
        }
        if (data.title !== initial.title) payload.title = data.title;
        if (data.date !== initial.date || data.time !== initial.time) {
          payload.meetingTime = meetingTime;
        }
        if (data.duration !== initial.duration) payload.duration = duration;
        if (data.mode !== initial.mode) payload.mode = data.mode;
        if (data.reminderMinutes !== initial.reminderMinutes) {
          payload.reminderMinutes = reminderMinutes;
        }
        if ((data.notes ?? "") !== (initial.notes ?? "")) {
          payload.notes = data.notes?.trim() ?? "";
        }
        if (meetingLink && meetingLink !== existingLink) {
          payload.meetingLink = meetingLink;
        }

        if (Object.keys(payload).length === 0) {
          navigate("/meetings");
          return;
        }

        response = await updateMeetingMutation.mutateAsync({
          meetingId: id,
          payload,
        });
      } else {
        response = await createMeetingMutation.mutateAsync({
          leadId: data.client,
          customerId: customerId || undefined,
          title: data.title,
          meetingTime,
          duration,
          mode: data.mode,
          ...(meetingLink ? { meetingLink } : {}),
          reminderMinutes,
          notes,
        });
      }

      if (!response.success) {
        setErrorMessage(
          response.message ||
            `Unable to ${isEditMode ? "update" : "schedule"} meeting.`,
        );
        return;
      }

      setSavedMeeting(response.data?.meeting ?? null);
      setSuccessOpen(true);
    } catch (error) {
      // Zoom / config failures come back as 400 with Zoom's message.
      setErrorMessage(
        getApiErrorMessage(
          error,
          `Unable to ${isEditMode ? "update" : "schedule"} meeting.`,
        ),
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white h-9 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit/Reschedule meeting" : "Schedule meeting"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {errorMessage ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow space-y-5">
          <h3 className="text-base font-semibold text-gray-900">
            Meeting Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select a customer */}
            <div className="space-y-2">
              <Label htmlFor="client">
                Select a customer <span className="text-red-500">*</span>
              </Label>
              <ClientSelector
                value={selectedClient}
                placeholder="Search Customer"
                onValueChange={(client) => {
                  const val = client?.id ?? "";
                  setSelectedClient(val);
                  setCustomerId(client?.customerId ?? "");
                  setValue("client", val);
                }}
              />
              {errors.client && (
                <p className="text-sm text-red-500">{errors.client.message}</p>
              )}
            </div>

            {/* Meeting title */}
            <div className="space-y-2">
              <Label htmlFor="title">Meeting title</Label>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" id="title">
                      <SelectValue placeholder="Meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project Review">
                        Project Review
                      </SelectItem>
                      <SelectItem value="Sales Meeting">
                        Sales Meeting
                      </SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Meeting Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Meeting Date</Label>
              <Input
                id="date"
                type="date"
                placeholder="dd-mm-yyyy"
                min={minDate}
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Meeting Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Meeting Time</Label>
              <Input
                id="time"
                type="time"
                min={minTime}
                {...register("time")}
              />
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (In Min)</Label>
              <InputGroup>
                <InputGroupInput
                  id="duration"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="60"
                  {...register("duration")}
                />
                <InputGroupAddon align="inline-end">Min</InputGroupAddon>
              </InputGroup>
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Reminder Timing */}
            <div className="space-y-2">
              <Label htmlFor="reminderMinutes">Reminder Timing</Label>
              <Controller
                control={control}
                name="reminderMinutes"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" id="reminderMinutes">
                      <SelectValue placeholder="Select reminder timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                      <SelectItem value="1440">24 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reminderMinutes && (
                <p className="text-sm text-red-500">
                  {errors.reminderMinutes.message}
                </p>
              )}
            </div>

            {/* Meeting mode */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Meeting mode</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="online"
                    {...register("mode")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="in-person"
                    {...register("mode")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">In Person</span>
                </label>
              </div>
              {errors.mode && (
                <p className="text-sm text-red-500">{errors.mode.message}</p>
              )}
            </div>
          </div>

          {/* Meeting Link */}
          {mode === "online" ? (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {!useOwnLink ? (
                <div className="flex items-start gap-3">
                  <Video className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-gray-900">Zoom meeting</p>
                    {isEditMode && existingIsZoom && existingLink ? (
                      <>
                        <p className="text-gray-600">
                          The join link stays the same when you reschedule.
                        </p>
                        <MeetingLinkActions
                          meetingLink={existingLink}
                          zoomStartUrl={rawMeeting?.zoomStartUrl}
                          showLink
                          className="pt-1"
                        />
                      </>
                    ) : (
                      <p className="text-gray-600">
                        A Zoom link is created automatically when you save and
                        shared with the customer.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {/* A saved manual link can't be switched back to Zoom by the API. */}
              {!(isEditMode && existingLink && !existingIsZoom) ? (
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Controller
                    control={control}
                    name="useOwnLink"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    )}
                  />
                  Use my own link instead
                </label>
              ) : null}

              {useOwnLink ? (
                <div className="space-y-2">
                  <Label htmlFor="link">
                    Meeting Link <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="link"
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    {...register("link")}
                  />
                  {errors.link && (
                    <p className="text-sm text-red-500">{errors.link.message}</p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Add Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Add Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or agenda items"
              rows={4}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/meetings")}
            className="w-full sm:w-auto px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createMeetingMutation.isPending || updateMeetingMutation.isPending
            }
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-6"
          >
            {createMeetingMutation.isPending || updateMeetingMutation.isPending
              ? isEditMode
                ? "Updating..."
                : "Scheduling..."
              : isEditMode
                ? "Update meeting"
                : "Schedule meeting"}
          </Button>
        </div>
      </form>

      <SuccessDialog
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate("/meetings");
        }}
        title={isEditMode ? "Meeting updated" : "Meeting scheduled"}
        description={
          savedMeeting && isOnlineMeeting(savedMeeting.mode) && savedMeeting.meetingLink
            ? "The customer can join with this link."
            : undefined
        }
      >
        <div className="flex w-full flex-col items-center gap-4">
          {savedMeeting && isOnlineMeeting(savedMeeting.mode) ? (
            <MeetingLinkActions
              meetingLink={savedMeeting.meetingLink}
              zoomStartUrl={savedMeeting.zoomStartUrl}
              showLink
              centered
              className="w-full text-center"
            />
          ) : null}
          <Button
            type="button"
            onClick={() => {
              setSuccessOpen(false);
              navigate("/meetings");
            }}
            className="w-52 bg-[#2563EB] hover:bg-[#1D4ED8]"
          >
            Go to meetings
          </Button>
        </div>
      </SuccessDialog>
    </div>
  );
}
