import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { EmployeeDashboard as EmployeeDashboardData } from "@/types/dashboard";
import { COLORS, fonts, fontSizes } from "@/utils/styles";

import { CurrentOrderCard } from "./CurrentOrderCard";
import { DashboardStatCard } from "./DashboardStatCard";
import { NoPointOfSaleCard } from "./NoPointOfSaleCard";

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
  const router = useRouter();

  /*
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

  const recentOrders = dashboard.orders.recent;

  const handleResumeOrder = () => {
    if (onResumeOrder) {
      onResumeOrder();
      return;
    }

    router.push("/(main)/orders");
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

      {/* Commandes récentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Mes dernières commandes</Text>
            <Text style={styles.sectionSubtitle}>
              Les ventes de votre point de vente
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
              Les nouvelles ventes de ce PDV apparaîtront ici.
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((order, index) => (
              <View
                key={order.id}
                style={[
                  styles.orderItem,
                  index < recentOrders.length - 1 && styles.orderItemSeparator,
                ]}
              >
                <View style={styles.orderIcon}>
                  <MaterialCommunityIcons
                    name="receipt-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.orderContent}>
                  <Text style={styles.orderTitle}>Commande</Text>

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

  section: {
    marginTop: 2,
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

  orderTitle: {
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
    fontSize: fontSizes.small,
    color: COLORS.Gray,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.65,
  },
});
