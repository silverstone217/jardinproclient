import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LoginRequest, LoginResponse, User } from "@/types/auth";

import { api } from "@/utils/api";

interface RefreshUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ============================================================
      // LOGIN
      // ============================================================

      login: async (credentials) => {
        set({ isLoading: true });

        try {
          const response = await api.post<LoginResponse>(
            "/auth/login",
            credentials,
          );

          const result = response.data;

          if (!result.success || !result.data) {
            throw new Error(result.message || "Une erreur est survenue");
          }

          set({
            user: result.data.user,
            token: result.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });

          if (error instanceof Error) {
            throw error;
          }

          throw new Error("Une erreur est survenue");
        }
      },

      // ============================================================
      // REFRESH USER
      // ============================================================

      refreshUser: async () => {
        const token = get().token;

        // Aucun token = aucun utilisateur connecté
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
          });

          return;
        }

        try {
          set({ isLoading: true });

          const response = await api.get<RefreshUserResponse>("/auth/me");

          const result = response.data;

          if (!result.success || !result.data) {
            throw new Error(
              result.message || "Impossible de récupérer l'utilisateur",
            );
          }

          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // On laisse l'intercepteur Axios gérer le 401.
          if (error instanceof Error) {
            throw error;
          }

          throw new Error("Impossible de synchroniser l'utilisateur");
        }
      },

      // ============================================================
      // LOGOUT
      // ============================================================

      logout: async () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        await AsyncStorage.removeItem("jardin-user-storage");
      },

      // ============================================================
      // SET USER
      // ============================================================

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // ============================================================
      // SET TOKEN
      // ============================================================

      setToken: (token) => {
        set({
          token,
          isAuthenticated: !!token,
        });
      },
    }),
    {
      name: "jardin-user-storage",

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
