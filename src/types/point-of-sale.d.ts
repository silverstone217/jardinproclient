export type PointOfSaleUserRole = "MANAGER" | "EMPLOYEE";

export interface PointOfSaleStaffUser {
  id: string;
  name: string;
  email: string | null;
  telephone: string;
  image: string | null;
  role: PointOfSaleUserRole;
  isActive: boolean;
}

export interface PointOfSaleStaffAssignment {
  id: string;
  isActive: boolean;
  createdAt: string;
  user: PointOfSaleStaffUser;
}

export interface PointOfSaleProduct {
  id: string;
  name: string;
}

export interface PointOfSalePackaging {
  id: string;
  name: string;
  size: string;
  capacityMl: number;
}

export interface PointOfSaleVariant {
  id: string;
  sku: string;
  price: number;
  product: PointOfSaleProduct;
  packaging: PointOfSalePackaging;
}

export interface PointOfSaleFinishedStock {
  id: string;
  quantity: number;
  updatedAt: string;
  variant: PointOfSaleVariant;
}

export interface PointOfSale {
  id: string;
  shopId: string;
  name: string;
  code: string;
  telephone: string | null;
  address: string | null;
  isMainStore: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  finishedStocks: PointOfSaleFinishedStock[];
  staffAssignments: PointOfSaleStaffAssignment[];

  finishedStockCount: number;
  salesCount: number;
  lossCount: number;
  productionCount: number;
}

export interface PointOfSaleFormData {
  name: string;
  code: string;
  telephone: string;
  address: string;
  isMainStore: boolean;
  isActive: boolean;
}

export interface CreatePointOfSalePayload {
  name: string;
  code: string;
  telephone?: string;
  address?: string;
  isMainStore?: boolean;
  isActive?: boolean;
}

export interface UpdatePointOfSalePayload {
  name: string;
  code: string;
  telephone?: string;
  address?: string;
  isMainStore?: boolean;
  isActive?: boolean;
}

export interface PointOfSaleResponse {
  success: boolean;
  message?: string;
  pointOfSale?: PointOfSale;
}

export interface PointOfSalesResponse {
  success: boolean;
  message?: string;
  pointOfSales?: PointOfSale[];
}
