export type LossCategory = "RAW_INGREDIENT" | "PACKAGING" | "FINISHED_PRODUCT";

export type LossReason =
  | "EXPIRED"
  | "DAMAGED"
  | "STOLEN"
  | "QUAL_REJECT"
  | "OTHER";

// ============================================================
// CREATE LOSS
// ============================================================

export interface BaseCreateLossInput {
  quantity: number;
  reason: LossReason;
  note?: string;
}

export interface CreateRawIngredientLossInput extends BaseCreateLossInput {
  category: "RAW_INGREDIENT";
  ingredientId: string;
}

export interface CreatePackagingLossInput extends BaseCreateLossInput {
  category: "PACKAGING";
  packagingId: string;
}

export interface CreateFinishedProductLossInput extends BaseCreateLossInput {
  category: "FINISHED_PRODUCT";
  variantId: string;
  finishedStockLotId: string;
  pointOfSaleId?: string;
}

export type CreateLossInput =
  | CreateRawIngredientLossInput
  | CreatePackagingLossInput
  | CreateFinishedProductLossInput;

// ============================================================
// LOSS HISTORY
// ============================================================

export interface LossPointOfSale {
  id: string;
  name: string;
  code: string;
}

export interface LossIngredient {
  id: string;
  name: string;
  unit: string;
}

export interface LossPackaging {
  id: string;
  name: string;
  size: string;
  capacityMl: number;
}

export interface LossProduct {
  id: string;
  name: string;
}

export interface LossVariantPackaging {
  id: string;
  name: string;
  size: string;
  capacityMl: number;
}

export interface LossVariant {
  id: string;
  sku: string;
  price: string | number;

  product: LossProduct;

  packaging: LossVariantPackaging;
}

export interface LossFinishedStockLot {
  id: string;
  quantity: number;
  remainingQuantity: number;
  expiresAt: string | null;
  createdAt: string;

  entry: {
    id: string;
    origin: string;
    productionItemId: string | null;
    createdAt: string;
  };
}

export interface LossReportedBy {
  id: string;
  name: string;
}

export interface LossItem {
  id: string;
  shopId: string;

  category: LossCategory;
  reason: LossReason;

  note: string | null;

  pointOfSaleId: string | null;

  ingredientId: string | null;
  packagingId: string | null;
  variantId: string | null;
  finishedStockLotId: string | null;

  reportedById: string;

  quantity: string | number;

  reportedAt: string;

  pointOfSale: LossPointOfSale | null;

  ingredient: LossIngredient | null;

  packaging: LossPackaging | null;

  variant: LossVariant | null;

  finishedStockLot: LossFinishedStockLot | null;

  reportedBy: LossReportedBy;
}

// ============================================================
// PAGINATION
// ============================================================

export interface LossPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface LossListResponse {
  items: LossItem[];
  pagination: LossPagination;
}

// ============================================================
// PENDING EXPIRED LOT
// ============================================================

export interface PendingLossPointOfSale {
  id: string;
  name: string;
  code: string;
}

export interface PendingLossProduct {
  id: string;
  name: string;
}

export interface PendingLossPackaging {
  id: string;
  name: string;
  size: string;
  capacityMl: number;
}

export interface PendingLossVariant {
  id: string;
  sku: string;
  shelfLifeDays: number;

  product: PendingLossProduct;

  packaging: PendingLossPackaging;
}

export interface PendingLossProduction {
  id: string;
  producedAt: string;
}

export interface PendingLossProductionItem {
  id: string;
  productionId: string;
  quantityProduced: number;
  remainingQuantity: number;
  expiresAt: string;

  production: PendingLossProduction;
}

export interface PendingLossItem {
  id: string;

  finishedStockId: string;
  entryId: string;

  quantity: number;
  remainingQuantity: number;

  expiresAt: string | null;
  createdAt: string;

  pointOfSale: PendingLossPointOfSale | null;

  variant: PendingLossVariant;

  productionItem: PendingLossProductionItem | null;
}

// ============================================================
// EXPIRED ACTION
// ============================================================

export interface CreateExpiredLossesResponse {
  count: number;
  quantity: number;
  losses: LossItem[];
}

// ============================================================
// FILTERS
// ============================================================

export interface LossFilters {
  category?: LossCategory;
  reason?: LossReason;
  pointOfSaleId?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// UI
// ============================================================

export type LossViewMode = "PENDING" | "HISTORY";

export type LossFormCategory = LossCategory | null;
