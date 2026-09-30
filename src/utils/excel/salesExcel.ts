import * as XLSX from "xlsx-js-style";

import type { ReportFilters, SalesReport } from "@/types/report";

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
  EXCEL_NUMBER_FORMATS,
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

export interface SalesExcelResult {
  workbook: XLSX.WorkBook;
  fileName: string;
}

/**
 * ------------------------------------------------------------
 * Devise utilisée dans le rapport
 * ------------------------------------------------------------
 *
 * La base/API conserve CDF.
 * L'Excel affiche FC.
 *
 * Plus tard, si le shop devient configurable,
 * cette valeur pourra venir du rapport.
 */
const REPORT_CURRENCY = "CDF";

function getCurrencyLabel(): string {
  return formatCurrencyCode(REPORT_CURRENCY);
}

function getPeriodLabel(report: SalesReport): string {
  const { dateFrom, dateTo } = report.period;

  if (dateFrom && dateTo) {
    return `${formatExcelDate(dateFrom)} → ${formatExcelDate(dateTo)}`;
  }

  if (dateFrom) {
    return `À partir du ${formatExcelDate(dateFrom)}`;
  }

  if (dateTo) {
    return `Jusqu'au ${formatExcelDate(dateTo)}`;
  }

  return "Toutes les périodes";
}

function getPointOfSaleLabel(filters: ReportFilters): string {
  if (filters.pointOfSaleName) {
    return formatPointOfSaleName(filters.pointOfSaleName);
  }

  return "Tous les points de vente";
}

function styleSummaryLabel(
  worksheet: XLSX.WorkSheet,
  cellAddress: string,
): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.s = {
    font: {
      ...EXCEL_FONTS.body,
      bold: true,
    },
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
  format: "integer" | "currency",
): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.t = "n";

  cell.z =
    format === "currency"
      ? EXCEL_NUMBER_FORMATS.currency
      : EXCEL_NUMBER_FORMATS.integer;

  cell.s = {
    font: {
      ...EXCEL_FONTS.body,
      bold: true,
    },
    alignment: EXCEL_ALIGNMENT.right,
    border: EXCEL_BORDERS.thin,
  };
}

