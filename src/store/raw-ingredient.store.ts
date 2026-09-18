import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { api } from "@/utils/api";

import type {
  AdjustRawIngredientStockPayload,
  CreateRawIngredientPayload,
  DeleteRawIngredientResponse,
  RawIngredient,
  RawIngredientResponse,
  RawIngredientsResponse,
  UpdateRawIngredientPayload,
} from "@/types/raw-ingredient";

const STORAGE_KEY = "jardin-raw-ingredients-storage";

interface RawIngredientState {
  rawIngredients: RawIngredient[];

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

  fetchRawIngredients: () => Promise<void>;

  refreshRawIngredients: () => Promise<void>;

  createRawIngredient: (
    data: CreateRawIngredientPayload,
  ) => Promise<RawIngredient>;

  updateRawIngredient: (
    id: string,
    data: UpdateRawIngredientPayload,
  ) => Promise<RawIngredient>;

  adjustRawIngredientStock: (
    id: string,
    data: AdjustRawIngredientStockPayload,
  ) => Promise<RawIngredient>;

  setRawIngredientActive: (
    id: string,
    isActive: boolean,
  ) => Promise<RawIngredient>;

  deleteRawIngredient: (id: string) => Promise<void>;

  clearError: () => void;

  reset: () => Promise<void>;
}

const normalizeRawIngredient = (ingredient: RawIngredient): RawIngredient => {
  return {
    ...ingredient,

    stockQty: Number(ingredient.stockQty),

    minAlert: Number(ingredient.minAlert),
  };
};

const normalizeRawIngredients = (
  ingredients: RawIngredient[],
): RawIngredient[] => {
  return ingredients.map(normalizeRawIngredient);
};

const saveCache = async (rawIngredients: RawIngredient[]) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rawIngredients,
      }),
    );
  } catch (error) {
    console.error("Erreur sauvegarde cache matières premières :", error);
  }
};

const loadCache = async (): Promise<RawIngredient[]> => {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed = JSON.parse(storage);

    if (!Array.isArray(parsed?.rawIngredients)) {
      return [];
    }

    return normalizeRawIngredients(parsed.rawIngredients);
  } catch (error) {
    console.error("Erreur lecture cache matières premières :", error);

    return [];
  }
};

const replaceIngredient = (
  ingredients: RawIngredient[],
  ingredient: RawIngredient,
) => {
  const normalizedIngredient = normalizeRawIngredient(ingredient);

  const index = ingredients.findIndex(
    (item) => item.id === normalizedIngredient.id,
  );

  if (index === -1) {
    return [...ingredients, normalizedIngredient];
  }

  const next = [...ingredients];

  next[index] = normalizedIngredient;

  return next;
};

