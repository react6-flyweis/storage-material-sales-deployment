import EmptyChatState from "./empty-chat-state";
import MessageInput from "./message-input";
import ChatHeader from "./chat-header";

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface ChatAreaProps {
  selectedChat?: {
    id: string;
    name: string;
    avatar?: string;
    type: "department" | "contact";
    icon?: string;
    iconBgColor?: string;
    subtitle?: string;
  };
  messages: Message[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onBackClick?: () => void;
  onInfoClick?: () => void;
  onFollowUp?: () => void;
}

export default function ChatArea({
  selectedChat,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onBackClick,
  onInfoClick,
  onFollowUp,
}: ChatAreaProps) {
  if (!selectedChat) {
    return (
      <div className="h-full w-full flex flex-col bg-[#FAFCFF]">
        <div className="flex-1">
          <EmptyChatState />
        </div>

        <MessageInput
          value={messageInput}
          onChange={onMessageInputChange}
          onSend={onSendMessage}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#FAFCFF]">
      {/* Desktop Chat Header - Only for departments */}
      {selectedChat.type === "department" && (
        <div className="hidden md:block">
          <ChatHeader
            name={selectedChat.name}
            subtitle={selectedChat.subtitle}
            icon={selectedChat.icon}
            iconBgColor={selectedChat.iconBgColor}
            avatar={selectedChat.avatar}
            type={selectedChat.type}
            onVideoCall={() => console.log("Video call")}
            onInfo={onInfoClick}
            onFollowUp={onFollowUp}
          />
        </div>
      )}

      {/* Mobile Back Header */}
      {onBackClick && (
        <div className="md:hidden p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
          <button
            onClick={onBackClick}
            className="p-1 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {selectedChat.avatar && (
              <img
                src={selectedChat.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            {selectedChat.icon && (
              <div
                className={`w-8 h-8 rounded-lg ${selectedChat.iconBgColor} flex items-center justify-center text-white font-semibold text-xs`}
              >
                {selectedChat.icon}
              </div>
            )}
            <h3 className="font-semibold text-gray-800 text-sm">
              {selectedChat.name}
            </h3>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] ${
                  message.isMe ? "items-end" : "items-start"
                } flex flex-col`}
              >
                <div
                  className={`p-4 rounded-2xl text-sm ${
                    message.isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {message.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Input */}
      <MessageInput
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSendMessage}
      />
    </div>
  );
}
