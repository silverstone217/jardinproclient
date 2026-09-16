import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { api } from "@/utils/api";
import type {
  CreateProductionPayload,
  Production,
  ProductionQuery,
  ProductionResponse,
  ProductionsResponse,
} from "@/types/production";

const STORAGE_KEY = "jardin-production-storage";

interface ProductionState {
  productions: Production[];
  selectedProduction: Production | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isLoadingDetail: boolean;

  error: string | null;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  initialize: () => Promise<void>;

  fetchProductions: (query?: ProductionQuery) => Promise<void>;

  refreshProductions: (query?: ProductionQuery) => Promise<void>;

  fetchProductionById: (id: string) => Promise<Production | null>;

  createProduction: (data: CreateProductionPayload) => Promise<Production>;

  clearError: () => void;

  clearSelectedProduction: () => void;
}

// ======================================================
// NORMALISATION
// ======================================================

function normalizeProduction(production: Production): Production {
  return {
    ...production,

    totalVolumeMl: Number(production.totalVolumeMl),

    ingredients:
      production.ingredients?.map((item) => ({
        ...item,
        quantityUsed: Number(item.quantityUsed),
      })) ?? [],

    packagings:
      production.packagings?.map((item) => ({
        ...item,

        quantityUsed: Number(item.quantityUsed),

        packaging: item.packaging
          ? {
              ...item.packaging,
              capacityMl: Number(item.packaging.capacityMl),
            }
          : item.packaging,
      })) ?? [],

    items:
      production.items?.map((item) => ({
        ...item,

        quantityProduced: Number(item.quantityProduced),

        remainingQuantity: Number(item.remainingQuantity),

        expiresAt: item.expiresAt,

        variant: item.variant
          ? {
              ...item.variant,

              price: Number(item.variant.price),

              shelfLifeDays: Number(item.variant.shelfLifeDays),

              packaging: item.variant.packaging
                ? {
                    ...item.variant.packaging,

                    capacityMl: Number(item.variant.packaging.capacityMl),
                  }
                : item.variant.packaging,
            }
          : item.variant,
      })) ?? [],
  };
}

// ======================================================
// NORMALISER LISTE
// ======================================================

function normalizeProductions(productions: Production[]): Production[] {
  return productions.map(normalizeProduction);
}

// ======================================================
// CACHE
// ======================================================

async function saveCache(productions: Production[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        productions,
      }),
    );
  } catch (error) {
    console.warn("Impossible de sauvegarder le cache des productions :", error);
  }
}

async function loadCache(): Promise<Production[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed?.productions)) {
      return [];
    }

    return normalizeProductions(parsed.productions);
  } catch (error) {
    console.warn("Impossible de charger le cache des productions :", error);

    return [];
  }
}

// ======================================================
// ERROR MESSAGE
// ======================================================

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    const message = axiosError.response?.data?.message;

    if (message) {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Impossible de récupérer les productions.";
}

// ======================================================
// STORE
// ======================================================

