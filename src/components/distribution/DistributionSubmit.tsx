import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useDistributionStore } from "@/store/distribution.store";
import { COLORS, fonts } from "@/utils/styles";

export function DistributionSubmit() {
  const {
    fromSelected,
    toSelected,
    selectedProducts,
    isSubmitting,
    error,
    createDistribution,
    clearError,
  } = useDistributionStore();

  const totalQuantity = selectedProducts.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  const canSubmit =
    fromSelected &&
    toSelected &&
    selectedProducts.length > 0 &&
    totalQuantity > 0 &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!fromSelected || !toSelected) {
      Alert.alert(
        "Distribution incomplète",
        "Veuillez sélectionner un point de départ et un point d'arrivée.",
      );

      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert("Aucun produit", "Ajoutez au moins un produit à distribuer.");

      return;
    }

    clearError();

    try {
      await createDistribution();

      Alert.alert(
        "Distribution effectuée",
        `${totalQuantity} unité${totalQuantity > 1 ? "s" : ""} ${
          totalQuantity > 1 ? "ont été distribuées" : "a été distribuée"
        } avec succès.`,
      );
    } catch (error) {
      console.error("Erreur soumission distribution :", error);

      if (error instanceof Error) {
        if (error.message === "POINTS_NOT_SELECTED") {
          Alert.alert(
            "Route incomplète",
            "Veuillez sélectionner le point de départ et le point d'arrivée.",
          );

          return;
        }

        if (error.message === "SAME_POINT_OF_SALE") {
          Alert.alert(
            "Route invalide",
            "Le point de départ et le point d'arrivée doivent être différents.",
          );

          return;
        }

        if (error.message === "NO_PRODUCTS_SELECTED") {
          Alert.alert(
            "Aucun produit",
            "Ajoutez au moins un produit à distribuer.",
          );

          return;
        }
      }

      Alert.alert(
        "Distribution impossible",
        "Impossible d'effectuer la distribution. Vérifiez le stock disponible puis réessayez.",
      );
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={COLORS.error}
            />
          </View>

          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={clearError} hitSlop={8}>
            <Ionicons name="close" size={17} color={COLORS.Gray} />
          </Pressable>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.infoText}>
          Le stock sera mis à jour automatiquement après la confirmation.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canSubmit && styles.buttonDisabled,
          pressed && canSubmit && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons
            name="swap-horizontal-outline"
            size={20}
            color={canSubmit ? COLORS.white : COLORS.Gray}
          />
        )}

        <View style={styles.buttonContent}>
          <Text
            style={[
              styles.buttonTitle,
              !canSubmit && styles.buttonTitleDisabled,
            ]}
          >
            {isSubmitting
              ? "Distribution en cours..."
              : "Confirmer la distribution"}
          </Text>

          {!isSubmitting && totalQuantity > 0 && (
            <Text
              style={[
                styles.buttonSubtitle,
                !canSubmit && styles.buttonSubtitleDisabled,
              ]}
            >
              {totalQuantity} unité
              {totalQuantity > 1 ? "s" : ""} sélectionnée
              {totalQuantity > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {!isSubmitting && canSubmit && (
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 30,
  },

  errorBanner: {
    minHeight: 46,
    marginBottom: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F6D4D4",
    backgroundColor: "#FDECEC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FADADA",
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  infoRow: {
    minHeight: 42,
    marginBottom: 10,
    paddingHorizontal: 11,
    borderRadius: 13,
    backgroundColor: "#F3F7F1",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3EEE0",
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.darkGray,
  },

  button: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
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

  buttonContent: {
    flex: 1,
    alignItems: "flex-start",
  },

  buttonTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.white,
  },

  buttonTitleDisabled: {
    color: COLORS.Gray,
  },

  buttonSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: "rgba(255,255,255,0.78)",
  },

  buttonSubtitleDisabled: {
    color: COLORS.Gray,
  },
});
