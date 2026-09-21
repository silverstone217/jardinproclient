import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { GetOrderLoyaltyResponse } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";

interface OrderPreviewLoyaltyProps {
  loyalty: GetOrderLoyaltyResponse | null;
  pointsUsed: number;
}

export function OrderPreviewLoyalty({
  loyalty,
  pointsUsed,
}: OrderPreviewLoyaltyProps) {
  if (!loyalty) {
    return null;
  }

  const discountAmount = pointsUsed > 0 ? loyalty.redemption.discountAmount : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="star-outline"
            size={18}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Fidélité</Text>

          <Text style={styles.subtitle}>
            Résumé des points de cette commande
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.label}>Points actuels</Text>

          <Text style={styles.value}>{loyalty.customer.currentPoints}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Points gagnés</Text>

          <Text style={[styles.value, styles.earned]}>
            +{loyalty.earning.pointsEarned}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Points utilisés</Text>

          <Text style={styles.value}>{pointsUsed}</Text>
        </View>

        {pointsUsed > 0 && (
          <View style={styles.discountRow}>
            <Text style={styles.discountLabel}>Remise fidélité</Text>

            <Text style={styles.discountValue}>
              -{discountAmount.toLocaleString("fr-FR")} CDF
            </Text>
          </View>
        )}
      </View>
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
    backgroundColor: "#FFF4DF",
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

  rows: {
    marginTop: 13,
  },

  row: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2EF",
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  value: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  earned: {
    color: COLORS.success,
  },

  discountRow: {
    marginTop: 10,
    paddingHorizontal: 11,
    minHeight: 38,
    borderRadius: 11,
    backgroundColor: "#FFF8EA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  discountLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: "#8A6412",
  },

  discountValue: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: "#8A6412",
  },
});
