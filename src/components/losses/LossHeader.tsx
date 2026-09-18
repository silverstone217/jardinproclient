import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

export function LossHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>STOCK</Text>

        <Text style={styles.title}>Pertes</Text>

        <Text style={styles.subtitle}>
          Enregistrez et suivez les produits et matières perdus.
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={22} color={COLORS.error} />
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
    color: COLORS.error,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxlarge,
    lineHeight: fontSizes.xxlarge * 1.15,
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
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6D4D4",
  },
});
