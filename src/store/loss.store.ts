import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { create } from "zustand";

import type {
  CreateExpiredLossesResponse,
  CreateLossInput,
  LossFilters,
  LossItem,
  LossListResponse,
  LossPagination,
  PendingLossItem,
} from "@/types/loss";
import { api } from "@/utils/api";

const CACHE_KEY = "jardin-loss-storage";

const DEFAULT_PAGINATION: LossPagination = {
  page: 1,
  limit: 20,
  total: 0,
  hasMore: false,
};

interface LossCache {
  losses: LossItem[];
  pendingLosses: PendingLossItem[];
  pagination: LossPagination;
}

interface LossStore {
  // ============================================================
  // DATA
  // ============================================================

  losses: LossItem[];
  pendingLosses: PendingLossItem[];
  pagination: LossPagination;

  // ============================================================
  // STATE
  // ============================================================

  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isLoadingPending: boolean;
  isCreating: boolean;
  isProcessingExpired: boolean;
  error: string | null;

  // ============================================================
  // ACTIONS
  // ============================================================

  fetchLosses: (filters?: LossFilters) => Promise<void>;

  refreshLosses: (filters?: LossFilters) => Promise<void>;
  loadMoreLosses: (filters?: LossFilters) => Promise<void>;

  fetchPendingLosses: () => Promise<void>;

  createLoss: (input: CreateLossInput) => Promise<LossItem>;
  createExpiredLosses: () => Promise<CreateExpiredLossesResponse>;

  hydrateFromCache: () => Promise<void>;
  clearError: () => void;
  clearLosses: () => void;
}

// ============================================================
// CACHE
// ============================================================

async function readCache(): Promise<LossCache | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);

    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as LossCache;
  } catch (error) {
    console.error("Erreur lecture cache pertes :", error);

    return null;
  }
}

async function saveCache(cache: LossCache): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Erreur sauvegarde cache pertes :", error);
  }
}

// ============================================================
// ERROR MESSAGE
// ============================================================

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

// ============================================================
// QUERY
// ============================================================

function buildLossQuery(filters: LossFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.reason) {
    params.set("reason", filters.reason);
  }

  if (filters.pointOfSaleId) {
    params.set("pointOfSaleId", filters.pointOfSaleId);
  }

  params.set("page", String(filters.page ?? 1));

  params.set("limit", String(filters.limit ?? 20));

  return params.toString();
}

// ============================================================
// STORE
// ============================================================

