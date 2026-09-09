import type { UserRole } from "@/types/user";

export interface ProfileUser {
  id: string;
  name: string;
  telephone: string;
  email: string | null;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name: string;
  telephone: string;
  email: string;
  isActive?: boolean;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user: ProfileUser;
}

export interface ProfileStore {
  profile: ProfileUser | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;

  error: string | null;

  fetchProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  updateProfile: (data: UpdateProfilePayload) => Promise<ProfileUser>;

  updateProfileImage: (imageUri: string) => Promise<ProfileUser>;

  removeProfileImage: () => Promise<ProfileUser>;

  clearError: () => void;
  reset: () => void;
}
