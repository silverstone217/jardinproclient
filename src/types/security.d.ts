export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  errors?: Array<{
    code?: string;
    path?: (string | number)[];
    message: string;
    [key: string]: unknown;
  }>;
}
