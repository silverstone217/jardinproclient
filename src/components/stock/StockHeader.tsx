import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

export function StockHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>INVENTAIRE</Text>

        <Text style={styles.title}>Stock</Text>

        <Text style={styles.subtitle}>
          Consultez les quantités disponibles dans vos différents emplacements.
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <Ionicons name="cube-outline" size={22} color={COLORS.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  content: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    marginBottom: 3,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: COLORS.primary,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.Gray,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },
});
