import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { api } from "@/utils/api";

import type {
  CreateRecipePayload,
  DeleteRecipeResponse,
  Recipe,
  RecipeResponse,
  RecipesResponse,
  UpdateRecipePayload,
} from "@/types/recipe";

const STORAGE_KEY = "jardin-recipes-storage";

interface RecipeState {
  recipes: Recipe[];

  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  isInitialized: boolean;
  isOffline: boolean;

  error: string | null;

  initialize: () => Promise<void>;
  fetchRecipes: () => Promise<void>;
  refreshRecipes: () => Promise<void>;

  getRecipeById: (id: string) => Recipe | undefined;

  createRecipe: (data: CreateRecipePayload) => Promise<Recipe>;

  updateRecipe: (id: string, data: UpdateRecipePayload) => Promise<Recipe>;

  deleteRecipe: (id: string) => Promise<Recipe>;

  clearError: () => void;
  reset: () => Promise<void>;
}

// ========================================================
// NORMALISATION
// ========================================================

const normalizeRecipe = (recipe: Recipe): Recipe => ({
  ...recipe,

  productionVolumeMl: Number(recipe.productionVolumeMl),

  items: Array.isArray(recipe.items)
    ? recipe.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
      }))
    : [],
});

const normalizeRecipes = (recipes: Recipe[]): Recipe[] =>
  recipes.map(normalizeRecipe);

// ========================================================
// CACHE
// ========================================================

const saveCache = async (recipes: Recipe[]) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        recipes,
      }),
    );
  } catch (error) {
    console.error("Erreur sauvegarde cache recettes :", error);
  }
};

const loadCache = async (): Promise<Recipe[]> => {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed = JSON.parse(storage);

    if (!Array.isArray(parsed?.recipes)) {
      return [];
    }

    return normalizeRecipes(parsed.recipes);
  } catch (error) {
    console.error("Erreur lecture cache recettes :", error);

    return [];
  }
};

// ========================================================
// REMPLACER UNE RECETTE
// ========================================================

const replaceRecipe = (recipes: Recipe[], recipe: Recipe): Recipe[] => {
  const normalizedRecipe = normalizeRecipe(recipe);

  const index = recipes.findIndex((item) => item.id === normalizedRecipe.id);

  if (index === -1) {
    return [...recipes, normalizedRecipe];
  }

  const next = [...recipes];

  next[index] = normalizedRecipe;

  return next;
};

// ========================================================
// STORE
// ========================================================

