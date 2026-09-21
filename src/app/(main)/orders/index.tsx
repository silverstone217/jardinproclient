import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OrderContinueButton } from "@/components/orders/OrderContinueButton";
import { OrderPosSelector } from "@/components/orders/OrderPosSelector";
import { OrderProductList } from "@/components/orders/OrderProductList";

import { useOrderStore } from "@/store/order.store";

import { OrderResumeCard } from "@/components/orders/OrderResumeCard";
import { COLORS, fonts } from "@/utils/styles";

export default function OrdersScreen() {
  const {
    pointOfSales,
    selectedPointOfSale,
    products,
    cart,

    isLoadingPos,
    isLoadingProducts,
    isHydrating,

    hasActiveOrder,
    currentStep,

    fetchPointOfSales,
    selectPointOfSale,
    fetchProducts,
    addProduct,
    removeProduct,
    updateProductQuantity,

    assignPointOfSale,
    isAssigningPos,

    persistOrder,
    hydrateOrder,

    clearError,
    error,
  } = useOrderStore();

  const hasInitializedRef = useRef(false);

  // ============================================================
  // INITIALISATION DE L'ÉCRAN
  // ============================================================

  // ============================================================
  // INITIALISATION DE L'ÉCRAN
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadOrderScreen = async () => {
        try {
          clearError();

          // ======================================================
          // 1. RÉCUPÉRER LES POS
          // ======================================================

          await fetchPointOfSales();

          if (cancelled) {
            return;
          }

          // ======================================================
          // 2. RESTAURER LE BROUILLON LOCAL
          // ======================================================

          await hydrateOrder();

          if (cancelled) {
            return;
          }

          // ======================================================
          // 3. RÉCUPÉRER LE POS FINAL
          // ======================================================

          const pos = useOrderStore.getState().selectedPointOfSale;

          if (!pos?.id) {
            return;
          }

          // ======================================================
          // 4. RÉCUPÉRER LE CATALOGUE DU POS
          // ======================================================

          await fetchProducts(pos.id);

          if (cancelled) {
            return;
          }

          hasInitializedRef.current = true;
        } catch (error) {
          console.error("Erreur chargement écran commande :", error);
        }
      };

      loadOrderScreen();

      return () => {
        cancelled = true;
      };
    }, [fetchPointOfSales, hydrateOrder, fetchProducts, clearError]),
  );

  // ============================================================
  // CHARGEMENT DES PRODUITS
  // ============================================================

  useEffect(() => {
    const pointOfSaleId = selectedPointOfSale?.id;

    if (!pointOfSaleId) {
      return;
    }

    fetchProducts(pointOfSaleId).catch((error) => {
      console.error("Erreur chargement produits commande :", error);
    });
  }, [selectedPointOfSale?.id, fetchProducts]);

  // ============================================================
  // SÉLECTION DU POINT DE VENTE
  // ============================================================

  const handleSelectPos = (pointOfSaleId: string) => {
    try {
      selectPointOfSale(pointOfSaleId);
    } catch (error) {
      console.error("Erreur sélection point de vente :", error);
    }
  };

  // ============================================================
  // PANIER
  // ============================================================

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const totalAmount = useMemo(
    () =>
      cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cart],
  );

  // ============================================================
  // CONTINUER LA COMMANDE
  // ============================================================

  const handleContinue = async () => {
    if (!selectedPointOfSale || cart.length === 0) {
      return;
    }

    try {
      /*
       * Sauvegarde locale avant de passer
       * à l'étape suivante.
       */
      await persistOrder();

      router.push("/orders/client");
    } catch (error) {
      console.error("Erreur sauvegarde commande locale :", error);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    try {
      clearError();

      await fetchPointOfSales();

      const currentPointOfSale = useOrderStore.getState().selectedPointOfSale;

      if (currentPointOfSale?.id) {
        await fetchProducts(currentPointOfSale.id);
      }
    } catch (error) {
      console.error("Erreur actualisation commande :", error);
    }
  };

  // REDIRECT STEP ORDER
  const handleResumeOrder = () => {
    switch (currentStep) {
      case "CUSTOMER":
        router.push("/orders/client");
        break;
      case "LOYALTY":
        router.push("/orders/loyalty");
        break;
      case "PREVIEW":
        router.push("/orders/preview");
        break;
      case "PRODUCTS":
      default:
        break;
    }
  };

  // AUTO ASSIGn
  const handleAssignPointOfSale = async (pointOfSaleId: string) => {
    try {
      await assignPointOfSale(pointOfSaleId);

      await fetchPointOfSales();
    } catch (error) {
      console.error("Erreur assignation point de vente :", error);
    }
  };

  // ============================================================
  // LOADING INITIAL
  // ============================================================

  const isInitialLoading =
    isHydrating || (isLoadingPos && !hasInitializedRef.current);

  if (isInitialLoading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}>
          <Ionicons name="cart-outline" size={28} color={COLORS.primary} />
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.loadingIndicator}
        />

        <Text style={styles.loadingTitle}>Préparation de la commande</Text>

        <Text style={styles.loadingDescription}>
          Chargement des points de vente et des produits...
        </Text>
      </View>
    );
  }

  // ============================================================
  // ÉCRAN PRINCIPAL
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={selectedPointOfSale ? products : []}
          keyExtractor={(item) => item.variantId}
          style={styles.list}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={() => null}
          ListHeaderComponent={
            <View>
              {/* ================================================== */}
              {/* HEADER                                             */}
              {/* ================================================== */}

              <View style={styles.pageHeader}>
                <View style={styles.pageHeaderContent}>
                  <Text style={styles.eyebrow}>VENTE</Text>

                  <Text style={styles.pageTitle}>Nouvelle commande</Text>

                  <Text style={styles.pageSubtitle}>
                    Sélectionnez vos produits et préparez la vente.
                  </Text>
                </View>

                <View style={styles.headerIcon}>
                  <Ionicons
                    name="cart-outline"
                    size={21}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              {/* ================================================== */}
              {/* ERREUR                                             */}
              {/* ================================================== */}

              {error && (
                <View style={styles.errorBanner}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={COLORS.error}
                    />
                  </View>

                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* ================================================== */}
              {/* POINT DE VENTE                                     */}
              {/* ================================================== */}

              <View style={styles.section}>
                <OrderPosSelector
                  pointOfSales={pointOfSales}
                  selectedPointOfSaleId={selectedPointOfSale?.id ?? null}
                  onSelect={handleSelectPos}
                  onAssign={handleAssignPointOfSale}
                  isAssigning={isAssigningPos}
                />
              </View>

              {/* ================================================== */}
              {/* COMMANDE LOCALE                                    */}
              {/* ================================================== */}

              {hasActiveOrder && currentStep !== "PRODUCTS" && (
                <OrderResumeCard
                  currentStep={currentStep}
                  onResume={handleResumeOrder}
                />
              )}

              {/* ================================================== */}
              {/* PRODUITS                                           */}
              {/* ================================================== */}

              <View style={styles.productsSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="pricetags-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.sectionHeaderContent}>
                    <Text style={styles.sectionTitle}>Produits</Text>

                    <Text style={styles.sectionSubtitle}>
                      Ajoutez les jus disponibles à votre commande.
                    </Text>
                  </View>
                </View>

                {selectedPointOfSale ? (
                  <OrderProductList
                    products={products}
                    cart={cart}
                    onAddProduct={addProduct}
                    onRemoveProduct={removeProduct}
                    onUpdateQuantity={updateProductQuantity}
                    isLoading={isLoadingProducts}
                  />
                ) : (
                  <View style={styles.selectPosMessage}>
                    <View style={styles.selectPosIcon}>
                      <Ionicons
                        name="storefront-outline"
                        size={25}
                        color={COLORS.primary}
                      />
                    </View>

                    <Text style={styles.selectPosTitle}>
                      Sélectionnez un point de vente
                    </Text>

                    <Text style={styles.selectPosText}>
                      Les produits disponibles apparaîtront ici après la
                      sélection du point de vente.
                    </Text>
                  </View>
                )}
              </View>

              {/* ================================================== */}
              {/* CONTINUER                                          */}
              {/* ================================================== */}

              <OrderContinueButton
                itemCount={itemCount}
                totalAmount={totalAmount}
                disabled={!selectedPointOfSale || cart.length === 0}
                onPress={handleContinue}
              />

              {/* ================================================== */}
              {/* ESPACE BAS                                         */}
              {/* ================================================== */}

              <View style={styles.bottomSpacer} />
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoadingPos || isLoadingProducts}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ============================================================
  // SCREEN
  // ============================================================

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  list: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ============================================================
  // HEADER
  // ============================================================

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  pageHeaderContent: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 3,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: COLORS.primary,
  },

  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 23,
    lineHeight: 27,
    color: COLORS.text,
  },

  pageSubtitle: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.Gray,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DFEBDD",
  },

  // ============================================================
  // ERROR
  // ============================================================

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6D4D4",
  },

  errorIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9DCDC",
  },

  errorText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.error,
  },

  // ============================================================
  // SECTION
  // ============================================================

  section: {
    marginBottom: 18,
    padding: 17,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  productsSection: {
    marginTop: 0,
    marginBottom: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ============================================================
  // ACTIVE ORDER
  // ============================================================

  activeOrderBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#F0F6EE",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  activeOrderIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2EEDC",
  },

  activeOrderContent: {
    flex: 1,
    marginLeft: 10,
  },

  activeOrderTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.primary,
  },

  activeOrderText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ============================================================
  // NO POS
  // ============================================================

  selectPosMessage: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    paddingHorizontal: 25,
    paddingVertical: 25,
    borderRadius: 18,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#ECECE8",
    borderStyle: "dashed",
  },

  selectPosIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  selectPosTitle: {
    marginTop: 12,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
    textAlign: "center",
  },

  selectPosText: {
    marginTop: 5,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ============================================================
  // BOTTOM
  // ============================================================

  bottomSpacer: {
    height: 120,
  },

  // ============================================================
  // LOADING
  // ============================================================

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: COLORS.background,
  },

  loadingIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  loadingIndicator: {
    marginTop: 20,
  },

  loadingTitle: {
    marginTop: 13,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },

  loadingDescription: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
