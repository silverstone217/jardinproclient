import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "@/types/invoice";
import { COLORS, fonts } from "@/utils/styles";

interface InvoicePaymentInfoProps {
  invoice: Invoice;
}

const PAYMENT_METHOD_LABELS: Record<
  NonNullable<Invoice["paymentMethod"]>,
  string
> = {
  CASH: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte bancaire",
  OTHER: "Autre",
};

const PAYMENT_METHOD_ICONS: Record<
  NonNullable<Invoice["paymentMethod"]>,
  keyof typeof Ionicons.glyphMap
> = {
  CASH: "cash-outline",
  MOBILE_MONEY: "phone-portrait-outline",
  CARD: "card-outline",
  OTHER: "ellipsis-horizontal-circle-outline",
};

export function InvoicePaymentInfo({ invoice }: InvoicePaymentInfoProps) {
  const paymentMethod = invoice.paymentMethod;

  const label = paymentMethod
    ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod)
    : "Non renseigné";

  const icon = paymentMethod
    ? (PAYMENT_METHOD_ICONS[paymentMethod] ?? "help-circle-outline")
    : "help-circle-outline";

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={17} color={COLORS.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Moyen de paiement</Text>

        <Text style={styles.value}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 57,
    marginTop: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9F6",
    borderWidth: 1,
    borderColor: "#E7EAE4",
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  content: {
    flex: 1,
    marginLeft: 9,
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  value: {
    marginTop: 3,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },
});
