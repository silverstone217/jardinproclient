export type DistributionLocationType = "MAIN" | "POS";

export interface DistributionLocation {
  type: DistributionLocationType;
  pointOfSaleId: string | null;
  name: string;
  code?: string;
}

export interface DistributionPointOfSale {
  id: string;
  name: string;
  code: string;
  isMainStore: boolean;
}

export interface DistributionProduct {
  variantId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  sku: string;
  price: number;
  packagingId: string;
  packagingName: string;
  packagingSize: "ML_200" | "ML_500";
  capacityMl: number;
  quantity: number;
  shelfLifeDays: number;
  isActive: boolean;
}

export interface DistributionSelectedProduct {
  variantId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  sku: string;
  packagingId: string;
  packagingName: string;
  packagingSize: "ML_200" | "ML_500";
  capacityMl: number;
  availableQuantity: number;
  quantity: number;
}

export interface DistributionItem {
  variantId: string;
  quantity: number;
}

export interface CreateDistributionInput {
  fromPosId: string | null;
  toPosId: string | null;
  items: DistributionItem[];
}

export interface Distribution {
  id: string;
  fromPosId: string | null;
  toPosId: string | null;
  transferredAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  fromPos: DistributionPointOfSale | null;
  toPos: DistributionPointOfSale | null;
  items: DistributionItemResult[];
}

export interface DistributionItemResult {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    product: {
      id: string;
      name: string;
    };
    packaging: {
      id: string;
      name: string;
      size: "ML_200" | "ML_500";
      capacityMl: number;
    };
  };
}

export interface DistributionLocationsResponse {
  locations: DistributionPointOfSale[];
}

export interface DistributionProductsResponse {
  location: DistributionLocation;
  products: DistributionProduct[];
}

export interface CreateDistributionResponse {
  distribution: Distribution;
}

export interface DistributionFilters {
  search: string;
}
