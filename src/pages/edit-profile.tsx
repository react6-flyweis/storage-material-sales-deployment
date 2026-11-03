import { Camera, CircleAlert, MoveLeft, Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import {
  useProfile,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  type UpdateProfileRequest,
} from "@/modules/profile";
import { uploadFileToS3 } from "@/lib/upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [profilePicture, setProfilePicture] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mobile: "",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        mobile: profile.mobile || "",
        role: profile.role || "",
      }));
      if (profile.avatar) {
        setProfilePicture(profile.avatar);
      }
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      toast.error("Only JPG, PNG, WEBP, or GIF files are allowed");
      return;
    }

    setIsUploadingAvatar(true);
    const toastId = toast.loading("Uploading profile picture...");

    try {
      const uploadedUrl = await uploadFileToS3(file, "avatars");
      setProfilePicture(uploadedUrl);
      toast.success("Profile picture uploaded successfully", { id: toastId });
    } catch (err: unknown) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.warning(
        `Cloud upload note: ${getApiErrorMessage(err, "Using local preview.")}`,
        { id: toastId }
      );
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getChangedPayload = (): UpdateProfileRequest => {
    const payload: UpdateProfileRequest = {};
    const nameTrim = formData.name.trim();
    const emailTrim = formData.email.trim();
    const phoneTrim = formData.phone.trim();
    const mobileTrim = formData.mobile.trim();
    const avatarVal = profilePicture.trim();

    if (nameTrim !== (profile?.name || "").trim()) {
      payload.name = nameTrim;
    }
    if (emailTrim !== (profile?.email || "").trim()) {
      payload.email = emailTrim;
    }
    if (phoneTrim !== (profile?.phone || "").trim()) {
      payload.phone = phoneTrim;
    }
    if (mobileTrim !== (profile?.mobile || "").trim()) {
      payload.mobile = mobileTrim; // "" clears
    }
    if (avatarVal !== (profile?.avatar || "").trim()) {
      payload.avatar = avatarVal;
    }

    return payload;
  };

  const handleSaveAll = async () => {
    // 1. Validate profile fields
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return;
    }

    const payload = getChangedPayload();
    const hasProfileChanges = Object.keys(payload).length > 0;
    const hasPasswordAttempt =
      Boolean(formData.currentPassword) ||
      Boolean(formData.newPassword) ||
      Boolean(formData.confirmPassword);

    if (!hasProfileChanges && !hasPasswordAttempt) {
      toast.info("No changes detected to save");
      return;
    }

    // 2. Validate password if user entered anything in password fields
    if (hasPasswordAttempt) {
      if (!formData.currentPassword) {
        toast.error("Please enter your current password");
        return;
      }
      if (!formData.newPassword) {
        toast.error("Please enter a new password");
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error("New password must be at least 8 characters long");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirmation do not match");
        return;
      }
    }

    const toastId = toast.loading("Saving changes...");

    try {
      if (hasProfileChanges) {
        await updateProfileMutation.mutateAsync(payload);
      }

      if (hasPasswordAttempt) {
        await changePasswordMutation.mutateAsync({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      toast.success("Profile updated successfully!", { id: toastId });
      setTimeout(() => {
        navigate("/profile");
      }, 800);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save profile changes"), {
        id: toastId,
      });
    }
  };

  const isSaving =
    updateProfileMutation.isPending || changePasswordMutation.isPending;

  return (
    <div className="xl:px-5 px-2 md:pt-5 pb-10 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap md:items-center items-start justify-between gap-4 mt-2 xl:mt-0">
        <div className="flex items-start gap-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <MoveLeft className="w-4 h-4" />
            <span className="font-normal md:text-sm text-xs">Back</span>
          </Button>
          <TitleSubtitle
            title="My Profile"
            subtitle="Update your personal information and security settings"
          />
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={isSaving || isProfileLoading || isUploadingAvatar}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-36 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save All Changes"
          )}
        </Button>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 flex flex-wrap items-center gap-6">
        <div className="relative">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-50"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-2xl border-4 border-gray-50">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="space-y-2 flex flex-col flex-wrap">
          <h3 className="md:text-lg font-semibold text-gray-900">
            Profile Picture
          </h3>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="rounded cursor-pointer flex items-center gap-2"
              onClick={handleProfilePictureClick}
              type="button"
              disabled={isUploadingAvatar}
            >
              <Camera className="w-4 h-4" />
              <span className="md:text-sm text-xs">Change Picture</span>
            </Button>
            <span className="md:text-sm text-xs text-gray-400">
              JPG, PNG, WEBP or GIF, Max size 5MB.
            </span>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <h3 className="md:text-lg font-semibold text-gray-900 my-1">
        Basic Information
      </h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
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
              placeholder="Enter email address"
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
              placeholder="e.g. +1 555-0100"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. +1 555-0199"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed"
            />
            <span className="text-xs text-gray-500">
              Role cannot be changed from this interface
            </span>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="mb-2">
        <h3 className="md:text-lg font-semibold text-gray-900">
          Security Settings
        </h3>
        <p className="text-sm text-gray-500">
          Leave password fields empty if you do not want to change your password.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="space-y-6">
          <div className="w-full md:w-1/2 pr-0 md:pr-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password (min. 8 characters)"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Requirements Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2 text-blue-900 font-medium md:text-sm text-xs">
          <CircleAlert className="w-5 h-5 text-blue-600 shrink-0" />
          Password Requirements:
        </div>
        <ul className="space-y-1 md:text-sm text-xs text-blue-800 list-disc list-inside">
          <li>At least 8 characters long</li>
          <li>Include both letters and numbers for better security</li>
        </ul>
      </div>
    </div>
  );
}
