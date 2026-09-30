import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/types/auth";

import { api } from "@/utils/api";

// ============================================================
// FORGOT PASSWORD
// ============================================================

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    data,
  );

  return response.data;
}

// ============================================================
// CHANGE PASSWORD
// ============================================================

export async function changePassword(
  data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  const response = await api.post<ChangePasswordResponse>(
    "/auth/change-password",
    data,
  );

  return response.data;
}
