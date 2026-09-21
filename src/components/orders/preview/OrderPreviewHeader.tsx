import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

export function OrderPreviewHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="checkmark-done-outline"
          size={22}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.step}>ÉTAPE 4 SUR 4</Text>

        <Text style={styles.title}>Vérifier la commande</Text>

        <Text style={styles.subtitle}>
          Vérifiez les informations avant d'enregistrer définitivement la
          commande.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    borderWidth: 1,
    borderColor: "#DCEAD8",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  step: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: COLORS.primary,
  },

  title: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },
});
