import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface OrderProductsHeaderProps {
  productCount: number;
}

export function OrderProductsHeader({
  productCount,
}: OrderProductsHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconContainer}>
          <Ionicons name="wine-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.titleContent}>
          <Text style={styles.title}>Produits disponibles</Text>

          <Text style={styles.subtitle}>
            Sélectionnez les jus à ajouter à votre commande.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.count}>{productCount}</Text>

          <Text style={styles.countLabel}>
            {productCount === 1 ? "produit" : "produits"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 12,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4E5",
  },

  titleContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  countBadge: {
    minWidth: 48,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7F2",
  },

  count: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 15,
    color: COLORS.primary,
  },

  countLabel: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: COLORS.Gray,
  },
});
