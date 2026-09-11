export interface ProductVariant {
  id: string;
  productId: string;
  packagingId: string;
  sku: string;
  price: number;
  shelfLifeDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ======================================================
// RECETTE
// ======================================================

export interface ProductRecipeItem {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
}

export interface ProductRecipe {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  productionVolumeMl: number;
  createdAt: string;
  updatedAt: string;
  items: ProductRecipeItem[];
}

// ======================================================
// PRODUIT
// ======================================================

export interface Product {
  id: string;
  shopId: string;

  name: string;
  description: string | null;
  image: string | null;

  recipe: ProductRecipe | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  variants: ProductVariant[];
}

// ======================================================
// CRÉATION — VARIANTE
// ======================================================

export interface CreateProductVariantPayload {
  packagingId: string;
  sku: string;
  price: number;
  shelfLifeDays: number;
  isActive?: boolean;
}

// ======================================================
// CRÉATION — PRODUIT
// ======================================================

export interface CreateProductPayload {
  name: string;
  description?: string;

  /**
   * Facultatif.
   *
   * Une recette peut être créée plus tard
   * depuis le détail du produit.
   */
  recipe?: {
    name: string;
    description?: string;
    productionVolumeMl: number;

    items: {
      ingredientId: string;
      quantity: number;
    }[];
  };

  isActive?: boolean;

  variants: CreateProductVariantPayload[];
}

// ======================================================
// MODIFICATION — VARIANTE
// ======================================================

export interface UpdateProductVariantPayload {
  id?: string;
  packagingId: string;
  sku: string;
  price: number;
  shelfLifeDays: number;
  isActive?: boolean;
}

// ======================================================
// MODIFICATION — PRODUIT
// ======================================================

export interface UpdateProductPayload {
  name: string;
  description?: string;

  /**
   * Facultatif.
   *
   * Si absent, la recette existante
   * n'est pas modifiée.
   */
  recipe?: {
    name: string;
    description?: string;
    productionVolumeMl: number;

    items: {
      id?: string;
      ingredientId: string;
      quantity: number;
    }[];
  };

  isActive?: boolean;

  variants: UpdateProductVariantPayload[];
}

// ======================================================
// IMAGE
// ======================================================

/**
 * Image sélectionnée localement avec expo-image-picker.
 *
 * Ce type ne correspond PAS à l'image stockée en base.
 * Il représente uniquement le fichier local avant upload.
 */
export interface ProductImageAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}

// ======================================================
// RÉPONSES API
// ======================================================

export interface ProductsResponse {
  success: boolean;
  message?: string;

  data?: {
    products: Product[];
  };
}

export interface ProductResponse {
  success: boolean;
  message?: string;

  data?: {
    product: Product;
  };
}

export interface DeleteProductResponse {
  success: boolean;
  message?: string;

  data?: {
    product: Product;
    deactivated: boolean;
  };
}
