export type PackagingSize = "ML_200" | "ML_500";

export interface Packaging {
  id: string;
  shopId: string;
  name: string;
  size: PackagingSize;
  capacityMl: number;
  stockQty: number;
  minAlert: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackagingPayload {
  name: string;
  size: PackagingSize;
  capacityMl: number;
  stockQty?: number;
  minAlert?: number;
  isActive?: boolean;
}

export interface UpdatePackagingPayload {
  name: string;
  size: PackagingSize;
  capacityMl: number;
  minAlert: number;
  isActive?: boolean;
}

export interface AdjustPackagingStockPayload {
  quantity: number;
  note?: string;
}

export interface PackagingResponse {
  success: boolean;
  message?: string;
  packaging?: Packaging;
}

export interface PackagingsResponse {
  success: boolean;
  message?: string;
  packagings?: Packaging[];
}

export interface DeletePackagingResponse {
  success: boolean;
  message?: string;
}
