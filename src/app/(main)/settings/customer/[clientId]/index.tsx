import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CustomerPreviewEmpty from "@/components/customer/preview/CustomerPreviewEmpty";
import CustomerPreviewHeader from "@/components/customer/preview/CustomerPreviewHeader";
import CustomerPreviewHistory from "@/components/customer/preview/CustomerPreviewHistory";
import CustomerPreviewLoyalty from "@/components/customer/preview/CustomerPreviewLoyalty";
import CustomerPreviewSkeleton from "@/components/customer/preview/CustomerPreviewSkeleton";
import CustomerPreviewStats from "@/components/customer/preview/CustomerPreviewStats";

import { useCustomerStore } from "@/store/customer.store";

import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomerPreviewScreen = () => {
  const router = useRouter();

  const params = useLocalSearchParams<{
    clientId?: string;
    pointOfSaleId?: string;
  }>();

  const clientId = Array.isArray(params.clientId)
    ? params.clientId[0]
    : params.clientId;

  const pointOfSaleId = Array.isArray(params.pointOfSaleId)
    ? params.pointOfSaleId[0]
    : params.pointOfSaleId;

  const {
    selectedCustomer,
    selectedPointOfSale,
    getCustomer,
    isLoadingDetail,
    isRefreshingDetail,
    detailPagination,
    isOffline,
    detailError,
  } = useCustomerStore();

  const isAllPointOfSales = !pointOfSaleId;

  const pointOfSaleLabel = isAllPointOfSales
    ? "Tous les points de vente"
    : (selectedPointOfSale?.name ?? null);

  const loadCustomer = useCallback(
    async (refresh = false) => {
      if (!clientId) {
        return;
      }

      try {
        await getCustomer(clientId, pointOfSaleId);
      } catch (error) {
        console.error(
          refresh
            ? "Erreur actualisation client :"
            : "Erreur chargement client :",
          error,
        );
      }
    },
    [clientId, pointOfSaleId, getCustomer],
  );

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const handleRefresh = useCallback(() => {
    loadCustomer(true);
  }, [loadCustomer]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleInvoicePress = useCallback(
    (invoice: { id: string; invoiceNumber: string }) => {
      router.navigate(`/(main)/invoices/${invoice.id}`);
      console.log("Facture sélectionnée :", invoice.invoiceNumber);
    },
    [],
  );

  // const pointOfSaleLabel = useMemo(() => {
  //   if (isAllPointOfSales) {
  //     return "Tous les points de vente";
  //   }

  //   return (
  //     selectedCustomer?.pointOfSale?.name ?? selectedPointOfSale?.name ?? null
  //   );
  // }, [
  //   isAllPointOfSales,
  //   selectedCustomer?.pointOfSale?.name,
  //   selectedPointOfSale?.name,
  // ]);

  const currency = useMemo(() => {
    const firstInvoice = selectedCustomer?.invoices?.[0];

    return firstInvoice?.currency ?? "CDF";
  }, [selectedCustomer?.invoices]);

  /*
   * ----------------------------------------------------
   * ID MANQUANT
   * ----------------------------------------------------
   */
  if (!clientId) {
    return (
      <View style={styles.centerContainer}>
        <CustomerPreviewEmpty
          icon="person-remove-outline"
          title="Client introuvable"
          message="L'identifiant du client est manquant."
          actionLabel="Retour"
          onAction={handleBack}
        />
      </View>
    );
  }

  /*
   * ----------------------------------------------------
   * CHARGEMENT INITIAL
   * ----------------------------------------------------
   */
  if (isLoadingDetail && !selectedCustomer) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CustomerPreviewSkeleton />
      </ScrollView>
    );
  }

  /*
   * ----------------------------------------------------
   * ERREUR / CLIENT ABSENT
   * ----------------------------------------------------
   */
  if (!selectedCustomer) {
    return (
      <View style={styles.centerContainer}>
        <CustomerPreviewEmpty
          icon={isOffline ? "cloud-offline-outline" : "person-remove-outline"}
          title={isOffline ? "Hors connexion" : "Client introuvable"}
          message={
            detailError ??
            (isOffline
              ? "Impossible de charger les informations du client hors connexion."
              : "Les informations de ce client ne sont pas disponibles.")
          }
          actionLabel={isOffline ? "Réessayer" : "Retour"}
          onAction={isOffline ? handleRefresh : handleBack}
        />
      </View>
    );
  }

  const statistics = selectedCustomer.statistics;

  const invoices = selectedCustomer.invoices ?? [];

  /*
   * ----------------------------------------------------
   * DONNÉES FIDÉLITÉ
   * ----------------------------------------------------
   *
   * `loyaltyPoints` correspond au solde actuel.
   * Les totaux historiques viennent des statistiques
   * calculées côté API/service.
   */
  const currentPoints = selectedCustomer.loyaltyPoints ?? 0;
  const totalEarned = statistics?.totalPointsEarned ?? 0;
  const totalUsed = statistics?.totalPointsUsed ?? 0;

  /*
   * ----------------------------------------------------
   * DONNÉES STATISTIQUES
   * ----------------------------------------------------
   */
  const totalOrders = statistics?.purchaseCount ?? 0;

  const totalSpent = statistics?.totalSpent ?? 0;
  const averageOrderAmount = statistics?.averagePurchaseAmount ?? 0;

  const lastOrderAt = statistics?.lastPurchaseAt ?? null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingDetail}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ---------------------------------------------
            HEADER
        --------------------------------------------- */}
        <CustomerPreviewHeader
          name={selectedCustomer.name}
          phone={selectedCustomer.phone}
          createdAt={selectedCustomer.createdAt}
          pointOfSaleLabel={pointOfSaleLabel}
          isAllPointOfSales={isAllPointOfSales}
          onBack={handleBack}
        />

        {/* ---------------------------------------------
            MODE HORS LIGNE
        --------------------------------------------- */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons
              name="cloud-offline-outline"
              size={16}
              color={SETTINGS_COLORS.inventory.icon}
            />

            <Text style={styles.offlineText}>
              Données affichées hors connexion
            </Text>
          </View>
        )}

        {/* ---------------------------------------------
            FIDÉLITÉ
        --------------------------------------------- */}
        <CustomerPreviewLoyalty
          currentPoints={currentPoints}
          totalEarned={totalEarned}
          totalUsed={totalUsed}
        />

        {/* ---------------------------------------------
            STATISTIQUES
        --------------------------------------------- */}
        <CustomerPreviewStats
          totalOrders={totalOrders}
          totalSpent={totalSpent}
          averageOrderAmount={averageOrderAmount}
          lastOrderAt={lastOrderAt}
          currency={currency}
        />

        {/* ---------------------------------------------
            INFORMATIONS
        --------------------------------------------- */}
        {/* <CustomerPreviewHeader
          name={selectedCustomer.name}
          phone={selectedCustomer.phone}
          createdAt={selectedCustomer.createdAt}
          pointOfSaleLabel={pointOfSaleLabel}
          isAllPointOfSales={isAllPointOfSales}
          onBack={handleBack}
        /> */}

        <View
          style={{
            paddingVertical: 10,
          }}
        />

        {/* ---------------------------------------------
            HISTORIQUE
        --------------------------------------------- */}
        <CustomerPreviewHistory
          invoices={invoices}
          onInvoicePress={handleInvoicePress}
          hasMore={detailPagination?.hasNextPage ?? false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerPreviewScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 80,
  },

  content: {
    paddingBottom: 30,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },

  contextSection: {
    marginHorizontal: 20,
    marginBottom: 8,
  },

  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: SETTINGS_COLORS.inventory.background,
  },

  offlineText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.darkGray,
    marginLeft: 7,
  },
});
