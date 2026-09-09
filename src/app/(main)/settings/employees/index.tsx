import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, fonts } from "@/utils/styles";

import { useEmployeeStore } from "@/store/employee.store";

import type { Employee, EmployeeFormData } from "@/types/employee";

import EmployeeAddModal from "@/components/employees/EmployeeAddModal";
import EmployeeCard from "@/components/employees/EmployeeCard";
import EmployeeDetailsModal from "@/components/employees/EmployeeDetailsModal";
import EmployeeEditModal from "@/components/employees/EmployeeEditModal";
import EmployeeEmpty from "@/components/employees/EmployeeEmpty";
import EmployeeSearchBar from "@/components/employees/EmployeeSearchBar";
import EmployeeStats from "@/components/employees/EmployeeStats";
import { usePointOfSaleStore } from "@/store/pointOfSale.store";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const getAssignment = (employee: Employee) => {
  return employee.assignments.find((assignment) => assignment.isActive);
};

export default function EmployeesScreen() {
  const {
    employees,
    isLoading,
    isRefreshing,
    isSaving,
    isDeleting,
    error,
    fetchEmployees,
    refreshEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    clearError,
  } = useEmployeeStore();

  const [search, setSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const [detailsVisible, setDetailsVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const pointOfSales = usePointOfSaleStore((state) => state.pointOfSales);

  const router = useRouter();

  // ==========================================================
  // LOAD
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      fetchEmployees().catch(() => {});
    }, [fetchEmployees]),
  );

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    const active = employees.filter((employee) => employee.isActive).length;

    const assigned = employees.filter(
      (employee) => !!getAssignment(employee),
    ).length;

    return {
      total: employees.length,
      active,
      assigned,
    };
  }, [employees]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      const pointOfSale = getAssignment(employee)?.pointOfSale;

      return (
        employee.name.toLowerCase().includes(query) ||
        employee.telephone.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query) ||
        pointOfSale?.name.toLowerCase().includes(query) ||
        pointOfSale?.code.toLowerCase().includes(query)
      );
    });
  }, [employees, search]);

  // ==========================================================
  // DETAILS
  // ==========================================================

  const handleOpenDetails = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailsVisible(true);

    try {
      const freshEmployee = await getEmployee(employee.id);

      if (freshEmployee) {
        setSelectedEmployee(freshEmployee);
      }
    } catch {
      // Le cache reste utilisé.
    }
  };

  const handleCloseDetails = () => {
    if (isDeleting) {
      return;
    }

    setDetailsVisible(false);
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const handleOpenEdit = () => {
    if (!selectedEmployee) {
      return;
    }

    setDetailsVisible(false);

    setTimeout(() => {
      setEditVisible(true);
    }, 180);
  };

  const handleSaveEdit = async (data: EmployeeFormData) => {
    if (!selectedEmployee) {
      return;
    }

    await updateEmployee(selectedEmployee.id, {
      name: data.name,
      telephone: data.telephone,
      email: data.email,
      pointOfSaleId: data.pointOfSaleId || undefined,
      isActive: data.isActive,
    });

    const updated = useEmployeeStore.getState().selectedEmployee;

    if (updated) {
      setSelectedEmployee(updated);
    }

    setEditVisible(false);
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = () => {
    if (!selectedEmployee) {
      return;
    }

    Alert.alert(
      "Supprimer l'employé ?",
      `Le compte de ${selectedEmployee.name} sera définitivement supprimé. Cette action est irréversible.`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmployee(selectedEmployee.id);

              setDetailsVisible(false);
              setSelectedEmployee(null);

              Alert.alert(
                "Employé supprimé",
                "L'employé a été supprimé avec succès.",
              );
            } catch {
              // Le store contient l'erreur.
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      await refreshEmployees();
    } catch {
      // Le cache reste disponible.
    }
  };

  //   ADD EMPLOYEE
  const handleCreateEmployee = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);

      setAddVisible(false);

      Alert.alert("Employé ajouté", "L'employé a été créé avec succès.");
    } catch {
      // L'erreur est déjà gérée par le store
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.headerCard}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="people-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Personnel</Text>

                <View style={styles.headerCount}>
                  <Text style={styles.headerCountText}>{stats.total}</Text>
                </View>
              </View>

              <Text style={styles.headerSubtitle}>
                Gérez les employés de votre boutique
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setAddVisible(true)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Ionicons name="add" size={25} color={COLORS.white} />
          </Pressable>
        </View>

        {/* SEARCH */}

        <View style={styles.searchWrapper}>
          <EmployeeSearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* LIST */}

        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EmployeeCard
              employee={item}
              onPress={() => handleOpenDetails(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={[
            styles.listContent,
            filteredEmployees.length === 0 && styles.emptyList,
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
            <View>
              <EmployeeStats
                total={stats.total}
                active={stats.active}
                assigned={stats.assigned}
              />

              {employees.length > 0 && (
                <View style={styles.listHeader}>
                  <View>
                    <Text style={styles.listTitle}>
                      {search.trim() ? "Résultats" : "Vos employés"}
                    </Text>

                    <Text style={styles.listSubtitle}>
                      {filteredEmployees.length} résultat
                      {filteredEmployees.length > 1 ? "s" : ""}
                    </Text>
                  </View>

                  {search.trim() && (
                    <Text
                      onPress={() => {
                        setSearch("");
                        Keyboard.dismiss();
                      }}
                      style={styles.clearText}
                    >
                      Effacer
                    </Text>
                  )}
                </View>
              )}

              {error && employees.length === 0 && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>
                    Impossible de charger les employés pour le moment.
                  </Text>

                  <Text
                    style={styles.retryText}
                    onPress={() => {
                      clearError();

                      fetchEmployees().catch(() => {});
                    }}
                  >
                    Réessayer
                  </Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmployeeEmpty
                searching={search.trim().length > 0}
                onClearSearch={() => setSearch("")}
              />
            ) : null
          }
        />

        {/* LOADING */}

        {isLoading && employees.length === 0 && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={COLORS.primary} />

              <Text style={styles.loadingText}>Chargement du personnel...</Text>
            </View>
          </View>
        )}
      </View>

      {/* DETAILS MODAL */}

      <EmployeeDetailsModal
        visible={detailsVisible}
        employee={selectedEmployee}
        isDeleting={isDeleting}
        onClose={handleCloseDetails}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* ADD EMPLOYEE MODAL */}
      <EmployeeAddModal
        visible={addVisible}
        pointOfSales={pointOfSales}
        isSaving={isSaving}
        error={error}
        onClose={() => {
          setAddVisible(false);
          clearError();
        }}
        onSave={handleCreateEmployee}
      />

      {/* EDIT MODAL */}

      <EmployeeEditModal
        visible={editVisible}
        employee={selectedEmployee}
        isSaving={isSaving}
        error={error}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 20,
  },

  // ----------------------------------------------------------
  // HEADER
  // ----------------------------------------------------------

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
  },

  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 11,
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#E8F2E5",
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  headerCount: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    borderRadius: 8,
    backgroundColor: "#E8F2E5",
  },

  headerCountText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  addButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  headerButtonPressed: {
    opacity: 0.7,
  },

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerCountValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: COLORS.primary,
    lineHeight: 25,
  },

  headerCountLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.Gray,
    marginTop: 2,
  },

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },

  // ----------------------------------------------------------
  // LIST
  // ----------------------------------------------------------

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  listTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
  },

  listSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
    marginTop: 2,
  },

  clearText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.primary,
  },

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  errorBanner: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFDADA",
    borderRadius: 13,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  errorBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.error,
    marginRight: 8,
  },

  retryText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.error,
  },

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 145,
    alignItems: "center",
  },

  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.darkGray,
    marginLeft: 9,
  },
});
