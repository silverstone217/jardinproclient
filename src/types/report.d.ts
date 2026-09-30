// src/types/report.d.ts

// ============================================================
// REPORT TYPES
// ============================================================

export type ReportType =
  | "SALES"
  | "PRODUCTION"
  | "RAW_MATERIAL_STOCK"
  | "FINISHED_STOCK";

// ============================================================
// REPORT FILTERS
// ============================================================

export interface ReportFilters {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;

  /**
   * POS sélectionné.
   *
   * undefined = Tous les POS
   */
  pointOfSaleId?: string;

  /**
   * Nom du POS sélectionné.
   *
   * Utilisé uniquement pour l'affichage côté client.
   */
  pointOfSaleName?: string;

  /**
   * true lorsque aucun POS spécifique n'est sélectionné.
   */
  allPointOfSales?: boolean;
}

// ============================================================
// REPORT PERIOD
// ============================================================

export interface ReportPeriod {
  /**
   * Date de début demandée par l'utilisateur.
   * Peut être null lorsque le serveur utilise le début
   * de l'historique disponible.
   */
  dateFrom: string | null;

  /**
   * Date de fin demandée par l'utilisateur.
   * Peut être null lorsque aucune date de fin explicite
   * n'a été fournie.
   */
  dateTo: string | null;

  /**
   * Date effective de début utilisée par le serveur.
   */
  startDate: string;

  /**
   * Date effective de fin utilisée par le serveur.
   */
  endDate: string;
}

// ============================================================
// POINT OF SALE
// ============================================================

export interface ReportPointOfSale {
  id: string;
  name: string;
  code: string;
}

// ============================================================
// POINT OF SALE API RESPONSE
// ============================================================

export interface ReportPointOfSalesResponse {
  success: true;
  data: ReportPointOfSale[];
}

// ============================================================
// SALES REPORT
// ============================================================

export interface SalesReportSummary {
  totalSales: number;
  totalQuantity: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
}

// ------------------------------------------------------------
// SALES PAYMENT TOTAL
// ------------------------------------------------------------

export interface SalesPaymentTotal {
  paymentMethod: string;
  amount: number;
}

// ------------------------------------------------------------
// SALES BY POINT OF SALE
// ------------------------------------------------------------

export interface SalesReportPointOfSale {
  /**
   * Peut être null lorsqu'une ancienne facture
   * n'a plus de POS associé.
   */
  pointOfSaleId: string | null;

  /**
   * Snapshot historique du nom du POS.
   *
   * Important :
   * ce nom peut correspondre à un POS supprimé/désactivé.
   */
  pointOfSaleName: string;

  totalSales: number;
  totalQuantity: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
}

// ------------------------------------------------------------
// SALES ROW
// ------------------------------------------------------------

export interface SalesReportRow {
  /**
   * Peut être null pour une facture historique
   * dont le POS actuel n'existe plus.
   */
  pointOfSaleId: string | null;

  /**
   * Nom historique du POS provenant de Invoice.
   */
  pointOfSaleName: string;

  productName: string;
  size: string;
  unitPrice: number;
  quantity: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
}

// ------------------------------------------------------------
// SALES REPORT
// ------------------------------------------------------------

export interface SalesReport {
  type: "SALES";
  period: ReportPeriod;
  summary: SalesReportSummary;
  paymentTotals: SalesPaymentTotal[];
  byPointOfSale: SalesReportPointOfSale[];
  rows: SalesReportRow[];
}

// ============================================================
// PRODUCTION REPORT
// ============================================================

export interface ProductionIngredientRow {
  ingredientId: string;
  name: string;
  quantityUsed: number;
  unit: string;
}

export interface ProductionPackagingRow {
  packagingId: string;
  name: string;
  size: string;
  capacityMl: number;
  quantityUsed: number;
}

export interface ProductionItemRow {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  capacityMl: number;
  quantityProduced: number;
  remainingQuantity: number;
  expiresAt: string;
}

