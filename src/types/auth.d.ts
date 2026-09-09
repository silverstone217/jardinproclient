export type UserRole = "MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  telephone: string;
  email: string | null;
  image: string | null;
  role: UserRole;
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
