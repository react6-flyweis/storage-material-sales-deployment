export type CustomerDirectSenderType = "customer" | "admin" | "sales";

export interface CustomerDirectConversation {
  customerId: string;
  customerName?: string;
  email?: string;
  phone?: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  lastSenderType?: CustomerDirectSenderType | string;
}

export interface CustomerDirectMessage {
  _id?: string;
  messageId?: string;
  customerId: string;
  senderType: CustomerDirectSenderType | string;
  senderId?: string | null;
  senderName?: string;
  content: string;
  isReadByCustomer?: boolean;
  isReadByStaff?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerDirectConversationsResponse {
  success?: boolean;
  data?: {
    conversations?: CustomerDirectConversation[];
    total?: number;
    page?: number;
    limit?: number;
  } | CustomerDirectConversation[];
  conversations?: CustomerDirectConversation[];
}

export interface CustomerDirectMessagesResponse {
  success?: boolean;
  data?: {
    messages?: CustomerDirectMessage[];
    total?: number;
    page?: number;
    limit?: number;
    customerId?: string;
  } | CustomerDirectMessage[];
  messages?: CustomerDirectMessage[];
}