export interface ProductionReportRow {
  id: string;
  producedAt: string;
  totalVolumeMl: number;
  ingredients: ProductionIngredientRow[];
  packagings: ProductionPackagingRow[];
  items: ProductionItemRow[];
}

export interface ProductionReportSummary {
  totalProductions: number;
  totalVolumeMl: number;
  totalQuantityProduced: number;
}

export interface ProductionReport {
  type: "PRODUCTION";
  period: ReportPeriod;
  summary: ProductionReportSummary;
  rows: ProductionReportRow[];
}

// ============================================================
// RAW MATERIAL STOCK REPORT
// ============================================================

export interface RawMaterialStockSummary {
  totalIngredients: number;
  totalPackagings: number;
}

export interface RawIngredientStockReportRow {
  id: string;
  name: string;
  unit: string;

  /**
   * Stock au début de la période.
   */
  openingQuantity: number;

  /**
   * Quantité achetée pendant la période.
   */
  purchasedQuantity: number;

  /**
   * Quantité consommée par la production.
   */
  productionQuantity: number;

  /**
   * Quantité perdue.
   */
  lossQuantity: number;

  /**
   * Ajustements de stock.
   */
  adjustmentQuantity: number;

  /**
   * Stock actuel retourné par le serveur.
   */
  closingQuantity: number;
}

export interface RawPackagingStockReportRow {
  id: string;
  name: string;
  size: string;
  capacityMl: number;

  /**
   * Stock au début de la période.
   */
  openingQuantity: number;

  /**
   * Quantité achetée pendant la période.
   */
  purchasedQuantity: number;

  /**
   * Quantité consommée par la production.
   */
  productionQuantity: number;

  /**
   * Quantité perdue.
   */
  lossQuantity: number;

  /**
   * Ajustements de stock.
   */
  adjustmentQuantity: number;

  /**
   * Stock actuel retourné par le serveur.
   */
  closingQuantity: number;
}

export interface RawMaterialStockReport {
  type: "RAW_MATERIAL_STOCK";
  period: ReportPeriod;
  summary: RawMaterialStockSummary;
  ingredients: RawIngredientStockReportRow[];
  packagings: RawPackagingStockReportRow[];
}

// ============================================================
// FINISHED STOCK REPORT
// ============================================================

export interface FinishedStockSummary {
  totalVariants: number;
  totalQuantity: number;
  totalStockValue: number;
}

export interface FinishedStockReportRow {
  variantId: string;
  productName: string;
  sku: string;
  size: string;

  /**
   * Nom du POS auquel appartient le stock.
   *
   * null = stock central / Reste.
   */
  pointOfSaleId: string | null;

  /**
   * Nom d'affichage du POS.
   *
   * "Reste" représente le stock restant
   * dans la boutique principale.
   */
  pointOfSaleName: string;

  quantity: number;
  unitPrice: number;
  stockValue: number;
}

export interface FinishedStockReport {
  type: "FINISHED_STOCK";
  period: ReportPeriod;
  summary: FinishedStockSummary;
  rows: FinishedStockReportRow[];
}

// ============================================================
// REPORT DATA
// ============================================================

export type ReportData =
  | SalesReport
  | ProductionReport
  | RawMaterialStockReport
  | FinishedStockReport;

// ============================================================
// REPORT API RESPONSE
// ============================================================

export interface ReportResponse {
  success: true;
  data: ReportData;
}

// ============================================================
// REPORT STORE STATE
// ============================================================

export interface ReportStoreState {
  report: ReportData | null;
  filters: ReportFilters;
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// REPORT STORE ACTIONS
// ============================================================

export interface ReportStoreActions {
  generateReport: (filters: ReportFilters) => Promise<ReportData>;

  setFilters: (filters: Partial<ReportFilters>) => void;

  clearReport: () => void;

  clearError: () => void;
}

// ============================================================
// REPORT STORE
// ============================================================

export type ReportStore = ReportStoreState & ReportStoreActions;
