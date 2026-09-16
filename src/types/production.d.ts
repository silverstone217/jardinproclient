export interface ProductionIngredientPayload {
  ingredientId: string;
  quantityUsed: number;
}

export interface ProductionPackagingPayload {
  packagingId: string;
  quantityUsed: number;
}

export interface ProductionItemPayload {
  variantId: string;
  quantityProduced: number;
}

export interface CreateProductionPayload {
  totalVolumeMl: number;
  notes?: string;
  ingredients: ProductionIngredientPayload[];
  packagings: ProductionPackagingPayload[];
  items: ProductionItemPayload[];
}

// ======================================================
// PRODUCTION INGREDIENT
// ======================================================

export interface ProductionIngredient {
  id: string;
  productionId: string;
  ingredientId: string;
  quantityUsed: number;

  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}

// ======================================================
// PRODUCTION PACKAGING
// ======================================================

export interface ProductionPackaging {
  id: string;
  productionId: string;
  packagingId: string;
  quantityUsed: number;

  packaging: {
    id: string;
    name: string;
    size: string;
    capacityMl: number;
  };
}

// ======================================================
// PRODUCTION ITEM
// ======================================================

export interface ProductionItem {
  id: string;
  productionId: string;
  variantId: string;

  quantityProduced: number;
  remainingQuantity: number;

  expiresAt: string;

  variant: {
    id: string;
    productId: string;
    packagingId: string;

    sku: string;
    price: number;
    shelfLifeDays: number;
    isActive: boolean;

    product: {
      id: string;
      name: string;
    };

    packaging: {
      id: string;
      name: string;
      size: string;
      capacityMl: number;
    };
  };
}

// ======================================================
// PRODUCTION MANAGER
// ======================================================

export interface ProductionManager {
  id: string;
  name: string;
  telephone?: string;
}

// ======================================================
// POINT DE VENTE
// ======================================================

export interface ProductionPointOfSale {
  id: string;
  name: string;
  code: string;
  isMainStore: boolean;
}

// ======================================================
// PRODUCTION
// ======================================================

export interface Production {
  id: string;

  managerId: string;
  pointOfSaleId: string;

  totalVolumeMl: number;

  notes: string | null;

  producedAt: string;

  manager: ProductionManager;

  pointOfSale: ProductionPointOfSale;

  ingredients: ProductionIngredient[];

  packagings: ProductionPackaging[];

  items: ProductionItem[];
}

// ======================================================
// PAGINATION
// ======================================================

export interface ProductionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ======================================================
// LIST RESPONSE
// ======================================================

export interface ProductionsResponse {
  success: boolean;
  message?: string;

  productions?: Production[];

  pagination?: ProductionPagination;
}

// ======================================================
// DETAIL RESPONSE
// ======================================================

export interface ProductionResponse {
  success: boolean;
  message?: string;

  production?: Production;
}

// ======================================================
// FILTRES
// ======================================================

export interface ProductionQuery {
  productId?: string;
  pointOfSaleId?: string;
  from?: string;
  to?: string;

  limit?: number;
  page?: number;
}
