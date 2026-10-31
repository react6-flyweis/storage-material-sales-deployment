import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/useSocket";
import { getLeadProjectName } from "@/modules/leads/leads.utils";
import { toast } from "sonner";
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
  const { socket } = useSocket();

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
    if (!socket) return;

    const handleLeadCreated = (payload: LeadListSocketPayload) => {
      console.log("Socket: lead_list_created event received", payload);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["sales", "leads"] });
      if (payload.leadId) {
        queryClient.invalidateQueries({ queryKey: ["sales", "leads", "detail", payload.leadId] });
      }

      // Extract project name as lead name
      const projectName = getLeadProjectName(payload.lead);
      const isAssigned = payload.meta?.trigger === "admin_create_lead" || payload.meta?.trigger === "assigned";

      if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
        // Tab is inactive AND we have notification permission - fire browser notification
        const title = isAssigned ? "New Lead Assigned" : "New Lead Created";
        const triggerInfo = payload.meta?.trigger ? ` (via ${payload.meta.trigger})` : "";
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
      } else {
        // Tab is active OR notification permission is not granted - show dialog
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

      const trigger = (payload as { trigger?: string })?.trigger || payload.meta?.trigger;
      if (trigger === "customer_message") {
        queryClient.invalidateQueries({ queryKey: ["customer-direct-chat"] });
      }

      // If meta action is updated and trigger is assigned, treat it as a new lead assignment
      if (payload.meta?.trigger === "assigned" || payload.meta?.trigger === "admin_create_lead") {
        const projectName = getLeadProjectName(payload.lead);

        if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
          // Tab is inactive AND we have notification permission - fire browser notification
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
        } else {
          // Tab is active OR notification permission is not granted - show dialog
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

      if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
        // Tab is inactive AND we have notification permission - fire browser notification
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
      } else {
        // Tab is active OR notification permission is not granted - show dialog
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

    const handleNewCustomerMessage = (payload: {
      leadId?: string;
      message?: {
        _id?: string;
        senderType?: string;
        content?: string;
        createdAt?: string;
        leadId?: string;
        channel?: string;
        senderName?: string;
        customerId?: string;
      };
    }) => {
      console.log("Socket: new_customer_message event received", payload);
      const msg = payload.message;
      if (!msg || msg.senderType !== "customer") return;

      const sender = msg.senderName || "Customer";
      const preview = msg.content
        ? msg.content.length > 60
          ? `${msg.content.slice(0, 60)}...`
          : msg.content
        : "New message received";
      const targetLeadId = payload.leadId || msg.leadId;

      if (
        document.visibilityState !== "visible" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const notification = new Notification(`New message from ${sender}`, {
          body: preview,
          icon: "/favicon.ico",
        });
        notification.onclick = () => {
          window.focus();
          if (targetLeadId) {
            navigate(`/leads/${targetLeadId}`);
          } else if (msg.customerId) {
            navigate(`/communication?customerId=${msg.customerId}`);
          } else {
            navigate("/communication");
          }
          notification.close();
        };
      } else {
        toast.info(`New customer message from ${sender}`, {
          description: preview,
          action: {
            label: "View Chat",
            onClick: () => {
              if (msg.customerId) {
                navigate(`/communication?customerId=${msg.customerId}`);
              } else if (targetLeadId) {
                navigate(`/leads/${targetLeadId}`);
              } else {
                navigate("/communication");
              }
            },
          },
        });
      }
    };

    const handleCustomerDirectMessage = (msg: {
      customerId?: string;
      senderType?: string;
      senderName?: string;
      content?: string;
    }) => {
      console.log("Socket: customer_direct_message event received", msg);
      if (msg.senderType !== "customer") return;

      // Avoid toast if user is already actively viewing this customer thread
      const currentUrl = window.location.pathname + window.location.search;
      if (
        currentUrl.includes("/communication") &&
        msg.customerId &&
        currentUrl.includes(msg.customerId)
      ) {
        return;
      }

      const sender = msg.senderName || "Customer";
      const preview = msg.content
        ? msg.content.length > 60
          ? `${msg.content.slice(0, 60)}...`
          : msg.content
        : "New direct message received";

      if (
        document.visibilityState !== "visible" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const notification = new Notification(`New message from ${sender}`, {
          body: preview,
          icon: "/favicon.ico",
        });
        notification.onclick = () => {
          window.focus();
          navigate(
            msg.customerId
              ? `/communication?customerId=${msg.customerId}`
              : "/communication"
          );
          notification.close();
        };
      } else {
        toast.info(`New message from ${sender}`, {
          description: preview,
          action: {
            label: "View Chat",
            onClick: () => {
              navigate(
                msg.customerId
                  ? `/communication?customerId=${msg.customerId}`
                  : "/communication"
              );
            },
          },
        });
      }
    };

    socket.on("lead_list_created", handleLeadCreated);
    socket.on("lead_list_updated", handleLeadUpdated);
    socket.on("followup:reminder", handleFollowUpReminder);
    socket.on("customer_online_status", handleCustomerOnlineStatus);
    socket.on("new_customer_message", handleNewCustomerMessage);
    socket.on("customer_direct_message", handleCustomerDirectMessage);

    return () => {
      socket.off("lead_list_created", handleLeadCreated);
      socket.off("lead_list_updated", handleLeadUpdated);
      socket.off("followup:reminder", handleFollowUpReminder);
      socket.off("customer_online_status", handleCustomerOnlineStatus);
      socket.off("new_customer_message", handleNewCustomerMessage);
      socket.off("customer_direct_message", handleCustomerDirectMessage);
    };
  }, [socket, queryClient, navigate]);

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
