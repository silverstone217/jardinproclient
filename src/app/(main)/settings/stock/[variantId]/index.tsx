import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StockDetailEntries } from "@/components/stock/detail/StockDetailEntries";
import { StockDetailHeader } from "@/components/stock/detail/StockDetailHeader";
import { StockDetailLots } from "@/components/stock/detail/StockDetailLots";
import { StockDetailSummary } from "@/components/stock/detail/StockDetailSummary";

import { useStockStore } from "@/store/stock.store";

import { COLORS, fonts } from "@/utils/styles";

export default function StockProductDetailScreen() {
  const { variantId } = useLocalSearchParams<{
    variantId: string;
  }>();

  const { selectedProduct, isLoadingProduct, error, fetchProduct, clearError } =
    useStockStore();

  const loadProduct = useCallback(async () => {
    if (!variantId) {
      return;
    }

    try {
      clearError();

      await fetchProduct(variantId);
    } catch (error) {
      console.error("Erreur chargement détail stock :", error);
    }
  }, [variantId, fetchProduct, clearError]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoadingProduct && !selectedProduct) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.stateScreen}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>

          <Text style={styles.stateTitle}>Chargement du produit</Text>

          <Text style={styles.stateDescription}>
            Récupération des informations du stock...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ERROR / EMPTY
  // ==========================================================

  if (!selectedProduct) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.stateScreen}>
          <View style={styles.errorIcon}>
            <Ionicons name="cube-outline" size={30} color={COLORS.error} />
          </View>

          <Text style={styles.stateTitle}>Produit introuvable</Text>

          <Text style={styles.stateDescription}>
            {error ?? "Impossible de récupérer les informations de ce produit."}
          </Text>

          <View style={styles.stateActions}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={17} color={COLORS.text} />

              <Text style={styles.backButtonText}>Retour</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
              onPress={loadProduct}
            >
              <Ionicons name="refresh-outline" size={17} color={COLORS.white} />

              <Text style={styles.retryButtonText}>Réessayer</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // SCREEN
  // ==========================================================

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoadingProduct}
            onRefresh={loadProduct}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <StockDetailHeader
          stock={selectedProduct.stock}
          onBack={() => router.back()}
        />
        <StockDetailSummary stock={selectedProduct.stock} />
        <StockDetailLots lots={selectedProduct.lots} />
        <StockDetailEntries entries={selectedProduct.entries} />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // ==========================================================
  // STATE SCREEN
  // ==========================================================

  stateScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  stateTitle: {
    marginTop: 16,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
  },

  stateDescription: {
    marginTop: 7,
    maxWidth: 300,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // STATE ACTIONS
  // ==========================================================

  stateActions: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  backButton: {
    minHeight: 43,
    paddingHorizontal: 16,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  backButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  retryButton: {
    minHeight: 43,
    paddingHorizontal: 16,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  retryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 80,
  },

  pressed: {
    opacity: 0.6,
  },
});
