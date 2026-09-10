import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
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

import { PackagingCard } from "@/components/packaging/PackagingCard";
import { PackagingFormModal } from "@/components/packaging/PackagingFormModal";
import { PackagingHeader } from "@/components/packaging/PackagingHeader";
import { PackagingStockModal } from "@/components/packaging/PackagingStockModal";

import { usePackagingStore } from "@/store/packaging.store";

import type { Packaging, PackagingSize } from "@/types/packaging";

import { PackagingEmptyState } from "@/components/packaging/PackagingEmptyState";
import { COLORS, fonts, fontSizes } from "@/utils/styles";

type SizeFilter = "ALL" | PackagingSize;

export default function PackagingScreen() {
  const {
    packagings,
    isLoading,
    isRefreshing,
    isCreating,
    isUpdating,
    isAdjustingStock,
    isDeleting,
    error,

    initialize,
    refreshPackagings,
    createPackaging,
    updatePackaging,
    adjustPackagingStock,
    setPackagingActive,
    deletePackaging,
    clearError,
  } = usePackagingStore();

  const [search, setSearch] = useState("");

  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("ALL");

  const [showFormModal, setShowFormModal] = useState(false);

  const [selectedPackaging, setSelectedPackaging] = useState<Packaging | null>(
    null,
  );

  const [showStockModal, setShowStockModal] = useState(false);

  // ============================================================
  // INITIALISATION
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      initialize().catch((error) => {
        console.error("Erreur initialisation emballages :", error);
      });
    }, [initialize]),
  );

  // ============================================================
  // FILTER
  // ============================================================

  const filteredPackagings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return packagings.filter((packaging) => {
      const matchesSearch =
        !normalizedSearch ||
        packaging.name.toLowerCase().includes(normalizedSearch);

      const matchesSize = sizeFilter === "ALL" || packaging.size === sizeFilter;

      return matchesSearch && matchesSize;
    });
  }, [packagings, search, sizeFilter]);

  // ============================================================
  // STATS
  // ============================================================

  const activeCount = useMemo(
    () => packagings.filter((packaging) => packaging.isActive).length,
    [packagings],
  );

  const lowStockCount = useMemo(
    () =>
      packagings.filter((packaging) => packaging.stockQty <= packaging.minAlert)
        .length,
    [packagings],
  );

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = async (data: {
    name: string;
    size: PackagingSize;
    capacityMl: number;
    minAlert: number;
  }) => {
    try {
      await createPackaging(data);

      setShowFormModal(false);

      Alert.alert("Emballage créé", "L'emballage a été ajouté avec succès.");
    } catch (error) {
      console.error("Erreur création emballage :", error);

      Alert.alert(
        "Création impossible",
        usePackagingStore.getState().error ??
          "Impossible de créer l'emballage.",
      );
    }
  };

  // ============================================================
  // UPDATE
  // ============================================================

  const handleUpdate = async (data: {
    name: string;
    size: PackagingSize;
    capacityMl: number;
    minAlert: number;
  }) => {
    if (!selectedPackaging) {
      return;
    }

    try {
      await updatePackaging(selectedPackaging.id, data);

      setShowFormModal(false);
      setSelectedPackaging(null);

      Alert.alert(
        "Emballage modifié",
        "Les informations ont été mises à jour avec succès.",
      );
    } catch (error) {
      console.error("Erreur modification emballage :", error);

      Alert.alert(
        "Modification impossible",
        usePackagingStore.getState().error ??
          "Impossible de modifier l'emballage.",
      );
    }
  };

  // ============================================================
  // STOCK
  // ============================================================

  const handleAdjustStock = async (data: {
    quantity: number;
    note?: string;
  }) => {
    if (!selectedPackaging) {
      return;
    }

    try {
      await adjustPackagingStock(selectedPackaging.id, data);

      setShowStockModal(false);
      setSelectedPackaging(null);

      Alert.alert(
        "Stock ajusté",
        "Le stock de l'emballage a été mis à jour avec succès.",
      );
    } catch (error) {
      console.error("Erreur ajustement stock emballage :", error);

      Alert.alert(
        "Ajustement impossible",
        usePackagingStore.getState().error ?? "Impossible d'ajuster le stock.",
      );
    }
  };

  // ============================================================
  // ACTIVE / INACTIVE
  // ============================================================

  const handleToggleActive = (packaging: Packaging) => {
    const nextStatus = !packaging.isActive;

    Alert.alert(
      nextStatus ? "Activer l'emballage" : "Désactiver l'emballage",
      nextStatus
        ? `Voulez-vous activer « ${packaging.name} » ?`
        : `Voulez-vous désactiver « ${packaging.name} » ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: nextStatus ? "Activer" : "Désactiver",
          onPress: async () => {
            try {
              await setPackagingActive(packaging.id, nextStatus);
            } catch (error) {
              console.error("Erreur changement statut emballage :", error);

              Alert.alert(
                "Opération impossible",
                usePackagingStore.getState().error ??
                  "Impossible de modifier le statut.",
              );
            }
          },
        },
      ],
    );
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = (packaging: Packaging) => {
    Alert.alert(
      "Supprimer l'emballage",
      `Voulez-vous vraiment supprimer « ${packaging.name} » ?`,
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
              await deletePackaging(packaging.id);

              Alert.alert(
                "Emballage supprimé",
                "L'emballage a été supprimé avec succès.",
              );
            } catch (error) {
              console.error("Erreur suppression emballage :", error);

              Alert.alert(
                "Suppression impossible",
                usePackagingStore.getState().error ??
                  "Impossible de supprimer cet emballage.",
              );
            }
          },
        },
      ],
    );
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEditModal = (packaging: Packaging) => {
    clearError();
    setSelectedPackaging(packaging);
    setShowFormModal(true);
  };

  // ============================================================
  // OPEN STOCK
  // ============================================================

  const openStockModal = (packaging: Packaging) => {
    clearError();
    setSelectedPackaging(packaging);
    setShowStockModal(true);
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const closeFormModal = () => {
    if (isCreating || isUpdating) {
      return;
    }

    setShowFormModal(false);
    setSelectedPackaging(null);
    clearError();
  };

  // ============================================================
  // CLOSE STOCK
  // ============================================================

  const closeStockModal = () => {
    if (isAdjustingStock) {
      return;
    }

    setShowStockModal(false);
    setSelectedPackaging(null);
    clearError();
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    await refreshPackagings();
  };

  const hasSearch = search.trim().length > 0 || sizeFilter !== "ALL";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
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
          keyboardShouldPersistTaps="handled"
        >
          {/* ================================================== */}
          {/* HEADER                                             */}
          {/* ================================================== */}

          <View style={styles.pageHeader}>
            <View style={styles.titleArea}>
              <View style={styles.eyebrowRow}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={14}
                  color={COLORS.primary}
                />

                <Text style={styles.eyebrow}>STOCK</Text>
              </View>

              <Text style={styles.pageTitle}>Emballages</Text>

              <Text style={styles.pageSubtitle}>
                Gérez vos bouteilles et contenants disponibles.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="bottle-soda-outline"
                size={23}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* ================================================== */}
          {/* STATS                                              */}
          {/* ================================================== */}

          <PackagingHeader
            total={packagings.length}
            active={activeCount}
            lowStock={lowStockCount}
          />

          {/* ================================================== */}
          {/* SEARCH                                             */}
          {/* ================================================== */}

          <View style={styles.searchWrapper}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.Gray}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un emballage..."
              placeholderTextColor={COLORS.Gray}
              style={styles.searchInput}
              returnKeyType="search"
            />

            {search.length > 0 && (
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={COLORS.Gray}
                onPress={() => setSearch("")}
              />
            )}
          </View>

          {/* ================================================== */}
          {/* FILTERS                                            */}
          {/* ================================================== */}

          <View style={styles.filtersRow}>
            <Text style={styles.filterLabel}>Format</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            >
              <FilterChip
                label="Tous"
                active={sizeFilter === "ALL"}
                onPress={() => setSizeFilter("ALL")}
              />

              <FilterChip
                label="200 ml"
                active={sizeFilter === "ML_200"}
                onPress={() => setSizeFilter("ML_200")}
                icon="bottle-soda-outline"
              />

              <FilterChip
                label="500 ml"
                active={sizeFilter === "ML_500"}
                onPress={() => setSizeFilter("ML_500")}
                icon="bottle-soda-outline"
              />
            </ScrollView>
          </View>

          {/* ================================================== */}
          {/* LIST HEADER                                        */}
          {/* ================================================== */}

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                {hasSearch ? "Résultats" : "Vos emballages"}
              </Text>

              <Text style={styles.listSubtitle}>
                {filteredPackagings.length} emballage
                {filteredPackagings.length > 1 ? "s" : ""}
              </Text>
            </View>

            <Text style={styles.stockLegend}>Stock central</Text>
          </View>

          {/* ================================================== */}
          {/* ERROR                                              */}
          {/* ================================================== */}

          {error && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={19}
                color={COLORS.error}
              />

              <Text style={styles.errorText}>{error}</Text>

              <MaterialCommunityIcons
                name="close"
                size={18}
                color={COLORS.Gray}
                onPress={clearError}
              />
            </View>
          )}

          {/* ================================================== */}
          {/* LIST                                               */}
          {/* ================================================== */}

          {filteredPackagings.length > 0 ? (
            <View style={styles.listContainer}>
              {filteredPackagings.map((packaging) => (
                <PackagingCard
                  key={packaging.id}
                  packaging={packaging}
                  onEdit={() => openEditModal(packaging)}
                  onAdjustStock={() => openStockModal(packaging)}
                  onToggleActive={() => handleToggleActive(packaging)}
                  onDelete={() => handleDelete(packaging)}
                  isUpdating={isUpdating}
                  isAdjustingStock={isAdjustingStock}
                  isDeleting={isDeleting}
                />
              ))}
            </View>
          ) : !isLoading ? (
            <PackagingEmptyState
              hasSearch={hasSearch}
              onAdd={() => {
                clearError();
                setSelectedPackaging(null);
                setShowFormModal(true);
              }}
              onClearSearch={() => {
                setSearch("");
                setSizeFilter("ALL");
              }}
            />
          ) : null}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ==================================================== */}
        {/* FLOATING ADD BUTTON                                  */}
        {/* ==================================================== */}

        <View style={styles.floatingContainer}>
          <View style={styles.floatingShadow} />

          <Pressable
            style={({ pressed }) => [
              styles.floatingButton,
              pressed && styles.floatingPressed,
            ]}
            onPress={() => {
              clearError();
              setSelectedPackaging(null);
              setShowFormModal(true);
            }}
          >
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={COLORS.white}
            />

            <Text style={styles.floatingText}>Ajouter</Text>
          </Pressable>
        </View>

        {/* ==================================================== */}
        {/* FORM MODAL                                           */}
        {/* ==================================================== */}

        <PackagingFormModal
          visible={showFormModal}
          packaging={selectedPackaging}
          isSaving={isCreating || isUpdating}
          onClose={closeFormModal}
          onSubmit={selectedPackaging ? handleUpdate : handleCreate}
        />

        {/* ==================================================== */}
        {/* STOCK MODAL                                          */}
        {/* ==================================================== */}

        <PackagingStockModal
          visible={showStockModal}
          packaging={selectedPackaging}
          isSaving={isAdjustingStock}
          onClose={closeStockModal}
          onSubmit={handleAdjustStock}
        />
      </View>
    </SafeAreaView>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

function FilterChip({ label, active, onPress, icon }: FilterChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        pressed && styles.filterPressed,
      ]}
      onPress={onPress}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={15}
          color={active ? COLORS.primary : COLORS.Gray}
        />
      )}

      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

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

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  titleArea: {
    flex: 1,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 3,
  },

  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.3,
    color: COLORS.primary,
  },

  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxlarge,
    lineHeight: fontSizes.xxlarge * 1.15,
    color: COLORS.text,
  },

  pageSubtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  headerIcon: {
    width: 47,
    height: 47,
    marginLeft: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchWrapper: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: COLORS.white,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    minHeight: 45,
    paddingVertical: 8,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.text,
  },

  // ==========================================================
  // FILTERS
  // ==========================================================

  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  filterLabel: {
    marginRight: 8,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  filtersContent: {
    gap: 7,
    paddingRight: 5,
  },

  filterChip: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#E3E3E0",
    backgroundColor: COLORS.white,
  },

  filterChipActive: {
    borderColor: "#C8DAC3",
    backgroundColor: "#EAF2E7",
  },

  filterText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  filterTextActive: {
    fontFamily: fonts.semibold,
    color: COLORS.primary,
  },

  filterPressed: {
    opacity: 0.65,
  },

  // ==========================================================
  // LIST HEADER
  // ==========================================================

  listHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },

  listTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: COLORS.text,
  },

  listSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  stockLegend: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  listContainer: {
    marginTop: 1,
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBanner: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F6D4D4",
    backgroundColor: "#FDECEC",
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
  // FLOATING BUTTON
  // ==========================================================

  floatingContainer: {
    position: "absolute",
    right: 18,
    bottom: 60,
  },

  floatingShadow: {
    position: "absolute",
    top: 4,
    left: 3,
    right: 3,
    bottom: -3,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  floatingButton: {
    minHeight: 49,
    paddingHorizontal: 17,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  floatingText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  floatingPressed: {
    opacity: 0.84,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 100,
  },
});
