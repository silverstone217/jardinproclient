import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useDistributionStore } from "@/store/distribution.store";

import type { DistributionProduct } from "@/types/distribution";

import { COLORS, fonts } from "@/utils/styles";

import { DistributionProductCard } from "./DistributionProductCard";

export function DistributionProductPicker() {
  const {
    fromSelected,
    products,
    selectedProducts,
    filters,
    isLoadingProducts,
    setSearch,
    addProduct,
  } = useDistributionStore();

  // ============================================================
  // PRODUITS DÉJÀ SÉLECTIONNÉS
  // ============================================================

  const selectedVariantIds = new Set(
    selectedProducts.map((product) => product.variantId),
  );

  // ============================================================
  // RECHERCHE
  // ============================================================

  const search = filters.search.trim().toLowerCase();

  // ============================================================
  // PRODUITS FILTRÉS
  // ============================================================

  const filteredProducts = products.filter((product) => {
    if (selectedVariantIds.has(product.variantId)) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      product.productName,
      product.sku,
      product.packagingName,
      product.packagingSize,
    ].some((value) => value.toLowerCase().includes(search));
  });

  // ============================================================
  // NOMBRE DE PRODUITS DISPONIBLES
  // ============================================================

  const availableProductsCount = products.filter(
    (product) =>
      product.quantity > 0 && !selectedVariantIds.has(product.variantId),
  ).length;

  // ============================================================
  // AJOUTER UN PRODUIT
  // ============================================================

  const handleAddProduct = (product: DistributionProduct) => {
    addProduct(product);
  };

  // ============================================================
  // ÉTAT : AUCUN DÉPART
  // ============================================================

  if (!fromSelected) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Produits à distribuer</Text>

            <Text style={styles.subtitle}>
              Sélectionnez d'abord le stock de départ.
            </Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="arrow-up-outline" size={22} color={COLORS.Gray} />
          </View>

          <Text style={styles.emptyTitle}>Aucun stock sélectionné</Text>

          <Text style={styles.emptyText}>
            Choisissez la boutique principale ou un point de vente comme départ
            pour afficher les produits disponibles.
          </Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <View style={styles.card}>
      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Produits à distribuer</Text>

          <Text style={styles.subtitle}>
            Sélectionnez les produits à envoyer.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{availableProductsCount}</Text>
        </View>
      </View>

      {/* ====================================================== */}
      {/* RECHERCHE                                              */}
      {/* ====================================================== */}

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.Gray} />

        <TextInput
          value={filters.search}
          onChangeText={setSearch}
          placeholder="Rechercher un jus, SKU..."
          placeholderTextColor={COLORS.Gray}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {filters.search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.Gray} />
          </Pressable>
        )}
      </View>

      {/* ====================================================== */}
      {/* LISTE                                                   */}
      {/* ====================================================== */}

      <View style={styles.listContainer}>
        {isLoadingProducts ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={COLORS.primary} />

            <Text style={styles.loadingText}>Chargement des produits...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={search ? "search-outline" : "cube-outline"}
                size={22}
                color={COLORS.Gray}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {search
                ? "Aucun produit trouvé"
                : products.length === 0
                  ? "Aucun produit disponible"
                  : "Tous les produits sont sélectionnés"}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? "Essayez avec un autre nom de produit ou un autre SKU."
                : products.length === 0
                  ? "Aucun produit fini disponible dans ce stock."
                  : "Les produits disponibles ont déjà été ajoutés à la distribution."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.variantId}
            renderItem={({ item }) => (
              <DistributionProductCard
                product={item}
                onAdd={() => handleAddProduct(item)}
              />
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  countBadge: {
    minWidth: 30,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  countText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    height: 44,
    marginTop: 15,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E7E7E3",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.text,
  },

  clearButton: {
    marginLeft: 6,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  listContainer: {
    marginTop: 10,
  },

  listContent: {
    paddingTop: 2,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingState: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 9,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyState: {
    minHeight: 145,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },

  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EF",
  },

  emptyTitle: {
    marginTop: 10,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 300,
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
