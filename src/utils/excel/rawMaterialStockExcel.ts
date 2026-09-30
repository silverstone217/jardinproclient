import * as XLSX from "xlsx-js-style";

import type { RawMaterialStockReport, ReportFilters } from "@/types/report";

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
  styleDecimalCell,
  styleIntegerCell,
  styleTableBody,
  styleTableHeader,
} from "@/utils/excel/excel.styles";

import { formatBottleSize, formatUnit } from "@/utils/formatters";

export interface RawMaterialStockExcelResult {
  workbook: XLSX.WorkBook;
  fileName: string;
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

function createSummarySheet(report: RawMaterialStockReport): XLSX.WorkSheet {
  const rows = [
    ["JUS JARDIN"],
    ["RAPPORT STOCK MATIÈRES PREMIÈRES"],
    [
      "Période",
      `${formatExcelDate(report.period.startDate)} - ${formatExcelDate(
        report.period.endDate,
      )}`,
    ],
    ["Généré le", getExcelGenerationDate()],
    [],
    ["Indicateur", "Valeur"],
    ["Nombre d'ingrédients", report.summary.totalIngredients],
    ["Nombre d'emballages", report.summary.totalPackagings],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [{ wch: 32 }, { wch: 30 }];

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

  styleTableHeader(worksheet, 0, 1, 5);

  styleTableBody(worksheet, 0, 1, 6, 7);

  styleIntegerCell(worksheet, "B7");

  styleIntegerCell(worksheet, "B8");

  styleSummaryValue(worksheet, "B3");

  styleSummaryValue(worksheet, "B4");

  return worksheet;
}

function createIngredientsSheet(
  report: RawMaterialStockReport,
): XLSX.WorkSheet {
  const headers = [
    "Ingrédient",
    "Unité",
    "Stock initial",
    "Achats",
    "Production",
    "Pertes",
    "Ajustements",
    "Stock final",
  ];

  const rows = report.ingredients.map((item) => [
    item.name,

    formatUnit(item.unit),

    item.openingQuantity,

    item.purchasedQuantity,

    item.productionQuantity,

    item.lossQuantity,

    item.adjustmentQuantity,

    item.closingQuantity,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];

  const lastRow = rows.length;

  styleTableHeader(worksheet, 0, headers.length - 1, 0);

  if (lastRow > 0) {
    styleTableBody(worksheet, 0, headers.length - 1, 1, lastRow);

    for (let row = 2; row <= lastRow + 1; row++) {
      for (const column of ["C", "D", "E", "F", "G", "H"]) {
        styleDecimalCell(worksheet, `${column}${row}`);
      }
    }
  }

  addAutoFilter(worksheet, 0);

  autoFitColumns(worksheet, 12, 35);

  return worksheet;
}

function createPackagingsSheet(report: RawMaterialStockReport): XLSX.WorkSheet {
  const headers = [
    "Emballage",
    "Format",
    "Capacité (ml)",
    "Stock initial",
    "Achats",
    "Production",
    "Pertes",
    "Ajustements",
    "Stock final",
  ];

  const rows = report.packagings.map((item) => [
    item.name,

    formatBottleSize(item.size),

    item.capacityMl,

    item.openingQuantity,

    item.purchasedQuantity,

    item.productionQuantity,

    item.lossQuantity,

    item.adjustmentQuantity,

    item.closingQuantity,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];

  const lastRow = rows.length;

  styleTableHeader(worksheet, 0, headers.length - 1, 0);

  if (lastRow > 0) {
    styleTableBody(worksheet, 0, headers.length - 1, 1, lastRow);

    for (let row = 2; row <= lastRow + 1; row++) {
      // Capacité en ml
      styleIntegerCell(worksheet, `C${row}`);

      // Quantités de stock
      for (const column of ["D", "E", "F", "G", "H", "I"]) {
        styleIntegerCell(worksheet, `${column}${row}`);
      }
    }
  }

  addAutoFilter(worksheet, 0);

  autoFitColumns(worksheet, 12, 35);

  return worksheet;
}

export function createRawMaterialStockWorkbook(
  report: RawMaterialStockReport,
  _filters: ReportFilters,
): RawMaterialStockExcelResult {
  const workbook = XLSX.utils.book_new();

  const summarySheet = createSummarySheet(report);

  const ingredientsSheet = createIngredientsSheet(report);

  const packagingsSheet = createPackagingsSheet(report);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Résumé");

  XLSX.utils.book_append_sheet(workbook, ingredientsSheet, "Ingrédients");

  XLSX.utils.book_append_sheet(workbook, packagingsSheet, "Emballages");

  const dateFrom = sanitizeFileName(report.period.dateFrom ?? "debut");

  const dateTo = sanitizeFileName(report.period.dateTo ?? "fin");

  const fileName =
    `JusJardin_Rapport_Stock_Matieres_Premieres_` +
    `${dateFrom}_${dateTo}.xlsx`;

  return {
    workbook,
    fileName,
  };
}
