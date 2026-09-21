import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "@/types/invoice";
import { COLORS, fonts } from "@/utils/styles";

interface InvoiceTotalsProps {
  invoice: Invoice;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

function formatMoney(amount: number, currency: Invoice["currency"]): string {
  return `${formatAmount(amount)} ${currency}`;
}

export function InvoiceTotals({ invoice }: InvoiceTotalsProps) {
  const hasDiscount = invoice.discountAmount > 0;

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* BREAKDOWN                                          */}
      {/* ================================================== */}

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.label}>Sous-total</Text>

          <Text style={styles.value}>
            {formatMoney(invoice.subtotal, invoice.currency)}
          </Text>
        </View>

        {hasDiscount && (
          <View style={styles.row}>
            <View style={styles.discountLabel}>
              <Ionicons
                name="pricetag-outline"
                size={13}
                color={COLORS.secondary}
              />

              <Text style={styles.discountText}>Remise</Text>
            </View>

            <Text style={styles.discountValue}>
              - {formatMoney(invoice.discountAmount, invoice.currency)}
            </Text>
          </View>
        )}
      </View>

      {/* ================================================== */}
      {/* TOTAL                                              */}
      {/* ================================================== */}

      <View style={styles.totalCard}>
        <View style={styles.totalLabelContainer}>
          <View style={styles.totalIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={17}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.totalLabel}>Total</Text>
        </View>

        <Text style={styles.totalValue}>
          {formatMoney(invoice.totalAmount, invoice.currency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#ECEDE9",
  },

  rows: {
    gap: 9,
  },

  row: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  value: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.text,
  },

  discountLabel: {
    flexDirection: "row",
    alignItems: "center",
  },

  discountText: {
    marginLeft: 5,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.secondary,
  },

  discountValue: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.secondary,
  },

  totalCard: {
    minHeight: 58,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EAF2E7",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  totalLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  totalIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  totalLabel: {
    marginLeft: 8,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
});
