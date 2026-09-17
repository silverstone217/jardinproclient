import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { api } from "@/utils/api";

const STOCK_CACHE_KEY = "jardin-stock-storage";
const STOCK_CACHE_VERSION = 2;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// ============================================================
// HELPERS
// ============================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function safeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function safeNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizePagination(value: unknown): StockTypes.Pagination | null {
  if (!isRecord(value)) {
    return null;
  }

  const page = Math.max(1, Math.floor(safeNumber(value.page, 1)));

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(safeNumber(value.limit, DEFAULT_LIMIT))),
  );

  const total = Math.max(0, Math.floor(safeNumber(value.total, 0)));

  const totalPages = Math.max(0, Math.floor(safeNumber(value.totalPages, 0)));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: safeBoolean(value.hasNextPage, page < totalPages),
    hasPreviousPage: safeBoolean(value.hasPreviousPage, page > 1),
  };
}

// ============================================================
// NORMALISATION LOCALISATION
// ============================================================

function normalizeLocation(
  value: unknown,
): StockTypes.StockLocationInfo | null {
  if (!isRecord(value)) {
    return null;
  }

  const type = value.type;

  if (type !== "MAIN" && type !== "POS") {
    return null;
  }

  const pointOfSaleId = safeNullableString(value.pointOfSaleId);

  // Un POS sans identifiant est invalide.
  if (type === "POS" && !pointOfSaleId) {
    return null;
  }

  // MAIN ne doit jamais avoir de POS.
  if (type === "MAIN" && pointOfSaleId) {
    return null;
  }

  const name = safeString(value.name).trim();

  if (!name) {
    return null;
  }

  const code = safeString(value.code).trim();

  return {
    type,
    pointOfSaleId,
    name,
    ...(code ? { code } : {}),
  };
}

// ============================================================
// NORMALISATION MATIÈRES PREMIÈRES
// ============================================================

function normalizeRawIngredient(
  value: unknown,
): StockTypes.RawIngredient | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = safeString(value.id).trim();

  const name = safeString(value.name).trim();

  if (!id || !name) {
    return null;
  }

  const unit = value.unit;

  if (
    unit !== "PIECE" &&
    unit !== "GRAM" &&
    unit !== "KILOGRAM" &&
    unit !== "MILLILITER" &&
    unit !== "LITER"
  ) {
    return null;
  }

  return {
    id,
    name,
    unit,
    stockQty: safeNumber(value.stockQty),
    minAlert: safeNumber(value.minAlert),
    isLowStock: safeBoolean(value.isLowStock),
    isActive: safeBoolean(value.isActive, true),
  };
}

function normalizeRawIngredients(value: unknown): StockTypes.RawIngredient[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeRawIngredient)
    .filter((item): item is StockTypes.RawIngredient => item !== null);
}

// ============================================================
// NORMALISATION EMBALLAGES
// ============================================================

function normalizePackaging(value: unknown): StockTypes.Packaging | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = safeString(value.id).trim();

  const name = safeString(value.name).trim();

  if (!id || !name) {
    return null;
  }

  const size = value.size;

  if (size !== "ML_200" && size !== "ML_500") {
    return null;
  }

  return {
    id,
    name,
    size,
    capacityMl: safeNumber(value.capacityMl),
    stockQty: safeNumber(value.stockQty),
    minAlert: safeNumber(value.minAlert),
    isLowStock: safeBoolean(value.isLowStock),
    isActive: safeBoolean(value.isActive, true),
  };
}

function normalizePackagings(value: unknown): StockTypes.Packaging[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizePackaging)
    .filter((item): item is StockTypes.Packaging => item !== null);
}

// ============================================================
// NORMALISATION PRODUITS FINIS
// ============================================================

