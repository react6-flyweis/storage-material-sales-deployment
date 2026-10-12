import React, { useMemo } from "react";
import { Search, X, Loader2, UsersRound, Plus, MessageSquarePlus } from "lucide-react";
import type { ChatConversation } from "@/modules/team-chat/team-chat.api";
import type { CustomerDirectConversation } from "@/modules/customer-direct-chat/customer-direct-chat.types";
import { type ActiveChatState, formatMessageTime } from "./types";

interface ChatSidebarProps {
  currentUser: { _id?: string; name?: string; role?: string; email?: string } | null;
  isConnected: boolean;
  activeMainTab: "Customers" | "Team";
  setActiveMainTab: (tab: "Customers" | "Team") => void;
  activeTeamTab: "Departments" | "Direct";
  setActiveTeamTab: (tab: "Departments" | "Direct") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeChat: ActiveChatState | null;
  onSelectChat: (chat: ActiveChatState) => void;
  conversations: ChatConversation[];
  isLoadingConversations: boolean;
  customerConversations: CustomerDirectConversation[];
  isLoadingCustomerConversations: boolean;
  onOpenNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentUser,
  isConnected,
  activeMainTab,
  setActiveMainTab,
  activeTeamTab,
  setActiveTeamTab,
  searchQuery,
  setSearchQuery,
  activeChat,
  onSelectChat,
  conversations,
  isLoadingConversations,
  customerConversations,
  isLoadingCustomerConversations,
  onOpenNewChat,
}) => {
  // 1. Group conversations list strictly from API
  const groupItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const groups = conversations.filter((c) => c.type === "group" && c.groupId);

    if (!q) return groups;
    return groups.filter((g) => g.name?.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // 2. Direct conversations list strictly from API
  const directItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const directConvs = conversations.filter(
      (c) => c.type === "direct" && c.userId && c.userId !== currentUser?._id
    );

    if (!q) return directConvs;
    return directConvs.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        (item.role && item.role.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.lastMessage && item.lastMessage.toLowerCase().includes(q))
    );
  }, [conversations, currentUser, searchQuery]);

  // 3. Customer conversations list
  const customerItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customerConversations;
    return customerConversations.filter(
      (c) =>
        c.customerName?.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  }, [customerConversations, searchQuery]);

  // Unread badge calculations
  const totalCustomerUnread = useMemo(() => {
    return customerConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [customerConversations]);

  const totalTeamUnread = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  return (
    <div className="hidden md:flex w-72 lg:w-80 border-r border-gray-200 flex-col bg-white shrink-0">
      {/* User Profile Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? "bg-emerald-500" : "bg-amber-400"
              }`}
              title={isConnected ? "Socket Connected" : "Connecting..."}
            />
          </div>
          <div>
            <h3 className="font-bold text-[#051321] text-sm truncate max-w-35">
              {currentUser?.name || "Logged User"}
            </h3>
            <p className="text-xs text-[#637381] capitalize">
              {currentUser?.role || "Staff"}
            </p>
          </div>
        </div>
        <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {isConnected ? "Live" : "Offline"}
        </div>
      </div>

      {/* Top-Level Main Tabs: Customers vs Team */}
      <div className="flex border-b border-gray-200 px-2 bg-slate-50/50">
        <button
          className={`flex-1 py-2.5 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMainTab === "Customers"
              ? "text-emerald-700 font-bold"
              : "text-gray-500 hover:text-gray-700 font-medium"
          }`}
          onClick={() => setActiveMainTab("Customers")}
        >
          <span>Customers</span>
          {totalCustomerUnread > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
              {totalCustomerUnread}
            </span>
          )}
          {activeMainTab === "Customers" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          className={`flex-1 py-2.5 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMainTab === "Team"
              ? "text-[#4285F4] font-bold"
              : "text-gray-500 hover:text-gray-700 font-medium"
          }`}
          onClick={() => setActiveMainTab("Team")}
        >
          <span>Team</span>
          {totalTeamUnread > 0 && (
            <span className="bg-[#4285F4] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
              {totalTeamUnread}
            </span>
          )}
          {activeMainTab === "Team" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4285F4]" />
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeMainTab === "Customers"
                ? "Search customer chats..."
                : "Search team chats..."
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs for Team Mode: Groups vs Direct */}
      {activeMainTab === "Team" && (
        <div className="flex border-b border-gray-100 mb-2 px-2">
          <button
            className={`flex-1 py-2 text-xs font-semibold transition-all relative cursor-pointer ${
              activeTeamTab === "Departments"
                ? "text-[#4285F4]"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => setActiveTeamTab("Departments")}
          >
            Groups
            {activeTeamTab === "Departments" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4285F4]" />
            )}
          </button>
          <button
            className={`flex-1 py-2 text-xs font-semibold transition-all relative cursor-pointer ${
              activeTeamTab === "Direct"
                ? "text-[#4285F4]"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => setActiveTeamTab("Direct")}
          >
            Direct Messages
            {activeTeamTab === "Direct" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4285F4]" />
            )}
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {activeMainTab === "Customers" ? (
          isLoadingCustomerConversations ? (
            <div className="p-6 text-center text-xs text-gray-400">
              <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2 text-emerald-600" />
              Loading customer chats...
            </div>
          ) : customerItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <UsersRound size={20} />
              </div>
              <p className="font-semibold text-slate-700 mb-1">No customer chats yet</p>
              <p className="text-[11px] text-gray-400 text-center max-w-xs">
                Start a conversation from any customer profile.
              </p>
            </div>
          ) : (
            customerItems.map((conv) => {
              const isSelected =
                activeChat?.type === "customer" && activeChat.id === conv.customerId;
              const initial = conv.customerName
                ? conv.customerName.charAt(0).toUpperCase()
                : "C";
              const senderPrefix =
                conv.lastSenderType === "admin"
                  ? "Admin: "
                  : conv.lastSenderType === "sales"
                  ? "Sales: "
                  : "";
              const lastSnippet = conv.lastMessage
                ? `${senderPrefix}${conv.lastMessage}`
                : "Customer conversation";

              return (
                <div
                  key={conv.customerId}
                  onClick={() =>
                    onSelectChat({
                      type: "customer",
                      id: conv.customerId,
                      name: conv.customerName || "Customer",
                      email: conv.email,
                      phone: conv.phone,
                      category: "Customer",
                      color: "bg-emerald-600",
                    })
                  }
                  className={`flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all group ${
                    isSelected
                      ? "bg-emerald-50/70 border border-emerald-200 shadow-xs"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {initial}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs lg:text-sm font-semibold transition-colors truncate ${
                            isSelected
                              ? "text-emerald-700 font-bold"
                              : "text-[#051321] group-hover:text-emerald-700"
                          }`}
                        >
                          {conv.customerName || "Customer"}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatMessageTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {lastSnippet}
                      </span>
                    </div>
                  </div>
                  {conv.unreadCount && conv.unreadCount > 0 ? (
                    <span className="ml-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  ) : null}
                </div>
              );
            })
          )
        ) : activeTeamTab === "Departments" ? (
          isLoadingConversations ? (
            <div className="p-6 text-center text-xs text-gray-400">
              <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2 text-blue-500" />
              Loading group chats...
            </div>
          ) : groupItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No group conversations found
            </div>
          ) : (
            groupItems.map((group) => {
              const groupId = group.groupId as string;
              const isSelected =
                activeChat?.type === "group" && activeChat.id === groupId;
              return (
                <div
                  key={groupId}
                  onClick={() =>
                    onSelectChat({
                      type: "group",
                      id: groupId,
                      name: group.name,
                      category: "Group",
                      membersCount: group.memberCount || 2,
                      avatar: group.avatar,
                      color: "bg-[#4285F4]",
                    })
                  }
                  className={`flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all group ${
                    isSelected
                      ? "bg-blue-50/70 border border-blue-100 shadow-xs"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-[#4285F4] rounded-lg shadow-xs flex items-center justify-center w-9 h-9 shrink-0">
                      {group.avatar ? (
                        <img
                          src={group.avatar}
                          alt={group.name}
                          className="w-full h-full rounded-md object-cover"
                        />
                      ) : (
                        <UsersRound size={18} className="text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs lg:text-sm font-semibold transition-colors truncate ${
                            isSelected
                              ? "text-[#4285F4]"
                              : "text-[#051321] group-hover:text-[#4285F4]"
                          }`}
                        >
                          {group.name}
                        </span>
                        {group.lastMessageAt && (
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatMessageTime(group.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {group.lastMessage || `${group.memberCount || 2} members`}
                      </span>
                    </div>
                  </div>
                  {group.unreadCount && group.unreadCount > 0 ? (
                    <span className="ml-2 bg-[#4285F4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center shrink-0">
                      {group.unreadCount}
                    </span>
                  ) : null}
                </div>
              );
            })
          )
        ) : isLoadingConversations ? (
          <div className="p-6 text-center text-xs text-gray-400">
            <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2 text-blue-500" />
            Loading direct messages...
          </div>
        ) : directItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
              <MessageSquarePlus size={20} />
            </div>
            <p className="font-semibold text-slate-700 mb-1">No direct chats yet</p>
            <p className="text-[11px] text-gray-400 text-center mb-3">
              Start a new conversation with anyone on your team
            </p>
            <button
              onClick={onOpenNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4285F4] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              Start New Chat
            </button>
          </div>
        ) : (
          directItems.map((conv) => {
            const userId = conv.userId as string;
            const isSelected =
              activeChat?.type === "direct" && activeChat.id === userId;
            return (
              <div
                key={userId}
                onClick={() =>
                  onSelectChat({
                    type: "direct",
                    id: userId,
                    name: conv.name,
                    role: conv.role,
                    avatar: conv.avatar,
                  })
                }
                className={`flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all group ${
                  isSelected
                    ? "bg-blue-50/70 border border-blue-100 shadow-xs"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    {conv.avatar ? (
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm border border-gray-100">
                        {conv.name ? conv.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs lg:text-sm font-semibold transition-colors truncate ${
                          isSelected
                            ? "text-[#4285F4]"
                            : "text-[#051321] group-hover:text-[#4285F4]"
                        }`}
                      >
                        {conv.name}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatMessageTime(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 block truncate">
                      {conv.lastMessage || conv.role || "Direct message"}
                    </span>
                  </div>
                </div>
                {conv.unreadCount && conv.unreadCount > 0 ? (
                  <span className="ml-2 bg-[#4285F4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center shrink-0">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info & New Chat Button */}
      {activeMainTab === "Team" && activeTeamTab === "Direct" && (
        <div className="p-3 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={onOpenNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 bg-[#4285F4] hover:bg-blue-600 active:scale-[0.99] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>New Direct Chat</span>
          </button>
        </div>
      )}
    </div>
  );
};
