import * as XLSX from "xlsx-js-style";

import type { FinishedStockReport, ReportFilters } from "@/types/report";

import {
  addAutoFilter,
  autoFitColumns,
  formatExcelDate,
  getExcelGenerationDate,
  sanitizeFileName,
} from "@/utils/excel/excel.helpers";

import {
  EXCEL_ALIGNMENT,
  EXCEL_BORDERS,
  EXCEL_COLORS,
  EXCEL_FONTS,
  styleCurrencyCell,
  styleIntegerCell,
  styleTableBody,
  styleTableHeader,
} from "@/utils/excel/excel.styles";

import {
  formatBottleSize,
  formatCurrencyCode,
  formatPointOfSaleName,
} from "@/utils/formatters";

export interface FinishedStockExcelResult {
  workbook: XLSX.WorkBook;
  fileName: string;
}

interface FinishedStockPosSummary {
  pointOfSaleId: string | null;
  pointOfSaleName: string;
  totalVariants: number;
  totalQuantity: number;
  totalStockValue: number;
}

const REPORT_CURRENCY = "CDF";

function getCurrencyLabel(): string {
  return formatCurrencyCode(REPORT_CURRENCY);
}

function styleSummaryLabel(
  worksheet: XLSX.WorkSheet,
  cellAddress: string,
): void {
  const cell = worksheet[cellAddress];

  if (!cell) return;

  cell.s = {
    font: EXCEL_FONTS.body,
    fill: {
      fgColor: {
        rgb: EXCEL_COLORS.lightGray,
      },
    },
    alignment: EXCEL_ALIGNMENT.left,
    border: EXCEL_BORDERS.thin,
  };
}

function styleSummaryValue(
  worksheet: XLSX.WorkSheet,
  cellAddress: string,
): void {
  const cell = worksheet[cellAddress];

  if (!cell) return;

  cell.s = {
    font: {
      ...EXCEL_FONTS.body,
      bold: true,
    },
    alignment: EXCEL_ALIGNMENT.right,
    border: EXCEL_BORDERS.thin,
  };
}

function getPointOfSaleLabel(filters: ReportFilters): string {
  if (filters.pointOfSaleId && filters.pointOfSaleName) {
    return formatPointOfSaleName(filters.pointOfSaleName);
  }

  return "Tous les points de vente";
}

function buildPosSummaries(
  report: FinishedStockReport,
): FinishedStockPosSummary[] {
  const summaries = new Map<string, FinishedStockPosSummary>();

  for (const row of report.rows) {
    const key = row.pointOfSaleId ?? "RESTE";

    const existing = summaries.get(key);

    if (existing) {
      existing.totalQuantity += row.quantity;
      existing.totalStockValue += row.stockValue;

      if (row.quantity > 0) {
        existing.totalVariants += 1;
      }

      continue;
    }

    summaries.set(key, {
      pointOfSaleId: row.pointOfSaleId,
      pointOfSaleName:
        row.pointOfSaleId === null
          ? "Reste"
          : formatPointOfSaleName(row.pointOfSaleName),
      totalVariants: row.quantity > 0 ? 1 : 0,
      totalQuantity: row.quantity,
      totalStockValue: row.stockValue,
    });
  }

  return Array.from(summaries.values()).sort((a, b) =>
    a.pointOfSaleName.localeCompare(b.pointOfSaleName, "fr"),
  );
}

