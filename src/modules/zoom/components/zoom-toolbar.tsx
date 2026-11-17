import type React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Square,
  Users,
  MessageSquare,
  ShieldCheck,
  Disc,
  PhoneOff,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ZoomToolbarProps {
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  participantCount: number;
  unreadChatCount: number;
  activeSidebarTab: "crm" | "chat" | "participants" | null;
  isFullscreen: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleSidebarTab: (tab: "crm" | "chat" | "participants") => void;
  onToggleFullscreen: () => void;
  onEndMeeting: () => void;
}

export const ZoomToolbar: React.FC<ZoomToolbarProps> = ({
  isMuted,
  isVideoOn,
  isScreenSharing,
  isRecording,
  participantCount,
  unreadChatCount,
  activeSidebarTab,
  isFullscreen,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleSidebarTab,
  onToggleFullscreen,
  onEndMeeting,
}) => {
  return (
    <div className="bg-[#1A1A1A] text-white px-4 py-2.5 flex items-center justify-between border-t border-gray-800 select-none shadow-2xl">
      {/* Left group: Audio & Video controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onToggleMute}
          className={cn(
            "flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs transition-colors",
            isMuted
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "hover:bg-white/10 text-gray-200",
          )}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-emerald-400" />}
          <span className="text-[10px] mt-1 font-medium">{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button
          type="button"
          onClick={onToggleVideo}
          className={cn(
            "flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs transition-colors",
            !isVideoOn
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "hover:bg-white/10 text-gray-200",
          )}
          title={isVideoOn ? "Stop Video" : "Start Video"}
        >
          {isVideoOn ? <Video className="h-5 w-5 text-emerald-400" /> : <VideoOff className="h-5 w-5" />}
          <span className="text-[10px] mt-1 font-medium">{isVideoOn ? "Stop Video" : "Start Video"}</span>
        </button>
      </div>

      {/* Middle group: Meeting controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Security badge */}
        <div className="hidden md:flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs text-gray-400 hover:bg-white/5">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span className="text-[10px] mt-1">Secured</span>
        </div>

        {/* Participants */}
        <button
          type="button"
          onClick={() => onToggleSidebarTab("participants")}
          className={cn(
            "relative flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs transition-colors",
            activeSidebarTab === "participants"
              ? "bg-blue-600/30 text-blue-400"
              : "hover:bg-white/10 text-gray-200",
          )}
          title="View Participants"
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] mt-1">People</span>
          <span className="absolute top-1 right-2 bg-gray-700 text-gray-200 text-[9px] font-bold px-1 rounded-full">
            {participantCount}
          </span>
        </button>

        {/* Chat */}
        <button
          type="button"
          onClick={() => onToggleSidebarTab("chat")}
          className={cn(
            "relative flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs transition-colors",
            activeSidebarTab === "chat"
              ? "bg-blue-600/30 text-blue-400"
              : "hover:bg-white/10 text-gray-200",
          )}
          title="In-meeting Chat"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px] mt-1">Chat</span>
          {unreadChatCount > 0 && (
            <span className="absolute top-1 right-2 bg-blue-500 text-white text-[9px] font-bold px-1 rounded-full animate-pulse">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Screen Share */}
        <button
          type="button"
          onClick={onToggleScreenShare}
          className={cn(
            "flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs transition-colors",
            isScreenSharing
              ? "bg-emerald-600/30 text-emerald-400"
              : "hover:bg-white/10 text-emerald-400",
          )}
          title={isScreenSharing ? "Stop Sharing" : "Share Your Screen"}
        >
          {isScreenSharing ? <Square className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
          <span className="text-[10px] mt-1 font-medium">
            {isScreenSharing ? "Stop Share" : "Share"}
          </span>
        </button>

        {/* Recording */}
        <button
          type="button"
          onClick={onToggleRecording}
          className="hidden sm:flex flex-col items-center justify-center w-14 h-12 rounded-lg text-xs hover:bg-white/10 text-gray-200 transition-colors"
          title={isRecording ? "Pause Cloud Recording" : "Start Cloud Recording"}
        >
          <Disc className={cn("h-5 w-5", isRecording ? "text-red-500 animate-spin" : "text-gray-400")} />
          <span className="text-[10px] mt-1">{isRecording ? "Recording" : "Record"}</span>
        </button>

        {/* CRM Context Toggle */}
        <button
          type="button"
          onClick={() => onToggleSidebarTab("crm")}
          className={cn(
            "flex flex-col items-center justify-center px-2 h-12 rounded-lg text-xs transition-colors",
            activeSidebarTab === "crm"
              ? "bg-blue-600 text-white font-medium"
              : "bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60",
          )}
          title="Toggle CRM Notes & Lead Intelligence"
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] mt-1">CRM Panel</span>
        </button>
      </div>

      {/* Right group: Fullscreen & End Call */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="hidden md:flex p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onEndMeeting}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 h-9 shadow-md flex items-center gap-1.5"
        >
          <PhoneOff className="h-4 w-4" />
          <span>End</span>
        </Button>
      </div>
    </div>
  );
};
