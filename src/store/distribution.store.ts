import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { create } from "zustand";

import { api } from "@/utils/api";

import type {
  CreateDistributionInput,
  DistributionFilters,
  DistributionProduct,
  DistributionSelectedProduct,
} from "@/types/distribution";

const STORAGE_KEY = "jardin-distribution-storage";

const getLocationCacheKey = (pointOfSaleId: string | null): string => {
  return pointOfSaleId === null ? "MAIN" : `POS:${pointOfSaleId}`;
};

interface DistributionState {
  fromPosId: string | null;
  toPosId: string | null;

  fromSelected: boolean;
  toSelected: boolean;

  products: DistributionProduct[];
  selectedProducts: DistributionSelectedProduct[];

  filters: DistributionFilters;

  isLoadingProducts: boolean;
  isSubmitting: boolean;

  error: string | null;

  setFromPosId: (pointOfSaleId: string | null) => Promise<void>;

  setToPosId: (pointOfSaleId: string | null) => void;

  fetchProducts: (pointOfSaleId?: string | null) => Promise<void>;

  addProduct: (product: DistributionProduct) => void;

  updateProductQuantity: (variantId: string, quantity: number) => void;

  removeProduct: (variantId: string) => void;

  setSearch: (search: string) => void;

  createDistribution: () => Promise<void>;

  clearError: () => void;

  reset: () => Promise<void>;
}

// ==========================================================
// CACHE
// ==========================================================

const loadCache = async (
  pointOfSaleId: string | null,
): Promise<DistributionProduct[]> => {
  const cacheKey = getLocationCacheKey(pointOfSaleId);

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    const products = parsed?.products?.[cacheKey];

    if (!Array.isArray(products)) {
      return [];
    }

    return products;
  } catch (error) {
    console.error("[Distribution] Erreur lecture cache:", error);

    return [];
  }
};

const saveCache = async (
  pointOfSaleId: string | null,
  products: DistributionProduct[],
): Promise<void> => {
  const cacheKey = getLocationCacheKey(pointOfSaleId);

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    const parsed = raw ? JSON.parse(raw) : {};

    const nextCache = {
      ...parsed,
      products: {
        ...(parsed?.products ?? {}),
        [cacheKey]: products,
      },
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextCache));
  } catch (error) {
    console.error("[Distribution] Erreur sauvegarde cache:", error);
  }
};

// ==========================================================
// STORE
// ==========================================================

