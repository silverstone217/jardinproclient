import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

export function NoPointOfSaleCard() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="store-alert-outline"
          size={28}
          color={COLORS.secondary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Aucun point de vente assigné</Text>

        <Text style={styles.description}>
          Vous n'avez pas encore de point de vente actif. Votre responsable doit
          vous assigner un PDV avant que vous puissiez enregistrer des ventes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E0",
  },

  content: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  description: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: 19,
    color: COLORS.Gray,
  },
});
