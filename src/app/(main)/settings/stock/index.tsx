import { router } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { StockFilters } from "@/components/stock/StockFilters";
import { StockHeader } from "@/components/stock/StockHeader";
import { StockLocationSelector } from "@/components/stock/StockLocationSelector";
import { StockProductList } from "@/components/stock/StockProductList";
import { StockSummary } from "@/components/stock/StockSummary";

import { usePointOfSaleStore } from "@/store/pointOfSale.store";
import { useStockStore } from "@/store/stock.store";

import { useUserStore } from "@/store/user.store";
import { COLORS, fonts } from "@/utils/styles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StockScreen() {
  // ============================================================
  // AUTH / PROFIL
  // ============================================================

  const user = useUserStore((state) => state.user);

  // ============================================================
  // POINTS DE VENTE
  // ============================================================

  const fetchPointOfSales = usePointOfSaleStore(
    (state) => state.fetchPointOfSales,
  );

  const pointOfSales = usePointOfSaleStore((state) => state.pointOfSales);

  // ============================================================
  // STOCK
  // ============================================================

  const location = useStockStore((state) => state.location);

  const summary = useStockStore((state) => state.summary);

  const rawIngredients = useStockStore((state) => state.rawIngredients);

  const packagings = useStockStore((state) => state.packagings);

  const finishedProducts = useStockStore((state) => state.finishedProducts);

  const rawIngredientsPagination = useStockStore(
    (state) => state.rawIngredientsPagination,
  );

  const packagingsPagination = useStockStore(
    (state) => state.packagingsPagination,
  );

  const finishedProductsPagination = useStockStore(
    (state) => state.finishedProductsPagination,
  );

  const filters = useStockStore((state) => state.filters);

  const isLoading = useStockStore((state) => state.isLoading);

  const isRefreshing = useStockStore((state) => state.isRefreshing);

  const isLoadingMore = useStockStore((state) => state.isLoadingMore);

  const error = useStockStore((state) => state.error);

  const initialize = useStockStore((state) => state.initialize);

  const refreshStock = useStockStore((state) => state.refreshStock);

  const loadMore = useStockStore((state) => state.loadMore);

  const setLocation = useStockStore((state) => state.setLocation);

  const setCategory = useStockStore((state) => state.setCategory);

  const setSearch = useStockStore((state) => state.setSearch);

  const setLowStock = useStockStore((state) => state.setLowStock);

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ============================================================
  // CHARGEMENT DES PDV
  // ============================================================

  useEffect(() => {
    if (!user || pointOfSales.length > 0) {
      return;
    }

    fetchPointOfSales();
  }, [user, pointOfSales.length, fetchPointOfSales]);

  // ============================================================
  // RÔLE / UTILISATEUR
  // ============================================================

  const role = user?.role ?? null;

  const userId = user?.id ?? "";

  // ============================================================
  // ITEMS À AFFICHER
  // ============================================================

  const items = useMemo<
    Array<
      | StockTypes.RawIngredient
      | StockTypes.Packaging
      | StockTypes.FinishedProduct
    >
  >(() => {
    switch (filters.category) {
      case "RAW_INGREDIENT":
        return rawIngredients;

      case "PACKAGING":
        return packagings;

      case "FINISHED_PRODUCT":
        return finishedProducts;

      default:
        return [...rawIngredients, ...packagings, ...finishedProducts];
    }
  }, [filters.category, rawIngredients, packagings, finishedProducts]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const hasNextPage = useMemo(() => {
    if (filters.category === "RAW_INGREDIENT") {
      return rawIngredientsPagination?.hasNextPage ?? false;
    }

    if (filters.category === "PACKAGING") {
      return packagingsPagination?.hasNextPage ?? false;
    }

    if (filters.category === "FINISHED_PRODUCT") {
      return finishedProductsPagination?.hasNextPage ?? false;
    }

    return (
      rawIngredientsPagination?.hasNextPage ||
      packagingsPagination?.hasNextPage ||
      finishedProductsPagination?.hasNextPage ||
      false
    );
  }, [
    filters.category,
    rawIngredientsPagination,
    packagingsPagination,
    finishedProductsPagination,
  ]);

  // ============================================================
  // CHANGEMENT D'EMPLACEMENT
  // ============================================================

  const handleLocationChange = useCallback(
    async (nextLocation: StockTypes.StockLocationInfo) => {
      await setLocation(nextLocation);
    },
    [setLocation],
  );

  // ============================================================
  // CATÉGORIE
  // ============================================================

  const handleCategoryChange = useCallback(
    async (category: StockTypes.Category | null) => {
      await setCategory(category);
    },
    [setCategory],
  );

  // ============================================================
  // RECHERCHE
  // ============================================================

  const handleSearchChange = useCallback(
    async (value: string) => {
      await setSearch(value);
    },
    [setSearch],
  );

  // ============================================================
  // STOCK FAIBLE
  // ============================================================

  const handleLowStockChange = useCallback(
    async (value: boolean) => {
      await setLowStock(value);
    },
    [setLowStock],
  );

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = useCallback(async () => {
    await refreshStock();
  }, [refreshStock]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const handleLoadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasNextPage) {
      return;
    }

    await loadMore();
  }, [isLoading, isLoadingMore, hasNextPage, loadMore]);

  // ============================================================
  // OUVERTURE PRODUIT FINI
  // ============================================================

  const handleItemPress = useCallback(
    (
      item:
        | StockTypes.RawIngredient
        | StockTypes.Packaging
        | StockTypes.FinishedProduct,
    ) => {
      if (!("variantId" in item)) {
        return;
      }

      router.push({
        pathname: "/settings/stock/[variantId]",
        params: {
          variantId: item.variantId,
        },
      });
    },
    [],
  );

  // ============================================================
  // PROFIL ENCORE EN CHARGEMENT
  // ============================================================

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>

          <Text style={styles.loadingTitle}>Préparation du stock</Text>

          <Text style={styles.loadingDescription}>
            Chargement de vos informations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ÉTAT DE RÔLE INVALIDE
  // ============================================================

  if (role !== "MANAGER" && role !== "EMPLOYEE") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyScreen}>
          <Text style={styles.emptyTitle}>Accès au stock indisponible</Text>

          <Text style={styles.emptyDescription}>
            Votre rôle ne permet pas de consulter le stock.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ÉCRAN
  // ============================================================

  return (
    <SafeAreaView style={styles.screen}>
      <StockProductList
        items={items}
        category={filters.category}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isLoadingMore={isLoadingMore}
        hasNextPage={hasNextPage}
        error={error}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onItemPress={handleItemPress}
        listHeaderComponent={
          <>
            <StockHeader />

            <StockLocationSelector
              role={role}
              userId={userId}
              location={location}
              onLocationChange={handleLocationChange}
            />

            <StockSummary summary={summary} location={location} />

            <StockFilters
              filters={filters}
              onSearchChange={handleSearchChange}
              onCategoryChange={handleCategoryChange}
              onLowStockChange={handleLowStockChange}
            />

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {filters.category === "RAW_INGREDIENT"
                  ? "Matières premières"
                  : filters.category === "PACKAGING"
                    ? "Emballages"
                    : filters.category === "FINISHED_PRODUCT"
                      ? "Produits finis"
                      : "Stock disponible"}
              </Text>

              {items.length > 0 && (
                <Text style={styles.listCount}>
                  {items.length} élément
                  {items.length > 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  // ==========================================================
  // LIST HEADER
  // ==========================================================

  listHeader: {
    marginBottom: 10,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  listTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  listCount: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  loadingTitle: {
    marginTop: 13,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  loadingDescription: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 6,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
