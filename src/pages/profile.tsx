import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useDashboardMetricsQuery } from "@/lib/metrics";

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
  const { data: metrics, isPending: statsLoading } =
    useDashboardMetricsQuery("quarter");

  const displayName = currentUser?.name?.trim() || null;
  const displayEmail = currentUser?.email?.trim() || null;
  const displayRole = currentUser?.role ?? storeRole;
  const phone = null as string | null;
  const joinedDate = null as string | null;

  const systemStats: SystemStat[] = [
    {
      label: "Total Users",
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
    <div className=" p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">My profile</h1>
          </div>
          <p className="text-sm text-gray-600">
            Manage your profile information and view system overview
          </p>
        </div>
        <Button
          onClick={() => navigate("/profile/edit")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="mb-6 bg-white p-4">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold shrink-0">
            {displayName ? (
              getInitials(displayName)
            ) : (
              <span className="text-lg">?</span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {displayName ?? (
                <ProfileFieldEmpty>Name not available</ProfileFieldEmpty>
              )}
            </h2>
            <div className="flex gap-5 flex-wrap">
              <div>
                <p className="text-gray-600 mb-3">
                  {displayRole ? (
                    formatRole(displayRole)
                  ) : (
                    <ProfileFieldEmpty>Role not available</ProfileFieldEmpty>
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {joinedDate ? (
                    <>Joined {joinedDate}</>
                  ) : (
                    <ProfileFieldEmpty>Join date not available</ProfileFieldEmpty>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 shrink-0" />
                  {displayEmail ? (
                    <span>{displayEmail}</span>
                  ) : (
                    <ProfileFieldEmpty>Email not available</ProfileFieldEmpty>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 shrink-0" />
                  {phone ? (
                    <span>{phone}</span>
                  ) : (
                    <ProfileFieldEmpty>Phone not provided</ProfileFieldEmpty>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemStats.map((stat, index) => {
            const formattedValue = formatStatValue(stat.value, stat.format);
            const isEmpty = !statsLoading && stat.value === 0;

            return (
              <Card
                key={`${stat.label}-${index}`}
                className="bg-white p-4 ring-0 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    {statsLoading ? (
                      <div className="h-8 w-20 rounded bg-gray-100 animate-pulse" />
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
                  <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 ">
            Recent Activity
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 ">
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
