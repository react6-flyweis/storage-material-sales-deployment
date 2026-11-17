import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeft, Loader2, Video, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useZoomSessionQuery,
  useSaveZoomOutcomeMutation,
  initZoomMeetingClient,
  type ZoomEmbeddedClient,
  ZoomVideoScreen,
  ZoomToolbar,
  ZoomCrmSidebar,
  ZoomOutcomeModal,
  ZoomScheduledLobby,
  useMediaPermissions,
  type ZoomParticipant,
  type ZoomChatMessage,
  type ZoomMeetingOutcomePayload,
} from "@/modules/zoom";
import { toast } from "sonner";

export default function ZoomMeetingRoom() {
  const { id = "demo" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passedMeeting = location.state?.meeting;
  const isDirectJoin = new URLSearchParams(location.search).get("join") === "now";

  // Pre-meeting lobby state
  const [hasCallStarted, setHasCallStarted] = useState(isDirectJoin);

  const { data: sessionData, isLoading, error } = useZoomSessionQuery(id);
  const saveOutcomeMutation = useSaveZoomOutcomeMutation();

  const targetStartTime = useMemo(() => {
    if (passedMeeting?.meetingTime) {
      const parsed = new Date(passedMeeting.meetingTime);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date(Date.now() + 15 * 60 * 1000);
  }, [passedMeeting]);

  const clientName =
    passedMeeting?.organizer ||
    (typeof passedMeeting?.customerId === "object"
      ? passedMeeting?.customerId?.firstName || passedMeeting?.customerId?.customerId
      : "") ||
    sessionData?.metadata?.leadName ||
    "Johnathan Smith";

  const clientCompany =
    (typeof passedMeeting?.customerId === "object"
      ? passedMeeting?.customerId?.firstName
      : "") ||
    sessionData?.metadata?.company ||
    "Apex Warehousing & Construction Ltd.";

  const mergedMetadata = useMemo(() => {
    if (!sessionData?.metadata) return null;
    return {
      ...sessionData.metadata,
      title: passedMeeting?.title || sessionData.metadata.title,
      leadName: clientName,
      company: clientCompany,
      durationMinutes: passedMeeting?.duration
        ? Number(passedMeeting.duration)
        : sessionData.metadata.durationMinutes,
      notes: passedMeeting?.notes || sessionData.metadata.notes,
      scheduledStartTime: targetStartTime.toISOString(),
    };
  }, [sessionData, passedMeeting, clientName, clientCompany, targetStartTime]);

  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Streams & permissions
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [showPermissionBanner, setShowPermissionBanner] = useState(true);

  const {
    permissions,
    refreshDevices,
    requestCamera,
    requestMicrophone,
  } = useMediaPermissions();

  // Layout & CRM states
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "crm" | "chat" | "participants" | null
  >("crm");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);

  // Participants
  const [participants, setParticipants] = useState<ZoomParticipant[]>([
    {
      id: "host-1",
      name: "You (Sales Rep)",
      role: "host",
      isMuted: false,
      isVideoOn: false,
      isScreenSharing: false,
      company: "Steel Sales Panel",
    },
    {
      id: "client-1",
      name: clientName,
      role: "participant",
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: false,
      company: clientCompany,
    },
  ]);

  // Update participant name if clientName changes
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.role === "participant"
          ? { ...p, name: clientName, company: clientCompany }
          : p,
      ),
    );
  }, [clientName, clientCompany]);

  // Chat
  const [chatMessages, setChatMessages] = useState<ZoomChatMessage[]>([
    {
      id: "msg-1",
      senderId: "client-1",
      senderName: clientName,
      senderRole: "participant",
      message:
        "Hello! We have the team on our side ready to discuss the project specifications.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const zoomRootRef = useRef<HTMLDivElement>(null);

  // Initialize official Zoom Web Meeting SDK when call connects
  useEffect(() => {
    if (!hasCallStarted || !sessionData?.config) return;

    let zoomClient: ZoomEmbeddedClient | null = null;
    const targetRoot =
      zoomRootRef.current || document.getElementById("zmmtg-root");

    if (targetRoot) {
      initZoomMeetingClient(
        targetRoot,
        sessionData.config,
        () => setOutcomeModalOpen(true),
      ).then((client) => {
        zoomClient = client;
      });
    }

    return () => {
      if (zoomClient) {
        zoomClient.leaveMeeting().catch(() => {});
      }
    };
  }, [hasCallStarted, sessionData]);

  // Initialize notes once metadata is ready
  useEffect(() => {
    if (sessionData?.metadata?.notes && !notes) {
      setNotes(sessionData.metadata.notes);
    }
  }, [sessionData, notes]);

  // Meeting duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera toggle handler with permission diagnostics
  const handleToggleVideo = async () => {
    if (isVideoOn) {
      // Turn off
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => track.stop());
      }
      setLocalStream(null);
      setIsVideoOn(false);
      setParticipants((prev) =>
        prev.map((p) => (p.role === "host" ? { ...p, isVideoOn: false } : p)),
      );
    } else {
      // Turn on
      const { stream, error } = await requestCamera();
      if (stream) {
        setLocalStream(stream);
        setIsVideoOn(true);
        setParticipants((prev) =>
          prev.map((p) => (p.role === "host" ? { ...p, isVideoOn: true } : p)),
        );
      } else if (error) {
        if (error.type === "permission-denied") {
          toast.error(
            "Camera blocked: Click the lock icon in your browser address bar to allow camera access, then try again.",
          );
        } else if (error.type === "in-use") {
          toast.error(
            "Camera in use: Another application is using your camera. Please close it and retry.",
          );
        } else if (error.type === "not-found") {
          toast.error("No camera found on this device.");
        } else {
          toast.error(error.message);
        }
      }
    }
  };

  // Microphone toggle handler with permission diagnostics
  const handleToggleMute = async () => {
    if (!isMuted) {
      // Currently active -> Mute
      if (audioStream) {
        audioStream.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      setIsMuted(true);
      setParticipants((pList) =>
        pList.map((p) => (p.role === "host" ? { ...p, isMuted: true } : p)),
      );
    } else {
      // Currently muted -> Unmute
      if (audioStream && audioStream.getAudioTracks().length > 0) {
        audioStream.getAudioTracks().forEach((t) => (t.enabled = true));
        setIsMuted(false);
        setParticipants((pList) =>
          pList.map((p) => (p.role === "host" ? { ...p, isMuted: false } : p)),
        );
      } else {
        const { stream, error } = await requestMicrophone();
        if (stream) {
          setAudioStream(stream);
          setIsMuted(false);
          setParticipants((pList) =>
            pList.map((p) => (p.role === "host" ? { ...p, isMuted: false } : p)),
          );
        } else if (error) {
          if (error.type === "permission-denied") {
            toast.error(
              "Microphone blocked: Click the lock icon in your browser address bar to allow microphone access.",
            );
          } else if (error.type === "not-found") {
            toast.error("No microphone found on this device.");
          } else {
            toast.error(error.message);
          }
        }
      }
    }
  };

  // Start call from lobby, preserving pre-check equipment selections
  const handleStartCallFromLobby = async (options?: {
    videoOn: boolean;
    isMuted: boolean;
  }) => {
    setHasCallStarted(true);

    if (options) {
      setIsMuted(options.isMuted);
      if (options.videoOn) {
        const { stream } = await requestCamera();
        if (stream) {
          setLocalStream(stream);
          setIsVideoOn(true);
          setParticipants((prev) =>
            prev.map((p) => (p.role === "host" ? { ...p, isVideoOn: true } : p)),
          );
        }
      }
      if (!options.isMuted) {
        const { stream } = await requestMicrophone();
        if (stream) {
          setAudioStream(stream);
          setParticipants((prev) =>
            prev.map((p) => (p.role === "host" ? { ...p, isMuted: false } : p)),
          );
        }
      }
    }
  };

  // Screen share toggle handler
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices?.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          setScreenStream(stream);
          setIsScreenSharing(true);

          stream.getVideoTracks()[0].onended = () => {
            setScreenStream(null);
            setIsScreenSharing(false);
          };
        } else {
          // Fallback simulation
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.warn("Screen share canceled", err);
        // Fallback simulation so user can still demo the UI
        setIsScreenSharing(true);
      }
    }
  };

  // Clean up all tracks on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [localStream, audioStream, screenStream]);

  // Sidebar toggle
  const handleToggleSidebarTab = (tab: "crm" | "chat" | "participants") => {
    setActiveSidebarTab((curr) => {
      if (curr === tab) return null;
      if (tab === "chat") setUnreadChatCount(0);
      return tab;
    });
  };

  // Send message
  const handleSendMessage = (msg: string) => {
    const newMsg: ZoomChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "host-1",
      senderName: "You",
      senderRole: "host",
      message: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated client response after 3 seconds for demo immersion
    setTimeout(() => {
      const replyMsg: ZoomChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: "client-1",
        senderName: "Johnathan Smith",
        senderRole: "participant",
        message: "Understood! Could you also email us the freight calculation sheet?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, replyMsg]);
      if (activeSidebarTab !== "chat") {
        setUnreadChatCount((c) => c + 1);
      }
    }, 2500);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Outcome submission
  const handleSaveOutcome = async (payload: ZoomMeetingOutcomePayload) => {
    try {
      await saveOutcomeMutation.mutateAsync(payload);
      toast.success("Meeting outcome and notes saved to CRM!");
      setOutcomeModalOpen(false);
      navigate("/meetings");
    } catch {
      toast.error("Failed to save outcome");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-600">Connecting to Zoom Meeting Room...</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Unable to load Zoom Room</h2>
        <p className="text-sm text-gray-600">
          We could not establish a connection to this meeting session.
        </p>
        <Button onClick={() => navigate("/meetings")} className="bg-blue-600 text-white">
          Return to Meetings
        </Button>
      </div>
    );
  }

  const { config } = sessionData;
  const metadata = mergedMetadata || sessionData.metadata;

  if (!hasCallStarted) {
    return (
      <ZoomScheduledLobby
        metadata={metadata}
        targetStartTime={targetStartTime}
        onStartMeeting={handleStartCallFromLobby}
        onExit={() => navigate("/meetings")}
      />
    );
  }

  const isCameraBlocked =
    permissions.camera.permission === "denied" ||
    permissions.camera.error?.type === "permission-denied";
  const isMicBlocked =
    permissions.microphone.permission === "denied" ||
    permissions.microphone.error?.type === "permission-denied";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F0F10] text-gray-900 overflow-hidden">
      {/* Top Header Navigation - Matches the app's clean white navigation */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-20 shrink-0 text-gray-900 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOutcomeModalOpen(true)}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 h-8 px-2.5"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Leave</span>
          </Button>
          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Video className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md text-gray-900">
              {metadata.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500 hidden md:inline">
            Client: <strong className="text-gray-800">{metadata.leadName}</strong> ({metadata.company})
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
            Live Meeting
          </span>
        </div>
      </header>

      {/* Permissions alert bar if camera or microphone is restricted */}
      {showPermissionBanner && (isCameraBlocked || isMicBlocked) && (
        <div className="bg-amber-900/90 border-b border-amber-700/60 px-4 py-2 flex items-center justify-between text-xs text-amber-100 z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-300 shrink-0" />
            <span>
              {isCameraBlocked && isMicBlocked
                ? "Camera and microphone access are blocked by your browser settings. Click the lock icon in your URL address bar to allow them."
                : isCameraBlocked
                ? "Camera access is blocked by your browser. Click the lock icon in your URL address bar to allow camera access."
                : "Microphone access is blocked by your browser. Click the lock icon in your URL address bar to allow microphone access."}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => refreshDevices()}
              className="text-amber-200 underline hover:text-white font-medium"
            >
              Recheck
            </button>
            <button
              type="button"
              onClick={() => setShowPermissionBanner(false)}
              className="text-amber-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace: Left Video Viewport + Right CRM Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <ZoomVideoScreen
          topic={config.topic || metadata.title}
          meetingNumber={config.meetingNumber}
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          isScreenSharing={isScreenSharing}
          isRecording={isRecording}
          durationSeconds={durationSeconds}
          participants={participants}
          screenStream={screenStream}
          localStream={localStream}
        />

        {/* Collapsible CRM / Chat / Participants Side Panel */}
        {activeSidebarTab && (
          <ZoomCrmSidebar
            activeTab={activeSidebarTab}
            metadata={metadata}
            participants={participants}
            chatMessages={chatMessages}
            notes={notes}
            onNotesChange={setNotes}
            onSendMessage={handleSendMessage}
            onClose={() => setActiveSidebarTab(null)}
          />
        )}
      </div>

      {/* Bottom Zoom Toolbar */}
      <ZoomToolbar
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        participantCount={participants.length}
        unreadChatCount={unreadChatCount}
        activeSidebarTab={activeSidebarTab}
        isFullscreen={isFullscreen}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleRecording={() => setIsRecording((prev) => !prev)}
        onToggleSidebarTab={handleToggleSidebarTab}
        onToggleFullscreen={handleToggleFullscreen}
        onEndMeeting={() => setOutcomeModalOpen(true)}
      />

      {/* Meeting Outcome Dialog (Prompted on End / Leave) */}
      <ZoomOutcomeModal
        open={outcomeModalOpen}
        meetingId={metadata.meetingId}
        leadId={metadata.leadId}
        meetingTitle={metadata.title}
        clientName={metadata.leadName}
        durationMinutes={Math.max(1, Math.round(durationSeconds / 60))}
        initialNotes={notes}
        isSaving={saveOutcomeMutation.isPending}
        onSaveOutcome={handleSaveOutcome}
        onDiscard={() => {
          setOutcomeModalOpen(false);
          navigate("/meetings");
        }}
      />
    </div>
  );
}
