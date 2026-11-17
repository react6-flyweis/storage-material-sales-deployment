import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  User,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ZoomMeetingMetadata } from "../zoom.types";
import {
  useMediaPermissions,
  createAudioMeter,
} from "../zoom-permissions";

interface ZoomScheduledLobbyProps {
  metadata: ZoomMeetingMetadata;
  targetStartTime: Date;
  onStartMeeting: (options?: { videoOn: boolean; isMuted: boolean }) => void;
  onExit: () => void;
}

export const ZoomScheduledLobby: React.FC<ZoomScheduledLobbyProps> = ({
  metadata,
  targetStartTime,
  onStartMeeting,
  onExit,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const diff = Math.floor((targetStartTime.getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 900;
  });

  const [previewVideoOn, setPreviewVideoOn] = useState(true);
  const [previewMuted, setPreviewMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeVideoStreamRef = useRef<MediaStream | null>(null);
  const activeAudioStreamRef = useRef<MediaStream | null>(null);
  const audioMeterCleanupRef = useRef<(() => void) | null>(null);

  const {
    permissions,
    refreshDevices,
    requestCamera,
    requestMicrophone,
  } = useMediaPermissions();

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onStartMeeting({ videoOn: previewVideoOn, isMuted: previewMuted });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onStartMeeting, previewVideoOn, previewMuted]);

  // Start / stop camera preview
  const startCamera = useCallback(async () => {
    if (activeVideoStreamRef.current) {
      activeVideoStreamRef.current.getTracks().forEach((t) => t.stop());
      activeVideoStreamRef.current = null;
    }

    const { stream, error } = await requestCamera();
    if (stream && videoRef.current) {
      activeVideoStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      setPreviewVideoOn(true);
    } else if (error) {
      setPreviewVideoOn(false);
    }
  }, [requestCamera]);

  const stopCamera = useCallback(() => {
    if (activeVideoStreamRef.current) {
      activeVideoStreamRef.current.getTracks().forEach((t) => t.stop());
      activeVideoStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setPreviewVideoOn(false);
  }, []);

  // Initialize camera preview on mount if wanted
  useEffect(() => {
    if (previewVideoOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      if (activeVideoStreamRef.current) {
        activeVideoStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [previewVideoOn, startCamera, stopCamera]);

  // Start / stop microphone pre-check and audio volume monitoring
  const startMicrophoneMeter = useCallback(async () => {
    if (audioMeterCleanupRef.current) {
      audioMeterCleanupRef.current();
      audioMeterCleanupRef.current = null;
    }
    if (activeAudioStreamRef.current) {
      activeAudioStreamRef.current.getTracks().forEach((t) => t.stop());
      activeAudioStreamRef.current = null;
    }

    const { stream } = await requestMicrophone();
    if (stream) {
      activeAudioStreamRef.current = stream;
      const cleanup = createAudioMeter(stream, (vol) => {
        setAudioVolume(vol);
      });
      audioMeterCleanupRef.current = cleanup;
    }
  }, [requestMicrophone]);

  const stopMicrophoneMeter = useCallback(() => {
    if (audioMeterCleanupRef.current) {
      audioMeterCleanupRef.current();
      audioMeterCleanupRef.current = null;
    }
    if (activeAudioStreamRef.current) {
      activeAudioStreamRef.current.getTracks().forEach((t) => t.stop());
      activeAudioStreamRef.current = null;
    }
    setAudioVolume(0);
  }, []);

  useEffect(() => {
    if (!previewMuted) {
      startMicrophoneMeter();
    } else {
      stopMicrophoneMeter();
    }

    return () => {
      if (audioMeterCleanupRef.current) {
        audioMeterCleanupRef.current();
      }
      if (activeAudioStreamRef.current) {
        activeAudioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [previewMuted, startMicrophoneMeter, stopMicrophoneMeter]);

  const handleRetryPermissions = () => {
    refreshDevices();
    startCamera();
    if (!previewMuted) {
      startMicrophoneMeter();
    }
  };

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedCountdown = `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isCameraBlocked = permissions.camera.permission === "denied" || permissions.camera.error?.type === "permission-denied";
  const isMicBlocked = permissions.microphone.permission === "denied" || permissions.microphone.error?.type === "permission-denied";
  const hasPermissionError = isCameraBlocked || isMicBlocked;

  return (
    <div className="p-4">
      {/* Header - Identical to schedule-meeting.tsx */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white h-9 px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {metadata.title || "Meeting Details"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Scheduled for {targetStartTime.toLocaleDateString("en-CA")} at{" "}
              {targetStartTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 px-3 py-1 text-xs">
          Scheduled
        </Badge>
      </div>

      {/* Main Container - Matches schedule-meeting.tsx */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow space-y-6">
        {/* Scheduled Status Banner */}
        <div className="rounded-md bg-blue-50 border border-blue-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-blue-900">
              Online Zoom Meeting
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              This meeting is set to begin at{" "}
              <strong>
                {targetStartTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              . You can start the meeting now as the host or let it connect automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-md border border-blue-100 shrink-0">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                Starts In
              </span>
              <span className="text-xl font-bold font-mono text-blue-600">
                {formattedCountdown}
              </span>
            </div>
          </div>
        </div>

        {/* Meeting Information Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b">
            Meeting Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Customer / Client</span>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-sm text-gray-900">
                  {metadata.leadName || "Johnathan Smith"}
                </span>
              </div>
              {metadata.company && (
                <div className="flex items-center gap-2 text-xs text-gray-600 pt-0.5">
                  <Building className="h-3.5 w-3.5 text-gray-400" />
                  <span>{metadata.company}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-500">Meeting Title</span>
              <p className="font-medium text-sm text-gray-900">
                {metadata.title || "Sales Meeting"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-500">Scheduled Date & Time</span>
              <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  {targetStartTime.toLocaleDateString("en-CA")} at{" "}
                  {targetStartTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-500">Duration</span>
              <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{metadata.durationMinutes || 45} Minutes</span>
              </div>
            </div>

            {metadata.customerEmail && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Email</span>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{metadata.customerEmail}</span>
                </div>
              </div>
            )}

            {metadata.customerPhone && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Phone</span>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{metadata.customerPhone}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audio & Video Pre-Check Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="text-base font-semibold text-gray-900">
              Audio & Video Setup
            </h3>
            <div className="flex items-center gap-2">
              {permissions.camera.permission === "granted" ? (
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[11px] gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Camera Ready
                </Badge>
              ) : isCameraBlocked ? (
                <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 text-[11px] gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-600" /> Camera Blocked
                </Badge>
              ) : (
                <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-[11px]">
                  Camera Prompt
                </Badge>
              )}

              {permissions.microphone.permission === "granted" ? (
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[11px] gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Mic Ready
                </Badge>
              ) : isMicBlocked ? (
                <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 text-[11px] gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-600" /> Mic Blocked
                </Badge>
              ) : (
                <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-[11px]">
                  Mic Prompt
                </Badge>
              )}
            </div>
          </div>

          {/* Actionable Permission Alert if blocked */}
          {hasPermissionError && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-950 text-sm">
                    {isCameraBlocked && isMicBlocked
                      ? "Camera & Microphone Access Blocked"
                      : isCameraBlocked
                      ? "Camera Access Blocked"
                      : "Microphone Access Blocked"}
                  </p>
                  <p className="text-amber-800 leading-relaxed text-xs">
                    Your browser has restricted media permissions for this site.
                    To allow access, click the <strong>lock or camera icon</strong> in your browser&apos;s address bar, select <strong>&quot;Allow&quot;</strong>, then click <strong>Try Again</strong>.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleRetryPermissions}
                className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 shrink-0 h-8 px-3 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-lg bg-gray-50 border border-gray-200">
            {/* Camera Preview Box */}
            <div className="w-full sm:w-60 aspect-video bg-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center shrink-0 shadow-inner">
              {previewVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-center p-3">
                  <VideoOff className="h-6 w-6 text-gray-500" />
                  <span className="text-xs text-gray-400 font-medium">Camera preview off</span>
                </div>
              )}

              {previewVideoOn && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Preview Active</span>
                </div>
              )}
            </div>

            {/* Controls & Device Info */}
            <div className="flex-1 space-y-3.5 w-full">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Equipment Pre-Check
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify your camera and test your microphone before the customer joins.
                </p>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewVideoOn(!previewVideoOn)}
                  className="h-8 px-3 text-xs bg-white text-gray-700"
                >
                  {previewVideoOn ? (
                    <>
                      <Video className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                      <span>Camera On</span>
                    </>
                  ) : (
                    <>
                      <VideoOff className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                      <span>Camera Off</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMuted(!previewMuted)}
                  className="h-8 px-3 text-xs bg-white text-gray-700"
                >
                  {previewMuted ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                      <span>Muted</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                      <span>Microphone Ready</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRetryPermissions}
                  className="h-8 px-2.5 text-xs text-gray-600 hover:text-gray-900"
                  title="Re-check browser hardware permissions"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  <span>Check Devices</span>
                </Button>
              </div>

              {/* Live Microphone Volume Meter */}
              {!previewMuted && (
                <div className="pt-1 flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className={cn("h-4 w-4", audioVolume > 10 ? "text-emerald-600" : "text-gray-400")} />
                    <span className="font-medium text-gray-700">Mic Level:</span>
                  </div>

                  {/* 5-bar responsive meter */}
                  <div className="flex items-center gap-1 h-3.5 bg-gray-200/80 px-1.5 py-0.5 rounded-full">
                    {[1, 2, 3, 4, 5].map((bar) => {
                      const isActive = audioVolume >= bar * 16;
                      return (
                        <span
                          key={bar}
                          className={cn(
                            "w-1.5 h-full rounded-full transition-all duration-75",
                            isActive ? "bg-emerald-500" : "bg-gray-300"
                          )}
                        />
                      );
                    })}
                  </div>

                  <span className="text-[11px] text-gray-500">
                    {audioVolume > 15 ? (
                      <span className="text-emerald-600 font-medium">Sound detected</span>
                    ) : (
                      "Speak to test"
                    )}
                  </span>
                </div>
              )}

              {/* Detected Device Names */}
              <div className="text-[11px] text-gray-500 space-y-0.5 pt-1">
                {permissions.camera.deviceLabel && (
                  <div>
                    <span className="font-medium text-gray-600">Camera:</span>{" "}
                    {permissions.camera.deviceLabel}
                  </div>
                )}
                {permissions.microphone.deviceLabel && (
                  <div>
                    <span className="font-medium text-gray-600">Mic:</span>{" "}
                    {permissions.microphone.deviceLabel}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Identical to schedule-meeting.tsx */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onExit}
            className="w-full sm:w-auto px-6 h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onStartMeeting({ videoOn: previewVideoOn, isMuted: previewMuted })}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-6 h-9 font-medium"
          >
            Start Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};
