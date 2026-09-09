import { ProfileAccountStatus } from "@/components/profile/ProfileAccountStatus";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInformation } from "@/components/profile/ProfileInformation";
import { useProfileStore } from "@/store/profile.store";
import { COLORS, fonts, fontSizes } from "@/utils/styles";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function ProfileScreen() {
  const {
    profile,
    isLoading,
    isRefreshing,
    isSaving,
    isUploadingImage,
    isOffline,
    error,

    fetchProfile,
    refreshProfile,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    clearError,
  } = useProfileStore();

  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  const hasLoadedRef = useRef(false);

  // ============================================================
  // SYNCHRONISER LE FORMULAIRE AVEC LE PROFIL
  // ============================================================

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name);
    setTelephone(profile.telephone);
    setEmail(profile.email ?? "");
  }, [profile]);

  // ============================================================
  // CHARGEMENT DU PROFIL
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          if (!hasLoadedRef.current) {
            await fetchProfile();
            hasLoadedRef.current = true;
          } else {
            await refreshProfile();
          }
        } catch (error) {
          console.error("Erreur chargement profil :", error);
        }
      };

      loadProfile();
    }, [fetchProfile, refreshProfile]),
  );

  // ============================================================
  // ÉTAT DU FORMULAIRE
  // ============================================================

  const hasChanges =
    profile !== null &&
    (name.trim() !== profile.name ||
      telephone.trim() !== profile.telephone ||
      email.trim() !== (profile.email ?? ""));

  const isBusy = isSaving || isUploadingImage;

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): boolean => {
    const cleanName = name.trim();
    const cleanTelephone = telephone.trim();
    const cleanEmail = email.trim();

    if (cleanName.length < 2) {
      Alert.alert(
        "Nom invalide",
        "Le nom doit contenir au moins 2 caractères.",
      );

      return false;
    }

    if (!/^0\d{9}$/.test(cleanTelephone)) {
      Alert.alert(
        "Téléphone invalide",
        "Le numéro doit commencer par 0 et contenir exactement 10 chiffres.",
      );

      return false;
    }

    if (
      cleanEmail.length > 0 &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      Alert.alert(
        "Email invalide",
        "Veuillez saisir une adresse email valide.",
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // ENREGISTRER LES MODIFICATIONS
  // ============================================================

  const handleSave = async () => {
    if (!profile || !hasChanges || isBusy) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (isOffline) {
      Alert.alert(
        "Connexion requise",
        "Vous êtes actuellement hors ligne. Connectez-vous à Internet pour enregistrer vos modifications.",
      );

      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
      });

      Alert.alert(
        "Profil mis à jour",
        "Vos informations ont été enregistrées avec succès.",
      );
    } catch (error) {
      console.error("Erreur modification profil :", error);
    }
  };

  // ============================================================
  // MODIFIER LA PHOTO
  // ============================================================

  const handleImageSelected = async (imageUri: string) => {
    if (isBusy || isOffline) {
      if (isOffline) {
        Alert.alert(
          "Connexion requise",
          "Une connexion Internet est nécessaire pour modifier votre photo de profil.",
        );
      }

      return;
    }

    try {
      await updateProfileImage(imageUri);

      Alert.alert(
        "Photo mise à jour",
        "Votre photo de profil a été modifiée avec succès.",
      );
    } catch (error) {
      console.error("Erreur modification photo :", error);
    }
  };

  // ============================================================
  // SUPPRIMER LA PHOTO
  // ============================================================

  const handleRemoveImage = async () => {
    if (isBusy || isOffline) {
      if (isOffline) {
        Alert.alert(
          "Connexion requise",
          "Une connexion Internet est nécessaire pour supprimer votre photo de profil.",
        );
      }

      return;
    }

    try {
      await removeProfileImage();

      Alert.alert("Photo supprimée", "Votre photo de profil a été supprimée.");
    } catch (error) {
      console.error("Erreur suppression photo :", error);
    }
  };

  // ============================================================
  // ACTUALISER
  // ============================================================

  const handleRefresh = async () => {
    try {
      await refreshProfile();
    } catch (error) {
      console.error("Erreur actualisation profil :", error);
    }
  };

  // ============================================================
  // ÉTAT DE CHARGEMENT
  // ============================================================

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}>
          <Ionicons name="person-outline" size={28} color={COLORS.primary} />
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.loadingIndicator}
        />

        <Text style={styles.loadingTitle}>Chargement du profil</Text>

        <Text style={styles.loadingDescription}>
          Récupération de vos informations...
        </Text>
      </View>
    );
  }

  // ============================================================
  // PROFIL INDISPONIBLE
  // ============================================================

  if (!profile) {
    return (
      <View style={styles.emptyScreen}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="cloud-offline-outline"
            size={34}
            color={COLORS.error}
          />
        </View>

        <Text style={styles.emptyTitle}>Profil indisponible</Text>

        <Text style={styles.emptyDescription}>
          {error ?? "Impossible de récupérer vos informations pour le moment."}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
          onPress={async () => {
            clearError();

            try {
              await fetchProfile();
            } catch (error) {
              console.error("Erreur nouvelle tentative :", error);
            }
          }}
        >
          <Ionicons name="refresh-outline" size={17} color={COLORS.white} />

          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  // ============================================================
  // ÉCRAN PRINCIPAL
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <View>
              <Text style={styles.eyebrow}>COMPTE</Text>

              <Text style={styles.pageTitle}>Mon profil</Text>

              <Text style={styles.pageSubtitle}>
                Gérez vos informations personnelles
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* ================================================== */}
          {/* MODE HORS LIGNE                                   */}
          {/* ================================================== */}

          {isOffline && (
            <View style={styles.offlineBanner}>
              <View style={styles.offlineIcon}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={17}
                  color={COLORS.warning}
                />
              </View>

              <View style={styles.offlineContent}>
                <Text style={styles.offlineTitle}>Mode hors ligne</Text>

                <Text style={styles.offlineText}>
                  Vos dernières informations sont disponibles sur cet appareil.
                </Text>
              </View>
            </View>
          )}

          {/* ================================================== */}
          {/* CARTE IDENTITÉ                                    */}
          {/* ================================================== */}

          <View style={styles.identityCard}>
            <View style={styles.identityAccent} />

            <ProfileAvatar
              image={profile.image}
              name={profile.name}
              isUploading={isUploadingImage}
              onImageSelected={handleImageSelected}
              onRemoveImage={handleRemoveImage}
            />

            <View style={styles.identityHeader}>
              <ProfileHeader profile={profile} />
            </View>
          </View>

          {/* ================================================== */}
          {/* ERREUR                                            */}
          {/* ================================================== */}

          {error && !isOffline && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={COLORS.error}
              />

              <Text style={styles.errorText}>{error}</Text>

              <Pressable onPress={clearError} hitSlop={8}>
                <Ionicons name="close" size={18} color={COLORS.Gray} />
              </Pressable>
            </View>
          )}

          {/* ================================================== */}
          {/* INFORMATIONS PERSONNELLES                         */}
          {/* ================================================== */}

          <ProfileInformation
            name={name}
            telephone={telephone}
            email={email}
            onNameChange={setName}
            onTelephoneChange={setTelephone}
            onEmailChange={setEmail}
            disabled={isBusy}
          />

          {/* ================================================== */}
          {/* STATUT DU COMPTE                                  */}
          {/* ================================================== */}

          <View style={styles.statusSection}>
            <ProfileAccountStatus profile={profile} />
          </View>

          {/* ================================================== */}
          {/* ENREGISTREMENT                                    */}
          {/* ================================================== */}

          <View style={styles.saveSection}>
            <View style={styles.saveHeader}>
              <View style={styles.saveHeaderIcon}>
                <Ionicons
                  name={
                    hasChanges
                      ? "alert-circle-outline"
                      : "checkmark-circle-outline"
                  }
                  size={17}
                  color={hasChanges ? COLORS.secondary : COLORS.success}
                />
              </View>

              <View style={styles.saveHeaderContent}>
                <Text style={styles.saveTitle}>
                  {hasChanges ? "Modifications en attente" : "Profil à jour"}
                </Text>

                <Text style={styles.saveHintText}>
                  {hasChanges
                    ? "Enregistrez vos changements pour les synchroniser avec votre compte."
                    : "Toutes vos informations sont enregistrées."}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                (!hasChanges || isBusy || isOffline) &&
                  styles.saveButtonDisabled,
                pressed &&
                  hasChanges &&
                  !isBusy &&
                  !isOffline &&
                  styles.saveButtonPressed,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || isBusy || isOffline}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={!hasChanges || isOffline ? COLORS.Gray : COLORS.white}
                />
              )}

              <Text
                style={[
                  styles.saveButtonText,
                  (!hasChanges || isOffline) && styles.saveButtonTextDisabled,
                ]}
              >
                {isSaving
                  ? "Enregistrement..."
                  : isOffline
                    ? "Connexion requise"
                    : "Enregistrer les modifications"}
              </Text>
            </Pressable>
          </View>

          {/* ================================================== */}
          {/* ESPACE BAS                                        */}
          {/* ================================================== */}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
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
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: COLORS.Gray,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DFEBDD",
  },

  // ==========================================================
  // OFFLINE
  // ==========================================================

  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F3E3B7",
  },

  offlineIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0C9",
  },

  offlineContent: {
    flex: 1,
    marginLeft: 10,
  },

  offlineTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: "#725B16",
  },

  offlineText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: "#927A2C",
  },

  // ==========================================================
  // IDENTITY CARD
  // ==========================================================

  identityCard: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  identityAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },

  identityHeader: {
    width: "100%",
    marginTop: 15,
    alignItems: "center",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBanner: {
    marginTop: 16,
    minHeight: 50,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F6D4D4",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.error,
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  statusSection: {
    marginTop: 18,
  },

  // ==========================================================
  // SAVE
  // ==========================================================

  saveSection: {
    marginTop: 18,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  saveHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  saveHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6F2",
  },

  saveHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  saveTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  saveHintText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
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

  saveButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  saveButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  saveButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.white,
  },

  saveButtonTextDisabled: {
    color: COLORS.Gray,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 120,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  // EMPTY
  // ==========================================================

  emptyScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  emptyTitle: {
    marginTop: 18,
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: 18,
    color: COLORS.Gray,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  retryText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.6,
  },
});
