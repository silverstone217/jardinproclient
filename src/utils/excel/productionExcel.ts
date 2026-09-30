import * as XLSX from "xlsx-js-style";

import type { ProductionReport, ReportFilters } from "@/types/report";

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
  styleIntegerCell,
  styleTableBody,
  styleTableHeader,
} from "@/utils/excel/excel.styles";

import { formatBottleSize, formatUnit } from "@/utils/formatters";

export interface ProductionExcelResult {
  workbook: XLSX.WorkBook;
  fileName: string;
}

function getPeriodLabel(report: ProductionReport): string {
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

function styleTitle(worksheet: XLSX.WorkSheet, cellAddress: string): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.s = {
    font: EXCEL_FONTS.title,
    alignment: EXCEL_ALIGNMENT.left,
  };
}

function styleSubtitle(worksheet: XLSX.WorkSheet, cellAddress: string): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.s = {
    font: EXCEL_FONTS.subtitle,
    alignment: EXCEL_ALIGNMENT.left,
  };
}

function styleSectionTitle(
  worksheet: XLSX.WorkSheet,
  cellAddress: string,
): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.s = {
    font: EXCEL_FONTS.section,
    fill: {
      fgColor: {
        rgb: EXCEL_COLORS.primary,
      },
    },
    alignment: EXCEL_ALIGNMENT.left,
    border: EXCEL_BORDERS.thin,
  };
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

function styleSummaryNumber(
  worksheet: XLSX.WorkSheet,
  cellAddress: string,
  format: "integer" | "decimal",
): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.t = "n";

  cell.z =
    format === "integer"
      ? EXCEL_NUMBER_FORMATS.integer
      : EXCEL_NUMBER_FORMATS.decimal;

  cell.s = {
    font: {
      ...EXCEL_FONTS.body,
      bold: true,
    },
    alignment: EXCEL_ALIGNMENT.right,
    border: EXCEL_BORDERS.thin,
  };
}

function createSummarySheet(report: ProductionReport): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    ["JUS JARDIN"],
    ["RAPPORT DE PRODUCTION"],
    [],
    ["Période", getPeriodLabel(report)],
    ["Généré le", getExcelGenerationDate()],
    [],
    ["RÉSUMÉ"],
    ["Nombre de productions", report.summary.totalProductions],
    ["Volume total produit (ml)", report.summary.totalVolumeMl],
    ["Quantité totale produite", report.summary.totalQuantityProduced],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [{ wch: 30 }, { wch: 32 }];

  styleTitle(worksheet, "A1");
  styleSubtitle(worksheet, "A2");

  styleSummaryLabel(worksheet, "A4");
  styleSummaryLabel(worksheet, "A5");

  styleSectionTitle(worksheet, "A7");

  styleSummaryLabel(worksheet, "A8");
  styleSummaryLabel(worksheet, "A9");
  styleSummaryLabel(worksheet, "A10");

  styleSummaryNumber(worksheet, "B8", "integer");

  styleSummaryNumber(worksheet, "B9", "decimal");

  styleSummaryNumber(worksheet, "B10", "integer");

  return worksheet;
}

function createProductionsSheet(report: ProductionReport): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    [
      "Date",
      "Volume produit (ml)",
      "Produit",
      "SKU",
      "Format",
      "Capacité (ml)",
      "Quantité produite",
      "Quantité restante",
      "Expiration",
    ],
  ];

  for (const production of report.rows) {
    for (const item of production.items) {
      rows.push([
        formatExcelDate(production.producedAt),

        production.totalVolumeMl,

        item.productName,

        item.sku,

        formatBottleSize(item.size),

        item.capacityMl,

        item.quantityProduced,

        item.remainingQuantity,

        formatExcelDate(item.expiresAt),
      ]);
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 26 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
  ];

  if (rows.length > 1) {
    styleTableHeader(worksheet, 0, 8, 0);

    styleTableBody(worksheet, 0, 8, 1, rows.length - 1);

    for (let row = 2; row <= rows.length; row++) {
      const volumeCell = worksheet[`B${row}`];

      if (volumeCell) {
        volumeCell.t = "n";
        volumeCell.z = EXCEL_NUMBER_FORMATS.decimal;

        volumeCell.s = {
          font: EXCEL_FONTS.body,
          alignment: EXCEL_ALIGNMENT.right,
          border: EXCEL_BORDERS.thin,
        };
      }

      const capacityCell = worksheet[`F${row}`];

      if (capacityCell) {
        capacityCell.t = "n";
        capacityCell.z = EXCEL_NUMBER_FORMATS.integer;

        capacityCell.s = {
          font: EXCEL_FONTS.body,
          alignment: EXCEL_ALIGNMENT.right,
          border: EXCEL_BORDERS.thin,
        };
      }

      styleIntegerCell(worksheet, `G${row}`);

      styleIntegerCell(worksheet, `H${row}`);
    }

    addAutoFilter(worksheet, 0);
  }

  autoFitColumns(worksheet, 12, 32);

  return worksheet;
}

