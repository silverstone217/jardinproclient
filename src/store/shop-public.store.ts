import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { shopService } from "@/services/shop.service";
import type { ShopPublic } from "@/types/shop";

const STORAGE_KEY = "jardin-shop-public-storage";

interface ShopPublicState {
  shop: ShopPublic | null;

  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  fetchShop: () => Promise<void>;
  refreshShop: () => Promise<void>;
  clearError: () => void;
  reset: () => Promise<void>;
}

export const useShopPublicStore = create<ShopPublicState>((set, get) => ({
  shop: null,

  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchShop: async () => {
    if (get().isLoading) return;

    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await shopService.getPublicShop();

      set({
        shop: response.shop,
        isLoading: false,
        error: null,
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(response.shop));
    } catch (error) {
      console.error("fetchShopPublic:", error);

      set({
        isLoading: false,
        error: "Impossible de récupérer les informations de la boutique",
      });
    }
  },

  refreshShop: async () => {
    if (get().isRefreshing) return;

    set({
      isRefreshing: true,
      error: null,
    });

    try {
      const response = await shopService.getPublicShop();

      set({
        shop: response.shop,
        isRefreshing: false,
        error: null,
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(response.shop));
    } catch (error) {
      console.error("refreshShopPublic:", error);

      set({
        isRefreshing: false,
        error: "Impossible d'actualiser les informations de la boutique",
      });
    }
  },

  clearError: () => {
    set({
      error: null,
    });
  },

  reset: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);

    set({
      shop: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });
  },
}));
