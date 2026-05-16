import { useEffect, useState } from "react";
import {
  CheckCircle,
  Copy,
  MailCheckIcon,
  MapPinCheckIcon,
  PhoneIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileData {
  name: string;
  status: "Active" | "Inactive";
  id: string;
  joined: string;
  phone: string;
  email: string;
  address?: string;
}

interface ProfileCardProps {
  profile: ProfileData;
  isLoading?: boolean;
}

export default function ProfileCard({
  profile,
  isLoading = false,
}: ProfileCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timeout = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const handleCopyEmail = () => {
    if (!profile.email || profile.email === "-") {
      return;
    }

    navigator.clipboard
      .writeText(profile.email)
      .then(() => setIsCopied(true))
      .catch(() => {
        /* ignore clipboard errors */
      });
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardContent className="flex flex-col md:flex-row gap-8 md:gap-24 items-start px-0 pb-0 animate-pulse">
          <div className="flex gap-6 items-start">
            <div className="h-20 w-20 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-3">
              <div className="h-7 w-48 rounded bg-slate-200" />
              <div className="h-6 w-24 rounded-full bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-4 w-36 rounded bg-slate-200" />
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1 mt-4 md:mt-0 w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-8">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-4 w-56 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardContent className="flex flex-col md:flex-row gap-8 md:gap-24 items-start px-0 pb-0">
        <div className="flex gap-6 items-start">
          {/* Avatar */}
          <Avatar className="h-20 w-20">
            <AvatarImage
              src="https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff&size=128"
              alt={profile.name}
            />
            <AvatarFallback className="text-xl">
              {profile.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>

          {/* Customer Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <div className="flex items-center gap-2 bg-green-100/80 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                <div className="h-2.5 w-2.5 bg-green-500 rounded-full"></div>
                {profile.status}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[15px] text-gray-500">
                {profile.id?.startsWith("ID-")
                  ? profile.id
                  : `ID-${profile.id}`}
              </p>
              <p className="text-[15px] text-gray-500">
                Joined {profile.joined}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 text-[15px] mt-4 md:mt-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 min-w-24 text-gray-500">
              <PhoneIcon className="h-4 w-4" />
              <span>Phone</span>
            </div>
            <span className="text-gray-900">{profile.phone}</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 min-w-24 text-gray-500">
              <MailCheckIcon className="h-4 w-4" />
              <span>Email</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-blue-500 hover:underline cursor-pointer">
                {profile.email}
              </span>
              {isCopied ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy
                  onClick={handleCopyEmail}
                  className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 min-w-24 text-gray-500">
              <MapPinCheckIcon className="h-4 w-4" />
              <span>Address</span>
            </div>
            <span className="text-gray-900">{profile.address || "-"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
