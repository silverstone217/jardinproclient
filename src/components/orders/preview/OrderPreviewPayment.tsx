import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { OrderPaymentMethod } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";

interface OrderPreviewPaymentProps {
  paymentMethod: OrderPaymentMethod;
}

const PAYMENT_LABELS: Record<OrderPaymentMethod, string> = {
  CASH: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte bancaire",
  OTHER: "Autre",
};

const PAYMENT_ICONS: Record<
  OrderPaymentMethod,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  CASH: "cash",
  MOBILE_MONEY: "cellphone",
  CARD: "credit-card-outline",
  OTHER: "dots-horizontal-circle-outline",
};

export function OrderPreviewPayment({
  paymentMethod,
}: OrderPreviewPaymentProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={PAYMENT_ICONS[paymentMethod]}
          size={18}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Mode de paiement</Text>

        <Text style={styles.value}>{PAYMENT_LABELS[paymentMethod]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  content: {
    marginLeft: 10,
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  value: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },
});
