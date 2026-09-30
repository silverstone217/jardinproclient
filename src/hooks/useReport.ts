// src/hooks/useReport.ts

import { useReportStore } from "@/store/report.store";

export function useReport() {
  const report = useReportStore((state) => state.report);
  const filters = useReportStore((state) => state.filters);
  const isLoading = useReportStore((state) => state.isLoading);
  const error = useReportStore((state) => state.error);

  const generateReport = useReportStore((state) => state.generateReport);

  const setFilters = useReportStore((state) => state.setFilters);

  const clearReport = useReportStore((state) => state.clearReport);

  const clearError = useReportStore((state) => state.clearError);

  return {
    report,
    filters,
    isLoading,
    error,
    generateReport,
    setFilters,
    clearReport,
    clearError,
  };
}
