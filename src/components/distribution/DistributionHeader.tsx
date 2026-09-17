import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

export function DistributionHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name="swap-horizontal-outline"
          size={21}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Distribution</Text>

        <Text style={styles.subtitle}>
          Déplacez vos produits finis entre la boutique et les points de vente.
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

  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
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
