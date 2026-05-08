/**
 * profileApi.ts
 * Profile management API calls
 * Endpoints: /User/profile (GET, PUT)
 */
import apiClient from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

export type UserProfile = {
  uuid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_verified: boolean;
  is_active: boolean;
  created_at?: string;
};

type BackendProfileResponse = {
  success: boolean;
  message: string;
  data: UserProfile;   // backend returns `data`, not `user`
};

type UpdateProfileRequest = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
};

// ─── Get User Profile ────────────────────────────────────────

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<BackendProfileResponse>(
    API_ENDPOINTS.profile.get
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message ?? "Failed to fetch profile");
  }

  return response.data.data;
};

// ─── Update User Profile ─────────────────────────────────────

export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await apiClient.put<BackendProfileResponse>(
    API_ENDPOINTS.profile.update,
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message ?? "Failed to update profile");
  }

  return response.data.data;
};