export const useRawIngredientStore = create<RawIngredientState>()(
  (set, get) => ({
    rawIngredients: [],

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
        // ----------------------------------------------------
        // 1. Afficher immédiatement le cache
        // ----------------------------------------------------

        const cachedIngredients = await loadCache();

        if (cachedIngredients.length > 0) {
          set({
            rawIngredients: cachedIngredients,
          });
        }

        // ----------------------------------------------------
        // 2. Synchroniser avec le serveur
        // ----------------------------------------------------

        try {
          const response =
            await api.get<RawIngredientsResponse>("/raw-ingredient");

          const result = response.data;

          if (!result.success || !result.rawIngredients) {
            throw new Error(
              result.message ||
                "Impossible de récupérer les matières premières.",
            );
          }

          const rawIngredients = normalizeRawIngredients(result.rawIngredients);

          set({
            rawIngredients,
            isOffline: false,
            isInitialized: true,
            isLoading: false,
            error: null,
          });

          await saveCache(rawIngredients);

          return;
        } catch (error) {
          console.warn(
            "Serveur indisponible, utilisation du cache matières premières.",
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
        console.error("Erreur initialisation matières premières :", error);

        set({
          isInitialized: true,
          isLoading: false,
          isOffline: true,
          error: "Impossible de charger les matières premières.",
        });
      }
    },

    // ========================================================
    // FETCH
    // ========================================================

    fetchRawIngredients: async () => {
      try {
        set({
          isLoading: true,
          error: null,
        });

        const response =
          await api.get<RawIngredientsResponse>("/raw-ingredient");

        const result = response.data;

        if (!result.success || !result.rawIngredients) {
          throw new Error(
            result.message || "Impossible de récupérer les matières premières.",
          );
        }

        const rawIngredients = normalizeRawIngredients(result.rawIngredients);

        set({
          rawIngredients,
          isLoading: false,
          isOffline: false,
          isInitialized: true,
          error: null,
        });

        await saveCache(rawIngredients);
      } catch (error) {
        console.warn(
          "Impossible de synchroniser les matières premières.",
          error,
        );

        const cachedIngredients = await loadCache();

        if (cachedIngredients.length > 0) {
          set({
            rawIngredients: cachedIngredients,
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
              : "Impossible de charger les matières premières.",
        });

        throw error;
      }
    },

    // ========================================================
    // REFRESH
    // ========================================================

    refreshRawIngredients: async () => {
      if (get().isRefreshing) {
        return;
      }

      set({
        isRefreshing: true,
        error: null,
      });

      try {
        const response =
          await api.get<RawIngredientsResponse>("/raw-ingredient");

        const result = response.data;

        if (!result.success || !result.rawIngredients) {
          throw new Error(
            result.message || "Impossible d'actualiser les matières premières.",
          );
        }

        const rawIngredients = normalizeRawIngredients(result.rawIngredients);

        set({
          rawIngredients,
          isRefreshing: false,
          isOffline: false,
          isInitialized: true,
          error: null,
        });

        await saveCache(rawIngredients);
      } catch (error) {
        console.warn("Actualisation matières premières impossible.", error);

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

    createRawIngredient: async (data) => {
      if (get().isCreating) {
        throw new Error("CREATE_ALREADY_IN_PROGRESS");
      }

      set({
        isCreating: true,
        error: null,
      });

      try {
        const response = await api.post<RawIngredientResponse>(
          "/raw-ingredient",
          data,
        );

        const result = response.data;

        if (!result.success || !result.rawIngredient) {
          throw new Error(
            result.message || "Impossible de créer la matière première.",
          );
        }

        const rawIngredient = normalizeRawIngredient(result.rawIngredient);

        const rawIngredients = replaceIngredient(
          get().rawIngredients,
          rawIngredient,
        );

        set({
          rawIngredients,
          isCreating: false,
          isOffline: false,
          error: null,
        });

        await saveCache(rawIngredients);

        return rawIngredient;
      } catch (error) {
        console.error("Erreur création matière première :", error);

        set({
          isCreating: false,
          error:
            error instanceof Error
              ? error.message
              : "Impossible de créer la matière première.",
        });

        throw error;
      }
    },

    // ========================================================
    // UPDATE
    // ========================================================

    updateRawIngredient: async (id, data) => {
      if (get().isUpdating) {
        throw new Error("UPDATE_ALREADY_IN_PROGRESS");
      }

      set({
        isUpdating: true,
        error: null,
      });

      try {
        const response = await api.patch<RawIngredientResponse>(
          `/raw-ingredient/${id}`,
          data,
        );

        const result = response.data;

        if (!result.success || !result.rawIngredient) {
          throw new Error(
            result.message || "Impossible de modifier la matière première.",
          );
        }

        const rawIngredient = normalizeRawIngredient(result.rawIngredient);

        const rawIngredients = replaceIngredient(
          get().rawIngredients,
          rawIngredient,
        );

        set({
          rawIngredients,
          isUpdating: false,
          isOffline: false,
          error: null,
        });

        await saveCache(rawIngredients);

        return rawIngredient;
      } catch (error) {
        console.error("Erreur modification matière première :", error);

        set({
          isUpdating: false,
          error:
            error instanceof Error
              ? error.message
              : "Impossible de modifier la matière première.",
        });

        throw error;
      }
    },

    // ========================================================
    // AJUSTEMENT STOCK
    // ========================================================

    adjustRawIngredientStock: async (id, data) => {
      if (get().isAdjustingStock) {
        throw new Error("STOCK_ADJUSTMENT_ALREADY_IN_PROGRESS");
      }

      set({
        isAdjustingStock: true,
        error: null,
      });

      try {
        const response = await api.patch<RawIngredientResponse>(
          `/raw-ingredient/${id}/stock`,
          data,
        );

        const result = response.data;

        if (!result.success || !result.rawIngredient) {
          throw new Error(result.message || "Impossible d'ajuster le stock.");
        }

        const rawIngredient = normalizeRawIngredient(result.rawIngredient);

        const rawIngredients = replaceIngredient(
          get().rawIngredients,
          rawIngredient,
        );

        set({
          rawIngredients,
          isAdjustingStock: false,
          isOffline: false,
          error: null,
        });

        await saveCache(rawIngredients);

        return rawIngredient;
      } catch (error) {
        console.error("Erreur ajustement stock matière première :", error);

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
    // ACTIVER / DÉSACTIVER
    // ========================================================

    setRawIngredientActive: async (id, isActive) => {
      if (get().isUpdating) {
        throw new Error("UPDATE_ALREADY_IN_PROGRESS");
      }

      set({
        isUpdating: true,
        error: null,
      });

      try {
        const ingredient = get().rawIngredients.find((item) => item.id === id);

        if (!ingredient) {
          throw new Error("RAW_INGREDIENT_NOT_FOUND");
        }

        const response = await api.patch<RawIngredientResponse>(
          `/raw-ingredient/${id}`,
          {
            name: ingredient.name,
            unit: ingredient.unit,
            minAlert: ingredient.minAlert,
            isActive,
          },
        );

        const result = response.data;

        if (!result.success || !result.rawIngredient) {
          throw new Error(
            result.message || "Impossible de modifier le statut.",
          );
        }

        const rawIngredient = normalizeRawIngredient(result.rawIngredient);

        const rawIngredients = replaceIngredient(
          get().rawIngredients,
          rawIngredient,
        );

        set({
          rawIngredients,
          isUpdating: false,
          isOffline: false,
          error: null,
        });

        await saveCache(rawIngredients);

        return rawIngredient;
      } catch (error) {
        console.error("Erreur modification statut matière première :", error);

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

    deleteRawIngredient: async (id) => {
      if (get().isDeleting) {
        throw new Error("DELETE_ALREADY_IN_PROGRESS");
      }

      set({
        isDeleting: true,
        error: null,
      });

      try {
        const response = await api.delete<DeleteRawIngredientResponse>(
          `/raw-ingredient/${id}`,
        );

        const result = response.data;

        if (!result.success) {
          throw new Error(
            result.message || "Impossible de supprimer la matière première.",
          );
        }

        const rawIngredients = get().rawIngredients.filter(
          (item) => item.id !== id,
        );

        set({
          rawIngredients,
          isDeleting: false,
          isOffline: false,
          error: null,
        });

        await saveCache(rawIngredients);
      } catch (error) {
        console.error("Erreur suppression matière première :", error);

        set({
          isDeleting: false,
          error:
            error instanceof Error
              ? error.message
              : "Impossible de supprimer la matière première.",
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
        rawIngredients: [],

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
  }),
);
