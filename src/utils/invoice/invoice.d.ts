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
  id: string;
  invoiceNumber: string;
  createdAt: string | Date;

  shopName: string;
  shopLogo?: string | null;

  pointOfSaleName: string;
  pointOfSaleAddress?: string | null;
  pointOfSaleTelephone?: string | null;

  sellerName?: string | null;

  currency: InvoiceDocumentCurrency;

  subtotal: number;
  discountAmount: number;
  totalAmount: number;

  customer: {
    name?: string | null;
    phone?: string | null;
  };

  paymentMethod: InvoiceDocumentPaymentMethod | null;

  loyalty: {
    pointsEarned: number;
    pointsUsed: number;
  };

  items: Array<{
    productName: string;
    size: InvoiceDocumentBottleSize;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    currency?: InvoiceDocumentCurrency;
  }>;
}
