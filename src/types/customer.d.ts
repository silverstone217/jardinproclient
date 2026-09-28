export interface CustomerPointOfSale {
  id: string;
  name: string;
  code: string;
  isMainStore: boolean;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string | null;
  phone: string;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;

  /**
   * POS dans lequel ce client est consulté.
   *
   * Les statistiques et l'historique associés
   * à ce Customer sont limités à ce POS.
   */
  pointOfSale: CustomerPointOfSale;

  totalSpent: number;
  purchaseCount: number;
  lastPurchaseAt: string | null;
}

export interface CustomerStatistics {
  totalSpent: number;
  purchaseCount: number;
  averagePurchaseAmount: number;
  totalPointsEarned: number;
  totalPointsUsed: number;
  lastPurchaseAt: string | null;
}

export interface CustomerSaleItem {
  id: string;

  variantId: string;

  productName: string;
  sku: string;

  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerSale {
  id: string;

  receiptNumber: string;

  pointOfSale: CustomerPointOfSale;

  subtotal: number;
  discountAmount: number;
  totalAmount: number;

  pointsEarned: number;
  pointsUsed: number;

  paymentMethod: string;

  createdAt: string;

  items: CustomerSaleItem[];
}

export interface CustomerLoyaltyTransaction {
  id: string;

  type: string;

  points: number;
  balanceAfter: number;
  reason: string | null;

  saleId: string | null;

  createdAt: string;
}

export interface CustomerDetail extends Customer {
  statistics: CustomerStatistics;

  sales: CustomerSale[];

  loyaltyTransactions: CustomerLoyaltyTransaction[];
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerSync {
  serverTime: string;
  generatedAt: string;
  updatedSince: string | null;
}

export interface CustomersResponse {
  success: boolean;
  message?: string;

  customers?: Customer[];

  pagination?: CustomerPagination;
  sync?: CustomerSync;
}

export interface CustomerResponse {
  success: boolean;
  message?: string;

  customer?: CustomerDetail;

  statistics?: CustomerStatistics;
  sales?: CustomerSale[];
  loyaltyTransactions?: CustomerLoyaltyTransaction[];

  pagination?: CustomerPagination;
  sync?: CustomerSync;
}
