import { StyleSheet, Text, View } from "react-native";

import type { OrderCartItem } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";

interface OrderPreviewTotalsProps {
  items: OrderCartItem[];
  discountAmount: number;
}

export function OrderPreviewTotals({
  items,
  discountAmount,
}: OrderPreviewTotalsProps) {
  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  const total = Math.max(0, subtotal - discountAmount);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Total de la commande</Text>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.label}>Sous-total</Text>

          <Text style={styles.value}>
            {subtotal.toLocaleString("fr-FR")} CDF
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Remise</Text>

          <Text style={[styles.value, discountAmount > 0 && styles.discount]}>
            {discountAmount > 0
              ? `-${discountAmount.toLocaleString("fr-FR")}`
              : "0"}{" "}
            CDF
          </Text>
        </View>
      </View>

      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Total à payer</Text>

          <Text style={styles.totalHint}>Montant final</Text>
        </View>

        <Text style={styles.totalValue}>
          {total.toLocaleString("fr-FR")} CDF
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 17,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  rows: {
    marginTop: 8,
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

  discount: {
    color: COLORS.error,
  },

  totalRow: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  totalHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
});
