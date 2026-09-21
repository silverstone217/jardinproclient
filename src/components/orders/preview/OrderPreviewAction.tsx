import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useOrderStore } from "@/store/order.store";
import { COLORS, fonts } from "@/utils/styles";

export function OrderPreviewAction() {
  const isValidating = useOrderStore((state) => state.isValidating);

  const error = useOrderStore((state) => state.error);

  const validateOrder = useOrderStore((state) => state.validateOrder);

  const handleValidate = async () => {
    if (isValidating) {
      return;
    }

    try {
      // Valider la commande et récupérer la réponse API
      const result = await validateOrder();

      // Récupérer l'ID de la facture
      // Hypothèse : l'API retourne { invoice: { id: "..." } }
      const invoiceId = result.invoice?.id;

      if (!invoiceId) {
        Alert.alert(
          "Commande enregistrée",
          "La commande a été validée, mais l'identifiant de la facture est introuvable.",
        );
        return;
      }

      // Redirection vers la facture
      router.replace({
        pathname: "/(main)/invoices/[invoiceId]",
        params: {
          invoiceId,
        },
      });
    } catch {
      // Le store gère déjà l'erreur
      // et conserve le brouillon si la validation échoue.
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.warning}>
        <Ionicons
          name="information-circle-outline"
          size={17}
          color={COLORS.info}
        />

        <Text style={styles.warningText}>
          Après validation, la commande sera enregistrée et le stock sera mis à
          jour.
        </Text>
      </View>

      {error && (
        <View style={styles.error}>
          <Ionicons
            name="alert-circle-outline"
            size={17}
            color={COLORS.error}
          />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isValidating && styles.buttonDisabled,
          pressed && !isValidating && styles.buttonPressed,
        ]}
        onPress={handleValidate}
        disabled={isValidating}
      >
        {isValidating ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color={COLORS.white}
          />
        )}

        <Text style={styles.buttonText}>
          {isValidating ? "Enregistrement..." : "Valider la commande"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#EEF6FF",
    borderWidth: 1,
    borderColor: "#D9EAFB",
  },

  warningText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#4D6B87",
  },

  error: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6D4D4",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  button: {
    marginTop: 12,
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.white,
  },
});
