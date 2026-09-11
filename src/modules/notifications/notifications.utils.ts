import type { NotificationItem } from "./notifications.types";
import {
  UserPlus,
  Clock,
  AlertTriangle,
  Calendar,
  Truck,
  FileText,
  DollarSign,
  Package,
  MessageSquare,
  Bell,
  CheckSquare,
  FileSpreadsheet,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

export function getNotificationRoute(notification: NotificationItem): string {
  const model = notification.refModel?.toLowerCase() || "";
  const refId = notification.refId || "";
  const leadId = notification.leadId || "";
  const customerId = notification.customerId || "";

  if (model.includes("delivery")) {
    return refId ? `/deliveries/projects/${refId}` : "/deliveries";
  }

  if (model.includes("lead")) {
    const targetId = refId || leadId;
    return targetId ? `/leads/${targetId}` : "/leads";
  }

  if (model.includes("customer")) {
    const targetId = refId || customerId;
    return targetId ? `/customers/${targetId}` : "/customers";
  }

  if (model.includes("meeting")) {
    return "/meetings";
  }

  if (model.includes("quotation")) {
    return refId ? `/leads/quotation-details/${refId}` : "/leads/quotation-list";
  }

  if (model.includes("invoice")) {
    return refId ? `/invoice/${refId}` : "/invoice/list";
  }

  if (model.includes("purchaseorder") || model.includes("purchase_order") || model.includes("po")) {
    return refId ? `/leads/purchase-orders/${refId}` : "/leads/purchase-orders";
  }

  if (model.includes("chat") || model.includes("communication")) {
    return "/customer-communication";
  }

  if (model.includes("task") || model.includes("followup") || model.includes("follow_up")) {
    return "/leads/follow-up";
  }

  if (model.includes("freight")) {
    return "/awarded-freight";
  }

  if (model.includes("escalat")) {
    return "/leads/escalated";
  }

  // Fallback by notification type
  const type = notification.type?.toLowerCase() || "";
  if (type === "delivery") return refId ? `/deliveries/projects/${refId}` : "/deliveries";
  if (type === "lead") return (refId || leadId) ? `/leads/${refId || leadId}` : "/leads";
  if (type === "meeting") return "/meetings";
  if (type === "quotation") return refId ? `/leads/quotation-details/${refId}` : "/leads/quotation-list";
  if (type === "invoice") return refId ? `/invoice/${refId}` : "/invoice/list";
  if (type === "chat") return "/customer-communication";
  if (type === "followup" || type === "task") return "/leads/follow-up";
  if (type === "freight_bid") return "/awarded-freight";
  if (type === "escalation") return "/leads/escalated";
  if (type === "drawing" || type === "material_request") return leadId ? `/leads/${leadId}` : "/leads";

  return "/notifications";
}

export function formatNotificationTime(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export interface NotificationTypeStyle {
  icon: LucideIcon;
  bg: string;
  text: string;
  label: string;
}

export function getNotificationTypeConfig(type: string): NotificationTypeStyle {
  const normalized = (type || "").toLowerCase();

  switch (normalized) {
    case "lead":
      return { icon: UserPlus, bg: "bg-blue-100", text: "text-blue-600", label: "Lead" };
    case "task":
      return { icon: CheckSquare, bg: "bg-purple-100", text: "text-purple-600", label: "Task" };
    case "meeting":
      return { icon: Calendar, bg: "bg-cyan-100", text: "text-cyan-600", label: "Meeting" };
    case "escalation":
      return { icon: AlertTriangle, bg: "bg-red-100", text: "text-red-600", label: "Escalation" };
    case "payment":
      return { icon: DollarSign, bg: "bg-green-100", text: "text-green-600", label: "Payment" };
    case "drawing":
      return { icon: FileSpreadsheet, bg: "bg-indigo-100", text: "text-indigo-600", label: "Drawing" };
    case "delivery":
      return { icon: Truck, bg: "bg-amber-100", text: "text-amber-600", label: "Delivery" };
    case "followup":
      return { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-600", label: "Followup" };
    case "material_request":
      return { icon: Package, bg: "bg-teal-100", text: "text-teal-600", label: "Material Request" };
    case "quotation":
      return { icon: FileText, bg: "bg-emerald-100", text: "text-emerald-600", label: "Quotation" };
    case "invoice":
      return { icon: FileText, bg: "bg-blue-100", text: "text-blue-700", label: "Invoice" };
    case "freight_bid":
      return { icon: Truck, bg: "bg-orange-100", text: "text-orange-600", label: "Freight Bid" };
    case "chat":
      return { icon: MessageSquare, bg: "bg-sky-100", text: "text-sky-600", label: "Chat" };
    case "system":
      return { icon: AlertCircle, bg: "bg-gray-100", text: "text-gray-600", label: "System" };
    default:
      return { icon: Bell, bg: "bg-gray-100", text: "text-gray-600", label: type || "Notification" };
  }
}
