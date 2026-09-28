import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { api } from "@/utils/api";

import type {
  Customer,
  CustomerDetail,
  CustomerInvoice,
  CustomerListItem,
  CustomerLoyaltyTransaction,
  CustomerPagination,
  CustomerPointOfSale,
  CustomerPointOfSaleContext,
  CustomerStatistics,
  CustomerSync,
} from "@/types/customer";

// ======================================================
// CONSTANTS
// ======================================================

const CUSTOMER_STORAGE_KEY = "jardin-customer-storage";
const CUSTOMER_DETAIL_STORAGE_KEY = "jardin-customer-detail-storage";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const ALL_POINT_OF_SALES_KEY = "ALL";

// ======================================================
// CACHE TYPES
// ======================================================

interface CustomerCache {
  customers: CustomerListItem[];
  pagination: CustomerPagination;
  search: string;
  pointOfSale: CustomerPointOfSaleContext;
  sync: CustomerSync | null;
  updatedAt: string;
}

interface CustomerDetailCache {
  customer: CustomerDetail;
  pagination: CustomerPagination;
  pointOfSale: CustomerPointOfSaleContext;
  sync: CustomerSync | null;
  updatedAt: string;
}

// ======================================================
// STORE TYPES
// ======================================================

interface CustomerStore {
  // ----------------------------------------------------
  // LIST STATE
  // ----------------------------------------------------

  customers: CustomerListItem[];
  pagination: CustomerPagination | null;
  search: string;

  // ----------------------------------------------------
  // POS CONTEXT
  // ----------------------------------------------------

  selectedPointOfSale: CustomerPointOfSale | null;
  isAllPointOfSales: boolean;
  availablePointOfSales: CustomerPointOfSale[];

  // ----------------------------------------------------
  // DETAIL STATE
  // ----------------------------------------------------

  selectedCustomer: CustomerDetail | null;
  detailPagination: CustomerPagination | null;

  // ----------------------------------------------------
  // SYNC / STATUS
  // ----------------------------------------------------

  sync: CustomerSync | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isLoadingDetail: boolean;
  isRefreshingDetail: boolean;

  isOffline: boolean;

  error: string | null;
  detailError: string | null;

  // ----------------------------------------------------
  // POS
  // ----------------------------------------------------

  setAvailablePointOfSales: (pointOfSales: CustomerPointOfSale[]) => void;

  selectPointOfSale: (pointOfSale: CustomerPointOfSale | null) => Promise<void>;

  selectAllPointOfSales: () => Promise<void>;

  clearSelectedPointOfSale: () => void;

  // ----------------------------------------------------
  // CUSTOMER LIST
  // ----------------------------------------------------

  fetchCustomers: (pointOfSaleId?: string, search?: string) => Promise<void>;

  refreshCustomers: () => Promise<void>;

  searchCustomers: (search: string) => Promise<void>;

  loadMoreCustomers: () => Promise<void>;

  // ----------------------------------------------------
  // CUSTOMER DETAIL
  // ----------------------------------------------------

  getCustomer: (
    clientId: string,
    pointOfSaleId?: string,
  ) => Promise<CustomerDetail | null>;

  refreshCustomer: () => Promise<void>;

  // ----------------------------------------------------
  // UTILITIES
  // ----------------------------------------------------

  clearCustomers: () => void;

  clearSelectedCustomer: () => void;

  clearError: () => void;

  clearDetailError: () => void;

  reset: () => void;
}

// ======================================================
// HELPERS
// ======================================================

const getScopeKey = (pointOfSaleId?: string | null): string => {
  return pointOfSaleId?.trim() || ALL_POINT_OF_SALES_KEY;
};

const getCustomerCacheKey = (pointOfSaleId: string, search: string): string => {
  return `${CUSTOMER_STORAGE_KEY}:${pointOfSaleId}:${search.trim()}`;
};

const getCustomerDetailCacheKey = (
  pointOfSaleId: string,
  clientId: string,
): string => {
  return `${CUSTOMER_DETAIL_STORAGE_KEY}:${pointOfSaleId}:${clientId}`;
};

