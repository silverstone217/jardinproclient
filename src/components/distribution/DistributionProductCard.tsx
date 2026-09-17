import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { DistributionProduct } from "@/types/distribution";

import { COLORS, fonts } from "@/utils/styles";

interface DistributionProductCardProps {
  product: DistributionProduct;
  onAdd: () => void;
}

export function DistributionProductCard({
  product,
  onAdd,
}: DistributionProductCardProps) {
  const isAvailable = product.quantity > 0;

  const imageUri = product.productImage;

  return (
    <View style={[styles.card, !isAvailable && styles.cardUnavailable]}>
      {/* ====================================================== */}
      {/* IMAGE                                                   */}
      {/* ====================================================== */}

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{
              uri: imageUri,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="water-outline" size={24} color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* ====================================================== */}
      {/* INFORMATIONS                                            */}
      {/* ====================================================== */}

      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.productName}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="barcode-outline" size={12} color={COLORS.Gray} />

            <Text style={styles.metaText} numberOfLines={1}>
              {product.sku}
            </Text>
          </View>

          <View style={styles.meta}>
            <Ionicons name="cube-outline" size={12} color={COLORS.Gray} />

            <Text style={styles.metaText} numberOfLines={1}>
              {product.packagingName}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.stockInfo}>
            <View
              style={[
                styles.stockDot,
                isAvailable ? styles.stockDotAvailable : styles.stockDotEmpty,
              ]}
            />

            <Text
              style={[styles.stockText, !isAvailable && styles.stockTextEmpty]}
            >
              {isAvailable
                ? `${product.quantity} disponible${
                    product.quantity > 1 ? "s" : ""
                  }`
                : "Rupture de stock"}
            </Text>
          </View>

          <Text style={styles.capacity}>{product.capacityMl} ml</Text>
        </View>
      </View>

      {/* ====================================================== */}
      {/* AJOUTER                                                 */}
      {/* ====================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          !isAvailable && styles.addButtonDisabled,
          pressed && isAvailable && styles.addButtonPressed,
        ]}
        onPress={onAdd}
        disabled={!isAvailable}
        hitSlop={4}
      >
        <Ionicons
          name="add"
          size={20}
          color={isAvailable ? COLORS.white : COLORS.Gray}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    marginBottom: 9,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FCFCFA",
    flexDirection: "row",
    alignItems: "center",
  },

  cardUnavailable: {
    opacity: 0.62,
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EAF2E7",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
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

  productName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  metaRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  meta: {
    maxWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    marginLeft: 4,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  bottomRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  stockDotAvailable: {
    backgroundColor: COLORS.success,
  },

  stockDotEmpty: {
    backgroundColor: COLORS.error,
  },

  stockText: {
    marginLeft: 5,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.success,
  },

  stockTextEmpty: {
    color: COLORS.error,
  },

  capacity: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // ADD BUTTON
  // ==========================================================

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  addButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  addButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});
