import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

import type { CustomerPointOfSale } from "@/types/customer";

interface CustomerStatsProps {
  totalCustomers: number;
  pointOfSale: CustomerPointOfSale | null;
  isSearching?: boolean;
}

export function CustomerStats({
  totalCustomers,
  pointOfSale,
  isSearching = false,
}: CustomerStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="people-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.content}>
          <Text style={styles.value}>{totalCustomers}</Text>

          <Text style={styles.label}>
            {isSearching ? "Résultat(s)" : "Client(s)"}
          </Text>
        </View>
      </View>

      {pointOfSale && (
        <View style={styles.posCard}>
          <View style={styles.posIcon}>
            <Ionicons
              name="storefront-outline"
              size={17}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.posContent}>
            <Text style={styles.posName} numberOfLines={1}>
              {pointOfSale.name}
            </Text>

            <Text style={styles.posCode}>{pointOfSale.code}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 14,
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 70,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F1FB",
  },

  content: {
    flex: 1,
    marginLeft: 9,
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
  },

  label: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  posCard: {
    flex: 1,
    minHeight: 70,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F9F3",
    borderWidth: 1,
    borderColor: "#E0EBDD",
  },

  posIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  posContent: {
    flex: 1,
    marginLeft: 9,
  },

  posName: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  posCode: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.primary,
  },
});
