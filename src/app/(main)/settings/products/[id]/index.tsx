import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductImage } from "@/components/products/ProductImage";
import { ProductInformation } from "@/components/products/ProductInformation";
import { ProductRecipe } from "@/components/products/ProductRecipe";
import { ProductVariants } from "@/components/products/ProductVariants";

import { useProductStore } from "@/store/product.store";

import { ProductActions } from "@/components/products/ProductActions";
import { COLORS, fonts, fontSizes } from "@/utils/styles";

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
  }>();

  const productId = typeof params.id === "string" ? params.id : "";

  // const {
  //   getProductById,
  //   initialize,
  //   fetchProducts,
  //   refreshProducts,
  //   isLoading,
  //   isRefreshing,
  //   isInitialized,
  //   isOffline,
  //   error,
  //   clearError,
  // } = useProductStore();

  const product = useProductStore(
    useCallback(
      (state) =>
        productId
          ? state.products.find((item) => item.id === productId)
          : undefined,
      [productId],
    ),
  );

  const {
    initialize,
    fetchProducts,
    refreshProducts,
    isLoading,
    isRefreshing,
    isInitialized,
    isOffline,
    error,
    clearError,
  } = useProductStore();

  // ==========================================================
  // INITIALISATION
  // ==========================================================

  useEffect(() => {
    if (!isInitialized) {
      initialize().catch((error) => {
        console.error("Erreur initialisation produits :", error);
      });
    }
  }, [initialize, isInitialized]);

  // ==========================================================
  // CHARGEMENT À L'OUVERTURE
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      if (!productId) {
        return;
      }

      /*
       * Si le cache contient déjà le produit,
       * l'UI l'affiche immédiatement.
       *
       * Ensuite on synchronise silencieusement
       * avec le serveur.
       */
      const synchronize = async () => {
        try {
          if (!isInitialized) {
            await initialize();
          } else {
            await refreshProducts();
          }
        } catch (error) {
          console.error("Erreur synchronisation produit :", error);
        }
      };

      synchronize();
    }, [productId, initialize, refreshProducts, isInitialized]),
  );

  // ==========================================================
  // RETOUR
  // ==========================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(main)/settings/products");
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      await refreshProducts();
    } catch (error) {
      console.error("Erreur actualisation produit :", error);
    }
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = async () => {
    clearError();

    try {
      await fetchProducts();
    } catch (error) {
      console.error("Erreur nouvelle tentative :", error);
    }
  };

  // ==========================================================
  // PARAMÈTRE INVALIDE
  // ==========================================================

  if (!productId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={COLORS.error}
            />
          </View>

          <Text style={styles.stateTitle}>Produit introuvable</Text>

          <Text style={styles.stateDescription}>
            L'identifiant du produit est invalide.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back-outline"
              size={18}
              color={COLORS.white}
            />

            <Text style={styles.primaryButtonText}>Retour aux produits</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  if (isLoading && !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <Ionicons name="cube-outline" size={30} color={COLORS.primary} />
          </View>

          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingIndicator}
          />

          <Text style={styles.loadingTitle}>Chargement du produit</Text>

          <Text style={styles.loadingDescription}>
            Récupération des informations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // PRODUIT ABSENT
  // ==========================================================

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <View style={styles.stateIcon}>
            <Ionicons name="search-outline" size={30} color={COLORS.primary} />
          </View>

          <Text style={styles.stateTitle}>Produit introuvable</Text>

          <Text style={styles.stateDescription}>
            {error ?? "Ce produit n'existe plus ou n'est pas disponible."}
          </Text>

          <View style={styles.stateActions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
              onPress={handleRetry}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color={COLORS.primary}
              />

              <Text style={styles.secondaryButtonText}>Réessayer</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              onPress={handleBack}
            >
              <Ionicons
                name="arrow-back-outline"
                size={17}
                color={COLORS.white}
              />

              <Text style={styles.primaryButtonText}>Retour</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ÉCRAN
  // ==========================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
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
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <View style={styles.topBarContent}>
            <Text style={styles.topBarEyebrow}>CATALOGUE</Text>

            <Text style={styles.topBarTitle} numberOfLines={1}>
              Détails du produit
            </Text>
          </View>

          <View
            style={[
              styles.statusDot,
              product.isActive
                ? styles.statusDotActive
                : styles.statusDotInactive,
            ]}
          >
            <View
              style={[
                styles.statusDotInner,
                product.isActive
                  ? styles.statusDotInnerActive
                  : styles.statusDotInnerInactive,
              ]}
            />
          </View>
        </View>

        {/* ================================================== */}
        {/* CONTENU                                            */}
        {/* ================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
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
          {/* OFFLINE                                            */}
          {/* ================================================== */}

          {/*
           * Aucun bandeau offline volontairement.
           *
           * Le fonctionnement offline-first doit rester
           * transparent pour l'utilisateur.
           */}

          {/* ================================================== */}
          {/* HERO                                               */}
          {/* ================================================== */}

          <View style={styles.heroCard}>
            <View style={styles.heroAccent} />

            <ProductImage
              productId={product.id}
              image={product.image}
              productName={product.name}
            />

            <View style={styles.heroSummary}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {product.name}
                </Text>

                <View
                  style={[
                    styles.activeBadge,
                    product.isActive
                      ? styles.activeBadgeEnabled
                      : styles.activeBadgeDisabled,
                  ]}
                >
                  <View
                    style={[
                      styles.activeBadgeDot,
                      product.isActive
                        ? styles.activeBadgeDotEnabled
                        : styles.activeBadgeDotDisabled,
                    ]}
                  />

                  <Text
                    style={[
                      styles.activeBadgeText,
                      product.isActive
                        ? styles.activeBadgeTextEnabled
                        : styles.activeBadgeTextDisabled,
                    ]}
                  >
                    {product.isActive ? "Actif" : "Inactif"}
                  </Text>
                </View>
              </View>

              {product.description ? (
                <Text style={styles.heroDescription} numberOfLines={3}>
                  {product.description}
                </Text>
              ) : (
                <Text style={styles.heroEmptyDescription}>
                  Aucune description renseignée.
                </Text>
              )}
            </View>
          </View>

          {/* ================================================== */}
          {/* ERROR GLOBAL                                       */}
          {/* ================================================== */}

          {error && (
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
          )}

          {/* ================================================== */}
          {/* INFORMATIONS                                       */}
          {/* ================================================== */}

          <SectionHeader
            icon="information-circle-outline"
            title="Informations"
            subtitle="Nom et description du produit"
          />

          <ProductInformation product={product} />

          {/* ================================================== */}
          {/* VARIANTES                                          */}
          {/* ================================================== */}

          <SectionHeader
            icon="layers-outline"
            title="Variantes"
            subtitle="Formats, prix et conditionnement"
          />

          <ProductVariants product={product} />

          {/* ================================================== */}
          {/* RECETTE                                             */}
          {/* ================================================== */}

          <SectionHeader
            icon="flask-outline"
            title="Recette"
            subtitle="Matières premières et quantités"
          />

          <ProductRecipe product={product} />

          {/* ================================================== */}
          {/* ACTIONS                                             */}
          {/* ================================================== */}

          <SectionHeader
            icon="settings-outline"
            title="Gestion du produit"
            subtitle="Actions sensibles sur ce produit"
          />

          <ProductActions product={product} />

          {/* ================================================== */}
          {/* FOOTER                                              */}
          {/* ================================================== */}

          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.footerText}>
              Les modifications sont enregistrées directement sur votre compte.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>

      <View style={styles.sectionHeaderContent}>
        <Text style={styles.sectionTitle}>{title}</Text>

        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
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

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },

  // ==========================================================
  // TOP BAR
  // ==========================================================

  topBar: {
    minHeight: 68,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECE9",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F2",
  },

  topBarContent: {
    flex: 1,
    marginHorizontal: 12,
  },

  topBarEyebrow: {
    marginBottom: 2,
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.3,
    color: COLORS.primary,
  },

  topBarTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  statusDot: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  statusDotActive: {
    backgroundColor: "#EAF4E7",
  },

  statusDotInactive: {
    backgroundColor: "#F2F2F2",
  },

  statusDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  statusDotInnerActive: {
    backgroundColor: COLORS.success,
  },

  statusDotInnerInactive: {
    backgroundColor: COLORS.Gray,
  },

  // ==========================================================
  // HERO
  // ==========================================================

  heroCard: {
    position: "relative",
    overflow: "hidden",
    marginTop: 12,
    padding: 18,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  heroAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },

  heroSummary: {
    width: "100%",
    marginTop: 17,
  },

  heroTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  heroTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 27,
    color: COLORS.text,
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 9,
  },

  activeBadgeEnabled: {
    backgroundColor: "#EAF4E7",
  },

  activeBadgeDisabled: {
    backgroundColor: "#F1F1F1",
  },

  activeBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  activeBadgeDotEnabled: {
    backgroundColor: COLORS.success,
  },

  activeBadgeDotDisabled: {
    backgroundColor: COLORS.Gray,
  },

  activeBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
  },

  activeBadgeTextEnabled: {
    color: COLORS.primary,
  },

  activeBadgeTextDisabled: {
    color: COLORS.Gray,
  },

  heroDescription: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.Gray,
  },

  heroEmptyDescription: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    fontStyle: "italic",
    color: COLORS.Gray,
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 9,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    marginTop: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 15,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F5D4D4",
    gap: 8,
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
  // FOOTER
  // ==========================================================

  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: "#F0F5EE",
  },

  footerIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2EDDF",
  },

  footerText: {
    flex: 1,
    marginLeft: 9,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.darkGray,
  },

  bottomSpacer: {
    height: 100,
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
    width: 68,
    height: 68,
    borderRadius: 23,
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
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  loadingDescription: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // EMPTY / ERROR
  // ==========================================================

  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  stateTitle: {
    marginTop: 17,
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    color: COLORS.text,
    textAlign: "center",
  },

  stateDescription: {
    maxWidth: 310,
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: 18,
    color: COLORS.Gray,
    textAlign: "center",
  },

  stateActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 9,
  },

  primaryButton: {
    minHeight: 44,
    paddingHorizontal: 17,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  primaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  secondaryButton: {
    minHeight: 44,
    paddingHorizontal: 17,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#EAF2E7",
    borderWidth: 1,
    borderColor: "#DCE8D8",
  },

  secondaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.primary,
  },

  pressed: {
    opacity: 0.65,
  },
});