function normalizeFinishedProduct(
  value: unknown,
): StockTypes.FinishedProduct | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = safeString(value.id).trim();
  const variantId = safeString(value.variantId).trim();
  const productId = safeString(value.productId).trim();
  const productName = safeString(value.productName).trim();
  const sku = safeString(value.sku).trim();
  const packagingId = safeString(value.packagingId).trim();

  const packagingName = safeString(value.packagingName).trim();

  if (
    !id ||
    !variantId ||
    !productId ||
    !productName ||
    !packagingId ||
    !packagingName
  ) {
    return null;
  }

  const packagingSize = value.packagingSize;

  if (packagingSize !== "ML_200" && packagingSize !== "ML_500") {
    return null;
  }

  return {
    id,
    variantId,
    productId,
    productName,
    productImage: safeNullableString(value.productImage),
    sku,
    price: safeNumber(value.price),
    packagingId,
    packagingName,
    packagingSize,
    capacityMl: safeNumber(value.capacityMl),
    quantity: Math.max(0, Math.floor(safeNumber(value.quantity))),
    shelfLifeDays: Math.max(0, Math.floor(safeNumber(value.shelfLifeDays))),
    isActive: safeBoolean(value.isActive, true),
  };
}

function normalizeFinishedProducts(
  value: unknown,
): StockTypes.FinishedProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeFinishedProduct)
    .filter((item): item is StockTypes.FinishedProduct => item !== null);
}

// ============================================================
// NORMALISATION SUMMARY
// ============================================================

function normalizeSummary(value: unknown): StockTypes.Summary | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    rawIngredientsCount: Math.max(
      0,
      Math.floor(safeNumber(value.rawIngredientsCount)),
    ),
    packagingCount: Math.max(0, Math.floor(safeNumber(value.packagingCount))),
    finishedProductsCount: Math.max(
      0,
      Math.floor(safeNumber(value.finishedProductsCount)),
    ),
    lowStockRawIngredientsCount: Math.max(
      0,
      Math.floor(safeNumber(value.lowStockRawIngredientsCount)),
    ),
    lowStockPackagingCount: Math.max(
      0,
      Math.floor(safeNumber(value.lowStockPackagingCount)),
    ),
    totalFinishedQuantity: Math.max(
      0,
      Math.floor(safeNumber(value.totalFinishedQuantity)),
    ),
  };
}

// ============================================================
// NORMALISATION LOTS
// ============================================================

function normalizeLot(value: unknown): StockTypes.Lot | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = safeString(value.id).trim();

  if (!id) {
    return null;
  }

  return {
    id,
    quantity: safeNumber(value.quantity),
    remainingQuantity: safeNumber(value.remainingQuantity),
    expiresAt: safeNullableString(value.expiresAt),
    createdAt: safeString(value.createdAt),
    updatedAt: safeString(value.updatedAt),
    isExpired: safeBoolean(value.isExpired),
  };
}

function normalizeLots(value: unknown): StockTypes.Lot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeLot)
    .filter((item): item is StockTypes.Lot => item !== null);
}

// ============================================================
// NORMALISATION ENTRÉES
// ============================================================

function normalizeEntry(value: unknown): StockTypes.Entry | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = safeString(value.id).trim();

  const origin = value.origin;

  if (
    !id ||
    (origin !== "PRODUCTION" &&
      origin !== "ACHAT" &&
      origin !== "RECUPERATION" &&
      origin !== "AJUSTEMENT")
  ) {
    return null;
  }

  const createdBy = isRecord(value.createdBy)
    ? {
        id: safeString(value.createdBy.id),
        name: safeString(value.createdBy.name),
      }
    : {
        id: "",
        name: "",
      };

  return {
    id,
    quantity: safeNumber(value.quantity),
    origin,
    note: safeNullableString(value.note),
    createdAt: safeString(value.createdAt),
    createdBy,
    productionItemId: safeNullableString(value.productionItemId),
  };
}

function normalizeEntries(value: unknown): StockTypes.Entry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeEntry)
    .filter((item): item is StockTypes.Entry => item !== null);
}

// ============================================================
// NORMALISATION PRODUIT DÉTAILLÉ
// ============================================================

function normalizeProductDetail(
  value: unknown,
): StockTypes.ProductDetail | null {
  if (!isRecord(value)) {
    return null;
  }

  const stock = normalizeFinishedProduct(value.stock);
  const location = normalizeLocation(value.location);

  if (!stock || !location) {
    return null;
  }

  return {
    stock,
    location,
    lots: normalizeLots(value.lots),
    entries: normalizeEntries(value.entries),
  };
}

// ============================================================
// ÉTAT INITIAL
// ============================================================

const INITIAL_FILTERS: StockTypes.Filters = {
  category: null,
  search: "",
  lowStock: false,
};

