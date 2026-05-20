import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import ChatCard from "@/components/leads/chat-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SingleLeadChats() {
  const navigate = useNavigate();
  const { leadId } = useParams();

  const [messages] = useState<
    Array<{ id: number; from: string; text: string; time: string }>
  >([]);

  return (
    <div className="w-full">
      <div className="bg-[#4ECDC4] text-white px-6 py-3 flex items-center gap-3">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Lead Communication Timeline</h2>
      </div>

      <div className="p-6">
        <ChatCard
          lead={{
            id: leadId ?? "—",
            name: "Lead Name",
          }}
          recentMessages={messages}
        />
      </div>
    </div>
  );
}
