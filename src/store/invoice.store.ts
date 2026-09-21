import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import { api } from "@/utils/api";

import type { Invoice, InvoiceFilters } from "@/types/invoice";

// ======================================================
// CONSTANTES
// ======================================================

const STORAGE_KEY = "jardin-invoices-storage";

// ======================================================
// TYPES
// ======================================================

interface InvoicesResponse {
  invoices: Invoice[];
}

interface InvoiceResponse {
  invoice: Invoice;
}

interface InvoiceState {
  invoices: Invoice[];
  filters: InvoiceFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  isInitialized: boolean;
  isOffline: boolean;

  error: string | null;

  initialize: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
  fetchInvoiceById: (id: string) => Promise<Invoice | null>;
  setFilters: (filters: InvoiceFilters) => void;
  updateFilters: (filters: Partial<InvoiceFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
  reset: () => Promise<void>;
}

// ======================================================
// NORMALISATION
// ======================================================

const normalizeInvoiceItem = (
  item: Invoice["items"][number],
): Invoice["items"][number] => ({
  ...item,

  quantity: Number(item.quantity),
  unitPrice: Number(item.unitPrice),
  subtotal: Number(item.subtotal),
});

const normalizeInvoice = (invoice: Invoice): Invoice => ({
  ...invoice,

  subtotal: Number(invoice.subtotal),
  discountAmount: Number(invoice.discountAmount),
  totalAmount: Number(invoice.totalAmount),

  loyalty: {
    pointsEarned: Number(invoice.loyalty.pointsEarned),
    pointsUsed: Number(invoice.loyalty.pointsUsed),
  },

  items: Array.isArray(invoice.items)
    ? invoice.items.map(normalizeInvoiceItem)
    : [],
});

const normalizeInvoices = (invoices: Invoice[]): Invoice[] =>
  invoices.map(normalizeInvoice);

// ======================================================
// CACHE
// ======================================================

const saveCache = async (invoices: Invoice[]) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        invoices,
      }),
    );
  } catch (error) {
    console.error("Erreur sauvegarde cache factures :", error);
  }
};

const loadCache = async (): Promise<Invoice[]> => {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed = JSON.parse(storage);

    if (!Array.isArray(parsed?.invoices)) {
      return [];
    }

    return normalizeInvoices(parsed.invoices);
  } catch (error) {
    console.error("Erreur lecture cache factures :", error);

    return [];
  }
};

// ======================================================
// HELPERS
// ======================================================

const replaceInvoice = (invoices: Invoice[], invoice: Invoice): Invoice[] => {
  const normalizedInvoice = normalizeInvoice(invoice);

  const index = invoices.findIndex((item) => item.id === normalizedInvoice.id);

  if (index === -1) {
    return [normalizedInvoice, ...invoices];
  }

  const next = [...invoices];

  next[index] = normalizedInvoice;

  return next;
};

const buildQueryParams = (filters: InvoiceFilters): Record<string, string> => {
  const params: Record<string, string> = {};

  if (filters.minAmount !== undefined) {
    params.minAmount = String(filters.minAmount);
  }

  if (filters.maxAmount !== undefined) {
    params.maxAmount = String(filters.maxAmount);
  }

  if (filters.period) {
    params.period = filters.period;
  }

  if (filters.date) {
    params.date = filters.date;
  }

  if (filters.customerPhone?.trim()) {
    params.customerPhone = filters.customerPhone.trim();
  }

  return params;
};

// ======================================================
// STORE
// ======================================================

