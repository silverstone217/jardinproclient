import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useDistributionStore } from "@/store/distribution.store";

import type { DistributionSelectedProduct } from "@/types/distribution";

import { COLORS, fonts } from "@/utils/styles";

// ============================================================
// SELECTED PRODUCT CARD
// ============================================================

interface DistributionSelectedProductCardProps {
  product: DistributionSelectedProduct;
}

export function DistributionSelectedProductCard({
  product,
}: DistributionSelectedProductCardProps) {
  const { updateProductQuantity, removeProduct } = useDistributionStore();

  const canDecrease = product.quantity > 1;

  const canIncrease = product.quantity < product.availableQuantity;

  const handleDecrease = () => {
    if (!canDecrease) {
      return;
    }

    updateProductQuantity(product.variantId, product.quantity - 1);
  };

  const handleIncrease = () => {
    if (!canIncrease) {
      return;
    }

    updateProductQuantity(product.variantId, product.quantity + 1);
  };

  const handleRemove = () => {
    removeProduct(product.variantId);
  };

  return (
    <View style={styles.card}>
      {/* ====================================================== */}
      {/* IMAGE                                                  */}
      {/* ====================================================== */}

      <View style={styles.imageContainer}>
        {product.productImage ? (
          <Image
            source={{
              uri: product.productImage,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="water-outline" size={22} color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* ====================================================== */}
      {/* CONTENT                                                */}
      {/* ====================================================== */}

      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.productName}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.packaging} numberOfLines={1}>
            {product.packagingName}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.capacity}>{product.capacityMl} ml</Text>
        </View>

        <Text style={styles.available}>
          {product.availableQuantity} disponible
          {product.availableQuantity > 1 ? "s" : ""}
        </Text>

        {/* ==================================================== */}
        {/* QUANTITY                                              */}
        {/* ==================================================== */}

        <View style={styles.quantityRow}>
          <Pressable
            style={({ pressed }) => [
              styles.quantityButton,
              !canDecrease && styles.quantityButtonDisabled,
              pressed && canDecrease && styles.quantityButtonPressed,
            ]}
            onPress={handleDecrease}
            disabled={!canDecrease}
            hitSlop={4}
          >
            <Ionicons
              name="remove"
              size={15}
              color={canDecrease ? COLORS.primary : COLORS.Gray}
            />
          </Pressable>

          <View style={styles.quantityContainer}>
            <Text style={styles.quantity}>{product.quantity}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.quantityButton,
              !canIncrease && styles.quantityButtonDisabled,
              pressed && canIncrease && styles.quantityButtonPressed,
            ]}
            onPress={handleIncrease}
            disabled={!canIncrease}
            hitSlop={4}
          >
            <Ionicons
              name="add"
              size={15}
              color={canIncrease ? COLORS.primary : COLORS.Gray}
            />
          </Pressable>
        </View>
      </View>

      {/* ====================================================== */}
      {/* REMOVE                                                 */}
      {/* ====================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.removeButton,
          pressed && styles.removeButtonPressed,
        ]}
        onPress={handleRemove}
        hitSlop={6}
      >
        <Ionicons name="trash-outline" size={16} color={COLORS.error} />
      </Pressable>
    </View>
  );
}

// ============================================================
// SELECTED PRODUCTS
// ============================================================

export function DistributionSelectedProducts() {
  const { selectedProducts } = useDistributionStore();

  const totalQuantity = selectedProducts.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  return (
    <View style={styles.container}>
      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="cube-outline" size={17} color={COLORS.primary} />
          </View>

          <View>
            <Text style={styles.title}>Produits à transférer</Text>

            <Text style={styles.subtitle}>
              Sélectionnez les quantités à envoyer
            </Text>
          </View>
        </View>

        {selectedProducts.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{selectedProducts.length}</Text>
          </View>
        )}
      </View>

      {/* ====================================================== */}
      {/* EMPTY STATE                                            */}
      {/* ====================================================== */}

      {selectedProducts.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cube-outline" size={25} color={COLORS.Gray} />
          </View>

          <Text style={styles.emptyTitle}>Aucun produit sélectionné</Text>

          <Text style={styles.emptyDescription}>
            Ajoutez les produits disponibles ci-dessus pour préparer votre
            transfert.
          </Text>
        </View>
      ) : (
        <>
          {/* ================================================== */}
          {/* PRODUCTS                                            */}
          {/* ================================================== */}

          <View style={styles.products}>
            {selectedProducts.map((product) => (
              <DistributionSelectedProductCard
                key={product.variantId}
                product={product}
              />
            ))}
          </View>

          {/* ================================================== */}
          {/* FOOTER                                              */}
          {/* ================================================== */}

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>Quantité totale</Text>

              <Text style={styles.footerHint}>
                {selectedProducts.length} produit
                {selectedProducts.length > 1 ? "s" : ""} sélectionné
                {selectedProducts.length > 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.totalContainer}>
              <Text style={styles.total}>{totalQuantity}</Text>

              <Text style={styles.totalUnit}>
                unité
                {totalQuantity > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  title: {
    marginLeft: 10,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    marginLeft: 10,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  countBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
  },

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  products: {
    marginTop: 2,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#F0F0ED",
    borderStyle: "dashed",
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  emptyTitle: {
    marginTop: 10,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 4,
    maxWidth: 270,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    marginTop: 4,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  footerLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  footerHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  totalContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  total: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: COLORS.primary,
  },

  totalUnit: {
    marginLeft: 4,
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    minHeight: 104,
    marginBottom: 9,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FCFCFA",
    flexDirection: "row",
    alignItems: "center",
  },

  imageContainer: {
    width: 62,
    height: 62,
    borderRadius: 15,
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
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  packaging: {
    maxWidth: "58%",
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  separator: {
    width: 3,
    height: 3,
    marginHorizontal: 6,
    borderRadius: 2,
    backgroundColor: COLORS.lightGray,
  },

  capacity: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.darkGray,
  },

  available: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // QUANTITY
  // ==========================================================

  quantityRow: {
    alignSelf: "flex-start",
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    backgroundColor: "#F1F5EF",
  },

  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonDisabled: {
    opacity: 0.45,
  },

  quantityButtonPressed: {
    backgroundColor: "#E0EBDD",
  },

  quantityContainer: {
    minWidth: 30,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  quantity: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // REMOVE
  // ==========================================================

  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  removeButtonPressed: {
    opacity: 0.55,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});
