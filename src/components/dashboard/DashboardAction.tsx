import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

export function DashboardAction() {
  const router = useRouter();

  const handleCreateOrder = () => {
    router.push("/(main)/orders");
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={handleCreateOrder}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="cart-plus"
          size={25}
          color={COLORS.white}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Nouvelle commande</Text>
        <Text style={styles.subtitle}>Enregistrer une nouvelle vente</Text>
      </View>

      <View style={styles.arrowContainer}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={25}
          color={COLORS.primary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  content: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    color: COLORS.white,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: "rgba(255,255,255,0.78)",
  },

  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
