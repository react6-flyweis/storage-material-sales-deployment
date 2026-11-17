import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  VideoOff,
  LayoutGrid,
  SquareUser,
  ShieldCheck,
  Disc,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ZoomParticipant } from "../zoom.types";

interface ZoomVideoScreenProps {
  topic: string;
  meetingNumber: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  durationSeconds: number;
  participants: ZoomParticipant[];
  screenStream: MediaStream | null;
  localStream: MediaStream | null;
}

export const ZoomVideoScreen: React.FC<ZoomVideoScreenProps> = ({
  topic,
  meetingNumber,
  isMuted,
  isVideoOn,
  isScreenSharing,
  isRecording,
  durationSeconds,
  participants,
  screenStream,
  localStream,
}) => {
  const [viewMode, setViewMode] = useState<"gallery" | "speaker">("gallery");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Attach local camera stream to video element
  useEffect(() => {
    if (localVideoRef.current) {
      if (isVideoOn && localStream) {
        localVideoRef.current.srcObject = localStream;
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [isVideoOn, localStream]);

  // Attach screen share stream to screen video element
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const remoteParticipant = participants.find((p) => p.role !== "host") || participants[0];

  return (
    <div className="relative flex-1 bg-[#0F0F10] flex flex-col overflow-hidden select-none">
      {/* Top Overlay Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-xs text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium truncate max-w-[220px] sm:max-w-md">{topic}</span>
            <span className="text-gray-400">| ID: {meetingNumber}</span>
          </div>

          {isRecording && (
            <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded-full text-[11px] text-red-200">
              <Disc className="h-3 w-3 text-red-500 animate-pulse" />
              <span>REC {formatTime(durationSeconds)}</span>
            </div>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-md border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode("gallery")}
            className={cn(
              "px-2 py-1 rounded text-xs flex items-center gap-1 text-gray-300 transition-colors",
              viewMode === "gallery" ? "bg-white/20 text-white font-medium" : "hover:bg-white/10",
            )}
            title="Gallery View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("speaker")}
            className={cn(
              "px-2 py-1 rounded text-xs flex items-center gap-1 text-gray-300 transition-colors",
              viewMode === "speaker" ? "bg-white/20 text-white font-medium" : "hover:bg-white/10",
            )}
            title="Speaker View"
          >
            <SquareUser className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Speaker</span>
          </button>
        </div>
      </div>

      {/* Zoom SDK Embedded Root Mount */}
      <div id="zmmtg-root" className="absolute inset-0 pointer-events-none [&>*]:pointer-events-auto" />

      {/* Main Video Viewport */}
      <div className="flex-1 p-3 pt-14 pb-2 flex items-center justify-center">
        {/* Scenario 1: Screen Share is active */}
        {isScreenSharing ? (
          <div className="w-full h-full flex flex-col gap-3">
            {/* Main Shared Screen Presentation */}
            <div className="flex-1 bg-[#1A1A1E] rounded-xl overflow-hidden border border-gray-800 relative flex items-center justify-center">
              {screenStream ? (
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Simulated Presentation / Steel Blueprint / Quote Preview */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-indigo-950">
                  <div className="p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30 mb-4 animate-pulse">
                    <FileSpreadsheet className="h-16 w-16 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Sharing: PEMB Quotation #QT-2026-4920.pdf
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md">
                    Showing structural beam specifications, grade S355 steel sizing, and site delivery phase timeline.
                  </p>
                  <div className="mt-4 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30">
                    Live Broadcast to Participants Active
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-xs text-white border border-white/10">
                You are screen sharing
              </div>
            </div>

            {/* Floating Top Participant Strip */}
            <div className="h-28 flex items-center gap-3 overflow-x-auto py-1">
              {/* Local rep tile */}
              <div className="w-44 h-full rounded-lg bg-[#222228] relative overflow-hidden border border-gray-700/60 shrink-0">
                {isVideoOn && localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-gray-900 to-gray-800">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      ME
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-[10px] text-white flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded">
                  <span>You (Host)</span>
                  {isMuted ? <MicOff className="h-2.5 w-2.5 text-red-400" /> : <Mic className="h-2.5 w-2.5 text-emerald-400" />}
                </div>
              </div>

              {/* Remote client tile */}
              <div className="w-44 h-full rounded-lg bg-[#222228] relative overflow-hidden border border-gray-700/60 shrink-0">
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                    {remoteParticipant?.name?.slice(0, 2).toUpperCase() || "JS"}
                  </div>
                  <span className="text-[10px] text-gray-300 mt-1 truncate max-w-[120px]">
                    {remoteParticipant?.name || "Client"}
                  </span>
                </div>
                <div className="absolute bottom-1 left-2 text-[10px] text-white flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded">
                  <span>Client</span>
                  <Mic className="h-2.5 w-2.5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Scenario 2: Standard Camera Grid (Gallery or Speaker) */
          <div
            className={cn(
              "w-full h-full grid gap-4 items-center justify-center max-w-6xl",
              viewMode === "gallery" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
            )}
          >
            {/* Tile 1: Remote Customer Tile */}
            <div className="relative w-full h-full min-h-[220px] max-h-[520px] bg-[#18181D] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl flex items-center justify-center group">
              {/* Animated Speaking / Activity Ring */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs text-white border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-medium">{remoteParticipant?.name || "Johnathan Smith"}</span>
                <span className="text-gray-400 text-[10px]">
                  ({remoteParticipant?.company || "Apex Warehousing"})
                </span>
              </div>

              {/* Remote client video mockup with avatar */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-lg border-4 border-white/10">
                  {remoteParticipant?.name?.slice(0, 2).toUpperCase() || "JS"}
                </div>
                <div className="mt-4 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full text-xs text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Speaking • High Quality Audio</span>
                </div>
              </div>

              {/* Bottom controls badge */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs text-gray-300 flex items-center gap-1.5 border border-white/10">
                <Mic className="h-3.5 w-3.5 text-emerald-400" />
                <span>Connected</span>
              </div>
            </div>

            {/* Tile 2: Local Sales Rep Tile */}
            <div className="relative w-full h-full min-h-[220px] max-h-[520px] bg-[#18181D] rounded-2xl overflow-hidden border border-gray-800 shadow-xl flex items-center justify-center">
              {/* Local camera feed or avatar fallback */}
              {isVideoOn && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-lg border-4 border-white/10">
                    ME
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full text-xs text-gray-400">
                    <VideoOff className="h-3.5 w-3.5 text-red-400" />
                    <span>Camera is turned off</span>
                  </div>
                </div>
              )}

              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs text-white border border-white/10 flex items-center gap-1.5">
                <span className="font-medium">You (Sales Host)</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs text-white flex items-center gap-1.5 border border-white/10">
                {isMuted ? (
                  <>
                    <MicOff className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-red-300">Muted</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Unmuted</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