export const useLossStore = create<LossStore>((set, get) => ({
  // ========================================================
  // INITIAL STATE
  // ========================================================

  losses: [],
  pendingLosses: [],
  pagination: DEFAULT_PAGINATION,

  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isLoadingPending: false,
  isCreating: false,
  isProcessingExpired: false,

  error: null,

  // ========================================================
  // HYDRATE CACHE
  // ========================================================

  hydrateFromCache: async () => {
    const cached = await readCache();

    if (!cached) {
      return;
    }

    set({
      losses: cached.losses ?? [],
      pendingLosses: cached.pendingLosses ?? [],
      pagination: cached.pagination ?? DEFAULT_PAGINATION,
    });
  },

  // ========================================================
  // FETCH LOSSES
  // ========================================================

  fetchLosses: async (filters = {}) => {
    const hasCachedData = get().losses.length > 0;

    set({
      isLoading: !hasCachedData,
      error: null,
    });

    try {
      const query = buildLossQuery({
        ...filters,
        page: 1,
      });

      const response = await api.get<{
        success: boolean;
        data: LossListResponse;
      }>(`/losses?${query}`);

      const data = response.data.data;

      set({
        losses: data.items,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      });

      await saveCache({
        losses: data.items,
        pendingLosses: get().pendingLosses,
        pagination: data.pagination,
      });
    } catch (error) {
      console.error("Erreur récupération pertes :", error);

      set({
        isLoading: false,
        error: hasCachedData
          ? null
          : getApiErrorMessage(error, "Impossible de récupérer les pertes."),
      });
    }
  },

  // ========================================================
  // REFRESH
  // ========================================================

  refreshLosses: async (filters = {}) => {
    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const query = buildLossQuery({
        ...filters,
        page: 1,
      });

      const response = await api.get<{
        success: boolean;
        data: LossListResponse;
      }>(`/losses?${query}`);

      const data = response.data.data;

      set({
        losses: data.items,
        pagination: data.pagination,
        isRefreshing: false,
        error: null,
      });

      await saveCache({
        losses: data.items,
        pendingLosses: get().pendingLosses,
        pagination: data.pagination,
      });
    } catch (error) {
      console.error("Erreur actualisation pertes :", error);

      set({
        isRefreshing: false,
        error: null,
      });
    }
  },

  // ========================================================
  // LOAD MORE
  // ========================================================

  loadMoreLosses: async (filters = {}) => {
    const { pagination, isLoadingMore } = get();

    if (isLoadingMore || !pagination.hasMore) {
      return;
    }

    set({
      isLoadingMore: true,
    });

    try {
      const nextPage = pagination.page + 1;

      const query = buildLossQuery({
        ...filters,
        page: nextPage,
      });

      const response = await api.get<{
        success: boolean;
        data: LossListResponse;
      }>(`/losses?${query}`);

      const data = response.data.data;

      set((state) => ({
        losses: [...state.losses, ...data.items],
        pagination: data.pagination,
        isLoadingMore: false,
      }));

      await saveCache({
        losses: get().losses,
        pendingLosses: get().pendingLosses,
        pagination: data.pagination,
      });
    } catch (error) {
      console.error("Erreur chargement pertes supplémentaires :", error);

      set({
        isLoadingMore: false,
      });
    }
  },

  // ========================================================
  // FETCH PENDING LOSSES
  // ========================================================

  fetchPendingLosses: async () => {
    const hasCachedData = get().pendingLosses.length > 0;

    set({
      isLoadingPending: !hasCachedData,
    });

    try {
      const response = await api.get<{
        success: boolean;
        data: PendingLossItem[];
      }>("/losses?pending=true");

      const pendingLosses = response.data.data;

      set({
        pendingLosses,
        isLoadingPending: false,
      });

      await saveCache({
        losses: get().losses,
        pendingLosses,
        pagination: get().pagination,
      });
    } catch (error) {
      console.error("Erreur récupération pertes à traiter :", error);

      set({
        isLoadingPending: false,
      });
    }
  },

  // ========================================================
  // CREATE MANUAL LOSS
  // ========================================================

  createLoss: async (input) => {
    set({
      isCreating: true,
      error: null,
    });

    try {
      const response = await api.post<{
        success: boolean;
        data: {
          loss: LossItem;
        };
      }>("/losses", input);

      const loss = response.data.data.loss;

      set({
        isCreating: false,
        error: null,
      });

      await Promise.all([get().fetchLosses(), get().fetchPendingLosses()]);

      return loss;
    } catch (error) {
      console.error("Erreur création perte :", error);

      const message = getApiErrorMessage(
        error,
        "Impossible d'enregistrer la perte.",
      );

      set({
        isCreating: false,
        error: message,
      });

      throw new Error(message);
    }
  },

  // ========================================================
  // CREATE ALL EXPIRED LOSSES
  // ========================================================

  createExpiredLosses: async () => {
    set({
      isProcessingExpired: true,
      error: null,
    });

    try {
      const response = await api.post<{
        success: boolean;
        data: CreateExpiredLossesResponse;
      }>("/losses", {
        action: "EXPIRED",
      });

      const result = response.data.data;

      set({
        isProcessingExpired: false,
        error: null,
      });

      await Promise.all([get().fetchLosses(), get().fetchPendingLosses()]);

      return result;
    } catch (error) {
      console.error("Erreur traitement produits expirés :", error);

      const message = getApiErrorMessage(
        error,
        "Impossible de traiter les produits expirés.",
      );

      set({
        isProcessingExpired: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // CLEAR ERROR
  // ========================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ========================================================
  // CLEAR
  // ========================================================

  clearLosses: () => {
    set({
      losses: [],
      pendingLosses: [],
      pagination: DEFAULT_PAGINATION,
      error: null,
    });
  },
}));