export const useRecipeStore = create<RecipeState>()((set, get) => ({
  recipes: [],

  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  isInitialized: false,
  isOffline: false,

  error: null,

  // ==================================================
  // INITIALISATION
  // ==================================================

  initialize: async () => {
    if (get().isInitialized) {
      return;
    }

    set({
      isLoading: true,
      error: null,
    });

    try {
      const cachedRecipes = await loadCache();

      if (cachedRecipes.length > 0) {
        set({
          recipes: cachedRecipes,
        });
      }

      try {
        const response = await api.get<RecipesResponse>("/recipes");

        const result = response.data;

        if (!result.success || !result.data) {
          throw new Error(
            result.message || "Impossible de récupérer les recettes.",
          );
        }

        const recipes = normalizeRecipes(result.data.recipes);

        set({
          recipes,
          isOffline: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        await saveCache(recipes);
      } catch (error) {
        console.warn(
          "Serveur indisponible, utilisation du cache recettes.",
          error,
        );

        set({
          isOffline: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Erreur initialisation recettes :", error);

      set({
        isInitialized: true,
        isLoading: false,
        isOffline: true,
        error: "Impossible de charger les recettes.",
      });
    }
  },

  // ==================================================
  // FETCH
  // ==================================================

  fetchRecipes: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const response = await api.get<RecipesResponse>("/recipes");

      const result = response.data;

      if (!result.success || !result.data) {
        throw new Error(
          result.message || "Impossible de récupérer les recettes.",
        );
      }

      const recipes = normalizeRecipes(result.data.recipes);

      set({
        recipes,
        isLoading: false,
        isOffline: false,
        isInitialized: true,
        error: null,
      });

      await saveCache(recipes);
    } catch (error) {
      const cachedRecipes = await loadCache();

      if (cachedRecipes.length > 0) {
        set({
          recipes: cachedRecipes,
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
            : "Impossible de charger les recettes.",
      });

      throw error;
    }
  },

  // ==================================================
  // REFRESH
  // ==================================================

  refreshRecipes: async () => {
    if (get().isRefreshing) {
      return;
    }

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const response = await api.get<RecipesResponse>("/recipes");

      const result = response.data;

      if (!result.success || !result.data) {
        throw new Error(
          result.message || "Impossible d'actualiser les recettes.",
        );
      }

      const recipes = normalizeRecipes(result.data.recipes);

      set({
        recipes,
        isRefreshing: false,
        isOffline: false,
        error: null,
      });

      await saveCache(recipes);
    } catch (error) {
      console.warn("Actualisation recettes impossible.", error);

      set({
        isRefreshing: false,
        isOffline: true,
        error: null,
      });
    }
  },

  // ==================================================
  // GET BY ID
  // ==================================================

  getRecipeById: (id) => get().recipes.find((recipe) => recipe.id === id),

  // ==================================================
  // CREATE
  // ==================================================

  createRecipe: async (data) => {
    if (get().isCreating) {
      throw new Error("CREATE_ALREADY_IN_PROGRESS");
    }

    set({
      isCreating: true,
      error: null,
    });

    try {
      const response = await api.post<RecipeResponse>("/recipes", data);

      const result = response.data;

      if (!result.success || !result.data?.recipe) {
        throw new Error(result.message || "Impossible de créer la recette.");
      }

      const recipe = normalizeRecipe(result.data.recipe);

      const recipes = replaceRecipe(get().recipes, recipe);

      set({
        recipes,
        isCreating: false,
        isOffline: false,
        error: null,
      });

      await saveCache(recipes);

      return recipe;
    } catch (error) {
      console.error("Erreur création recette :", error);

      set({
        isCreating: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer la recette.",
      });

      throw error;
    }
  },

  // ==================================================
  // UPDATE
  // ==================================================

  updateRecipe: async (id, data) => {
    if (get().isUpdating) {
      throw new Error("UPDATE_ALREADY_IN_PROGRESS");
    }

    set({
      isUpdating: true,
      error: null,
    });

    try {
      const response = await api.patch<RecipeResponse>(`/recipes/${id}`, data);

      const result = response.data;

      if (!result.success || !result.data?.recipe) {
        throw new Error(result.message || "Impossible de modifier la recette.");
      }

      const recipe = normalizeRecipe(result.data.recipe);

      const recipes = replaceRecipe(get().recipes, recipe);

      set({
        recipes,
        isUpdating: false,
        isOffline: false,
        error: null,
      });

      await saveCache(recipes);

      return recipe;
    } catch (error) {
      console.error("Erreur modification recette :", error);

      set({
        isUpdating: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de modifier la recette.",
      });

      throw error;
    }
  },

  // ==================================================
  // DELETE
  // ==================================================

  deleteRecipe: async (id) => {
    if (get().isDeleting) {
      throw new Error("DELETE_ALREADY_IN_PROGRESS");
    }

    set({
      isDeleting: true,
      error: null,
    });

    try {
      const response = await api.delete<DeleteRecipeResponse>(`/recipes/${id}`);

      const result = response.data;

      if (!result.success || !result.data?.recipe) {
        throw new Error(
          result.message || "Impossible de supprimer la recette.",
        );
      }

      const recipe = normalizeRecipe(result.data.recipe);

      const recipes = get().recipes.filter((item) => item.id !== id);

      set({
        recipes,
        isDeleting: false,
        isOffline: false,
        error: null,
      });

      await saveCache(recipes);

      return recipe;
    } catch (error) {
      console.error("Erreur suppression recette :", error);

      set({
        isDeleting: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer la recette.",
      });

      throw error;
    }
  },

  // ==================================================
  // ERROR
  // ==================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ==================================================
  // RESET
  // ==================================================

  reset: async () => {
    set({
      recipes: [],

      isLoading: false,
      isRefreshing: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,

      isInitialized: false,
      isOffline: false,

      error: null,
    });

    await AsyncStorage.removeItem(STORAGE_KEY);
  },
}));
