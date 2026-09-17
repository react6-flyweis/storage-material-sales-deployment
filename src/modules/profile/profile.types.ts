export interface StaffProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  avatar?: string;
  role?: string;
  department?: string;
  location?: string;
  isActive?: boolean;
  isMainAdmin?: boolean;
  notificationSettings?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: StaffProfile;
    user?: StaffProfile;
  };
}

export interface UpdateStaffProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  avatar?: string;
  location?: string;
}

export interface UpdateStaffProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: StaffProfile;
    user?: StaffProfile;
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}