function createSummarySheet(
  report: FinishedStockReport,
  filters: ReportFilters,
): XLSX.WorkSheet {
  const currency = getCurrencyLabel();

  const rows = [
    ["JUS JARDIN"],
    ["RAPPORT STOCK PRODUITS FINIS"],
    [
      "Période",
      `${formatExcelDate(report.period.startDate)} - ${formatExcelDate(
        report.period.endDate,
      )}`,
    ],
    ["Point de vente", getPointOfSaleLabel(filters)],
    ["Généré le", getExcelGenerationDate()],
    [],
    ["Indicateur", "Valeur"],
    ["Nombre de variantes", report.summary.totalVariants],
    ["Quantité totale", report.summary.totalQuantity],
    [`Valeur totale du stock (${currency})`, report.summary.totalStockValue],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [{ wch: 35 }, { wch: 35 }];

  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      font: EXCEL_FONTS.title,
      alignment: EXCEL_ALIGNMENT.left,
    };
  }

  if (worksheet["A2"]) {
    worksheet["A2"].s = {
      font: {
        ...EXCEL_FONTS.subtitle,
        bold: true,
      },
      alignment: EXCEL_ALIGNMENT.left,
    };
  }

  styleSummaryLabel(worksheet, "A3");
  styleSummaryLabel(worksheet, "A4");
  styleSummaryLabel(worksheet, "A5");

  styleTableHeader(worksheet, 0, 1, 6);

  styleTableBody(worksheet, 0, 1, 7, 9);

  styleSummaryValue(worksheet, "B3");
  styleSummaryValue(worksheet, "B4");
  styleSummaryValue(worksheet, "B5");

  styleIntegerCell(worksheet, "B8");
  styleIntegerCell(worksheet, "B9");

  styleCurrencyCell(worksheet, "B10");

  return worksheet;
}

function createPosSheet(report: FinishedStockReport): XLSX.WorkSheet {
  const currency = getCurrencyLabel();

  const summaries = buildPosSummaries(report);

  const headers = [
    "Point de vente",
    "Variantes",
    "Quantité totale",
    `Valeur du stock (${currency})`,
  ];

  const rows = summaries.map((item) => [
    item.pointOfSaleName,
    item.totalVariants,
    item.totalQuantity,
    item.totalStockValue,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 24 }];

  styleTableHeader(worksheet, 0, headers.length - 1, 0);

  if (rows.length > 0) {
    styleTableBody(worksheet, 0, headers.length - 1, 1, rows.length);

    for (let row = 2; row <= rows.length + 1; row++) {
      styleIntegerCell(worksheet, `B${row}`);

      styleIntegerCell(worksheet, `C${row}`);

      styleCurrencyCell(worksheet, `D${row}`);
    }
  }

  addAutoFilter(worksheet, 0);

  autoFitColumns(worksheet, 12, 35);

  return worksheet;
}

function createDetailsSheet(report: FinishedStockReport): XLSX.WorkSheet {
  const currency = getCurrencyLabel();

  const headers = [
    "Point de vente",
    "Produit",
    "SKU",
    "Format",
    "Quantité",
    `Prix unitaire (${currency})`,
    `Valeur du stock (${currency})`,
  ];

  const rows = report.rows.map((item) => [
    item.pointOfSaleId === null
      ? "Reste"
      : formatPointOfSaleName(item.pointOfSaleName),

    item.productName,

    item.sku,

    formatBottleSize(item.size),

    item.quantity,

    item.unitPrice,

    item.stockValue,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 28 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 },
    { wch: 24 },
  ];

  styleTableHeader(worksheet, 0, headers.length - 1, 0);

  if (rows.length > 0) {
    styleTableBody(worksheet, 0, headers.length - 1, 1, rows.length);

    for (let row = 2; row <= rows.length + 1; row++) {
      styleIntegerCell(worksheet, `E${row}`);

      styleCurrencyCell(worksheet, `F${row}`);

      styleCurrencyCell(worksheet, `G${row}`);
    }
  }

  addAutoFilter(worksheet, 0);

  autoFitColumns(worksheet, 12, 35);

  return worksheet;
}

export function createFinishedStockWorkbook(
  report: FinishedStockReport,
  filters: ReportFilters,
): FinishedStockExcelResult {
  const workbook = XLSX.utils.book_new();

  const summarySheet = createSummarySheet(report, filters);

  const posSheet = createPosSheet(report);

  const detailsSheet = createDetailsSheet(report);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Résumé");

  XLSX.utils.book_append_sheet(workbook, posSheet, "Stock par point de vente");

  XLSX.utils.book_append_sheet(workbook, detailsSheet, "Détails");

  const dateFrom = sanitizeFileName(report.period.dateFrom ?? "debut");

  const dateTo = sanitizeFileName(report.period.dateTo ?? "fin");

  const posLabel = sanitizeFileName(getPointOfSaleLabel(filters));

  const fileName =
    `JusJardin_Rapport_Stock_Produits_Finis_` +
    `${posLabel}_${dateFrom}_${dateTo}.xlsx`;

  return {
    workbook,
    fileName,
  };
}
