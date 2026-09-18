import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { api } from "@/utils/api";
import type {
  AdjustPackagingStockPayload,
  CreatePackagingPayload,
  DeletePackagingResponse,
  Packaging,
  PackagingResponse,
  PackagingsResponse,
  UpdatePackagingPayload,
} from "@/types/packaging";

const STORAGE_KEY = "jardin-packagings-storage";
interface PackagingState {
  packagings: Packaging[];

  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isAdjustingStock: boolean;
  isDeleting: boolean;

  isInitialized: boolean;
  isOffline: boolean;

  error: string | null;

  initialize: () => Promise<void>;

  fetchPackagings: () => Promise<void>;

  refreshPackagings: () => Promise<void>;

  createPackaging: (data: CreatePackagingPayload) => Promise<Packaging>;

  updatePackaging: (
    id: string,
    data: UpdatePackagingPayload,
  ) => Promise<Packaging>;

  adjustPackagingStock: (
    id: string,
    data: AdjustPackagingStockPayload,
  ) => Promise<Packaging>;

  setPackagingActive: (id: string, isActive: boolean) => Promise<Packaging>;

  deletePackaging: (id: string) => Promise<void>;

  clearError: () => void;

  reset: () => Promise<void>;
}

const normalizePackaging = (packaging: Packaging): Packaging => {
  return {
    ...packaging,

    capacityMl: Number(packaging.capacityMl),

    stockQty: Number(packaging.stockQty),

    minAlert: Number(packaging.minAlert),
  };
};
const normalizePackagings = (packagings: Packaging[]): Packaging[] => {
  return packagings.map(normalizePackaging);
};
const saveCache = async (packagings: Packaging[]) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        packagings,
      }),
    );
  } catch (error) {
    console.error("Erreur sauvegarde cache emballages :", error);
  }
};
const loadCache = async (): Promise<Packaging[]> => {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed = JSON.parse(storage);

    if (!Array.isArray(parsed?.packagings)) {
      return [];
    }

    return normalizePackagings(parsed.packagings);
  } catch (error) {
    console.error("Erreur lecture cache emballages :", error);

    return [];
  }
};
const replacePackaging = (packagings: Packaging[], packaging: Packaging) => {
  const normalizedPackaging = normalizePackaging(packaging);

  const index = packagings.findIndex(
    (item) => item.id === normalizedPackaging.id,
  );

  if (index === -1) {
    return [...packagings, normalizedPackaging];
  }

  const next = [...packagings];

  next[index] = normalizedPackaging;

  return next;
};

