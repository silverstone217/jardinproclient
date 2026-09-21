import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { OrderCustomer } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";

interface OrderPreviewCustomerProps {
  customer: OrderCustomer | null;
}

export function OrderPreviewCustomer({ customer }: OrderPreviewCustomerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-outline"
            size={18}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Client</Text>

          <Text style={styles.subtitle}>
            Informations associées à cette commande
          </Text>
        </View>
      </View>

      {customer ? (
        <View style={styles.customer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(
                customer.name?.charAt(0) || customer.phone.charAt(0)
              ).toUpperCase()}
            </Text>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.name}>{customer.name || "Client"}</Text>

            <Text style={styles.phone}>{customer.phone}</Text>
          </View>

          <View style={styles.points}>
            <Text style={styles.pointsValue}>{customer.loyaltyPoints}</Text>

            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noCustomer}>
          <MaterialCommunityIcons
            name="account-off-outline"
            size={18}
            color={COLORS.Gray}
          />

          <Text style={styles.noCustomerText}>Aucun client associé</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  customer: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.primary,
  },

  customerInfo: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  phone: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  points: {
    alignItems: "flex-end",
  },

  pointsValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  pointsLabel: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  noCustomer: {
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: "#F7F7F5",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  noCustomerText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },
});
