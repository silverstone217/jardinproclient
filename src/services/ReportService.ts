// src/services/ReportService.ts

import axios from "axios";

import type {
  ReportData,
  ReportFilters,
  ReportPointOfSale,
  ReportPointOfSalesResponse,
  ReportResponse,
} from "@/types/report";

import { api } from "@/utils/api";

// ============================================================
// QUERY
// ============================================================

function buildReportQuery(filters: ReportFilters): string {
  const params = new URLSearchParams();

  params.set("type", filters.type);

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  /**
   * allPointOfSales est uniquement utilisé par l'interface.
   *
   * Lorsqu'il vaut true, aucun pointOfSaleId n'est envoyé.
   * Le serveur interprète l'absence de pointOfSaleId comme
   * "tous les POS".
   */
  if (filters.pointOfSaleId) {
    params.set("pointOfSaleId", filters.pointOfSaleId);
  }

  return params.toString();
}

// ============================================================
// ERROR MESSAGE
// ============================================================

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

// ============================================================
// REPORT SERVICE
// ============================================================

export const ReportService = {
  // ============================================================
  // GENERATE REPORT
  // ============================================================

  async generate(filters: ReportFilters): Promise<ReportData> {
    try {
      const query = buildReportQuery(filters);

      const response = await api.get<ReportResponse>(`/report?${query}`);

      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du rapport :", error);

      throw new Error(
        getApiErrorMessage(error, "Impossible de générer le rapport."),
      );
    }
  },

  // ============================================================
  // GET POINTS OF SALE
  // ============================================================

  async getPointOfSales(): Promise<ReportPointOfSale[]> {
    try {
      const response = await api.get<ReportPointOfSalesResponse>(
        "/report/point-of-sales",
      );

      return response.data.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des points de vente :",
        error,
      );

      throw new Error(
        getApiErrorMessage(
          error,
          "Impossible de récupérer les points de vente.",
        ),
      );
    }
  },
};
