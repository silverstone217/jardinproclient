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

import ShopCurrency from "@/components/shop/ShopCurrency";
import ShopInformation from "@/components/shop/ShopInformation";
import ShopLogo from "@/components/shop/ShopLogo";

import { useShopStore } from "@/store/shop.store";
import { useUserStore } from "@/store/user.store";

import { COLORS, fonts } from "@/utils/styles";

export default function ShopScreen() {
  const user = useUserStore((state) => state.user);

  const {
    shop,
    draft,
    isLoading,
    isRefreshing,
    isSaving,
    isUploadingImage,
    error,

    fetchShop,
    refreshShop,
    updateDraft,
    saveShop,
    updateShopLogo,
    removeShopLogo,
    clearError,
    resetDraft,
  } = useShopStore();

  const isManager = user?.role === "MANAGER";

  /*
   * On initialise uniquement les données distantes.
   *
   * Le store possède déjà son cache local grâce à Zustand persist.
   * Le composant ne recopie donc aucune donnée dans un useState.
   */
  useEffect(() => {
    fetchShop().catch(() => {});
  }, [fetchShop]);

  useEffect(() => {
    if (!error) {
      return;
    }

    Alert.alert("Boutique", error);
    clearError();
  }, [error, clearError]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshShop();
    } catch {}
  }, [refreshShop]);

  const handleSave = async () => {
    if (!isManager || isSaving) {
      return;
    }

    try {
      await saveShop();

      Alert.alert(
        "Modifications enregistrées",
        "Les informations de la boutique ont été mises à jour.",
      );
    } catch {}
  };

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

  const handleLogoSelected = async (uri: string) => {
    if (!isManager) {
      return;
    }

    try {
      await updateShopLogo(uri);
    } catch {}
  };

  const handleRemoveLogo = async () => {
    if (!isManager) {
      return;
    }

    try {
      await removeShopLogo();
    } catch {}
  };

  if (isLoading && !shop) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loading}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons
              name="store-outline"
              size={30}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.loadingTitle}>Chargement de votre boutique</Text>

          <Text style={styles.loadingText}>
            Récupération des informations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shop || !draft) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="store-alert-outline"
            size={48}
            color={COLORS.primary}
          />

          <Text style={styles.emptyTitle}>Boutique introuvable</Text>

          <Text style={styles.emptyText}>
            Impossible de récupérer les informations de votre boutique.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <View>
            <Text style={styles.eyebrow}>PARAMÈTRES</Text>

            <Text style={styles.pageTitle}>Ma boutique</Text>

            <Text style={styles.pageSubtitle}>
              Gérez l'identité et les informations de votre boutique.
            </Text>
          </View>

          <View style={styles.storeIcon}>
            <MaterialCommunityIcons
              name="store-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* ================================================== */}
        {/* BANNER */}
        {/* ================================================== */}

        <ShopLogo
          logo={shop.logo}
          name={draft.name}
          editable={isManager}
          isUploading={isUploadingImage}
          onImageSelected={handleLogoSelected}
          onRemove={handleRemoveLogo}
        />

        {/* ================================================== */}
        {/* ACCESS INFO */}
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
                Les informations de la boutique sont gérées uniquement par le
                manager.
              </Text>
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* INFORMATIONS */}
        {/* ================================================== */}

        <ShopInformation
          name={draft.name}
          slogan={draft.slogan}
          telephone={draft.telephone}
          email={draft.email}
          address={draft.address}
          onNameChange={(value) => updateDraft("name", value)}
          onSloganChange={(value) => updateDraft("slogan", value)}
          onTelephoneChange={(value) =>
            updateDraft("telephone", value.replace(/\D/g, "").slice(0, 10))
          }
          onEmailChange={(value) => updateDraft("email", value)}
          onAddressChange={(value) => updateDraft("address", value)}
        />

        {/* ================================================== */}
        {/* DEVISE */}
        {/* ================================================== */}

        <ShopCurrency
          value={draft.currency}
          onChange={(value) => updateDraft("currency", value)}
        />

        {/* ================================================== */}
        {/* SAVE */}
        {/* ================================================== */}

        {isManager && (
          <View style={styles.saveSection}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                isSaving && styles.disabled,
                pressed && styles.pressed,
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <MaterialCommunityIcons
                name={isSaving ? "loading" : "content-save-outline"}
                size={20}
                color={COLORS.white}
              />

              <Text style={styles.saveText}>
                {isSaving
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={handleCancelChanges}
              disabled={isSaving}
            >
              <Text style={styles.cancelText}>
                Réinitialiser les modifications
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.footer}>
          <MaterialCommunityIcons
            name="cloud-sync-outline"
            size={17}
            color={COLORS.Gray}
          />

          <Text style={styles.footerText}>
            Vos informations sont synchronisées avec votre boutique.
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

  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
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

  storeIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E8",
  },

  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 16,
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

  saveSection: {
    marginTop: 20,
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: COLORS.primary,
  },

  saveText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: COLORS.white,
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },

  cancelText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.Gray,
  },

  disabled: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.7,
  },

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
    backgroundColor: "#EAF2E8",
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