export const useDistributionStore = create<DistributionState>((set, get) => ({
  // ======================================================
  // STATE
  // ======================================================

  fromPosId: null,
  toPosId: null,

  fromSelected: false,
  toSelected: false,

  products: [],
  selectedProducts: [],

  filters: {
    search: "",
  },

  isLoadingProducts: false,
  isSubmitting: false,

  error: null,

  // ======================================================
  // SOURCE
  // ======================================================

  setFromPosId: async (pointOfSaleId) => {
    set({
      fromPosId: pointOfSaleId,
      fromSelected: true,
      products: [],
      selectedProducts: [],
      error: null,
    });

    await get().fetchProducts(pointOfSaleId);
  },

  // ======================================================
  // DESTINATION
  // ======================================================

  setToPosId: (pointOfSaleId) => {
    set({
      toPosId: pointOfSaleId,
      toSelected: true,
      error: null,
    });
  },

  // ======================================================
  // PRODUCTS
  // ======================================================

  fetchProducts: async (pointOfSaleId = null) => {
    set({
      isLoadingProducts: true,
      error: null,
    });

    try {
      // --------------------------------------------------
      // CACHE LOCAL
      // --------------------------------------------------

      const cachedProducts = await loadCache(pointOfSaleId);

      set({
        products: cachedProducts,
      });

      // --------------------------------------------------
      // PARAMÈTRES
      // --------------------------------------------------

      const params: Record<string, string> = {};

      if (pointOfSaleId !== null) {
        params.fromPosId = pointOfSaleId;
      }

      // --------------------------------------------------
      // API
      // --------------------------------------------------

      const response = await api.get("/distribution", {
        params,
      });

      // --------------------------------------------------
      // RESPONSE
      // --------------------------------------------------

      const data = response.data?.data;

      const products = data?.products ?? [];

      set({
        products,
        isLoadingProducts: false,
      });

      await saveCache(pointOfSaleId, products);
    } catch (error) {
      // --------------------------------------------------
      // ERREUR
      // --------------------------------------------------

      console.error("[Distribution] Erreur récupération produits:", error);

      // --------------------------------------------------
      // CACHE FALLBACK
      // --------------------------------------------------

      const cachedProducts = await loadCache(pointOfSaleId);

      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          error.message ??
          "Impossible de récupérer les produits.")
        : error instanceof Error
          ? error.message
          : "Impossible de récupérer les produits.";

      set({
        products: cachedProducts,
        isLoadingProducts: false,
        error: cachedProducts.length > 0 ? null : message,
      });
    }
  },

  // ======================================================
  // ADD PRODUCT
  // ======================================================

  addProduct: (product) => {
    const selected = get().selectedProducts;

    const existing = selected.find(
      (item) => item.variantId === product.variantId,
    );

    if (existing) {
      return;
    }

    const nextProduct: DistributionSelectedProduct = {
      variantId: product.variantId,
      productId: product.productId,
      productName: product.productName,
      productImage: product.productImage,
      sku: product.sku,
      packagingId: product.packagingId,
      packagingName: product.packagingName,
      packagingSize: product.packagingSize,
      capacityMl: product.capacityMl,
      availableQuantity: product.quantity,
      quantity: 1,
    };

    set({
      selectedProducts: [...selected, nextProduct],
    });
  },

  // ======================================================
  // UPDATE QUANTITY
  // ======================================================

  updateProductQuantity: (variantId, quantity) => {
    const selected = get().selectedProducts;

    const nextQuantity = Math.max(
      1,
      Math.min(
        quantity,
        selected.find((item) => item.variantId === variantId)
          ?.availableQuantity ?? quantity,
      ),
    );

    set({
      selectedProducts: selected.map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      ),
    });
  },

  // ======================================================
  // REMOVE PRODUCT
  // ======================================================

  removeProduct: (variantId) => {
    set({
      selectedProducts: get().selectedProducts.filter(
        (item) => item.variantId !== variantId,
      ),
    });
  },

  // ======================================================
  // SEARCH
  // ======================================================

  setSearch: (search) => {
    set({
      filters: {
        search,
      },
    });
  },

  // ======================================================
  // CREATE DISTRIBUTION
  // ======================================================

  createDistribution: async () => {
    const {
      fromPosId,
      toPosId,
      fromSelected,
      toSelected,
      selectedProducts,
      isSubmitting,
    } = get();

    if (isSubmitting) {
      return;
    }

    if (!fromSelected) {
      set({
        error: "POINTS_NOT_SELECTED",
      });

      return;
    }

    if (!toSelected) {
      set({
        error: "POINTS_NOT_SELECTED",
      });

      return;
    }

    if (fromPosId !== null && toPosId !== null && fromPosId === toPosId) {
      set({
        error: "SAME_POINT_OF_SALE",
      });

      return;
    }

    if (selectedProducts.length === 0) {
      set({
        error: "NO_PRODUCTS_SELECTED",
      });

      return;
    }

    const items = selectedProducts.map((product) => ({
      variantId: product.variantId,
      quantity: product.quantity,
    }));

    const payload: CreateDistributionInput = {
      fromPosId,
      toPosId,
      items,
    };

    set({
      isSubmitting: true,
      error: null,
    });

    try {
      await api.post("/distribution", payload);

      // ------------------------------------------------
      // REFRESH SOURCE
      // ------------------------------------------------

      await get().fetchProducts(fromPosId);

      // ------------------------------------------------
      // RESET SELECTION
      // ------------------------------------------------

      set({
        selectedProducts: [],
        isSubmitting: false,
        error: null,
      });
    } catch (error) {
      // ------------------------------------------------
      // ERREUR
      // ------------------------------------------------

      console.error("[Distribution] Erreur création distribution:", error);

      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          error.message ??
          "Impossible de créer la distribution.")
        : error instanceof Error
          ? error.message
          : "Impossible de créer la distribution.";

      set({
        isSubmitting: false,
        error: message,
      });
    }
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
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("[Distribution] Erreur suppression cache:", error);
    }

    set({
      fromPosId: null,
      toPosId: null,

      fromSelected: true,
      toSelected: false,

      products: [],
      selectedProducts: [],

      filters: {
        search: "",
      },

      isLoadingProducts: false,
      isSubmitting: false,

      error: null,
    });
  },
}));
