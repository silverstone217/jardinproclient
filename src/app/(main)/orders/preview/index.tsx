import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { OrderPreviewAction } from "@/components/orders/preview/OrderPreviewAction";
import { OrderPreviewCustomer } from "@/components/orders/preview/OrderPreviewCustomer";
import { OrderPreviewHeader } from "@/components/orders/preview/OrderPreviewHeader";
import { OrderPreviewLoyalty } from "@/components/orders/preview/OrderPreviewLoyalty";
import { OrderPreviewPayment } from "@/components/orders/preview/OrderPreviewPayment";
import { OrderPreviewProducts } from "@/components/orders/preview/OrderPreviewProducts";
import { OrderPreviewTotals } from "@/components/orders/preview/OrderPreviewTotals";

import { useOrderStore } from "@/store/order.store";

import { COLORS, fonts } from "@/utils/styles";

export default function OrderPreviewScreen() {
  const insets = useSafeAreaInsets();
  const pointOfSale = useOrderStore((state) => state.selectedPointOfSale);
  const cart = useOrderStore((state) => state.cart);
  const customer = useOrderStore((state) => state.customer);
  const loyalty = useOrderStore((state) => state.loyalty);
  const pointsUsed = useOrderStore((state) => state.pointsUsed);
  const paymentMethod = useOrderStore((state) => state.paymentMethod);

  // ============================================================
  // VÉRIFICATION DE LA COMMANDE
  // ============================================================

  const hasRequiredData =
    Boolean(pointOfSale) && cart.length > 0 && Boolean(customer);

  // ============================================================
  // DONNÉES CALCULÉES
  // ============================================================

  const discountAmount =
    pointsUsed > 0 ? (loyalty?.redemption.discountAmount ?? 0) : 0;

  // ============================================================
  // COMMANDE INCOMPLÈTE
  // ============================================================

  if (!hasRequiredData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.blockedScreen}>
          <View style={styles.blockedIcon}>
            <Ionicons name="receipt-outline" size={32} color={COLORS.primary} />
          </View>

          <Text style={styles.blockedTitle}>Commande incomplète</Text>

          <Text style={styles.blockedDescription}>
            Certaines informations nécessaires à la validation de votre commande
            sont manquantes.
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
  // SCREEN
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
        {/* HEADER                                             */}
        {/* ================================================== */}

        <OrderPreviewHeader />

        {/* ================================================== */}
        {/* PRODUCTS                                           */}
        {/* ================================================== */}

        <View style={styles.section}>
          <OrderPreviewProducts items={cart} />
        </View>

        {/* ================================================== */}
        {/* CUSTOMER                                           */}
        {/* ================================================== */}

        <View style={styles.section}>
          <OrderPreviewCustomer customer={customer} />
        </View>

        {/* ================================================== */}
        {/* LOYALTY                                            */}
        {/* ================================================== */}

        {loyalty && (
          <View style={styles.section}>
            <OrderPreviewLoyalty loyalty={loyalty} pointsUsed={pointsUsed} />
          </View>
        )}

        {/* ================================================== */}
        {/* TOTALS                                             */}
        {/* ================================================== */}

        <View style={styles.section}>
          <OrderPreviewTotals items={cart} discountAmount={discountAmount} />
        </View>

        {/* ================================================== */}
        {/* PAYMENT                                            */}
        {/* ================================================== */}

        <View style={styles.section}>
          <OrderPreviewPayment paymentMethod={paymentMethod} />
        </View>

        {/* ================================================== */}
        {/* VALIDATION                                         */}
        {/* ================================================== */}

        <View style={styles.actionSection}>
          <OrderPreviewAction />
        </View>
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
  // SECTIONS
  // ==========================================================

  section: {
    marginTop: 16,
  },

  actionSection: {
    marginTop: 20,
  },

  // ==========================================================
  // BLOCKED STATE
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

  pressed: {
    opacity: 0.6,
  },
});