const INITIAL_STATE: StockTypes.State = {
  location: null,
  summary: null,
  rawIngredients: [],
  packagings: [],
  finishedProducts: [],
  rawIngredientsPagination: null,
  packagingsPagination: null,
  finishedProductsPagination: null,
  selectedProduct: null,
  filters: {
    ...INITIAL_FILTERS,
  },

  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isLoadingProduct: false,
  error: null,
};

// ============================================================
// CACHE
// ============================================================

interface StockCache {
  version: number;
  savedAt: number;
  location: StockTypes.StockLocationInfo | null;
  summary: StockTypes.Summary | null;
  rawIngredients: StockTypes.RawIngredient[];
  packagings: StockTypes.Packaging[];
  finishedProducts: StockTypes.FinishedProduct[];
  rawIngredientsPagination: StockTypes.Pagination | null;
  packagingsPagination: StockTypes.Pagination | null;
  finishedProductsPagination: StockTypes.Pagination | null;
  filters: StockTypes.Filters;
}

function createCache(state: StockTypes.State): StockCache {
  return {
    version: STOCK_CACHE_VERSION,
    savedAt: Date.now(),
    location: state.location,
    summary: state.summary,
    rawIngredients: state.rawIngredients,
    packagings: state.packagings,
    finishedProducts: state.finishedProducts,
    rawIngredientsPagination: state.rawIngredientsPagination,
    packagingsPagination: state.packagingsPagination,
    finishedProductsPagination: state.finishedProductsPagination,
    filters: {
      category: state.filters.category,
      search: state.filters.search,
      lowStock: state.filters.lowStock,
    },
  };
}

function normalizeCache(value: unknown): StockCache | null {
  if (!isRecord(value)) {
    return null;
  }

  const version = safeNumber(value.version);

  if (version !== STOCK_CACHE_VERSION) {
    return null;
  }

  const location = normalizeLocation(value.location);

  // Si le cache contient une localisation
  // invalide, on le rejette entièrement.
  if (value.location !== null && !location) {
    return null;
  }

  const rawIngredients = normalizeRawIngredients(value.rawIngredients);
  const packagings = normalizePackagings(value.packagings);
  const finishedProducts = normalizeFinishedProducts(value.finishedProducts);
  const filtersValue = isRecord(value.filters) ? value.filters : {};
  const category = filtersValue.category;

  const normalizedCategory =
    category === "RAW_INGREDIENT" ||
    category === "PACKAGING" ||
    category === "FINISHED_PRODUCT"
      ? category
      : null;

  return {
    version: STOCK_CACHE_VERSION,
    savedAt: safeNumber(value.savedAt, Date.now()),
    location,
    summary: normalizeSummary(value.summary),
    rawIngredients,
    packagings,
    finishedProducts,

    rawIngredientsPagination: normalizePagination(
      value.rawIngredientsPagination,
    ),

    packagingsPagination: normalizePagination(value.packagingsPagination),
    finishedProductsPagination: normalizePagination(
      value.finishedProductsPagination,
    ),

    filters: {
      category: normalizedCategory,
      search: safeString(filtersValue.search),
      lowStock: safeBoolean(filtersValue.lowStock),
    },
  };
}

async function saveCache(state: StockTypes.State): Promise<void> {
  try {
    const cache = createCache(state);

    await AsyncStorage.setItem(STOCK_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Impossible de sauvegarder le cache du stock :", error);
  }
}

async function loadCache(): Promise<StockCache | null> {
  try {
    const raw = await AsyncStorage.getItem(STOCK_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return normalizeCache(parsed);
  } catch (error) {
    console.warn("Impossible de lire le cache du stock :", error);

    return null;
  }
}

// ============================================================
// QUERY PARAMS
// ============================================================

function buildQueryParams(
  location: StockTypes.StockLocationInfo,
  filters: StockTypes.Filters,
  page: number,
  limit: number,
  categoryOverride?: StockTypes.Category,
): StockTypes.QueryParams {
  const category = categoryOverride ?? filters.category ?? undefined;

  const params: StockTypes.QueryParams = {
    locationType: location.type,

    page,

    limit,
  };

  if (location.type === "POS") {
    // Ne jamais envoyer un POS invalide.
    if (!location.pointOfSaleId) {
      throw new Error("POS_REQUIRED");
    }

    params.pointOfSaleId = location.pointOfSaleId;
  }

  if (category) {
    params.category = category;
  }

  const search = filters.search.trim();

  if (search) {
    params.search = search;
  }

  // IMPORTANT :
  // on n'envoie pas lowStock=false,
  // car z.coerce.boolean() côté serveur
  // transforme la string "false" en true.
  if (filters.lowStock) {
    params.lowStock = true;
  }

  return params;
}

function buildQueryString(params: StockTypes.QueryParams): string {
  const searchParams = new URLSearchParams();

  searchParams.set("locationType", params.locationType);

  if (params.pointOfSaleId) {
    searchParams.set("pointOfSaleId", params.pointOfSaleId);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.lowStock) {
    searchParams.set("lowStock", "true");
  }

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? DEFAULT_LIMIT));

  return `?${searchParams.toString()}`;
}

