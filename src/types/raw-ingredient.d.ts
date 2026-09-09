export type RawIngredientUnit =
  | "PIECE"
  | "GRAM"
  | "KILOGRAM"
  | "MILLILITER"
  | "LITER";

export interface RawIngredient {
  id: string;
  shopId: string;
  name: string;
  unit: RawIngredientUnit;

  stockQty: number;
  minAlert: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateRawIngredientPayload {
  name: string;
  unit: RawIngredientUnit;
  stockQty?: number;
  minAlert?: number;
  isActive?: boolean;
}

export interface UpdateRawIngredientPayload {
  name: string;
  unit: RawIngredientUnit;
  minAlert: number;
  isActive?: boolean;
}

export interface AdjustRawIngredientStockPayload {
  quantity: number;
  note?: string;
}

export interface RawIngredientResponse {
  success: boolean;
  message?: string;
  rawIngredient?: RawIngredient;
}

export interface RawIngredientsResponse {
  success: boolean;
  message?: string;
  rawIngredients?: RawIngredient[];
}

export interface DeleteRawIngredientResponse {
  success: boolean;
  message?: string;
}