function createIngredientsSheet(report: ProductionReport): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    ["Date de production", "Ingrédient", "Quantité utilisée", "Unité"],
  ];

  for (const production of report.rows) {
    for (const ingredient of production.ingredients) {
      rows.push([
        formatExcelDate(production.producedAt),

        ingredient.name,

        ingredient.quantityUsed,

        formatUnit(ingredient.unit),
      ]);
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [{ wch: 20 }, { wch: 28 }, { wch: 20 }, { wch: 14 }];

  if (rows.length > 1) {
    styleTableHeader(worksheet, 0, 3, 0);

    styleTableBody(worksheet, 0, 3, 1, rows.length - 1);

    for (let row = 2; row <= rows.length; row++) {
      const quantityCell = worksheet[`C${row}`];

      if (quantityCell) {
        quantityCell.t = "n";
        quantityCell.z = EXCEL_NUMBER_FORMATS.decimal;

        quantityCell.s = {
          font: EXCEL_FONTS.body,
          alignment: EXCEL_ALIGNMENT.right,
          border: EXCEL_BORDERS.thin,
        };
      }
    }

    addAutoFilter(worksheet, 0);
  }

  autoFitColumns(worksheet, 12, 32);

  return worksheet;
}

function createPackagingSheet(report: ProductionReport): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    [
      "Date de production",
      "Emballage",
      "Format",
      "Capacité (ml)",
      "Quantité utilisée",
    ],
  ];

  for (const production of report.rows) {
    for (const packaging of production.packagings) {
      rows.push([
        formatExcelDate(production.producedAt),

        packaging.name,

        formatBottleSize(packaging.size),

        packaging.capacityMl,

        packaging.quantityUsed,
      ]);
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
  ];

  if (rows.length > 1) {
    styleTableHeader(worksheet, 0, 4, 0);

    styleTableBody(worksheet, 0, 4, 1, rows.length - 1);

    for (let row = 2; row <= rows.length; row++) {
      styleIntegerCell(worksheet, `D${row}`);

      styleIntegerCell(worksheet, `E${row}`);
    }

    addAutoFilter(worksheet, 0);
  }

  autoFitColumns(worksheet, 12, 32);

  return worksheet;
}

function buildProductionFileName(report: ProductionReport): string {
  const dateFrom = report.period.dateFrom
    ? report.period.dateFrom.slice(0, 10)
    : "debut";

  const dateTo = report.period.dateTo
    ? report.period.dateTo.slice(0, 10)
    : "fin";

  const periodName = sanitizeFileName(`${dateFrom}_${dateTo}`);

  return `JusJardin_Rapport_Production_${periodName}.xlsx`;
}

export function createProductionWorkbook(
  report: ProductionReport,
  filters: ReportFilters,
): ProductionExcelResult {
  const workbook = XLSX.utils.book_new();

  const summarySheet = createSummarySheet(report);

  const productionsSheet = createProductionsSheet(report);

  const ingredientsSheet = createIngredientsSheet(report);

  const packagingSheet = createPackagingSheet(report);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Résumé");

  XLSX.utils.book_append_sheet(workbook, productionsSheet, "Productions");

  XLSX.utils.book_append_sheet(workbook, ingredientsSheet, "Ingrédients");

  XLSX.utils.book_append_sheet(workbook, packagingSheet, "Emballages");

  return {
    workbook,
    fileName: buildProductionFileName(report),
  };
}
