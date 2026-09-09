export type ShopCurrency = "CDF" | "USD" | "EUR";

export interface Shop {
  id: string;
  singleton: string;
  name: string;
  logo: string | null;
  slogan: string | null;
  telephone: string;
  email: string | null;
  address: string;
  currency: ShopCurrency;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopResponse {
  success: boolean;
  message?: string;
  shop: Shop;
}

export interface UpdateShopPayload {
  name: string;
  slogan: string;
  telephone: string;
  email: string;
  address: string;
  currency: ShopCurrency;
}
