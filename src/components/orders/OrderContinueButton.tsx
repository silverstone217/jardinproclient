import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface OrderContinueButtonProps {
  itemCount: number;
  totalAmount: number;

  disabled?: boolean;
  isLoading?: boolean;

  onPress: () => void;
}

export function OrderContinueButton({
  itemCount,
  totalAmount,
  disabled = false,
  isLoading = false,
  onPress,
}: OrderContinueButtonProps) {
  const isDisabled = disabled || isLoading || itemCount <= 0;

  const formattedTotal = totalAmount.toLocaleString("fr-FR");

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* SUMMARY                                           */}
      {/* ================================================== */}

      <View style={styles.summary}>
        <View style={styles.summaryLeft}>
          <View style={styles.cartIcon}>
            <Ionicons name="cart-outline" size={18} color={COLORS.primary} />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.itemCount}>
              {itemCount} article
              {itemCount > 1 ? "s" : ""}
            </Text>

            <Text style={styles.summaryLabel}>Dans votre commande</Text>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>

          <Text style={styles.totalAmount}>{formattedTotal} CDF</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* BUTTON                                             */}
      {/* ================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.buttonDisabled,
          pressed && !isDisabled && styles.buttonPressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons
            name="arrow-forward-circle-outline"
            size={21}
            color={isDisabled ? COLORS.Gray : COLORS.white}
          />
        )}

        <Text
          style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}
        >
          {isLoading ? "Préparation..." : "Continuer"}
        </Text>
      </Pressable>

      {/* ================================================== */}
      {/* HELPER                                             */}
      {/* ================================================== */}

      {itemCount === 0 && !isLoading && (
        <Text style={styles.helperText}>
          Ajoutez au moins un produit pour continuer.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  summaryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  cartIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  summaryText: {
    marginLeft: 9,
  },

  itemCount: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  summaryLabel: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  totalContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  totalLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  totalAmount: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.primary,
  },

  // ==========================================================
  // BUTTON
  // ==========================================================

  button: {
    minHeight: 52,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
  },

  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.white,
  },

  buttonTextDisabled: {
    color: COLORS.Gray,
  },

  // ==========================================================
  // HELPER
  // ==========================================================

  helperText: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
