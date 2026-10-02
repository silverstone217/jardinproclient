import { StyleSheet, View } from "react-native";

import type { ManagerDashboard as ManagerDashboardData } from "@/types/dashboard";

import { COLORS } from "@/utils/styles";

import { CurrentOrderCard } from "./CurrentOrderCard";
import { DashboardStatCard } from "./DashboardStatCard";
import { RecentOrders } from "./RecentOrders";

interface ManagerDashboardProps {
  dashboard: ManagerDashboardData;

  currentOrder?: {
    itemCount: number;
    totalAmount?: number;
  } | null;

  onResumeOrder?: () => void;
}

export function ManagerDashboard({
  dashboard,
  currentOrder,
  onResumeOrder,
}: ManagerDashboardProps) {
  const handleResumeOrder = () => {
    if (onResumeOrder) {
      onResumeOrder();
    }
  };

  return (
    <View style={styles.container}>
      {/* Statistiques */}
      <View style={styles.statsRow}>
        <DashboardStatCard
          icon="package-variant-closed"
          value={dashboard.stock.main.totalQuantity}
          label="Jus en stock"
          iconColor={COLORS.primary}
        />

        <DashboardStatCard
          icon="account-group-outline"
          value={dashboard.employees.total}
          label="Employés actifs"
          iconColor={COLORS.secondary}
        />
      </View>

      <View style={styles.statsRow}>
        <DashboardStatCard
          icon="store-marker-outline"
          value={dashboard.pointOfSales.total}
          label="Points de vente"
          iconColor={COLORS.tertiary}
        />

        <DashboardStatCard
          icon="receipt-text-outline"
          value={dashboard.orders.today}
          label="Commandes aujourd'hui"
          iconColor="#4A90E2"
        />
      </View>

      {/* Commande en cours */}
      {currentOrder && (
        <CurrentOrderCard
          itemCount={currentOrder.itemCount}
          totalAmount={currentOrder.totalAmount}
          onPress={handleResumeOrder}
        />
      )}

      {/* 3 dernières commandes du POS du manager */}
      <RecentOrders orders={dashboard.orders.recent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
});
