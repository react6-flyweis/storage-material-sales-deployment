import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerDirectConversations,
  getCustomerDirectMessages,
  sendCustomerDirectMessage,
  type GetCustomerConversationsParams,
  type GetCustomerMessagesParams,
} from "./customer-direct-chat.api";
import type {
  CustomerDirectConversation,
  CustomerDirectMessage,
} from "./customer-direct-chat.types";

export const customerDirectChatQueryKeys = {
  all: ["customer-direct-chat"] as const,
  conversations: (params?: GetCustomerConversationsParams) =>
    ["customer-direct-chat", "conversations", params] as const,
  messages: (customerId: string, params?: GetCustomerMessagesParams) =>
    ["customer-direct-chat", "messages", customerId, params] as const,
};

export function useCustomerDirectConversationsQuery(
  params?: GetCustomerConversationsParams,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery<CustomerDirectConversation[]>({
    queryKey: customerDirectChatQueryKeys.conversations(params),
    queryFn: () => getCustomerDirectConversations(params),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
  });
}

export function useCustomerDirectMessagesQuery(
  customerId: string,
  params?: GetCustomerMessagesParams,
  options?: { enabled?: boolean }
) {
  return useQuery<CustomerDirectMessage[]>({
    queryKey: customerDirectChatQueryKeys.messages(customerId, params),
    queryFn: () => getCustomerDirectMessages(customerId, params),
    enabled: Boolean(customerId) && options?.enabled !== false,
  });
}

export function useSendCustomerDirectMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      content,
    }: {
      customerId: string;
      content: string;
    }) => sendCustomerDirectMessage(customerId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerDirectChatQueryKeys.messages(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerDirectChatQueryKeys.conversations(),
      });
    },
  });
}
