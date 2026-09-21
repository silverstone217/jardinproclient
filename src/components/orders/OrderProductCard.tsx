import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { OrderProduct } from "@/types/order";
import { COLORS, fonts } from "@/utils/styles";

interface OrderProductCardProps {
  product: OrderProduct;
  quantity: number;

  onAdd: () => void;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function OrderProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
  onUpdateQuantity,
}: OrderProductCardProps) {
  const isSelected = quantity > 0;
  const isOutOfStock = product.quantity <= 0;
  const maxQuantity = product.quantity;

  const handleIncrease = () => {
    if (quantity >= maxQuantity) {
      return;
    }

    onAdd();
  };

  const handleDecrease = () => {
    if (quantity <= 0) {
      return;
    }

    if (quantity === 1) {
      onRemove();
      return;
    }

    onUpdateQuantity(quantity - 1);
  };

  return (
    <View
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isOutOfStock && styles.cardDisabled,
      ]}
    >
      {/* ================================================== */}
      {/* IMAGE                                               */}
      {/* ================================================== */}

      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="water-outline" size={28} color={COLORS.primary} />
          </View>
        )}

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={12} color={COLORS.white} />
          </View>
        )}
      </View>

      {/* ================================================== */}
      {/* INFORMATIONS                                       */}
      {/* ================================================== */}

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        <Text style={styles.packagingName} numberOfLines={1}>
          {product.packaging.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeText}>
              {product.packaging.capacityMl} ml
            </Text>
          </View>

          <Text style={styles.sku}>{product.sku}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            {product.price.toLocaleString("fr-FR")} CDF
          </Text>

          <View
            style={[styles.stockBadge, isOutOfStock && styles.stockBadgeEmpty]}
          >
            <View
              style={[styles.stockDot, isOutOfStock && styles.stockDotEmpty]}
            />

            <Text
              style={[styles.stockText, isOutOfStock && styles.stockTextEmpty]}
            >
              {isOutOfStock
                ? "Rupture"
                : `${product.quantity} disponible${
                    product.quantity > 1 ? "s" : ""
                  }`}
            </Text>
          </View>
        </View>
      </View>

      {/* ================================================== */}
      {/* QUANTITY                                           */}
      {/* ================================================== */}

      <View style={styles.quantityContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            quantity <= 0 && styles.quantityButtonDisabled,
            pressed && quantity > 0 && styles.pressed,
          ]}
          onPress={handleDecrease}
          disabled={quantity <= 0}
          hitSlop={4}
        >
          <Ionicons
            name="remove"
            size={16}
            color={quantity <= 0 ? COLORS.Gray : COLORS.primary}
          />
        </Pressable>

        <View style={styles.quantityValue}>
          <Text style={styles.quantityText}>{quantity}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            (quantity >= maxQuantity || isOutOfStock) &&
              styles.quantityButtonDisabled,
            pressed &&
              quantity < maxQuantity &&
              !isOutOfStock &&
              styles.pressed,
          ]}
          onPress={handleIncrease}
          disabled={quantity >= maxQuantity || isOutOfStock}
          hitSlop={4}
        >
          <Ionicons
            name="add"
            size={16}
            color={
              quantity >= maxQuantity || isOutOfStock
                ? COLORS.Gray
                : COLORS.primary
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 108,
    padding: 11,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
  },

  cardSelected: {
    borderColor: "#C9DEC4",
    backgroundColor: "#FCFEFB",
  },

  cardDisabled: {
    opacity: 0.65,
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageContainer: {
    width: 76,
    height: 86,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#EDF4EB",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  selectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  content: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  productName: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  packagingName: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  sizeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#F1F5EF",
  },

  sizeText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.primary,
  },

  sku: {
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },

  price: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: COLORS.primary,
  },

  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  stockBadgeEmpty: {
    opacity: 0.9,
  },

  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
    backgroundColor: "#5A9B4F",
  },

  stockDotEmpty: {
    backgroundColor: COLORS.error,
  },

  stockText: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: "#5A7F53",
  },

  stockTextEmpty: {
    color: COLORS.error,
  },

  // ==========================================================
  // QUANTITY
  // ==========================================================

  quantityContainer: {
    width: 38,
    minHeight: 86,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F6F8F4",
  },

  quantityButton: {
    width: 30,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E1E8DE",
  },

  quantityButtonDisabled: {
    backgroundColor: "#F0F0EE",
    borderColor: "#E8E8E5",
  },

  quantityValue: {
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.text,
  },

  pressed: {
    opacity: 0.55,
  },
});
