import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ManagerDashboard as ManagerDashboardData } from "@/types/dashboard";
import { COLORS, fonts, fontSizes } from "@/utils/styles";

import { DashboardStatCard } from "./DashboardStatCard";

interface ManagerDashboardProps {
  dashboard: ManagerDashboardData;
}

export function ManagerDashboard({ dashboard }: ManagerDashboardProps) {
  const router = useRouter();

  const recentOrders = dashboard.orders.recent;

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

      {/* Commandes récentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            <Text style={styles.sectionSubtitle}>
              Les dernières ventes enregistrées
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.seeMoreButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/(main)/invoices")}
          >
            <Text style={styles.seeMoreText}>Voir plus</Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={COLORS.primary}
            />
          </Pressable>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={24}
                color={COLORS.Gray}
              />
            </View>

            <Text style={styles.emptyTitle}>Aucune commande récente</Text>

            <Text style={styles.emptyText}>
              Les nouvelles commandes apparaîtront ici.
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((order) => (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderIcon}>
                  <MaterialCommunityIcons
                    name="receipt-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.orderContent}>
                  <Text style={styles.orderLocation} numberOfLines={1}>
                    {order.pointOfSaleName}
                  </Text>

                  <Text style={styles.orderDate}>
                    {formatOrderDate(order.createdAt)}
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={21}
                  color={COLORS.Gray}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function formatOrderDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

  section: {
    marginTop: 10,
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small - 1,
    color: COLORS.Gray,
  },

  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    paddingLeft: 8,
  },

  seeMoreText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.small - 1,
    color: COLORS.primary,
  },

  ordersList: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    overflow: "hidden",
  },

  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  orderItemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3E8",
  },

  orderContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  orderLocation: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.small,
    color: COLORS.text,
  },

  orderDate: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small - 1,
    color: COLORS.Gray,
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  emptyTitle: {
    marginTop: 10,
    fontFamily: fonts.bold,
    fontSize: fontSizes.small,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small - 1,
    color: COLORS.Gray,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.65,
  },
});
