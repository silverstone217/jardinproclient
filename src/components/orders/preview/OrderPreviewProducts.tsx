import { StyleSheet, Text, View } from "react-native";

import type { OrderCartItem } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";

interface OrderPreviewProductsProps {
  items: OrderCartItem[];
}

export function OrderPreviewProducts({ items }: OrderPreviewProductsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Produits</Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => {
          const subtotal = item.unitPrice * item.quantity;

          return (
            <View
              key={item.variantId}
              style={[
                styles.item,
                index === items.length - 1 && styles.lastItem,
              ]}
            >
              <View style={styles.itemMain}>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <Text style={styles.productMeta}>
                    {item.packaging.name}
                    {" · "}
                    {item.unitPrice.toLocaleString("fr-FR")} CDF / unité
                  </Text>
                </View>
              </View>

              <Text style={styles.subtotal}>
                {subtotal.toLocaleString("fr-FR")} CDF
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  countBadge: {
    minWidth: 25,
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  countText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
  },

  list: {
    marginTop: 2,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  lastItem: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },

  itemMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  quantityBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F6F1",
  },

  quantityText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  itemInfo: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },

  productName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  productMeta: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  subtotal: {
    marginLeft: 10,
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.text,
  },
});
