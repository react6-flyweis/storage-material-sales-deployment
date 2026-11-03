import { apiClient } from "@/modules/auth/auth.api";
import type {
  CustomerDirectConversation,
  CustomerDirectMessage,
  CustomerDirectConversationsResponse,
  CustomerDirectMessagesResponse,
} from "./customer-direct-chat.types";

export interface GetCustomerConversationsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetCustomerMessagesParams {
  page?: number;
  limit?: number;
}

export async function getCustomerDirectConversations(
  params?: GetCustomerConversationsParams
): Promise<CustomerDirectConversation[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const qs = query.toString();
  const url = `/api/sales/customer-direct-chat/conversations${qs ? `?${qs}` : ""}`;

  const response = await apiClient.get<CustomerDirectConversationsResponse>(url);
  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (data?.data && "conversations" in data.data && Array.isArray(data.data.conversations)) {
    return data.data.conversations;
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

export async function getCustomerDirectMessages(
  customerId: string,
  params?: GetCustomerMessagesParams
): Promise<CustomerDirectMessage[]> {
  if (!customerId) return [];

  const query = new URLSearchParams();
  query.append("page", String(params?.page ?? 1));
  query.append("limit", String(params?.limit ?? 50));

  const url = `/api/sales/customer-direct-chat/${encodeURIComponent(customerId)}/messages?${query.toString()}`;
  const response = await apiClient.get<CustomerDirectMessagesResponse>(url);
  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messages)) return data.messages;
  if (data?.data && "messages" in data.data && Array.isArray(data.data.messages)) {
    return data.data.messages;
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

export async function sendCustomerDirectMessage(
  customerId: string,
  content: string
): Promise<CustomerDirectMessage> {
  const url = `/api/sales/customer-direct-chat/${encodeURIComponent(customerId)}/messages`;
  const response = await apiClient.post(url, { content });
  const raw = response.data?.data ?? response.data;
  return raw;
}
