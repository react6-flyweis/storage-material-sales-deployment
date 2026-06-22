import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/auth.store";
import { createAdminSocket, type Socket } from "@/lib/socket";
import { getLeadProjectName } from "@/modules/leads/leads.utils";
import LeadAssignedDialog from "./lead-assigned-dialog";
import FollowUpReminderDialog from "./follow-up-reminder-dialog";

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

interface FollowUpReminderPayload {
  _id: string;
  type: string;
  followUpId: string;
  leadId: string;
  followUpDate: string;
  modeOfContact: string;
  message: string;
}

export function LeadSocketListener() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const socketRef = useRef<Socket | null>(null);

  // State for creation / assignment dialog
  const [assignedLead, setAssignedLead] = useState<LeadListSocketPayload | null>(null);

  // State for follow-up reminder dialog
  const [activeReminder, setActiveReminder] = useState<FollowUpReminderPayload | null>(null);

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
      socket.emit("join_user_room");
    });

    const handleLeadCreated = (payload: LeadListSocketPayload) => {
      console.log("Socket: lead_list_created event received", payload);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (payload.leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", payload.leadId] });
      }

      // Extract project name as lead name
      const projectName = getLeadProjectName(payload.lead);
      const isAssigned = payload.meta.trigger === "admin_create_lead" || payload.meta.trigger === "assigned";

      if (document.visibilityState !== "visible") {
        // Tab is inactive - fire browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const title = isAssigned ? "New Lead Assigned" : "New Lead Created";
          const triggerInfo = payload.meta.trigger ? ` (via ${payload.meta.trigger})` : "";
          const body = isAssigned
            ? `Lead for ${projectName} has been assigned to you. Click to view.`
            : `Lead for ${projectName} has been created${triggerInfo}. Click to view.`;

          const notification = new Notification(title, {
            body,
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
      if (payload.meta.trigger === "assigned" || payload.meta.trigger === "admin_create_lead") {
        const projectName = getLeadProjectName(payload.lead);

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

    const handleFollowUpReminder = (data: FollowUpReminderPayload) => {
      console.log("Reminder:", data);

      const contactMode = data.modeOfContact
        ? ` (${data.modeOfContact.charAt(0).toUpperCase() + data.modeOfContact.slice(1)})`
        : "";
      const title = `Follow-up Reminder${contactMode}`;
      const message = data.message || "You have a scheduled follow-up task now.";
      const leadId = data.leadId;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", leadId] });
      }

      if (document.visibilityState !== "visible") {
        // Tab is inactive - fire browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification(title, {
            body: message,
            icon: "/favicon.ico"
          });
          notification.onclick = () => {
            window.focus();
            if (leadId) {
              navigate(`/leads/${leadId}`);
            }
            notification.close();
          };
        }
      } else {
        // Tab is active - show dialog
        setActiveReminder(data);
      }
    };

    const handleCustomerOnlineStatus = (payload: {
      customerId: string;
      leadId: string;
      isOnline: boolean;
      scope: "lead" | "customer";
      lastSeenAt: string;
      customerIsOnline: boolean;
      leadIsOnline: boolean;
    }) => {
      console.log("Socket: customer_online_status event received", payload);
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
    };

    socket.on("lead_list_created", handleLeadCreated);
    socket.on("lead_list_updated", handleLeadUpdated);
    socket.on("followup:reminder", handleFollowUpReminder);
    socket.on("customer_online_status", handleCustomerOnlineStatus);

    return () => {
      socket.off("lead_list_created", handleLeadCreated);
      socket.off("lead_list_updated", handleLeadUpdated);
      socket.off("followup:reminder", handleFollowUpReminder);
      socket.off("customer_online_status", handleCustomerOnlineStatus);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, queryClient, navigate]);

  // Navigate to created lead details and close dialog




  return (
    <>
      {assignedLead && (
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
      )}

      {activeReminder && (
        <FollowUpReminderDialog
          open={!!activeReminder}
          onClose={() => setActiveReminder(null)}
          reminderData={activeReminder}
          onViewDetails={() => {
            if (activeReminder.leadId) {
              navigate(`/leads/${activeReminder.leadId}`);
            }
            setActiveReminder(null);
          }}
        />
      )}
    </>
  );
}