function createSummarySheet(
  report: SalesReport,
  filters: ReportFilters,
): XLSX.WorkSheet {
  const period = getPeriodLabel(report);
  const pointOfSale = getPointOfSaleLabel(filters);
  const currency = getCurrencyLabel();

  const rows: (string | number)[][] = [
    ["JUS JARDIN"],
    ["RAPPORT DES VENTES"],
    [],
    ["Période", period],
    ["Point de vente", pointOfSale],
    ["Devise", currency],
    ["Généré le", getExcelGenerationDate()],
    [],
    ["RÉSUMÉ"],
    ["Total ventes", report.summary.totalSales],
    ["Quantité vendue", report.summary.totalQuantity],
    [`Montant brut (${currency})`, report.summary.grossAmount],
    [`Remises (${currency})`, report.summary.discountAmount],
    [`Montant net (${currency})`, report.summary.netAmount],
    [],
    ["PAIEMENTS"],
    ["Mode de paiement", `Montant (${currency})`],
    ...report.paymentTotals.map((payment) => [
      payment.paymentMethod,
      payment.amount,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [{ wch: 30 }, { wch: 32 }];

  worksheet["A1"].s = {
    font: EXCEL_FONTS.title,
    alignment: EXCEL_ALIGNMENT.left,
  };

  worksheet["A2"].s = {
    font: {
      ...EXCEL_FONTS.subtitle,
      bold: true,
    },
    alignment: EXCEL_ALIGNMENT.left,
  };

  ["A4", "A5", "A6", "A7"].forEach((address) => {
    styleSummaryLabel(worksheet, address);
  });

  worksheet["A9"].s = {
    font: EXCEL_FONTS.section,
    fill: {
      fgColor: {
        rgb: EXCEL_COLORS.primary,
      },
    },
    alignment: EXCEL_ALIGNMENT.left,
    border: EXCEL_BORDERS.thin,
  };

  ["A10", "A11", "A12", "A13", "A14"].forEach((address) => {
    styleSummaryLabel(worksheet, address);
  });

  styleSummaryValue(worksheet, "B10", "integer");

  styleSummaryValue(worksheet, "B11", "integer");

  styleSummaryValue(worksheet, "B12", "currency");

  styleSummaryValue(worksheet, "B13", "currency");

  styleSummaryValue(worksheet, "B14", "currency");

  worksheet["A16"].s = {
    font: EXCEL_FONTS.section,
    fill: {
      fgColor: {
        rgb: EXCEL_COLORS.primary,
      },
    },
    alignment: EXCEL_ALIGNMENT.left,
    border: EXCEL_BORDERS.thin,
  };

  worksheet["A17"].s = {
    font: EXCEL_FONTS.header,
    fill: {
      fgColor: {
        rgb: EXCEL_COLORS.secondary,
      },
    },
    alignment: EXCEL_ALIGNMENT.center,
    border: EXCEL_BORDERS.thin,
  };

  worksheet["B17"].s = {
    font: EXCEL_FONTS.header,
    fill: {
      fgColor: {
        rgb: EXCEL_COLORS.secondary,
      },
    },
    alignment: EXCEL_ALIGNMENT.center,
    border: EXCEL_BORDERS.thin,
  };

  const paymentStartRow = 17;

  const paymentEndRow = paymentStartRow + report.paymentTotals.length;

  if (report.paymentTotals.length > 0) {
    styleTableBody(worksheet, 0, 1, paymentStartRow, paymentEndRow);

    for (let row = paymentStartRow + 1; row <= paymentEndRow; row++) {
      const amountCell = worksheet[`B${row + 1}`];

      if (amountCell) {
        amountCell.t = "n";

        amountCell.z = EXCEL_NUMBER_FORMATS.currency;

        amountCell.s = {
          font: EXCEL_FONTS.body,
          alignment: EXCEL_ALIGNMENT.right,
          border: EXCEL_BORDERS.thin,
        };
      }
    }
  }

  return worksheet;
}

function createPointOfSaleSheet(report: SalesReport): XLSX.WorkSheet {
  const currency = getCurrencyLabel();

  const rows: (string | number | null)[][] = [
    [
      "Point de vente",
      "Nombre de ventes",
      "Quantité",
      `Montant brut (${currency})`,
      `Remises (${currency})`,
      `Montant net (${currency})`,
    ],

    ...report.byPointOfSale.map((item) => [
      formatPointOfSaleName(item.pointOfSaleName),
      item.totalSales,
      item.totalQuantity,
      item.grossAmount,
      item.discountAmount,
      item.netAmount,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
  ];

  if (report.byPointOfSale.length > 0) {
    styleTableHeader(worksheet, 0, 5, 0);

    styleTableBody(worksheet, 0, 5, 1, report.byPointOfSale.length);

    for (let index = 0; index < report.byPointOfSale.length; index++) {
      const excelRow = index + 2;

      styleIntegerCell(worksheet, `B${excelRow}`);

      styleIntegerCell(worksheet, `C${excelRow}`);

      styleCurrencyCell(worksheet, `D${excelRow}`);

      styleCurrencyCell(worksheet, `E${excelRow}`);

      styleCurrencyCell(worksheet, `F${excelRow}`);
    }

    addAutoFilter(worksheet, 0);
  }

  autoFitColumns(worksheet, 12, 32);

  return worksheet;
}

function createDetailsSheet(report: SalesReport): XLSX.WorkSheet {
  const currency = getCurrencyLabel();

  const rows: (string | number | null)[][] = [
    [
      "Point de vente",
      "Produit",
      "Format",
      `Prix unitaire (${currency})`,
      "Quantité",
      `Montant brut (${currency})`,
      `Remise (${currency})`,
      `Montant net (${currency})`,
    ],

    ...report.rows.map((item) => [
      formatPointOfSaleName(item.pointOfSaleName),

      item.productName,

      // ML_500 -> 500 ml
      // ML_200 -> 200 ml
      // ML200  -> 200 ml
      // 200ML  -> 200 ml
      formatBottleSize(item.size),

      item.unitPrice,
      item.quantity,
      item.grossAmount,
      item.discountAmount,
      item.netAmount,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 28 },
    { wch: 14 },
    { wch: 22 },
    { wch: 12 },
    { wch: 24 },
    { wch: 22 },
    { wch: 24 },
  ];

  if (report.rows.length > 0) {
    styleTableHeader(worksheet, 0, 7, 0);

    styleTableBody(worksheet, 0, 7, 1, report.rows.length);

    for (let index = 0; index < report.rows.length; index++) {
      const excelRow = index + 2;

      styleCurrencyCell(worksheet, `D${excelRow}`);

      styleIntegerCell(worksheet, `E${excelRow}`);

      styleCurrencyCell(worksheet, `F${excelRow}`);

      styleCurrencyCell(worksheet, `G${excelRow}`);

      styleCurrencyCell(worksheet, `H${excelRow}`);
    }

    addAutoFilter(worksheet, 0);
  }

  autoFitColumns(worksheet, 12, 32);

  return worksheet;
}

function buildSalesFileName(
  report: SalesReport,
  filters: ReportFilters,
): string {
  const pointOfSale = sanitizeFileName(getPointOfSaleLabel(filters));

  const dateFrom = report.period.dateFrom
    ? report.period.dateFrom.slice(0, 10)
    : "debut";

  const dateTo = report.period.dateTo
    ? report.period.dateTo.slice(0, 10)
    : "fin";

  return `JusJardin_Rapport_Ventes_${pointOfSale}_${dateFrom}_${dateTo}.xlsx`;
}

export function createSalesWorkbook(
  report: SalesReport,
  filters: ReportFilters,
): SalesExcelResult {
  const workbook = XLSX.utils.book_new();

  const summarySheet = createSummarySheet(report, filters);

  const pointOfSaleSheet = createPointOfSaleSheet(report);

  const detailsSheet = createDetailsSheet(report);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Résumé");

  XLSX.utils.book_append_sheet(
    workbook,
    pointOfSaleSheet,
    "Par point de vente",
  );

  XLSX.utils.book_append_sheet(workbook, detailsSheet, "Détails");

  return {
    workbook,
    fileName: buildSalesFileName(report, filters),
  };
}
