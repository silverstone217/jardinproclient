import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { useCallback, useEffect } from "react";

import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { InvoiceEmptyState } from "@/components/invoices/InvoiceEmptyState";
import { InvoiceErrorState } from "@/components/invoices/InvoiceErrorState";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceLoadingState } from "@/components/invoices/InvoiceLoadingState";

import { useInvoiceStore } from "@/store/invoice.store";

import { InvoiceList } from "@/components/invoices/InvoiceList";
import { COLORS, fonts, fontSizes } from "@/utils/styles";

export default function InvoicesScreen() {
  const router = useRouter();

  const {
    invoices,
    filters,
    isLoading,
    isRefreshing,
    isInitialized,
    isOffline,
    error,

    initialize,
    refreshInvoices,
    setFilters,
    clearFilters,
    clearError,
  } = useInvoiceStore();

  // ==========================================================
  // INITIALISATION
  // ==========================================================

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ==========================================================
  // REFRESH À L'OUVERTURE
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      if (!isInitialized) {
        return;
      }

      refreshInvoices();
    }, [isInitialized, refreshInvoices]),
  );

  // ==========================================================
  // FACTURE
  // ==========================================================

  const handleInvoicePress = useCallback(
    (invoiceId: string) => {
      router.push(`/(main)/invoices/${invoiceId}`);
    },
    [router],
  );

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    await refreshInvoices();
  };

  // ==========================================================
  // LOADING INITIAL
  // ==========================================================

  if (isLoading && invoices.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HISTORIQUE</Text>

            <Text style={styles.title}>Factures</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={21} color={COLORS.primary} />
          </View>
        </View>

        <InvoiceLoadingState />
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ERREUR SANS CACHE
  // ==========================================================

  if (error && invoices.length === 0 && !isOffline) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HISTORIQUE</Text>

            <Text style={styles.title}>Factures</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={21} color={COLORS.primary} />
          </View>
        </View>

        <InvoiceErrorState
          message={error}
          onRetry={async () => {
            clearError();

            try {
              await refreshInvoices();
            } catch {
              // Le store gère déjà l'erreur.
            }
          }}
        />
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HISTORIQUE</Text>

            <Text style={styles.title}>Factures</Text>

            <Text style={styles.subtitle}>
              Retrouvez vos ventes et factures
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={21} color={COLORS.primary} />
          </View>
        </View>

        {/* ================================================== */}
        {/* OFFLINE                                            */}
        {/* ================================================== */}

        {/* {isOffline && (
          <View style={styles.offlineBanner}>
            <View style={styles.offlineIcon}>
              <Ionicons
                name="cloud-offline-outline"
                size={16}
                color={COLORS.warning}
              />
            </View>

            <View style={styles.offlineContent}>
              <Text style={styles.offlineTitle}>Mode hors ligne</Text>

              <Text style={styles.offlineText}>
                Affichage des factures enregistrées sur cet appareil.
              </Text>
            </View>
          </View>
        )} */}

        {/* ================================================== */}
        {/* FILTRES                                            */}
        {/* ================================================== */}

        <InvoiceFilters
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          onApply={() => {
            refreshInvoices();
          }}
        />

        {/* ================================================== */}
        {/* LISTE                                              */}
        {/* ================================================== */}

        {invoices.length === 0 ? (
          <InvoiceEmptyState
            hasFilters={Boolean(
              filters.minAmount !== undefined ||
              filters.maxAmount !== undefined ||
              filters.period ||
              filters.date ||
              filters.customerPhone,
            )}
          />
        ) : (
          <InvoiceList
            invoices={invoices}
            onInvoicePress={handleInvoicePress}
          />
        )}

        {/* ================================================== */}
        {/* ERREUR NON BLOQUANTE                               */}
        {/* ================================================== */}

        {error && (
          <Pressable style={styles.errorBanner} onPress={clearError}>
            <Ionicons
              name="alert-circle-outline"
              size={17}
              color={COLORS.error}
            />

            <Text style={styles.errorText}>{error}</Text>

            <Ionicons name="close" size={16} color={COLORS.Gray} />
          </Pressable>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eyebrow: {
    marginBottom: 3,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: COLORS.primary,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxlarge,
    lineHeight: fontSizes.xxlarge * 1.15,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DFEBDD",
  },

  // ==========================================================
  // OFFLINE
  // ==========================================================

  offlineBanner: {
    marginBottom: 14,
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F3E3B7",
    flexDirection: "row",
    alignItems: "center",
  },

  offlineIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0C9",
  },

  offlineContent: {
    flex: 1,
    marginLeft: 9,
  },

  offlineTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: "#725B16",
  },

  offlineText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: "#927A2C",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBanner: {
    marginTop: 14,
    minHeight: 45,
    paddingHorizontal: 11,
    borderRadius: 13,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6D4D4",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 100,
  },
});
