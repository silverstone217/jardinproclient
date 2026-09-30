import type { ShopPublicResponse } from "@/types/shop";
import { api } from "@/utils/api";

export const shopService = {
  async getPublicShop(): Promise<ShopPublicResponse> {
    const response = await api.get<ShopPublicResponse>("/shop/public");

    return response.data;
  },
};
