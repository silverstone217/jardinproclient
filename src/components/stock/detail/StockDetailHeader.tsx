import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface StockDetailHeaderProps {
  stock: StockTypes.FinishedProduct;
  onBack: () => void;
}

export function StockDetailHeader({ stock, onBack }: StockDetailHeaderProps) {
  const packagingLabel =
    stock.packagingSize === "ML_200"
      ? "200 ml"
      : stock.packagingSize === "ML_500"
        ? "500 ml"
        : `${stock.capacityMl} ml`;

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* TOP BAR                                             */}
      {/* ================================================== */}

      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={onBack}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </Pressable>

        <Text style={styles.topTitle}>Détail du stock</Text>

        <View style={styles.topSpacer} />
      </View>

      {/* ================================================== */}
      {/* PRODUCT                                             */}
      {/* ================================================== */}

      <View style={styles.productSection}>
        <View style={styles.imageWrapper}>
          {stock.productImage ? (
            <Image
              source={{ uri: stock.productImage }}
              style={styles.productImage}
              resizeMode="cover"
              accessibilityLabel={`Image du produit ${stock.productName}`}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="bottle-soda-outline"
                size={38}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                stock.isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                stock.isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {stock.isActive ? "Produit actif" : "Produit inactif"}
            </Text>
          </View>

          <Text style={styles.productName} numberOfLines={2}>
            {stock.productName}
          </Text>

          <Text style={styles.sku}>{stock.sku}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="bottle-soda-outline"
                size={15}
                color={COLORS.primary}
              />

              <Text style={styles.metaText}>{stock.packagingName}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="ruler"
                size={15}
                color={COLORS.primary}
              />

              <Text style={styles.metaText}>{packagingLabel}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  // ==========================================================
  // TOP BAR
  // ==========================================================

  topBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  topTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  topSpacer: {
    width: 40,
  },

  // ==========================================================
  // PRODUCT
  // ==========================================================

  productSection: {
    marginTop: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  imageWrapper: {
    width: 96,
    height: 96,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E8F2E5",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  productInfo: {
    flex: 1,
    marginLeft: 15,
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: COLORS.success,
  },

  inactiveDot: {
    backgroundColor: COLORS.Gray,
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
  },

  activeText: {
    color: COLORS.success,
  },

  inactiveText: {
    color: COLORS.Gray,
  },

  // ==========================================================
  // NAME
  // ==========================================================

  productName: {
    fontFamily: fonts.bold,
    fontSize: 19,
    lineHeight: 24,
    color: COLORS.text,
  },

  sku: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
    letterSpacing: 0.4,
  },

  // ==========================================================
  // META
  // ==========================================================

  metaRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  metaText: {
    marginLeft: 5,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  metaDivider: {
    width: 1,
    height: 15,
    marginHorizontal: 9,
    backgroundColor: COLORS.lightGray,
  },

  pressed: {
    opacity: 0.55,
  },
});
