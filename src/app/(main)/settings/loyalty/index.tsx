import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ShopLoyalty from "@/components/shop/ShopLoyalty";
import { useShopStore } from "@/store/shop.store";
import { useUserStore } from "@/store/user.store";
import { COLORS, fonts } from "@/utils/styles";

export default function LoyaltyScreen() {
  // ============================================================
  // AUTH
  // ============================================================

  const user = useUserStore((state) => state.user);

  const isManager = user?.role === "MANAGER";

  // ============================================================
  // SHOP STORE
  // ============================================================

  const {
    shop,
    draft,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    fetchShop,
    refreshShop,
    updateDraft,
    saveShop,
    clearError,
    resetDraft,
  } = useShopStore();

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    fetchShop().catch(() => {});
  }, [fetchShop]);

  // ============================================================
  // ERREUR
  // ============================================================

  useEffect(() => {
    if (!error) {
      return;
    }

    Alert.alert("Fidélité", error);
    clearError();
  }, [error, clearError]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = useCallback(async () => {
    try {
      await refreshShop();
    } catch {}
  }, [refreshShop]);

  // ============================================================
  // ENREGISTREMENT
  // ============================================================

  const handleSave = async () => {
    if (!isManager || isSaving) {
      return;
    }

    try {
      await saveShop();

      Alert.alert(
        "Modifications enregistrées",
        "Les paramètres du programme de fidélité ont été mis à jour.",
      );
    } catch {}
  };

  // ============================================================
  // ANNULATION
  // ============================================================

  const handleCancelChanges = () => {
    Alert.alert(
      "Annuler les modifications",
      "Les modifications non enregistrées seront perdues.",
      [
        {
          text: "Continuer",
          style: "cancel",
        },
        {
          text: "Annuler les modifications",
          style: "destructive",
          onPress: resetDraft,
        },
      ],
    );
  };

  // ============================================================
  // MODIFICATIONS
  // ============================================================

  const hasChanges =
    shop !== null &&
    draft !== null &&
    (Number(draft.loyaltyPurchaseAmount) !==
      Number(shop.loyaltyPurchaseAmount) ||
      Number(draft.loyaltyPointsEarned) !== Number(shop.loyaltyPointsEarned) ||
      Number(draft.loyaltyPointsForDiscount) !==
        Number(shop.loyaltyPointsForDiscount) ||
      Number(draft.loyaltyDiscountAmount) !==
        Number(shop.loyaltyDiscountAmount));

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading && !shop) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loading}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons
              name="star-circle-outline"
              size={30}
              color={COLORS.secondary}
            />
          </View>

          <Text style={styles.loadingTitle}>Chargement de la fidélité</Text>

          <Text style={styles.loadingText}>Récupération des paramètres...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // BOUTIQUE INDISPONIBLE
  // ============================================================

  if (!shop || !draft) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="star-off-outline"
            size={48}
            color={COLORS.secondary}
          />

          <Text style={styles.emptyTitle}>Paramètres indisponibles</Text>

          <Text style={styles.emptyText}>
            Impossible de récupérer les paramètres du programme de fidélité.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ÉCRAN
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.eyebrow}>PARAMÈTRES</Text>

            <Text style={styles.pageTitle}>Fidélité</Text>

            <Text style={styles.pageSubtitle}>
              Configurez les règles de fidélité de votre boutique.
            </Text>
          </View>

          <View style={styles.pageIcon}>
            <MaterialCommunityIcons
              name="star-circle-outline"
              size={24}
              color={COLORS.secondary}
            />
          </View>
        </View>

        {/* ================================================== */}
        {/* PERMISSION */}
        {/* ================================================== */}

        {!isManager && (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={18}
                color={COLORS.info}
              />
            </View>

            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>
                Consultation uniquement
              </Text>

              <Text style={styles.permissionText}>
                Les paramètres de fidélité sont gérés uniquement par le manager.
              </Text>
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* FIDÉLITÉ */}
        {/* ================================================== */}

        <ShopLoyalty
          purchaseAmount={draft.loyaltyPurchaseAmount}
          pointsEarned={draft.loyaltyPointsEarned}
          pointsForDiscount={draft.loyaltyPointsForDiscount}
          discountAmount={draft.loyaltyDiscountAmount}
          editable={isManager}
          onPurchaseAmountChange={(value) =>
            updateDraft("loyaltyPurchaseAmount", value)
          }
          onPointsEarnedChange={(value) =>
            updateDraft("loyaltyPointsEarned", value)
          }
          onPointsForDiscountChange={(value) =>
            updateDraft("loyaltyPointsForDiscount", value)
          }
          onDiscountAmountChange={(value) =>
            updateDraft("loyaltyDiscountAmount", value)
          }
        />

        {/* ================================================== */}
        {/* SAVE */}
        {/* ================================================== */}

        {isManager && (
          <View style={styles.saveSection}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                (!hasChanges || isSaving) && styles.disabled,
                pressed && hasChanges && !isSaving && styles.pressed,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <MaterialCommunityIcons
                name={isSaving ? "loading" : "content-save-outline"}
                size={20}
                color={!hasChanges || isSaving ? COLORS.Gray : COLORS.white}
              />

              <Text
                style={[
                  styles.saveText,
                  (!hasChanges || isSaving) && styles.saveTextDisabled,
                ]}
              >
                {isSaving
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                !hasChanges && styles.cancelButtonDisabled,
                pressed && hasChanges && !isSaving && styles.pressed,
              ]}
              onPress={handleCancelChanges}
              disabled={isSaving || !hasChanges}
            >
              <Text
                style={[
                  styles.cancelText,
                  !hasChanges && styles.cancelTextDisabled,
                ]}
              >
                Réinitialiser les modifications
              </Text>
            </Pressable>
          </View>
        )}

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <View style={styles.footer}>
          <MaterialCommunityIcons
            name="cloud-sync-outline"
            size={17}
            color={COLORS.Gray}
          />

          <Text style={styles.footerText}>
            Les paramètres sont synchronisés avec votre boutique.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  pageHeaderContent: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.primary,
  },

  pageTitle: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: 29,
    lineHeight: 35,
    color: COLORS.text,
  },

  pageSubtitle: {
    maxWidth: 285,
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.Gray,
  },

  pageIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1DE",
  },

  // ==========================================================
  // PERMISSION
  // ==========================================================

  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 16,
    borderRadius: 17,
    backgroundColor: "#EEF6FC",
  },

  permissionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  permissionContent: {
    flex: 1,
    marginLeft: 10,
  },

  permissionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  permissionText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // SAVE
  // ==========================================================

  saveSection: {
    marginTop: 20,
  },

  saveButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },

  disabled: {
    backgroundColor: COLORS.lightGray,
  },

  pressed: {
    opacity: 0.7,
  },

  saveText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.white,
  },

  saveTextDisabled: {
    color: COLORS.Gray,
  },

  cancelButton: {
    minHeight: 44,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonDisabled: {
    opacity: 0.5,
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.primary,
  },

  cancelTextDisabled: {
    color: COLORS.Gray,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 15,
  },

  footerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1DE",
  },

  loadingTitle: {
    marginTop: 17,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: COLORS.text,
  },

  loadingText: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: COLORS.Gray,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    marginTop: 16,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.Gray,
  },

  bottomSpace: {
    height: 150,
  },
});
