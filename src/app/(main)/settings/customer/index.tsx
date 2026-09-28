import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomerCard } from "@/components/customer/CustomerCard";
import { CustomerEmpty } from "@/components/customer/CustomerEmpty";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerListSkeleton } from "@/components/customer/CustomerListSkeleton";
import { CustomerPosSelector } from "@/components/customer/CustomerPosSelector";
import { CustomerSearchBar } from "@/components/customer/CustomerSearchBar";
import { CustomerStats } from "@/components/customer/CustomerStats";

import { useCustomerStore } from "@/store/customer.store";
import { usePointOfSaleStore } from "@/store/pointOfSale.store";
import { useUserStore } from "@/store/user.store";

import type { CustomerPointOfSale } from "@/types/customer";
import { COLORS, fonts } from "@/utils/styles";
import { Ionicons } from "@expo/vector-icons";

export default function CustomerListScreen() {
  // ============================================================
  // AUTHENTIFICATION
  // ============================================================

  const user = useUserStore((state) => state.user);
  const userRole = user?.role;
  const isManager = userRole === "MANAGER";
  const isEmployee = userRole === "EMPLOYEE";

  // ============================================================
  // POINTS DE VENTE
  // ============================================================

  const {
    pointOfSales,
    isLoading: isLoadingPointOfSales,
    fetchPointOfSales,
    refreshPointOfSales,
  } = usePointOfSaleStore();

  // ============================================================
  // CLIENTS
  // ============================================================

  const {
    customers,
    pagination,
    search,
    selectedPointOfSale,

    isLoading,
    isRefreshing,
    isLoadingMore,

    error,

    setAvailablePointOfSales,
    selectPointOfSale,

    fetchCustomers,
    refreshCustomers,
    setSearch,
    searchCustomers,
    loadMoreCustomers,

    clearError,
  } = useCustomerStore();

  const [searchInput, setSearchInput] = useState(search);

  // ============================================================
  // POS ACTIFS
  // ============================================================

  const activePointOfSales = useMemo<CustomerPointOfSale[]>(() => {
    return pointOfSales
      .filter((pointOfSale) => pointOfSale.isActive)
      .map((pointOfSale) => ({
        id: pointOfSale.id,
        name: pointOfSale.name,
        code: pointOfSale.code,
        isMainStore: pointOfSale.isMainStore,
        isActive: pointOfSale.isActive,
      }));
  }, [pointOfSales]);

  // ============================================================
  // CHARGEMENT DES POS
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      const loadPointOfSales = async () => {
        try {
          if (pointOfSales.length === 0) {
            await fetchPointOfSales();
          } else {
            await refreshPointOfSales();
          }
        } catch (loadError) {
          console.error("Erreur chargement points de vente :", loadError);
        }
      };

      loadPointOfSales();
    }, [pointOfSales.length, fetchPointOfSales, refreshPointOfSales]),
  );

  // ============================================================
  // CONFIGURATION DES POS DISPONIBLES
  // ============================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    // ----------------------------------------------------------
    // MANAGER
    // ----------------------------------------------------------

    if (isManager) {
      setAvailablePointOfSales(activePointOfSales);

      return;
    }

    // ----------------------------------------------------------
    // EMPLOYEE
    // ----------------------------------------------------------

    if (isEmployee) {
      const assignedPointOfSales = activePointOfSales.filter((pointOfSale) => {
        const fullPointOfSale = pointOfSales.find(
          (item) => item.id === pointOfSale.id,
        );

        return (
          fullPointOfSale?.staffAssignments.some(
            (assignment) =>
              assignment.isActive && assignment.user.id === user.id,
          ) ?? false
        );
      });

      setAvailablePointOfSales(assignedPointOfSales);
    }
  }, [
    user,
    isManager,
    isEmployee,
    activePointOfSales,
    pointOfSales,
    setAvailablePointOfSales,
  ]);

  // ============================================================
  // CHARGEMENT INITIAL DES CLIENTS
  // ============================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    // Aucun POS disponible pour l'employé :
    // surtout ne pas appeler fetchCustomers().
    if (isEmployee && !selectedPointOfSale) {
      return;
    }

    if (!selectedPointOfSale) {
      return;
    }

    if (customers.length > 0) {
      return;
    }

    fetchCustomers().catch((fetchError) => {
      console.error("Erreur chargement clients :", fetchError);
    });
  }, [user, isEmployee, selectedPointOfSale, customers.length, fetchCustomers]);

  // ============================================================
  // RECHERCHE
  // ============================================================

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // ============================================================
  // RECHERCHE DEBBOUNCE
  // ============================================================

  useEffect(() => {
    if (!selectedPointOfSale) {
      return;
    }

    const timeout = setTimeout(() => {
      const cleanSearch = searchInput.trim();

      // Met à jour la recherche du store uniquement
      // lorsque l'utilisateur a arrêté de taper.
      setSearch(cleanSearch);

      searchCustomers(cleanSearch).catch((searchError) => {
        console.error("Erreur recherche clients :", searchError);
      });
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput, selectedPointOfSale, searchCustomers, setSearch]);

  // ============================================================
  // CHANGEMENT DE POS
  // ============================================================

  const handlePointOfSaleChange = (pointOfSale: CustomerPointOfSale) => {
    if (
      pointOfSales.length === 0 ||
      pointOfSale.id === selectedPointOfSale?.id
    ) {
      return;
    }

    selectPointOfSale(pointOfSale).catch((selectError) => {
      console.error("Erreur changement point de vente :", selectError);
    });
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    if (!selectedPointOfSale) {
      return;
    }

    try {
      await refreshCustomers();
    } catch (refreshError) {
      console.error("Erreur actualisation clients :", refreshError);
    }
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination?.hasNextPage || !selectedPointOfSale) {
      return;
    }

    try {
      await loadMoreCustomers();
    } catch (loadError) {
      console.error("Erreur chargement clients supplémentaires :", loadError);
    }
  };

  // ============================================================
  // ETATS
  // ============================================================

  const hasNoPointOfSale = isEmployee && !selectedPointOfSale;

  const hasSearch = search.trim().length > 0;

  const showSkeleton =
    (isLoading || isLoadingPointOfSales) &&
    customers.length === 0 &&
    !hasNoPointOfSale;

  const showNoCustomers =
    !showSkeleton && !hasNoPointOfSale && customers.length === 0 && !hasSearch;

  const showNoResults =
    !showSkeleton && !hasNoPointOfSale && customers.length === 0 && hasSearch;

  const showErrorEmpty =
    !showSkeleton &&
    !hasNoPointOfSale &&
    customers.length === 0 &&
    !hasSearch &&
    !!error;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoadingPointOfSales}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

          const distanceFromBottom =
            contentSize.height - (layoutMeasurement.height + contentOffset.y);

          if (distanceFromBottom < 250) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={200}
      >
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <CustomerHeader />

        {/* ================================================== */}
        {/* POS SELECTOR — MANAGER UNIQUEMENT                 */}
        {/* ================================================== */}

        {isManager && activePointOfSales.length > 0 && (
          <View style={styles.posSection}>
            <CustomerPosSelector
              pointOfSales={activePointOfSales}
              selectedPointOfSale={selectedPointOfSale}
              onSelect={handlePointOfSaleChange}
              disabled={isLoading || isRefreshing}
            />
          </View>
        )}

        {/* ================================================== */}
        {/* EMPLOYEE SANS POS                                 */}
        {/* ================================================== */}

        {hasNoPointOfSale && <CustomerEmpty variant="no-point-of-sale" />}

        {/* ================================================== */}
        {/* CONTENU CLIENTS                                   */}
        {/* ================================================== */}

        {!hasNoPointOfSale && (
          <>
            {/* ---------------------------------------------- */}
            {/* SEARCH                                         */}
            {/* ---------------------------------------------- */}

            <View style={styles.searchSection}>
              <CustomerSearchBar
                value={searchInput}
                onChangeText={handleSearchChange}
                disabled={!selectedPointOfSale}
              />
            </View>

            {/* ---------------------------------------------- */}
            {/* STATS                                          */}
            {/* ---------------------------------------------- */}

            {!showSkeleton && selectedPointOfSale && (
              <CustomerStats
                totalCustomers={pagination?.total ?? customers.length}
                pointOfSale={selectedPointOfSale}
                isSearching={hasSearch}
              />
            )}

            {/* ---------------------------------------------- */}
            {/* SKELETON                                       */}
            {/* ---------------------------------------------- */}

            {showSkeleton && <CustomerListSkeleton count={5} />}

            {/* ---------------------------------------------- */}
            {/* EMPTY — NO CLIENTS                             */}
            {/* ---------------------------------------------- */}

            {showNoCustomers && <CustomerEmpty variant="no-customers" />}

            {/* ---------------------------------------------- */}
            {/* EMPTY — NO RESULT                              */}
            {/* ---------------------------------------------- */}

            {showNoResults && (
              <CustomerEmpty variant="no-results" search={search} />
            )}

            {/* ---------------------------------------------- */}
            {/* ERREUR SANS CACHE                              */}
            {/* ---------------------------------------------- */}

            {showErrorEmpty && !customers.length && (
              <View style={styles.errorContainer}>
                <CustomerEmpty variant="no-customers" />

                <View style={styles.errorMessage}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={COLORS.error}
                    />
                  </View>

                  <Text style={styles.errorText}>{error}</Text>

                  <Pressable
                    style={styles.retryButton}
                    onPress={() => {
                      clearError();

                      fetchCustomers().catch((fetchError) => {
                        console.error(
                          "Erreur nouvelle tentative clients :",
                          fetchError,
                        );
                      });
                    }}
                  >
                    <Text style={styles.retryText}>Réessayer</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* ---------------------------------------------- */}
            {/* LISTE                                          */}
            {/* ---------------------------------------------- */}

            {!showSkeleton && customers.length > 0 && (
              <View style={styles.list}>
                {customers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    pointOfSaleId={selectedPointOfSale!.id}
                    disabled={isLoadingMore}
                  />
                ))}

                {/* Chargement pagination */}
                {isLoadingMore && <CustomerListSkeleton count={2} />}
              </View>
            )}
          </>
        )}

        {/* ================================================== */}
        {/* ESPACE BAS                                        */}
        {/* ================================================== */}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 40,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ==========================================================
  // POS
  // ==========================================================

  posSection: {
    marginBottom: 14,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchSection: {
    marginBottom: 14,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  list: {
    width: "100%",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorContainer: {
    width: "100%",
  },

  errorMessage: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F5D4D4",
  },

  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9DCDC",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  retryButton: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8BDBD",
  },

  retryText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.error,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 100,
  },
});
