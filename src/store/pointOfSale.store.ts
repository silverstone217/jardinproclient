import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type {
  CreatePointOfSalePayload,
  PointOfSale,
  PointOfSaleResponse,
  PointOfSalesResponse,
  UpdatePointOfSalePayload,
} from "@/types/point-of-sale";

import { api } from "@/utils/api";

const STORAGE_KEY = "jardin-point-of-sale-storage";

// ============================================================
// TYPES DU STORE
// ============================================================

interface PointOfSaleState {
  pointOfSales: PointOfSale[];
  selectedPointOfSale: PointOfSale | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  isDeleting: boolean;

  isOffline: boolean;
  error: string | null;

  fetchPointOfSales: () => Promise<void>;
  refreshPointOfSales: () => Promise<void>;

  getPointOfSale: (id: string) => Promise<PointOfSale | null>;

  createPointOfSale: (data: CreatePointOfSalePayload) => Promise<PointOfSale>;

  updatePointOfSale: (
    id: string,
    data: UpdatePointOfSalePayload,
  ) => Promise<PointOfSale>;

  deletePointOfSale: (id: string) => Promise<void>;

  setSelectedPointOfSale: (pointOfSale: PointOfSale | null) => void;

  clearError: () => void;

  reset: () => Promise<void>;
}

// ============================================================
// CACHE
// ============================================================

const saveCache = async (pointOfSales: PointOfSale[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pointOfSales));
  } catch (error) {
    console.error("Erreur sauvegarde cache POS:", error);
  }
};

const loadCache = async (): Promise<PointOfSale[]> => {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed: unknown = JSON.parse(storage);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as PointOfSale[];
  } catch (error) {
    console.error("Erreur lecture cache POS:", error);

    return [];
  }
};

// ============================================================
// GESTION DES ERREURS
// ============================================================

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
        };
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

// ============================================================
// STORE
// ============================================================

