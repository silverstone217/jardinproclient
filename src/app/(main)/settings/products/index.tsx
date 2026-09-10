import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePackagingStore } from "@/store/packaging.store";
import { useProductStore } from "@/store/product.store";

import { COLORS, fonts } from "@/utils/styles";

export default function ProductsScreen() {
  const { products, isLoading, isRefreshing, initialize, refreshProducts } =
    useProductStore();

  const { packagings, initialize: initializePackagings } = usePackagingStore();

  const [search, setSearch] = useState("");

  // ============================================================
  // INITIALISATION
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      initialize();
      initializePackagings();
    }, [initialize, initializePackagings]),
  );

  // ============================================================
  // STATISTIQUES
  // ============================================================

  const totalProducts = products.length;

  const activeProductsCount = products.filter(
    (product) => product.isActive,
  ).length;

  const inactiveProductsCount = totalProducts - activeProductsCount;

  // ============================================================
  // RECHERCHE
  // ============================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const productName = product.name.toLowerCase();

      const description = product.description?.toLowerCase() ?? "";

      const variantsText = product.variants
        .map((variant) => variant.sku.toLowerCase())
        .join(" ");

      const packagingText = product.variants
        .map((variant) => {
          const packaging = packagings.find(
            (item) => item.id === variant.packagingId,
          );

          if (!packaging) {
            return "";
          }

          return `${packaging.name} ${packaging.capacityMl}`;
        })
        .join(" ")
        .toLowerCase();

      return (
        productName.includes(query) ||
        description.includes(query) ||
        variantsText.includes(query) ||
        packagingText.includes(query)
      );
    });
  }, [products, packagings, search]);

  // ============================================================
  // FORMAT PRIX
  // ============================================================

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ============================================================
  // VARIANTES
  // ============================================================

  const getPackaging = (packagingId: string) => {
    return packagings.find((packaging) => packaging.id === packagingId);
  };

  // ============================================================
  // PRODUCT CARD
  // ============================================================

  const renderItem = ({ item }: { item: (typeof products)[number] }) => {
    const activeVariants = item.variants.filter((variant) => variant.isActive);

    const displayedVariants = activeVariants.slice(0, 2);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.productCard,
          !item.isActive && styles.productCardInactive,
          pressed && styles.cardPressed,
        ]}
        onPress={() => router.push(`/(main)/settings/products/${item.id}`)}
      >
        {/* ================================================== */}
        {/* IMAGE                                              */}
        {/* ================================================== */}

        <View style={styles.imageWrapper}>
          {item.image ? (
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons
                name="leaf-outline"
                size={25}
                color={item.isActive ? COLORS.primary : COLORS.Gray}
              />
            </View>
          )}

          {!item.isActive && (
            <View style={styles.inactiveImageBadge}>
              <Ionicons name="pause" size={10} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* ================================================== */}
        {/* CONTENT                                            */}
        {/* ================================================== */}

        <View style={styles.productContent}>
          {/* Nom + statut */}

          <View style={styles.productTitleRow}>
            <Text
              style={[
                styles.productName,
                !item.isActive && styles.productNameInactive,
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <View
              style={[
                styles.statusBadge,
                item.isActive ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  item.isActive
                    ? styles.statusDotActive
                    : styles.statusDotInactive,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  item.isActive
                    ? styles.statusTextActive
                    : styles.statusTextInactive,
                ]}
              >
                {item.isActive ? "Actif" : "Désactivé"}
              </Text>
            </View>
          </View>

          {/* Description */}

          {item.description ? (
            <Text style={styles.productDescription} numberOfLines={1}>
              {item.description}
            </Text>
          ) : (
            <Text style={styles.noDescription}>Aucune description</Text>
          )}

          {/* ================================================== */}
          {/* VARIANTES                                          */}
          {/* ================================================== */}

          {displayedVariants.length > 0 ? (
            <View style={styles.variantsRow}>
              {displayedVariants.map((variant) => {
                const packaging = getPackaging(variant.packagingId);

                return (
                  <View key={variant.id} style={styles.variantChip}>
                    <View style={styles.variantIcon}>
                      <Ionicons
                        name="water-outline"
                        size={13}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.variantContent}>
                      <Text style={styles.variantSize} numberOfLines={1}>
                        {packaging ? `${packaging.capacityMl} ml` : "Format"}
                      </Text>

                      <Text style={styles.variantPrice}>
                        {formatPrice(variant.price)} CDF
                      </Text>
                    </View>
                  </View>
                );
              })}

              {activeVariants.length > 2 && (
                <View style={styles.moreVariants}>
                  <Text style={styles.moreVariantsText}>
                    +{activeVariants.length - 2}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noVariants}>
              <Ionicons name="layers-outline" size={13} color={COLORS.Gray} />

              <Text style={styles.noVariantsText}>Aucune variante active</Text>
            </View>
          )}
        </View>

        {/* ================================================== */}
        {/* CHEVRON                                            */}
        {/* ================================================== */}

        <View style={styles.chevronWrapper}>
          <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
        </View>
      </Pressable>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingIcon}>
          <Ionicons name="cube-outline" size={28} color={COLORS.primary} />
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.spinner}
        />

        <Text style={styles.loadingTitle}>Chargement des produits</Text>

        <Text style={styles.loadingDescription}>
          Récupération du catalogue...
        </Text>
      </View>
    );
  }

  // ============================================================
  // SCREEN
  // ============================================================

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>CATALOGUE</Text>

          <Text style={styles.title}>Produits</Text>

          <Text style={styles.subtitle}>
            Gérez vos produits et leurs formats.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/(main)/settings/products/new")}
        >
          <Ionicons name="add" size={23} color={COLORS.white} />
        </Pressable>
      </View>

      {/* ====================================================== */}
      {/* STATISTIQUES                                           */}
      {/* ====================================================== */}

      <View style={styles.statsBanner}>
        <View style={styles.statsHeader}>
          <View style={styles.statsHeaderIcon}>
            <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
          </View>

          <View style={styles.statsHeaderContent}>
            <Text style={styles.statsTitle}>Votre catalogue</Text>

            <Text style={styles.statsSubtitle}>
              Vue d'ensemble de vos produits
            </Text>
          </View>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.statsRow}>
          {/* Total */}

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalProducts}</Text>

            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statSeparator} />

          {/* Actifs */}

          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <View style={styles.smallActiveDot} />

              <Text style={[styles.statValue, styles.activeStatValue]}>
                {activeProductsCount}
              </Text>
            </View>

            <Text style={styles.statLabel}>Actifs</Text>
          </View>

          <View style={styles.statSeparator} />

          {/* Désactivés */}

          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <View style={styles.smallInactiveDot} />

              <Text style={[styles.statValue, styles.inactiveStatValue]}>
                {inactiveProductsCount}
              </Text>
            </View>

            <Text style={styles.statLabel}>Désactivés</Text>
          </View>
        </View>
      </View>

      {/* ====================================================== */}
      {/* SEARCH                                                 */}
      {/* ====================================================== */}

      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Ionicons name="search-outline" size={19} color={COLORS.Gray} />
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un produit, SKU..."
          placeholderTextColor={COLORS.Gray}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
            style={styles.clearSearch}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.Gray} />
          </Pressable>
        )}
      </View>

      {/* ====================================================== */}
      {/* RESULT INFO                                            */}
      {/* ====================================================== */}

      {search.trim().length > 0 && (
        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>
            {filteredProducts.length} résultat
            {filteredProducts.length > 1 ? "s" : ""}
          </Text>

          <Pressable onPress={() => setSearch("")}>
            <Text style={styles.clearText}>Effacer</Text>
          </Pressable>
        </View>
      )}

      {/* ====================================================== */}
      {/* LIST                                                   */}
      {/* ====================================================== */}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          filteredProducts.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshProducts}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={search.trim() ? "search-outline" : "cube-outline"}
                size={34}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {search.trim() ? "Aucun résultat" : "Aucun produit"}
            </Text>

            <Text style={styles.emptyText}>
              {search.trim()
                ? `Aucun produit ne correspond à « ${search.trim()} ».`
                : "Commencez par créer votre premier produit."}
            </Text>

            {!search.trim() && (
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push("/(main)/settings/products/new")}
              >
                <Ionicons name="add" size={17} color={COLORS.white} />

                <Text style={styles.emptyButtonText}>Ajouter un produit</Text>
              </Pressable>
            )}
          </View>
        }
      />

      <View style={styles.bottomSpace} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // SCREEN
  // ==========================================================

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: COLORS.primary,
  },

  title: {
    marginTop: 3,
    fontFamily: fonts.bold,
    fontSize: 28,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  addButton: {
    width: 46,
    height: 46,
    marginLeft: 12,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  // ==========================================================
  // STATS
  // ==========================================================

  statsBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E7E8E4",
  },

  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  statsHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  statsHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  statsTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  statsSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  statsDivider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: "#F0F0ED",
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  activeStatValue: {
    color: COLORS.success,
  },

  inactiveStatValue: {
    color: COLORS.Gray,
  },

  statLabel: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  statSeparator: {
    width: 1,
    height: 28,
    backgroundColor: "#EEEEEB",
  },

  smallActiveDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },

  smallInactiveDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: COLORS.Gray,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    height: 48,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E4E5E1",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  searchIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 5,
    paddingVertical: 0,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  clearSearch: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  resultInfo: {
    marginHorizontal: 22,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  clearText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
  },

  productCard: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E7E8E4",
    flexDirection: "row",
    alignItems: "center",
  },

  productCardInactive: {
    opacity: 0.78,
  },

  cardPressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  imageWrapper: {
    position: "relative",
    width: 76,
    height: 76,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#EAF2E7",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  inactiveImageBadge: {
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.Gray,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // ==========================================================
  // PRODUCT CONTENT
  // ==========================================================

  productContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 5,
  },

  productTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  productName: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  productNameInactive: {
    color: COLORS.darkGray,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
  },

  statusActive: {
    backgroundColor: "#EAF5E8",
  },

  statusInactive: {
    backgroundColor: "#F0F0EF",
  },

  statusDot: {
    width: 5,
    height: 5,
    marginRight: 4,
    borderRadius: 3,
  },

  statusDotActive: {
    backgroundColor: COLORS.success,
  },

  statusDotInactive: {
    backgroundColor: COLORS.Gray,
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
  },

  statusTextActive: {
    color: COLORS.success,
  },

  statusTextInactive: {
    color: COLORS.Gray,
  },

  productDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  noDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: "#C4C4C1",
  },

  // ==========================================================
  // VARIANTS
  // ==========================================================

  variantsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },

  variantChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#F5F8F3",
    borderWidth: 1,
    borderColor: "#E2EBDD",
    flexDirection: "row",
    alignItems: "center",
  },

  variantIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  variantContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 5,
  },

  variantSize: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.text,
  },

  variantPrice: {
    marginTop: 1,
    fontFamily: fonts.bold,
    fontSize: 8.5,
    color: COLORS.primary,
  },

  moreVariants: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EF",
  },

  moreVariantsText: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  noVariants: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },

  noVariantsText: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // CHEVRON
  // ==========================================================

  chevronWrapper: {
    width: 20,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyList: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingBottom: 70,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  emptyTitle: {
    marginTop: 17,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: "center",
    color: COLORS.Gray,
  },

  emptyButton: {
    marginTop: 17,
    minHeight: 43,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  emptyButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  spinner: {
    marginTop: 18,
  },

  loadingTitle: {
    marginTop: 11,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  loadingDescription: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpace: {
    height: 20,
  },
});
