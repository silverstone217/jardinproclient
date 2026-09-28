// ======================================================
// POS
// ======================================================

/**
 * POS complet utilisé par le client mobile
 * pour la sélection et l'affichage des points de vente.
 */
export interface CustomerPointOfSale {
  id: string;
  name: string;
  code: string;
  isMainStore: boolean;
  isActive: boolean;
}

/**
 * Contexte POS retourné par l'API Customer.
 *
 * MANAGER + POS sélectionné :
 *   {
 *     id: "pos_xxx",
 *     isAll: false
 *   }
 *
 * MANAGER sans POS :
 *   {
 *     id: null,
 *     isAll: true
 *   }
 *
 * EMPLOYEE :
 *   {
 *     id: "pos_xxx",
 *     isAll: false
 *   }
 */
export interface CustomerPointOfSaleContext {
  id: string | null;
  isAll: boolean;
}

// ======================================================
// CUSTOMER
// ======================================================

/**
 * Client global à la boutique.
 *
 * IMPORTANT :
 * Customer n'appartient pas à un POS.
 *
 * Le POS sert uniquement à filtrer son activité
 * (factures, statistiques, historique).
 */
export interface Customer {
  id: string;
  name: string | null;
  phone: string;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

// ======================================================
// CUSTOMER LIST ITEM
// ======================================================

/**
 * Client retourné dans la liste.
 *
 * Les statistiques sont calculées à partir des factures
 * correspondant au contexte POS courant.
 */
export interface CustomerListItem extends Customer {
  totalSpent: string;
  purchaseCount: number;
  lastPurchaseAt: string | null;
}

// ======================================================
// CUSTOMER STATISTICS
// ======================================================

export interface CustomerStatistics {
  /**
   * Montants Decimal sérialisés par le serveur.
   */
  totalSpent: string;

  purchaseCount: number;

  averagePurchaseAmount: string;

  totalPointsEarned: number;

  totalPointsUsed: number;

  lastPurchaseAt: string | null;
}

// ======================================================
// CUSTOMER INVOICE ITEM
// ======================================================

export interface CustomerInvoiceItem {
  id: string;

  productName: string;

  size: string;

  quantity: number;

  /**
   * Decimal sérialisé par le serveur.
   */
  unitPrice: string;

  /**
   * Decimal sérialisé par le serveur.
   */
  subtotal: string;

  currency: string;
}

// ======================================================
// CUSTOMER INVOICE
// ======================================================

/**
 * Facture historique du client.
 *
 * La facture est utilisée à la place de Sale
 * pour l'historique client.
 *
 * Les informations produit sont des snapshots :
 * productName, size, unitPrice, etc.
 */
export interface CustomerInvoice {
  id: string;

  invoiceNumber: string;

  status: string;

  deliveryMethod: string | null;

  whatsappSentAt: string | null;

  printedAt: string | null;

  shopName: string;

  pointOfSale: {
    id: string | null;
    name: string;
    address: string | null;
    telephone: string | null;
  };

  sellerName: string;

  paymentMethod: string;

  currency: string;

  /**
   * Decimal sérialisé par le serveur.
   */
  subtotal: string;

  /**
   * Decimal sérialisé par le serveur.
   */
  discountAmount: string;

  /**
   * Decimal sérialisé par le serveur.
   */
  totalAmount: string;

  pointsEarned: number;

  pointsUsed: number;

  customerName: string | null;

  customerPhone: string | null;

  createdAt: string;

  items: CustomerInvoiceItem[];
}

// ======================================================
// CUSTOMER LOYALTY TRANSACTION
// ======================================================

export interface CustomerLoyaltyTransaction {
  id: string;

  type: string;

  points: number;

  balanceAfter: number;

  reason: string | null;

  saleId: string | null;

  /**
   * Numéro de reçu de la vente liée,
   * lorsqu'une vente existe.
   */
  receiptNumber: string | null;

  /**
   * POS de la vente liée.
   */
  pointOfSaleId: string | null;

  createdAt: string;
}

// ======================================================
// CUSTOMER DETAIL
// ======================================================

/**
 * Détail complet d'un client.
 *
 * Le client lui-même reste global.
 * Les statistiques et les factures correspondent
 * au contexte POS retourné par l'API.
 */
export interface CustomerDetail extends Customer {
  statistics: CustomerStatistics;

  invoices: CustomerInvoice[];

  loyaltyTransactions: CustomerLoyaltyTransaction[];
}

// ======================================================
// PAGINATION
// ======================================================

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ======================================================
// SYNCHRONISATION
// ======================================================

export interface CustomerSync {
  serverTime: string;
  updatedSince: string | null;
}

// ======================================================
// LIST RESPONSE
// ======================================================

export interface CustomersResponse {
  success: boolean;

  message?: string;

  customers?: CustomerListItem[];

  pagination?: CustomerPagination;

  pointOfSale?: CustomerPointOfSaleContext;

  sync?: CustomerSync;
}

// ======================================================
// DETAIL RESPONSE
// ======================================================

export interface CustomerResponse {
  success: boolean;

  message?: string;

  customer?: CustomerDetail;

  pagination?: CustomerPagination;

  pointOfSale?: CustomerPointOfSaleContext;

  sync?: CustomerSync;
}
