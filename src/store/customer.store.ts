import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { create } from "zustand";

import { api } from "@/utils/api";

import type {
  Customer,
  CustomerDetail,
  CustomerPagination,
  CustomerPointOfSale,
} from "@/types/customer";

const CUSTOMER_STORAGE_KEY = "jardin-customer-storage";

const CUSTOMER_DETAIL_STORAGE_KEY = "jardin-customer-detail-storage";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

interface CustomerCache {
  customers: Customer[];
  pagination: CustomerPagination | null;
  search: string;
  updatedAt: string;
}

interface CustomerDetailCache {
  customer: CustomerDetail;
  updatedAt: string;
}

interface CustomerStoreState {
  // ============================================================
  // LISTE
  // ============================================================

  customers: Customer[];

  pagination: CustomerPagination | null;

  search: string;

  selectedPointOfSale: CustomerPointOfSale | null;

  availablePointOfSales: CustomerPointOfSale[];

  // ============================================================
  // DÉTAIL
  // ============================================================

  selectedCustomer: CustomerDetail | null;

  detailPagination: CustomerPagination | null;

  // ============================================================
  // ÉTATS
  // ============================================================

  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingDetails: boolean;
  isLoadingMore: boolean;
  isOffline: boolean;

  error: string | null;
  detailError: string | null;

  // ============================================================
  // POS
  // ============================================================

  setAvailablePointOfSales: (pointOfSales: CustomerPointOfSale[]) => void;

  selectPointOfSale: (pointOfSale: CustomerPointOfSale) => Promise<void>;

  clearSelectedPointOfSale: () => void;

  // ============================================================
  // LISTE CLIENTS
  // ============================================================

  fetchCustomers: (pointOfSaleId?: string, search?: string) => Promise<void>;

  refreshCustomers: () => Promise<void>;

  searchCustomers: (search: string) => Promise<void>;

  loadMoreCustomers: () => Promise<void>;

  // ============================================================
  // DÉTAIL CLIENT
  // ============================================================

  getCustomer: (
    clientId: string,
    pointOfSaleId?: string,
  ) => Promise<CustomerDetail | null>;

  refreshCustomer: (clientId: string, pointOfSaleId?: string) => Promise<void>;

  // ============================================================
  // UTILITAIRES
  // ============================================================

  setSearch: (search: string) => void;

  clearSelectedCustomer: () => void;

  clearError: () => void;

  clearDetailError: () => void;

  reset: () => Promise<void>;
}

// ================================================================
// HELPERS
// ================================================================

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

// ================================================================
// CACHE LISTE
// ================================================================

const getCustomerCacheKey = (pointOfSaleId: string): string => {
  return `${CUSTOMER_STORAGE_KEY}:${pointOfSaleId}`;
};

const getCustomerDetailCacheKey = (
  pointOfSaleId: string,
  clientId: string,
): string => {
  return `${CUSTOMER_DETAIL_STORAGE_KEY}:${pointOfSaleId}:${clientId}`;
};

const readCustomerCache = async (
  pointOfSaleId: string,
): Promise<CustomerCache | null> => {
  try {
    const key = getCustomerCacheKey(pointOfSaleId);

    const stored = await AsyncStorage.getItem(key);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as CustomerCache;
  } catch (error) {
    console.error("Erreur lecture cache clients :", error);

    return null;
  }
};

const saveCustomerCache = async (
  pointOfSaleId: string,
  cache: CustomerCache,
): Promise<void> => {
  try {
    const key = getCustomerCacheKey(pointOfSaleId);

    await AsyncStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error("Erreur sauvegarde cache clients :", error);
  }
};

// ================================================================
// CACHE DÉTAIL
// ================================================================

const readCustomerDetailCache = async (
  pointOfSaleId: string,
  clientId: string,
): Promise<CustomerDetailCache | null> => {
  try {
    const key = getCustomerDetailCacheKey(pointOfSaleId, clientId);

    const stored = await AsyncStorage.getItem(key);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as CustomerDetailCache;
  } catch (error) {
    console.error("Erreur lecture cache détail client :", error);

    return null;
  }
};

