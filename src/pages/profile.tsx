import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";

export default function Profile() {
  const navigate = useNavigate();

  // Mock data - replace with actual user data
  const userData = {
    name: "John Doe",
    role: "Sales person",
    joinedDate: "January 15, 2023",
    email: "luca.moretti@youroutfit.it",
    phone: "+39 02 8943 2231",
    avatar: "/placeholder-avatar.jpg",
  };

  const systemStats = [
    { label: "Total Users", value: "2,847" },
    { label: "Total Payment", value: "$124,847" },
    { label: "Active Follow - ups", value: "23" },
    { label: "Pending Reviews", value: "12" },
    { label: "Total Payments", value: "$124,847" },
    { label: "Active Follow - ups", value: "23" },
  ];

  const recentActivities = [
    {
      text: "Updated user permissions for Marketing Team",
      time: "2 hours ago",
    },
    {
      text: "Updated user permissions for Marketing Team",
      time: "2 hours ago",
    },
    {
      text: "Updated user permissions for Marketing Team",
      time: "2 hours ago",
    },
    {
      text: "Updated user permissions for Marketing Team",
      time: "2 hours ago",
    },
    {
      text: "Updated user permissions for Marketing Team",
      time: "2 hours ago",
    },
  ];

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
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
            {userData.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {userData.name}
            </h2>
            <div className="flex gap-5">
              <div className="">
                <p className="text-gray-600 mb-3">{userData.role}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Joined {userData.joinedDate}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{userData.phone}</span>
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
          {systemStats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white p-4 ring-0 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
          ))}
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
          {recentActivities.map((activity, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 ">
              <p className="text-sm text-gray-900 mb-1">{activity.text}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