export const useInvoiceStore = create<InvoiceState>()((set, get) => ({
  invoices: [],

  filters: {},

  isLoading: false,
  isRefreshing: false,
  isInitialized: false,
  isOffline: false,

  error: null,

  // ==================================================
  // INITIALISATION
  // ==================================================

  initialize: async () => {
    if (get().isInitialized) {
      return;
    }

    set({
      isLoading: true,
      error: null,
    });

    try {
      // ------------------------------------------------
      // 1. CACHE IMMÉDIAT
      // ------------------------------------------------

      const cachedInvoices = await loadCache();

      if (cachedInvoices.length > 0) {
        set({
          invoices: cachedInvoices,
        });
      }

      // ------------------------------------------------
      // 2. SYNCHRONISATION SERVEUR
      // ------------------------------------------------

      try {
        const response = await api.get<InvoicesResponse>("/invoices");

        const result = response.data;

        if (!result || !Array.isArray(result.invoices)) {
          throw new Error("Impossible de récupérer les factures.");
        }

        const invoices = normalizeInvoices(result.invoices);

        set({
          invoices,
          isOffline: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        await saveCache(invoices);
      } catch (error) {
        console.warn(
          "Serveur indisponible, utilisation du cache factures.",
          error,
        );

        set({
          isOffline: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Erreur initialisation factures :", error);

      set({
        isInitialized: true,
        isLoading: false,
        isOffline: true,
        error: "Impossible de charger les factures.",
      });
    }
  },

  // ==================================================
  // FETCH
  // ==================================================

  fetchInvoices: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const params = buildQueryParams(get().filters);

      const response = await api.get<InvoicesResponse>("/invoices", {
        params,
      });

      const result = response.data;

      if (!result || !Array.isArray(result.invoices)) {
        throw new Error("Impossible de récupérer les factures.");
      }

      const invoices = normalizeInvoices(result.invoices);

      set({
        invoices,
        isLoading: false,
        isOffline: false,
        isInitialized: true,
        error: null,
      });

      await saveCache(invoices);
    } catch (error) {
      console.warn("Impossible de synchroniser les factures.", error);

      const cachedInvoices = await loadCache();

      if (cachedInvoices.length > 0) {
        set({
          invoices: cachedInvoices,
          isLoading: false,
          isOffline: true,
          isInitialized: true,
          error: null,
        });

        return;
      }

      set({
        isLoading: false,
        isOffline: true,
        isInitialized: true,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de charger les factures.",
      });

      throw error;
    }
  },

  // ==================================================
  // REFRESH
  // ==================================================

  refreshInvoices: async () => {
    if (get().isRefreshing) {
      return;
    }

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const params = buildQueryParams(get().filters);

      const response = await api.get<InvoicesResponse>("/invoices", {
        params,
      });

      const result = response.data;

      if (!result || !Array.isArray(result.invoices)) {
        throw new Error("Impossible d'actualiser les factures.");
      }

      const invoices = normalizeInvoices(result.invoices);

      set({
        invoices,
        isRefreshing: false,
        isOffline: false,
        isInitialized: true,
        error: null,
      });

      await saveCache(invoices);
    } catch (error) {
      console.warn("Actualisation factures impossible.", error);

      set({
        isRefreshing: false,
        isOffline: true,
        error: null,
      });
    }
  },

  // ==================================================
  // GET BY ID — CACHE
  // ==================================================

  getInvoiceById: (id) => get().invoices.find((invoice) => invoice.id === id),

  // ==================================================
  // GET BY ID — SERVEUR + OFFLINE FALLBACK
  // ==================================================

  fetchInvoiceById: async (id) => {
    const cachedInvoice = get().getInvoiceById(id);

    try {
      const response = await api.get<InvoiceResponse>(`/invoices/${id}`);

      const result = response.data;

      if (!result?.invoice) {
        throw new Error("Facture introuvable.");
      }

      const invoice = normalizeInvoice(result.invoice);

      const invoices = replaceInvoice(get().invoices, invoice);

      set({
        invoices,
        isOffline: false,
        error: null,
      });

      await saveCache(invoices);

      return invoice;
    } catch (error) {
      console.warn("Impossible de récupérer la facture.", error);

      // ----------------------------------------------
      // FALLBACK OFFLINE
      // ----------------------------------------------

      if (cachedInvoice) {
        set({
          isOffline: true,
          error: null,
        });

        return cachedInvoice;
      }

      set({
        isOffline: true,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de récupérer la facture.",
      });

      return null;
    }
  },

  // ==================================================
  // FILTERS
  // ==================================================

  setFilters: (filters) => {
    set({
      filters,
    });
  },

  updateFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  clearFilters: () => {
    set({
      filters: {},
    });
  },

  // ==================================================
  // ERROR
  // ==================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ==================================================
  // RESET
  // ==================================================

  reset: async () => {
    set({
      invoices: [],
      filters: {},

      isLoading: false,
      isRefreshing: false,
      isInitialized: false,
      isOffline: false,

      error: null,
    });

    await AsyncStorage.removeItem(STORAGE_KEY);
  },
}));
