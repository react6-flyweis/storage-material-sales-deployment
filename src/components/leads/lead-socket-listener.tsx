import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/auth.store";
import { createAdminSocket, type Socket } from "@/lib/socket";
import { LEAD_NO_NAME } from "@/modules/leads/leads.utils";
import LeadAssignedDialog from "./lead-assigned-dialog";

interface CustomerId {
  _id: string;
  firstName: string;
  email: string;
  name?: string;
}

interface LeadScoring {
  score: number;
}

interface LeadDetails {
  _id: string;
  projectName?: string;
  customerId?: CustomerId | null;
  lifecycleStatus?: string;
  quoteValue?: number;
  leadScoring?: LeadScoring;
  buildingType?: string;
  location?: string;
  isRaisedToPO?: boolean;
  nextFollowUp?: string | null;
  jobId?: string;
  projectId?: string;
}

interface LeadListSocketPayload {
  leadId: string;
  lead: LeadDetails;
  scoreRow?: Record<string, unknown> | null;
  meta: {
    action: "created" | "updated";
    trigger: string;
  };
}

export function LeadSocketListener() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const socketRef = useRef<Socket | null>(null);

  // State for creation / assignment dialog
  const [assignedLead, setAssignedLead] = useState<LeadListSocketPayload | null>(null);

  // Request notification permission initially
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Set up socket listener
  useEffect(() => {
    if (!accessToken) return;

    // Connect to /admin namespace using websocket transport
    const socket = createAdminSocket(accessToken);
    if (!socket) return;

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to /admin socket namespace for Lead List events");
    });

    const handleLeadCreated = (payload: LeadListSocketPayload) => {
      console.log("Socket: lead_list_created event received", payload);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (payload.leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", payload.leadId] });
      }

      // Extract project name as lead name
      const projectName = payload.lead?.projectName || LEAD_NO_NAME;
      const triggerInfo = payload.meta.trigger ? ` (via ${payload.meta.trigger})` : "";

      if (document.visibilityState !== "visible") {
        // Tab is inactive - fire browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("New Lead Created", {
            body: `Lead for ${projectName} has been created${triggerInfo}. Click to view.`,
            icon: "/favicon.ico"
          });
          notification.onclick = () => {
            window.focus();
            if (payload.leadId) {
              navigate(`/leads/${payload.leadId}`);
            }
            notification.close();
          };
        }
      } else {
        // Tab is active - show dialog
        setAssignedLead(payload);
      }
    };

    const handleLeadUpdated = (payload: LeadListSocketPayload) => {
      console.log("Socket: lead_list_updated event received", payload);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (payload.leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", payload.leadId] });
      }

      // If meta action is updated and trigger is assigned, treat it as a new lead assignment
      if (payload.meta.trigger === "assigned") {
        const projectName = payload.lead?.projectName || "New Lead";

        if (document.visibilityState !== "visible") {
          // Tab is inactive - fire browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("New Lead Assigned", {
              body: `Lead for ${projectName} has been assigned to you. Click to view.`,
              icon: "/favicon.ico"
            });
            notification.onclick = () => {
              window.focus();
              if (payload.leadId) {
                navigate(`/leads/${payload.leadId}`);
              }
              notification.close();
            };
          }
        } else {
          // Tab is active - show dialog
          setAssignedLead(payload);
        }
      }
    };

    socket.on("lead_list_created", handleLeadCreated);
    socket.on("lead_list_updated", handleLeadUpdated);

    return () => {
      socket.off("lead_list_created", handleLeadCreated);
      socket.off("lead_list_updated", handleLeadUpdated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, queryClient, navigate]);

  // Navigate to created lead details and close dialog




  if (!assignedLead) return null;

  return (
    <LeadAssignedDialog
      open={!!assignedLead}
      onClose={() => setAssignedLead(null)}
      leadPayload={assignedLead}
      onViewDetails={() => {
        if (assignedLead.leadId) {
          navigate(`/leads/${assignedLead.leadId}`);
        }
        setAssignedLead(null);
      }}
    />
  );
}
