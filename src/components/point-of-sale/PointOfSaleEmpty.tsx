import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface PointOfSaleEmptyProps {
  onAdd: () => void;
}

export default function PointOfSaleEmpty({ onAdd }: PointOfSaleEmptyProps) {
  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* ICÔNE */}
      {/* ================================================== */}

      <View style={styles.iconWrapper}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="storefront-outline"
            size={42}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.plusBadge}>
          <Ionicons name="add" size={15} color={COLORS.white} />
        </View>
      </View>

      {/* ================================================== */}
      {/* TEXTE */}
      {/* ================================================== */}

      <Text style={styles.title}>Aucun point de vente</Text>

      <Text style={styles.description}>
        Créez votre premier point de vente pour commencer à organiser vos
        espaces de distribution et suivre leur activité.
      </Text>

      {/* ================================================== */}
      {/* ACTION */}
      {/* ================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onAdd}
      >
        <View style={styles.buttonIcon}>
          <Ionicons name="add" size={19} color={COLORS.white} />
        </View>

        <Text style={styles.buttonText}>Créer un point de vente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: COLORS.white,
  },

  iconWrapper: {
    position: "relative",
    marginBottom: 22,
  },

  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  plusBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: COLORS.text,
    textAlign: "center",
  },

  description: {
    maxWidth: 330,
    marginTop: 9,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.Gray,
    textAlign: "center",
  },

  button: {
    minHeight: 48,
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  buttonIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.white,
  },
});
