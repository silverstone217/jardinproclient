import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { api } from "@/utils/api";

import type {
  CreateProductPayload,
  DeleteProductResponse,
  Product,
  ProductResponse,
  ProductsResponse,
  UpdateProductPayload,
} from "@/types/product";

const STORAGE_KEY = "jardin-products-storage";

interface ProductState {
  products: Product[];

  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isUploadingImage: boolean;
  isDeleting: boolean;

  isInitialized: boolean;
  isOffline: boolean;

  error: string | null;

  initialize: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;

  getProductById: (id: string) => Product | undefined;

  createProduct: (data: CreateProductPayload) => Promise<Product>;

  updateProduct: (id: string, data: UpdateProductPayload) => Promise<Product>;

  updateProductImage: (id: string, imageUri: string) => Promise<Product>;

  removeProductImage: (id: string) => Promise<Product>;

  deleteProduct: (id: string) => Promise<{
    product: Product;
    deactivated: boolean;
  }>;

  clearError: () => void;
  reset: () => Promise<void>;
}

// ======================================================
// NORMALISATION
// ======================================================

const normalizeVariant = (
  variant: Product["variants"][number],
): Product["variants"][number] => ({
  ...variant,

  price: Number(variant.price),

  shelfLifeDays: Number(variant.shelfLifeDays),
});
const normalizeRecipe = (recipe: Product["recipe"]): Product["recipe"] => {
  if (!recipe) {
    return null;
  }

  return {
    ...recipe,

    productionVolumeMl: Number(recipe.productionVolumeMl),

    items: Array.isArray(recipe.items)
      ? recipe.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
        }))
      : [],
  };
};
const normalizeProduct = (product: Product): Product => ({
  ...product,

  recipe: normalizeRecipe(product.recipe),

  variants: Array.isArray(product.variants)
    ? product.variants.map(normalizeVariant)
    : [],
});
const normalizeProducts = (products: Product[]): Product[] =>
  products.map(normalizeProduct);

// ======================================================
// CACHE
// ======================================================

const saveCache = async (products: Product[]) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        products,
      }),
    );
  } catch (error) {
    console.error("Erreur sauvegarde cache produits :", error);
  }
};
const loadCache = async (): Promise<Product[]> => {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed = JSON.parse(storage);

    if (!Array.isArray(parsed?.products)) {
      return [];
    }

    return normalizeProducts(parsed.products);
  } catch (error) {
    console.error("Erreur lecture cache produits :", error);

    return [];
  }
};

// ======================================================
// HELPERS
// ======================================================

const replaceProduct = (products: Product[], product: Product): Product[] => {
  const normalizedProduct = normalizeProduct(product);

  const index = products.findIndex((item) => item.id === normalizedProduct.id);

  if (index === -1) {
    return [...products, normalizedProduct];
  }

  const next = [...products];

  next[index] = normalizedProduct;

  return next;
};

