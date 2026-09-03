import React from "react";
import { MessageCircle } from "lucide-react";

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-gray-200 mb-4">
        <MessageCircle size={32} className="text-[#4285F4]" />
      </div>
      <h2 className="text-xl font-bold text-[#051321] mb-1">
        Internal Team Communication
      </h2>
      <p className="text-sm text-[#637381] max-w-sm">
        Select a department channel or a team member from the left to start real-time messaging.
      </p>
    </div>
  );
};
