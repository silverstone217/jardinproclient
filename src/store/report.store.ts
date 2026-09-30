// src/stores/report.store.ts

import { create } from "zustand";
import type { ReportFilters, ReportStore } from "@/types/report";
import { ReportService } from "@/services/ReportService";

// ============================================================
// DEFAULT FILTERS
// ============================================================

const DEFAULT_FILTERS: ReportFilters = {
  type: "SALES",
  allPointOfSales: true,
};

// ============================================================
// STORE
// ============================================================

export const useReportStore = create<ReportStore>((set) => ({
  // ============================================================
  // DATA
  // ============================================================

  report: null,

  // ============================================================
  // FILTERS
  // ============================================================

  filters: DEFAULT_FILTERS,

  // ============================================================
  // STATE
  // ============================================================

  isLoading: false,

  error: null,

  // ============================================================
  // GENERATE REPORT
  // ============================================================

  generateReport: async (filters) => {
    set({
      isLoading: true,
      error: null,
      filters,
    });

    try {
      const report = await ReportService.generate(filters);

      set({
        report,
        filters,
        isLoading: false,
        error: null,
      });

      return report;
    } catch (error) {
      console.error("Erreur génération rapport :", error);

      const message =
        error instanceof Error
          ? error.message
          : "Impossible de générer le rapport.";

      set({
        isLoading: false,
        error: message,
      });

      throw new Error(message);
    }
  },

  // ============================================================
  // SET FILTERS
  // ============================================================

  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  // ============================================================
  // CLEAR REPORT
  // ============================================================

  clearReport: () => {
    set({
      report: null,
      error: null,
    });
  },

  // ============================================================
  // CLEAR ERROR
  // ============================================================

  clearError: () => {
    set({
      error: null,
    });
  },
}));