export const useProductionStore = create<ProductionState>((set, get) => ({
  productions: [],

  selectedProduction: null,

  isLoading: false,

  isRefreshing: false,

  isCreating: false,

  isLoadingDetail: false,

  error: null,

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  // ==================================================
  // INITIALIZE
  // ==================================================

  initialize: async () => {
    /*
     * 1. Charger le cache immédiatement.
     *
     * Le cache ne doit jamais empêcher
     * l'ouverture de l'écran.
     */
    const cached = await loadCache();

    if (cached.length > 0) {
      set({
        productions: cached,

        pagination: {
          page: 1,
          limit: 20,
          total: cached.length,
          totalPages: Math.max(1, Math.ceil(cached.length / 20)),
        },
      });
    }

    /*
     * 2. Synchronisation serveur.
     *
     * Cette erreur ne doit jamais empêcher
     * l'écran de s'afficher.
     */
    try {
      await get().fetchProductions();
    } catch (error) {
      console.warn("Synchronisation des productions échouée :", error);
    }
  },

  // ==================================================
  // FETCH
  // ==================================================

  fetchProductions: async (query = {}) => {
    const hasData = get().productions.length > 0;

    /*
     * On affiche le loader uniquement
     * lorsqu'il n'y a encore aucune donnée.
     *
     * Si le cache existe, pas de flash de loading.
     */
    set({
      isLoading: !hasData,
      error: null,
    });

    try {
      const params = new URLSearchParams();

      if (query.productId) {
        params.set("productId", query.productId);
      }

      if (query.pointOfSaleId) {
        params.set("pointOfSaleId", query.pointOfSaleId);
      }

      if (query.from) {
        params.set("from", query.from);
      }

      if (query.to) {
        params.set("to", query.to);
      }

      if (query.limit !== undefined) {
        params.set("limit", String(query.limit));
      }

      if (query.page !== undefined) {
        params.set("page", String(query.page));
      }

      const queryString = params.toString();

      const endpoint = queryString
        ? `/productions?${queryString}`
        : "/productions";

      console.log("[ProductionStore] GET", endpoint);

      const response = await api.get<ProductionsResponse>(endpoint);

      const data = response.data;

      console.log("[ProductionStore] Response:", data);

      if (!data || data.success !== true) {
        throw new Error(
          data?.message ?? "Impossible de récupérer les productions.",
        );
      }

      const serverProductions = normalizeProductions(
        Array.isArray(data.productions) ? data.productions : [],
      );

      const pagination = data.pagination ?? {
        page: query.page ?? 1,

        limit: query.limit ?? 20,

        total: serverProductions.length,

        totalPages:
          serverProductions.length > 0
            ? Math.ceil(serverProductions.length / (query.limit ?? 20))
            : 1,
      };

      /*
       * Le serveur devient la source
       * de vérité dès qu'il répond.
       */
      set({
        productions: serverProductions,

        pagination,

        isLoading: false,

        error: null,
      });

      /*
       * Le cache est mis à jour uniquement
       * avec les données réellement reçues
       * du serveur.
       */
      await saveCache(serverProductions);
    } catch (error) {
      console.error(
        "[ProductionStore] Erreur récupération productions :",
        error,
      );

      /*
       * IMPORTANT :
       * même si le serveur échoue,
       * le loader doit toujours disparaître.
       */
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });

      /*
       * On relance l'erreur afin que
       * refreshProductions / initialize
       * puissent éventuellement la gérer.
       *
       * Le composant ne doit cependant
       * jamais rester bloqué.
       */
      throw error;
    } finally {
      /*
       * Sécurité supplémentaire.
       *
       * Même si une erreur inattendue
       * survient pendant le traitement,
       * isLoading ne peut pas rester bloqué.
       */
      set({
        isLoading: false,
      });
    }
  },

  // ==================================================
  // REFRESH
  // ==================================================

  refreshProductions: async (query = {}) => {
    set({
      isRefreshing: true,
      error: null,
    });

    try {
      await get().fetchProductions(query);
    } catch (error) {
      console.warn("Actualisation des productions échouée :", error);
    } finally {
      set({
        isRefreshing: false,
        isLoading: false,
      });
    }
  },

  // ==================================================
  // DETAIL
  // ==================================================

  fetchProductionById: async (id) => {
    set({
      isLoadingDetail: true,
      error: null,
    });

    try {
      const response = await api.get<ProductionResponse>(`/productions/${id}`);

      const data = response.data;

      if (!data || data.success !== true || !data.production) {
        throw new Error(data?.message ?? "Production introuvable.");
      }

      const production = normalizeProduction(data.production);

      set({
        selectedProduction: production,

        isLoadingDetail: false,

        error: null,
      });

      return production;
    } catch (error) {
      console.error("Erreur récupération détail production :", error);

      set({
        isLoadingDetail: false,

        error: getErrorMessage(error),
      });

      return null;
    } finally {
      set({
        isLoadingDetail: false,
      });
    }
  },

  // ==================================================
  // CREATE
  // ==================================================

  createProduction: async (data) => {
    set({
      isCreating: true,
      error: null,
    });

    try {
      const response = await api.post<ProductionResponse>("/productions", data);

      const result = response.data;

      if (!result || result.success !== true || !result.production) {
        throw new Error(
          result?.message ?? "Impossible d'enregistrer la production.",
        );
      }

      const production = normalizeProduction(result.production);

      const current = get().productions;

      const exists = current.some((item) => item.id === production.id);

      const productions = exists
        ? current.map((item) => (item.id === production.id ? production : item))
        : [production, ...current];

      set({
        productions,

        selectedProduction: production,

        isCreating: false,

        error: null,
      });

      await saveCache(productions);

      return production;
    } catch (error) {
      console.error("Erreur création production :", error);

      set({
        isCreating: false,

        error: getErrorMessage(error),
      });

      throw error;
    } finally {
      set({
        isCreating: false,
      });
    }
  },

  // ==================================================
  // CLEAR ERROR
  // ==================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ==================================================
  // CLEAR DETAIL
  // ==================================================

  clearSelectedProduction: () => {
    set({
      selectedProduction: null,
    });
  },
}));
