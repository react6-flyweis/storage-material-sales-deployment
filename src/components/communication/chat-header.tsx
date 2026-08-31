interface ChatHeaderProps {
  name: string;
  subtitle?: string;
  icon?: string;
  iconBgColor?: string;
  avatar?: string;
  onVideoCall?: () => void;
  onInfo?: () => void;
  onFollowUp?: () => void;
  type: "department" | "contact";
}

export default function ChatHeader({
  name,
  subtitle,
  icon,
  iconBgColor = "bg-blue-500",
  avatar,
  onVideoCall,
  onInfo,
  onFollowUp,
  type,
}: ChatHeaderProps) {
  return (
    <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {type === "department" && icon ? (
          <div
            className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center text-white font-semibold text-sm`}
          >
            {icon}
          </div>
        ) : (
          avatar && (
            <img
              src={avatar}
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )
        )}
        <div>
          <h3 className="font-semibold text-gray-800 text-base">{name}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onFollowUp && (
          <button
            onClick={onFollowUp}
            className="px-2.5 py-1 text-xs border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md transition-colors font-medium"
          >
            Follow-up
          </button>
        )}
        {onVideoCall && (
          <button
            onClick={onVideoCall}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Video call"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </button>
        )}
        {onInfo && (
          <button
            onClick={onInfo}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Info"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