// ======================================================
// STORE
// ======================================================

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],

  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  isUpdating: false,
  isUploadingImage: false,
  isDeleting: false,

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

      const cachedProducts = await loadCache();

      if (cachedProducts.length > 0) {
        set({
          products: cachedProducts,
        });
      }

      // ------------------------------------------------
      // 2. SYNCHRONISATION SERVEUR
      // ------------------------------------------------

      try {
        const response = await api.get<ProductsResponse>("/products");

        const result = response.data;

        if (!result.success || !result.data) {
          throw new Error(
            result.message || "Impossible de récupérer les produits.",
          );
        }

        const products = normalizeProducts(result.data.products);

        set({
          products,

          isOffline: false,
          isInitialized: true,
          isLoading: false,

          error: null,
        });

        await saveCache(products);
      } catch (error) {
        console.warn(
          "Serveur indisponible, utilisation du cache produits.",
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
      console.error("Erreur initialisation produits :", error);

      set({
        isInitialized: true,
        isLoading: false,
        isOffline: true,
        error: "Impossible de charger les produits.",
      });
    }
  },

  // ==================================================
  // FETCH
  // ==================================================

  fetchProducts: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const response = await api.get<ProductsResponse>("/products");

      const result = response.data;

      if (!result.success || !result.data) {
        throw new Error(
          result.message || "Impossible de récupérer les produits.",
        );
      }

      const products = normalizeProducts(result.data.products);

      set({
        products,

        isLoading: false,
        isOffline: false,
        isInitialized: true,

        error: null,
      });

      await saveCache(products);
    } catch (error) {
      console.warn("Impossible de synchroniser les produits.", error);

      const cachedProducts = await loadCache();

      if (cachedProducts.length > 0) {
        set({
          products: cachedProducts,

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
            : "Impossible de charger les produits.",
      });

      throw error;
    }
  },

  // ==================================================
  // REFRESH
  // ==================================================

  refreshProducts: async () => {
    if (get().isRefreshing) {
      return;
    }

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const response = await api.get<ProductsResponse>("/products");

      const result = response.data;

      if (!result.success || !result.data) {
        throw new Error(
          result.message || "Impossible d'actualiser les produits.",
        );
      }

      const products = normalizeProducts(result.data.products);

      set({
        products,

        isRefreshing: false,
        isOffline: false,
        isInitialized: true,

        error: null,
      });

      await saveCache(products);
    } catch (error) {
      console.warn("Actualisation produits impossible.", error);

      set({
        isRefreshing: false,
        isOffline: true,
        error: null,
      });
    }
  },

  // ==================================================
  // GET BY ID
  // ==================================================

  getProductById: (id) => get().products.find((product) => product.id === id),

  // ==================================================
  // CREATE
  // ==================================================

  createProduct: async (data) => {
    if (get().isCreating) {
      throw new Error("CREATE_ALREADY_IN_PROGRESS");
    }

    set({
      isCreating: true,
      error: null,
    });

    try {
      const response = await api.post<ProductResponse>("/products", data);

      const result = response.data;

      if (!result.success || !result.data?.product) {
        throw new Error(result.message || "Impossible de créer le produit.");
      }

      const product = normalizeProduct(result.data.product);

      const products = replaceProduct(get().products, product);

      set({
        products,

        isCreating: false,
        isOffline: false,

        error: null,
      });

      await saveCache(products);

      return product;
    } catch (error) {
      console.error("Erreur création produit :", error);

      set({
        isCreating: false,

        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer le produit.",
      });

      throw error;
    }
  },

  // ==================================================
  // UPDATE
  // ==================================================

  updateProduct: async (id, data) => {
    if (get().isUpdating) {
      throw new Error("UPDATE_ALREADY_IN_PROGRESS");
    }

    set({
      isUpdating: true,
      error: null,
    });

    try {
      const response = await api.patch<ProductResponse>(
        `/products/${id}`,
        data,
      );

      const result = response.data;

      if (!result.success || !result.data?.product) {
        throw new Error(result.message || "Impossible de modifier le produit.");
      }

      const product = normalizeProduct(result.data.product);

      const products = replaceProduct(get().products, product);

      set({
        products,

        isUpdating: false,
        isOffline: false,

        error: null,
      });

      await saveCache(products);

      return product;
    } catch (error) {
      console.error("Erreur modification produit :", error);

      set({
        isUpdating: false,

        error:
          error instanceof Error
            ? error.message
            : "Impossible de modifier le produit.",
      });

      throw error;
    }
  },

  // ==================================================
  // UPLOAD IMAGE
  // ==================================================

  updateProductImage: async (id, imageUri) => {
    if (get().isUploadingImage) {
      throw new Error("IMAGE_UPLOAD_ALREADY_IN_PROGRESS");
    }

    set({
      isUploadingImage: true,
      error: null,
    });

    try {
      const formData = new FormData();

      formData.append("image", {
        uri: imageUri,
        name: `product-${id}-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      const response = await api.post<ProductResponse>(
        `/products/${id}/image`,
        formData,
      );

      const result = response.data;

      if (!result.success || !result.data?.product) {
        throw new Error(
          result.message || "Impossible de modifier l'image du produit.",
        );
      }

      const product = normalizeProduct(result.data.product);

      const products = replaceProduct(get().products, product);

      set({
        products,

        isUploadingImage: false,
        isOffline: false,

        error: null,
      });

      await saveCache(products);

      return product;
    } catch (error) {
      console.error("Erreur upload image produit :", error);

      set({
        isUploadingImage: false,

        error:
          error instanceof Error
            ? error.message
            : "Impossible de modifier l'image du produit.",
      });

      throw error;
    }
  },

  // ==================================================
  // REMOVE IMAGE
  // ==================================================

  removeProductImage: async (id) => {
    if (get().isUploadingImage) {
      throw new Error("IMAGE_OPERATION_ALREADY_IN_PROGRESS");
    }

    set({
      isUploadingImage: true,
      error: null,
    });

    try {
      const response = await api.delete<ProductResponse>(
        `/products/${id}/image`,
      );

      const result = response.data;

      if (!result.success || !result.data?.product) {
        throw new Error(
          result.message || "Impossible de supprimer l'image du produit.",
        );
      }

      const product = normalizeProduct(result.data.product);

      const products = replaceProduct(get().products, product);

      set({
        products,

        isUploadingImage: false,
        isOffline: false,

        error: null,
      });

      await saveCache(products);

      return product;
    } catch (error) {
      console.error("Erreur suppression image produit :", error);

      set({
        isUploadingImage: false,

        error:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer l'image du produit.",
      });

      throw error;
    }
  },

  // ==================================================
  // DELETE
  // ==================================================

  deleteProduct: async (id) => {
    if (get().isDeleting) {
      throw new Error("DELETE_ALREADY_IN_PROGRESS");
    }

    set({
      isDeleting: true,
      error: null,
    });

    try {
      const response = await api.delete<DeleteProductResponse>(
        `/products/${id}`,
      );

      const result = response.data;

      if (!result.success || !result.data?.product) {
        throw new Error(
          result.message || "Impossible de supprimer le produit.",
        );
      }

      const product = normalizeProduct(result.data.product);

      let products = get().products;

      if (result.data.deactivated) {
        products = replaceProduct(products, product);
      } else {
        products = products.filter((item) => item.id !== id);
      }

      set({
        products,

        isDeleting: false,
        isOffline: false,

        error: null,
      });

      await saveCache(products);

      return {
        product,
        deactivated: result.data.deactivated,
      };
    } catch (error) {
      console.error("Erreur suppression produit :", error);

      set({
        isDeleting: false,

        error:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le produit.",
      });

      throw error;
    }
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
      products: [],

      isLoading: false,
      isRefreshing: false,
      isCreating: false,
      isUpdating: false,
      isUploadingImage: false,
      isDeleting: false,

      isInitialized: false,
      isOffline: false,

      error: null,
    });

    await AsyncStorage.removeItem(STORAGE_KEY);
  },
}));
