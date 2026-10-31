import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, TrendingUp, Smartphone, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useDashboardMetricsQuery } from "@/lib/metrics";
import { useProfile } from "@/modules/profile";

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStatValue(value: number, format: "number" | "currency") {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return value.toLocaleString();
}

type SystemStat = {
  label: string;
  value: number;
  format: "number" | "currency";
};

function ProfileFieldEmpty({ children }: { children: string }) {
  return <span className="text-gray-400 italic">{children}</span>;
}

function StatEmptyHint() {
  return <p className="text-xs text-gray-400 mt-0.5">No data yet</p>;
}

function RecentActivityEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center">
      <p className="text-sm font-medium text-gray-700">No recent activity</p>
      <p className="mt-1 text-xs text-gray-500">
        Your recent actions will appear here when available.
      </p>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const storeRole = useAuthStore((state) => state.role);

  const { data: profile } = useProfile();

  const { data: metrics, isPending: statsLoading } =
    useDashboardMetricsQuery("quarter");

  const displayName = profile?.name?.trim() || currentUser?.name?.trim() || null;
  const displayEmail = profile?.email?.trim() || currentUser?.email?.trim() || null;
  const displayRole = profile?.role || currentUser?.role || storeRole;
  const phone = profile?.phone || profile?.mobile || null;
  const mobile = profile?.mobile && profile?.mobile !== profile?.phone ? profile.mobile : null;
  const avatar = profile?.avatar || null;
  const department = profile?.department || null;
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const systemStats: SystemStat[] = [
    {
      label: "Total Leads",
      value: metrics?.totalLeads ?? 0,
      format: "number",
    },
    {
      label: "Total Payment",
      value: 0,
      format: "currency",
    },
    {
      label: "Pending Reviews",
      value: metrics?.escalationsPending ?? 0,
      format: "number",
    },
    {
      label: "Active Follow - ups",
      value: metrics?.followUpPending ?? 0,
      format: "number",
    },
  ];

  const recentActivities: { text: string; time: string }[] = [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          </div>
          <p className="text-sm text-gray-600">
            Manage your personal profile information and system preferences
          </p>
        </div>
        <Button
          onClick={() => navigate("/profile/edit")}
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
        >
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {avatar ? (
            <img
              src={avatar}
              alt={displayName || "User avatar"}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-semibold shrink-0 shadow-xs">
              {displayName ? (
                getInitials(displayName)
              ) : (
                <span className="text-lg">?</span>
              )}
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {displayName ?? (
                  <ProfileFieldEmpty>Name not available</ProfileFieldEmpty>
                )}
              </h2>
              <p className="text-sm font-medium text-blue-600">
                {displayRole ? (
                  formatRole(displayRole)
                ) : (
                  <ProfileFieldEmpty>Role not available</ProfileFieldEmpty>
                )}
                {department ? ` • ${department}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                {displayEmail ? (
                  <span className="font-medium text-gray-800">{displayEmail}</span>
                ) : (
                  <ProfileFieldEmpty>Email not available</ProfileFieldEmpty>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                {phone ? (
                  <span className="font-medium text-gray-800">{phone}</span>
                ) : (
                  <ProfileFieldEmpty>Phone not provided</ProfileFieldEmpty>
                )}
              </div>

              {mobile && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Smartphone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-800">{mobile}</span>
                </div>
              )}

              {joinedDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Joined {joinedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* System Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {systemStats.map((stat, index) => {
            const formattedValue = formatStatValue(stat.value, stat.format);
            const isEmpty = !statsLoading && stat.value === 0;

            return (
              <Card
                key={`${stat.label}-${index}`}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {stat.label}
                    </p>
                    {statsLoading ? (
                      <div className="h-7 w-20 rounded bg-gray-100 animate-pulse" />
                    ) : (
                      <>
                        <p
                          className={`text-2xl font-bold ${
                            isEmpty ? "text-gray-400" : "text-gray-900"
                          }`}
                        >
                          {formattedValue}
                        </p>
                        {isEmpty && <StatEmptyHint />}
                      </>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white rounded-xl border border-gray-100 shadow-xs">
        <CardHeader className="border-b border-gray-100 pb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Activity
          </h3>
        </CardHeader>
        <CardContent className="pt-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 mb-1">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))
          ) : (
            <RecentActivityEmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