export const usePackagingStore = create<PackagingState>()((set, get) => ({
  packagings: [],

  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  isUpdating: false,
  isAdjustingStock: false,
  isDeleting: false,

  isInitialized: false,
  isOffline: false,

  error: null,

  // ========================================================
  // INITIALISATION
  // ========================================================

  initialize: async () => {
    if (get().isInitialized) {
      return;
    }

    set({
      isLoading: true,
      error: null,
    });

    try {
      const cachedPackagings = await loadCache();

      if (cachedPackagings.length > 0) {
        set({
          packagings: cachedPackagings,
        });
      }

      try {
        const response = await api.get<PackagingsResponse>("/packaging");

        const result = response.data;

        if (!result.success || !result.packagings) {
          throw new Error(
            result.message || "Impossible de récupérer les emballages.",
          );
        }

        const packagings = normalizePackagings(result.packagings);

        set({
          packagings,
          isOffline: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        await saveCache(packagings);

        return;
      } catch (error) {
        console.warn(
          "Serveur indisponible, utilisation du cache emballages.",
          error,
        );

        set({
          isOffline: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        return;
      }
    } catch (error) {
      console.error("Erreur initialisation emballages :", error);

      set({
        isInitialized: true,
        isLoading: false,
        isOffline: true,
        error: "Impossible de charger les emballages.",
      });
    }
  },

  // ========================================================
  // FETCH
  // ========================================================

  fetchPackagings: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const response = await api.get<PackagingsResponse>("/packaging");

      const result = response.data;

      if (!result.success || !result.packagings) {
        throw new Error(
          result.message || "Impossible de récupérer les emballages.",
        );
      }

      const packagings = normalizePackagings(result.packagings);

      set({
        packagings,
        isLoading: false,
        isOffline: false,
        isInitialized: true,
        error: null,
      });

      await saveCache(packagings);
    } catch (error) {
      console.warn("Impossible de synchroniser les emballages.", error);

      const cachedPackagings = await loadCache();

      if (cachedPackagings.length > 0) {
        set({
          packagings: cachedPackagings,
          isLoading: false,
          isOffline: true,
          isInitialized: true,
          error: null,
        });

        return;
      }

      set({
        isLoading: false,
        isOffline: true,
        isInitialized: true,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de charger les emballages.",
      });

      throw error;
    }
  },

  // ========================================================
  // REFRESH
  // ========================================================

  refreshPackagings: async () => {
    if (get().isRefreshing) {
      return;
    }

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const response = await api.get<PackagingsResponse>("/packaging");

      const result = response.data;

      if (!result.success || !result.packagings) {
        throw new Error(
          result.message || "Impossible d'actualiser les emballages.",
        );
      }

      const packagings = normalizePackagings(result.packagings);

      set({
        packagings,
        isRefreshing: false,
        isOffline: false,
        isInitialized: true,
        error: null,
      });

      await saveCache(packagings);
    } catch (error) {
      console.warn("Actualisation emballages impossible.", error);

      set({
        isRefreshing: false,
        isOffline: true,
        error: null,
      });
    }
  },

  // ========================================================
  // CREATE
  // ========================================================

  createPackaging: async (data) => {
    if (get().isCreating) {
      throw new Error("CREATE_ALREADY_IN_PROGRESS");
    }

    set({
      isCreating: true,
      error: null,
    });

    try {
      const response = await api.post<PackagingResponse>("/packaging", data);

      const result = response.data;

      if (!result.success || !result.packaging) {
        throw new Error(result.message || "Impossible de créer l'emballage.");
      }

      const packaging = normalizePackaging(result.packaging);

      const packagings = replacePackaging(get().packagings, packaging);

      set({
        packagings,
        isCreating: false,
        isOffline: false,
        error: null,
      });

      await saveCache(packagings);

      return packaging;
    } catch (error) {
      console.error("Erreur création emballage :", error);

      set({
        isCreating: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer l'emballage.",
      });

      throw error;
    }
  },

  // ========================================================
  // UPDATE
  // ========================================================

  updatePackaging: async (id, data) => {
    if (get().isUpdating) {
      throw new Error("UPDATE_ALREADY_IN_PROGRESS");
    }

    set({
      isUpdating: true,
      error: null,
    });

    try {
      const response = await api.patch<PackagingResponse>(
        `/packaging/${id}`,
        data,
      );

      const result = response.data;

      if (!result.success || !result.packaging) {
        throw new Error(
          result.message || "Impossible de modifier l'emballage.",
        );
      }

      const packaging = normalizePackaging(result.packaging);

      const packagings = replacePackaging(get().packagings, packaging);

      set({
        packagings,
        isUpdating: false,
        isOffline: false,
        error: null,
      });

      await saveCache(packagings);

      return packaging;
    } catch (error) {
      console.error("Erreur modification emballage :", error);

      set({
        isUpdating: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de modifier l'emballage.",
      });

      throw error;
    }
  },

  // ========================================================
  // ADJUST STOCK
  // ========================================================

  adjustPackagingStock: async (id, data) => {
    if (get().isAdjustingStock) {
      throw new Error("STOCK_ADJUSTMENT_ALREADY_IN_PROGRESS");
    }

    set({
      isAdjustingStock: true,
      error: null,
    });

    try {
      const response = await api.patch<PackagingResponse>(
        `/packaging/${id}/stock`,
        data,
      );

      const result = response.data;

      if (!result.success || !result.packaging) {
        throw new Error(result.message || "Impossible d'ajuster le stock.");
      }

      const packaging = normalizePackaging(result.packaging);

      const packagings = replacePackaging(get().packagings, packaging);

      set({
        packagings,
        isAdjustingStock: false,
        isOffline: false,
        error: null,
      });

      await saveCache(packagings);

      return packaging;
    } catch (error) {
      console.error("Erreur ajustement stock emballage :", error);

      set({
        isAdjustingStock: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible d'ajuster le stock.",
      });

      throw error;
    }
  },

  // ========================================================
  // ACTIVE / INACTIVE
  // ========================================================

  setPackagingActive: async (id, isActive) => {
    if (get().isUpdating) {
      throw new Error("UPDATE_ALREADY_IN_PROGRESS");
    }

    set({
      isUpdating: true,
      error: null,
    });

    try {
      const packaging = get().packagings.find((item) => item.id === id);

      if (!packaging) {
        throw new Error("PACKAGING_NOT_FOUND");
      }

      const response = await api.patch<PackagingResponse>(`/packaging/${id}`, {
        name: packaging.name,
        size: packaging.size,
        capacityMl: packaging.capacityMl,
        minAlert: packaging.minAlert,
        isActive,
      });

      const result = response.data;

      if (!result.success || !result.packaging) {
        throw new Error(result.message || "Impossible de modifier le statut.");
      }

      const updatedPackaging = normalizePackaging(result.packaging);

      const packagings = replacePackaging(get().packagings, updatedPackaging);

      set({
        packagings,
        isUpdating: false,
        isOffline: false,
        error: null,
      });

      await saveCache(packagings);

      return updatedPackaging;
    } catch (error) {
      console.error("Erreur modification statut emballage :", error);

      set({
        isUpdating: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de modifier le statut.",
      });

      throw error;
    }
  },

  // ========================================================
  // DELETE
  // ========================================================

  deletePackaging: async (id) => {
    if (get().isDeleting) {
      throw new Error("DELETE_ALREADY_IN_PROGRESS");
    }

    set({
      isDeleting: true,
      error: null,
    });

    try {
      const response = await api.delete<DeletePackagingResponse>(
        `/packaging/${id}`,
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(
          result.message || "Impossible de supprimer l'emballage.",
        );
      }

      const packagings = get().packagings.filter((item) => item.id !== id);

      set({
        packagings,
        isDeleting: false,
        isOffline: false,
        error: null,
      });

      await saveCache(packagings);
    } catch (error) {
      console.error("Erreur suppression emballage :", error);

      set({
        isDeleting: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer l'emballage.",
      });

      throw error;
    }
  },

  // ========================================================
  // ERROR
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
    set({
      packagings: [],

      isLoading: false,
      isRefreshing: false,
      isCreating: false,
      isUpdating: false,
      isAdjustingStock: false,
      isDeleting: false,

      isInitialized: false,
      isOffline: false,

      error: null,
    });

    await AsyncStorage.removeItem(STORAGE_KEY);
  },
}));
