export type UserRole = "MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  telephone: string;
  email: string | null;
  image: string | null;
  role: UserRole;
  mustChangePassword?: boolean;
}

export interface LoginRequest {
  telephone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

// ============================================================
// FORGOT PASSWORD
// ============================================================

export interface ForgotPasswordRequest {
  email: string;
  telephone: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
}

// ============================================================
// CHANGE PASSWORD
// ============================================================

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
