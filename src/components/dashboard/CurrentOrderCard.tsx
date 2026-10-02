import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface CurrentOrderCardProps {
  itemCount: number;
  totalAmount?: number;
  onPress: () => void;
}

export function CurrentOrderCard({
  itemCount,
  totalAmount,
  onPress,
}: CurrentOrderCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="cart-outline"
            size={23}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Commande en cours</Text>
          <Text style={styles.subtitle}>
            Votre commande n'est pas encore terminée
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="package-variant"
            size={18}
            color={COLORS.Gray}
          />

          <Text style={styles.infoText}>
            {itemCount} {itemCount > 1 ? "articles" : "article"}
          </Text>
        </View>

        {totalAmount !== undefined && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="cash" size={18} color={COLORS.Gray} />

            <Text style={styles.infoText}>
              {totalAmount.toLocaleString("fr-FR")} CDF
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>Reprendre la commande</Text>

        <MaterialCommunityIcons
          name="arrow-right"
          size={19}
          color={COLORS.white}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E0",
  },

  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small - 1,
    color: COLORS.Gray,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  infoText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small - 1,
    color: COLORS.text,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },

  buttonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.small,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.82,
  },
});
