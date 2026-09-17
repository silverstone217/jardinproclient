// ============================================================
// STOCK — TYPES CLIENT
// ============================================================

declare namespace StockTypes {
  // ==========================================================
  // LOCALISATION
  // ==========================================================

  type LocationType = "MAIN" | "POS";

  interface StockLocation {
    locationType: LocationType;
    pointOfSaleId?: string;
  }

  interface StockLocationInfo {
    type: LocationType;
    pointOfSaleId: string | null;
    name: string;
    code?: string;
  }

  // ==========================================================
  // CATÉGORIES
  // ==========================================================

  type Category = "RAW_INGREDIENT" | "PACKAGING" | "FINISHED_PRODUCT";

  // ==========================================================
  // PAGINATION
  // ==========================================================

  interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

  // ==========================================================
  // MATIÈRES PREMIÈRES
  // ==========================================================

  interface RawIngredient {
    id: string;
    name: string;
    unit: "PIECE" | "GRAM" | "KILOGRAM" | "MILLILITER" | "LITER";
    stockQty: number;
    minAlert: number;
    isLowStock: boolean;
    isActive: boolean;
  }

  interface RawIngredientList {
    items: RawIngredient[];
    pagination: Pagination;
  }

  // ==========================================================
  // EMBALLAGES
  // ==========================================================

  interface Packaging {
    id: string;
    name: string;
    size: "ML_200" | "ML_500";
    capacityMl: number;
    stockQty: number;
    minAlert: number;
    isLowStock: boolean;
    isActive: boolean;
  }

  interface PackagingList {
    items: Packaging[];
    pagination: Pagination;
  }

  // ==========================================================
  // PRODUITS FINIS
  // ==========================================================

  interface FinishedProduct {
    id: string;
    variantId: string;

    productId: string;
    productName: string;
    productImage: string | null;

    sku: string;
    price: number;

    packagingId: string;
    packagingName: string;
    packagingSize: "ML_200" | "ML_500";
    capacityMl: number;

    quantity: number;

    shelfLifeDays: number;

    isActive: boolean;
  }

  interface FinishedProductList {
    items: FinishedProduct[];
    pagination: Pagination;
  }

  // ==========================================================
  // RÉSUMÉ
  // ==========================================================

  interface Summary {
    rawIngredientsCount: number;
    packagingCount: number;
    finishedProductsCount: number;

    lowStockRawIngredientsCount: number;
    lowStockPackagingCount: number;

    totalFinishedQuantity: number;
  }

  // ==========================================================
  // LOTS
  // ==========================================================

  interface Lot {
    id: string;

    quantity: number;
    remainingQuantity: number;

    expiresAt: string | null;

    createdAt: string;
    updatedAt: string;

    isExpired: boolean;
  }

  // ==========================================================
  // ENTRÉES DE STOCK
  // ==========================================================

  type EntryOrigin = "PRODUCTION" | "ACHAT" | "RECUPERATION" | "AJUSTEMENT";

  interface Entry {
    id: string;

    quantity: number;
    origin: EntryOrigin;
    note: string | null;

    createdAt: string;

    createdBy: {
      id: string;
      name: string;
    };

    productionItemId: string | null;
  }

  // ==========================================================
  // DÉTAIL PRODUIT
  // ==========================================================

  interface ProductDetail {
    stock: FinishedProduct;
    location: StockLocationInfo;
    lots: Lot[];
    entries: Entry[];
  }

  // ==========================================================
  // RÉPONSE GET /stock
  // ==========================================================

  interface CategoryResult<T> {
    items: T[];
    pagination: Pagination;
  }

  interface StockResponse {
    location: StockLocationInfo;

    summary: Summary;

    categories?: {
      rawIngredients?: CategoryResult<RawIngredient>;
      packagings?: CategoryResult<Packaging>;
      finishedProducts?: CategoryResult<FinishedProduct>;
    };

    category?: Category;

    items?: RawIngredient[] | Packaging[] | FinishedProduct[];

    pagination?: Pagination;
  }

  // ==========================================================
  // FILTRES
  // ==========================================================

  interface Filters {
    category: Category | null;
    search: string;
    lowStock: boolean;
  }

  // ==========================================================
  // PARAMÈTRES DE REQUÊTE
  // ==========================================================

  interface QueryParams {
    locationType: LocationType;
    pointOfSaleId?: string;

    category?: Category;
    search?: string;
    lowStock?: boolean;

    page?: number;
    limit?: number;
  }

  // ==========================================================
  // ÉTAT DU STORE
  // ==========================================================

  interface State {
    location: StockLocationInfo | null;
    summary: Summary | null;
    rawIngredients: RawIngredient[];
    packagings: Packaging[];
    finishedProducts: FinishedProduct[];
    rawIngredientsPagination: Pagination | null;
    packagingsPagination: Pagination | null;
    finishedProductsPagination: Pagination | null;
    selectedProduct: ProductDetail | null;
    filters: Filters;
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    isLoadingProduct: boolean;

    error: string | null;
  }
}