export const usePointOfSaleStore = create<PointOfSaleState>((set, get) => ({
  pointOfSales: [],
  selectedPointOfSale: null,

  isLoading: false,
  isRefreshing: false,
  isSaving: false,
  isDeleting: false,

  isOffline: false,
  error: null,

  // ========================================================
  // CHARGEMENT INITIAL
  // ========================================================

  fetchPointOfSales: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      // ----------------------------------------------------
      // 1. Afficher immédiatement le cache
      // ----------------------------------------------------

      const cachedPointOfSales = await loadCache();

      if (cachedPointOfSales.length > 0) {
        set({
          pointOfSales: cachedPointOfSales,
          isOffline: true,
        });
      }

      // ----------------------------------------------------
      // 2. Synchroniser avec le serveur
      // ----------------------------------------------------

      const response = await api.get<PointOfSalesResponse>("/point-of-sale");

      const result = response.data;

      if (!result.success || !result.pointOfSales) {
        throw new Error(
          result.message || "Impossible de récupérer les points de vente.",
        );
      }

      // ----------------------------------------------------
      // 3. Sauvegarder le résultat
      // ----------------------------------------------------

      await saveCache(result.pointOfSales);

      set({
        pointOfSales: result.pointOfSales,

        isLoading: false,
        isOffline: false,
        error: null,
      });
    } catch (error) {
      // ----------------------------------------------------
      // Le cache reste prioritaire si disponible
      // ----------------------------------------------------

      const cachedPointOfSales = await loadCache();

      if (cachedPointOfSales.length > 0) {
        set({
          pointOfSales: cachedPointOfSales,

          isLoading: false,
          isOffline: true,
          error: null,
        });

        return;
      }

      // ----------------------------------------------------
      // Aucun cache disponible
      // ----------------------------------------------------

      const message = getErrorMessage(
        error,
        "Impossible de récupérer les points de vente.",
      );

      set({
        isLoading: false,
        isOffline: true,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // RAFRAÎCHISSEMENT
  // ========================================================

  refreshPointOfSales: async () => {
    try {
      set({
        isRefreshing: true,
        error: null,
      });

      const response = await api.get<PointOfSalesResponse>("/point-of-sale");

      const result = response.data;

      if (!result.success || !result.pointOfSales) {
        throw new Error(
          result.message || "Impossible de synchroniser les points de vente.",
        );
      }

      await saveCache(result.pointOfSales);

      set({
        pointOfSales: result.pointOfSales,

        isRefreshing: false,
        isOffline: false,
        error: null,
      });
    } catch (error) {
      const cachedPointOfSales = await loadCache();

      // ----------------------------------------------------
      // Si le cache existe, on ne montre aucune erreur
      // ----------------------------------------------------

      if (cachedPointOfSales.length > 0) {
        set({
          pointOfSales: cachedPointOfSales,

          isRefreshing: false,
          isOffline: true,
          error: null,
        });

        return;
      }

      const message = getErrorMessage(
        error,
        "Impossible de synchroniser les points de vente.",
      );

      set({
        isRefreshing: false,
        isOffline: true,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // RÉCUPÉRER UN POINT DE VENTE
  // ========================================================

  getPointOfSale: async (id) => {
    const localPointOfSale = get().pointOfSales.find(
      (pointOfSale) => pointOfSale.id === id,
    );

    try {
      const response = await api.get<PointOfSaleResponse>(
        `/point-of-sale/${id}`,
      );

      const result = response.data;

      if (!result.success || !result.pointOfSale) {
        throw new Error(result.message || "Point de vente introuvable.");
      }

      const updatedPointOfSale = result.pointOfSale;

      const updatedPointOfSales = get().pointOfSales.map((pointOfSale) =>
        pointOfSale.id === id ? updatedPointOfSale : pointOfSale,
      );

      await saveCache(updatedPointOfSales);

      set({
        pointOfSales: updatedPointOfSales,

        selectedPointOfSale: updatedPointOfSale,

        isOffline: false,
      });

      return updatedPointOfSale;
    } catch (error) {
      if (localPointOfSale) {
        set({
          selectedPointOfSale: localPointOfSale,

          isOffline: true,
        });

        return localPointOfSale;
      }

      throw error;
    }
  },

  // ========================================================
  // CRÉER
  // ========================================================

  createPointOfSale: async (data) => {
    try {
      set({
        isSaving: true,
        error: null,
      });

      const response = await api.post<PointOfSaleResponse>(
        "/point-of-sale",
        data,
      );

      const result = response.data;

      if (!result.success || !result.pointOfSale) {
        throw new Error(
          result.message || "Impossible de créer le point de vente.",
        );
      }

      const pointOfSale = result.pointOfSale;

      const updatedPointOfSales = [...get().pointOfSales, pointOfSale];

      await saveCache(updatedPointOfSales);

      set({
        pointOfSales: updatedPointOfSales,

        selectedPointOfSale: pointOfSale,

        isSaving: false,
        isOffline: false,
        error: null,
      });

      return pointOfSale;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de créer le point de vente.",
      );

      set({
        isSaving: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // MODIFIER
  // ========================================================

  updatePointOfSale: async (id, data) => {
    try {
      set({
        isSaving: true,
        error: null,
      });

      const response = await api.patch<PointOfSaleResponse>(
        `/point-of-sale/${id}`,
        data,
      );

      const result = response.data;

      if (!result.success || !result.pointOfSale) {
        throw new Error(
          result.message || "Impossible de modifier le point de vente.",
        );
      }

      const pointOfSale = result.pointOfSale;

      const updatedPointOfSales = get().pointOfSales.map((item) =>
        item.id === id ? pointOfSale : item,
      );

      await saveCache(updatedPointOfSales);

      set({
        pointOfSales: updatedPointOfSales,

        selectedPointOfSale: pointOfSale,

        isSaving: false,
        isOffline: false,
        error: null,
      });

      return pointOfSale;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de modifier le point de vente.",
      );

      set({
        isSaving: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // SUPPRIMER
  // ========================================================

  deletePointOfSale: async (id) => {
    try {
      set({
        isDeleting: true,
        error: null,
      });

      const response = await api.delete<PointOfSaleResponse>(
        `/point-of-sale/${id}`,
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(
          result.message || "Impossible de supprimer le point de vente.",
        );
      }

      const updatedPointOfSales = get().pointOfSales.filter(
        (pointOfSale) => pointOfSale.id !== id,
      );

      await saveCache(updatedPointOfSales);

      const selectedPointOfSale = get().selectedPointOfSale;

      set({
        pointOfSales: updatedPointOfSales,

        selectedPointOfSale:
          selectedPointOfSale?.id === id ? null : selectedPointOfSale,

        isDeleting: false,
        isOffline: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de supprimer le point de vente.",
      );

      set({
        isDeleting: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // POINT DE VENTE SÉLECTIONNÉ
  // ========================================================

  setSelectedPointOfSale: (pointOfSale) => {
    set({
      selectedPointOfSale: pointOfSale,
    });
  },

  // ========================================================
  // ERREUR
  // ========================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ========================================================
  // RESET
  // ========================================================

  reset: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);

    set({
      pointOfSales: [],
      selectedPointOfSale: null,

      isLoading: false,
      isRefreshing: false,
      isSaving: false,
      isDeleting: false,

      isOffline: false,
      error: null,
    });
  },
}));
