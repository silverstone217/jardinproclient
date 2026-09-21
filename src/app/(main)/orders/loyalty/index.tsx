import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { OrderLoyaltyActions } from "@/components/orders/loyalty/OrderLoyaltyActions";
import { OrderLoyaltyHeader } from "@/components/orders/loyalty/OrderLoyaltyHeader";
import { OrderLoyaltySummary } from "@/components/orders/loyalty/OrderLoyaltySummary";

import { useOrderStore } from "@/store/order.store";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

export default function OrderLoyaltyScreen() {
  const insets = useSafeAreaInsets();

  const {
    selectedPointOfSale,
    customer,
    cart,
    loyalty,
    isLoadingLoyalty,
    pointsUsed,
    setPointsUsed,
    fetchLoyalty,
    setCurrentStep,
    persistOrder,
    error,
    clearError,
  } = useOrderStore();

  // ============================================================
  // CALCUL DE LA FIDÉLITÉ
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      if (!selectedPointOfSale?.id || !customer?.id || cart.length === 0) {
        return;
      }

      void fetchLoyalty();
    }, [selectedPointOfSale?.id, customer?.id, cart.length, fetchLoyalty]),
  );

  // ============================================================
  // PRÉREQUIS MANQUANTS
  // ============================================================

  const hasRequiredData =
    Boolean(selectedPointOfSale) && Boolean(customer) && cart.length > 0;

  // ============================================================
  // CONTINUER VERS PREVIEW
  // ============================================================

  const handleContinue = async () => {
    if (!loyalty || isLoadingLoyalty) {
      return;
    }

    try {
      setCurrentStep("PREVIEW");

      await persistOrder();

      router.push("/orders/preview");
    } catch (error) {
      console.error("Erreur sauvegarde commande :", error);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (hasRequiredData && isLoadingLoyalty && !loyalty) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <Ionicons name="gift-outline" size={30} color={COLORS.primary} />
          </View>

          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingIndicator}
          />

          <Text style={styles.loadingTitle}>Calcul de vos points</Text>

          <Text style={styles.loadingDescription}>
            Nous calculons les points fidélité de cette commande...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // PRÉREQUIS MANQUANTS
  // ============================================================

  if (!hasRequiredData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.blockedScreen}>
          <View style={styles.blockedIcon}>
            <Ionicons name="cart-outline" size={32} color={COLORS.primary} />
          </View>

          <Text style={styles.blockedTitle}>Commande incomplète</Text>

          <Text style={styles.blockedDescription}>
            Pour accéder à la fidélité, vous devez avoir un point de vente, au
            moins un produit et un client.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              router.replace("/orders");
            }}
          >
            <Ionicons
              name="arrow-back-outline"
              size={18}
              color={COLORS.white}
            />

            <Text style={styles.backButtonText}>Retour à la commande</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ERREUR DE CALCUL
  // ============================================================

  if (error && !loyalty) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorScreen}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color={COLORS.error}
            />
          </View>

          <Text style={styles.errorTitle}>
            Impossible de calculer la fidélité
          </Text>

          <Text style={styles.errorDescription}>{error}</Text>

          <View style={styles.errorActions}>
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                clearError();
                void fetchLoyalty();
              }}
            >
              <Ionicons name="refresh-outline" size={18} color={COLORS.white} />

              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                router.back();
              }}
            >
              <Text style={styles.secondaryButtonText}>Retour</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ÉCRAN PRINCIPAL
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================================================== */}
        {/* TOP BAR                                            */}
        {/* ================================================== */}

        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.topBackButton,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              router.back();
            }}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </Pressable>

          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>Nouvelle commande</Text>

            <Text style={styles.topBarSubtitle}>Fidélité</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3/4</Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        {customer && (
          <OrderLoyaltyHeader
            customerName={customer.name}
            customerPhone={customer.phone}
          />
        )}

        {/* ================================================== */}
        {/* ERROR                                              */}
        {/* ================================================== */}

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={COLORS.error}
            />

            <Text style={styles.errorText}>{error}</Text>

            <Pressable onPress={clearError} hitSlop={8}>
              <Ionicons name="close" size={18} color={COLORS.Gray} />
            </Pressable>
          </View>
        )}

        {/* ================================================== */}
        {/* SUMMARY                                            */}
        {/* ================================================== */}

        {loyalty && (
          <>
            <OrderLoyaltySummary loyalty={loyalty} />

            {/* ============================================== */}
            {/* ACTIONS                                        */}
            {/* ============================================== */}

            <OrderLoyaltyActions
              redemption={loyalty.redemption}
              pointsUsed={pointsUsed}
              onPointsUsedChange={setPointsUsed}
              onContinue={handleContinue}
              disabled={isLoadingLoyalty}
            />
          </>
        )}
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
    paddingTop: 12,
  },

  // ==========================================================
  // TOP BAR
  // ==========================================================

  topBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  topBackButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  topBarCenter: {
    flex: 1,
    marginLeft: 11,
  },

  topBarTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  topBarSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  stepBadge: {
    minWidth: 42,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  stepBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
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
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  loadingIndicator: {
    marginTop: 20,
  },

  loadingTitle: {
    marginTop: 13,
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
    textAlign: "center",
  },

  loadingDescription: {
    marginTop: 5,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // BLOCKED
  // ==========================================================

  blockedScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  blockedIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  blockedTitle: {
    marginTop: 18,
    fontFamily: fonts.bold,
    fontSize: 19,
    color: COLORS.text,
    textAlign: "center",
  },

  blockedDescription: {
    marginTop: 8,
    maxWidth: 320,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.Gray,
    textAlign: "center",
  },

  backButton: {
    marginTop: 22,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
  },

  backButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  errorTitle: {
    marginTop: 18,
    maxWidth: 320,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.text,
    textAlign: "center",
  },

  errorDescription: {
    marginTop: 8,
    maxWidth: 320,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.Gray,
    textAlign: "center",
  },

  errorActions: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  retryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  secondaryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E5E2",
  },

  secondaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  // ==========================================================
  // ERROR BANNER
  // ==========================================================

  errorBanner: {
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6D4D4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.error,
  },

  pressed: {
    opacity: 0.6,
  },
});
