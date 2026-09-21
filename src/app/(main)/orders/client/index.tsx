import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OrderCustomerForm } from "@/components/orders/customer/OrderCustomerForm";
import { OrderCustomerHeader } from "@/components/orders/customer/OrderCustomerHeader";
import { OrderCustomerSearch } from "@/components/orders/customer/OrderCustomerSearch";

import { useOrderStore } from "@/store/order.store";

import { COLORS, fonts } from "@/utils/styles";

export default function OrderCustomerScreen() {
  const {
    selectedPointOfSale,
    cart,

    customer,

    isSearchingCustomer,
    isCreatingCustomer,

    searchCustomer,
    createCustomer,
    setCustomer,

    setCurrentStep,
    persistOrder,

    error,
    clearError,
  } = useOrderStore();

  const [phone, setPhone] = useState(customer?.phone ?? "");

  const [name, setName] = useState(customer?.name ?? "");

  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // ==========================================================
  // SYNCHRONISER LE FORMULAIRE
  // ==========================================================

  useEffect(() => {
    if (!customer) {
      return;
    }

    setPhone(customer.phone);
    setName(customer.name ?? "");
  }, [customer]);

  // ==========================================================
  // RECHERCHE CLIENT
  // ==========================================================

  const handleSearch = async () => {
    clearError();

    const cleanPhone = phone.trim();

    if (!/^0\d{9}$/.test(cleanPhone)) {
      return;
    }

    try {
      const result = await searchCustomer(cleanPhone);

      if (result) {
        setIsNewCustomer(false);

        /*
         * Le client est déjà connu.
         * On passe explicitement à l'étape
         * fidélité puis on sauvegarde l'état
         * local avant la navigation.
         */
        setCurrentStep("LOYALTY");

        await persistOrder();

        router.push("/orders/loyalty");

        return;
      }

      /*
       * Client inexistant :
       * on affiche le formulaire de création.
       */
      setIsNewCustomer(true);
    } catch (error) {
      console.error("Erreur recherche client :", error);
    }
  };

  // ==========================================================
  // CRÉER CLIENT
  // ==========================================================

  const handleCreateCustomer = async () => {
    clearError();

    const cleanName = name.trim();

    const cleanPhone = phone.trim();

    if (cleanName.length < 2 || !/^0\d{9}$/.test(cleanPhone)) {
      return;
    }

    try {
      const newCustomer = await createCustomer(cleanName, cleanPhone);

      setCustomer(newCustomer);

      setIsNewCustomer(false);

      /*
       * Le nouveau client est maintenant
       * attaché à la commande locale.
       */
      setCurrentStep("LOYALTY");

      await persistOrder();

      router.push("/orders/loyalty");
    } catch (error) {
      console.error("Erreur création client :", error);
    }
  };

  // ==========================================================
  // RETOUR À LA RECHERCHE
  // ==========================================================

  const handleBackToSearch = () => {
    clearError();

    setIsNewCustomer(false);
    setName("");
  };

  // ==========================================================
  // RETOUR COMMANDE
  // ==========================================================

  const handleBack = async () => {
    clearError();

    /*
     * Si l'utilisateur revient aux produits,
     * l'étape de reprise doit redevenir PRODUCTS.
     */
    setCurrentStep("PRODUCTS");

    try {
      await persistOrder();
    } catch (error) {
      console.error("Erreur sauvegarde retour commande :", error);
    }

    router.replace("/orders");
  };

  // ==========================================================
  // ÉTAT INVALIDE
  // ==========================================================

  const hasValidOrder = Boolean(selectedPointOfSale && cart.length > 0);

  if (!hasValidOrder) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.invalidScreen}>
          <View style={styles.invalidIcon}>
            <Ionicons name="cart-outline" size={28} color={COLORS.primary} />
          </View>

          <Text style={styles.invalidTitle}>Commande indisponible</Text>

          <Text style={styles.invalidDescription}>
            Sélectionnez d'abord un point de vente et ajoutez au moins un
            produit à votre commande.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.backToOrderButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/orders")}
          >
            <Ionicons name="arrow-back" size={17} color={COLORS.white} />

            <Text style={styles.backToOrderText}>Retour aux produits</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // SCREEN
  // ==========================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ================================================== */}
          {/* TOP BAR                                            */}
          {/* ================================================== */}

          <View style={styles.topBar}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
              onPress={handleBack}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={19} color={COLORS.text} />
            </Pressable>

            <Text style={styles.topTitle}>Nouvelle commande</Text>

            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>2/4</Text>
            </View>
          </View>

          {/* ================================================== */}
          {/* STEP HEADER                                        */}
          {/* ================================================== */}

          <OrderCustomerHeader isNewCustomer={isNewCustomer} />

          {/* ================================================== */}
          {/* ERROR                                              */}
          {/* ================================================== */}

          {error && (
            <View style={styles.errorBanner}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={COLORS.error}
                />
              </View>

              <Text style={styles.errorText}>{error}</Text>

              <Pressable onPress={clearError} hitSlop={8}>
                <Ionicons name="close" size={17} color={COLORS.Gray} />
              </Pressable>
            </View>
          )}

          {/* ================================================== */}
          {/* CUSTOMER SEARCH                                    */}
          {/* ================================================== */}

          {!isNewCustomer && (
            <OrderCustomerSearch
              phone={phone}
              isSearching={isSearchingCustomer}
              onPhoneChange={setPhone}
              onSearch={handleSearch}
            />
          )}

          {/* ================================================== */}
          {/* CUSTOMER CREATION                                  */}
          {/* ================================================== */}

          {isNewCustomer && (
            <OrderCustomerForm
              name={name}
              phone={phone}
              isCreating={isCreatingCustomer}
              onNameChange={setName}
              onCreate={handleCreateCustomer}
              onBack={handleBackToSearch}
            />
          )}

          {/* ================================================== */}
          {/* INFO                                               */}
          {/* ================================================== */}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.infoText}>
              Le numéro de téléphone permet de retrouver automatiquement les
              points de fidélité du client.
            </Text>
          </View>

          {/* ================================================== */}
          {/* ORDER SUMMARY                                      */}
          {/* ================================================== */}

          <View style={styles.orderSummary}>
            <View style={styles.orderSummaryIcon}>
              <Ionicons name="cart-outline" size={17} color={COLORS.primary} />
            </View>

            <View style={styles.orderSummaryContent}>
              <Text style={styles.orderSummaryTitle}>Votre commande</Text>

              <Text style={styles.orderSummaryText}>
                {cart.reduce((total, item) => total + item.quantity, 0)} article
                {cart.reduce((total, item) => total + item.quantity, 0) > 1
                  ? "s"
                  : ""}{" "}
                sélectionné
                {cart.reduce((total, item) => total + item.quantity, 0) > 1
                  ? "s"
                  : ""}
              </Text>
            </View>

            <Text style={styles.orderSummaryTotal}>
              {cart
                .reduce(
                  (total, item) => total + item.unitPrice * item.quantity,
                  0,
                )
                .toLocaleString("fr-FR")}{" "}
              CDF
            </Text>
          </View>

          {/* ================================================== */}
          {/* BOTTOM SPACER                                     */}
          {/* ================================================== */}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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

  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,

    /*
     * Le bottom tab bar est absolute.
     * On laisse suffisamment d'espace pour que
     * l'information et les formulaires ne soient
     * jamais masqués derrière la navigation.
     */
    paddingBottom: 130,
  },

  // ==========================================================
  // TOP BAR
  // ==========================================================

  topBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E7E7E3",
  },

  topTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  stepBadge: {
    minWidth: 36,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3E7",
  },

  stepText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: COLORS.primary,
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBanner: {
    minHeight: 48,
    marginBottom: 14,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3D4D4",
    backgroundColor: "#FDECEC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBE0E0",
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoCard: {
    marginTop: 16,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DFEBDD",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2EFDE",
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // ORDER SUMMARY
  // ==========================================================

  orderSummary: {
    marginTop: 14,
    padding: 13,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
  },

  orderSummaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  orderSummaryContent: {
    flex: 1,
    marginLeft: 9,
  },

  orderSummaryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  orderSummaryText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  orderSummaryTotal: {
    marginLeft: 8,
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // INVALID ORDER
  // ==========================================================

  invalidScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 110,
    backgroundColor: COLORS.background,
  },

  invalidIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  invalidTitle: {
    marginTop: 16,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
    textAlign: "center",
  },

  invalidDescription: {
    maxWidth: 300,
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },

  backToOrderButton: {
    minHeight: 44,
    marginTop: 20,
    paddingHorizontal: 17,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  backToOrderText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 10,
  },

  // ==========================================================
  // PRESS
  // ==========================================================

  pressed: {
    opacity: 0.55,
  },
});
