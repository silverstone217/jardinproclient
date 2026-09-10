export interface RecipeItem {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  productionVolumeMl: number;
  createdAt: string;
  updatedAt: string;
  items: RecipeItem[];
}

export interface CreateRecipeItemPayload {
  ingredientId: string;
  quantity: number;
}

export interface CreateRecipePayload {
  name: string;
  description?: string;
  productionVolumeMl: number;
  items: CreateRecipeItemPayload[];
}

export interface UpdateRecipeItemPayload {
  id?: string;
  ingredientId: string;
  quantity: number;
}

export interface UpdateRecipePayload {
  name: string;
  description?: string;
  productionVolumeMl: number;
  items: UpdateRecipeItemPayload[];
}

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
