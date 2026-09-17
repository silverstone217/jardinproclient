import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { DistributionHeader } from "@/components/distribution/DistributionHeader";
import { DistributionProductPicker } from "@/components/distribution/DistributionProductPicker";
import { DistributionRouteSelector } from "@/components/distribution/DistributionRouteSelector";
import { DistributionSelectedProducts } from "@/components/distribution/DistributionSelectedProducts";
import { DistributionSubmit } from "@/components/distribution/DistributionSubmit";
import { DistributionSummary } from "@/components/distribution/DistributionSummary";

import { useDistributionStore } from "@/store/distribution.store";
import { usePointOfSaleStore } from "@/store/pointOfSale.store";

import { COLORS, fonts } from "@/utils/styles";

export default function DistributionScreen() {
  const {
    fromSelected,
    toSelected,
    isLoadingProducts,
    error,
    clearError,
    reset,
    fetchProducts,
  } = useDistributionStore();

  const {
    pointOfSales,
    isLoading: isLoadingPointOfSales,
    isRefreshing: isRefreshingPointOfSales,
    fetchPointOfSales,
    refreshPointOfSales,
  } = usePointOfSaleStore();

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadDistribution = async () => {
        try {
          await fetchPointOfSales();

          if (!mounted) {
            return;
          }

          // La boutique principale est le départ par défaut.
          await fetchProducts(null);
        } catch (error) {
          console.error("Erreur chargement distribution :", error);
        }
      };

      loadDistribution();

      return () => {
        mounted = false;

        reset();
      };
    }, [fetchPointOfSales, fetchProducts, reset]),
  );

  // ==========================================================
  // ERREUR
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      if (!error) {
        return;
      }

      const timeout = setTimeout(() => {
        clearError();
      }, 6000);

      return () => {
        clearTimeout(timeout);
      };
    }, [error, clearError]),
  );

  // ==========================================================
  // ACTUALISATION
  // ==========================================================

  const handleRefresh = async () => {
    try {
      await refreshPointOfSales();
      await fetchProducts();
    } catch (error) {
      console.error("Erreur actualisation distribution :", error);
    }
  };

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  if (isLoadingPointOfSales && pointOfSales.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>

          <Text style={styles.loadingTitle}>
            Préparation de la distribution
          </Text>

          <Text style={styles.loadingText}>
            Récupération des points de vente...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // AUCUN PDV
  // ==========================================================

  if (!isLoadingPointOfSales && pointOfSales.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.emptyScreen}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingPointOfSales}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          <DistributionHeader />

          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>!</Text>
            </View>

            <Text style={styles.emptyTitle}>
              Aucun point de vente disponible
            </Text>

            <Text style={styles.emptyText}>
              Vous devez avoir au moins un point de vente actif pour effectuer
              une distribution.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ÉCRAN PRINCIPAL
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingPointOfSales}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <DistributionHeader />

        <DistributionRouteSelector />

        {fromSelected && toSelected && (
          <>
            <DistributionSummary />

            <DistributionProductPicker />

            <DistributionSelectedProducts />

            <DistributionSubmit />
          </>
        )}

        {!fromSelected && (
          <View style={styles.helperCard}>
            <View style={styles.helperIcon}>
              <Text style={styles.helperIconText}>1</Text>
            </View>

            <View style={styles.helperContent}>
              <Text style={styles.helperTitle}>
                Choisissez le point de départ
              </Text>

              <Text style={styles.helperText}>
                Sélectionnez la boutique principale ou un point de vente pour
                charger son stock.
              </Text>
            </View>
          </View>
        )}

        {fromSelected && !toSelected && (
          <View style={styles.helperCard}>
            <View style={styles.helperIcon}>
              <Text style={styles.helperIconText}>2</Text>
            </View>

            <View style={styles.helperContent}>
              <Text style={styles.helperTitle}>Choisissez la destination</Text>

              <Text style={styles.helperText}>
                Sélectionnez maintenant le point de vente qui recevra les
                produits.
              </Text>
            </View>
          </View>
        )}

        {isLoadingProducts && fromSelected && (
          <View style={styles.productsLoading}>
            <ActivityIndicator size="small" color={COLORS.primary} />

            <Text style={styles.productsLoadingText}>
              Actualisation du stock...
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ==========================================================
  // HELPER
  // ==========================================================

  helperCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E8E2",
    backgroundColor: "#F9FAF7",
    flexDirection: "row",
    alignItems: "center",
  },

  helperIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  helperIconText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  helperContent: {
    flex: 1,
    marginLeft: 10,
  },

  helperTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  helperText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ==========================================================
  // PRODUCTS LOADING
  // ==========================================================

  productsLoading: {
    marginTop: 12,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  productsLoadingText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyScreen: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  emptyCard: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: COLORS.white,
    alignItems: "center",
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4D9",
  },

  emptyIconText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: COLORS.warning,
  },

  emptyTitle: {
    marginTop: 13,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 290,
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
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
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  loadingTitle: {
    marginTop: 15,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
  },

  loadingText: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 100,
  },
});