// ============================================================
// API RESPONSE
// ============================================================

interface StockApiResponse {
  success: boolean;
  message?: string;
  stock?: unknown;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    isRecord(error.response.data)
  ) {
    const message = error.response.data.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

// ============================================================
// EXTRACTION RÉSULTAT
// ============================================================

interface ParsedStockResponse {
  location: StockTypes.StockLocationInfo | null;
  summary: StockTypes.Summary | null;
  rawIngredients: StockTypes.RawIngredient[];
  packagings: StockTypes.Packaging[];
  finishedProducts: StockTypes.FinishedProduct[];
  rawIngredientsPagination: StockTypes.Pagination | null;
  packagingsPagination: StockTypes.Pagination | null;
  finishedProductsPagination: StockTypes.Pagination | null;
}

function parseStockResponse(response: StockApiResponse): ParsedStockResponse {
  const stock = isRecord(response.stock) ? response.stock : null;

  if (!stock) {
    throw new Error("Réponse stock invalide");
  }

  const location = normalizeLocation(stock.location);

  if (!location) {
    throw new Error("La localisation du stock reçue du serveur est invalide.");
  }

  const summary = normalizeSummary(stock.summary);
  const categories = isRecord(stock.categories) ? stock.categories : null;
  let rawIngredients: StockTypes.RawIngredient[] = [];
  let packagings: StockTypes.Packaging[] = [];
  let finishedProducts: StockTypes.FinishedProduct[] = [];
  let rawIngredientsPagination: StockTypes.Pagination | null = null;
  let packagingsPagination: StockTypes.Pagination | null = null;
  let finishedProductsPagination: StockTypes.Pagination | null = null;

  // ==========================================================
  // RÉPONSE MULTI-CATÉGORIES
  // ==========================================================

  if (categories) {
    const rawResult = isRecord(categories.rawIngredients)
      ? categories.rawIngredients
      : null;

    const packagingResult = isRecord(categories.packagings)
      ? categories.packagings
      : null;

    const finishedResult = isRecord(categories.finishedProducts)
      ? categories.finishedProducts
      : null;

    if (rawResult) {
      rawIngredients = normalizeRawIngredients(rawResult.items);

      rawIngredientsPagination = normalizePagination(rawResult.pagination);
    }

    if (packagingResult) {
      packagings = normalizePackagings(packagingResult.items);

      packagingsPagination = normalizePagination(packagingResult.pagination);
    }

    if (finishedResult) {
      finishedProducts = normalizeFinishedProducts(finishedResult.items);

      finishedProductsPagination = normalizePagination(
        finishedResult.pagination,
      );
    }
  }

  // ==========================================================
  // RÉPONSE UNE CATÉGORIE
  // ==========================================================

  const category = stock.category;

  if (category === "RAW_INGREDIENT") {
    rawIngredients = normalizeRawIngredients(stock.items);
    rawIngredientsPagination = normalizePagination(stock.pagination);
  }

  if (category === "PACKAGING") {
    packagings = normalizePackagings(stock.items);
    packagingsPagination = normalizePagination(stock.pagination);
  }

  if (category === "FINISHED_PRODUCT") {
    finishedProducts = normalizeFinishedProducts(stock.items);

    finishedProductsPagination = normalizePagination(stock.pagination);
  }

  return {
    location,
    summary,
    rawIngredients,
    packagings,
    finishedProducts,
    rawIngredientsPagination,
    packagingsPagination,
    finishedProductsPagination,
  };
}

// ============================================================
// STORE
// ============================================================

interface StockStoreActions {
  initialize: () => Promise<void>;
  fetchStock: () => Promise<void>;
  refreshStock: () => Promise<void>;
  loadMore: () => Promise<void>;
  setLocation: (location: StockTypes.StockLocationInfo) => Promise<void>;
  setCategory: (category: StockTypes.Category | null) => Promise<void>;
  setSearch: (search: string) => Promise<void>;
  setLowStock: (lowStock: boolean) => Promise<void>;
  fetchProduct: (variantId: string) => Promise<void>;
  clearSelectedProduct: () => void;
  clearError: () => void;
  reset: () => Promise<void>;
}

type StockStore = StockTypes.State & StockStoreActions;

// ============================================================
// REQUEST CONTROL
// ============================================================

let requestSequence = 0;

function createRequestId(): number {
  requestSequence += 1;

  return requestSequence;
}

// ============================================================
// STORE
// ============================================================

export const useStockStore = create<StockStore>((set, get) => ({
  ...INITIAL_STATE,

  // ======================================================
  // INITIALISATION OFFLINE-FIRST
  // ======================================================

  initialize: async () => {
    const cache = await loadCache();

    if (!cache) {
      await get().fetchStock();

      return;
    }

    set({
      location: cache.location,
      summary: cache.summary,
      rawIngredients: cache.rawIngredients,
      packagings: cache.packagings,
      finishedProducts: cache.finishedProducts,
      rawIngredientsPagination: cache.rawIngredientsPagination,
      packagingsPagination: cache.packagingsPagination,
      finishedProductsPagination: cache.finishedProductsPagination,
      filters: cache.filters,

      error: null,
    });

    // ====================================================
    // SYNCHRONISATION SILENCIEUSE
    // ====================================================

    // Le cache est affiché immédiatement.
    // Le serveur est ensuite consulté en arrière-plan.
    await get().fetchStock();
  },

  // ======================================================
  // FETCH PRINCIPAL
  // ======================================================

  fetchStock: async () => {
    const state = get();

    let location = state.location;

    // ----------------------------------------------------
    // Si aucune localisation n'est connue localement,
    // le serveur peut déterminer la localisation autorisée.
    // ----------------------------------------------------

    if (!location) {
      set({
        isLoading: true,
        error: null,
      });

      const requestId = createRequestId();

      try {
        const response = await api.get<StockApiResponse>("/stock", {
          params: {
            page: 1,
            limit: DEFAULT_LIMIT,
          },
          timeout: 10000,
        });

        if (requestId !== requestSequence) {
          return;
        }

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ?? "Impossible de récupérer le stock.",
          );
        }

        const parsed = parseStockResponse(response.data);

        set({
          location: parsed.location,
          summary: parsed.summary,
          rawIngredients: parsed.rawIngredients,
          packagings: parsed.packagings,
          finishedProducts: parsed.finishedProducts,
          rawIngredientsPagination: parsed.rawIngredientsPagination,
          packagingsPagination: parsed.packagingsPagination,
          finishedProductsPagination: parsed.finishedProductsPagination,
          isLoading: false,
          error: null,
        });

        await saveCache(get());
      } catch (error) {
        if (requestId !== requestSequence) {
          return;
        }

        const hasCachedData = !!get().location;

        set({
          isLoading: false,

          error: hasCachedData
            ? null
            : getApiErrorMessage(error, "Impossible de récupérer le stock."),
        });

        if (!hasCachedData) {
          throw error;
        }
      }

      return;
    }

    // ----------------------------------------------------
    // Localisation connue
    // ----------------------------------------------------

    if (location.type === "POS" && !location.pointOfSaleId) {
      set({
        isLoading: false,
        error: "Le point de vente sélectionné est invalide.",
      });

      return;
    }

    const requestId = createRequestId();

    set({
      isLoading: true,
      error: null,
    });

    try {
      const filters = get().filters;
      const params = buildQueryParams(location, filters, 1, DEFAULT_LIMIT);

      const response = await api.get<StockApiResponse>(
        `/stock${buildQueryString(params)}`,
        {
          timeout: 10000,
        },
      );

      if (requestId !== requestSequence) {
        return;
      }

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ?? "Impossible de récupérer le stock.",
        );
      }

      const parsed = parseStockResponse(response.data);

      set({
        location: parsed.location,
        summary: parsed.summary,
        rawIngredients: parsed.rawIngredients,
        packagings: parsed.packagings,
        finishedProducts: parsed.finishedProducts,
        rawIngredientsPagination: parsed.rawIngredientsPagination,
        packagingsPagination: parsed.packagingsPagination,
        finishedProductsPagination: parsed.finishedProductsPagination,
        isLoading: false,
        error: null,
      });
      console.log("FRONT STOCK - isLoading should now be false");
      await saveCache(get());
    } catch (error) {
      if (requestId !== requestSequence) {
        return;
      }

      // Le cache reste visible.
      set({
        isLoading: false,

        error: get().location
          ? null
          : getApiErrorMessage(error, "Impossible de récupérer le stock."),
      });

      // On ne jette pas l'erreur si
      // on possède déjà un cache utilisable.
    }
  },

  // ======================================================
  // REFRESH MANUEL
  // ======================================================

  refreshStock: async () => {
    const state = get();

    const location = state.location;

    if (!location) {
      await get().fetchStock();

      return;
    }

    if (location.type === "POS" && !location.pointOfSaleId) {
      set({
        error: "Le point de vente sélectionné est invalide.",
      });

      return;
    }

    const requestId = createRequestId();

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const params = buildQueryParams(
        location,
        get().filters,
        1,
        DEFAULT_LIMIT,
      );

      const response = await api.get<StockApiResponse>(
        `/stock${buildQueryString(params)}`,
        {
          timeout: 10000,
        },
      );

      if (requestId !== requestSequence) {
        return;
      }

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ?? "Impossible d'actualiser le stock.",
        );
      }

      const parsed = parseStockResponse(response.data);

      set({
        location: parsed.location,
        summary: parsed.summary,
        rawIngredients: parsed.rawIngredients,
        packagings: parsed.packagings,
        finishedProducts: parsed.finishedProducts,
        rawIngredientsPagination: parsed.rawIngredientsPagination,
        packagingsPagination: parsed.packagingsPagination,
        finishedProductsPagination: parsed.finishedProductsPagination,
        isRefreshing: false,
        error: null,
      });

      await saveCache(get());
    } catch (error) {
      if (requestId !== requestSequence) {
        return;
      }

      set({
        isRefreshing: false,
        error: null,
      });

      // L'échec du refresh ne doit pas
      // effacer les données déjà affichées.
    }
  },

  // ======================================================
  // PAGINATION
  // ======================================================

  loadMore: async () => {
    const state = get();

    if (state.isLoading || state.isLoadingMore) {
      return;
    }

    const location = state.location;

    if (!location) {
      return;
    }

    if (location.type === "POS" && !location.pointOfSaleId) {
      return;
    }

    const category = state.filters.category;

    set({
      isLoadingMore: true,
    });

    try {
      // --------------------------------------------------
      // UNE CATÉGORIE
      // --------------------------------------------------

      if (category) {
        let pagination: StockTypes.Pagination | null = null;

        if (category === "RAW_INGREDIENT") {
          pagination = state.rawIngredientsPagination;
        }

        if (category === "PACKAGING") {
          pagination = state.packagingsPagination;
        }

        if (category === "FINISHED_PRODUCT") {
          pagination = state.finishedProductsPagination;
        }

        if (!pagination || !pagination.hasNextPage) {
          set({
            isLoadingMore: false,
          });

          return;
        }

        const nextPage = pagination.page + 1;
        const requestId = createRequestId();

        const params = buildQueryParams(
          location,
          state.filters,
          nextPage,
          pagination.limit || DEFAULT_LIMIT,
          category,
        );

        const response = await api.get<StockApiResponse>(
          `/stock${buildQueryString(params)}`,
          {
            timeout: 10000,
          },
        );

        if (requestId !== requestSequence) {
          return;
        }

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ??
              "Impossible de charger la suite du stock.",
          );
        }

        const parsed = parseStockResponse(response.data);

        if (category === "RAW_INGREDIENT") {
          set({
            rawIngredients: [...state.rawIngredients, ...parsed.rawIngredients],
            rawIngredientsPagination: parsed.rawIngredientsPagination,
            summary: parsed.summary ?? state.summary,
            isLoadingMore: false,
          });
        }

        if (category === "PACKAGING") {
          set({
            packagings: [...state.packagings, ...parsed.packagings],
            packagingsPagination: parsed.packagingsPagination,
            summary: parsed.summary ?? state.summary,
            isLoadingMore: false,
          });
        }

        if (category === "FINISHED_PRODUCT") {
          set({
            finishedProducts: [
              ...state.finishedProducts,
              ...parsed.finishedProducts,
            ],

            finishedProductsPagination: parsed.finishedProductsPagination,
            summary: parsed.summary ?? state.summary,
            isLoadingMore: false,
          });
        }

        await saveCache(get());

        return;
      }

      // --------------------------------------------------
      // TOUTES LES CATÉGORIES
      // --------------------------------------------------

      const requests: Array<{
        category: StockTypes.Category;
        page: number;
        limit: number;
      }> = [];

      if (state.rawIngredientsPagination?.hasNextPage) {
        requests.push({
          category: "RAW_INGREDIENT",
          page: state.rawIngredientsPagination.page + 1,
          limit: state.rawIngredientsPagination.limit || DEFAULT_LIMIT,
        });
      }

      if (state.packagingsPagination?.hasNextPage) {
        requests.push({
          category: "PACKAGING",
          page: state.packagingsPagination.page + 1,
          limit: state.packagingsPagination.limit || DEFAULT_LIMIT,
        });
      }

      if (state.finishedProductsPagination?.hasNextPage) {
        requests.push({
          category: "FINISHED_PRODUCT",
          page: state.finishedProductsPagination.page + 1,
          limit: state.finishedProductsPagination.limit || DEFAULT_LIMIT,
        });
      }

      if (requests.length === 0) {
        set({
          isLoadingMore: false,
        });

        return;
      }

      const requestId = createRequestId();

      const results = await Promise.all(
        requests.map(async ({ category, page, limit }) => {
          const params = buildQueryParams(
            location,
            state.filters,
            page,
            limit,
            category,
          );

          const response = await api.get<StockApiResponse>(
            `/stock${buildQueryString(params)}`,
            {
              timeout: 10000,
            },
          );

          if (!response.data?.success) {
            throw new Error(
              response.data?.message ??
                "Impossible de charger la suite du stock.",
            );
          }

          return {
            category,
            parsed: parseStockResponse(response.data),
          };
        }),
      );

      if (requestId !== requestSequence) {
        return;
      }

      const current = get();

      let rawIngredients = current.rawIngredients;
      let packagings = current.packagings;
      let finishedProducts = current.finishedProducts;
      let rawIngredientsPagination = current.rawIngredientsPagination;
      let packagingsPagination = current.packagingsPagination;
      let finishedProductsPagination = current.finishedProductsPagination;
      let summary = current.summary;

      for (const result of results) {
        summary = result.parsed.summary ?? summary;

        if (result.category === "RAW_INGREDIENT") {
          rawIngredients = [...rawIngredients, ...result.parsed.rawIngredients];
          rawIngredientsPagination = result.parsed.rawIngredientsPagination;
        }

        if (result.category === "PACKAGING") {
          packagings = [...packagings, ...result.parsed.packagings];
          packagingsPagination = result.parsed.packagingsPagination;
        }

        if (result.category === "FINISHED_PRODUCT") {
          finishedProducts = [
            ...finishedProducts,
            ...result.parsed.finishedProducts,
          ];
          finishedProductsPagination = result.parsed.finishedProductsPagination;
        }
      }

      set({
        rawIngredients,
        packagings,
        finishedProducts,
        rawIngredientsPagination,
        packagingsPagination,
        finishedProductsPagination,
        summary,
        isLoadingMore: false,
      });

      await saveCache(get());
    } catch (error) {
      set({
        isLoadingMore: false,
      });

      console.warn("Impossible de charger la suite du stock :", error);
    }
  },

  // ======================================================
  // CHANGEMENT DE LOCALISATION
  // ======================================================

  setLocation: async (location) => {
    // ----------------------------------------------------
    // Validation stricte
    // ----------------------------------------------------

    if (location.type === "POS" && !location.pointOfSaleId) {
      return;
    }

    if (location.type === "MAIN" && location.pointOfSaleId) {
      return;
    }

    const current = get().location;

    const sameLocation =
      current?.type === location.type &&
      current.pointOfSaleId === location.pointOfSaleId;

    if (sameLocation) {
      return;
    }

    // ----------------------------------------------------
    // Nouvelle localisation :
    // on efface les anciennes listes immédiatement.
    // ----------------------------------------------------

    set({
      location,
      summary: null,
      rawIngredients: [],
      packagings: [],
      finishedProducts: [],
      rawIngredientsPagination: null,
      packagingsPagination: null,
      finishedProductsPagination: null,
      selectedProduct: null,
      isLoading: true,
      error: null,
    });

    // ----------------------------------------------------
    // Le cache sera remplacé par le nouveau stock.
    // ----------------------------------------------------

    await get().fetchStock();
  },

  // ======================================================
  // FILTRE CATÉGORIE
  // ======================================================

  setCategory: async (category) => {
    if (get().filters.category === category) {
      return;
    }

    set({
      filters: {
        ...get().filters,
        category,
      },

      rawIngredients: [],
      packagings: [],
      finishedProducts: [],
      rawIngredientsPagination: null,
      packagingsPagination: null,
      finishedProductsPagination: null,
      isLoading: true,
      error: null,
    });

    await get().fetchStock();
  },

  // ======================================================
  // RECHERCHE
  // ======================================================

  setSearch: async (search) => {
    const value = search.trimStart();

    if (get().filters.search === value) {
      return;
    }

    set({
      filters: {
        ...get().filters,
        search: value,
      },

      rawIngredients: [],
      packagings: [],
      finishedProducts: [],
      rawIngredientsPagination: null,
      packagingsPagination: null,
      finishedProductsPagination: null,
      isLoading: true,
      error: null,
    });

    await get().fetchStock();
  },

  // ======================================================
  // STOCK FAIBLE
  // ======================================================

  setLowStock: async (lowStock) => {
    if (get().filters.lowStock === lowStock) {
      return;
    }

    set({
      filters: {
        ...get().filters,
        lowStock,
      },

      rawIngredients: [],
      packagings: [],
      finishedProducts: [],
      rawIngredientsPagination: null,
      packagingsPagination: null,
      finishedProductsPagination: null,
      isLoading: true,
      error: null,
    });

    await get().fetchStock();
  },

  // ======================================================
  // DÉTAIL PRODUIT FINI
  // ======================================================

  fetchProduct: async (variantId) => {
    const id = variantId.trim();

    if (!id) {
      return;
    }

    const location = get().location;

    if (!location) {
      return;
    }

    if (location.type === "POS" && !location.pointOfSaleId) {
      return;
    }

    const requestId = createRequestId();

    set({
      isLoadingProduct: true,
      selectedProduct: null,
      error: null,
    });

    try {
      const params: StockTypes.QueryParams = {
        locationType: location.type,
      };

      if (location.type === "POS") {
        if (!location.pointOfSaleId) {
          set({
            isLoadingProduct: false,
            error: "Le point de vente sélectionné est invalide.",
          });

          return;
        }

        params.pointOfSaleId = location.pointOfSaleId;
      }

      const query = buildQueryString(params);

      const response = await api.get<{
        success: boolean;
        message?: string;
        product?: unknown;
      }>(`/stock/${encodeURIComponent(id)}${query}`);

      if (requestId !== requestSequence) {
        return;
      }

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ?? "Impossible de récupérer le produit.",
        );
      }

      const detail = normalizeProductDetail(response.data.product);

      if (!detail) {
        throw new Error("Les informations du produit sont invalides.");
      }

      set({
        selectedProduct: detail,
        isLoadingProduct: false,
        error: null,
      });
    } catch (error) {
      if (requestId !== requestSequence) {
        return;
      }

      set({
        isLoadingProduct: false,
        error: getApiErrorMessage(error, "Impossible de récupérer le produit."),
      });
    }
  },
  // ======================================================
  // CLEAR DETAIL
  // ======================================================

  clearSelectedProduct: () => {
    set({
      selectedProduct: null,
    });
  },
  // ======================================================
  // CLEAR ERROR
  // ======================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ======================================================
  // RESET
  // ======================================================

  reset: async () => {
    requestSequence += 1;
    set({
      ...INITIAL_STATE,

      filters: {
        ...INITIAL_FILTERS,
      },
    });

    try {
      await AsyncStorage.removeItem(STOCK_CACHE_KEY);
    } catch (error) {
      console.warn("Impossible de supprimer le cache du stock :", error);
    }
  },
}));
