import type { ReportData, ReportFilters } from "@/types/report";

import { createFinishedStockWorkbook } from "@/utils/excel/finishedStockExcel";
import { createProductionWorkbook } from "@/utils/excel/productionExcel";
import { createRawMaterialStockWorkbook } from "@/utils/excel/rawMaterialStockExcel";
import { createSalesWorkbook } from "@/utils/excel/salesExcel";

export interface ReportExcelResult {
  workbook: unknown;
  fileName: string;
}

export const ReportExcelService = {
  createWorkbook(
    report: ReportData,
    filters: ReportFilters,
  ): ReportExcelResult {
    switch (report.type) {
      case "SALES":
        return createSalesWorkbook(report, filters);

      case "PRODUCTION":
        return createProductionWorkbook(report, filters);

      case "RAW_MATERIAL_STOCK":
        return createRawMaterialStockWorkbook(report, filters);

      case "FINISHED_STOCK":
        return createFinishedStockWorkbook(report, filters);

      default: {
        const exhaustiveCheck: never = report;
        throw new Error(
          `Type de rapport non supporté : ${String(exhaustiveCheck)}`,
        );
      }
    }
  },
};
