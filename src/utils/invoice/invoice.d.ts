import type {
  BottleSize,
  Currency,
  PaymentMethod,
} from "@/app/generated/prisma/client";

// ============================================================
// TYPES DOCUMENT FACTURE
// ============================================================

export type InvoiceDocumentCurrency = Currency;

export type InvoiceDocumentPaymentMethod = PaymentMethod;

export type InvoiceDocumentBottleSize = BottleSize;

// ============================================================
// ARTICLE
// ============================================================

export interface InvoiceDocumentItem {
  id: string;

  productName: string;
  size: InvoiceDocumentBottleSize;

  quantity: number;

  unitPrice: number;
  subtotal: number;

  currency?: InvoiceDocumentCurrency;
}

// ============================================================
// CLIENT
// ============================================================

export interface InvoiceDocumentCustomer {
  name: string | null;
  phone: string | null;
}

// ============================================================
// FIDÉLITÉ
// ============================================================

export interface InvoiceDocumentLoyalty {
  pointsEarned: number;
  pointsUsed: number;
}

// ============================================================
// DOCUMENT FACTURE
// ============================================================

export interface InvoiceDocumentData {
  id?: string;

  invoiceNumber: string;

  createdAt: string | Date;

  // ==========================================================
  // BOUTIQUE / PDV
  // ==========================================================

  shopName: string;

  pointOfSaleName: string;
  pointOfSaleAddress: string | null;
  pointOfSaleTelephone: string | null;

  // Audit interne uniquement.
  // Ne doit pas être affiché sur la facture client.
  sellerName?: string | null;

  // ==========================================================
  // MONTANTS
  // ==========================================================

  currency: InvoiceDocumentCurrency;

  subtotal: number;

  discountAmount: number;

  totalAmount: number;

  // ==========================================================
  // CLIENT
  // ==========================================================

  customer: InvoiceDocumentCustomer;

  // ==========================================================
  // PAIEMENT
  // ==========================================================

  paymentMethod: InvoiceDocumentPaymentMethod | null;

  // ==========================================================
  // FIDÉLITÉ
  // ==========================================================

  loyalty: InvoiceDocumentLoyalty;

  // ==========================================================
  // ARTICLES
  // ==========================================================

  items: InvoiceDocumentItem[];
}
