import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { api } from "@/utils/api";

import type {
  Shop,
  ShopCurrency,
  ShopResponse,
  UpdateShopPayload,
} from "@/types/shop";

interface ShopDraft {
  name: string;
  slogan: string;
  telephone: string;
  email: string;
  address: string;
  currency: ShopCurrency;
}

interface ShopState {
  shop: Shop | null;
  draft: ShopDraft | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;

  error: string | null;

  fetchShop: () => Promise<void>;
  refreshShop: () => Promise<void>;

  updateDraft: <K extends keyof ShopDraft>(
    field: K,
    value: ShopDraft[K],
  ) => void;

  resetDraft: () => void;

  saveShop: () => Promise<void>;

  updateShopLogo: (imageUri: string) => Promise<void>;
  removeShopLogo: () => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

const createDraftFromShop = (shop: Shop): ShopDraft => ({
  name: shop.name,
  slogan: shop.slogan ?? "",
  telephone: shop.telephone,
  email: shop.email ?? "",
  address: shop.address,
  currency: shop.currency,
});

const getErrorMessage = (error: unknown, fallback: string): string => {
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

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      shop: null,
      draft: null,

      isLoading: false,
      isRefreshing: false,
      isSaving: false,
      isUploadingImage: false,

      error: null,

      // ========================================================
      // GET SHOP
      // ========================================================

      fetchShop: async () => {
        try {
          set({
            isLoading: true,
            error: null,
          });

          const response = await api.get<ShopResponse>("/shop");

          const shop = response.data.shop;

          set({
            shop,
            draft: createDraftFromShop(shop),
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(
            error,
            "Impossible de récupérer les informations de la boutique.",
          );

          set({
            isLoading: false,
            error: message,
          });

          throw error;
        }
      },

      // ========================================================
      // REFRESH
      // ========================================================

      refreshShop: async () => {
        try {
          set({
            isRefreshing: true,
            error: null,
          });

          const response = await api.get<ShopResponse>("/shop");

          const shop = response.data.shop;

          set({
            shop,
            draft: createDraftFromShop(shop),
            isRefreshing: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(
            error,
            "Impossible d’actualiser la boutique.",
          );

          set({
            isRefreshing: false,
            error: message,
          });

          throw error;
        }
      },

      // ========================================================
      // LOCAL DRAFT
      // ========================================================

      updateDraft: (field, value) => {
        const currentDraft = get().draft;

        if (!currentDraft) {
          return;
        }

        set({
          draft: {
            ...currentDraft,
            [field]: value,
          },
        });
      },

      // ========================================================
      // RESET DRAFT
      // ========================================================

      resetDraft: () => {
        const shop = get().shop;

        if (!shop) {
          return;
        }

        set({
          draft: createDraftFromShop(shop),
        });
      },

      // ========================================================
      // SAVE
      // ========================================================

      saveShop: async () => {
        const draft = get().draft;

        if (!draft) {
          return;
        }

        try {
          set({
            isSaving: true,
            error: null,
          });

          const payload: UpdateShopPayload = {
            name: draft.name.trim(),
            slogan: draft.slogan.trim(),
            telephone: draft.telephone.trim(),
            email: draft.email.trim(),
            address: draft.address.trim(),
            currency: draft.currency,
          };

          const response = await api.patch<ShopResponse>("/shop", payload);

          const shop = response.data.shop;

          set({
            shop,
            draft: createDraftFromShop(shop),
            isSaving: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(
            error,
            "Impossible de modifier les informations de la boutique.",
          );

          set({
            isSaving: false,
            error: message,
          });

          throw error;
        }
      },

      // ========================================================
      // LOGO
      // ========================================================

      updateShopLogo: async (imageUri) => {
        try {
          set({
            isUploadingImage: true,
            error: null,
          });

          const formData = new FormData();

          formData.append("image", {
            uri: imageUri,
            name: `shop-logo-${Date.now()}.jpg`,
            type: "image/jpeg",
          } as any);

          const response = await api.post<ShopResponse>(
            "/shop/image",
            formData,
          );

          const shop = response.data.shop;

          set({
            shop,
            draft: createDraftFromShop(shop),
            isUploadingImage: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(
            error,
            "Impossible de modifier le logo de la boutique.",
          );

          set({
            isUploadingImage: false,
            error: message,
          });

          throw error;
        }
      },

      // ========================================================
      // REMOVE LOGO
      // ========================================================

      removeShopLogo: async () => {
        try {
          set({
            isUploadingImage: true,
            error: null,
          });

          const response = await api.delete<ShopResponse>("/shop/image");

          const shop = response.data.shop;

          set({
            shop,
            draft: createDraftFromShop(shop),
            isUploadingImage: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(
            error,
            "Impossible de supprimer le logo de la boutique.",
          );

          set({
            isUploadingImage: false,
            error: message,
          });

          throw error;
        }
      },

      // ========================================================
      // HELPERS
      // ========================================================

      clearError: () => {
        set({
          error: null,
        });
      },

      reset: () => {
        set({
          shop: null,
          draft: null,
          isLoading: false,
          isRefreshing: false,
          isSaving: false,
          isUploadingImage: false,
          error: null,
        });
      },
    }),
    {
      name: "jardin-shop-storage",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        shop: state.shop,
        draft: state.draft,
      }),
    },
  ),
);
