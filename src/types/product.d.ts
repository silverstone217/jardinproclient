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

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  image: string | null;
  recipeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface CreateProductVariantPayload {
  packagingId: string;
  sku: string;
  price: number;
  shelfLifeDays: number;
  isActive?: boolean;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  recipeId?: string;
  isActive?: boolean;
  variants: CreateProductVariantPayload[];
}

export interface UpdateProductVariantPayload {
  id?: string;
  packagingId: string;
  sku: string;
  price: number;
  shelfLifeDays: number;
  isActive?: boolean;
}

export interface UpdateProductPayload {
  name: string;
  description?: string;
  recipeId?: string;
  isActive?: boolean;
  variants: UpdateProductVariantPayload[];
}

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
