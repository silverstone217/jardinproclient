import { create } from "zustand";

import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
} from "@/types/security";
import { api } from "@/utils/api";

interface SecurityState {
  isChangingPassword: boolean;
  error: string | null;

  changePassword: (data: ChangePasswordPayload) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: ChangePasswordResponse;
      };
    };

    const message = axiosError.response?.data?.message;

    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const useSecurityStore = create<SecurityState>((set) => ({
  isChangingPassword: false,
  error: null,

  changePassword: async (data) => {
    try {
      set({
        isChangingPassword: true,
        error: null,
      });

      await api.patch<ChangePasswordResponse>("/security/password", data);

      set({
        isChangingPassword: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de modifier votre mot de passe.",
      );

      set({
        isChangingPassword: false,
        error: message,
      });

      throw error;
    }
  },

  clearError: () => {
    set({
      error: null,
    });
  },

  reset: () => {
    set({
      isChangingPassword: false,
      error: null,
    });
  },
}));
