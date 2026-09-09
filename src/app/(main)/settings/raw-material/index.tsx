import { useCallback, useEffect, useMemo, useState } from "react";

import { Ionicons } from "@expo/vector-icons";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { RawMaterialCard } from "@/components/rawMaterials/RawMaterialCard";

import { RawMaterialDetailsModal } from "@/components/rawMaterials/RawMaterialDetailsModal";

import { RawMaterialFormModal } from "@/components/rawMaterials/RawMaterialFormModal";

import type { RawIngredient } from "@/types/raw-ingredient";

import { useRawIngredientStore } from "@/store/raw-ingredient.store";

import { COLORS, fonts } from "@/utils/styles";

type FilterType = "all" | "active" | "low" | "inactive";

export default function RawMaterialScreen() {
  const {
    rawIngredients,
    isLoading,
    isRefreshing,
    isCreating,
    isUpdating,
    isAdjustingStock,
    isDeleting,
    isInitialized,
    error,

    initialize,
    refreshRawIngredients,
    createRawIngredient,
    updateRawIngredient,
    adjustRawIngredientStock,
    setRawIngredientActive,
    deleteRawIngredient,
    clearError,
  } = useRawIngredientStore();

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<FilterType>("all");

  const [selectedIngredient, setSelectedIngredient] =
    useState<RawIngredient | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ============================================================
  // STATISTIQUES
  // ============================================================

  const activeCount = useMemo(
    () => rawIngredients.filter((item) => item.isActive).length,
    [rawIngredients],
  );

  const inactiveCount = useMemo(
    () => rawIngredients.filter((item) => !item.isActive).length,
    [rawIngredients],
  );

  const lowStockCount = useMemo(
    () =>
      rawIngredients.filter(
        (item) => item.isActive && item.stockQty <= item.minAlert,
      ).length,
    [rawIngredients],
  );

  // ============================================================
  // FILTRAGE
  // ============================================================

  const filteredIngredients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rawIngredients.filter((ingredient) => {
      const matchesSearch =
        normalizedSearch === "" ||
        ingredient.name.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      switch (filter) {
        case "active":
          return ingredient.isActive;

        case "low":
          return (
            ingredient.isActive && ingredient.stockQty <= ingredient.minAlert
          );

        case "inactive":
          return !ingredient.isActive;

        default:
          return true;
      }
    });
  }, [rawIngredients, search, filter]);

  // ============================================================
  // OUVRIR DÉTAILS
  // ============================================================

  const handleOpenDetails = useCallback((ingredient: RawIngredient) => {
    setSelectedIngredient(ingredient);
    setShowDetails(true);
  }, []);

  // ============================================================
  // OUVRIR AJOUT
  // ============================================================

  const handleOpenCreate = useCallback(() => {
    setFormMode("create");
    setSelectedIngredient(null);
    setShowForm(true);
  }, []);

  // ============================================================
  // OUVRIR MODIFICATION
  // ============================================================

  const handleOpenEdit = useCallback((ingredient: RawIngredient) => {
    setSelectedIngredient(ingredient);
    setFormMode("edit");
    setShowDetails(false);
    setShowForm(true);
  }, []);

  // ============================================================
  // CRÉER
  // ============================================================

  const handleCreate = async (data: {
    name: string;
    unit: RawIngredient["unit"];
    stockQty?: number;
    minAlert: number;
    isActive?: boolean;
  }) => {
    try {
      await createRawIngredient({
        name: data.name,
        unit: data.unit,
        stockQty: data.stockQty ?? 0,
        minAlert: data.minAlert,
        isActive: data.isActive ?? true,
      });

      setShowForm(false);

      Alert.alert(
        "Matière ajoutée",
        `« ${data.name} » a été ajoutée avec succès.`,
      );
    } catch {
      Alert.alert(
        "Ajout impossible",
        useRawIngredientStore.getState().error ||
          "Impossible d'ajouter cette matière première.",
      );
    }
  };

  // ============================================================
  // MODIFIER
  // ============================================================

  const handleUpdate = async (data: {
    name: string;
    unit: RawIngredient["unit"];
    stockQty?: number;
    minAlert: number;
    isActive?: boolean;
  }) => {
    if (!selectedIngredient) {
      return;
    }

    try {
      const updated = await updateRawIngredient(selectedIngredient.id, {
        name: data.name,
        unit: data.unit,
        minAlert: data.minAlert,
        isActive: data.isActive,
      });

      setSelectedIngredient(updated);

      setShowForm(false);

      Alert.alert("Matière modifiée", "Les informations ont été mises à jour.");
    } catch {
      Alert.alert(
        "Modification impossible",
        useRawIngredientStore.getState().error ||
          "Impossible de modifier cette matière première.",
      );
    }
  };

  // ============================================================
  // AJUSTEMENT STOCK
  // ============================================================

  const handleAdjustStock = async (quantity: number, note?: string) => {
    if (!selectedIngredient) {
      return;
    }

    try {
      const updated = await adjustRawIngredientStock(selectedIngredient.id, {
        quantity,
        note,
      });

      setSelectedIngredient(updated);

      Alert.alert("Stock mis à jour", "La quantité de stock a été ajustée.");
    } catch {
      Alert.alert(
        "Ajustement impossible",
        useRawIngredientStore.getState().error ||
          "Impossible d'ajuster le stock.",
      );

      throw new Error("STOCK_ADJUSTMENT_FAILED");
    }
  };

  // ============================================================
  // ACTIVER / DÉSACTIVER
  // ============================================================

  const handleToggleActive = async (isActive: boolean) => {
    if (!selectedIngredient) {
      return;
    }

    try {
      const updated = await setRawIngredientActive(
        selectedIngredient.id,
        isActive,
      );

      setSelectedIngredient(updated);

      Alert.alert(
        isActive ? "Matière activée" : "Matière désactivée",
        isActive
          ? "La matière est à nouveau active."
          : "La matière a été désactivée.",
      );
    } catch {
      Alert.alert(
        "Opération impossible",
        useRawIngredientStore.getState().error ||
          "Impossible de modifier le statut.",
      );

      throw new Error("STATUS_UPDATE_FAILED");
    }
  };

  // ============================================================
  // SUPPRIMER
  // ============================================================

  const handleDelete = async () => {
    if (!selectedIngredient) {
      return;
    }

    try {
      await deleteRawIngredient(selectedIngredient.id);

      setShowDetails(false);
      setSelectedIngredient(null);

      Alert.alert("Matière supprimée", "La matière première a été supprimée.");
    } catch {
      Alert.alert(
        "Suppression impossible",
        useRawIngredientStore.getState().error ||
          "Cette matière ne peut probablement pas être supprimée car elle possède un historique.",
      );

      throw new Error("DELETE_FAILED");
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    clearError();
    await refreshRawIngredients();
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (isLoading && !isInitialized && rawIngredients.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <Ionicons name="leaf-outline" size={28} color={COLORS.primary} />
          </View>

          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingIndicator}
          />

          <Text style={styles.loadingTitle}>Chargement des matières</Text>

          <Text style={styles.loadingText}>Récupération de votre stock...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
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
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>STOCK</Text>

            <Text style={styles.title}>Matières premières</Text>

            <Text style={styles.subtitle}>
              Gérez les ingrédients utilisés pour vos productions.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleOpenCreate}
          >
            <Ionicons name="add" size={22} color={COLORS.white} />
          </Pressable>
        </View>

        {/* ================================================== */}
        {/* SUMMARY                                            */}
        {/* ================================================== */}

        <View style={styles.summary}>
          <View style={styles.summaryMain}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="layers-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.summaryValue}>{rawIngredients.length}</Text>

              <Text style={styles.summaryLabel}>Matières enregistrées</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemValue}>{activeCount}</Text>

            <Text style={styles.summaryItemLabel}>Actives</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryItemValue,
                lowStockCount > 0 && styles.summaryWarning,
              ]}
            >
              {lowStockCount}
            </Text>

            <Text style={styles.summaryItemLabel}>Stock faible</Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* SEARCH                                             */}
        {/* ================================================== */}

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={19} color={COLORS.Gray} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher une matière..."
            placeholderTextColor={COLORS.Gray}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={COLORS.Gray} />
            </Pressable>
          )}
        </View>

        {/* ================================================== */}
        {/* FILTERS                                            */}
        {/* ================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <FilterButton
            label="Toutes"
            count={rawIngredients.length}
            active={filter === "all"}
            onPress={() => setFilter("all")}
          />

          <FilterButton
            label="Actives"
            count={activeCount}
            active={filter === "active"}
            onPress={() => setFilter("active")}
          />

          <FilterButton
            label="Stock faible"
            count={lowStockCount}
            active={filter === "low"}
            warning
            onPress={() => setFilter("low")}
          />

          {inactiveCount > 0 && (
            <FilterButton
              label="Inactives"
              count={inactiveCount}
              active={filter === "inactive"}
              onPress={() => setFilter("inactive")}
            />
          )}
        </ScrollView>

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
        {/* SECTION TITLE                                      */}
        {/* ================================================== */}

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>
              {filter === "all"
                ? "Toutes les matières"
                : filter === "active"
                  ? "Matières actives"
                  : filter === "low"
                    ? "Stocks à surveiller"
                    : "Matières inactives"}
            </Text>

            <Text style={styles.listSubtitle}>
              {filteredIngredients.length} résultat
              {filteredIngredients.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* LIST                                               */}
        {/* ================================================== */}

        {filteredIngredients.length > 0 ? (
          <View>
            {filteredIngredients.map((ingredient) => (
              <RawMaterialCard
                key={ingredient.id}
                ingredient={ingredient}
                onPress={() => handleOpenDetails(ingredient)}
                onEdit={() => handleOpenEdit(ingredient)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={search.trim() ? "search-outline" : "leaf-outline"}
                size={28}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {search.trim()
                ? "Aucun résultat"
                : filter === "low"
                  ? "Aucun stock faible"
                  : "Aucune matière première"}
            </Text>

            <Text style={styles.emptyText}>
              {search.trim()
                ? `Aucune matière ne correspond à « ${search.trim()} ».`
                : filter === "low"
                  ? "Toutes vos matières ont actuellement un stock supérieur au seuil d'alerte."
                  : "Commencez par ajouter votre première matière première."}
            </Text>

            {!search.trim() && filter === "all" && (
              <Pressable
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={handleOpenCreate}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />

                <Text style={styles.emptyButtonText}>Ajouter une matière</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ==================================================== */}
      {/* CREATE / EDIT MODAL                                 */}
      {/* ==================================================== */}

      <RawMaterialFormModal
        visible={showForm}
        mode={formMode}
        ingredient={formMode === "edit" ? selectedIngredient : null}
        isSubmitting={formMode === "create" ? isCreating : isUpdating}
        onClose={() => setShowForm(false)}
        onSubmit={formMode === "create" ? handleCreate : handleUpdate}
      />

      {/* ==================================================== */}
      {/* DETAILS MODAL                                       */}
      {/* ==================================================== */}

      <RawMaterialDetailsModal
        visible={showDetails}
        ingredient={selectedIngredient}
        isAdjustingStock={isAdjustingStock}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
        onClose={() => setShowDetails(false)}
        onEdit={() => {
          setShowDetails(false);
          setFormMode("edit");
          setShowForm(true);
        }}
        onAdjustStock={handleAdjustStock}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

// ============================================================
// FILTER BUTTON
// ============================================================

interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  warning?: boolean;
  onPress: () => void;
}

function FilterButton({
  label,
  count,
  active,
  warning = false,
  onPress,
}: FilterButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterButton,
        active && styles.filterButtonActive,
        warning && active && styles.filterButtonWarning,
        pressed && styles.filterPressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          active && styles.filterTextActive,
          warning && active && styles.filterTextWarning,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.filterCount,
          active && styles.filterCountActive,
          warning && active && styles.filterCountWarning,
        ]}
      >
        <Text
          style={[
            styles.filterCountText,
            active && styles.filterCountTextActive,
            warning && active && styles.filterCountTextWarning,
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerText: {
    flex: 1,
    paddingRight: 15,
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
    fontSize: 24,
    lineHeight: 29,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  addButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  addButtonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summary: {
    minHeight: 83,
    padding: 13,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  summaryMain: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  summaryValue: {
    marginLeft: 9,
    fontFamily: fonts.bold,
    fontSize: 19,
    color: COLORS.text,
  },

  summaryLabel: {
    marginLeft: 9,
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  summaryDivider: {
    width: 1,
    height: 38,
    marginHorizontal: 10,
    backgroundColor: "#E9E9E6",
  },

  summaryItem: {
    flex: 0.75,
    alignItems: "center",
  },

  summaryItemValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.primary,
  },

  summaryWarning: {
    color: "#D88A00",
  },

  summaryItemLabel: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    minHeight: 49,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E6E6E3",
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 9,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: COLORS.text,
  },

  // ==========================================================
  // FILTERS
  // ==========================================================

  filters: {
    paddingTop: 11,
    paddingBottom: 3,
    gap: 8,
  },

  filterButton: {
    minHeight: 35,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E6E6E3",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  filterButtonActive: {
    backgroundColor: "#EAF2E7",
    borderColor: "#C9DDC5",
  },

  filterButtonWarning: {
    backgroundColor: "#FFF4D9",
    borderColor: "#EBD69E",
  },

  filterPressed: {
    opacity: 0.65,
  },

  filterText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  filterTextActive: {
    color: COLORS.primary,
    fontFamily: fonts.semibold,
  },

  filterTextWarning: {
    color: "#B87900",
  },

  filterCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EF",
  },

  filterCountActive: {
    backgroundColor: COLORS.primary,
  },

  filterCountWarning: {
    backgroundColor: "#D88A00",
  },

  filterCountText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: COLORS.Gray,
  },

  filterCountTextActive: {
    color: COLORS.white,
  },

  filterCountTextWarning: {
    color: COLORS.white,
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBanner: {
    marginTop: 13,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F5D5D5",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  // ==========================================================
  // LIST HEADER
  // ==========================================================

  listHeader: {
    marginTop: 19,
    marginBottom: 11,
  },

  listTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  listSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    marginTop: 10,
    paddingHorizontal: 25,
    paddingVertical: 38,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  emptyTitle: {
    marginTop: 13,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 17,
    minHeight: 43,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  emptyButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
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
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  loadingIndicator: {
    marginTop: 19,
  },

  loadingTitle: {
    marginTop: 12,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: COLORS.text,
  },

  loadingText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpace: {
    height: 100,
  },
});
