import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DashboardRecentOrder } from "@/types/dashboard";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

type RecentOrdersProps = {
  orders: DashboardRecentOrder[];
};

function formatOrderDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const router = useRouter();

  const recentOrders = orders.slice(0, 3);

  const handleOrderPress = (invoiceId: string) => {
    router.push(`/(main)/invoices/${invoiceId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Dernières commandes</Text>

          <Text style={styles.subtitle}>Les 3 dernières ventes</Text>
        </View>
      </View>

      {recentOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="bottle-soda-outline"
              size={24}
              color={COLORS.Gray}
            />
          </View>

          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>Aucune commande récente</Text>

            <Text style={styles.emptyText}>
              Les dernières ventes apparaîtront ici.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {recentOrders.map((order, index) => (
            <Pressable
              key={order.id}
              onPress={() => handleOrderPress(order.id)}
              style={({ pressed }) => [
                styles.orderItem,
                index < recentOrders.length - 1 && styles.orderItemBorder,
                pressed && styles.orderItemPressed,
              ]}
            >
              <View style={styles.orderIcon}>
                <MaterialCommunityIcons
                  name="bottle-soda-outline"
                  size={23}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.orderContent}>
                <Text style={styles.orderNumber}>#{order.id.slice(0, 8)}</Text>

                <Text style={styles.orderDate}>
                  {formatOrderDate(order.createdAt)}
                </Text>
              </View>

              <View style={styles.orderButton}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={COLORS.Gray}
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.large,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
  },

  ordersList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
  },

  orderItem: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },

  orderItemPressed: {
    opacity: 0.7,
  },

  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5EC",
    marginRight: 12,
  },

  orderContent: {
    flex: 1,
    justifyContent: "center",
  },

  orderNumber: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  orderDate: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
  },

  orderButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  emptyContainer: {
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    marginRight: 12,
  },

  emptyContent: {
    flex: 1,
  },

  emptyTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
  },
});
