import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { OrderProduct } from "@/types/order";
import { COLORS, fonts } from "@/utils/styles";

import { OrderProductCard } from "./OrderProductCard";

interface OrderProductListProps {
  products: OrderProduct[];

  cart: {
    variantId: string;
    quantity: number;
  }[];

  onAddProduct: (product: OrderProduct) => void;
  onRemoveProduct: (variantId: string) => void;
  onUpdateQuantity: (variantId: string, quantity: number) => void;

  isLoading?: boolean;
}

export function OrderProductList({
  products,
  cart,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  isLoading = false,
}: OrderProductListProps) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>("ALL");

  // ==========================================================
  // FILTRES
  // ==========================================================

  const flavors = useMemo(() => {
    const uniqueNames = new Set<string>();

    products.forEach((product) => {
      const name = product.name.trim();

      if (name) {
        uniqueNames.add(name);
      }
    });

    return [
      "ALL",
      ...Array.from(uniqueNames).sort((a, b) =>
        a.localeCompare(b, "fr", {
          sensitivity: "base",
        }),
      ),
    ];
  }, [products]);

  // ==========================================================
  // PRODUITS FILTRÉS
  // ==========================================================

  const filteredProducts = useMemo(() => {
    if (selectedFlavor === "ALL") {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.trim().toLocaleLowerCase("fr") ===
        selectedFlavor.trim().toLocaleLowerCase("fr"),
    );
  }, [products, selectedFlavor]);

  // ==========================================================
  // QUANTITÉ PANIER
  // ==========================================================

  const getCartQuantity = (variantId: string): number => {
    return cart.find((item) => item.variantId === variantId)?.quantity ?? 0;
  };

  // ==========================================================
  // RENDER PRODUCT
  // ==========================================================

  const renderProduct = ({ item }: { item: OrderProduct }) => {
    return (
      <OrderProductCard
        product={item}
        quantity={getCartQuantity(item.variantId)}
        onAdd={() => onAddProduct(item)}
        onRemove={() => onRemoveProduct(item.variantId)}
        onUpdateQuantity={(quantity) =>
          onUpdateQuantity(item.variantId, quantity)
        }
      />
    );
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (!isLoading && products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>🧃</Text>
        </View>

        <Text style={styles.emptyTitle}>Aucun produit disponible</Text>

        <Text style={styles.emptyDescription}>
          Aucun produit en stock n'est actuellement disponible dans ce point de
          vente.
        </Text>
      </View>
    );
  }

  // ==========================================================
  // SCREEN
  // ==========================================================

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Produits disponibles</Text>

          <Text style={styles.subtitle}>
            Choisissez les jus à ajouter à la commande.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredProducts.length}</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* FILTRE SAVEURS                                     */}
      {/* ================================================== */}

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Saveurs</Text>

        <FlatList
          horizontal
          data={flavors}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterListContent}
          renderItem={({ item }) => {
            const isSelected = selectedFlavor === item;

            const label = item === "ALL" ? "Toutes" : item;

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                  pressed && styles.filterChipPressed,
                ]}
                onPress={() => setSelectedFlavor(item)}
              >
                {isSelected && (
                  <View style={styles.filterCheck}>
                    <Text style={styles.filterCheckText}>✓</Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* ================================================== */}
      {/* LISTE PRODUITS                                     */}
      {/* ================================================== */}

      {filteredProducts.length === 0 ? (
        <View style={styles.filteredEmpty}>
          <Text style={styles.filteredEmptyTitle}>Aucun produit trouvé</Text>

          <Text style={styles.filteredEmptyDescription}>
            Aucun produit ne correspond à la saveur sélectionnée.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.pressed,
            ]}
            onPress={() => setSelectedFlavor("ALL")}
          >
            <Text style={styles.resetButtonText}>
              Afficher toutes les saveurs
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.variantId}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={styles.productsContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  headerContent: {
    flex: 1,
    marginRight: 10,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  countText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  // ==========================================================
  // FILTRE
  // ==========================================================

  filterSection: {
    marginBottom: 13,
  },

  filterLabel: {
    marginBottom: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  filterListContent: {
    paddingRight: 12,
  },

  filterChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    marginRight: 7,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E4E8E1",
  },

  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterChipPressed: {
    opacity: 0.65,
  },

  filterCheck: {
    width: 15,
    height: 15,
    marginRight: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  filterCheckText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: COLORS.white,
  },

  filterText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  filterTextSelected: {
    color: COLORS.white,
  },

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  productsContent: {
    paddingBottom: 4,
  },

  separator: {
    height: 10,
  },

  // ==========================================================
  // FILTER EMPTY
  // ==========================================================

  filteredEmpty: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  filteredEmptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
    textAlign: "center",
  },

  filteredEmptyDescription: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
  },

  resetButton: {
    marginTop: 12,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  resetButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  emptyIconText: {
    fontSize: 25,
  },

  emptyTitle: {
    marginTop: 12,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 5,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.6,
  },
});
