import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Invoice } from "@/types/invoice";

import { COLORS, fonts } from "@/utils/styles";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: (invoice: Invoice) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const itemCount = invoice.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const customerName = invoice.customer.name?.trim();

  return (
    <Pressable
      onPress={() => onPress(invoice)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <View style={styles.icon}>
          <Ionicons name="receipt-outline" size={17} color={COLORS.primary} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.invoiceNumber} numberOfLines={1}>
              #{invoice.invoiceNumber}
            </Text>

            <Text style={styles.amount} numberOfLines={1}>
              {formatAmount(invoice.totalAmount)} {invoice.currency}
            </Text>
          </View>

          <Text style={styles.date} numberOfLines={1}>
            {formatDate(invoice.createdAt)}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.customer} numberOfLines={1}>
              {customerName || "Client de passage"}
            </Text>

            <View style={styles.itemInfo}>
              <Ionicons name="basket-outline" size={12} color={COLORS.Gray} />

              <Text style={styles.itemCount}>
                {itemCount} {itemCount > 1 ? "articles" : "article"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={17} color={COLORS.Gray} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EAEAE6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  content: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  invoiceNumber: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  amount: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  date: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  bottomRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  customer: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  itemCount: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  pressed: {
    opacity: 0.6,
  },
});
