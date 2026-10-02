import { MaterialCommunityIcons } from "@expo/vector-icons";

import { StyleSheet, Text, View } from "react-native";

import type { EmployeeDashboard as EmployeeDashboardData } from "@/types/dashboard";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

import { CurrentOrderCard } from "./CurrentOrderCard";

import { DashboardStatCard } from "./DashboardStatCard";

import { NoPointOfSaleCard } from "./NoPointOfSaleCard";

import { RecentOrders } from "./RecentOrders";

interface EmployeeDashboardProps {
  dashboard: EmployeeDashboardData;

  currentOrder?: {
    itemCount: number;
    totalAmount?: number;
  } | null;

  onResumeOrder?: () => void;
}

export function EmployeeDashboard({
  dashboard,
  currentOrder,
  onResumeOrder,
}: EmployeeDashboardProps) {
  /**
   * Aucun PDV actif :
   * on n'affiche aucune statistique globale.
   */
  if (!dashboard.pointOfSale) {
    return (
      <View style={styles.container}>
        <NoPointOfSaleCard />
      </View>
    );
  }

  const handleResumeOrder = () => {
    if (onResumeOrder) {
      onResumeOrder();
      return;
    }
  };

  return (
    <View style={styles.container}>
      {/* PDV actuel */}
      <View style={styles.pointOfSaleCard}>
        <View style={styles.pointOfSaleIcon}>
          <MaterialCommunityIcons
            name="store-marker-outline"
            size={23}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.pointOfSaleContent}>
          <Text style={styles.pointOfSaleLabel}>Point de vente actuel</Text>

          <Text style={styles.pointOfSaleName} numberOfLines={1}>
            {dashboard.pointOfSale.name}
          </Text>
        </View>

        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{dashboard.pointOfSale.code}</Text>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsRow}>
        <DashboardStatCard
          icon="package-variant-closed"
          value={dashboard.stock.totalQuantity}
          label="Jus disponibles"
          iconColor={COLORS.primary}
        />

        <DashboardStatCard
          icon="receipt-text-outline"
          value={dashboard.orders.today}
          label="Commandes aujourd'hui"
          iconColor={COLORS.secondary}
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

      {/* 3 dernières commandes du PDV */}
      <RecentOrders orders={dashboard.orders.recent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },

  pointOfSaleCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  pointOfSaleIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3E8",
  },

  pointOfSaleContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },

  pointOfSaleLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small - 1,
    color: COLORS.Gray,
  },

  pointOfSaleName: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  codeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },

  codeText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.small - 1,
    color: COLORS.primary,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
});
