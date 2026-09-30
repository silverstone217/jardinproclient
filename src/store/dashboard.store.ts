import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { getDashboard } from "@/services/dashboard.service";

import type { Dashboard } from "@/types/dashboard";

const STORAGE_PREFIX = "jardin-dashboard-storage";

type DashboardStore = {
  dashboard: Dashboard | null;

  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  isInitialized: boolean;

  initialize: (userId: string) => Promise<void>;
  fetchDashboard: (userId: string) => Promise<void>;
  refreshDashboard: (userId: string) => Promise<void>;

  clearDashboard: () => void;
  clearError: () => void;
};

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboard: null,

  isLoading: false,
  isRefreshing: false,
  error: null,

  isInitialized: false,

  /**
   * ==========================================================
   * INITIALISER LE DASHBOARD
   * ==========================================================
   *
   * 1. Charger immédiatement le cache local.
   * 2. Puis récupérer les données serveur.
   *
   * Cela permet d'afficher rapidement le dernier dashboard
   * connu, même si la connexion est lente ou temporairement
   * indisponible.
   */

  initialize: async (userId) => {
    if (!userId) {
      set({
        dashboard: null,
        isInitialized: true,
      });

      return;
    }

    set({
      isLoading: true,
      error: null,
    });

    try {
      const storageKey = getStorageKey(userId);

      const cachedDashboard = await AsyncStorage.getItem(storageKey);

      if (cachedDashboard) {
        try {
          const parsedDashboard = JSON.parse(cachedDashboard) as Dashboard;

          set({
            dashboard: parsedDashboard,
          });
        } catch (error) {
          console.error("Erreur lecture cache dashboard:", error);

          await AsyncStorage.removeItem(storageKey);
        }
      }

      /**
       * Après le chargement du cache, on tente toujours
       * une synchronisation avec le serveur.
       */
      try {
        await get().fetchDashboard(userId);
      } catch {
        /**
         * Si le serveur est inaccessible mais qu'un cache
         * existe, on conserve simplement les données locales.
         */
      }
    } finally {
      set({
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  /**
   * ==========================================================
   * RÉCUPÉRER LE DASHBOARD
   * ==========================================================
   */

  fetchDashboard: async (userId) => {
    if (!userId) {
      return;
    }

    set({
      error: null,
    });

    try {
      const dashboard = await getDashboard();

      const storageKey = getStorageKey(userId);

      await AsyncStorage.setItem(storageKey, JSON.stringify(dashboard));

      set({
        dashboard,
        error: null,
      });
    } catch (error: any) {
      console.error("Erreur chargement dashboard:", error);

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Impossible de charger le tableau de bord.";

      set({
        error: message,
      });

      throw error;
    }
  },

  /**
   * ==========================================================
   * RAFRAÎCHIR LE DASHBOARD
   * ==========================================================
   */

  refreshDashboard: async (userId) => {
    if (!userId) {
      return;
    }

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      await get().fetchDashboard(userId);
    } finally {
      set({
        isRefreshing: false,
      });
    }
  },

  /**
   * ==========================================================
   * VIDER LE DASHBOARD
   * ==========================================================
   */

  clearDashboard: () => {
    set({
      dashboard: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      isInitialized: false,
    });
  },

  /**
   * ==========================================================
   * VIDER L'ERREUR
   * ==========================================================
   */

  clearError: () => {
    set({
      error: null,
    });
  },
}));
