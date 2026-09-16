import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductionDetails } from "@/components/production/ProductionDetails";
import ProductionForm from "@/components/production/ProductionForm";
import { ProductionHistory } from "@/components/production/ProductionHistory";

import { useProductionStore } from "@/store/production.store";

import type { CreateProductionPayload, Production } from "@/types/production";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

export default function ProductionsScreen() {
  const {
    productions,
    isLoading,
    isRefreshing,
    isCreating,
    error,
    initialize,
    refreshProductions,
    createProduction,
    clearError,
  } = useProductionStore();

  const [isFormVisible, setIsFormVisible] = useState(false);

  const [selectedProduction, setSelectedProduction] =
    useState<Production | null>(null);

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    initialize().catch((error) => {
      console.error("Erreur initialisation productions :", error);
    });
  }, [initialize]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = useCallback(async () => {
    try {
      await refreshProductions();
    } catch (error) {
      console.error("Erreur actualisation productions :", error);
    }
  }, [refreshProductions]);

  // ============================================================
  // NOUVELLE PRODUCTION
  // ============================================================

  const handleOpenForm = () => {
    clearError();
    setSelectedProduction(null);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    if (isCreating) {
      return;
    }

    setIsFormVisible(false);
  };

  // ============================================================
  // CREATION
  // ============================================================

  const handleCreateProduction = async (payload: CreateProductionPayload) => {
    try {
      const production = await createProduction(payload);

      setIsFormVisible(false);

      setSelectedProduction(production);

      Alert.alert(
        "Production enregistrée",
        "La production a été enregistrée et le stock de la boutique principale a été mis à jour.",
      );
    } catch (error) {
      console.error("Erreur création production :", error);

      throw error;
    }
  };

  // ============================================================
  // DETAIL
  // ============================================================

  const handleProductionPress = (production: Production) => {
    clearError();
    setIsFormVisible(false);
    setSelectedProduction(production);
  };

  const handleCloseDetails = () => {
    setSelectedProduction(null);
  };

  // ============================================================
  // LOADING INITIAL
  // ============================================================

  if (isLoading && productions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <Ionicons name="flask-outline" size={28} color={COLORS.primary} />
          </View>

          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingIndicator}
          />

          <Text style={styles.loadingTitle}>Chargement des productions</Text>

          <Text style={styles.loadingDescription}>
            Récupération de l'historique...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // DETAIL
  // ============================================================

  if (selectedProduction) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.detailHeader}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={handleCloseDetails}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </Pressable>

          <View style={styles.detailHeaderContent}>
            <Text style={styles.detailHeaderTitle}>
              Détail de la production
            </Text>

            <Text style={styles.detailHeaderSubtitle}>
              Production enregistrée
            </Text>
          </View>
        </View>

        <ProductionDetails
          production={selectedProduction}
          onClose={handleCloseDetails}
        />
      </SafeAreaView>
    );
  }

  // ============================================================
  // SCREEN
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea}>
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
        >
          {/* ================================================== */}
          {/* HEADER                                             */}
          {/* ================================================== */}

          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderContent}>
              <Text style={styles.eyebrow}>STOCK & PRODUCTION</Text>

              <Text style={styles.pageTitle}>Production</Text>

              <Text style={styles.pageSubtitle}>
                Préparez vos jus et enregistrez les produits finis.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons name="flask-outline" size={21} color={COLORS.primary} />
            </View>
          </View>

          {/* ================================================== */}
          {/* ERROR                                             */}
          {/* ================================================== */}

          {error ? (
            <View style={styles.errorBanner}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={COLORS.error}
                />
              </View>

              <Text style={styles.errorText}>{error}</Text>

              <Pressable onPress={clearError} hitSlop={8}>
                <Ionicons name="close" size={18} color={COLORS.Gray} />
              </Pressable>
            </View>
          ) : null}

          {/* ================================================== */}
          {/* ACTION                                             */}
          {/* ================================================== */}

          <View style={styles.actionCard}>
            <View style={styles.actionCardContent}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.actionTextContent}>
                <Text style={styles.actionTitle}>Nouvelle production</Text>

                <Text style={styles.actionDescription}>
                  Enregistrez une nouvelle production de jus à la boutique
                  principale.
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.newProductionButton,
                pressed && styles.newProductionButtonPressed,
              ]}
              onPress={handleOpenForm}
            >
              <Ionicons name="add" size={19} color={COLORS.white} />

              <Text style={styles.newProductionText}>Produire</Text>
            </Pressable>
          </View>

          {/* ================================================== */}
          {/* QUICK STATS                                        */}
          {/* ================================================== */}

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.statIconGreen]}>
                <Ionicons
                  name="flask-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </View>

              <View>
                <Text style={styles.statLabel}>Productions</Text>

                <Text style={styles.statValue}>{productions.length}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.statIconOrange]}>
                <Ionicons
                  name="wine-outline"
                  size={17}
                  color={COLORS.secondary}
                />
              </View>

              <View>
                <Text style={styles.statLabel}>Dernière production</Text>

                <Text style={styles.statValueSmall} numberOfLines={1}>
                  {productions[0]
                    ? new Intl.DateTimeFormat("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      }).format(new Date(productions[0].producedAt))
                    : "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* ================================================== */}
          {/* HISTORY                                            */}
          {/* ================================================== */}

          <ProductionHistory onProductionPress={handleProductionPress} />

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ================================================== */}
        {/* FORM                                               */}
        {/* ================================================== */}

        <ProductionForm
          visible={isFormVisible}
          isSubmitting={isCreating}
          onClose={handleCloseForm}
          onSubmit={handleCreateProduction}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  pageHeaderContent: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 3,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: COLORS.primary,
  },

  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxlarge,
    lineHeight: fontSizes.xxlarge * 1.15,
    color: COLORS.text,
  },

  pageSubtitle: {
    maxWidth: 290,
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.Gray,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBanner: {
    minHeight: 50,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 15,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6D4D4",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBE0E0",
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.error,
  },

  // ==========================================================
  // ACTION
  // ==========================================================

  actionCard: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  actionCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  actionTextContent: {
    flex: 1,
    marginLeft: 10,
  },

  actionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  actionDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  newProductionButton: {
    minHeight: 46,
    marginTop: 13,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  newProductionButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  newProductionText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  // ==========================================================
  // STATS
  // ==========================================================

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  statCard: {
    flex: 1,
    minHeight: 67,
    padding: 11,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  statIconGreen: {
    backgroundColor: "#EDF4EB",
  },

  statIconOrange: {
    backgroundColor: "#FFF1DE",
  },

  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  statValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  statValueSmall: {
    maxWidth: 75,
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.text,
  },

  // ==========================================================
  // DETAIL HEADER
  // ==========================================================

  detailHeader: {
    minHeight: 64,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E5",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F3EF",
  },

  detailHeaderContent: {
    flex: 1,
    marginLeft: 11,
  },

  detailHeaderTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  detailHeaderSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 90,
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
    marginTop: 20,
  },

  loadingTitle: {
    marginTop: 12,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: COLORS.text,
  },

  loadingDescription: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.6,
  },
});
