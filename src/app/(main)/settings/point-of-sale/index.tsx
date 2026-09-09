import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PointOfSaleCard from "@/components/point-of-sale/PointOfSaleCard";
import PointOfSaleEmpty from "@/components/point-of-sale/PointOfSaleEmpty";
import PointOfSaleForm from "@/components/point-of-sale/PointOfSaleForm";
import PointOfSaleHeader from "@/components/point-of-sale/PointOfSaleHeader";

import { useEmployeeStore } from "@/store/employee.store";
import { usePointOfSaleStore } from "@/store/pointOfSale.store";

import type { PointOfSale, PointOfSaleFormData } from "@/types/point-of-sale";

import { COLORS, fonts } from "@/utils/styles";

// ============================================================
// ÉCRAN POINTS DE VENTE
// ============================================================

export default function PointOfSaleScreen() {
  const {
    pointOfSales,
    isLoading,
    isRefreshing,
    isSaving,
    isDeleting,
    isAssigningStaff,
    isRemovingStaff,
    error,

    fetchPointOfSales,
    refreshPointOfSales,
    createPointOfSale,
    updatePointOfSale,
    deletePointOfSale,

    assignEmployeeToPointOfSale,
    removeEmployeeFromPointOfSale,

    clearError,
  } = usePointOfSaleStore();

  const { employees, fetchEmployees } = useEmployeeStore();

  // ==========================================================
  // ÉTAT DU FORMULAIRE
  // ==========================================================

  const [isFormVisible, setIsFormVisible] = useState(false);

  const [editingPointOfSale, setEditingPointOfSale] =
    useState<PointOfSale | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const load = async () => {
        try {
          await Promise.all([fetchPointOfSales(), fetchEmployees()]);
        } catch {
          // Les stores gèrent eux-mêmes le cache
          // et les erreurs.
        }

        if (!mounted) {
          return;
        }
      };

      load();

      return () => {
        mounted = false;
      };
    }, [fetchPointOfSales, fetchEmployees]),
  );

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const activeCount = useMemo(() => {
    return pointOfSales.filter((pointOfSale) => pointOfSale.isActive).length;
  }, [pointOfSales]);

  const inactiveCount = useMemo(() => {
    return pointOfSales.filter((pointOfSale) => !pointOfSale.isActive).length;
  }, [pointOfSales]);

  const mainStoreCount = useMemo(() => {
    return pointOfSales.filter((pointOfSale) => pointOfSale.isMainStore).length;
  }, [pointOfSales]);

  // ==========================================================
  // RECHERCHE
  // ==========================================================

  const filteredPointOfSales = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return pointOfSales;
    }

    return pointOfSales.filter((pointOfSale) => {
      const name = pointOfSale.name.toLowerCase();
      const code = pointOfSale.code.toLowerCase();
      const address = pointOfSale.address?.toLowerCase() ?? "";

      return (
        name.includes(query) || code.includes(query) || address.includes(query)
      );
    });
  }, [pointOfSales, searchQuery]);

  // ==========================================================
  // OUVRIR LE FORMULAIRE
  // ==========================================================

  const handleAdd = useCallback(() => {
    clearError();
    setEditingPointOfSale(null);
    setIsFormVisible(true);
  }, [clearError]);

  const handleEdit = useCallback(
    (pointOfSale: PointOfSale) => {
      clearError();
      setEditingPointOfSale(pointOfSale);
      setIsFormVisible(true);
    },
    [clearError],
  );

  // ==========================================================
  // FERMER LE FORMULAIRE
  // ==========================================================

  const handleCloseForm = useCallback(() => {
    if (isSaving) {
      return;
    }

    clearError();
    setIsFormVisible(false);
    setEditingPointOfSale(null);
  }, [clearError, isSaving]);

  // ==========================================================
  // CRÉER / MODIFIER
  // ==========================================================

  const handleSubmit = useCallback(
    async (data: PointOfSaleFormData) => {
      try {
        clearError();

        if (editingPointOfSale) {
          await updatePointOfSale(editingPointOfSale.id, {
            name: data.name,
            code: data.code,
            telephone: data.telephone,
            address: data.address,
            isMainStore: data.isMainStore,
            isActive: data.isActive,
          });

          setIsFormVisible(false);
          setEditingPointOfSale(null);

          Alert.alert(
            "Point de vente modifié",
            "Les informations du point de vente ont été mises à jour.",
          );

          return;
        }

        await createPointOfSale({
          name: data.name,
          code: data.code,
          telephone: data.telephone,
          address: data.address,
          isMainStore: data.isMainStore,
          isActive: data.isActive,
        });

        setIsFormVisible(false);
        setEditingPointOfSale(null);

        Alert.alert(
          "Point de vente créé",
          "Le nouveau point de vente a été ajouté avec succès.",
        );
      } catch {
        // Le formulaire affiche l'erreur du store.
      }
    },
    [clearError, createPointOfSale, editingPointOfSale, updatePointOfSale],
  );

  // ==========================================================
  // SUPPRIMER
  // ==========================================================

  const handleDelete = useCallback(
    async (pointOfSale: PointOfSale) => {
      if (isDeleting) {
        return;
      }

      try {
        await deletePointOfSale(pointOfSale.id);

        Alert.alert(
          "Point de vente supprimé",
          `« ${pointOfSale.name} » a été supprimé avec succès.`,
        );
      } catch {
        Alert.alert(
          "Suppression impossible",
          usePointOfSaleStore.getState().error ||
            "Impossible de supprimer ce point de vente.",
        );
      }
    },
    [deletePointOfSale, isDeleting],
  );

  // ==========================================================
  // AFFECTER UN EMPLOYÉ
  // ==========================================================

  const handleAssignEmployee = useCallback(
    async (pointOfSaleId: string, employeeId: string) => {
      try {
        await assignEmployeeToPointOfSale(pointOfSaleId, employeeId);

        // On rafraîchit également la liste des employés.
        // Cela permet de retirer immédiatement l'employé
        // de la liste des employés disponibles.
        try {
          await fetchEmployees();
        } catch {
          // Le POS est déjà correctement mis à jour.
        }

        Alert.alert(
          "Employé affecté",
          "L'employé a été affecté avec succès à ce point de vente.",
        );
      } catch {
        Alert.alert(
          "Affectation impossible",
          usePointOfSaleStore.getState().error ||
            "Impossible d'affecter cet employé.",
        );

        throw new Error("EMPLOYEE_ASSIGNMENT_FAILED");
      }
    },
    [assignEmployeeToPointOfSale, fetchEmployees],
  );

  // ==========================================================
  // RETIRER UN EMPLOYÉ
  // ==========================================================

  const handleRemoveEmployee = useCallback(
    async (pointOfSaleId: string, employeeId: string, employeeName: string) => {
      if (isRemovingStaff) {
        return;
      }

      try {
        await removeEmployeeFromPointOfSale(pointOfSaleId, employeeId);

        try {
          await fetchEmployees();
        } catch {
          // Le POS est déjà correctement mis à jour.
        }

        Alert.alert(
          "Employé retiré",
          `« ${employeeName} » n'est plus affecté à ce point de vente.`,
        );
      } catch {
        Alert.alert(
          "Retrait impossible",
          usePointOfSaleStore.getState().error ||
            "Impossible de retirer cet employé.",
        );

        throw new Error("EMPLOYEE_REMOVAL_FAILED");
      }
    },
    [fetchEmployees, isRemovingStaff, removeEmployeeFromPointOfSale],
  );

  // ==========================================================
  // RAFRAÎCHIR
  // ==========================================================

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refreshPointOfSales(), fetchEmployees()]);
    } catch {
      // Le cache reste affiché silencieusement.
    }
  }, [fetchEmployees, refreshPointOfSales]);

  // ==========================================================
  // AJOUTER UN EMPLOYÉ
  // ==========================================================

  const handleAddEmployee = useCallback(() => {
    Alert.alert(
      "Ajouter un employé",
      "Utilisez la section « Personnel » pour créer un nouvel employé.",
    );
  }, []);

  // ==========================================================
  // RENDU D'UN POINT DE VENTE
  // ==========================================================

  const renderPointOfSale = useCallback(
    ({ item }: { item: PointOfSale }) => (
      <PointOfSaleCard
        pointOfSale={item}
        employees={employees}
        isAssigningStaff={isAssigningStaff}
        isRemovingStaff={isRemovingStaff}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssignEmployee={handleAssignEmployee}
        onRemoveEmployee={handleRemoveEmployee}
        onAddEmployee={handleAddEmployee}
      />
    ),
    [
      employees,
      handleAddEmployee,
      handleAssignEmployee,
      handleEdit,
      handleDelete,
      handleRemoveEmployee,
      isAssigningStaff,
      isRemovingStaff,
    ],
  );

  // ==========================================================
  // KEY EXTRACTOR
  // ==========================================================

  const keyExtractor = useCallback((item: PointOfSale) => item.id, []);

  // ==========================================================
  // ÉTAT DE CHARGEMENT INITIAL
  // ==========================================================

  if (isLoading && pointOfSales.length === 0) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="storefront-outline"
            size={28}
            color={COLORS.primary}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.loader}
        />

        <Text style={styles.loadingTitle}>Chargement des points de vente</Text>

        <Text style={styles.loadingDescription}>
          Préparation de votre espace de gestion...
        </Text>
      </View>
    );
  }

  // ==========================================================
  // ERREUR SANS DONNÉES
  // ==========================================================

  if (error && pointOfSales.length === 0) {
    return (
      <View style={styles.errorScreen}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={COLORS.error}
          />
        </View>

        <Text style={styles.errorTitle}>
          Impossible de charger les points de vente
        </Text>

        <Text style={styles.errorDescription}>{error}</Text>

        <Text
          style={styles.retryButton}
          onPress={() => {
            clearError();
            fetchPointOfSales().catch(() => {});
            fetchEmployees().catch(() => {});
          }}
        >
          Réessayer
        </Text>
      </View>
    );
  }

  // ==========================================================
  // ÉCRAN PRINCIPAL
  // ==========================================================

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredPointOfSales}
        keyExtractor={keyExtractor}
        renderItem={renderPointOfSale}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={[
          styles.contentContainer,
          filteredPointOfSales.length === 0 && styles.emptyContentContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <PointOfSaleHeader
            total={pointOfSales.length}
            active={activeCount}
            inactive={inactiveCount}
            mainStore={mainStoreCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
          />
        }
        ListEmptyComponent={
          searchQuery.trim().length > 0 ? (
            <View style={styles.noSearchResult}>
              <View style={styles.noSearchIcon}>
                <Ionicons name="search-outline" size={30} color={COLORS.Gray} />
              </View>

              <Text style={styles.noSearchTitle}>Aucun résultat</Text>

              <Text style={styles.noSearchDescription}>
                Aucun point de vente ne correspond à « {searchQuery.trim()} ».
              </Text>
            </View>
          ) : (
            <PointOfSaleEmpty onAdd={handleAdd} />
          )
        }
        ListFooterComponent={
          filteredPointOfSales.length > 0 ? (
            <View style={styles.footer}>
              <View style={styles.footerIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={COLORS.Gray}
                />
              </View>

              <Text style={styles.footerText}>
                Les points de vente permettent de suivre séparément les stocks,
                ventes et activités de chaque espace.
              </Text>
            </View>
          ) : null
        }
      />

      <PointOfSaleForm
        visible={isFormVisible}
        pointOfSale={editingPointOfSale}
        isSaving={isSaving}
        error={error}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 30,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  emptyContentContainer: {
    flexGrow: 1,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: COLORS.background,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  loader: {
    marginTop: 20,
  },

  loadingTitle: {
    marginTop: 14,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
  },

  loadingDescription: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // ERREUR
  // ==========================================================

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: COLORS.background,
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  errorTitle: {
    marginTop: 16,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 23,
    color: COLORS.text,
    textAlign: "center",
  },

  errorDescription: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.Gray,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.primary,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.white,
    textAlign: "center",
  },

  // ==========================================================
  // RECHERCHE VIDE
  // ==========================================================

  noSearchResult: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 55,
    paddingBottom: 40,
  },

  noSearchIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EEEEEA",
    alignItems: "center",
    justifyContent: "center",
  },

  noSearchTitle: {
    marginTop: 16,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
    textAlign: "center",
  },

  noSearchDescription: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  footerIcon: {
    marginTop: 1,
    marginRight: 7,
  },

  footerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.Gray,
  },
});