const createDefaultPagination = (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): CustomerPagination => ({
  page,
  limit,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

const createDefaultPointOfSaleContext = (
  isAll = false,
): CustomerPointOfSaleContext => ({
  id: null,
  isAll,
});

// ======================================================
// DETAIL COMPOSER
// ======================================================

const buildCustomerDetail = (
  customer: Customer,
  statistics?: CustomerStatistics,
  invoices?: CustomerInvoice[],
  loyaltyTransactions?: CustomerLoyaltyTransaction[],
): CustomerDetail => {
  return {
    ...customer,

    statistics: statistics ?? {
      totalSpent: "0",
      purchaseCount: 0,
      averagePurchaseAmount: "0",
      totalPointsEarned: 0,
      totalPointsUsed: 0,
      lastPurchaseAt: null,
    },

    invoices: invoices ?? [],

    loyaltyTransactions: loyaltyTransactions ?? [],
  };
};

// ======================================================
// STORE
// ======================================================

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  // ====================================================
  // INITIAL STATE
  // ====================================================

  customers: [],
  pagination: null,
  search: "",

  selectedPointOfSale: null,
  isAllPointOfSales: false,
  availablePointOfSales: [],

  selectedCustomer: null,
  detailPagination: null,

  sync: null,

  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isLoadingDetail: false,
  isRefreshingDetail: false,

  isOffline: false,

  error: null,
  detailError: null,

  // ====================================================
  // POS
  // ====================================================

  setAvailablePointOfSales: (pointOfSales) => {
    const activePointOfSales = pointOfSales.filter(
      (pointOfSale) => pointOfSale.isActive,
    );

    const currentPointOfSale = get().selectedPointOfSale;

    if (
      currentPointOfSale &&
      activePointOfSales.some(
        (pointOfSale) => pointOfSale.id === currentPointOfSale.id,
      )
    ) {
      set({
        availablePointOfSales: activePointOfSales,
      });

      return;
    }

    set({
      availablePointOfSales: activePointOfSales,
    });
  },

  // ----------------------------------------------------
  // SELECT POS
  // ----------------------------------------------------

  selectPointOfSale: async (pointOfSale) => {
    if (!pointOfSale) {
      await get().selectAllPointOfSales();
      return;
    }

    if (!pointOfSale.isActive) {
      set({
        error: "Ce point de vente est inactif.",
      });

      return;
    }

    set({
      selectedPointOfSale: pointOfSale,
      isAllPointOfSales: false,

      customers: [],
      pagination: null,
      search: "",

      selectedCustomer: null,
      detailPagination: null,

      sync: null,

      error: null,
      detailError: null,
    });

    await get().fetchCustomers(pointOfSale.id);
  },

  // ----------------------------------------------------
  // SELECT ALL POS
  // ----------------------------------------------------

  selectAllPointOfSales: async () => {
    set({
      selectedPointOfSale: null,
      isAllPointOfSales: true,

      customers: [],
      pagination: null,
      search: "",

      selectedCustomer: null,
      detailPagination: null,

      sync: null,

      error: null,
      detailError: null,
    });

    await get().fetchCustomers();
  },

  // ----------------------------------------------------
  // CLEAR POS
  // ----------------------------------------------------

  clearSelectedPointOfSale: () => {
    set({
      selectedPointOfSale: null,
      isAllPointOfSales: false,

      customers: [],
      pagination: null,
      search: "",

      selectedCustomer: null,
      detailPagination: null,

      sync: null,

      error: null,
      detailError: null,
    });
  },

  // ====================================================
  // CUSTOMER LIST
  // ====================================================

  fetchCustomers: async (pointOfSaleId, search) => {
    const state = get();

    const resolvedSearch = search ?? state.search;

    const resolvedPointOfSaleId =
      pointOfSaleId ?? state.selectedPointOfSale?.id ?? undefined;

    const scopeKey = getScopeKey(resolvedPointOfSaleId);

    set({
      isLoading: true,
      error: null,
      isOffline: false,
      search: resolvedSearch,
    });

    try {
      // ------------------------------------------------
      // CACHE
      // ------------------------------------------------

      const cacheKey = getCustomerCacheKey(scopeKey, resolvedSearch);

      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const cache: CustomerCache = JSON.parse(cachedData);

          set({
            customers: cache.customers,
            pagination: cache.pagination,
            sync: cache.sync,
            isOffline: false,
          });
        } catch {
          // Ignore corrupted cache.
        }
      }

      // ------------------------------------------------
      // REQUEST
      // ------------------------------------------------

      const params: Record<string, string | number> = {
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
      };

      if (resolvedSearch.trim()) {
        params.search = resolvedSearch.trim();
      }

      if (resolvedPointOfSaleId) {
        params.pointOfSaleId = resolvedPointOfSaleId;
      }

      const response = await api.get("/customer", {
        params,
      });

      const data = response.data;

      // ------------------------------------------------
      // API ERROR
      // ------------------------------------------------

      if (!data?.success) {
        throw new Error(
          data?.message || "Impossible de récupérer les clients.",
        );
      }

      // ------------------------------------------------
      // RESPONSE
      // ------------------------------------------------

      const customers: CustomerListItem[] = data.customers ?? [];

      const pagination: CustomerPagination =
        data.pagination ?? createDefaultPagination();

      const pointOfSale: CustomerPointOfSaleContext =
        data.pointOfSale ??
        createDefaultPointOfSaleContext(!resolvedPointOfSaleId);

      const sync: CustomerSync | null = data.sync ?? null;

      // ------------------------------------------------
      // SAVE CACHE
      // ------------------------------------------------

      const cache: CustomerCache = {
        customers,
        pagination,
        search: resolvedSearch,
        pointOfSale,
        sync,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));

      // ------------------------------------------------
      // UPDATE STATE
      // ------------------------------------------------

      set({
        customers,
        pagination,
        search: resolvedSearch,
        sync,

        isOffline: false,
        error: null,

        // The API is authoritative about the scope.
        isAllPointOfSales: pointOfSale.isAll,
      });

      if (!pointOfSale.isAll && pointOfSale.id) {
        const currentPointOfSale = get().availablePointOfSales.find(
          (item) => item.id === pointOfSale.id,
        );

        if (currentPointOfSale) {
          set({
            selectedPointOfSale: currentPointOfSale,
          });
        }
      } else {
        set({
          selectedPointOfSale: null,
        });
      }
    } catch (error: any) {
      // ------------------------------------------------
      // OFFLINE FALLBACK
      // ------------------------------------------------

      const cacheKey = getCustomerCacheKey(scopeKey, resolvedSearch);

      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const cache: CustomerCache = JSON.parse(cachedData);

          set({
            customers: cache.customers,
            pagination: cache.pagination,
            search: cache.search,
            sync: cache.sync,

            isOffline: true,
            error: null,

            isAllPointOfSales: cache.pointOfSale.isAll,
            selectedPointOfSale: cache.pointOfSale.isAll
              ? null
              : (get().availablePointOfSales.find(
                  (pointOfSale) => pointOfSale.id === cache.pointOfSale.id,
                ) ?? null),
          });

          return;
        } catch {
          // Ignore corrupted cache.
        }
      }

      set({
        isOffline: true,
        error:
          error?.response?.data?.message ??
          error?.message ??
          "Impossible de récupérer les clients.",
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  // ====================================================
  // REFRESH CUSTOMERS
  // ====================================================

  refreshCustomers: async () => {
    const state = get();

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      await get().fetchCustomers(
        state.isAllPointOfSales ? undefined : state.selectedPointOfSale?.id,
        state.search,
      );
    } finally {
      set({
        isRefreshing: false,
      });
    }
  },

  // ====================================================
  // SEARCH CUSTOMERS
  // ====================================================

  searchCustomers: async (search) => {
    const state = get();

    set({
      search,
    });

    await get().fetchCustomers(
      state.isAllPointOfSales ? undefined : state.selectedPointOfSale?.id,
      search,
    );
  },

  // ====================================================
  // LOAD MORE CUSTOMERS
  // ====================================================

  loadMoreCustomers: async () => {
    const state = get();

    if (state.isLoadingMore || !state.pagination?.hasNextPage) {
      return;
    }

    const nextPage = state.pagination.page + 1;

    const resolvedPointOfSaleId = state.isAllPointOfSales
      ? undefined
      : state.selectedPointOfSale?.id;

    set({
      isLoadingMore: true,
      error: null,
    });

    try {
      const params: Record<string, string | number> = {
        page: nextPage,
        limit: state.pagination.limit,
      };

      if (state.search.trim()) {
        params.search = state.search.trim();
      }

      if (resolvedPointOfSaleId) {
        params.pointOfSaleId = resolvedPointOfSaleId;
      }

      const response = await api.get("/customer", {
        params,
      });

      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.message || "Impossible de charger les clients suivants.",
        );
      }

      const newCustomers: CustomerListItem[] = data.customers ?? [];

      const pagination: CustomerPagination =
        data.pagination ??
        createDefaultPagination(nextPage, state.pagination.limit);

      set({
        customers: [...state.customers, ...newCustomers],
        pagination,

        sync: data.sync ?? state.sync,

        isOffline: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ??
          error?.message ??
          "Impossible de charger les clients suivants.",
      });
    } finally {
      set({
        isLoadingMore: false,
      });
    }
  },

  // ====================================================
  // CUSTOMER DETAIL
  // ====================================================

  getCustomer: async (clientId, pointOfSaleId) => {
    const state = get();

    const resolvedPointOfSaleId =
      pointOfSaleId ??
      (state.isAllPointOfSales ? undefined : state.selectedPointOfSale?.id);

    const scopeKey = getScopeKey(resolvedPointOfSaleId);

    set({
      isLoadingDetail: true,
      detailError: null,
      isOffline: false,
    });

    try {
      // ------------------------------------------------
      // CACHE
      // ------------------------------------------------

      const cacheKey = getCustomerDetailCacheKey(scopeKey, clientId);

      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const cache: CustomerDetailCache = JSON.parse(cachedData);

          set({
            selectedCustomer: cache.customer,
            detailPagination: cache.pagination,
            sync: cache.sync,
          });
        } catch {
          // Ignore corrupted cache.
        }
      }

      // ------------------------------------------------
      // REQUEST
      // ------------------------------------------------

      const params: Record<string, string | number> = {};

      if (resolvedPointOfSaleId) {
        params.pointOfSaleId = resolvedPointOfSaleId;
      }

      const response = await api.get(`/customer/${clientId}`, {
        params,
      });

      const data = response.data;

      if (!data?.success || !data.customer) {
        throw new Error(data?.message || "Client introuvable ou inaccessible.");
      }

      // ------------------------------------------------
      // COMPOSE DETAIL
      // ------------------------------------------------

      const customer: CustomerDetail = buildCustomerDetail(
        data.customer as Customer,
        data.statistics as CustomerStatistics | undefined,
        data.invoices as CustomerInvoice[] | undefined,
        data.loyaltyTransactions as CustomerLoyaltyTransaction[] | undefined,
      );

      const pagination: CustomerPagination =
        data.pagination ?? createDefaultPagination();

      const pointOfSale: CustomerPointOfSaleContext =
        data.pointOfSale ??
        createDefaultPointOfSaleContext(!resolvedPointOfSaleId);

      const sync: CustomerSync | null = data.sync ?? null;

      // ------------------------------------------------
      // SAVE CACHE
      // ------------------------------------------------

      const cache: CustomerDetailCache = {
        customer,
        pagination,
        pointOfSale,
        sync,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));

      // ------------------------------------------------
      // UPDATE STATE
      // ------------------------------------------------

      set({
        selectedCustomer: customer,
        detailPagination: pagination,
        sync,

        isAllPointOfSales: pointOfSale.isAll,
        isOffline: false,
        detailError: null,
      });

      return customer;
    } catch (error: any) {
      // ------------------------------------------------
      // OFFLINE FALLBACK
      // ------------------------------------------------

      const cacheKey = getCustomerDetailCacheKey(scopeKey, clientId);

      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const cache: CustomerDetailCache = JSON.parse(cachedData);

          set({
            selectedCustomer: cache.customer,
            detailPagination: cache.pagination,
            sync: cache.sync,

            isOffline: true,
            detailError: null,

            isAllPointOfSales: cache.pointOfSale.isAll,
          });

          return cache.customer;
        } catch {
          // Ignore corrupted cache.
        }
      }

      set({
        isOffline: true,
        detailError:
          error?.response?.data?.message ??
          error?.message ??
          "Impossible de récupérer le client.",
      });

      return null;
    } finally {
      set({
        isLoadingDetail: false,
      });
    }
  },

  // ====================================================
  // REFRESH CUSTOMER DETAIL
  // ====================================================

  refreshCustomer: async () => {
    const state = get();

    if (!state.selectedCustomer) {
      return;
    }

    set({
      isRefreshingDetail: true,
      detailError: null,
    });

    try {
      await get().getCustomer(
        state.selectedCustomer.id,
        state.isAllPointOfSales ? undefined : state.selectedPointOfSale?.id,
      );
    } finally {
      set({
        isRefreshingDetail: false,
      });
    }
  },

  // ====================================================
  // CLEAR CUSTOMERS
  // ====================================================

  clearCustomers: () => {
    set({
      customers: [],
      pagination: null,
      search: "",
      sync: null,
      error: null,
      isOffline: false,
    });
  },

  // ====================================================
  // CLEAR SELECTED CUSTOMER
  // ====================================================

  clearSelectedCustomer: () => {
    set({
      selectedCustomer: null,
      detailPagination: null,
      detailError: null,
    });
  },

  // ====================================================
  // CLEAR ERROR
  // ====================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ====================================================
  // CLEAR DETAIL ERROR
  // ====================================================

  clearDetailError: () => {
    set({
      detailError: null,
    });
  },

  // ====================================================
  // RESET
  // ====================================================

  reset: () => {
    set({
      customers: [],
      pagination: null,
      search: "",

      selectedPointOfSale: null,
      isAllPointOfSales: false,
      availablePointOfSales: [],

      selectedCustomer: null,
      detailPagination: null,

      sync: null,

      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      isLoadingDetail: false,
      isRefreshingDetail: false,

      isOffline: false,

      error: null,
      detailError: null,
    });
  },
}));
