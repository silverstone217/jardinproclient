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

import { Ionicons } from "@expo/vector-icons";

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
    isAllPointOfSales,

    isLoading,
    isRefreshing,
    isLoadingMore,

    error,

    setAvailablePointOfSales,
    selectPointOfSale,
    selectAllPointOfSales,

    fetchCustomers,
    refreshCustomers,
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
    //
    // Le manager peut consulter :
    // - tous les POS
    // - un POS précis
    //

    if (isManager) {
      setAvailablePointOfSales(activePointOfSales);
      return;
    }

    // ----------------------------------------------------------
    // EMPLOYEE
    // ----------------------------------------------------------
    //
    // L'employé ne voit que les POS auxquels il est assigné.
    //

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
  // CONFIGURATION DU SCOPE INITIAL
  // ============================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    // ----------------------------------------------------------
    // MANAGER
    // ----------------------------------------------------------
    //
    // Par défaut, le manager travaille sur TOUS les POS.
    //
    // On ne sélectionne donc pas automatiquement le premier POS.
    //

    if (isManager) {
      if (!isAllPointOfSales && !selectedPointOfSale) {
        selectAllPointOfSales().catch((loadError) => {
          console.error("Erreur chargement clients tous POS :", loadError);
        });
      }

      return;
    }

    // ----------------------------------------------------------
    // EMPLOYEE
    // ----------------------------------------------------------
    //
    // L'employé doit avoir un POS assigné.
    //

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

      // Aucun POS assigné.
      if (assignedPointOfSales.length === 0) {
        return;
      }

      // POS déjà sélectionné et toujours valide.
      const currentPointOfSaleIsValid =
        selectedPointOfSale &&
        assignedPointOfSales.some(
          (pointOfSale) => pointOfSale.id === selectedPointOfSale.id,
        );

      if (currentPointOfSaleIsValid) {
        return;
      }

      // Sélection du premier POS assigné.
      selectPointOfSale(assignedPointOfSales[0]).catch((selectError) => {
        console.error("Erreur sélection POS employé :", selectError);
      });
    }
  }, [
    user,
    isManager,
    isEmployee,
    isAllPointOfSales,
    selectedPointOfSale,
    activePointOfSales,
    pointOfSales,
    selectAllPointOfSales,
    selectPointOfSale,
  ]);

  // ============================================================
  // SYNCHRONISATION DE LA RECHERCHE
  // ============================================================

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // ============================================================
  // RECHERCHE
  // ============================================================

  const canSearch = isManager
    ? isAllPointOfSales || !!selectedPointOfSale
    : !!selectedPointOfSale;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // ============================================================
  // RECHERCHE DEBOUNCE
  // ============================================================

  useEffect(() => {
    if (!canSearch) {
      return;
    }

    const timeout = setTimeout(() => {
      const cleanSearch = searchInput.trim();

      searchCustomers(cleanSearch).catch((searchError) => {
        console.error("Erreur recherche clients :", searchError);
      });
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput, canSearch, searchCustomers]);

  // ============================================================
  // CHANGEMENT DE POS
  // ============================================================

  const handlePointOfSaleChange = (pointOfSale: CustomerPointOfSale | null) => {
    // Même sélection : aucune action
    if (
      (pointOfSale === null && isAllPointOfSales) ||
      (pointOfSale !== null &&
        pointOfSale.id === selectedPointOfSale?.id &&
        !isAllPointOfSales)
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
    try {
      await refreshPointOfSales();
      await refreshCustomers();
    } catch (refreshError) {
      console.error("Erreur actualisation clients :", refreshError);
    }
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination?.hasNextPage) {
      return;
    }

    // Pour un manager en mode ALL, aucun POS n'est requis.
    //
    // Pour un employé / manager sur un POS précis,
    // le store connaît déjà le POS sélectionné.

    if (isEmployee && !selectedPointOfSale) {
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

  const hasCustomerScope = isAllPointOfSales || !!selectedPointOfSale;

  const hasSearch = search.trim().length > 0;

  const showSkeleton =
    (isLoading || isLoadingPointOfSales) &&
    customers.length === 0 &&
    !hasNoPointOfSale;

  const showNoCustomers =
    !showSkeleton &&
    hasCustomerScope &&
    customers.length === 0 &&
    !hasSearch &&
    !error;

  const showNoResults =
    !showSkeleton &&
    hasCustomerScope &&
    customers.length === 0 &&
    hasSearch &&
    !error;

  const showErrorEmpty =
    !showSkeleton &&
    hasCustomerScope &&
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
        {/* EMPLOYEE SANS POS                                  */}
        {/* ================================================== */}

        {hasNoPointOfSale && <CustomerEmpty variant="no-point-of-sale" />}

        {/* ================================================== */}
        {/* CONTENU CLIENTS                                    */}
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
                disabled={!hasCustomerScope}
              />
            </View>

            {/* ---------------------------------------------- */}
            {/* STATS                                          */}
            {/* ---------------------------------------------- */}

            {!showSkeleton && hasCustomerScope && (
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
            {/* ERREUR SANS CACHE                               */}
            {/* ---------------------------------------------- */}

            {showErrorEmpty && (
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
                    pointOfSaleId={selectedPointOfSale?.id}
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

// ============================================================
// STYLES
// ============================================================

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
