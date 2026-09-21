export type OrderStep = "PRODUCTS" | "CUSTOMER" | "LOYALTY" | "PREVIEW";

// ============================================================
// PAIEMENT
// ============================================================

export type OrderPaymentMethod = "CASH" | "MOBILE_MONEY" | "CARD" | "OTHER";

// ============================================================
// FORMAT BOUTEILLE
// ============================================================

export type BottleSize = "ML_200" | "ML_500";

// ============================================================
// POS
// ============================================================

export interface OrderPointOfSale {
  id: string;
  name: string;
  code: string;
  telephone: string | null;
  address: string | null;
  isMainStore: boolean;
  isAssigned: boolean;
  canSelect: boolean;
}

export interface GetOrderPosResponse {
  pointOfSales: OrderPointOfSale[];
}

// ============================================================
// PRODUIT / PACKAGING
// ============================================================

export interface OrderProductPackaging {
  id: string;
  name: string;
  size: BottleSize;
  capacityMl: number;
}

// ============================================================
// PRODUIT DISPONIBLE À LA VENTE
// ============================================================

export interface OrderProduct {
  variantId: string;
  productId: string;

  name: string;
  description: string | null;
  image: string | null;

  sku: string;
  price: number;

  // Stock disponible au POS
  quantity: number;

  packaging: OrderProductPackaging;
}

// ============================================================
// RÉPONSE PRODUCTS
// ============================================================

export interface GetOrderProductsResponse {
  pointOfSale: {
    id: string;
    name: string;
    code: string;
    telephone: string | null;
    address: string | null;
    isMainStore: boolean;
  };

  products: OrderProduct[];
}

// ============================================================
// ASSIGNATION POS
// ============================================================

export interface AssignOrderPosPayload {
  pointOfSaleId: string;
}

// Cette réponse doit rester alignée sur la route réelle.
// À utiliser uniquement si la route /pos retourne bien ces données.
export interface AssignOrderPosResponse {
  message?: string;

  assignment?: {
    id: string;
    userId: string;
    shopId: string;
    pointOfSaleId: string;
    isActive: boolean;
  };

  pointOfSale?: {
    id: string;
    name: string;
    code: string;
    telephone: string | null;
    address: string | null;
    isMainStore: boolean;
  };
}

// ============================================================
// PANIER
// ============================================================

export interface OrderCartItem {
  variantId: string;
  productId: string;

  name: string;
  image: string | null;
  sku: string;

  unitPrice: number;

  quantity: number;

  // Stock connu au moment de la sélection.
  // Il peut devenir obsolète : le serveur reste
  // l'autorité lors de la validation finale.
  availableQuantity: number;

  packaging: OrderProductPackaging;
}

// ============================================================
// CLIENT
// ============================================================

export interface OrderCustomer {
  id: string;
  name: string | null;
  phone: string;
  loyaltyPoints: number;
}

// ============================================================
// CUSTOMER / SEARCH
// ============================================================

export interface SearchOrderCustomerResponse {
  customer: OrderCustomer;
}

// ============================================================
// CUSTOMER / CREATE
// ============================================================

export interface CreateOrderCustomerPayload {
  name: string;
  phone: string;
}

export interface CreateOrderCustomerResponse {
  customer: OrderCustomer;
}

// ============================================================
// FIDÉLITÉ
// ============================================================

export interface OrderLoyaltyCustomer {
  id: string;
  name: string | null;
  phone: string;
  currentPoints: number;
}

export interface OrderLoyaltyOrder {
  subtotal: number;
}

export interface OrderLoyaltyEarning {
  purchaseAmount: number;
  points: number;
  pointsEarned: number;
}

export interface OrderLoyaltyRedemption {
  pointsRequired: number;
  discountAmount: number;
  availablePoints: number;
  usablePoints: number;
  maxPointsUsable: number;
  maxDiscountAmount: number;
}

export interface OrderLoyaltyBalance {
  pointsAfterPurchase: number;
}

export interface GetOrderLoyaltyResponse {
  customer: OrderLoyaltyCustomer;
  order: OrderLoyaltyOrder;
  earning: OrderLoyaltyEarning;
  redemption: OrderLoyaltyRedemption;
  balance: OrderLoyaltyBalance;
}

// ============================================================
// COMMANDE LOCALE / DRAFT
// ============================================================

export interface ActiveOrder {
  version: 1;

  pointOfSaleId: string;

  items: OrderCartItem[];

  customer: OrderCustomer | null;

  loyalty: GetOrderLoyaltyResponse | null;

  pointsUsed: number;

  paymentMethod: OrderPaymentMethod;

  // Sert uniquement à reprendre la commande.
  currentStep: OrderStep;
}

// ============================================================
// VALIDATION COMMANDE
// ============================================================

export interface ValidateOrderItem {
  variantId: string;
  quantity: number;
}

export interface ValidateOrderPayload {
  pointOfSaleId: string;

  items: ValidateOrderItem[];

  customer?: {
    id?: string;
    name?: string;
    phone: string;
  };

  pointsUsed: number;

  paymentMethod: OrderPaymentMethod;
}

// ============================================================
// RÉSULTAT SALE
// ============================================================

export interface ValidateOrderSale {
  id: string;
  receiptNumber: string;

  pointOfSaleId: string;
  sellerId: string;
  customerId: string | null;

  subtotal: number;
  discountAmount: number;
  totalAmount: number;

  pointsEarned: number;
  pointsUsed: number;

  paymentMethod: OrderPaymentMethod;

  createdAt: string;
}

// ============================================================
// RÉSULTAT INVOICE ITEM
// ============================================================

export interface ValidateOrderInvoiceItem {
  id: string;

  productName: string;

  size: BottleSize;

  quantity: number;

  unitPrice: number;

  subtotal: number;

  currency: string;
}

// ============================================================
// RÉSULTAT INVOICE
// ============================================================

export interface ValidateOrderInvoice {
  id: string;

  invoiceNumber: string;

  status: string;

  currency: string;

  // Snapshot boutique
  shopName: string;

  // Snapshot POS
  pointOfSaleName: string;
  pointOfSaleAddress: string | null;
  pointOfSaleTelephone: string | null;

  // Snapshot vendeur
  sellerName: string;

  // Montants
  subtotal: number;
  discountAmount: number;
  totalAmount: number;

  // Client
  customerName: string | null;
  customerPhone: string | null;

  // Date
  createdAt: string;

  // Articles
  items: ValidateOrderInvoiceItem[];
}

// ============================================================
// CLIENT APRÈS VALIDATION
// ============================================================

export interface ValidateOrderCustomer {
  id: string;
  name: string | null;
  phone: string;
  loyaltyPoints: number;
}

// ============================================================
// RÉPONSE VALIDATE
// ============================================================

export interface ValidateOrderResponse {
  sale: ValidateOrderSale;

  invoice: ValidateOrderInvoice;

  customer: ValidateOrderCustomer | null;

  // Ajoutés explicitement par la route API
  orderId: string;
  invoiceId: string;
}
