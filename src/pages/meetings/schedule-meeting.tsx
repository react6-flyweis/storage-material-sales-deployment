import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { ArrowLeft } from "lucide-react";
import ClientSelector from "@/components/customers/client-selector";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateMeetingMutation, useUpdateMeetingMutation } from "@/modules/meetings/meetings.hooks";
import SuccessDialog from "@/components/success-dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const meetingSchema = z
  .object({
    client: z.string().min(1, "Please select a client"),
    title: z.string().min(1, "Please select a meeting title"),
    date: z.string().min(1, "Meeting date is required"),
    time: z.string().min(1, "Meeting time is required"),
    duration: z
      .string()
      .min(1, "Duration is required")
      .regex(/^[0-9]+$/, "Duration must be a number of minutes"),
    mode: z.enum(["online", "in-person"]),
    link: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const checkUrl = (val: string) => {
      let urlStr = val.trim();
      if (!/^https?:\/\//i.test(urlStr)) {
        urlStr = `https://${urlStr}`;
      }
      try {
        new URL(urlStr);
        return true;
      } catch {
        return false;
      }
    };

    if (data.mode === "online") {
      if (!data.link || data.link.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Meeting link is required for online meetings",
          path: ["link"],
        });
      } else if (!checkUrl(data.link)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid meeting URL (e.g., https://zoom.us)",
          path: ["link"],
        });
      }
    } else if (data.mode === "in-person") {
      if (data.link && data.link.trim() !== "" && !checkUrl(data.link)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid meeting URL (e.g., https://zoom.us)",
          path: ["link"],
        });
      }
    }
  });

type MeetingFormData = z.infer<typeof meetingSchema>;



export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditMode = !!id;
  const passedMeeting = location.state?.meeting;

  const [selectedClient, setSelectedClient] = useState(() => {
    if (isEditMode && passedMeeting?.rawMeeting) {
      const raw = passedMeeting.rawMeeting;
      return typeof raw.leadId === "string" ? raw.leadId : (raw.leadId?._id || "");
    }
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("lead") || "";
  });
  const [successOpen, setSuccessOpen] = useState(false);
  const [customerId, setCustomerId] = useState(() => {
    if (isEditMode && passedMeeting?.rawMeeting) {
      const raw = passedMeeting.rawMeeting;
      if (raw.customerId) {
        return typeof raw.customerId === "string" ? raw.customerId : (raw.customerId._id || "");
      }
    }
    return "";
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      const leadIdStr = typeof raw.leadId === "string" ? raw.leadId : (raw.leadId?._id || "");

      return {
        mode: raw.mode || "online",
        title: raw.title || "",
        date: dateStr,
        time: timeStr,
        duration: String(raw.duration || ""),
        link: raw.meetingLink || "",
        notes: raw.notes || "",
        client: leadIdStr,
      };
    }
    const queryParams = new URLSearchParams(location.search);
    const leadIdParam = queryParams.get("lead") || "";
    return {
      mode: "online" as const,
      title: "",
      date: "",
      time: "",
      duration: "",
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

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: MeetingFormData) => {
    setErrorMessage(null);

    const meetingTime = new Date(
      `${data.date}T${data.time}:00.000Z`,
    ).toISOString();

    let meetingLink = data.link?.trim() ?? "";
    if (meetingLink && !/^https?:\/\//i.test(meetingLink)) {
      meetingLink = `https://${meetingLink}`;
    }

    try {
      let response;
      if (isEditMode && id) {
        response = await updateMeetingMutation.mutateAsync({
          meetingId: id,
          payload: {
            leadId: data.client,
            customerId,
            title: data.title,
            meetingTime,
            duration: Number.parseInt(data.duration, 10),
            mode: data.mode,
            meetingLink,
            notes: data.notes?.trim() || undefined,
          },
        });
      } else {
        response = await createMeetingMutation.mutateAsync({
          leadId: data.client,
          customerId,
          title: data.title,
          meetingTime,
          duration: Number.parseInt(data.duration, 10),
          mode: data.mode,
          meetingLink,
          notes: data.notes?.trim() || undefined,
        });
      }

      if (!response.success) {
        setErrorMessage(response.message || `Unable to ${isEditMode ? "update" : "schedule"} meeting.`);
        return;
      }

      setSuccessOpen(true);
      setTimeout(() => navigate("/meetings"), 500);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, `Unable to ${isEditMode ? "update" : "schedule"} meeting.`));
    }
  };

  return (
    <div className="p-4 sm:p-6  w-full">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <Select
                onValueChange={(value) => setValue("title", value)}
                {...register("title")}
              >
                <SelectTrigger className="w-full" id="title">
                  <SelectValue placeholder="Meeting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-review">Project Review</SelectItem>
                  <SelectItem value="sales-meeting">Sales Meeting</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
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
                min={new Date().toLocaleDateString("en-CA")}
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
                placeholder="dd-mm-yyyy"
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
                <InputGroupAddon align="inline-end">
                  Min</InputGroupAddon>
              </InputGroup>
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Meeting mode */}
            <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="link">
              Meeting Link {mode === "online" && <span className="text-red-500">*</span>}
            </Label>
            <Input id="link" placeholder="Zoom Meeting" {...register("link")} />
            {errors.link && (
              <p className="text-sm text-red-500">{errors.link.message}</p>
            )}
          </div>

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
            onClick={() => navigate("/customers/meetings")}
            className="w-full sm:w-auto px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMeetingMutation.isPending || updateMeetingMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-6"
          >
            {createMeetingMutation.isPending || updateMeetingMutation.isPending
              ? isEditMode ? "Updating..." : "Scheduling..."
              : isEditMode ? "Update meeting" : "Schedule meeting"}
          </Button>
        </div>
      </form>

      <SuccessDialog
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate("/customers/meetings");
        }}
        title={isEditMode ? "Meeting updated" : "Meeting scheduled"}
        okLabel="Go to meetings"
      />
    </div>
  );
}
