import type {
  BottleSize,
  Currency,
  InvoiceDeliveryMethod,
  InvoiceStatus,
  PaymentMethod,
} from "@/app/generated/prisma/client";

// ============================================================
// INVOICE
// ============================================================

export interface Invoice {
  id: string;
  saleId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  deliveryMethod: InvoiceDeliveryMethod | null;
  whatsappSentAt: string | null;
  printedAt: string | null;

  // ==========================================================
  // BOUTIQUE
  // ==========================================================

  shop: {
    name: string;
  };

  // ==========================================================
  // POINT DE VENTE
  // ==========================================================

  pointOfSale: {
    name: string;
    address: string | null;
    telephone: string | null;
  };

  // ==========================================================
  // FACTURE
  // ==========================================================

  currency: Currency;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;

  // ==========================================================
  // FIDÉLITÉ
  // ==========================================================

  loyalty: {
    pointsEarned: number;
    pointsUsed: number;
  };

  // ==========================================================
  // CLIENT
  // ==========================================================

  customer: {
    name: string | null;
    phone: string | null;
  };

  // ==========================================================
  // DATE
  // ==========================================================

  createdAt: string;

  // ==========================================================
  // ARTICLES
  // ==========================================================

  items: InvoiceItem[];
}

// ============================================================
// INVOICE ITEM
// ============================================================

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productName: string;
  size: BottleSize;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  currency: Currency;
}

// ============================================================
// INVOICE FILTERS
// ============================================================

export type InvoicePeriod = "year" | "month" | "week" | "day";

export interface InvoiceFilters {
  minAmount?: number;
  maxAmount?: number;
  period?: InvoicePeriod;
  date?: string;
  customerPhone?: string;
}