const saveCustomerDetailCache = async (
  pointOfSaleId: string,
  clientId: string,
  cache: CustomerDetailCache,
): Promise<void> => {
  try {
    const key = getCustomerDetailCacheKey(pointOfSaleId, clientId);

    await AsyncStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error("Erreur sauvegarde cache détail client :", error);
  }
};

// ================================================================
// STORE
// ================================================================

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  // ==========================================================
  // INITIAL STATE
  // ==========================================================

  customers: [],

  pagination: null,

  search: "",

  selectedPointOfSale: null,

  availablePointOfSales: [],

  selectedCustomer: null,

  detailPagination: null,

  isLoading: false,

  isRefreshing: false,

  isLoadingDetails: false,

  isLoadingMore: false,

  isOffline: false,

  error: null,

  detailError: null,

  // ==========================================================
  // POS
  // ==========================================================

  setAvailablePointOfSales: (pointOfSales) => {
    const activePointOfSales = pointOfSales.filter(
      (pointOfSale) => pointOfSale.isActive,
    );

    set({
      availablePointOfSales: activePointOfSales,
    });

    // --------------------------------------------------------
    // Ne pas écraser un POS déjà sélectionné.
    // --------------------------------------------------------

    const current = get().selectedPointOfSale;

    if (
      current &&
      activePointOfSales.some((pointOfSale) => pointOfSale.id === current.id)
    ) {
      return;
    }

    // --------------------------------------------------------
    // POS par défaut :
    //
    // 1. POS principal
    // 2. Sinon premier POS actif
    // --------------------------------------------------------

    const defaultPointOfSale =
      activePointOfSales.find((pointOfSale) => pointOfSale.isMainStore) ??
      activePointOfSales[0] ??
      null;

    set({
      selectedPointOfSale: defaultPointOfSale,
    });
  },

  selectPointOfSale: async (pointOfSale) => {
    set({
      selectedPointOfSale: pointOfSale,

      customers: [],

      pagination: null,

      selectedCustomer: null,

      detailPagination: null,

      error: null,

      detailError: null,

      isOffline: false,
    });

    await get().fetchCustomers(pointOfSale.id, get().search);
  },

  clearSelectedPointOfSale: () => {
    set({
      selectedPointOfSale: null,

      customers: [],

      pagination: null,

      selectedCustomer: null,

      detailPagination: null,
    });
  },

  // ==========================================================
  // FETCH CUSTOMERS
  // ==========================================================

  fetchCustomers: async (pointOfSaleId, search) => {
    const currentPOS = get().selectedPointOfSale;

    const resolvedPointOfSaleId = pointOfSaleId ?? currentPOS?.id;

    if (!resolvedPointOfSaleId) {
      set({
        error: "Aucun point de vente sélectionné.",
        customers: [],
        pagination: null,
      });

      return;
    }

    const resolvedSearch =
      search !== undefined ? search.trim() : get().search.trim();

    set({
      isLoading: true,
      error: null,
      isOffline: false,
      search: resolvedSearch,
    });

    // --------------------------------------------------------
    // CACHE
    // --------------------------------------------------------

    const cached = await readCustomerCache(resolvedPointOfSaleId);

    if (cached) {
      set({
        customers: cached.customers,

        pagination: cached.pagination,

        search: cached.search,

        isLoading: false,
      });
    }

    // --------------------------------------------------------
    // SERVER
    // --------------------------------------------------------

    try {
      const response = await api.get("/customer", {
        params: {
          pointOfSaleId: resolvedPointOfSaleId,

          search: resolvedSearch || undefined,

          page: DEFAULT_PAGE,

          limit: DEFAULT_LIMIT,
        },
      });

      const data = response.data;

      const customers = (data?.customers ?? []) as Customer[];

      const pagination = (data?.pagination ??
        null) as CustomerPagination | null;

      await saveCustomerCache(resolvedPointOfSaleId, {
        customers,
        pagination,
        search: resolvedSearch,
        updatedAt: new Date().toISOString(),
      });

      set({
        customers,

        pagination,

        search: resolvedSearch,

        isLoading: false,

        isOffline: false,

        error: null,
      });
    } catch (error) {
      console.error("Erreur récupération clients :", error);

      // ------------------------------------------------------
      // Si cache disponible :
      // on reste fonctionnel offline.
      // ------------------------------------------------------

      if (cached) {
        set({
          customers: cached.customers,

          pagination: cached.pagination,

          search: cached.search,

          isLoading: false,

          isOffline: true,

          error: null,
        });

        return;
      }

      set({
        isLoading: false,

        isOffline: true,

        error: getErrorMessage(error, "Impossible de récupérer les clients."),
      });
    }
  },

  // ==========================================================
  // REFRESH
  // ==========================================================

  refreshCustomers: async () => {
    const pointOfSaleId = get().selectedPointOfSale?.id;

    if (!pointOfSaleId) {
      return;
    }

    const search = get().search.trim();

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const response = await api.get("/customer", {
        params: {
          pointOfSaleId,

          search: search || undefined,

          page: DEFAULT_PAGE,

          limit: DEFAULT_LIMIT,
        },
      });

      const data = response.data;

      const customers = (data?.customers ?? []) as Customer[];

      const pagination = (data?.pagination ??
        null) as CustomerPagination | null;

      await saveCustomerCache(pointOfSaleId, {
        customers,
        pagination,
        search,
        updatedAt: new Date().toISOString(),
      });

      set({
        customers,

        pagination,

        isRefreshing: false,

        isOffline: false,

        error: null,
      });
    } catch (error) {
      console.error("Erreur actualisation clients :", error);

      set({
        isRefreshing: false,

        isOffline: true,

        error: getErrorMessage(error, "Impossible d'actualiser les clients."),
      });
    }
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchCustomers: async (search) => {
    const cleanSearch = search.trim();

    set({
      search: cleanSearch,
    });

    const pointOfSaleId = get().selectedPointOfSale?.id;

    if (!pointOfSaleId) {
      return;
    }

    await get().fetchCustomers(pointOfSaleId, cleanSearch);
  },

  // ==========================================================
  // LOAD MORE CUSTOMERS
  // ==========================================================

  loadMoreCustomers: async () => {
    const pointOfSaleId = get().selectedPointOfSale?.id;

    const pagination = get().pagination;

    if (
      !pointOfSaleId ||
      !pagination ||
      !pagination.hasNextPage ||
      get().isLoadingMore
    ) {
      return;
    }

    set({
      isLoadingMore: true,
    });

    try {
      const nextPage = pagination.page + 1;

      const response = await api.get("/customer", {
        params: {
          pointOfSaleId,

          search: get().search.trim() || undefined,

          page: nextPage,

          limit: pagination.limit || DEFAULT_LIMIT,
        },
      });

      const data = response.data;

      const newCustomers = (data?.customers ?? []) as Customer[];

      const newPagination = (data?.pagination ??
        null) as CustomerPagination | null;

      const customers = [...get().customers, ...newCustomers];

      await saveCustomerCache(pointOfSaleId, {
        customers,

        pagination: newPagination ?? pagination,

        search: get().search,

        updatedAt: new Date().toISOString(),
      });

      set({
        customers,

        pagination: newPagination ?? pagination,

        isLoadingMore: false,

        isOffline: false,
      });
    } catch (error) {
      console.error("Erreur chargement clients supplémentaires :", error);

      set({
        isLoadingMore: false,

        isOffline: true,
      });
    }
  },

  // ==========================================================
  // GET CUSTOMER DETAIL
  // ==========================================================

  getCustomer: async (clientId, pointOfSaleId) => {
    const resolvedPointOfSaleId =
      pointOfSaleId ?? get().selectedPointOfSale?.id;

    if (!resolvedPointOfSaleId) {
      set({
        detailError: "Aucun point de vente sélectionné.",
      });

      return null;
    }

    set({
      isLoadingDetails: true,

      detailError: null,

      isOffline: false,
    });

    // --------------------------------------------------------
    // CACHE
    // --------------------------------------------------------

    const cached = await readCustomerDetailCache(
      resolvedPointOfSaleId,
      clientId,
    );

    if (cached) {
      set({
        selectedCustomer: cached.customer,

        isLoadingDetails: false,
      });
    }

    // --------------------------------------------------------
    // SERVER
    // --------------------------------------------------------

    try {
      const response = await api.get(`/customer/${clientId}`, {
        params: {
          pointOfSaleId: resolvedPointOfSaleId,
        },
      });

      const data = response.data;

      const customer = data?.customer as CustomerDetail | undefined;

      if (!customer) {
        throw new Error("Les informations du client sont introuvables.");
      }

      await saveCustomerDetailCache(resolvedPointOfSaleId, clientId, {
        customer,

        updatedAt: new Date().toISOString(),
      });

      set({
        selectedCustomer: customer,

        detailPagination: data?.pagination ?? null,

        isLoadingDetails: false,

        isOffline: false,

        detailError: null,
      });

      return customer;
    } catch (error) {
      console.error("Erreur récupération détail client :", error);

      if (cached) {
        set({
          selectedCustomer: cached.customer,

          isLoadingDetails: false,

          isOffline: true,

          detailError: null,
        });

        return cached.customer;
      }

      set({
        isLoadingDetails: false,

        isOffline: true,

        detailError: getErrorMessage(
          error,
          "Impossible de récupérer les informations du client.",
        ),
      });

      return null;
    }
  },

  // ==========================================================
  // REFRESH DETAIL
  // ==========================================================

  refreshCustomer: async (clientId, pointOfSaleId) => {
    const resolvedPointOfSaleId =
      pointOfSaleId ?? get().selectedPointOfSale?.id;

    if (!resolvedPointOfSaleId) {
      return;
    }

    set({
      isLoadingDetails: true,

      detailError: null,
    });

    try {
      const response = await api.get(`/customer/${clientId}`, {
        params: {
          pointOfSaleId: resolvedPointOfSaleId,
        },
      });

      const data = response.data;

      const customer = data?.customer as CustomerDetail | undefined;

      if (!customer) {
        throw new Error("Les informations du client sont introuvables.");
      }

      await saveCustomerDetailCache(resolvedPointOfSaleId, clientId, {
        customer,

        updatedAt: new Date().toISOString(),
      });

      set({
        selectedCustomer: customer,

        detailPagination: data?.pagination ?? null,

        isLoadingDetails: false,

        isOffline: false,

        detailError: null,
      });
    } catch (error) {
      console.error("Erreur actualisation détail client :", error);

      set({
        isLoadingDetails: false,

        isOffline: true,

        detailError: getErrorMessage(
          error,
          "Impossible d'actualiser les informations du client.",
        ),
      });
    }
  },

  // ==========================================================
  // SEARCH STATE
  // ==========================================================

  setSearch: (search) => {
    set({
      search,
    });
  },

  // ==========================================================
  // CLEAR DETAIL
  // ==========================================================

  clearSelectedCustomer: () => {
    set({
      selectedCustomer: null,

      detailPagination: null,

      detailError: null,
    });
  },

  // ==========================================================
  // ERRORS
  // ==========================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  clearDetailError: () => {
    set({
      detailError: null,
    });
  },

  // ==========================================================
  // RESET
  // ==========================================================

  reset: async () => {
    set({
      customers: [],

      pagination: null,
      search: "",

      selectedPointOfSale: null,
      availablePointOfSales: [],
      selectedCustomer: null,
      detailPagination: null,

      isLoading: false,
      isRefreshing: false,
      isLoadingDetails: false,
      isLoadingMore: false,
      isOffline: false,

      error: null,
      detailError: null,
    });
  },
}));
