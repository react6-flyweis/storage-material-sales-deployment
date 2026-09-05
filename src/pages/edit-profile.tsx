import { Camera, CircleAlert, Eye, EyeOff, MoveLeft } from "lucide-react";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";

export default function EditProfile() {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(
    "https://imgs.search.brave.com/C6AU3hqShumrOuZaswKHOeZBwOo-XeuuJnf7XZ-5QW4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTAx/Njc0NDAzNC92ZWN0/b3IvcHJvZmlsZS1w/bGFjZWhvbGRlci1p/bWFnZS1ncmF5LXNp/bGhvdWV0dGUtbm8t/cGhvdG8uanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPVJxdGky/NlZRal9mcy1faEwx/NW1KajZiODRGRVpO/YTAwRkpnWlJhRzVQ/RDQ9"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "John Anderson",
    email: "johnanderson@company.com",
    phone: "+1 (555) 123-4567",
    role: "Plant Manager",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        alert("Only JPG, PNG, or GIF files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="xl:px-5 px-2 md:pt-5 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:items-center items-start justify-between mt-2 xl:mt-0">
        <div className="flex items-start gap-4 flex-wrap">
          <Button onClick={() => navigate(-1)}>
            <MoveLeft className="w-4 h-4" />
            <p className="font-normal">Back</p>
          </Button>
          <TitleSubtitle
            title="My Profile"
            subtitle="Update your personal information and security settings"
          />
        </div>
        <Button>Save All Changes</Button>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 flex flex-wrap items-center gap-6">
        <img
          src={
            profilePicture &&
            "https://imgs.search.brave.com/C6AU3hqShumrOuZaswKHOeZBwOo-XeuuJnf7XZ-5QW4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTAx/Njc0NDAzNC92ZWN0/b3IvcHJvZmlsZS1w/bGFjZWhvbGRlci1p/bWFnZS1ncmF5LXNp/bGhvdWV0dGUtbm8t/cGhvdG8uanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPVJxdGky/NlZRal9mcy1faEwx/NW1KajZiODRGRVpO/YTAwRkpnWlJhRzVQ/RDQ9"
          }
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-4 border-gray-50"
        />
        <div className="space-y-2 flex flex-col flex-wrap">
          <h3 className="md:text-lg font-semibold text-gray-900">
            Profile Picture
          </h3>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="rounded"
              onClick={handleProfilePictureClick}
              type="button"
            >
              <Camera className="w-4 h-4" />
              <p className="md:text-sm text-xs">Change Picture</p>
            </Button>
            <span className="md:text-sm text-xs text-gray-400">
              JPG, PNG or GIF, Max size 2MB.
            </span>
          </div>
        </div>
      </div>

      <h3 className="md:text-lg font-semibold text-gray-900 my-1">
        Basic Information
      </h3>
      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed"
            />
            <span className="text-xs text-gray-500">
              Role can not be changed from this interface
            </span>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="mb-5">
        <h3 className="md:text-lg font-semibold text-gray-900">
          Security Settings
        </h3>

        <p className="text-sm text-gray-500">
          Leave password fields empty if you don't want to change your password.
        </p>
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="space-y-6">
          <div className="w-full md:w-1/2 pr-0 md:pr-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Requirements Info */}
      <div className="bg-blue-50 rounded p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-4 text-primary font-medium md:text-sm text-xs">
          <CircleAlert className="w-5 h-5" />
          Password Requirements:
        </div>
        <ul className="space-y-2 md:text-sm text-xs text-primary">
          <li>At least 8 characters long</li>
          <li>Include uppercase and lowercase letters</li>
          <li>Include at least one number</li>
          <li>Include at least one special character</li>
        </ul>
      </div>
    </div>
  );
}
