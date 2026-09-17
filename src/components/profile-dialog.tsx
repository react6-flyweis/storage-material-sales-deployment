import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, User, X, Loader2, AlertCircle } from "lucide-react";
import {
  useStaffProfileQuery,
  useUpdateStaffProfileMutation,
} from "@/modules/profile/profile.hooks";
import { ChangePasswordModal } from "@/components/change-password-modal";
import SuccessDialog from "@/components/success-dialog";
import type {
  StaffProfile,
  UpdateStaffProfilePayload,
} from "@/modules/profile/profile.types";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProfileFormContentProps {
  staffProfile?: StaffProfile;
  isLoading: boolean;
  onClose: () => void;
  onOpenChangePassword: () => void;
  onSuccess: () => void;
}

function ProfileFormContent({
  staffProfile,
  isLoading,
  onClose,
  onOpenChangePassword,
  onSuccess,
}: ProfileFormContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: staffProfile?.name || "",
    email: staffProfile?.email || "",
    mobile: staffProfile?.mobile || "",
    location: staffProfile?.location || "",
    avatar: staffProfile?.avatar || "",
  });

  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateStaffProfileMutation();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (errorMessage) {
      setErrorMessage(null);
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarBadgeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Avatar file size must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (JPEG, PNG, WebP, GIF)");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange("avatar", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setErrorMessage(null);

    // Only send changed fields to PUT /api/profile
    const payload: UpdateStaffProfilePayload = {};

    if (formData.name !== (staffProfile?.name || "")) {
      payload.name = formData.name.trim();
    }
    if (formData.email !== (staffProfile?.email || "")) {
      payload.email = formData.email.trim();
    }
    if (formData.mobile !== (staffProfile?.mobile || "")) {
      payload.mobile = formData.mobile.trim();
    }
    if (formData.location !== (staffProfile?.location || "")) {
      payload.location = formData.location.trim();
    }
    if (formData.avatar !== (staffProfile?.avatar || "")) {
      payload.avatar = formData.avatar;
    }

    if (Object.keys(payload).length === 0) {
      setErrorMessage("No changes were made to save.");
      return;
    }

    updateProfile(payload, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update profile. Please try again.";
        setErrorMessage(message);
      },
    });
  };

  const displayName = formData.name;
  const displayEmail = formData.email;

  const initials = displayName
    ? displayName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <>
      {/* Top Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full focus:outline-none"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Top Section: Avatar + Name + Email */}
      <div className="flex items-center gap-4 pr-8">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={displayName || "User avatar"}
                className="w-full h-full object-cover"
              />
            ) : initials ? (
              <span className="text-lg font-semibold text-gray-600">
                {initials}
              </span>
            ) : (
              <User className="w-7 h-7 text-gray-400" />
            )}
          </div>

          {/* Edit/Pencil Badge Button */}
          <button
            type="button"
            onClick={handleAvatarBadgeClick}
            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            title="Change Avatar"
          >
            <Pencil className="w-3 h-3 text-gray-600" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {isLoading ? (
              <span className="inline-block w-28 h-5 bg-gray-200 animate-pulse rounded" />
            ) : (
              displayName || <span className="text-gray-400 font-normal italic">No name set</span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-normal truncate mt-0.5">
            {isLoading ? (
              <span className="inline-block w-36 h-4 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              displayEmail || <span className="text-gray-300 italic">No email set</span>
            )}
          </p>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="border-b border-gray-100 mt-5 mb-1" />

      {/* Profile Details Rows */}
      <div className="divide-y divide-gray-100">
        {/* Name */}
        <div className="flex items-center justify-between py-3.5 sm:py-4">
          <span className="text-sm font-medium text-gray-700">Name</span>
          <input
            type="text"
            value={formData.name}
            placeholder="Enter your name"
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="text-sm text-right text-gray-800 placeholder-gray-300 focus:text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 max-w-[65%]"
          />
        </div>

        {/* Email account */}
        <div className="flex items-center justify-between py-3.5 sm:py-4">
          <span className="text-sm font-medium text-gray-700">
            Email account
          </span>
          <input
            type="email"
            value={formData.email}
            placeholder="Enter email account"
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="text-sm text-right text-gray-800 placeholder-gray-300 focus:text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 max-w-[65%]"
          />
        </div>

        {/* Mobile number */}
        <div className="flex items-center justify-between py-3.5 sm:py-4">
          <span className="text-sm font-medium text-gray-700">
            Mobile number
          </span>
          <input
            type="tel"
            value={formData.mobile}
            placeholder="Enter mobile number"
            onChange={(e) => handleInputChange("mobile", e.target.value)}
            className="text-sm text-right text-gray-800 placeholder-gray-300 focus:text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 max-w-[65%]"
          />
        </div>

        {/* Location */}
        <div className="flex items-center justify-between py-3.5 sm:py-4">
          <span className="text-sm font-medium text-gray-700">Location</span>
          <input
            type="text"
            value={formData.location}
            placeholder="Enter location"
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="text-sm text-right text-gray-800 placeholder-gray-300 focus:text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 max-w-[65%]"
          />
        </div>
      </div>

      {/* Inline Error Message */}
      {errorMessage && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Footer Actions: Change Password (Left) & Save Change (Right) */}
      <div className="flex items-center justify-between pt-6 mt-1">
        <button
          type="button"
          onClick={onOpenChangePassword}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2 px-1 focus:outline-none cursor-pointer"
        >
          Change Password
        </button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isUpdating || isLoading}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all duration-150 min-w-[120px] active:scale-[0.98]"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Change"
          )}
        </Button>
      </div>
    </>
  );
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: profileResponse, isLoading } = useStaffProfileQuery({
    enabled: open,
  });

  const staffProfile = profileResponse?.data?.profile;

  const handleProfileUpdated = () => {
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[460px] rounded-2xl p-6 sm:p-7 bg-white border border-gray-100 shadow-2xl gap-0 overflow-hidden"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>

          {open && (
            <ProfileFormContent
              key={staffProfile?._id ?? (isLoading ? "loading" : "loaded")}
              staffProfile={staffProfile}
              isLoading={isLoading}
              onClose={() => onOpenChange(false)}
              onOpenChangePassword={() => setIsChangePasswordOpen(true)}
              onSuccess={handleProfileUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog for Profile Update */}
      <SuccessDialog
        open={showSuccess}
        onClose={handleSuccessClose}
        title="Profile Updated Successfully!"
        description="Your profile details have been successfully saved."
        okLabel="Ok"
        onOk={handleSuccessClose}
      />

      {/* Dedicated Change Password Modal */}
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </>
  );
}
