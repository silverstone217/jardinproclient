import { api } from "@/utils/api";

import type { Dashboard } from "@/types/dashboard";

export async function getDashboard(): Promise<Dashboard> {
  const response = await api.get<{
    success: boolean;
    dashboard: Dashboard;
  }>("/dashboard");

  return response.data.dashboard;
}
