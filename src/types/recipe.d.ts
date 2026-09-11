// ======================================================
// ÉLÉMENT DE RECETTE
// ======================================================

export interface RecipeItem {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
}

// ======================================================
// RECETTE
// ======================================================

export interface Recipe {
  id: string;

  /**
   * Une recette appartient à un seul produit.
   */
  productId: string;

  name: string;

  description: string | null;

  /**
   * Volume de référence de la recette.
   *
   * Exemple :
   * 2000 ml → recette prévue pour un batch de 2 L.
   */
  productionVolumeMl: number;

  createdAt: string;
  updatedAt: string;

  items: RecipeItem[];
}

// ======================================================
// CRÉATION — ÉLÉMENT
// ======================================================

export interface CreateRecipeItemPayload {
  ingredientId: string;
  quantity: number;
}

// ======================================================
// CRÉATION — RECETTE
// ======================================================

export interface CreateRecipePayload {
  /**
   * Produit auquel la recette doit être rattachée.
   */
  productId: string;

  name: string;
  description?: string;
  productionVolumeMl: number;
  items: CreateRecipeItemPayload[];
}

// ======================================================
// MODIFICATION — ÉLÉMENT
// ======================================================

export interface UpdateRecipeItemPayload {
  /**
   * Présent pour un ingrédient existant.
   * Absent pour un nouvel ingrédient.
   */
  id?: string;

  ingredientId: string;
  quantity: number;
}

// ======================================================
// MODIFICATION — RECETTE
// ======================================================

export interface UpdateRecipePayload {
  name: string;
  description?: string;
  productionVolumeMl: number;
  items: UpdateRecipeItemPayload[];
}

// ======================================================
// RÉPONSES API
// ======================================================

export interface RecipesResponse {
  success: boolean;
  message?: string;

  data?: {
    recipes: Recipe[];
  };
}

export interface RecipeResponse {
  success: boolean;
  message?: string;

  data?: {
    recipe: Recipe;
  };
}

export interface DeleteRecipeResponse {
  success: boolean;
  message?: string;

  data?: {
    recipe: Recipe;
  };
}
